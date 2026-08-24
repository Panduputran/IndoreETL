import io
import csv
import re
import pandas as pd
import numpy as np
from sqlalchemy import text, inspect
from app.database.connection import engine
from app.services.inspector_service import infer_sql_type_dynamically, sanitize_column_name


def _psql_insert_copy(table, conn, keys, data_iter):
    r"""
    Handler khusus Pandas to_sql untuk PostgreSQL COPY Protocol.
    Mencegat dan membersihkan nilai non-tanggal/liar pada kolom TIMESTAMP secara langsung.
    """
    dbapi_conn = conn.connection
    
    # 1. Deteksi indeks kolom tanggal secara mutlak
    date_col_indices = set()
    
    # Tambahkan nama persis (exact match) agar tidak mungkin meleset
    exact_date_columns = {
        'period_of_insurance_start', 'period_of_insurance_end', 
        'period_of_start', 'period_of_end', 'start', 'end', 
        'start_date', 'end_date', 'tanggal'
    }
    date_keywords = ['date', 'period_of_insurance', 'period_of_start', 'period_of_end', 'dol', 'sdate', 'edate', 'inception', 'expiry']
    
    for idx, k in enumerate(keys):
        k_lower = str(k).lower().strip()
        
        # Cek exact match ATAU deteksi keyword
        is_date = (
            k_lower in exact_date_columns 
            or any(dk in k_lower for dk in date_keywords) 
            or k_lower.endswith('_start') 
            or k_lower.endswith('_end')
            or 'start' in k_lower
            or 'end' in k_lower
        )
        is_excluded = any(ex in k_lower for ex in ['uw_year', 'usia', 'age', 'year', 'send', 'trend', 'vendor'])
        
        if is_date and not is_excluded:
            date_col_indices.add(idx)

    with dbapi_conn.cursor() as cur:
        s_buf = io.StringIO()
        
        for row in data_iter:
            clean_row = []
            for idx, val in enumerate(row):
                # Nilai kosong / NaN / None
                if val is None or pd.isna(val):
                    clean_row.append(r'\N')
                    continue

                val_str = str(val).strip()
                if val_str.lower() in ['nat', 'nan', 'none', 'null', '<na>', '', '-']:
                    clean_row.append(r'\N')
                    continue

                # 2. CEGATAN KHUSUS KOLOM TANGGAL (TIMESTAMP)
                if idx in date_col_indices:
                    # Format ISO Timestamp YYYY-MM-DD
                    if re.match(r'^\d{4}-\d{2}-\d{2}', val_str):
                        clean_row.append(val_str)
                        continue

                    # Cegat angka nominal liar / serial Excel
                    try:
                        num_val = float(val_str.replace(',', ''))
                        if 30000 <= num_val <= 65000:
                            dt_val = pd.to_datetime('1899-12-30') + pd.to_timedelta(num_val, unit='D')
                            clean_row.append(dt_val.strftime('%Y-%m-%d %H:%M:%S'))
                            continue
                        else:
                            # Angka 1500000000 langsung dipaksa jadi NULL di sini
                            clean_row.append(r'\N')
                            continue
                    except (ValueError, TypeError):
                        pass

                    # Parse string tanggal umum
                    try:
                        dt_parsed = pd.to_datetime(val_str, errors='coerce', dayfirst=True)
                        if pd.isna(dt_parsed) or dt_parsed.year < 1900 or dt_parsed.year > 2500:
                            clean_row.append(r'\N')
                            continue
                        else:
                            clean_row.append(dt_parsed.strftime('%Y-%m-%d %H:%M:%S'))
                            continue
                    except Exception:
                        clean_row.append(r'\N')
                        continue

                # 3. Kolom Non-Tanggal: Bersihkan delimiter tab/newline
                clean_val = val_str.replace('\t', ' ').replace('\r', '').replace('\n', ' ').strip()
                if re.match(r'^-?\d+\.0$', clean_val):
                    clean_val = clean_val[:-2]

                clean_row.append(clean_val)

            s_buf.write('\t'.join(clean_row) + '\n')
            
        s_buf.seek(0)
        
        columns = ', '.join([f'"{k}"' for k in keys])
        table_name = f'"{table.schema}"."{table.name}"' if table.schema else f'"{table.name}"'
        
        sql = f"COPY {table_name} ({columns}) FROM STDIN WITH (FORMAT TEXT, NULL '\\N')"
        cur.copy_expert(sql=sql, file=s_buf)


def ensure_table_schema_exists(df: pd.DataFrame, table_name: str):
    insp = inspect(engine)
    if not insp.has_table(table_name):
        column_definitions = []
        for col in df.columns:
            safe_col = sanitize_column_name(col)
            sample_series = df[col]
            sql_type = infer_sql_type_dynamically(col, sample_series)
            column_definitions.append(f'"{safe_col}" {sql_type}')

        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS "{table_name}" (
            {", ".join(column_definitions)}
        );
        """
        with engine.begin() as conn:
            conn.execute(text(create_table_query))


def insert_data_to_db(df: pd.DataFrame, table_name: str) -> int:
    if df is None or df.empty:
        return 0

    df_db = df.copy()
    df_db.columns = [sanitize_column_name(c) for c in df_db.columns]
    table_clean = table_name.strip().lower()

    # Pastikan skema tabel dibuat
    ensure_table_schema_exists(df_db, table_clean)

    # Bulatkan kolom float ke 2 desimal
    for col in df_db.select_dtypes(include=['float', 'float64']).columns:
        df_db[col] = df_db[col].round(2)

    with engine.begin() as conn:
        df_db.to_sql(
            name=table_clean,
            con=conn,
            if_exists="append",
            index=False,
            method=_psql_insert_copy
        )

    return len(df_db)


def clean_numeric_columns(df: pd.DataFrame, numeric_cols: list) -> pd.DataFrame:
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df


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