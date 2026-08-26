import io
import csv
import re
import math
import pandas as pd
import numpy as np
from sqlalchemy import text, inspect
from app.database.connection import engine
from app.services.inspector_service import sanitize_column_name


def get_precise_sql_type(col_name: str, sample_series: pd.Series = None) -> str:
    """
    Menentukan tipe data DDL PostgreSQL.
    Semua kolom yang rawan geser baris dijadikan TEXT agar PostgreSQL 
    100% TIDAK PERNAH MENOLAK DATA.
    """
    col_lower = str(col_name).lower().strip()

    # 1. Nomor urut murni -> BIGINT
    if col_lower in {'no', 'id', 'seq', 'id_seq', 'no_urut'}:
        return "BIGINT"

    # 2. Kolom Uang Murni (HANYA TSI & PREMI UTAMA)
    # Kolom share (termasuk premium_reinsurer_share_spl) kita buat TEXT agar aman dari data geser!
    core_money_cols = {'tsi_100', 'premium_100', 'claim_100', 'sum_insured', 'claim_amount_100'}
    if col_lower in core_money_cols:
        return "NUMERIC(20, 2)"

    # 3. SEMUA KOLOM LAINNYA (Termasuk semua kolom share, status, tanggal, teks) -> TEXT
    return "TEXT"


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
    if s.lower() in ['', 'nan', 'none', 'null', '<na>', '-', 'nil', 'new', 'renewal', 'endorsement']:
        return 0.0

    # Hapus koma dan spasi
    s = s.replace(',', '').replace(' ', '')
    if s.startswith('(') and s.endswith(')'):
        s = f"-{s[1:-1]}"

    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0


def _psql_insert_copy(table, conn, keys, data_iter):
    r"""
    Handler Pandas to_sql berbasis PostgreSQL COPY Protocol (CSV Mode).
    Aman dari teks multiline (\n, \r), delimiter terpotong, serta nilai liar pada numerik.
    """
    dbapi_conn = conn.connection
    
    # Deteksi indeks kolom numerik
    money_keywords = [
        'amount', 'claim', 'premi', 'premium', 'tsi', 'sum_insured',
        'share', 'comm', 'netto', 'incurred', 'loss', 'exposure', 'net', 
        'roe', 'rate', 'spl', 'qs', 'surplus', 'biaya', 'paid'
    ]
    
    numeric_indices = set()
    for idx, col in enumerate(keys):
        c_lower = str(col).lower().strip()
        if any(mk in c_lower for mk in money_keywords) and not any(tx in c_lower for tx in ['type', 'name', 'desc', 'note', 'event', 'cause', 'code']):
            numeric_indices.add(idx)

    s_buf = io.StringIO()
    # Gunakan csv.writer standar agar seluruh enter (\n, \r) dan kutip ter-escape sempurna
    csv_writer = csv.writer(s_buf, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

    for row in data_iter:
        clean_row = []
        for idx, val in enumerate(row):
            # 1. Null / Kosong
            if val is None or pd.isna(val):
                clean_row.append('')
                continue

            val_str = str(val).strip()
            if val_str.lower() in ['nat', 'nan', 'none', 'null', '<na>', '', 'nil']:
                clean_row.append('')
                continue

            # 2. Proteksi Kolom Numerik
            if idx in numeric_indices:
                s = val_str.replace(',', '').replace(' ', '')
                if s.startswith('(') and s.endswith(')'):
                    s = f"-{s[1:-1]}"
                try:
                    num = float(s)
                    if math.isnan(num) or math.isinf(num):
                        clean_row.append('0.00')
                    else:
                        clean_row.append(f"{num:.2f}")
                except (ValueError, TypeError):
                    clean_row.append('0.00')
                continue

            # 3. Kolom Teks: Bersihkan karakter null byte (\x00)
            clean_val = val_str.replace('\x00', '')
            if re.match(r'^-?\d+\.0$', clean_val):
                clean_val = clean_val[:-2]

            clean_row.append(clean_val)

        csv_writer.writerow(clean_row)

    s_buf.seek(0)
    columns = ', '.join([f'"{k}"' for k in keys])
    table_name = f'"{table.schema}"."{table.name}"' if table.schema else f'"{table.name}"'

    with dbapi_conn.cursor() as cur:
        # Gunakan sintaks COPY FORMAT CSV
        sql = f"COPY {table_name} ({columns}) FROM STDIN WITH (FORMAT CSV, NULL '', QUOTE '\"', ESCAPE '\"')"
        cur.copy_expert(sql=sql, file=s_buf)


def ensure_table_schema_exists(df: pd.DataFrame, table_name: str):
    insp = inspect(engine)
    if not insp.has_table(table_name):
        column_definitions = []
        for col in df.columns:
            safe_col = sanitize_column_name(col)
            
            if safe_col.lower() == 'id':
                continue
                
            sample_series = df[col]
            sql_type = get_precise_sql_type(safe_col, sample_series)
            column_definitions.append(f'"{safe_col}" {sql_type}')

        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS "{table_name}" (
            id SERIAL PRIMARY KEY,
            {", ".join(column_definitions)},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        with engine.begin() as conn:
            conn.execute(text(create_table_query))


def insert_data_to_db(df: pd.DataFrame, table_name: str) -> int:
    if df is None or df.empty:
        return 0

    df_db = df.copy()
    df_db.columns = [sanitize_column_name(c) for c in df_db.columns]
    
    if 'id' in df_db.columns:
        df_db = df_db.drop(columns=['id'])

    # 1. Bersihkan semua kolom NUMERIC langsung di DataFrame
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
            if_exists="append",
            index=False,
            method=_psql_insert_copy
        )

    return len(df_db)


def smart_load_to_db(df_clean: pd.DataFrame, table_name: str, periode_lengkap: str) -> dict:
    insp = inspect(engine)
    table_name_lower = table_name.lower()
    df_clean.columns = [c.lower() for c in df_clean.columns]
    
    col_where = "reff_of_no_bordereaux" if "askrida" in table_name_lower else "period"
    count_lama = 0

    if insp.has_table(table_name_lower):
        query_cek = text(f'SELECT COUNT(*) FROM "{table_name_lower}" WHERE {col_where} = :periode')

        try:
            with engine.connect() as conn:
                count_lama = conn.execute(query_cek, {"periode": periode_lengkap}).scalar() or 0

            if count_lama > 0:
                with engine.begin() as connection:
                    query_hapus = text(f'DELETE FROM "{table_name_lower}" WHERE {col_where} = :periode')
                    connection.execute(query_hapus, {"periode": periode_lengkap})
        except Exception as e:
            print(f"[!] Warning saat pengecekan DB: {e}")

    inserted_rows = insert_data_to_db(df_clean, table_name_lower)

    return {
        "status": "success",
        "table_name": table_name_lower,
        "periode": periode_lengkap,
        "deleted_old_rows": count_lama,
        "inserted_rows": inserted_rows
    }