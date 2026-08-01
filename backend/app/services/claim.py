import math
import pandas as pd
from app.db_connection import engine
from app.config import MASTER_COLUMNS_CLAIM
from app.services.inspector import get_target_table_name
from app.utils.helpers import (
    to_snake_case, 
    get_temp_file_path, 
    read_excel_dynamic_header
)


def clean_dict_for_json(data: list) -> list:
    """
    Mengonversi NaN, Inf, NaT, dan Timestamp menjadi None/String 
    agar 100% aman diserialisasi oleh json.dumps() FastAPI.
    """
    cleaned = []
    for row in data:
        cleaned_row = {}
        for key, val in row.items():
            if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                cleaned_row[key] = None
            elif pd.isna(val):
                cleaned_row[key] = None
            elif isinstance(val, (pd.Timestamp, pd.Timedelta)):
                cleaned_row[key] = val.isoformat()
            else:
                cleaned_row[key] = val
        cleaned.append(cleaned_row)
    return cleaned


def insert_data_to_db(df: pd.DataFrame, table_name: str) -> int:
    """
    Menyuntikkan DataFrame Klaim ke PostgreSQL dengan chunksize dinamis.
    """
    total_cols = len(df.columns) if len(df.columns) > 0 else 1
    safe_chunksize = max(100, 20000 // total_cols)

    inserted_rows = df.to_sql(
        name=table_name,
        con=engine,
        if_exists="append",
        index=False,
        chunksize=safe_chunksize
    )
    return inserted_rows


def clean_numeric_columns(df: pd.DataFrame, numeric_cols: list) -> pd.DataFrame:
    """
    Memastikan kolom numeric murni berisi angka/float.
    Ubah string tak valid (seperti 'IDR', 'CHF', '-') menjadi NaN.
    """
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df


def proses_data_claim(
    file_id: str, 
    target_sheet: str, 
    cedant: str, 
    kuartal: str, 
    tahun: str, 
    tipe_proses: str = "claim",
    override_cob: str = None,
    deduplicate: bool = False  # <-- Tambah parameter
):
    file_path = get_temp_file_path(file_id)
    periode_lengkap = f"{kuartal.upper()} {tahun}"
    cedant_key = cedant.lower()
    
    if cedant_key not in MASTER_COLUMNS_CLAIM:
        raise ValueError(f"Config kolom klaim untuk cedant '{cedant}' belum terdaftar di MASTER_COLUMNS_CLAIM")
        
    master_cols = MASTER_COLUMNS_CLAIM[cedant_key]
    
    # 1. Validasi Keberadaan Sheet
    excel_file = pd.ExcelFile(file_path)
    all_sheets = excel_file.sheet_names
    
    sheets_map = {sheet.lower().strip(): sheet for sheet in all_sheets}
    clean_target = target_sheet.lower().strip()
    
    if clean_target not in sheets_map:
        raise ValueError(f"Sheet '{target_sheet}' tidak ditemukan di file. Sheet yang ada: {all_sheets}")
        
    actual_sheet_name = sheets_map[clean_target]
    target_table_name = get_target_table_name(tipe_proses, cedant, actual_sheet_name)
    
    # 2. Read Excel Dinamis
    df = read_excel_dynamic_header(file_path, actual_sheet_name)
    
    # 3. Standardisasi nama kolom mentah ke snake_case
    df.columns = [to_snake_case(str(col)) for col in df.columns]
    
    # --- PEMBERSIH PREFIX OTOMATIS KHUSUS KLAIM ---
    clean_cols = []
    for col in df.columns:
        if col.startswith("spreading_of_risk_") or col.startswith("spreading_of_claim_"):
            col = col.replace("spreading_of_risk_", "spreading_of_claim_")
            
        if col in ["period_of_start", "period_start"]:
            col = "period_of_insurance_start"
        elif col in ["period_of_end", "period_end"]:
            col = "period_of_insurance_end"
            
        clean_cols.append(col)
        
    df.columns = clean_cols
    # ----------------------------------------------
    
    # 4. Alias Utama untuk Klaim
    rename_mapping = {
        "claim_no": "claim_reff_no",
        "claim_ref_no": "claim_reff_no",
        "claim_reference_no": "claim_reff_no",
        "policy_no": "policy_number",
        "type_of_cover": "cob_type_of_cover",
        "cob": "cob_type_of_cover",
        "date_of_loss": "dol",
        "currency": "curr",
        "100_claim": "claim_100",
        "100_claim_amount": "claim_100",
        "cedant_share_percent": "cedants_share_percent",
        "cedant_share_amount": "cedants_share_in_amount",
        "cedants_share_amount": "cedants_share_in_amount",
        "paid_claim": "paid_claims_treaty_share",
        "outstanding_claim": "outstanding_claims_treaty_share"
    }
    df.rename(columns=rename_mapping, inplace=True)
    
    # 5. Inject Kolom Periode
    df['period'] = periode_lengkap
    
    # 6. Handling Kolom Absen
    for col in master_cols:
        if col not in df.columns:
            df[col] = None
            
    # 7. Susun dan urutkan sesuai urutan Master Column
    df_clean = df[master_cols].copy()
    
    # --- LOGIC OVERRIDE COB DINAMIS ---
    if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
        if 'cob_type_of_cover' in df_clean.columns:
            df_clean['cob_type_of_cover'] = override_cob.strip().upper()
    # ----------------------------------
    
    # 8. SANITASI KOLOM NUMERIC KLAIM
    num_cols = [
        "no", "uw_year", "claim_100", "cedants_share_percent", "cedants_share_in_amount",
        "spreading_of_claim_or", "spreading_of_claim_qs", "spreading_of_claim_surplus",
        "spreading_of_claim_others", "paid_claims_treaty_share", "outstanding_claims_treaty_share"
    ]
    df_clean = clean_numeric_columns(df_clean, num_cols)
    
    # 9. Hapus baris kosong & Deduplikasi baris persis
    df_clean = df_clean.dropna(how='all', subset=[col for col in master_cols if col != 'period'])

    # TOGGLE DEDUPLIKASI: Hanya jalankan jika user set deduplicate = True
    if deduplicate:
        df_clean = df_clean.drop_duplicates(keep='first')
    
    # 10. Konversi NaN ke None untuk simpan ke Postgres
    df_db = df_clean.where(pd.notnull(df_clean), None)
    
    # 11. Inject ke PostgreSQL
    insert_data_to_db(df_db, target_table_name)
    
    # 12. AMANKAN SAMPLE PREVIEW DARI NaN FLOAT
    raw_preview = df_clean.head(1).to_dict(orient="records")
    sample_preview_clean = clean_dict_for_json(raw_preview)

    return {
        "status": "success",
        "period": periode_lengkap,
        "cedant": cedant_key,
        "processed_sheet": actual_sheet_name,
        "target_table": target_table_name,
        "total_rows_inserted": len(df_clean),
        "total_columns": len(df_clean.columns),
        "columns": list(df_clean.columns),
        "sample_preview": sample_preview_clean
    }