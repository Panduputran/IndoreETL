import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case

class ACAETL:
    """Modul khusus pemrosesan data ACA (Premi & Klaim)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI["aca"]
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        rename_mapping = {
            'reinsurer_id': 'id',
            'reinsurer_name': 'name',
            'treaty_id': 'treatytype',
            'tsi_100percent': 'tsi_100',
            'policyno': 'policyno',
            'policy_number': 'policyno',
            'policy_no': 'policyno'
        }
        df.rename(columns=rename_mapping, inplace=True)

        if 'id' in df.columns:
            df['id'] = df['id'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df['id'] = df['id'].replace(['nan', 'None', ''], np.nan)

        if 'policyno' in df.columns:
            df['policyno'] = df['policyno'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df['policyno'] = df['policyno'].replace(['nan', 'None', ''], np.nan)
            df = df.dropna(subset=['policyno'])

        df['period'] = periode_lengkap

        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'class_of_business' in df.columns:
                df['class_of_business'] = override_cob.strip().upper()

        for col in master_cols:
            if col not in df.columns:
                df[col] = np.nan

        df_clean = df[master_cols].copy()
        df_clean = df_clean.dropna(how='all', subset=[col for col in master_cols if col != 'period'])
        return df_clean

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM.get("aca", [])
        
        # 1. BACA LANGSUNG ROW 0 (Jangan pakai dynamic header agar tidak multi-level)
        df = pd.read_excel(file_path, sheet_name=target_sheet, header=0)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        # 2. Mapping Nama Kolom Excel ke Format Standar
        # Mapping nama kolom Excel ke format standar
        rename_mapping = {
            'claimno': 'claim_no',
            'claim_no': 'claim_no',
            'policy_no': 'policy_number',
            'policy_no_': 'policy_number',
            'policy_number': 'policy_number',
            'start_period': 'period_of_insurance_start',
            'end_period': 'period_of_insurance_end',
            'start_period_master_policy': 'start_period_master_policy',
            'date_of_loss': 'date_of_loss',
            'cause_of_loss': 'cause_of_loss',
            'claim_event': 'claim_event',
            
            # --- VARIASI ACA'S SHARE (%) ---
            "aca's_share": 'our_share_percent',
            "aca's_share_": 'our_share_percent',
            "aca's_share_percent": 'our_share_percent',
            "aca's_share_%": 'our_share_percent',
            "aca_s_share": 'our_share_percent',
            "aca_s_share_": 'our_share_percent',
            "aca_s_share_percent": 'our_share_percent',
            "acas_share": 'our_share_percent',
            "acas_share_percent": 'our_share_percent',
            "aca_share": 'our_share_percent',
            "aca_share_percent": 'our_share_percent',
            
            # --- REINSURER SHARE ---
            'reinsurer_share': 'reinsurer_share_percent',
            'reinsurer_share_percent': 'reinsurer_share_percent',
            'reinsurer_share_': 'reinsurer_share_percent',
            'reinsurers_share': 'reinsurer_share_percent',
            
            'gross_claim': 'claim_amount_100',
            'reinsurance_claim': 'reinsurance_claim',
            'object_info_1': 'object_info_1',
            'object_info_2': 'object_info_2'
        }
        
        df.rename(columns=rename_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 3. Sanitasi ID / String (Hilangkan format ilmiah .0)
        for id_col in ['claim_no', 'policy_number', 'reinsurer_id', 'treaty_id', 'class_of_business', 'treaty_year']:
            if id_col in df.columns:
                df[id_col] = df[id_col].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
                df[id_col] = df[id_col].replace(['nan', 'None', 'NaN', 'NaT', ''], np.nan)

        df['period'] = periode_lengkap

        # 4. Override Class of Business
        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'class_of_business' in df.columns:
                df['class_of_business'] = override_cob.strip().upper()

        # 5. Filter Baris Sampah & Total Rekap
        if "claim_no" in df.columns:
            df = df.dropna(subset=["claim_no"])
            trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            claim_str = df["claim_no"].astype(str).str.upper().str.strip()
            df = df[~claim_str.str.match(trash_exact_pattern, na=False)]

        # 6. Sanitasi Kolom Numerik
        num_cols = ["our_share_percent", "reinsurer_share_percent", "claim_amount_100", "reinsurance_claim"]
        for col in num_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(
                    df[col].astype(str).str.replace(',', '').str.replace(' ', '').str.strip(),
                    errors='coerce'
                )

        # 7. Sinkronkan dengan Master Kolom
        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = np.nan
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        return df_clean.reset_index(drop=True)