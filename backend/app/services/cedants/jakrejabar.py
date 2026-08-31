import os
import re
import numpy as np
import pandas as pd
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import clean_dataframe_structure, to_snake_case


def format_id_column(val):
    """Membersihkan format ID/Nomor agar tidak menjadi .0 atau None"""
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (float, np.floating)):
        if np.isnan(val) or np.isinf(val):
            return None
        if val.is_integer():
            return f"{int(val)}"
        return f"{val:.0f}"
    val_str = str(val).strip()
    if val_str.lower() in ["nan", "none", "nat", "null", "<na>", ""]:
        return None
    return val_str[:-2] if val_str.endswith(".0") else val_str


def read_excel_smart(file_path: str, target_sheet: str) -> pd.DataFrame:
    """Membaca file excel dan mencari baris header tabel yang sebenarnya"""
    raw_df = pd.read_excel(file_path, sheet_name=target_sheet, header=None)
    if raw_df.empty:
        return pd.DataFrame()

    keywords = ["polis", "policy", "terjamin", "bank", "peserta", "klaim", "claim", "nomor", "sp", "skim", "no"]
    header_idx = 0
    for idx, row in raw_df.head(30).iterrows():
        row_str = " ".join(row.dropna().astype(str).str.lower())
        matched_count = sum(1 for kw in keywords if kw in row_str)
        if matched_count >= 2:
            header_idx = idx
            break

    df = pd.read_excel(file_path, sheet_name=target_sheet, skiprows=header_idx)
    return df


class JakreJabarETL:
    """ETL Jakre Jabar untuk Premi dan Klaim"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI.get("jakrejabar", [])
        
        # 1. Baca raw data dari excel
        try:
            df_raw = pd.read_excel(file_path, sheet_name=target_sheet, header=0)
        except Exception as e:
            print(f"[!] Gagal membaca file Excel: {e}")
            return pd.DataFrame(columns=master_cols)

        if df_raw.empty:
            return pd.DataFrame(columns=master_cols)

        # 2. Bersihkan struktur kolom awal menggunakan helper
        df_clean = clean_dataframe_structure(df_raw, is_askrida=False)

        # 3. Mapping Nama Kolom Persis Sesuai Hasil Clean Structure
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
        df_clean = df_clean.rename(columns=rename_mapping)
        df_clean = df_clean.loc[:, ~df_clean.columns.duplicated()].copy()

        # 4. Filter data valid (buang rekap / subtotal / baris petunjuk template)
        trash_regex = r'^\s*(TOTAL|JUMLAH|GRAND|SUBTOTAL|REKAP|SUMMARY|\(TEXT:.*\)|\(ANGKA:.*\)|0|NAN|NONE|-)\s*$'
        for col_check in ['nomor_sp', 'nama', 'nomor_pengajuan', 'bank']:
            if col_check in df_clean.columns:
                df_clean = df_clean[~df_clean[col_check].astype(str).str.upper().str.strip().str.match(trash_regex, na=False)]
                df_clean = df_clean[df_clean[col_check].notna() & (df_clean[col_check].astype(str).str.strip() != "")]
                break

        if 'no' in df_clean.columns:
            df_clean = df_clean[pd.to_numeric(df_clean['no'], errors='coerce').notnull()]

        # 5. Set Kolom Periode & Override COB
        df_clean['period'] = str(periode_lengkap).strip()
        if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
            df_clean['skim'] = override_cob.strip().upper()

        # 6. Sanitasi Kolom Tanggal (Datetime)
        date_cols = ['tgl_pengajuan', 'tgl_realisasi', 'tanggal_sp', 'bordero', 'tgl_jatuh_tempo']
        for dcol in date_cols:
            if dcol in df_clean.columns:
                df_clean[dcol] = pd.to_datetime(df_clean[dcol], errors='coerce', dayfirst=True)

        # 7. Sanitasi Kolom Uang / Rupiah (Float 2 Desimal)
        money_cols = [
            'plafond_kredit', 'nilai_penjaminan', 'ijp', 'fee_agenbroker', 'ijp_netto',
            'nilai_penjaminan_regaransi', 'ijp_regaransi', 'ijp_riu',
            'ri_comm_35', 'nett_ijp_riu'
        ]
        for mcol in money_cols:
            if mcol in df_clean.columns:
                cleaned_val = (
                    df_clean[mcol]
                    .astype(str)
                    .str.replace(r'[^\d.-]', '', regex=True)
                    .str.strip()
                )
                df_clean[mcol] = pd.to_numeric(cleaned_val, errors='coerce').fillna(0.0).astype(float).round(2)

        # 8. Sanitasi Kolom Persentase (Float 6 Desimal)
        percent_cols = [
            'persentase_premi_disesikan_qs',
            'persentase_premi_riureins',
            'persentase_premi_riuall'
        ]
        for pcol in percent_cols:
            if pcol in df_clean.columns:
                cleaned_pct = (
                    df_clean[pcol]
                    .astype(str)
                    .str.replace(r'[^\d.-]', '', regex=True)
                    .str.strip()
                )
                num_val = pd.to_numeric(cleaned_pct, errors='coerce').fillna(0.0).astype(float)
                num_val = np.where(num_val > 1.0, num_val / 100.0, num_val)
                df_clean[pcol] = pd.Series(num_val, index=df_clean.index).round(6)

        # 9. Sanitasi Kolom Integer
        df_clean['no'] = range(1, len(df_clean) + 1)
        df_clean['no'] = df_clean['no'].astype('int64')

        if 'jangka_waktu' in df_clean.columns:
            cleaned_jw = df_clean['jangka_waktu'].astype(str).str.replace(r'[^\d]', '', regex=True).str.strip()
            df_clean['jangka_waktu'] = pd.to_numeric(cleaned_jw, errors='coerce').fillna(0).astype('int32')

        # 10. Sanitasi Kolom Teks
        text_cols = ['nomor_pengajuan', 'nomor_sp', 'nama', 'checker', 'alamat', 'bank', 'skim', 'kota', 'sektor', 'period']
        for tcol in text_cols:
            if tcol in df_clean.columns:
                df_clean[tcol] = df_clean[tcol].apply(format_id_column)
                df_clean[tcol] = df_clean[tcol].astype(str).str.upper().str.strip()
                df_clean[tcol] = df_clean[tcol].replace(['NAN', 'NONE', 'NULL', '<NA>', 'NAT', ''], None)

        # 11. Pastikan Urutan Sesuai Master Columns
        if master_cols:
            for col in master_cols:
                if col not in df_clean.columns:
                    df_clean[col] = np.nan
            df_result = df_clean[master_cols].copy()
        else:
            df_result = df_clean.copy()

        return df_result.reset_index(drop=True)

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
            'polis': 'policy_number',
            'id_terjamin': 'id_terjamin',
            'nama_produk': 'cob_type_of_cover',
            'cob': 'cob_type_of_cover',
            'nama_bank': 'bank_name',
            'bank': 'bank_name',
            'insured_name_terjamin': 'insured_name',
            'nama_peserta': 'insured_name',
            'nama_terjamin': 'insured_name',
            'nama': 'insured_name',
            'periode_mulai_kredit': 'period_of_insurance_start',
            'periode_berkahirnya_kredit': 'period_of_insurance_end',
            'periode_berakhirnya_kredit': 'period_of_insurance_end',
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
            'periode_cession_bordereaux': 'cession_period',
        }
        df.rename(columns=alias_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 1. Buang baris kosong asli terlebih dahulu
        df = df.dropna(how='all')

        # 2. Hapus baris petunjuk/template (misal '(TEXT: XXX)'), total, rekap
        trash_regex = r'^\s*(TOTAL|JUMLAH|GRAND|SUBTOTAL|REKAP|SUMMARY|\(TEXT:.*\)|\(ANGKA:.*\)|0|NAN|NONE|-)\s*$'
        for col_id in ['policy_number', 'insured_name', 'id_terjamin', 'bank_name']:
            if col_id in df.columns:
                df = df[~df[col_id].astype(str).str.upper().str.strip().str.match(trash_regex, na=False)]
                df = df[df[col_id].notna() & (df[col_id].astype(str).str.strip() != "")]
                break

        # 3. Baru isi period & cob setelah baris header/sampah bersih
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
                df[col] = df[col].replace(['NAN', 'NONE', 'NULL', '<NA>', 'NAT', ''], np.nan)

        num_cols = [
            'sum_insured', 'claim_amount_100', 'our_share_percent', 'our_share_amount',
            'reinsurer_share_percent', 'reinsurance_claim', 'paid_claim_indore'
        ]
        for ncol in num_cols:
            if ncol in df.columns:
                cleaned = df[ncol].astype(str).str.replace(r'[%, ]', '', regex=True).str.strip()
                df[ncol] = pd.to_numeric(cleaned, errors='coerce').fillna(0.0).round(2)

        # Penomoran baris rapi mulai dari 1
        df['no'] = range(1, len(df) + 1)

        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = np.nan
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        return df_clean.reset_index(drop=True)