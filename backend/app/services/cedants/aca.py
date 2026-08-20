import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case, validate_dates

def format_id_column(val):
    """Konversi nilai ID/Nomor agar tidak menjadi eksponensial (e+16) atau berakhiran .0"""
    if pd.isna(val):
        return np.nan
    if isinstance(val, (float, np.floating)):
        if np.isnan(val) or np.isinf(val):
            return np.nan
        if val.is_integer():
            return f"{int(val)}"
        return f"{val:.0f}"
    val_str = str(val).strip()
    if val_str.lower() in ["nan", "none", "nat", "null", ""]:
        return np.nan
    return val_str.replace(".0", "") if val_str.endswith(".0") else val_str

class ACAETL:
    """Modul khusus pemrosesan data ACA (Premi & Klaim)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI.get("aca", [])

        # 1. Baca Excel & Rename Kolom
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        rename_mapping = {
            'reinsurer_id': 'id', 'reinsurer_name': 'name', 'treaty_id': 'treatytype',
            'treaty_type': 'treatytype', 'treaty_year': 'treatyyear', 'policyno': 'policyno',
            'policy_no': 'policyno', 'policy_number': 'policyno', 'endorsement_no': 'endorsement',
            'endorsement_no_': 'endorsement', 'endorsement_number': 'endorsement',
            'no_endorsement': 'endorsement', 'endors_no': 'endorsement', 'endors': 'endorsement',
            'endorse_no': 'endorsement', 'cob': 'class_of_business', 'class_of_business': 'class_of_business',
            'business_class': 'class_of_business', 'start_period': 'sdate', 'end_period': 'edate',
            'start_period_master_policy': 'sdate_master_policy', 'tsi_100percent': 'tsi_100',
            '100percent_tsi': 'tsi_100', '100_tsi': 'tsi_100', "aca's_share": 'ourshare',
            "aca_s_share": 'ourshare', "acas_share": 'ourshare', "aca_share": 'ourshare',
            'gross_premium': 'premium', 'gross_premium_100': 'premium', 'gross_premium_100percent': 'premium',
            'ri_comm': 'commission', 'ri_comm_amount': 'commission', 'net_premium': 'net',
            'object_info_1': 'objekinfo01', 'object_info_2': 'objekinfo02',
            'objek_info_1': 'objekinfo01', 'objek_info_2': 'objekinfo02'
        }
        df.rename(columns=rename_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 2. Filter Baris Sampah (Polis Kosong / Total)
        if "policyno" in df.columns:
            df = df.dropna(subset=["policyno"])
            trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND\s*TOTAL|SUBTOTAL|REKAP|SUMMARY)\s*$'
            pol_str = df["policyno"].astype(str).str.upper().str.strip()
            df = df[~pol_str.str.match(trash_exact_pattern, na=False)]

        # 3. Penanganan Class of Business (Prioritas Excel)
        cob_target = override_cob.strip().upper() if (override_cob and override_cob.strip().lower() != "string") else "FIRE"
        if 'class_of_business' in df.columns:
            cob_clean = df['class_of_business'].astype(str).str.strip().replace(['nan', 'None', 'NaN', 'NaT', '<NA>', ''], np.nan)
            if cob_clean.notna().any():
                df['class_of_business'] = cob_clean.fillna(cob_target)
            else:
                df['class_of_business'] = cob_target
        else:
            df['class_of_business'] = cob_target

        df['period'] = periode_lengkap

        # -------------------------------------------------------------
        # 4. SINKRONKAN DENGAN MASTER COLUMNS DULUAN (KUNCI UTAMA)
        # -------------------------------------------------------------
        # Agar kolom-kolom numerik / tanggal yang kosong otomatis masuk ke proses cast di bawah
        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = np.nan
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        # -------------------------------------------------------------
        # 5. PEMAKSAAN TIPE DATA (Format angka & tanggal dijamin aman)
        # -------------------------------------------------------------

        # A. Kolom Identitas (String Murni Aman dari Notasi Ilmiah e+16)
        id_cols = ['policyno', 'endorsement', 'id', 'treatytype', 'class_of_business', 'treatyyear']
        for id_col in id_cols:
            if id_col in df_clean.columns:
                df_clean[id_col] = df_clean[id_col].apply(format_id_column)

        # B. Kolom Tanggal -> Jadi TIMESTAMP
        date_cols = ['sdate', 'edate', 'sdate_master_policy']
        for col in date_cols:
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].replace(['0', '0.0', 0, 0.0, 'nan', 'NaN'], np.nan)
                df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')

        # C. Kolom Nominal / Uang -> Jadi FLOAT 123 (DOUBLE PRECISION)
        num_cols = ["tsi_100", "ourshare", "exposure", "premium", "commission", "net", "roe"]
        for col in num_cols:
            if col in df_clean.columns:
                if df_clean[col].dtype == object:
                    df_clean[col] = (
                        df_clean[col]
                        .astype(str)
                        .str.replace(r'[^\d.-]', '', regex=True)
                        .replace('', '0')
                    )
                # Fillna 0.0 inilah yang memancing DBeaver mengeset tabel jadi tipe Angka
                df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0.0)

        # D. Kolom Teks -> Jadi VARCHAR A-Z
        exclude_from_str = date_cols + num_cols + id_cols
        str_target_cols = [c for c in df_clean.columns if c not in exclude_from_str]

        for col in str_target_cols:
            df_clean[col] = df_clean[col].astype(str).str.upper().str.strip()
            df_clean[col] = df_clean[col].replace(['NAN', 'NONE', 'NULL', '<NA>', '0', '0.0', ''], None)

        # Finalisasi
        df_clean = df_clean.where(pd.notnull(df_clean), None)
        return df_clean.reset_index(drop=True)

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM.get("aca", [])

        # 1. Baca Excel menggunakan dynamic header reader
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        # 2. Mapping Alias Header Excel Klaim ACA (Non Marine, Marine Hull, Marine Cargo)
        rename_mapping = {
            'claimno': 'claim_no',
            'claim_no': 'claim_no',
            'claim_number': 'claim_no',
            'register_no': 'claim_no',
            'policy_no': 'policy_number',
            'policy_no_': 'policy_number',
            'policy_number': 'policy_number',
            'start_period': 'period_of_insurance_start',
            'end_period': 'period_of_insurance_end',
            'start_period_master_policy': 'start_period_master_policy',
            'date_of_loss': 'date_of_loss',
            'cause_of_loss': 'cause_of_loss',
            'claim_event': 'claim_event',
            
            # Variasi ACA's Share (%)
            "aca's_share": 'our_share_percent',
            "aca_s_share": 'our_share_percent',
            "aca's_share_percent": 'our_share_percent',
            "aca_s_share_percent": 'our_share_percent',
            "acas_share": 'our_share_percent',
            "aca_share": 'our_share_percent',
            
            # Variasi Reinsurer Share
            'reinsurer_share': 'reinsurer_share_percent',
            'reinsurer_share_percent': 'reinsurer_share_percent',
            'reinsurers_share': 'reinsurer_share_percent',
            
            'gross_claim': 'claim_amount_100',
            '100_claim': 'claim_amount_100',
            'claim_amount_100': 'claim_amount_100',
            'reinsurance_claim': 'reinsurance_claim',
            'object_info_1': 'object_info_1',
            'object_info_2': 'object_info_2'
        }
        df.rename(columns=rename_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 3. Sanitasi Kolom ID & String (Menjaga digit claim_no/policy_number tetap utuh tanpa format e+16)
        id_cols = ['claim_no', 'policy_number', 'reinsurer_id', 'treaty_id', 'class_of_business', 'treaty_year']
        for id_col in id_cols:
            if id_col in df.columns:
                df[id_col] = df[id_col].apply(format_id_column)

        df['period'] = periode_lengkap

        # 4. Override Class of Business jika ada
        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'class_of_business' in df.columns:
                df['class_of_business'] = override_cob.strip().upper()

        # 5. Validasi Tanggal
        df = validate_dates(df)

        # 6. Filter Baris Sampah & Baris Total Rekap
        if "claim_no" in df.columns:
            df = df.dropna(subset=["claim_no"])
            trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            claim_str = df["claim_no"].astype(str).str.upper().str.strip()
            df = df[~claim_str.str.match(trash_exact_pattern, na=False)]

        # 7. Sanitasi Nilai Numerik Klaim
        num_cols = ["our_share_percent", "reinsurer_share_percent", "claim_amount_100", "reinsurance_claim"]
        for col in num_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(
                    df[col].astype(str).str.replace(',', '').str.replace(' ', '').str.strip(),
                    errors='coerce'
                )

        # 8. Sinkronkan dengan Master Kolom Config
        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = np.nan
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        return df_clean.reset_index(drop=True)