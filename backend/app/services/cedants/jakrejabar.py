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


class JakreJabarETL:
    """Modul khusus pemrosesan data PT Jaminan Kredit Daerah Jawa Barat (Premi & Klaim)"""

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_PREMI.get("jakrejabar", [])
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
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

        # Filter baris valid
        if 'nomor_sp' in df.columns:
            df = df.dropna(subset=['nomor_sp'])
            trash_regex = r'^\s*(TOTAL|JUMLAH|GRAND|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE|-)\s*$'
            df = df[~df['nomor_sp'].astype(str).str.upper().str.strip().str.match(trash_regex, na=False)]

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
                cleaned_val = (
                    df[mcol]
                    .astype(str)
                    .str.replace('%', '', regex=False)
                    .str.replace(',', '', regex=False)
                    .str.replace(' ', '', regex=False)
                    .str.strip()
                )
                df[mcol] = pd.to_numeric(cleaned_val, errors='coerce').fillna(0.0).round(2)

        percent_cols = ['persentase_premi_disesikan_qs', 'persentase_premi_riureins', 'persentase_premi_riuall']
        for pcol in percent_cols:
            if pcol in df.columns:
                cleaned_pct = df[pcol].astype(str).str.replace('%', '', regex=False).str.replace(',', '', regex=False).str.strip()
                num_val = pd.to_numeric(cleaned_pct, errors='coerce').fillna(0.0)
                num_val = np.where(num_val > 1.0, num_val / 100.0, num_val)
                df[pcol] = pd.Series(num_val, index=df.index).round(6)

        # Cast no secara aman (jika NaN diisi urutan index + 1)
        if 'no' in df.columns:
            clean_no = df['no'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df['no'] = pd.to_numeric(clean_no, errors='coerce').fillna(pd.Series(range(1, len(df) + 1), index=df.index)).astype('int64')

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
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame(columns=master_cols)

        df.columns = [to_snake_case(str(col)) for col in df.columns]

        alias_mapping = {
            'no_polis_no_sp': 'policy_number',
            'no_polis': 'policy_number',
            'id_terjamin': 'id_terjamin',
            'nama_produk': 'cob_type_of_cover',
            'nama_bank': 'bank_name',
            'insured_name_terjamin': 'insured_name',
            'nama_peserta': 'insured_name',
            'periode_mulai_kredit': 'period_of_insurance_start',
            'periode_berkahirnya_kredit': 'period_of_insurance_end',
            'underwriting_year': 'uw_year',
            'tahun_uw': 'uw_year',
            'nilai_kredit_penjaminan_sum_insured': 'sum_insured',
            'nilai_kreditpenjaminan_sum_insured': 'sum_insured',
            'nilai_klaim_100': 'claim_amount_100',
            'nilai_klaim_100percent': 'claim_amount_100',
            'nilai_klaim_percent_100': 'claim_amount_100',
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

        # Filter baris yang valid: policy_number atau insured_name tidak boleh null/rekap
        check_col = 'policy_number' if 'policy_number' in df.columns else ('insured_name' if 'insured_name' in df.columns else None)
        if check_col:
            df = df.dropna(subset=[check_col])
            trash_regex = r'^\s*(TOTAL|JUMLAH|GRAND|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE|-)\s*$'
            df = df[~df[check_col].astype(str).str.upper().str.strip().str.match(trash_regex, na=False)]

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
                cleaned_val = (
                    df[ncol]
                    .astype(str)
                    .str.replace('%', '', regex=False)
                    .str.replace(',', '', regex=False)
                    .str.replace(' ', '', regex=False)
                    .str.strip()
                )
                df[ncol] = pd.to_numeric(cleaned_val, errors='coerce').fillna(0.0).round(2)

        # Generate no urut jika kosong / error parsing
        if 'no' in df.columns:
            clean_no = df['no'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()
            df['no'] = pd.to_numeric(clean_no, errors='coerce').fillna(pd.Series(range(1, len(df) + 1), index=df.index)).astype('int64')
        else:
            df['no'] = range(1, len(df) + 1)

        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = np.nan
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        return df_clean.reset_index(drop=True)