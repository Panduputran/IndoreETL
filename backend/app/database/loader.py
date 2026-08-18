import io
import csv
import pandas as pd
import numpy as np
from sqlalchemy import text, inspect
from app.database.connection import engine


def _psql_insert_copy(table, conn, keys, data_iter):
    """
    Handler khusus Pandas to_sql untuk PostgreSQL COPY Protocol.
    Menghasilkan kecepatan insert hingga 50x-100x lebih cepat dibanding method='multi'.
    """
    dbapi_conn = conn.connection
    with dbapi_conn.cursor() as cur:
        s_buf = io.StringIO()
        writer = csv.writer(s_buf, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        
        for row in data_iter:
            # Pastikan nilai None ditulis sebagai string kosong/null CSV yang valid
            writer.writerow([val if val is not None else '' for val in row])
            
        s_buf.seek(0)
        
        columns = ', '.join([f'"{k}"' for k in keys])
        table_name = f'"{table.schema}"."{table.name}"' if table.schema else f'"{table.name}"'
        
        sql = f"COPY {table_name} ({columns}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE, NULL '')"
        cur.copy_expert(sql=sql, file=s_buf)


def insert_data_to_db(df: pd.DataFrame, table_name: str) -> int:
    """
    Insert DataFrame ke PostgreSQL dengan performa maksimal.
    """
    if df.empty:
        return 0

    # Normalisasi kolom ke lower case
    df = df.copy()
    df.columns = [c.lower() for c in df.columns]

    # Bersihkan NaN/NaT menjadi None murni
    df_db = df.astype(object).where(pd.notnull(df), None)

    try:
        # 1. Eksekusi tercepat via PostgreSQL COPY Stream (< 2 detik untuk 80k rows)
        with engine.begin() as conn:
            df_db.to_sql(
                name=table_name.lower(),
                con=conn,
                if_exists="append",
                index=False,
                method=_psql_insert_copy
            )
    except Exception as e:
        print(f"[!] Warning: Gagal menggunakan COPY protocol ({e}). Menggunakan fallback standard chunk...")
        # 2. Fallback aman jika driver non-psycopg
        total_cols = len(df.columns) if len(df.columns) > 0 else 1
        safe_chunksize = max(500, 30000 // total_cols)
        
        with engine.begin() as conn:
            df_db.to_sql(
                name=table_name.lower(),
                con=conn,
                if_exists="append",
                index=False,
                chunksize=safe_chunksize,
                method="multi"
            )

    return len(df)


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