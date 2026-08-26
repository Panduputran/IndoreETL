import re
import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case, validate_dates


class TripakartaETL:
    """Modul khusus pemrosesan data Tripakarta (Premi & Klaim) - High Performance"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI["tripakarta"]
        
        # 1. Ekstrak Treaty Name dari Header Atas (Cepat dengan calamine)
        val_qs = "Fire Quota Share"
        val_surplus = "Fire Surplus"
        try:
            df_top = pd.read_excel(file_path, sheet_name=target_sheet, nrows=8, header=None, engine="calamine")
            treaty_raw = ""
            for i in range(len(df_top)):
                for j in range(len(df_top.columns)):
                    cell_val = str(df_top.iloc[i, j]).strip()
                    if "treaty name" in cell_val.lower():
                        for k in range(j + 1, len(df_top.columns)):
                            val_k = str(df_top.iloc[i, k]).strip()
                            if val_k and val_k.lower() not in ['nan', 'none', '']:
                                treaty_raw = val_k
                                break
                        break
                if treaty_raw:
                    break

            if treaty_raw:
                if "quota share surplus" in treaty_raw.lower():
                    jenis = treaty_raw.split()[0]
                    val_qs = f"{jenis} Quota Share"
                    val_surplus = f"{jenis} Surplus"
                else:
                    val_qs = treaty_raw
                    val_surplus = treaty_raw
        except Exception:
            pass

        # 2. Baca Data dengan Dynamic Header (Calamine Engine)
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame(columns=master_cols)

        # 3. Dynamic Flexible Header Renaming (Mencegah ketergantungan pada 'Unnamed: 9')
        rename_dict = {}
        for col in df.columns:
            c = to_snake_case(str(col))

            # Breakdown SI
            if any(k in c for k in ['breakdown_of_si', 'building', 'md_building']): rename_dict[col] = 'breakdown_of_si_md_building'
            elif c == 'mb' or 'machinery' in c: rename_dict[col] = 'mb'
            elif c == 'stock' or 'persediaan' in c: rename_dict[col] = 'stock'
            elif c == 'tpl' or 'liability' in c: rename_dict[col] = 'tpl'
            elif c == 'bi' or 'business_interruption' in c: rename_dict[col] = 'bi'
            elif c in ['other', 'others', 'lainnya']: rename_dict[col] = 'other'

            # Identitas & Polis
            elif c in ['no', 'nr', 'nomor']: rename_dict[col] = 'no'
            elif c in ['cob', 'class_of_business', 'type_of_cover']: rename_dict[col] = 'cob'
            elif 'reinsured' in c: rename_dict[col] = 'reinsured'
            elif 'policy' in c: rename_dict[col] = 'policy_number'
            elif 'insured' in c: rename_dict[col] = 'insured_name'
            elif any(k in c for k in ['uw_year', 'underwriting_year', 'tahun_uw']): rename_dict[col] = 'uw_year'
            elif 'curr' in c: rename_dict[col] = 'currency'
            elif '100_tsi' in c or 'tsi_100' in c or (c.endswith('tsi') and 'share' not in c): rename_dict[col] = 'tsi_100'
            elif 'basis' in c: rename_dict[col] = 'basis_of_indemnity'
            elif 'occupation_code' in c or 'occ_code' in c: rename_dict[col] = 'occupation_code'
            elif 'occupation' in c: rename_dict[col] = 'occupation'
            elif 'location' in c or 'lokasi' in c: rename_dict[col] = 'location'

            # Period of Insurance
            elif any(k in c for k in ['period_of_insurance_start', 'period_start', 'inception', 'sdate']) or (('period' in c or 'insurance' in c) and 'start' in c):
                rename_dict[col] = 'period_of_insurance_start'
            elif any(k in c for k in ['period_of_insurance_end', 'period_end', 'expiry', 'edate']) or (('period' in c or 'insurance' in c) and ('end' in c or 'exp' in c)):
                rename_dict[col] = 'period_of_insurance_end'

            # Share & Premi
            elif 'source' in c: rename_dict[col] = 'source_direct_coins_inward_fac'
            elif 'cedant' in c and 'share' in c: rename_dict[col] = 'cedant_s_share'
            elif 'spreading_of_risk' in c or c == 'or': rename_dict[col] = 'spreading_of_risk_or'
            elif c == 'qs': rename_dict[col] = 'qs'
            elif c in ['surplus', 'spl']: rename_dict[col] = 'surplus'
            elif '100_premium' in c or 'premium_100' in c or (c.endswith('premium') and 'share' not in c and 'rate' not in c): rename_dict[col] = 'premium_100'
            elif 'rate' in c: rename_dict[col] = 'premium_rate'
            elif 'premi_qs' in c or 'premium_qs' in c:
                if 'marsh' in c or 'share' in c: rename_dict[col] = 'premium_qs_marsh_re_share'
                else: rename_dict[col] = 'premi_qs'
            elif 'comm_qs' in c: rename_dict[col] = 'comm_qs'
            elif 'premi_spl' in c or 'premium_spl' in c:
                if 'marsh' in c or 'share' in c: rename_dict[col] = 'premium_spl_marsh_re_share'
                else: rename_dict[col] = 'premi_spl'
            elif 'comm_spl' in c: rename_dict[col] = 'comm_spl'
            elif 'marsh' in c: rename_dict[col] = 'marsh_re'
            elif 'note' in c: rename_dict[col] = 'note'
            elif 'remark' in c: rename_dict[col] = 'remarks'

        df.rename(columns=rename_dict, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 4. Buang Baris Sampah & Header Ganda
        if 'period_of_insurance_start' in df.columns:
            mask_sub = df['period_of_insurance_start'].astype(str).str.upper().str.contains(r'START|INCEPTION|PERIODE', na=False)
            df = df[~mask_sub]

        # 5. Parsing Tanggal Aman
        date_cols = ['period_of_insurance_start', 'period_of_insurance_end']
        for dcol in date_cols:
            if dcol in df.columns:
                df[dcol] = pd.to_datetime(df[dcol], errors='coerce', dayfirst=True)
                df[dcol] = df[dcol].dt.strftime('%Y-%m-%d %H:%M:%S').replace(['NaT', 'nan', 'NaN', 'None'], None)

        # 6. ID Sanitization
        for id_c in ['no', 'policy_number', 'uw_year']:
            if id_c in df.columns:
                df[id_c] = df[id_c].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
                df[id_c] = df[id_c].replace(['nan', 'None', 'NaN', 'NaT', '<NA>', ''], None)

        df['period'] = periode_lengkap
        df['treaty_name_qs'] = val_qs
        df['treaty_name_surplus'] = val_surplus

        if override_cob and str(override_cob).strip() and str(override_cob).strip().lower() != "string":
            df['cob'] = str(override_cob).strip().upper()

        # 7. Sinkronisasi Kolom Master
        for col in master_cols:
            if col not in df.columns:
                df[col] = None

        df_clean = df[master_cols].copy()

        # 8. Filter Baris Kosong & Total
        if "policy_number" in df_clean.columns:
            df_clean = df_clean.dropna(subset=["policy_number"])
            trash_regex = r'^\s*(TOTAL|JUMLAH|GRAND\s*TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            pol_str = df_clean["policy_number"].astype(str).str.upper().str.strip()
            df_clean = df_clean[~pol_str.str.match(trash_regex, na=False)]

        # 9. Sanitasi Kolom Numerik
        num_cols = [
            "breakdown_of_si_md_building", "mb", "stock", "tpl", "bi", "other",
            "tsi_100", "100_tsi", "cedant_s_share", "spreading_of_risk_or", "qs", "surplus",
            "others", "premium_100", "100_premium", "premium_rate", "premi_qs", "comm_qs",
            "premi_spl", "comm_spl", "marsh_re", "premium_qs_marsh_re_share",
            "premium_spl_marsh_re_share"
        ]
        for col in num_cols:
            if col in df_clean.columns:
                df_clean[col] = pd.to_numeric(
                    df_clean[col].astype(str).str.replace(',', '', regex=False).str.replace(' ', '', regex=False),
                    errors='coerce'
                ).fillna(0.0)

        return df_clean.where(pd.notnull(df_clean), None).reset_index(drop=True)

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM["tripakarta"]

        # 1. BACA LANGSUNG VIA CALAMINE (Jauh lebih cepat daripada openpyxl unmerge manual)
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame(columns=master_cols)

        # 2. Kamus Sinonim Dinamis Presisi
        SYNONYMS = {
            "no": ["no", "nomor", "no_urut", "nr"],
            "register_no": ["register_no", "claim_no", "claim_ref_no", "no_klaim", "no_register", "reg_no", "claim_number"],
            "policy_number": ["policy_number", "policy_no", "no_polis", "nomor_polis", "policyno", "nopol"],
            "insured_name": ["insured_name", "nama_tertanggung", "name_of_insured", "insured"],
            "cob": ["cob", "type_of_cover", "class_of_business", "jenis_asuransi", "cover"],
            "uw_year": ["uw_year", "underwriting_year", "tahun_uw", "uw_yr"],
            "period_of_insurance_start": ["period_of_insurance_start", "period_start", "insurance_start", "inception", "sdate", "period_from"],
            "period_of_insurance_end": ["period_of_insurance_end", "period_end", "insurance_end", "expiry", "edate", "period_to"],
            "occupation_code": ["occupation_code", "kode_okupasi", "occ_code"],
            "occupation": ["occupation", "okupasi", "jenis_usaha"],
            "dol": ["dol", "date_of_loss", "tgl_kejadian", "tanggal_kejadian", "loss_date", "tgl_klaim"],
            "source_direct_coins_fac": ["source_direct_coins_inward_fac", "source_direct_coins_fac", "source"],
            "curr": ["curr", "currency", "mata_uang", "valuta"],
            "claim_100": ["claim_100", "100_claim", "total_claim", "claim_amount_100"],
            "cedants_share_percent": ["cedants_share_percent", "cedants_share", "share_cedant_percent"],
            "cedants_share_in_amount": ["cedants_share_in_amount", "cedant_share_amount", "nilai_share_cedant"],
            "spreading_of_claim_or": ["spreading_of_claim_or", "claim_or", "spreading_or"],
            "spreading_of_claim_qs": ["spreading_of_claim_qs", "claim_qs", "spreading_qs"],
            "spreading_of_claim_spl": ["spreading_of_claim_surplus", "spreading_of_claim_spl", "spreading_spl"],
            "spreading_of_claim_others": ["spreading_of_claim_others", "spreading_others", "claim_others"],
            "claim_qs_marsh_re_share": ["claim_quota_share_marsh_re_share", "claim_qs_marsh_re_share", "claim_qs_marsh"],
            "claim_spl_marsh_re_share": ["claim_surplus_marsh_re_share", "claim_spl_marsh_re_share", "claim_spl_marsh"],
            "claims_marein_share": ["claims_marein_share", "claim_marein_share", "marein_share"],
            "os_claims_100": ["outstanding_claims_100", "os_claims_100", "os_claim_100"],
            "os_claims_marsh_re_share": ["outstanding_claims_marsh_re_share", "os_claims_marsh_re_share", "os_marsh"],
            "os_claims_marein_share": ["outstanding_claims_marein_share", "os_claims_marein_share", "os_marein"],
            "note": ["note", "notes", "keterangan", "catatan", "remark", "remarks"]
        }

        rename_dict = {}
        for orig_col in df.columns:
            s_col = to_snake_case(str(orig_col))
            matched_target = None

            for target_col, syn_list in SYNONYMS.items():
                if s_col == target_col or s_col in syn_list:
                    matched_target = target_col
                    break

            if not matched_target:
                for target_col, syn_list in SYNONYMS.items():
                    if any(syn in s_col for syn in syn_list):
                        matched_target = target_col
                        break

            if matched_target:
                rename_dict[orig_col] = matched_target

        df.rename(columns=rename_dict, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 3. Filter Baris Valid
        for id_col in ["register_no", "policy_number"]:
            if id_col in df.columns:
                df[id_col] = df[id_col].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
                df[id_col] = df[id_col].replace(['nan', 'None', 'NaN', 'NaT', '', '<NA>'], None)

        df = df.dropna(subset=["register_no", "policy_number"], how="all")

        trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND\s*TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
        if "register_no" in df.columns:
            reg_str = df["register_no"].astype(str).str.upper().str.strip()
            df = df[~reg_str.str.match(trash_exact_pattern, na=False)]

        # 4. Bersihkan UW YEAR
        if "uw_year" in df.columns:
            def clean_uw_year(val):
                if pd.isna(val) or str(val).strip() in ['', 'None', 'nan', 'NaN']:
                    return None
                m = re.search(r'\d{4}', str(val))
                return m.group() if m else str(val).replace('.0', '').strip()
            df["uw_year"] = df["uw_year"].apply(clean_uw_year)

        # 5. Tanggal Parsing
        date_cols = ["dol", "period_of_insurance_start", "period_of_insurance_end"]
        for dcol in date_cols:
            if dcol in df.columns:
                df[dcol] = pd.to_datetime(df[dcol], errors='coerce', dayfirst=True)
                df[dcol] = df[dcol].dt.strftime('%Y-%m-%d %H:%M:%S').replace(['NaT', 'nan', 'NaN', 'None'], None)

        # 6. Set Periode & Override COB
        df['period'] = periode_lengkap
        if override_cob and str(override_cob).strip() and str(override_cob).strip().lower() != "string":
            df['cob'] = str(override_cob).strip().upper()

        # 7. Sinkronisasi Kolom Master
        for col in master_cols:
            if col not in df.columns:
                df[col] = None

        df_clean = df[master_cols].copy()

        # 8. Sanitasi Angka & Nominal
        num_cols = [
            "claim_100", "cedants_share_percent", "cedants_share_in_amount",
            "spreading_of_claim_or", "spreading_of_claim_qs", "spreading_of_claim_spl",
            "spreading_of_claim_others", "claim_qs_marsh_re_share", "claim_spl_marsh_re_share",
            "claims_marein_share", "os_claims_100", "os_claims_marsh_re_share", "os_claims_marein_share"
        ]
        for col in num_cols:
            if col in df_clean.columns:
                df_clean[col] = pd.to_numeric(
                    df_clean[col].astype(str).str.replace(',', '', regex=False).str.replace(' ', '', regex=False),
                    errors='coerce'
                ).fillna(0.0)

        # 9. Kolom NO Integer
        if "no" in df_clean.columns:
            df_clean["no"] = df_clean["no"].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df_clean["no"] = pd.to_numeric(df_clean["no"], errors='coerce')

        return df_clean.where(pd.notnull(df_clean), None).reset_index(drop=True)