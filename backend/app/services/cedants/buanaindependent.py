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

        # 1. Mapping Header Excel Buana Independent
        rename_mapping = {
            'reinsured': 'reinsured',
            'reinsurer_name': 'reinsured',
            'policy_number': 'policy_number',
            'policyno': 'policy_number',
            'policy_no': 'policy_number',
            'insured_name': 'insured_name',
            'cob_type_of_cover': 'cob_type_of_cover',

            # Breakdown SI (Merged Header)
            'breakdown_of_si': 'breakdown_of_si_md_building',
            'breakdown_of_si_mdbuilding': 'breakdown_of_si_md_building',
            'breakdown_of_si_md_building': 'breakdown_of_si_md_building',
            'unnamed_9': 'mb',
            'unnamed_10': 'stock',
            'unnamed_11': 'tpl',
            'unnamed_12': 'bi',
            'unnamed_13': 'other',

            # TSI & Premi
            '100_tsi': 'tsi_100',
            '100_premium': 'premium_100',

            # Tanggal
            'period_of_insurance': 'period_of_insurance_start',
            'unnamed_20': 'period_of_insurance_end',
            'period_of_start': 'period_of_insurance_start',
            'period_of_end': 'period_of_insurance_end',

            # Cedants Share & Spreading Risk
            'cedants_share': 'cedants_share',
            'spreading_of_risk': 'spreading_of_risk_or',
            'unnamed_23': 'spreading_of_risk_qs',
            'unnamed_24': 'spreading_of_risk_surplus',
            'unnamed_25': 'spreading_of_risk_others',

            # New / Renewal
            'new': 'new_renewal'
        }

        df.rename(columns=rename_mapping, inplace=True)
        if 'unnamed_0' in df.columns:
            df.drop(columns=['unnamed_0'], inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 2. FILTER BARIS SAMPAH & FOOTER TOTAL (HANYA AMBIL DATA YANG PUNYA NOMOR POLIS VALID)
        if 'policy_number' in df.columns:
            df = df.dropna(subset=['policy_number'])
            trash_regex = r'^\s*(TOTAL|JUMLAH|GRAND|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE|-)\s*$'
            df = df[~df['policy_number'].astype(str).str.upper().str.strip().str.match(trash_regex, na=False)]

        if 'no' in df.columns:
            df = df[pd.to_numeric(df['no'], errors='coerce').notnull()]

        # 3. Handle Reinsurer Share (QS vs SPL)
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

        # Set COB
        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            df['cob_type_of_cover'] = override_cob.strip().upper()
        else:
            if 'cob_type_of_cover' in df.columns and df['cob_type_of_cover'].astype(str).str.upper().str.contains('PREMIUM').any():
                df['cob_type_of_cover'] = "FIRE"

        # 4. PARSING TANGGAL DAN PAKSA KE TIPE DATETIME NYATA
        date_cols = ["period_of_insurance_start", "period_of_insurance_end"]
        for dcol in date_cols:
            if dcol in df.columns:
                def clean_buana_date(val):
                    if pd.isna(val) or val is None:
                        return pd.NaT
                    if isinstance(val, (pd.Timestamp, np.datetime64)):
                        return pd.to_datetime(val)

                    val_str = str(val).strip()
                    if val_str.lower() in ['', 'nan', 'nat', 'none', 'null', '-', '0']:
                        return pd.NaT

                    # Bersihkan angka
                    clean_num_str = val_str.replace(',', '').replace('.0', '')
                    try:
                        num_v = float(clean_num_str)
                        if 30000 <= num_v <= 65000:
                            return pd.to_datetime('1899-12-30') + pd.to_timedelta(num_v, unit='D')
                        else:
                            return pd.NaT
                    except ValueError:
                        pass

                    # Parse teks biasa
                    dt_obj = pd.to_datetime(val_str, errors='coerce')
                    if pd.isna(dt_obj) or dt_obj.year < 1900 or dt_obj.year > 2500:
                        return pd.NaT
                    return dt_obj

                df[dcol] = df[dcol].apply(clean_buana_date)

        # 5. Sinkronisasi dengan Master Columns
        for col in master_cols:
            if col not in df.columns:
                df[col] = np.nan

        df_clean = df[master_cols].copy()

        # 6. Sanitasi ID / Text Columns (HANYA KOLOM STRING MURNI)
        string_cols = ["reinsured", "policy_number", "insured_name", "cob_type_of_cover", "currency", "occupation_code", "occupation", "location", "zip_code", "new_renewal", "period"]
        for scol in string_cols:
            if scol in df_clean.columns:
                df_clean[scol] = df_clean[scol].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
                df_clean[scol] = df_clean[scol].replace(['nan', 'None', 'NaN', 'NaT', '<NA>', ''], np.nan)

        # 7. Sanitasi Numerik (Format Akuntansi & Angka Kurung)
        num_cols = [
            "uw_year", "breakdown_of_si_md_building", "mb", "stock", "tpl", "bi", "other",
            "tsi_100", "cedants_share", "spreading_of_risk_or", "spreading_of_risk_qs",
            "spreading_of_risk_surplus", "spreading_of_risk_others", "premium_100",
            "premium_rate", "premium_reinsurer_share_qs", "premium_reinsurer_share_spl"
        ]

        def parse_accounting_number(val):
            if pd.isna(val) or val is None:
                return np.nan
            if isinstance(val, (int, float)):
                return float(val)

            s = str(val).strip()
            if s in ['', '-', 'NIL', 'nil', 'None', 'nan', 'NaN', '<NA>']:
                return 0.0

            is_negative = False
            if s.startswith('(') and s.endswith(')'):
                is_negative = True
                s = s[1:-1].strip()

            if '.' in s and ',' in s:
                s = s.replace('.', '').replace(',', '.')
            elif ',' in s and '.' not in s:
                s = s.replace(',', '.')

            s = s.replace(' ', '')

            try:
                num = float(s)
                return -num if is_negative else num
            except ValueError:
                return np.nan

        for col in num_cols:
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].apply(parse_accounting_number)

        # 8. Cast Kolom 'no' ke Integer Murni
        if "no" in df_clean.columns:
            clean_no = df_clean["no"].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df_clean["no"] = pd.to_numeric(clean_no, errors='coerce').astype('Int64')

        return df_clean.reset_index(drop=True)

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM["buanaindependent"]
        
        # 1. Baca Excel dinamis
        df = read_excel_dynamic_header(file_path, target_sheet)
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        # 2. Mapping Explicit untuk Merged Header & Kolom Unnamed Buana
        rename_mapping = {
            "period_of_insurance": "period_of_insurance_start",
            "unnamed_8": "period_of_insurance_end",
            "cedants_share": "cedants_share_percent",
            "unnamed_17": "cedants_share_in_amount",
            "spreading_of_claim": "spreading_of_claim_or",
            "unnamed_19": "spreading_of_claim_qs",
            "unnamed_20": "spreading_of_claim_surplus",
            "unnamed_21": "spreading_of_claim_others",
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

        # 7. Sanitasi Khusus Kolom 'no'
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