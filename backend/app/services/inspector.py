import os
import re
import pandas as pd
from sqlalchemy import inspect, text
from app.db_connection import engine
from app.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM, SHEET_TO_TABLE_MAPPING
from app.utils.helpers import (
    to_snake_case, 
    detect_period_from_filename, 
    get_temp_file_path, 
    save_temp_file,
    read_excel_dynamic_header
)


def inspect_and_save_file(file_bytes: bytes, filename: str, tipe_proses: str, cedant: str) -> dict:
    """
    Simpan file ke temp storage, generate file_id, dan kembalikan daftar sheet + periode.
    """
    # 1. Simpan File Temp
    file_id = save_temp_file(file_bytes, filename)
    file_path = get_temp_file_path(file_id)
    
    # 2. Read File untuk Inspect Sheet
    excel_file = pd.ExcelFile(file_path)
    all_sheets = excel_file.sheet_names
    
    # 3. Detect Kuartal & Tahun dari Nama File
    period_info = detect_period_from_filename(filename)
    
    return {
        "file_id": file_id,
        "tipe_proses": tipe_proses.lower(),
        "cedant": cedant.lower(),
        "detected_period": period_info,
        "total_sheets": len(all_sheets),
        "available_sheets": all_sheets,
        "message": "File berhasil diunggah & dipindai. Gunakan file_id untuk proses selanjutnya."
    }

def normalize_sheet_mapping(sheet_name: str) -> str:
    """
    Membersihkan karakter aneh (- atau _) dan spasi ganda.
    Contoh: 'Premium-QS', 'Premium_QS', ' Premium    QS ' -> 'premium qs'
    """
    name = sheet_name.lower()
    name = re.sub(r'[\-_]+', ' ', name) 
    name = re.sub(r'\s+', ' ', name)    
    return name.strip()

def get_target_table_name(tipe_proses: str, cedant: str, selected_sheet: str, custom_table_name: str = None) -> str:
    """
    Mendapatkan nama tabel. Mengabaikan nilai default 'string' dari Swagger UI.
    """
    if custom_table_name and custom_table_name.strip() and custom_table_name.strip().lower() != "string":
        return custom_table_name.strip().lower()
        
    sheet_clean = normalize_sheet_mapping(selected_sheet)

    cob_suffix = SHEET_TO_TABLE_MAPPING.get(sheet_clean, to_snake_case(selected_sheet))
    return f"{tipe_proses.lower()}_{cedant.lower()}_{cob_suffix}"

def check_target_table_in_db(file_id: str, tipe_proses: str, cedant: str, target_sheet: str) -> dict:
    """
    Mengecek DB menggunakan file_id (tanpa re-upload file).
    """
    file_path = get_temp_file_path(file_id)
    cedant_key = cedant.lower()
    
    excel_file = pd.ExcelFile(file_path)
    sheets_map = {sheet.lower().strip(): sheet for sheet in excel_file.sheet_names}
    actual_sheet = sheets_map.get(target_sheet.lower().strip(), target_sheet)
    
    table_name = get_target_table_name(tipe_proses, cedant, actual_sheet)
    
    # Pilih master column berdasarkan tipe proses (premi / claim)
    if tipe_proses.lower() == "claim":
        master_cols = MASTER_COLUMNS_CLAIM.get(cedant_key, [])
    else:
        master_cols = MASTER_COLUMNS_PREMI.get(cedant_key, [])
    
    # Pengecekan tabel di PostgreSQL menggunakan engine terpusat
    try:
        inspector = inspect(engine)
        table_exists = inspector.has_table(table_name)
    except Exception as e:
        print(f"[-] Warning DB Inspector: {e}")
        table_exists = False

    # A. Jika Tabel SUDAH ADA di DB
    if table_exists:
        db_columns_info = inspector.get_columns(table_name)
        db_columns = [col['name'] for col in db_columns_info]
        
        mapping_matrix = [
            {"column_name": col, "status": "MATCH" if col in db_columns else "MISSING_IN_DB"}
            for col in master_cols
        ]
            
        return {
            "file_id": file_id,
            "selected_sheet": actual_sheet,
            "table_name": table_name,
            "table_exists": True,
            "mapping_matrix": mapping_matrix,
            "message": f"Tabel '{table_name}' SUDAH EKSIS di database."
        }
    
    # B. Jika Tabel BELUM ADA di DB (Rekomendasi DDL)
    else:
        # Ambil sampel 10 baris pertama dari data yang sudah tepat headernya
        df_sample = read_excel_dynamic_header(file_path, actual_sheet).head(10)
        df_sample.columns = [to_snake_case(col) for col in df_sample.columns]
        
        schema_suggestions = []
        for col in master_cols:
            suggested_type = "VARCHAR(255)"
            if col in df_sample.columns:
                dtype_str = str(df_sample[col].dtype)
                
                # Gunakan BIGINT, DOUBLE PRECISION (FLOAT), TEXT, atau TIMESTAMP
                if 'int' in dtype_str:
                    suggested_type = "BIGINT"
                elif 'float' in dtype_str:
                    suggested_type = "DOUBLE PRECISION"  # Menggantikan NUMERIC
                elif 'datetime' in dtype_str:
                    suggested_type = "TIMESTAMP"
                    
            # Khusus kolom teks panjang selalu rekomendasikan TEXT
            if col in ["insured_name", "location", "occupation"]:
                suggested_type = "TEXT"
                
            schema_suggestions.append({"column_name": col, "suggested_sql_type": suggested_type})
            
        return {
            "file_id": file_id,
            "selected_sheet": actual_sheet,
            "table_name": table_name,
            "table_exists": False,
            "recommended_create_table_ddl": schema_suggestions,
            "message": f"Tabel '{table_name}' BELUM ADA di database."
        }

def sanitize_column_name(col_name: str) -> str:
    """
    Memastikan nama kolom SQL aman dan tidak diawali angka.
    Contoh: '100_tsi' -> 'tsi_100', '100_premium' -> 'premium_100'
    """
    col_name = col_name.strip().lower()
    
    # Jika diawali angka dan underscore (misal: 100_tsi)
    match = re.match(r'^(\d+)_(.+)$', col_name)
    if match:
        number_part, text_part = match.groups()
        return f"{text_part}_{number_part}"  # Diubah jadi tsi_100
        
    return col_name

def execute_create_table(table_name: str, schema_ddl: list) -> dict:
    """
    Membuat tabel baru di PostgreSQL dengan nama kolom yang sudah disanitasi.
    """
    column_definitions = []
    for col in schema_ddl:
        # Sanitasi nama kolom agar tidak ada yang diawali angka
        safe_col_name = sanitize_column_name(col["column_name"])
        sql_type = col["suggested_sql_type"]
        column_definitions.append(f'"{safe_col_name}" {sql_type}')
        
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS "{table_name}" (
        id_record SERIAL PRIMARY KEY,
        {", ".join(column_definitions)},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    with engine.begin() as conn:
        conn.execute(text(create_table_query))
        
    return {
        "status": "success", 
        "table_name": table_name,
        "message": f"Tabel '{table_name}' berhasil dibuat di PostgreSQL dengan skema aman!"
    }