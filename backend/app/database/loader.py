import pandas as pd
import numpy as np
from sqlalchemy import text, inspect
# Update path import koneksi database
from app.database.connection import engine


def insert_data_to_db(df: pd.DataFrame, table_name: str) -> int:
    total_cols = len(df.columns) if len(df.columns) > 0 else 1
    safe_chunksize = max(100, 20000 // total_cols)

    df_db = df.astype(object).where(pd.notnull(df), None)

    inserted_rows = df_db.to_sql(
        name=table_name,
        con=engine,
        if_exists="append",
        index=False,
        chunksize=safe_chunksize,
        method="multi"
    )
    return inserted_rows


def clean_numeric_columns(df: pd.DataFrame, numeric_cols: list) -> pd.DataFrame:
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df


def smart_load_to_db(df_clean: pd.DataFrame, table_name: str, periode_lengkap: str) -> dict:
    insp = inspect(engine)
    df_clean.columns = [c.lower() for c in df_clean.columns]
    col_where = "reff_of_no_bordereaux" if "askrida" in table_name.lower() else "period"

    count_lama = 0

    if insp.has_table(table_name):
        query_cek = text(f'SELECT COUNT(*) FROM "{table_name}" WHERE {col_where} = :periode')

        try:
            with engine.connect() as conn:
                count_lama = conn.execute(query_cek, {"periode": periode_lengkap}).scalar()

            if count_lama > 0:
                with engine.begin() as connection:
                    query_hapus = text(f'DELETE FROM "{table_name}" WHERE {col_where} = :periode')
                    connection.execute(query_hapus, {"periode": periode_lengkap})
                print(f"[*] UPDATE DB: Menghapus {count_lama} baris data lama periode '{periode_lengkap}'.")
        except Exception as e:
            print(f"[!] Warning saat pengecekan DB: {e}. Melanjutkan import...")

    inserted_rows = insert_data_to_db(df_clean, table_name)

    return {
        "status": "success",
        "table_name": table_name,
        "periode": periode_lengkap,
        "deleted_old_rows": count_lama,
        "inserted_rows": len(df_clean)
    }