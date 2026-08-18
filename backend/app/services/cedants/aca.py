import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case, validate_dates

class ACAETL:
    """Modul khusus pemrosesan data ACA (Premi & Klaim)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI.get("aca", [])
        
        # 1. Baca Excel menggunakan dynamic header reader yang sudah diperbaiki
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        # 2. Mapping Alias Header Excel Premi ACA
        # Mapping Alias Header Excel Premi ACA
        rename_mapping = {
            'reinsurer_id': 'id',
            'reinsurer_name': 'name',
            'treaty_id': 'treatytype',
            'treaty_type': 'treatytype',
            'treaty_year': 'treatyyear',
            'policyno': 'policyno',
            'policy_no': 'policyno',
            'policy_number': 'policyno',
            
            # --- ALIAS ENDORSEMENT ---
            'endorsement_no': 'endorsement',
            'endorsement_no_': 'endorsement',
            'endorsement_number': 'endorsement',
            'no_endorsement': 'endorsement',
            'endors_no': 'endorsement',
            'endors': 'endorsement',
            'endorse_no': 'endorsement',
            
            'start_period': 'sdate',
            'end_period': 'edate',
            'start_period_master_policy': 'sdate_master_policy',
            'tsi_100percent': 'tsi_100',
            '100percent_tsi': 'tsi_100',
            '100_tsi': 'tsi_100',
            "aca's_share": 'ourshare',
            "aca_s_share": 'ourshare',
            "acas_share": 'ourshare',
            "aca_share": 'ourshare',
            'gross_premium': 'premium',
            'gross_premium_100': 'premium',
            'gross_premium_100percent': 'premium',
            'ri_comm': 'commission',
            'ri_comm_amount': 'commission',
            'net_premium': 'net',
            'object_info_1': 'objekinfo01',
            'object_info_2': 'objekinfo02',
            'objek_info_1': 'objekinfo01',
            'objek_info_2': 'objekinfo02'
        }
        df.rename(columns=rename_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 3. Sanitasi Kolom ID & String (Hilangkan format ilmiah .0)
        for id_col in ['policyno', 'endorsement', 'id', 'treatytype', 'class_of_business', 'treatyyear']:
            if id_col in df.columns:
                df[id_col] = df[id_col].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
                df[id_col] = df[id_col].replace(['nan', 'None', 'NaN', 'NaT', ''], np.nan)

        df['period'] = periode_lengkap

        # 4. Override Class of Business jika ada input khusus
        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'class_of_business' in df.columns:
                df['class_of_business'] = override_cob.strip().upper()

        # 5. Validasi Tanggal
        df = validate_dates(df)

        # 6. Filter Baris Sampah / Baris Total Footer
        if "policyno" in df.columns:
            df = df.dropna(subset=["policyno"])
            trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            pol_str = df["policyno"].astype(str).str.upper().str.strip()
            df = df[~pol_str.str.match(trash_exact_pattern, na=False)]

        # 7. Sanitasi Kolom Numerik Premi
        num_cols = ["tsi_100", "ourshare", "exposure", "premium", "commission", "net", "roe"]
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

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM.get("aca", [])
        
        # 1. Baca Excel menggunakan dynamic header reader yang sudah diperbaiki
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

        # 3. Sanitasi Kolom ID & String (Hilangkan format ilmiah .0)
        for id_col in ['claim_no', 'policy_number', 'reinsurer_id', 'treaty_id', 'class_of_business', 'treaty_year']:
            if id_col in df.columns:
                df[id_col] = df[id_col].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
                df[id_col] = df[id_col].replace(['nan', 'None', 'NaN', 'NaT', ''], np.nan)

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