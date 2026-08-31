# app/services/cedants/jamkridajabar.py
import re
import numpy as np
import pandas as pd
from app.services.cedants.base import BaseCedantETL
from app.core.config import MASTER_COLUMNS_PREMI, MASTER_COLUMNS_CLAIM
from app.utils.helpers import read_excel_dynamic_header, to_snake_case

def format_clean_id(val):
    """Mencegah nomor peserta/sertifikat terkonversi menjadi .0 atau eksponensial (e+16)"""
    if pd.isna(val) or val is None: 
        return None
    if isinstance(val, (float, np.floating)):
        if np.isnan(val) or np.isinf(val):
            return None
        if val.is_integer():
            return f"{int(val)}"
        return f"{val:.0f}"
    val_str = str(val).strip()
    if val_str.lower() in ["nan", "none", "nat", "null", "<na>", "-", ""]:
        return None
    return val_str[:-2] if val_str.endswith(".0") else val_str

def clean_accounting_number(val):
    """Konversi format nominal uang/persentase menjadi float murni."""
    if pd.isna(val) or val is None:
        return 0.0
    if isinstance(val, (int, float, np.integer, np.floating)):
        return float(val) if not (np.isnan(val) or np.isinf(val)) else 0.0
    s = str(val).strip()
    if s.lower() in ['', 'nan', 'none', 'null', '<na>', '-', 'nil']:
        return 0.0
    s = s.replace(',', '').replace(' ', '')
    if s.startswith('(') and s.endswith(')'):
        s = f"-{s[1:-1]}"
    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0

class JamkridaJabarETL(BaseCedantETL):
    """Modul ETL khusus PT Jamkrida Jabar (Igna Asia) - COB KREDIT"""

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        master_cols = MASTER_COLUMNS_CLAIM.get("jamkridajabar", [])
        
        # 1. Baca data dengan Dynamic Header Reader
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame(columns=master_cols)

        # 2. Standarisasi header mentah ke snake_case
        df.columns = [to_snake_case(str(col)) for col in df.columns]

        # 3. Rename Mapping sesuai nama kolom asli Excel Jamkrida Jabar
        rename_mapping = {
            'no': 'no',
            'treaty_yearuy': 'treaty_year',
            'treaty_year': 'treaty_year',
            'uy': 'treaty_year',
            'bankpemegang_polis': 'bank_pemegang_polis',
            'bank_pemegang_polis': 'bank_pemegang_polis',
            'nama_pesertadebitur': 'nama_peserta_debitur',
            'nama_peserta_debitur': 'nama_peserta_debitur',
            'nama_debitur': 'nama_peserta_debitur',
            'no_sertifikatpesertadebitur': 'no_sertifikat_peserta_debitur',
            'no_sertifikat_peserta_debitur': 'no_sertifikat_peserta_debitur',
            'no_peserta': 'no_sertifikat_peserta_debitur',
            'no_sertifikat': 'no_sertifikat_peserta_debitur',
            'tgl_lahir': 'tanggal_lahir',
            'tanggal_lahir': 'tanggal_lahir',
            'pelaporan_bordero_premi_bulan_dan_tahun': 'pelaporan_bordero_premi',
            'pelaporan_bordero_premi': 'pelaporan_bordero_premi',
            'date_of_losstanggal_kejadian_klaim': 'date_of_loss',
            'date_of_loss_tanggal_kejadian_klaim': 'date_of_loss',
            'date_of_loss': 'date_of_loss',
            'dol': 'date_of_loss',
            'cause_of_losspenyebab_terjadinya_klaim': 'cause_of_loss',
            'cause_of_loss_penyebab_terjadinya_klaim': 'cause_of_loss',
            'cause_of_loss': 'cause_of_loss',
            'pokok_kredit__plafond_nilai_penjaminan_jj': 'pokok_kredit_plafond',
            'pokok_kredit_plafond_nilai_penjaminan_jj': 'pokok_kredit_plafond',
            'pokok_kredit_plafond': 'pokok_kredit_plafond',
            'klaim_100': 'klaim_100',
            '100_klaim': 'klaim_100',
            'claim_100': 'klaim_100',
            'bagian_bankretensi_bank': 'bagian_bank_retensi',
            'bagian_bank_retensi_bank': 'bagian_bank_retensi',
            'bagian_asuransiperusahaan_penjaminan': 'bagian_penjaminan_asuransi',
            'bagian_asuransi_perusahaan_penjaminan': 'bagian_penjaminan_asuransi',
            'bagian_nasional_re': 'bagian_nasional_re',
            'bagian_riu': 'bagian_riu',
            'skim': 'skim',
            'nilai_kredit_mitra_jj': 'nilai_kredit_mitra_jj',
            'trx': 'trx'
        }
        df.rename(columns=rename_mapping, inplace=True)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # 4. Injeksi Metadata Periode & COB
        df['period'] = periode_lengkap
        df['cob'] = override_cob.upper() if override_cob else 'CREDIT'

        # 5. Filter Baris Sampah & Total Footer
        if "nama_peserta_debitur" in df.columns:
            df = df.dropna(subset=["nama_peserta_debitur"])
            trash_pattern = r'^\s*(TOTAL|JUMLAH|GRAND\s*TOTAL|SUBTOTAL|REKAP|SUMMARY|0|NAN|NONE)\s*$'
            str_debitur = df["nama_peserta_debitur"].astype(str).str.upper().str.strip()
            df = df[~str_debitur.str.match(trash_pattern, na=False)]

        # 6. Sanitasi Kolom ID & String
        id_cols = ['no', 'treaty_year', 'no_sertifikat_peserta_debitur', 'trx']
        for c in id_cols:
            if c in df.columns:
                df[c] = df[c].apply(format_clean_id)

        # 7. Parsing Tanggal (Format ISO String YYYY-MM-DD)
        date_cols = ['tanggal_lahir', 'date_of_loss']
        for c in date_cols:
            if c in df.columns:
                df[c] = pd.to_datetime(df[c], errors='coerce', dayfirst=True)
                df[c] = df[c].dt.strftime('%Y-%m-%d').replace(['NaT', 'nan', 'NaN', 'None', ''], None)

        # 8. Sanitasi Kolom Numerik
        num_cols = [
            'pokok_kredit_plafond', 'klaim_100', 'bagian_bank_retensi',
            'bagian_penjaminan_asuransi', 'bagian_nasional_re', 'bagian_riu',
            'nilai_kredit_mitra_jj'
        ]
        for c in num_cols:
            if c in df.columns:
                df[c] = df[c].apply(clean_accounting_number)

        # 9. Sinkronisasi dengan Master Columns
        if master_cols:
            for col in master_cols:
                if col not in df.columns:
                    df[col] = None
            df_clean = df[master_cols].copy()
        else:
            df_clean = df.copy()

        return df_clean.where(pd.notnull(df_clean), None).reset_index(drop=True)

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        """Handler untuk Premi Jamkrida Jabar (Bila file premi diunggah)."""
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame()
        df.columns = [to_snake_case(str(col)) for col in df.columns]
        df['period'] = periode_lengkap
        df['cob'] = override_cob.upper() if override_cob else 'CREDIT'
        return df.where(pd.notnull(df), None).reset_index(drop=True)