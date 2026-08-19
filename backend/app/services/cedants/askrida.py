import os
import re
import numpy as np
import pandas as pd
from app.services.cedants.base import BaseCedantETL
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, validate_dates


def match_pattern(patterns: list, text: str) -> bool:
    """Helper untuk mencocokkan kata menggunakan regex berbatas kata (word boundary)."""
    return any(re.search(rf"\b{p}\b", text, re.IGNORECASE) for p in patterns)


class AskridaETL(BaseCedantETL):
    """Modul khusus pemrosesan data Askrida (SOA Premi Multi-Sheet & Klaim Kredit)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        excel_file = pd.ExcelFile(file_path)
        all_data = []

        sheets_to_process = excel_file.sheet_names
        if target_sheet and target_sheet.lower().strip() != "all":
            sheets_to_process = [s for s in excel_file.sheet_names if s.lower().strip() == target_sheet.lower().strip()]

        for sheet_name in sheets_to_process:
            sheet_clean = sheet_name.strip().upper()
            if "QS" not in sheet_clean or ("PREMI" not in sheet_clean and "PREMIUM" not in sheet_clean):
                continue

            match_tw = re.search(r'TW\s*([1-4])', sheet_name, re.IGNORECASE) or re.search(r'TW\s*([1-4])', file_path, re.IGNORECASE)
            match_tahun = re.search(r'(20\d{2})', sheet_name) or re.search(r'(20\d{2})', file_path)

            tw_val = match_tw.group(1) if match_tw else "1"
            tahun_val = match_tahun.group(1) if match_tahun else "2016"
            tahun_num = int(tahun_val)
            reff_bordereaux = f"SOA {tahun_val} TW {tw_val}"

            df_raw = pd.read_excel(file_path, sheet_name=sheet_name, header=None)

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

            if "usia_saat_akad_tahun" in df_data.columns:
                df_data["usia_saat_akad_tahun"] = (
                    df_data["usia_saat_akad_tahun"]
                    .astype(str)
                    .str.replace(r'\.0$', '', regex=True)
                    .str.strip()
                    .replace(['nan', 'None', 'NaN', 'NaT', '<NA>', ''], np.nan)
                )

            df_data["cob"] = "CREDIT"
            df_data["reff_of_no_bordereaux"] = reff_bordereaux
            df_data["period"] = periode_lengkap

            master_cols = MASTER_COLUMNS_PREMI["askrida"]
            for col_name in master_cols:
                if col_name not in df_data.columns:
                    df_data[col_name] = np.nan

            df_data = df_data[master_cols]
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
        excel_file = pd.ExcelFile(file_path)
        all_sheets = excel_file.sheet_names

        # 1. Tentukan Sheet Target
        if target_sheet and target_sheet.lower().strip() != "all":
            matched_sheets = [s for s in all_sheets if s.lower().strip() == target_sheet.lower().strip()]
        else:
            matched_sheets = [s for s in all_sheets if 'klaim' in s.lower() or 'claim' in s.lower()]

        if not matched_sheets:
            matched_sheets = all_sheets[:1]

        TARGET_COLUMNS = [
            'no', 'cob', 'claim_reff_number', 'policy_number', 'reff_of_no_bordereaux',
            'nama_bank_tertanggung', 'insured_name', 'insured_amount', 'period_of_insurance_start',
            'period_of_insurance_end', 'waktu_pertanggungan_bulan', 'uw_year', 'date_of_loss',
            'cause_of_loss', 'currency', 'total_incurred_claim', 'paid_claims_reins_share',
            'paid_claims_indore_share', 'note', 'period'
        ]

        list_df = []
        for sheet_name in matched_sheets:
            df_raw = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
            if df_raw.empty:
                continue

            # Deteksi Baris Header Utama
            header_idx = None
            for idx in range(min(25, len(df_raw))):
                row_str = " ".join([str(x).upper() for x in df_raw.iloc[idx].values if pd.notna(x)])
                if any(k in row_str for k in ["POLICY NUMBER", "POLICY_NUMBER", "NO POLIS", "NO KLAIM", "TERTANGGUNG", "NAME OF INSURED"]):
                    header_idx = idx
                    break

            if header_idx is None:
                header_idx = 5

            # Penggabungan Header Bertingkat (Top Header + Sub Header)
            row_top = df_raw.iloc[header_idx].ffill().fillna('')
            row_sub = df_raw.iloc[header_idx + 1].fillna('') if (header_idx + 1) < len(df_raw) else pd.Series([''] * df_raw.shape[1])
            
            sub_str = " ".join([str(x).upper() for x in row_sub.values if pd.notna(x)])
            if any(k in sub_str for k in ["100%", "REINDO", "INDORE", "RIU", "SHARE", "RUPIAH", "RP", "USD"]):
                df_data = df_raw.iloc[header_idx + 2:].copy().reset_index(drop=True)
            else:
                df_data = df_raw.iloc[header_idx + 1:].copy().reset_index(drop=True)
                row_sub = pd.Series([''] * df_raw.shape[1])

            combined_headers = []
            for col_i in range(df_raw.shape[1]):
                t_val = re.sub(r'\s+', ' ', str(row_top.iloc[col_i]).strip().upper())
                s_val = re.sub(r'\s+', ' ', str(row_sub.iloc[col_i]).strip().upper())
                
                t_val = "" if "UNNAMED" in t_val or t_val in ["NAN", "NONE"] else t_val
                s_val = "" if "UNNAMED" in s_val or s_val in ["NAN", "NONE"] else s_val

                if t_val and s_val:
                    combined_headers.append(f"{t_val}_{s_val}")
                elif s_val:
                    combined_headers.append(s_val)
                else:
                    combined_headers.append(t_val)

            df_data.columns = combined_headers

            # Pemetaan Kolom Universal
            rename_map = {}
            for col in df_data.columns:
                c = str(col).lower().strip()

                if any(k in c for k in ["reindo", "indore", "riu", "paid_claim_1"]):
                    rename_map[col] = "paid_claims_indore_share"
                elif any(k in c for k in ["100%", "100 percent", "100percent", "reinsurer", "paid_claim"]):
                    if "indore" not in c and "reindo" not in c:
                        rename_map[col] = "paid_claims_reins_share"
                elif any(k in c for k in ["date of loss", "dol", "tanggal klaim", "tanggal kejadian"]):
                    rename_map[col] = "date_of_loss"
                elif any(k in c for k in ["cause", "penyebab"]):
                    rename_map[col] = "cause_of_loss"
                elif any(k in c for k in ["gross", "total incurred", "claim amount", "total klaim", "beban klaim"]):
                    rename_map[col] = "total_incurred_claim"
                elif any(k in c for k in ["period start", "period st", "periode st", "incept", "akad"]):
                    rename_map[col] = "period_of_insurance_start"
                elif any(k in c for k in ["period end", "period en", "periode en", "expiry"]):
                    rename_map[col] = "period_of_insurance_end"
                elif any(k in c for k in ["insured amount", "nilai pertanggungan", "tsi", "sum insured"]):
                    rename_map[col] = "insured_amount"
                elif any(k in c for k in ["the insured", "nama bank", "bank", "cedant"]):
                    rename_map[col] = "nama_bank_tertanggung"
                elif any(k in c for k in ["name of insured", "tertanggung", "debitur", "insured name"]):
                    rename_map[col] = "insured_name"
                elif any(k in c for k in ["no klaim", "claim no", "claim reff", "reff number"]):
                    rename_map[col] = "claim_reff_number"
                elif any(k in c for k in ["policy", "polis"]):
                    rename_map[col] = "policy_number"
                elif any(k in c for k in ["bordereaux", "bordero", "no bord"]):
                    rename_map[col] = "reff_of_no_bordereaux"
                elif any(k in c for k in ["bulan", "waktu", "tenor", "masa"]):
                    rename_map[col] = "waktu_pertanggungan_bulan"
                elif any(k in c for k in ["uw", "uy", "tahun uw"]):
                    rename_map[col] = "uw_year"
                elif any(k in c for k in ["curr", "valuta", "mata uang"]):
                    rename_map[col] = "currency"
                elif c in ["no", "nr", "no.", "nr."]:
                    rename_map[col] = "no"
                elif any(k in c for k in ["note", "remarks", "catatan", "keterangan"]):
                    rename_map[col] = "note"

            df_clean = df_data.rename(columns=rename_map)

            # Resolusi Kolom Duplikat
            unique_cols = {}
            for col_name in df_clean.columns:
                if col_name not in unique_cols:
                    unique_cols[col_name] = df_clean[col_name]
                else:
                    if df_clean[col_name].notna().sum() > unique_cols[col_name].notna().sum():
                        unique_cols[col_name] = df_clean[col_name]
            df_clean = pd.DataFrame(unique_cols)

            # Forward-fill data merged vertikal
            for m_col in ['reff_of_no_bordereaux', 'uw_year', 'period_of_insurance_start', 'period_of_insurance_end', 'nama_bank_tertanggung']:
                if m_col in df_clean.columns:
                    df_clean[m_col] = df_clean[m_col].ffill()

            # Filter data kosong & baris total
            if 'policy_number' in df_clean.columns:
                df_clean = df_clean.dropna(subset=['policy_number'])
                p_str = df_clean['policy_number'].astype(str).str.strip().str.upper()
                df_clean = df_clean[~p_str.str.contains(r'TOTAL|^0$|^NAN$|^NONE$', regex=True, na=False)]

            if not df_clean.empty:
                list_df.append(df_clean)

        if not list_df:
            return pd.DataFrame(columns=TARGET_COLUMNS)

        df_final = pd.concat(list_df, ignore_index=True)
        df_final['cob'] = "CREDIT"
        df_final['period'] = periode_lengkap

        for col_name in TARGET_COLUMNS:
            if col_name not in df_final.columns:
                df_final[col_name] = None

        df_final = df_final[TARGET_COLUMNS].copy()

        # -------------------------------------------------------------
        # SANITASI TIPE DATA SECARA PRESISI
        # -------------------------------------------------------------
        
        # 1. Kolom Identitas (policy_number, no)
        for id_col in ['policy_number', 'no']:
            if id_col in df_final.columns:
                df_final[id_col] = df_final[id_col].apply(
                    lambda x: f"{int(x)}" if isinstance(x, (int, float)) and pd.notna(x) and not np.isnan(x) and x % 1 == 0
                    else (f"{x:.0f}" if isinstance(x, float) and pd.notna(x) and not np.isnan(x) else str(x if pd.notna(x) else ""))
                )
                df_final[id_col] = df_final[id_col].str.replace(r'\.0$', '', regex=True).str.strip()
                df_final[id_col] = df_final[id_col].replace(['nan', 'None', 'NaN', '0', ''], None)

        # 2. Claim Reff Number (NULL jika kosong/0)
        if 'claim_reff_number' in df_final.columns:
            df_final['claim_reff_number'] = df_final['claim_reff_number'].astype(str).str.strip()
            df_final['claim_reff_number'] = df_final['claim_reff_number'].replace(
                ['nan', 'None', 'NaN', '0', '0.0', '00', ''], None
            )

        # 3. Kolom Tanggal (Start, End, Loss)
        date_cols = ['period_of_insurance_start', 'period_of_insurance_end', 'date_of_loss']
        for col in date_cols:
            if col in df_final.columns:
                df_final[col] = df_final[col].replace(['0', '0.0', 0, 0.0, 'nan', 'NaN'], np.nan)
                df_final[col] = pd.to_datetime(df_final[col], errors='coerce')

        # 4. Kolom Uang / Nominal Float Murni
        numeric_cols = [
            'insured_amount', 'total_incurred_claim', 
            'paid_claims_reins_share', 'paid_claims_indore_share'
        ]
        for col in numeric_cols:
            if col in df_final.columns:
                if df_final[col].dtype == object:
                    df_final[col] = (
                        df_final[col]
                        .astype(str)
                        .str.replace(r'[^\d.-]', '', regex=True)
                        .replace('', '0')
                    )
                df_final[col] = pd.to_numeric(df_final[col], errors='coerce').fillna(0.0)

        # 5. Kolom Integer (Didefinisikan SEBELUM exclude_from_str)
        int_cols = ['waktu_pertanggungan_bulan', 'uw_year']
        for col in int_cols:
            if col in df_final.columns:
                df_final[col] = df_final[col].replace(['0', '0.0', 0, 0.0, 'nan', 'NaN', '', None], np.nan)
                df_final[col] = pd.to_numeric(df_final[col], errors='coerce')

        # 6. Kolom Teks / Deskripsi (Dijalankan SETELAH date_cols, numeric_cols, dan int_cols siap)
        exclude_from_str = date_cols + numeric_cols + int_cols + ['policy_number', 'claim_reff_number', 'no']
        str_target_cols = [c for c in df_final.columns if c not in exclude_from_str]

        for col in str_target_cols:
            df_final[col] = df_final[col].astype(str).str.upper().str.strip()
            df_final[col] = df_final[col].replace(['NAN', 'NONE', 'NULL', '<NA>', '0', '0.0', ''], None)

        df_final = df_final.where(pd.notnull(df_final), None)
        return df_final