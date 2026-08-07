import re
import numpy as np
import pandas as pd
from app.services.cedants.base import BaseCedantETL
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import validate_dates, safe_parse_single_date

class AskridaETL(BaseCedantETL):
    """Modul khusus pemrosesan data Askrida (SOA Credit Multi-Sheet)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        excel_file = pd.ExcelFile(file_path)
        all_data = []

        # Pindai sheet target (atau seluruh sheet QS jika target_sheet bernilai 'all')
        sheets_to_process = excel_file.sheet_names
        if target_sheet and target_sheet.lower().strip() != "all":
            sheets_to_process = [s for s in excel_file.sheet_names if s.lower().strip() == target_sheet.lower().strip()]

        for sheet_name in sheets_to_process:
            sheet_clean = sheet_name.strip().upper()
            
            # Abaikan jika bukan sheet QS/PREMI
            if "QS" not in sheet_clean or ("PREMI" not in sheet_clean and "PREMIUM" not in sheet_clean):
                continue

            match_tw = re.search(r'TW\s*([1-4])', sheet_name, re.IGNORECASE) or re.search(r'TW\s*([1-4])', file_path, re.IGNORECASE)
            match_tahun = re.search(r'(20\d{2})', sheet_name) or re.search(r'(20\d{2})', file_path)

            tw_val = match_tw.group(1) if match_tw else "1"
            tahun_val = match_tahun.group(1) if match_tahun else "2016"
            tahun_num = int(tahun_val)
            reff_bordereaux = f"SOA {tahun_val} TW {tw_val}"

            df_raw = pd.read_excel(file_path, sheet_name=sheet_name, header=None)

            # Cari baris header utama
            header_idx = None
            for idx in range(min(20, len(df_raw))):
                row_str = " ".join([str(x).upper() for x in df_raw.iloc[idx].values if pd.notna(x)])
                if any(k in row_str for k in ["POLICY NUMBER", "POLICY_NUMBER", "POLIS", "NAME OF INSURED", "POLICY DATE", "POLICY START"]):
                    header_idx = idx
                    break

            if header_idx is None:
                header_idx = 8 if tahun_num <= 2015 else 5

            row_top = df_raw.iloc[header_idx].ffill().fillna('')
            row_sub_str = " ".join([str(x).upper() for x in df_raw.iloc[header_idx + 1].values if pd.notna(x)])
            row_level_3_str = ""
            if (header_idx + 2) < len(df_raw):
                row_level_3_str = " ".join([str(x).upper() for x in df_raw.iloc[header_idx + 2].values if pd.notna(x)])

            if any(k in row_level_3_str for k in ["SUM", "PREMIUM", "PREMI", "NETTO", "COMM"]):
                df_data = df_raw.iloc[header_idx + 3:].copy().reset_index(drop=True)
                row_sub_1 = df_raw.iloc[header_idx + 1].ffill().fillna('')
                row_sub_2 = df_raw.iloc[header_idx + 2].fillna('')
                row_sub = (row_sub_1.astype(str) + " " + row_sub_2.astype(str)).str.strip()
            elif any(k in row_sub_str for k in ["SUM", "PREMIUM", "PREMI", "NETTO", "COMM", "REINSURER", "REINDO"]):
                df_data = df_raw.iloc[header_idx + 2:].copy().reset_index(drop=True)
                row_sub = df_raw.iloc[header_idx + 1].fillna('')
            else:
                df_data = df_raw.iloc[header_idx + 1:].copy().reset_index(drop=True)
                row_sub = pd.Series([""] * df_raw.shape[1])

            combined_headers = []
            for col_i in range(df_raw.shape[1]):
                top_val = re.sub(r'\s+', ' ', str(row_top.iloc[col_i]).strip().upper())
                sub_val = re.sub(r'\s+', ' ', str(row_sub.iloc[col_i]).strip().upper())

                top_val = "" if "UNNAMED" in top_val or top_val in ["NAN", "NONE"] else top_val
                sub_val = "" if "UNNAMED" in sub_val or sub_val in ["NAN", "NONE"] else sub_val

                prefix = ""
                if "100" in top_val or "REINSURER" in top_val:
                    prefix = "REINSURER100_"
                elif "REINDO" in top_val:
                    prefix = "REINDO_"

                full_h = f"{prefix}{sub_val}" if sub_val else f"{prefix}{top_val}"
                combined_headers.append(full_h)

            df_data.columns = combined_headers

            rename_map = {}
            for col in df_data.columns:
                col_u = str(col).upper()

                if col_u.startswith("REINDO_"):
                    if "SUM" in col_u or "INSURED" in col_u or "TSI" in col_u: rename_map[col] = "reindo_sum_insured"
                    elif "PREM" in col_u: rename_map[col] = "premi_indore_share"
                    elif "COMM" in col_u: rename_map[col] = "reindo_ri_comm"
                    elif "NET" in col_u: rename_map[col] = "reindo_netto"
                elif col_u.startswith("REINSURER100_"):
                    if "SUM" in col_u or "INSURED" in col_u or "TSI" in col_u: rename_map[col] = "100_reinsurer_sum_insured"
                    elif "PREM" in col_u: rename_map[col] = "premi_reinsurer_share"
                    elif "COMM" in col_u: rename_map[col] = "100_reinsurer_ri_comm"
                    elif "NET" in col_u: rename_map[col] = "100_reinsurer_netto"
                else:
                    if col_u in ["NR", "NO", "NR.", "NO."]: rename_map[col] = "no"
                    elif "LAHIR" in col_u or "BIRTH" in col_u: rename_map[col] = "tanggal_lahir"
                    elif "POLICY DATE" in col_u or "POLICY_DATE" in col_u or "POLICY START" in col_u or "AKAD" in col_u: rename_map[col] = "tanggal_akad"
                    elif "PERIOD START" in col_u or "PERIOD ST" in col_u or "PERIODE ST" in col_u or "INCEPT" in col_u or "START" in col_u: rename_map[col] = "period_of_insurance_start"
                    elif "END" in col_u or "EXPIRY" in col_u or "PERIOD EN" in col_u or "PERIODE EN" in col_u: rename_map[col] = "period_of_insurance_end"
                    elif "POLICY" in col_u or "POLIS" in col_u: rename_map[col] = "policy_number"
                    elif "THE_INSURED" in col_u or "THE INSURED" in col_u or "BANK" in col_u or "CEDANT" in col_u: rename_map[col] = "nama_bank_tertanggung"
                    elif "NAME_OF_INSURED" in col_u or "NAME OF INSURED" in col_u or "TERTANGGUNG" in col_u: rename_map[col] = "insured_name"
                    elif "AGE" in col_u or "USIA" in col_u: rename_map[col] = "usia_saat_akad_tahun"
                    elif "UY" in col_u or "UW" in col_u: rename_map[col] = "uw_year"
                    elif "CURR" in col_u: rename_map[col] = "currency"
                    elif "AMOUNT" in col_u or "PERTANGGUNGAN" in col_u or "TSI" in col_u: rename_map[col] = "nilai_pertanggungan"
                    elif "PREMIUM" in col_u or "PREMI" in col_u: rename_map[col] = "premi_original"

            df_data.rename(columns=rename_map, inplace=True)
            df_data = df_data.loc[:, ~df_data.columns.duplicated()]

            # Sanitasi Usia
            if "usia_saat_akad_tahun" in df_data.columns:
                df_data["usia_saat_akad_tahun"] = (
                    df_data["usia_saat_akad_tahun"]
                    .astype(str)
                    .str.replace(r'\.0$', '', regex=True)
                    .str.strip()
                    .replace(['nan', 'None', 'NaN', 'NaT', '<NA>', ''], np.nan)
                )

            # Assign Default Metadata
            df_data["cob"] = "CREDIT"
            df_data["reff_of_no_bordereaux"] = reff_bordereaux
            df_data["period"] = periode_lengkap

            master_cols = MASTER_COLUMNS_PREMI["askrida"]
            for col_name in master_cols:
                if col_name not in df_data.columns:
                    df_data[col_name] = np.nan

            df_data = df_data[master_cols]

            # Filter Trash & Rekap
            df_data = df_data.dropna(subset=["policy_number", "insured_name"], how="all")
            trash_exact_pattern = r'^\s*(TOTAL|JUMLAH|GRAND TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            
            p_str = df_data["policy_number"].astype(str).str.upper().str.strip()
            name_str = df_data["insured_name"].astype(str).str.upper().str.strip()
            
            df_data = df_data[~p_str.str.match(trash_exact_pattern, na=False)]
            df_data = df_data[~name_str.str.match(trash_exact_pattern, na=False)]

            df_data = df_data.dropna(subset=["tanggal_akad", "period_of_insurance_start"], how="all")

            if not df_data.empty:
                all_data.append(df_data)

        if not all_data:
            return pd.DataFrame(columns=MASTER_COLUMNS_PREMI["askrida"])

        return pd.concat(all_data, ignore_index=True)

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        # Template klaim Askrida bila nanti dikembangkan
        master_cols = MASTER_COLUMNS_CLAIM.get("askrida", MASTER_COLUMNS_PREMI["askrida"])
        return pd.DataFrame(columns=master_cols)