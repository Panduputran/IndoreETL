import re
import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import to_snake_case


def format_id_column(val):
    """Membersihkan ID/Nomor agar tidak berubah format float/eksponen"""
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


def read_excel_smart(file_path: str, target_sheet: str) -> pd.DataFrame:
    """Membaca sheet excel dan mencari baris header yang paling sesuai secara otomatis"""
    # Baca raw terlebih dahulu tanpa asumsi header
    raw_df = pd.read_excel(file_path, sheet_name=target_sheet, header=None)
    if raw_df.empty:
        return pd.DataFrame()

    # Cari baris yang mengandung kata kunci header kolom
    keywords = ["polis", "policy", "terjamin", "bank", "peserta", "klaim", "claim", "nomor", "sp", "skim"]
    header_idx = 0
    for idx, row in raw_df.head(25).iterrows():
        row_str = " ".join(row.dropna().astype(str).str.lower())
        if sum(1 for kw in keywords if kw in row_str) >= 2:
            header_idx = idx
            break

    # Muat ulang dataframe dengan baris header yang ditemukan
    df = pd.read_excel(file_path, sheet_name=target_sheet, skiprows=header_idx)
    return df


class JakreJabarETL:
    """ETL Jakre Jabar untuk Premi dan Klaim"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI.get("jakrejabar", [])
        df = read_excel_smart(file_path, target_sheet)
        if df.empty:
            return pd.DataFrame(columns=master_cols)

        df.columns = [to_snake_case(str(col)) for col in df.columns]

        rename_mapping = {
            'unnamed_28': 'tgl_jatuh_tempo',
            'unnamed_29': 'tgl_jatuh_tempo',
            'tgl_jt_tempo': 'tgl_jatuh_tempo',
            'fee_agen_broker': 'fee_agenbroker',
            'nilai_penjaminan_re_garansi': 'nilai_penjaminan_regaransi',
            'ijp_re_garansi': 'ijp_regaransi',
            'persentase_premi_disesikan_qspercent': 'persentase_premi_disesikan_qs',
            'persentase_premi_riu_reins': 'persentase_premi_riureins',
            'persentase_premi_riu_all': 'persentase_premi_riuall',
            'r_i_comm_35percent': 'ri_comm_35',
            'r_i_comm_35': 'ri_comm_35',
        }
        df.rename(columns=rename_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # Hapus baris summary/total
        trash_regex = r'^\s*(TOTAL|JUMLAH|GRAND|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE|-)\s*$'
        for col_check in ['nomor_sp', 'nama', 'nomor_pengajuan']:
            if col_check in df.columns:
                df = df[~df[col_check].astype(str).str.upper().str.strip().str.match(trash_regex, na=False)]
                break

        # Buang baris yang benar-benar kosong di semua kolom penting
        df = df.dropna(how='all')

        df['period'] = periode_lengkap
        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            df['skim'] = override_cob.strip().upper()

        date_cols = ['tgl_pengajuan', 'tgl_realisasi', 'tanggal_sp', 'bordero', 'tgl_jatuh_tempo']
        for dcol in date_cols:
            if dcol in df.columns:
                df[dcol] = pd.to_datetime(df[dcol], errors='coerce', dayfirst=True)

        string_id_cols = ['nomor_pengajuan', 'nomor_sp', 'nama', 'checker', 'alamat', 'bank', 'skim', 'kota', 'sektor']
        for scol in string_id_cols:
            if scol in df.columns:
                df[scol] = df[scol].apply(format_id_column)
                df[scol] = df[scol].astype(str).str.upper().str.strip()
                df[scol] = df[scol].replace(['NAN', 'NONE', 'NULL', '<NA>', 'NAT', ''], np.nan)

        money_cols = [
            'plafond_kredit', 'nilai_penjaminan', 'ijp', 'fee_agenbroker', 'ijp_netto',
            'nilai_penjaminan_regaransi', 'ijp_regaransi', 'ijp_riu',
            'ri_comm_35', 'nett_ijp_riu'
        ]
        for mcol in money_cols:
            if mcol in df.columns:
                cleaned = df[mcol].astype(str).str.replace(r'[%, ]', '', regex=True).str.strip()
                df[mcol] = pd.to_numeric(cleaned, errors='coerce').fillna(0.0).round(2)

        percent_cols = ['persentase_premi_disesikan_qs', 'persentase_premi_riureins', 'persentase_premi_riuall']
        for pcol in percent_cols:
            if pcol in df.columns:
                cleaned = df[pcol].astype(str).str.replace(r'[%, ]', '', regex=True).str.strip()
                num_val = pd.to_numeric(cleaned, errors='coerce').fillna(0.0)
                num_val = np.where(num_val > 1.0, num_val / 100.0, num_val)
                df[pcol] = pd.Series(num_val, index=df.index).round(6)

        df['no'] = range(1, len(df) + 1)

        if 'jangka_waktu' in df.columns:
            df['jangka_waktu'] = pd.to_numeric(df['jangka_waktu'], errors='coerce').fillna(0).astype('int32')

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
        master_cols = MASTER_COLUMNS_CLAIM.get("jakrejabar", [])
        df = read_excel_smart(file_path, target_sheet)
        if df.empty:
            return pd.DataFrame(columns=master_cols)

        df.columns = [to_snake_case(str(col)) for col in df.columns]

        alias_mapping = {
            'no_polis_no_sp': 'policy_number',
            'no_polis': 'policy_number',
            'nomor_sp': 'policy_number',
            'nomor_polis': 'policy_number',
            'id_terjamin': 'id_terjamin',
            'nama_produk': 'cob_type_of_cover',
            'nama_bank': 'bank_name',
            'bank': 'bank_name',
            'insured_name_terjamin': 'insured_name',
            'nama_peserta': 'insured_name',
            'nama': 'insured_name',
            'nama_terjamin': 'insured_name',
            'periode_mulai_kredit': 'period_of_insurance_start',
            'periode_berkahirnya_kredit': 'period_of_insurance_end',
            'tgl_mulai': 'period_of_insurance_start',
            'tgl_akhir': 'period_of_insurance_end',
            'underwriting_year': 'uw_year',
            'tahun_uw': 'uw_year',
            'nilai_kredit_penjaminan_sum_insured': 'sum_insured',
            'nilai_kreditpenjaminan_sum_insured': 'sum_insured',
            'sum_insured': 'sum_insured',
            'nilai_klaim_100': 'claim_amount_100',
            'nilai_klaim_100percent': 'claim_amount_100',
            'klaim_100': 'claim_amount_100',
            'klaim_100percent': 'claim_amount_100',
            'retensi_sendiri_asuransi_xxx': 'our_share_percent',
            'klaim_bagian_asuransi_xxx': 'our_share_amount',
            'bagian_reasuradur': 'reinsurer_share_percent',
            'klaim_bagian_reasuradur': 'reinsurance_claim',
            'klaim_dibayar_indonesiare': 'paid_claim_indore',
            'periode_cession_bordereaux': 'cession_period'
        }
        df.rename(columns=alias_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # PERBAIKAN 1: Tambahkan pattern XXX, (TEXT: XXX), dsb ke trash_regex
        trash_regex = r'^\s*(\(TEXT:\s*XXX\)|TEXT:\s*XXX|XXX|TOTAL|JUMLAH|GRAND|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE|-)\s*$'
        
        for col_id in ['policy_number', 'insured_name', 'id_terjamin']:
            if col_id in df.columns:
                # Buang jika cocok dengan regex trash
                df = df[~df[col_id].astype(str).str.upper().str.strip().str.match(trash_regex, na=False)]
                # Buang juga jika isinya mengandung kata "XXX"
                df = df[~df[col_id].astype(str).str.upper().str.contains('XXX', na=False)]
                df = df[df[col_id].notna() & (df[col_id].astype(str).str.strip() != "")]
                break

        df['period'] = periode_lengkap
        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            df['cob_type_of_cover'] = override_cob.strip().upper()

        date_cols = ['period_of_insurance_start', 'period_of_insurance_end']
        for dcol in date_cols:
            if dcol in df.columns:
                df[dcol] = pd.to_datetime(df[dcol], errors='coerce')

        string_id_cols = ['policy_number', 'id_terjamin', 'cob_type_of_cover', 'bank_name', 'insured_name', 'uw_year', 'cession_period', 'period']
        for col in string_id_cols:
            if col in df.columns:
                df[col] = df[col].apply(format_id_column)
                df[col] = df[col].astype(str).str.upper().str.strip()
                df[col] = df[col].replace(['NAN', 'NONE', 'NULL', '<NA>', 'NAT', '', '(TEXT: XXX)', 'TEXT: XXX', 'XXX'], np.nan)

        num_cols = [
            'sum_insured', 'claim_amount_100', 'our_share_percent', 'our_share_amount',
            'reinsurer_share_percent', 'reinsurance_claim', 'paid_claim_indore'
        ]
        for ncol in num_cols:
            if ncol in df.columns:
                cleaned = df[ncol].astype(str).str.replace(r'[%, ]', '', regex=True).str.strip()
                df[ncol] = pd.to_numeric(cleaned, errors='coerce').fillna(0.0).round(2)

        # PERBAIKAN 2: Generate 'no' dan reset index SETELAH semua baris kotor dibuang
        df = df.reset_index(drop=True)
        df['no'] = range(1, len(df) + 1)

        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = np.nan
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        return df_clean.reset_index(drop=True)