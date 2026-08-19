import io
import csv
import pandas as pd
import numpy as np
from sqlalchemy import text, inspect
from app.database.connection import engine


def _psql_insert_copy(table, conn, keys, data_iter):
    """
    Handler khusus Pandas to_sql untuk PostgreSQL COPY Protocol.
    Menulis nilai None/NaN sebagai empty string (NULL di PostgreSQL).
    """
    dbapi_conn = conn.connection
    with dbapi_conn.cursor() as cur:
        s_buf = io.StringIO()
        writer = csv.writer(s_buf, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        
        for row in data_iter:
            clean_row = []
            for val in row:
                if val is None or pd.isna(val) or str(val).strip() in ['NaT', 'nan', 'NaN', 'None', 'NULL', '<NA>']:
                    clean_row.append('')
                else:
                    clean_row.append(str(val))
            writer.writerow(clean_row)
            
        s_buf.seek(0)
        
        columns = ', '.join([f'"{k}"' for k in keys])
        table_name = f'"{table.schema}"."{table.name}"' if table.schema else f'"{table.name}"'
        
        sql = f"COPY {table_name} ({columns}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE, NULL '')"
        cur.copy_expert(sql=sql, file=s_buf)


def insert_data_to_db(df: pd.DataFrame, table_name: str) -> int:
    """
    Insert DataFrame ke PostgreSQL secara universal dan dinamis murni berbasis tipe data native.
    """
    if df is None or df.empty:
        return 0

    df_db = df.copy()
    df_db.columns = [c.lower() for c in df_db.columns]

    # 1. Format kolom tanggal/timestamp secara dinamis sesuai tipe datetime pandas
    for col in df_db.columns:
        if pd.api.types.is_datetime64_any_dtype(df_db[col]):
            df_db[col] = df_db[col].dt.strftime('%Y-%m-%d %H:%M:%S')
            df_db[col] = df_db[col].replace(['NaT', 'nan', 'NaN', 'None', ''], None)

    # 2. Bulatkan semua kolom yang bertipe float ke 2 desimal
    for col in df_db.select_dtypes(include=['float', 'float64']).columns:
        df_db[col] = df_db[col].round(2)

    # 3. Sanitasi NaN pada kolom teks (object/string) menjadi None murni
    for col in df_db.select_dtypes(include=['object', 'string']).columns:
        df_db[col] = df_db[col].replace({
            np.nan: None, "NaT": None, "nan": None, "NAN": None, 
            "None": None, "NULL": None, "<NA>": None, "": None
        })

    table_clean = table_name.strip().lower()

    try:
        with engine.begin() as conn:
            df_db.to_sql(
                name=table_clean,
                con=conn,
                if_exists="append",
                index=False,
                method=_psql_insert_copy
            )
    except Exception as e:
        print(f"[!] Warning COPY Protocol ({e}). Menjalankan fallback standard multi-insert...")
        total_cols = len(df_db.columns) if len(df_db.columns) > 0 else 1
        safe_chunksize = max(500, 30000 // total_cols)
        
        with engine.begin() as conn:
            df_db.to_sql(
                name=table_clean,
                con=conn,
                if_exists="append",
                index=False,
                chunksize=safe_chunksize,
                method="multi"
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
                print(f"[*] UPDATE DB: Menghapus {count_lama} baris data lama periode '{periode_lengkap}'.")
        except Exception as e:
            print(f"[!] Warning saat pengecekan DB: {e}. Melanjutkan import...")

    inserted_rows = insert_data_to_db(df_clean, table_name_lower)

    return {
        "status": "success",
        "table_name": table_name_lower,
        "periode": periode_lengkap,
        "deleted_old_rows": count_lama,
        "inserted_rows": inserted_rows
    }