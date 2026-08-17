import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case, validate_dates

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
        master_cols = MASTER_COLUMNS_CLAIM["tripakarta"]
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        # Mapping Alias Presisi untuk Header Mentah Klaim Tripakarta
        rename_mapping = {
            "register_no": "register_no",
            "claim_no": "register_no",
            "claim_ref_no": "register_no",
            "policy_no": "policy_number",
            "type_of_cover": "cob",
            "date_of_loss": "dol",
            "currency": "curr",
            "100_claim": "claim_100",
            "claim_100": "claim_100",
            "claim_100percent": "claim_100",
            "period_of_insurance_start": "period_of_insurance_start",
            "period_of_insurance_end": "period_of_insurance_end",
            
            # 🎯 ALIAS LENGKAP UNTUK KOTAK SOURCE AGAR TIDAK NULL LAGI
            "source": "source_direct_coins_fac",
            "source_direct_coins_inward_fac": "source_direct_coins_fac",
            "source_directcoinsinward_fac": "source_direct_coins_fac",
            "source_direct_coins_fac": "source_direct_coins_fac",
            "source_directcoinsfac": "source_direct_coins_fac",

            "cedants_share": "cedants_share_percent",
            "cedants_share_percent": "cedants_share_percent",
            "cedants_share_in_amount": "cedants_share_in_amount",
            "spreading_of_claim_or": "spreading_of_claim_or",
            "spreading_of_claim_qs": "spreading_of_claim_qs",
            "spreading_of_claim_surplus": "spreading_of_claim_spl",
            "spreading_of_claim_spl": "spreading_of_claim_spl",
            "spreading_of_claim_others": "spreading_of_claim_others",
            "claim_quota_share_marsh_re_share": "claim_qs_marsh_re_share",
            "claim_surplus_marsh_re_share": "claim_spl_marsh_re_share",
            "outstanding_claims_100": "os_claims_100",
            "outstanding_claims_100percent": "os_claims_100",
            "outstanding_claims_marsh_re_share": "os_claims_marsh_re_share"
        }
        df.rename(columns=rename_mapping, inplace=True)

        # Hapus kolom duplikat jika ada
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # Sanitasi string nomor register dan polis
        if "register_no" in df.columns:
            df["register_no"] = df["register_no"].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df["register_no"] = df["register_no"].replace(['nan', 'None', 'NaN', 'NaT', ''], np.nan)

        if "policy_number" in df.columns:
            df["policy_number"] = df["policy_number"].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df["policy_number"] = df["policy_number"].replace(['nan', 'None', 'NaN', 'NaT', ''], np.nan)

        # Sanitasi UW YEAR sebagai String
        if "uw_year" in df.columns:
            df["uw_year"] = df["uw_year"].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df["uw_year"] = df["uw_year"].replace(['nan', 'None', 'NaN', 'NaT', ''], np.nan)

        df['period'] = periode_lengkap

        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'cob' in df.columns:
                df['cob'] = override_cob.strip().upper()

        df = validate_dates(df)

        for col in master_cols:
            if col not in df.columns:
                df[col] = np.nan

        df_clean = df[master_cols].copy()

        # --------------------------------------------------------
        # FILTER PRESISI: BUANG BARIS REKAP / TOTAL FOOTER
        # --------------------------------------------------------
        if "register_no" in df_clean.columns and "policy_number" in df_clean.columns:
            df_clean = df_clean.dropna(subset=["register_no", "policy_number"], how="all")

        trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
        
        if "register_no" in df_clean.columns:
            reg_str = df_clean["register_no"].astype(str).str.upper().str.strip()
            df_clean = df_clean[~reg_str.str.match(trash_exact_pattern, na=False)]

        if "policy_number" in df_clean.columns:
            pol_str = df_clean["policy_number"].astype(str).str.upper().str.strip()
            df_clean = df_clean[~pol_str.str.match(trash_exact_pattern, na=False)]

        # Sanitasi Angka (uw_year tidak dimasukkan ke num_cols agar aman sebagai VARCHAR)
        num_cols = [
            "no", "claim_100", "cedants_share_percent", "cedants_share_in_amount",
            "spreading_of_claim_or", "spreading_of_claim_qs", "spreading_of_claim_spl",
            "spreading_of_claim_others", "claim_qs_marsh_re_share", "claim_spl_marsh_re_share",
            "os_claims_100", "os_claims_marsh_re_share"
        ]
        for col in num_cols:
            if col in df_clean.columns:
                df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')

        return df_clean.reset_index(drop=True)  