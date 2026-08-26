import re
import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case, validate_dates


def format_id_column(val):
    """Konversi nilai ID/Nomor agar tidak menjadi eksponensial (e+16) atau berakhiran .0"""
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (float, np.floating)):
        if np.isnan(val) or np.isinf(val):
            return None
        if val.is_integer():
            return f"{int(val)}"
        return f"{val:.0f}"
    val_str = str(val).strip()
    if val_str.lower() in ["nan", "none", "nat", "null", "<na>", ""]:
        return None
    return val_str[:-2] if val_str.endswith(".0") else val_str


def clean_accounting_number(val):
    """Pembersihan angka akuntansi (mendukung format koma, kurung negatif, dan whitespace)."""
    if pd.isna(val) or val is None:
        return 0.0
    s = str(val).strip()
    if s.lower() in ['', 'nan', 'none', 'null', '<na>', '-', 'nil']:
        return 0.0
    s = s.replace(',', '').replace(' ', '')
    if s.startswith('(') and s.endswith(')'):
        s = f"-{s[1:-1]}"
    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0


class ACAETL:
    """Modul khusus pemrosesan data ACA (Premi & Klaim)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI.get("aca", [])

        # 1. Baca Excel & Rename Kolom
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame(columns=master_cols)

        df.columns = [to_snake_case(str(col)) for col in df.columns]

        rename_mapping = {
            'reinsurer_id': 'reinsurer_id', 'reinsurer_name': 'name', 'treaty_id': 'treatytype',
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

        # 2. Filter Baris Sampah
        if "policyno" in df.columns:
            df = df.dropna(subset=["policyno"])
            trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND\s*TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            pol_str = df["policyno"].astype(str).str.upper().str.strip()
            df = df[~pol_str.str.match(trash_exact_pattern, na=False)]

        # 3. Penanganan Class of Business
        cob_target = override_cob.strip().upper() if (override_cob and str(override_cob).strip().lower() != "string") else "FIRE"
        if 'class_of_business' in df.columns:
            cob_clean = df['class_of_business'].astype(str).str.strip().replace(['nan', 'None', 'NaN', 'NaT', '<NA>', ''], np.nan)
            if cob_clean.notna().any():
                df['class_of_business'] = cob_clean.fillna(cob_target)
            else:
                df['class_of_business'] = cob_target
        else:
            df['class_of_business'] = cob_target

        df['period'] = periode_lengkap

        # 4. Parsing Tanggal (Format ISO String YYYY-MM-DD)
        date_cols = ['sdate', 'edate', 'sdate_master_policy']
        for col in date_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce', dayfirst=True)
                df[col] = df[col].dt.strftime('%Y-%m-%d').replace(['NaT', 'nan', 'NaN', 'None', ''], None)

        # 5. Sanitasi ID
        id_cols = ['policyno', 'endorsement', 'id', 'treatytype', 'class_of_business', 'treatyyear']
        for id_col in id_cols:
            if id_col in df.columns:
                df[id_col] = df[id_col].apply(format_id_column)

        # 6. Sanitasi Angka / Nominal
        num_cols = ["tsi_100", "ourshare", "exposure", "premium", "commission", "net", "roe"]
        for col in num_cols:
            if col in df.columns:
                df[col] = df[col].apply(clean_accounting_number)

        # 7. Sanitasi Teks
        exclude_from_str = date_cols + num_cols + id_cols
        str_target_cols = [c for c in df.columns if c not in exclude_from_str]
        for col in str_target_cols:
            df[col] = df[col].astype(str).str.upper().str.strip()
            df[col] = df[col].replace(['NAN', 'NONE', 'NULL', '<NA>', '0', '0.0', ''], None)

        # 8. Sinkronisasi dengan Master Columns
        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = None
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        return df_clean.where(pd.notnull(df_clean), None).reset_index(drop=True)

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM.get("aca", [])

        # 1. Baca Excel menggunakan dynamic header reader
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame(columns=master_cols)

        df.columns = [to_snake_case(str(col)) for col in df.columns]

        # 2. Mapping Alias Header Excel Klaim ACA
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
            'event': 'claim_event',
            'catastrophe_event': 'claim_event',
            
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

        # 3. Sanitasi Kolom ID & String
        id_cols = ['claim_no', 'policy_number', 'reinsurer_id', 'treaty_id', 'class_of_business', 'treaty_year']
        for id_col in id_cols:
            if id_col in df.columns:
                df[id_col] = df[id_col].apply(format_id_column)

        df['period'] = periode_lengkap

        # 4. Override Class of Business
        if override_cob and str(override_cob).strip() and str(override_cob).strip().lower() != "string":
            df['class_of_business'] = str(override_cob).strip().upper()
        elif 'class_of_business' not in df.columns or df['class_of_business'].isna().all():
            df['class_of_business'] = 'FIRE'

        # 5. Validasi Tanggal (Format ISO String YYYY-MM-DD)
        date_cols = ['period_of_insurance_start', 'period_of_insurance_end', 'start_period_master_policy', 'date_of_loss']
        for d_col in date_cols:
            if d_col in df.columns:
                df[d_col] = pd.to_datetime(df[d_col], errors='coerce', dayfirst=True)
                df[d_col] = df[d_col].dt.strftime('%Y-%m-%d').replace(['NaT', 'nan', 'NaN', 'None', ''], None)

        # 6. Filter Baris Sampah
        if "claim_no" in df.columns:
            df = df.dropna(subset=["claim_no"])
            trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND\s*TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            claim_str = df["claim_no"].astype(str).str.upper().str.strip()
            df = df[~claim_str.str.match(trash_exact_pattern, na=False)]

        # 7. Sanitasi Nilai Numerik Klaim
        num_cols = ["our_share_percent", "reinsurer_share_percent", "claim_amount_100", "reinsurance_claim"]
        for col in num_cols:
            if col in df.columns:
                df[col] = df[col].apply(clean_accounting_number)

        # 8. Sanitasi Kolom Teks / Deskriptif
        text_cols = ['claim_event', 'cause_of_loss', 'insured_name', 'object_info_1', 'object_info_2', 'note']
        for col in text_cols:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip().replace(['nan', 'None', 'NaN', 'NAN', '<NA>', '0', '0.0', ''], None)

        # 9. Sinkronisasi dengan Master Columns
        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = None
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        return df_clean.where(pd.notnull(df_clean), None).reset_index(drop=True)