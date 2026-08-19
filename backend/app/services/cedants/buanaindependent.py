import re
import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case, validate_dates


def format_id_column(val):
    """Sanitasi string ID agar tidak berubah menjadi float ilmiah (e+16) atau berakhiran .0"""
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


class BuanaIndependentETL:
    """Modul khusus pemrosesan data Buana Independent (Premi & Klaim)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI["buanaindependent"]
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        rename_mapping = {
            "reinsurer_id": "id",
            "reinsurer_name": "name",
            "treaty_id": "treatytype",
            "type_of_cover": "cob_type_of_cover",
            "cob": "cob_type_of_cover",
            "breakdown_of_si_mdbuilding": "breakdown_of_si_md_building",
            "breakdown_of_si_md_building": "breakdown_of_si_md_building",
            "breakdown_of_si_mb": "mb",
            "breakdown_of_si_stock": "stock",
            "breakdown_of_si_tpl": "tpl",
            "breakdown_of_si_bi": "bi",
            "breakdown_of_si_other": "other",
            "100_tsi": "tsi_100",
            "100_premium": "premium_100",
            "period_of_start": "period_of_insurance_start",
            "period_of_end": "period_of_insurance_end",
            "new": "new_renewal"
        }
        df.rename(columns=rename_mapping, inplace=True)

        if "premium_reinsurer_share" in df.columns:
            sheet_lower = target_sheet.lower().strip()
            if "qs" in sheet_lower:
                df["premium_reinsurer_share_qs"] = df["premium_reinsurer_share"]
                df["premium_reinsurer_share_spl"] = None
            elif "spl" in sheet_lower or "surplus" in sheet_lower:
                df["premium_reinsurer_share_spl"] = df["premium_reinsurer_share"]
                df["premium_reinsurer_share_qs"] = None
            df.drop(columns=["premium_reinsurer_share"], inplace=True)

        df['period'] = periode_lengkap

        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'cob_type_of_cover' in df.columns:
                df['cob_type_of_cover'] = override_cob.strip().upper()

        for col in master_cols:
            if col not in df.columns:
                df[col] = np.nan

        df_clean = df[master_cols].copy()
        num_cols = [
            "no", "uw_year", "breakdown_of_si_md_building", "mb", "stock", "tpl", "bi", "other",
            "tsi_100", "cedants_share", "spreading_of_risk_or", "spreading_of_risk_qs",
            "spreading_of_risk_surplus", "spreading_of_risk_others", "premium_100",
            "premium_rate", "premium_reinsurer_share_qs", "premium_reinsurer_share_spl"
        ]
        for col in num_cols:
            if col in df_clean.columns:
                df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')

        return df_clean.dropna(how='all', subset=[col for col in master_cols if col != 'period'])

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM["buanaindependent"]
        
        # 1. Baca Excel dinamis
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        # 2. Mapping Explicit untuk Merged Header & Kolom Unnamed Buana
        rename_mapping = {
            # Merged Header 1: Period of Insurance (From & To)
            "period_of_insurance": "period_of_insurance_start",
            "unnamed_8": "period_of_insurance_end",
            
            # Merged Header 2: Cedant's Share (% & Amount)
            "cedants_share": "cedants_share_percent",
            "unnamed_17": "cedants_share_in_amount",
            
            # Merged Header 3: Spreading of Claim (OR, QS, Surplus, Others)
            "spreading_of_claim": "spreading_of_claim_or",
            "unnamed_19": "spreading_of_claim_qs",
            "unnamed_20": "spreading_of_claim_surplus",
            "unnamed_21": "spreading_of_claim_others",
            
            # Header Non-Spasi / Alias Lain
            "riskcat": "risk_cat",
            "source_directcoinsinward_fac": "source_direct_coins_inward_fac",
            "claim_no": "claim_reff_no",
            "policy_no": "policy_number",
            "occ_code": "occupation_code",
            "currency": "curr",
            "remarks": "note"
        }
        df.rename(columns=rename_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 3. Set Periode & Override COB
        df['period'] = periode_lengkap
        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'cob_type_of_cover' in df.columns:
                df['cob_type_of_cover'] = override_cob.strip().upper()

        # 4. Sanitasi Kolom ID & String (Bebas .0 dan eksponensial)
        string_id_cols = [
            "claim_reff_no", "policy_number", "insured_name", "cob_type_of_cover",
            "risk_cat", "uw_year", "occupation_code", "occupation", "zip_code",
            "source_direct_coins_inward_fac", "curr", "note"
        ]
        for col in string_id_cols:
            if col in df.columns:
                df[col] = df[col].apply(format_id_column)

        # 5. Validasi Tanggal
        df = validate_dates(df)

        # 6. Sanitasi Kolom Numerik
        num_cols = [
            "claim_100", "cedants_share_percent", "cedants_share_in_amount",
            "spreading_of_claim_or", "spreading_of_claim_qs", "spreading_of_claim_surplus",
            "spreading_of_claim_others", "paid_claims_treaty_share", "outstanding_claims_treaty_share"
        ]
        for col in num_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(
                    df[col].astype(str).str.replace(',', '').str.replace(' ', '').str.strip(),
                    errors='coerce'
                )

        # 7. Sanitasi Khusus Kolom 'no' (Agar PostgreSQL COPY protocol sukses tanpa error '1.0')
        if "no" in df.columns:
            df["no"] = pd.to_numeric(df["no"], errors='coerce').fillna(0).astype('int64')

        # 8. Sinkronkan dengan Master Kolom Config
        for col in master_cols:
            if col not in df.columns:
                df[col] = np.nan

        df_clean = df[master_cols].copy()

        # 9. Filter Baris Total Rekap & Baris Kosong
        if "claim_reff_no" in df_clean.columns:
            df_clean = df_clean.dropna(subset=["claim_reff_no"])
            trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            reff_str = df_clean["claim_reff_no"].astype(str).str.upper().str.strip()
            df_clean = df_clean[~reff_str.str.match(trash_exact_pattern, na=False)]

        return df_clean.reset_index(drop=True)