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
        # Fallback jika konfig klaim ACA ditambahkan nanti
        master_cols = MASTER_COLUMNS_CLAIM.get("aca", [])
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        df['period'] = periode_lengkap

        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = np.nan
            df = df[master_cols]

        return df.dropna(how='all', subset=[col for col in df.columns if col != 'period'])