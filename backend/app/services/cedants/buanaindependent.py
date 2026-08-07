import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case

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
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

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

        df['period'] = periode_lengkap

        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            if 'cob_type_of_cover' in df.columns:
                df['cob_type_of_cover'] = override_cob.strip().upper()

        for col in master_cols:
            if col not in df.columns:
                df[col] = np.nan

        df_clean = df[master_cols].copy()
        num_cols = [
            "no", "uw_year", "claim_100", "cedants_share_percent", "cedants_share_in_amount",
            "spreading_of_claim_or", "spreading_of_claim_qs", "spreading_of_claim_surplus",
            "spreading_of_claim_others", "paid_claims_treaty_share", "outstanding_claims_treaty_share"
        ]
        for col in num_cols:
            if col in df_clean.columns:
                df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')

        return df_clean.dropna(how='all', subset=[col for col in master_cols if col != 'period'])