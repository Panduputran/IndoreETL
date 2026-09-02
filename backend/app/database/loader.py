import io
import csv
import re
import math
import pandas as pd
import numpy as np
from sqlalchemy import text, inspect
from app.database.connection import engine
from app.services.inspector_service import sanitize_column_name


def make_unique_column_names(cols) -> list:
    """
    Memastikan seluruh nama kolom 100% unik dan tidak ada duplikasi
    yang dapat memicu error 'A column with name X is already present'.
    """
    seen = {}
    unique_cols = []
    for col in cols:
        clean_col = re.sub(r"[^a-zA-Z0-9_]", "_", str(col).strip().lower())
        clean_col = re.sub(r"_+", "_", clean_col).strip("_")
        if not clean_col:
            clean_col = "unnamed"
        if clean_col in seen:
            seen[clean_col] += 1
            unique_cols.append(f"{clean_col}_{seen[clean_col]}")
        else:
            seen[clean_col] = 1
            unique_cols.append(clean_col)
    return unique_cols


def force_clean_numeric(v):
    """
    Memaksa nilai apa pun yang bukan angka (seperti 'NEW', 'RENEWAL', 'Q3 2024', '-')
    menjadi angka float murni 0.0
    """
    if pd.isna(v) or v is None:
        return 0.0
    if isinstance(v, (int, float, np.integer, np.floating)):
        if math.isnan(v) or math.isinf(v):
            return 0.0
        return float(v)

    s = str(v).strip()
    if s.lower() in [
        "",
        "nan",
        "none",
        "null",
        "<na>",
        "-",
        "nil",
        "new",
        "renewal",
        "endorsement",
    ]:
        return 0.0

    # Hapus koma dan spasi
    s = s.replace(",", "").replace(" ", "")
    if s.startswith("(") and s.endswith(")"):
        s = f"-{s[1:-1]}"

    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0


def get_precise_sql_type(col_name: str, sample_series: pd.Series = None) -> str:
    """
    Menentukan tipe data DDL PostgreSQL secara akurat, termasuk TIMESTAMP/DATE.
    """
    col_lower = str(col_name).lower().strip()

    # 1. Nomor urut / ID murni -> BIGINT
    if col_lower in {"no", "id", "seq", "id_seq", "no_urut", "number"}:
        return "BIGINT"

    # 2. Kolom Tanggal / Timestamp Khusus
    date_keywords = ["date", "tgl", "time", "dt", "start", "end", "period_of_insurance"]
    is_date_col = any(dk in col_lower for dk in date_keywords) and not col_lower in {"period", "cedant_name"}

    if is_date_col:
        # Jika nama kolomnya mengandung kata kunci tanggal/timestamp, jadikan TIMESTAMP
        return "TIMESTAMP"

    # 3. Kata kunci penanda kolom angka / numerik / keuangan
    numeric_keywords = [
        "tsi", "premi", "premium", "claim", "amount", "share", 
        "comm", "komisi", "netto", "gross", "incurred", "loss", 
        "exposure", "rate", "spl", "qs", "surplus", "biaya", 
        "paid", "fee", "tax", "pajak", "total", "pct", "percent"
    ]

    # Kata kunci yang PASTI teks (pengecualian)
    text_keywords = [
        "type", "name", "desc", "note", "event", "cause", "code", 
        "info", "class", "status", "no_polis", "policy_no", "claim_no", 
        "no_klaim", "reinsured", "cedant", "ref", "reff", "period"
    ]

    # Check 1: Deteksi Berdasarkan Kata Kunci Numerik
    is_numeric_name = any(nk in col_lower for nk in numeric_keywords) and not any(tk in col_lower for tk in text_keywords)
    if is_numeric_name:
        return "NUMERIC(20, 2)"

    # Check 2: Auto-Detect dari Sampel Isi Data
    if sample_series is not None and not sample_series.dropna().empty:
        non_null_samples = sample_series.dropna().astype(str).str.strip()
        valid_samples = non_null_samples[~non_null_samples.str.lower().isin(["", "nan", "none", "null", "<na>", "-", "nil"])]
        
        if len(valid_samples) > 0:
            converted = pd.to_numeric(
                valid_samples.str.replace(",", "", regex=False).str.replace(" ", "", regex=False), 
                errors='coerce'
            )
            if (converted.notna().sum() / len(valid_samples)) > 0.8:
                return "NUMERIC(20, 2)"

    # Default fallback untuk teks / deskripsi
    return "TEXT"


def _psql_insert_copy(table, conn, keys, data_iter):
    r"""
    Handler Pandas to_sql berbasis PostgreSQL COPY Protocol (CSV Mode).
    Aman dari limit parameter 65.535, teks multiline (\n, \r), 
    delimiter terpotong, serta nilai liar pada numerik.
    """
    dbapi_conn = conn.connection

    # Deteksi indeks kolom numerik
    money_keywords = [
        "amount", "claim", "premi", "premium", "tsi", "sum_insured",
        "share", "comm", "netto", "incurred", "loss", "exposure", 
        "net", "roe", "rate", "spl", "qs", "surplus", "biaya", "paid",
        "fee", "tax", "pajak", "total", "pct", "percent"
    ]

    text_or_date_keywords = [
        "type", "name", "desc", "note", "event", "cause", "code", 
        "info", "class_of_business", "date", "tgl", "time", "dt", "period"
    ]

    numeric_indices = set()
    for idx, col in enumerate(keys):
        c_lower = str(col).lower().strip()
        if any(mk in c_lower for mk in money_keywords) and not any(
            tx in c_lower for tx in text_or_date_keywords
        ):
            numeric_indices.add(idx)

    s_buf = io.StringIO()
    csv_writer = csv.writer(
        s_buf, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL
    )

    for row in data_iter:
        clean_row = []
        for idx, val in enumerate(row):
            # 1. Null / Kosong
            if val is None or pd.isna(val):
                clean_row.append("")
                continue

            val_str = str(val).strip()
            if val_str.lower() in ["nat", "nan", "none", "null", "<na>", "", "nil"]:
                clean_row.append("")
                continue

            # 2. Proteksi Kolom Numerik Murni
            if idx in numeric_indices:
                s = val_str.replace(",", "").replace(" ", "")
                if s.startswith("(") and s.endswith(")"):
                    s = f"-{s[1:-1]}"
                try:
                    num = float(s)
                    if math.isnan(num) or math.isinf(num):
                        clean_row.append("0.00")
                    else:
                        clean_row.append(f"{num:.2f}")
                except (ValueError, TypeError):
                    clean_row.append("0.00")
                continue

            # 3. Kolom Teks / Tanggal: Bersihkan karakter null byte (\x00)
            clean_val = val_str.replace("\x00", "")
            if re.match(r"^-?\d+\.0$", clean_val):
                clean_val = clean_val[:-2]

            clean_row.append(clean_val)

        csv_writer.writerow(clean_row)

    s_buf.seek(0)
    columns = ", ".join([f'"{k}"' for k in keys])
    table_name = (
        f'"{table.schema}"."{table.name}"' if table.schema else f'"{table.name}"'
    )

    with dbapi_conn.cursor() as cur:
        sql = f"COPY {table_name} ({columns}) FROM STDIN WITH (FORMAT CSV, NULL '', QUOTE '\"', ESCAPE '\"')"
        cur.copy_expert(sql=sql, file=s_buf)


def ensure_table_schema_exists(df: pd.DataFrame, table_name: str):
    """
    Membuat tabel secara otomatis di schema 'public' jika belum ada.
    """
    insp = inspect(engine)
    clean_table = table_name.strip().lower()

    if not insp.has_table(clean_table, schema="public"):
        column_definitions = []
        for col in df.columns:
            safe_col = sanitize_column_name(col)

            if safe_col.lower() == "id":
                continue

            sample_series = df[col]
            sql_type = get_precise_sql_type(safe_col, sample_series)
            column_definitions.append(f'"{safe_col}" {sql_type}')

        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS public."{clean_table}" (
            id SERIAL PRIMARY KEY,
            {", ".join(column_definitions)},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        with engine.begin() as conn:
            conn.execute(text(create_table_query))


def insert_data_to_db(df: pd.DataFrame, table_name: str) -> int:
    """
    Fungsi utama untuk memasukkan DataFrame ke PostgreSQL menggunakan COPY Protocol.
    Menjamin HANYA ADA 1 KOLOM 'note' TUNGGAL di tabel database.
    """
    if df is None or df.empty:
        return 0

    df_db = df.copy()
    df_db.columns = [sanitize_column_name(c) for c in df_db.columns]

    if "id" in df_db.columns:
        df_db = df_db.drop(columns=["id"])
    note_cols = [c for c in df_db.columns if re.match(r"^note(_\d+)?$", c)]
    
    header_junk_keywords = [
        "no.", "claim", "policy", "insured", "cob", "risk", "cat", 
        "uw year", "period", "start", "end", "occupation", "tsi", "premi", 
        "amount", "share", "comm", "reinsured", "cedant"
    ]

    combined_notes = []
    
    if note_cols:
        for idx, row in df_db.iterrows():
            row_notes = []
            for nc in note_cols:
                val = str(row[nc]).strip() if pd.notna(row[nc]) and row[nc] is not None else ""
                val_lower = val.lower()

                # Simpan jika ada teks nyata dan bukan kata sisa header
                if val and val_lower not in ["nan", "none", "null", "<na>", "-", "nil"]:
                    is_junk_header = any(jk == val_lower or val_lower.startswith(f"{jk} ") for jk in header_junk_keywords)
                    if not is_junk_header:
                        row_notes.append(val)
            
            combined_notes.append(", ".join(row_notes) if row_notes else None)
        
        # Buang semua kolom note / note_2 / note_3 / note_4 dst dari DataFrame
        df_db.drop(columns=note_cols, inplace=True)

    # Tetapkan HANYA 1 kolom 'note' tunggal
    df_db["note"] = combined_notes if note_cols else None
    tail_cols = [c for c in ["note", "period", "cedant_name"] if c in df_db.columns]
    main_cols = [c for c in df_db.columns if c not in tail_cols]
    df_db = df_db[main_cols + tail_cols]

    # Clean nilai numerik jika tipe kolomnya NUMERIC
    for col in df_db.columns:
        sql_type = get_precise_sql_type(col, df_db[col])
        if "NUMERIC" in sql_type:
            df_db[col] = df_db[col].apply(force_clean_numeric)

    table_clean = table_name.strip().lower()
    ensure_table_schema_exists(df_db, table_clean)

    with engine.begin() as conn:
        df_db.to_sql(
            name=table_clean,
            con=conn,
            schema="public",
            if_exists="append",
            index=False,
            method=_psql_insert_copy,
        )

    return len(df_db)


def load_dataframe_to_postgres(
    df: pd.DataFrame, table_name: str, if_exists: str = "append"
) -> int:
    """
    Mengalihkan logika ke insert_data_to_db (COPY protocol) 
    agar TIDAK memicu limit 65535 bind parameter SQL.
    """
    if df is None or df.empty:
        return 0

    return insert_data_to_db(df, table_name)


def smart_load_to_db(
    df_clean: pd.DataFrame, table_name: str, periode_lengkap: str
) -> dict:
    insp = inspect(engine)
    table_name_lower = table_name.lower().strip()
    df_clean.columns = [c.lower() for c in df_clean.columns]

    col_where = "reff_of_no_bordereaux" if "askrida" in table_name_lower else "period"
    count_lama = 0

    if insp.has_table(table_name_lower, schema="public"):
        query_cek = text(
            f'SELECT COUNT(*) FROM public."{table_name_lower}" WHERE {col_where} = :periode'
        )

        try:
            with engine.connect() as conn:
                count_lama = (
                    conn.execute(query_cek, {"periode": periode_lengkap}).scalar() or 0
                )

            if count_lama > 0:
                with engine.begin() as connection:
                    query_hapus = text(
                        f'DELETE FROM public."{table_name_lower}" WHERE {col_where} = :periode'
                    )
                    connection.execute(query_hapus, {"periode": periode_lengkap})
        except Exception as e:
            print(f"[!] Warning saat pengecekan DB: {e}")

    inserted_rows = insert_data_to_db(df_clean, table_name_lower)

    return {
        "status": "success",
        "table_name": table_name_lower,
        "periode": periode_lengkap,
        "deleted_old_rows": count_lama,
        "inserted_rows": inserted_rows,
    }