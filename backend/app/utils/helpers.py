import os
import re
import math
import uuid
import openpyxl
import numpy as np
import pandas as pd

TEMP_DIR = os.path.join(os.getcwd(), "temp_uploads")


def ensure_directories_exist():
    """Memastikan folder temp_uploads tersedia."""
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR, exist_ok=True)


def save_temp_file(file_bytes: bytes, original_filename: str) -> str:
    """
    Menyimpan file ke folder temporary dengan nama aman berbasis UUID 
    dan validasi ekstensi berkas.
    """
    ensure_directories_exist()
    file_id = f"file_{uuid.uuid4().hex}"
    clean_base = os.path.basename(str(original_filename or ""))
    ext = os.path.splitext(clean_base)[1].lower()
    
    # Whitelist ekstensi yang diizinkan
    allowed_exts = {".xlsx", ".xls", ".xlsm", ".xltx", ".csv"}
    if ext not in allowed_exts:
        ext = ".xlsx"
        
    file_path = os.path.join(TEMP_DIR, f"{file_id}{ext}")

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return file_id


def get_temp_file_path(file_id: str) -> str:
    """
    Mencari path file berdasarkan file_id secara aman dengan perlindungan Path Traversal.
    """
    ensure_directories_exist()
    # Hapus sekuens direktori traversal tetapi izinkan ekstensi titik dan tanda hubung
    safe_file_id = re.sub(r"[^a-zA-Z0-9_.\-]", "", os.path.basename(str(file_id or "")))
    if not safe_file_id or safe_file_id.startswith("."):
        raise ValueError("Format file ID tidak valid.")

    temp_dir_abs = os.path.abspath(TEMP_DIR)
    for fname in os.listdir(temp_dir_abs):
        if fname.startswith(safe_file_id):
            full_path = os.path.abspath(os.path.join(temp_dir_abs, fname))
            # Verifikasi bahwa path berada strictly di dalam temp_uploads
            if os.path.commonpath([temp_dir_abs, full_path]) == temp_dir_abs:
                return full_path

    raise FileNotFoundError(f"File dengan ID '{safe_file_id}' tidak ditemukan atau sudah kadaluarsa.")


def detect_period_from_filename(filename: str) -> dict:
    """Mendeteksi Kuartal (Q1-Q4 / TW1-TW4) dan Tahun dari nama file secara fleksibel."""
    filename_lower = filename.lower()

    kuartal = "Q1"
    if re.search(r'\b(q1|1st|quarter\s*1|tw\s*1)\b', filename_lower):
        kuartal = "Q1"
    elif re.search(r'\b(q2|2nd|quarter\s*2|tw\s*2)\b', filename_lower):
        kuartal = "Q2"
    elif re.search(r'\b(q3|3rd|quarter\s*3|tw\s*3)\b', filename_lower):
        kuartal = "Q3"
    elif re.search(r'\b(q4|4th|quarter\s*4|tw\s*4)\b', filename_lower):
        kuartal = "Q4"

    y_match = re.search(r'\b(20\d{2}|19\d{2})\b', filename)
    tahun = y_match.group(1) if y_match else "2025"

    return {
        "kuartal": kuartal,
        "tahun": tahun,
        "periode_formatted": f"{kuartal} {tahun}"
    }


def to_snake_case(text: str) -> str:
    """Mengubah string menjadi format SQL snake_case."""
    text = str(text) if text is not None and str(text).lower() != "nan" else ""
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'[\s\-]+', '_', text)
    text = re.sub(r'_+', '_', text)
    return text.strip('_').lower()


def find_header_row_fast(file_path: str, sheet_name: str, max_check: int = 30) -> int:
    """
    Mendeteksi baris header asli di Excel berdasarkan kata kunci bordereaux umum.
    Menggunakan engine calamine untuk kecepatan maksimal.
    """
    target_keywords = [
        "policy", "policyno", "policy_no", "insured", "reinsured", "reinsurer",
        "claim", "claimno", "claim_no", "treaty", "tsi", "gross_premium",
        "gross_claim", "start_period", "sdate", "edate", "date_of_loss",
        "type of cover", "uw year", "currency", "occupation"
    ]

    try:
        df_preview = pd.read_excel(file_path, sheet_name=sheet_name, nrows=max_check, header=None, engine="calamine")
        header_idx = 0
        max_matches = 0

        for idx, row in df_preview.iterrows():
            row_str = " ".join([str(val).lower() for val in row.values if pd.notna(val)])
            matches = sum(1 for kw in target_keywords if kw in row_str)

            if matches > max_matches:
                max_matches = matches
                header_idx = idx

        return header_idx
    except Exception:
        wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
        ws = wb[sheet_name]

        header_idx = 0
        max_matches = 0

        for row_idx, row in enumerate(ws.iter_rows(max_row=max_check, values_only=True)):
            row_str = " ".join([str(val).lower() for val in row if val is not None])
            matches = sum(1 for kw in target_keywords if kw in row_str)

            if matches > max_matches:
                max_matches = matches
                header_idx = row_idx

        wb.close()
        return header_idx


def read_excel_dynamic_header(file_path: str, sheet_name: str) -> pd.DataFrame:
    """
    Membaca Excel secara cerdas & cepat menggunakan engine Calamine.
    """
    header_idx = find_header_row_fast(file_path, sheet_name, max_check=30)
    
    excel_engine = "calamine"
    try:
        preview = pd.read_excel(file_path, sheet_name=sheet_name, skiprows=header_idx, nrows=2, header=None, engine=excel_engine)
    except Exception:
        excel_engine = "openpyxl"
        preview = pd.read_excel(file_path, sheet_name=sheet_name, skiprows=header_idx, nrows=2, header=None, engine=excel_engine)
    
    is_multi_level = False
    if len(preview) >= 2:
        row1_text_count = sum(1 for x in preview.iloc[0] if isinstance(x, str) and str(x).strip())
        row2_text_count = sum(1 for x in preview.iloc[1] if isinstance(x, str) and not re.match(r'^\d+(\.\d+)?$', str(x).strip()) and str(x).strip())
        
        sub_keywords = ['100%', 'share', 'percent', 'our', 'amount', 'idr', 'usd', 'gross', 'net', 'tsi']
        row2_combined = " ".join([str(x).lower() for x in preview.iloc[1] if pd.notna(x)])
        has_sub_kw = any(kw in row2_combined for kw in sub_keywords)
        
        if has_sub_kw and row2_text_count >= 3 and row1_text_count <= len(preview.columns) * 0.7:
            is_multi_level = True

    if is_multi_level:
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=[header_idx, header_idx + 1], engine=excel_engine)
        new_cols = []
        for col_top, col_bot in df.columns:
            top_str = "" if "Unnamed:" in str(col_top) else str(col_top).strip()
            bot_str = "" if "Unnamed:" in str(col_bot) else str(col_bot).strip()

            if top_str and bot_str and top_str.lower() != bot_str.lower():
                combined = f"{top_str} {bot_str}"
            else:
                combined = top_str or bot_str
            new_cols.append(combined)
        df.columns = new_cols
    else:
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=header_idx, engine=excel_engine)

    df = df.dropna(how="all").reset_index(drop=True)
    return df


def safe_parse_single_date(val):
    """Parsing tanggal aman dengan translasi bulan Indonesia & support serial number wajar."""
    if pd.isna(val) or val is None:
        return pd.NaT

    if isinstance(val, (pd.Timestamp, np.datetime64)):
        return pd.to_datetime(val)

    val_str = str(val).strip()
    if val_str.lower() in ['', 'nan', 'nat', 'none', 'null', '<na>', '-', '0', '0.0', 'nil']:
        return pd.NaT

    # Tangani jika berisi rentang tanggal "01/01/2025 - 31/12/2025", ambil tanggal pertama
    if " - " in val_str:
        val_str = val_str.split(" - ")[0].strip()

    # Tangani serial number Excel (Hanya 30000 s/d 65000 -> tahun 1982 s/d 2078)
    if re.match(r'^\d+(\.0+)?$', val_str):
        try:
            num = float(val_str)
            if 30000 <= num <= 65000:
                return pd.to_datetime(num, unit='D', origin='1899-12-30')
            else:
                return pd.NaT
        except Exception:
            return pd.NaT

    # Translasi nama bulan Indonesia
    id_months = {
        'jan': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'apr': 'Apr',
        'mei': 'May', 'jun': 'Jun', 'jul': 'Jul', 'agt': 'Aug',
        'agu': 'Aug', 'sep': 'Sep', 'okt': 'Oct', 'nov': 'Nov', 'des': 'Dec'
    }
    for id_m, en_m in id_months.items():
        val_str = re.sub(rf'\b{id_m}\b', en_m, val_str, flags=re.IGNORECASE)

    try:
        dt = pd.to_datetime(val_str, dayfirst=True, errors='coerce')
        if pd.isna(dt) or dt.year < 1900 or dt.year > 2500:
            return pd.NaT
        return dt
    except Exception:
        return pd.NaT


def validate_dates(df: pd.DataFrame) -> pd.DataFrame:
    """Melakukan validasi dan konversi kolom berunsur tanggal secara otomatis."""
    keywords = [
        'period_of_insurance', 'period_of_start', 'period_of_end', 
        'date', 'tanggal', 'sdate', 'edate', 'dol', 'inception', 'expiry', 'akad', 'lahir'
    ]

    for col in df.columns:
        col_lower = str(col).lower()

        if any(ex in col_lower for ex in ['usia', 'age', 'uw_year', 'uy', 'year', 'tahun']):
            continue

        if any(keyword in col_lower for keyword in keywords):
            s_parsed = df[col].apply(safe_parse_single_date)

            # Penanganan tahun 2 digit (misal 24 -> 2024)
            mask_2digit = s_parsed.notna() & (s_parsed.dt.year >= 0) & (s_parsed.dt.year < 100)
            if mask_2digit.any():
                s_parsed.loc[mask_2digit] = s_parsed[mask_2digit].map(
                    lambda d: d.replace(year=d.year + 2000) if pd.notna(d) and d.year < 100 else d
                )

            # Batas toleransi tahun
            mask_corrupt = s_parsed.notna() & ((s_parsed.dt.year < 1900) | (s_parsed.dt.year > 2500))
            s_parsed.loc[mask_corrupt] = pd.NaT

            df[col] = s_parsed

    return df


def clean_dict_for_json(data: list) -> list:
    """
    Konversi mendalam untuk memastikan semua sel NaN/NaT/Null
    berubah menjadi None (null JSON) yang aman untuk FastAPI serializer.
    """
    cleaned = []
    for row in data:
        cleaned_row = {}
        for key, val in row.items():
            if pd.isna(val) or val is None:
                cleaned_row[key] = None
            elif isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                cleaned_row[key] = None
            elif isinstance(val, (pd.Timestamp, pd.Timedelta)):
                cleaned_row[key] = val.isoformat()
            elif isinstance(val, (np.integer, np.int64)):
                cleaned_row[key] = int(val)
            elif isinstance(val, (np.floating, np.float64)):
                cleaned_row[key] = float(val)
            else:
                cleaned_row[key] = val
        cleaned.append(cleaned_row)
    return cleaned