import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case

class TripakartaETL:
    """Modul khusus pemrosesan data Tripakarta (Premi & Klaim)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI["tripakarta"]
        
        # Extrak Treaty Name jika ada di header atas
        df_top = pd.read_excel(file_path, sheet_name=target_sheet, nrows=6, header=None)
        treaty_raw = "Fire Quota Share Surplus"
        for i in range(len(df_top)):
            for j in range(len(df_top.columns)):
                cell_val = str(df_top.iloc[i, j]).strip()
                if "Treaty Name" in cell_val:
                    for k in range(j+1, len(df_top.columns)):
                        val_kanan = str(df_top.iloc[i, k]).strip()
                        if val_kanan and val_kanan.lower() != 'nan':
                            treaty_raw = val_kanan
                            break
                    break

        if "Quota Share Surplus" in treaty_raw:
            jenis = treaty_raw.split(" ")[0]
            val_qs = f"{jenis} Quota Share"
            val_surplus = f"{jenis} Surplus"
        else:
            val_qs = treaty_raw
            val_surplus = treaty_raw

        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        rename_mapping = {
            'breakdown_of_si_mb': 'mb', 'breakdown_of_si_stock': 'stock',
            'breakdown_of_si_tpl': 'tpl', 'breakdown_of_si_bi': 'bi',
            'breakdown_of_si_other': 'other', '100percent_tsi': '100_tsi',
            'period_of_insurance_end': 'end', 'cedants_share': 'cedant_s_share',
            'spreading_of_risk_qs': 'qs', 'spreading_of_risk_surplus': 'surplus',
            'spreading_of_risk_others': 'others', '100percent_premium': '100_premium',
            'percent_marsh_re': 'marsh_re'
        }
        df.rename(columns=rename_mapping, inplace=True)

        if 'no' in df.columns:
            df['no'] = df['no'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
        if 'policy_number' in df.columns:
            df['policy_number'] = df['policy_number'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()

        df['period'] = periode_lengkap
        df['treaty_name_qs'] = val_qs
        df['treaty_name_surplus'] = val_surplus

        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'cob' in df.columns:
                df['cob'] = override_cob.strip().upper()

        for col in master_cols:
            if col not in df.columns:
                df[col] = np.nan

        df_clean = df[master_cols].copy()
        df_clean = df_clean.dropna(how='all', subset=[col for col in master_cols if col != 'period'])
        return df_clean

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM.get("tripakarta", [])
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        df['period'] = periode_lengkap

        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = np.nan
            df = df[master_cols]

        return df.dropna(how='all', subset=[col for col in df.columns if col != 'period'])