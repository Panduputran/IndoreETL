import math
import numpy as np
import pandas as pd
from app.db_connection import engine
from app.config import MASTER_COLUMNS_PREMI
from app.services.inspector import get_target_table_name
from app.utils.helpers import (
    to_snake_case, 
    get_temp_file_path, 
    read_excel_dynamic_header
)


def clean_dict_for_json(data: list) -> list:
    """
    Konversi mendalam untuk memastikan semua sel yang NaN/NaT/Null 
    berubah menjadi None (null JSON), dan nilai ber-tipe NumPy terkonversi ke tipe Python murni.
    """
    cleaned = []
    for row in data:
        cleaned_row = {}
        for key, val in row.items():
            # Cek jika nilai adalah NaN / NaT / Null bawaan Pandas/NumPy
            if pd.isna(val) or val is None:
                cleaned_row[key] = None
            elif isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                cleaned_row[key] = None
            elif isinstance(val, (pd.Timestamp, pd.Timedelta)):
                cleaned_row[key] = val.isoformat()
            # Konversi Tipe Data NumPy (int64, float64) ke Python Native
            elif isinstance(val, (np.integer, np.int64)):
                cleaned_row[key] = int(val)
            elif isinstance(val, (np.floating, np.float64)):
                cleaned_row[key] = float(val)
            else:
                cleaned_row[key] = val
        cleaned.append(cleaned_row)
    return cleaned


def insert_data_to_db(df: pd.DataFrame, table_name: str) -> int:
    """
    Menyuntikkan DataFrame ke PostgreSQL dengan chunksize dinamis.
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
    Jika ada string seperti 'IDR', 'CHF', 'EUR' atau teks tidak valid, ubah menjadi NaN.
    """
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df


def proses_data_premi(
    file_id: str, 
    target_sheet: str, 
    cedant: str, 
    kuartal: str, 
    tahun: str, 
    tipe_proses: str = "premi",
    override_cob: str = None,
    deduplicate: bool = False  
):
    file_path = get_temp_file_path(file_id)
    periode_lengkap = f"{kuartal.upper()} {tahun}"
    cedant_key = cedant.lower()
    
    if cedant_key not in MASTER_COLUMNS_PREMI:
        raise ValueError(f"Config kolom untuk cedant '{cedant}' belum terdaftar di config.py")
        
    master_cols = MASTER_COLUMNS_PREMI[cedant_key]

    
    
    # 1. Validasi Sheet
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

    # 4. Mapping Alias Komprehensif (Termasuk variasi mentah Q3)
    rename_mapping = {
        # --- BASIC INFO ---
        "reinsurer_id": "id",
        "reinsurer_name": "name",
        "treaty_id": "treatytype",
        "treaty_year": "treatyyear",
        "policy_no": "policyno",
        "policy_number": "policy_number",
        "type_of_cover": "cob_type_of_cover",
        "cob_type_of_cover": "cob_type_of_cover",
        "cob": "cob_type_of_cover",
        "reinsured": "reinsured",
        "insured_name": "insured_name",
        "uw_year": "uw_year",
        "currency": "currency",
        "occupation_code": "occupation_code",
        "occupation": "occupation",
        "location": "location",
        "zip_code": "zip_code",
        
        # --- BREAKDOWN OF SI (Penanganan 'MD/Building' & Sub-Header) ---
        "breakdown_of_si_mdbuilding": "breakdown_of_si_md_building",
        "breakdown_of_si_md_building": "breakdown_of_si_md_building",
        "breakdown_of_si_mb": "mb",
        "breakdown_of_si_stock": "stock",
        "breakdown_of_si_tpl": "tpl",
        "breakdown_of_si_bi": "bi",
        "breakdown_of_si_other": "other",
        
        # --- TSI & PREMIUM ---
        "100_tsi": "tsi_100",
        "100_premium": "premium_100",
        "100_claim": "claim_100",
        "cedants_share": "cedants_share",
        "premium_rate": "premium_rate",
        "premium_reinsurer_share": "premium_reinsurer_share",
        
        # --- DATES & STATUS ---
        "period_of_insurance_start": "period_of_insurance_start",
        "period_of_insurance_end": "period_of_insurance_end",
        "period_of_start": "period_of_insurance_start",
        "period_of_end": "period_of_insurance_end",
        "new": "new_renewal",
        "new_renewal": "new_renewal",
        
        # --- SPREADING OF RISK ---
        "spreading_of_risk_or": "spreading_of_risk_or",
        "spreading_of_risk_qs": "spreading_of_risk_qs",
        "spreading_of_risk_surplus": "spreading_of_risk_surplus",
        "spreading_of_risk_others": "spreading_of_risk_others"
    }
    df.rename(columns=rename_mapping, inplace=True)

    if "premium_reinsurer_share" in df.columns:
        sheet_lower = actual_sheet_name.lower().strip()
        
        # Jika berasal dari sheet QS
        if "qs" in sheet_lower:
            df["premium_reinsurer_share_qs"] = df["premium_reinsurer_share"]
            df["premium_reinsurer_share_spl"] = None
            
        # Jika berasal dari sheet SPL / Surplus
        elif "spl" in sheet_lower or "surplus" in sheet_lower:
            df["premium_reinsurer_share_spl"] = df["premium_reinsurer_share"]
            df["premium_reinsurer_share_qs"] = None
            
        # Hapus kolom generik lama agar tidak bentrok
        df.drop(columns=["premium_reinsurer_share"], inplace=True)
    
    # 5. Inject Kolom Periode
    df['period'] = periode_lengkap
    
    # 6. Handling Kolom Absen
    for col in master_cols:
        if col not in df.columns:
            df[col] = None

    # 7. Susun urutan kolom sesuai master_cols
    df_clean = df[master_cols].copy()

    # 8. Override COB Dinamis (Jika diminta dari API, misal "FIRE")
    if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
        if 'cob_type_of_cover' in df_clean.columns:
            df_clean['cob_type_of_cover'] = override_cob.strip().upper()
    
    # 9. Sanitasi Kolom Numeric
    num_cols = [
        "no", "uw_year", "breakdown_of_si_md_building", "mb", "stock", "tpl", "bi", "other",
        "tsi_100", "cedants_share", "spreading_of_risk_or", "spreading_of_risk_qs",
        "spreading_of_risk_surplus", "spreading_of_risk_others", "premium_100",
        "premium_rate", "premium_reinsurer_share_qs", "premium_reinsurer_share_spl"
    ]
    df_clean = clean_numeric_columns(df_clean, num_cols)
    
    # 10. Hapus baris kosong & Deduplikasi baris persis
    df_clean = df_clean.dropna(how='all', subset=[col for col in master_cols if col != 'period'])

    # TOGGLE DEDUPLIKASI: Hanya jalankan jika user set deduplicate = True
    if deduplicate:
        df_clean = df_clean.drop_duplicates(keep='first')
    
    # 11. Konversi NaN ke None khusus untuk PostgreSQL (Gunakan replace murni NumPy)
    df_db = df_clean.astype(object).replace({np.nan: None})
    
    # 12. Inject ke PostgreSQL
    insert_data_to_db(df_db, target_table_name)
    
    # 13. Persiapkan sample_preview yang 100% aman untuk Response JSON FastAPI
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