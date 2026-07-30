import os
import re
import uuid
import openpyxl
import pandas as pd

TEMP_DIR = os.path.join(os.getcwd(), "temp_uploads")

def ensure_directories_exist():
    """Memastikan folder temp_uploads tersedia."""
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)

def save_temp_file(file_bytes: bytes, original_filename: str) -> str:
    """Menyimpan file ke folder temporary dan mengembalikan file_id (UUID)."""
    ensure_directories_exist()
    file_id = f"file_{uuid.uuid4().hex}"
    ext = os.path.splitext(original_filename)[1]  # .xlsx
    file_path = os.path.join(TEMP_DIR, f"{file_id}{ext}")
    
    with open(file_path, "wb") as f:
        f.write(file_bytes)
        
    return file_id

def get_temp_file_path(file_id: str) -> str:
    """Mencari path file berdasarkan file_id."""
    ensure_directories_exist()
    for fname in os.listdir(TEMP_DIR):
        if fname.startswith(file_id):
            return os.path.join(TEMP_DIR, fname)
    raise FileNotFoundError(f"File dengan ID '{file_id}' tidak ditemukan atau sudah kadaluarsa.")

def detect_period_from_filename(filename: str) -> dict:
    """Mendeteksi Kuartal (Q1-Q4) dan Tahun dari nama file secara fleksibel."""
    filename_lower = filename.lower()
    
    # 1. Deteksi Kuartal (Support: Q3, 3rd Quarter, 3rd Q, Quarter 3, dll)
    kuartal = "Q1"  # Fallback default jika tidak terdeteksi
    
    if re.search(r'\b(q1|1st|quarter\s*1)\b', filename_lower):
        kuartal = "Q1"
    elif re.search(r'\b(q2|2nd|quarter\s*2)\b', filename_lower):
        kuartal = "Q2"
    elif re.search(r'\b(q3|3rd|quarter\s*3)\b', filename_lower):
        kuartal = "Q3"
    elif re.search(r'\b(q4|4th|quarter\s*4)\b', filename_lower):
        kuartal = "Q4"

    # 2. Deteksi Tahun (Mencari 4 digit angka tahun seperti 2024, 2025, 2026)
    y_match = re.search(r'\b(20\d{2})\b', filename)
    tahun = y_match.group(1) if y_match else "2024"

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
    return text.strip('_').lower()

def find_header_row_fast(file_path: str, sheet_name: str, max_check: int = 20) -> int:
    """
    Menggunakan openpyxl read-only mode untuk intip max 20 baris pertama.
    Sangat presisi terhadap baris asli Excel dan bebas bug index Pandas.
    """
    # Kata kunci spesifik kolom header utama (bukan kata umum metadata)
    target_keywords = ["policy number", "insured name", "type of cover", "uw year", "100_tsi", "currency", "occupation"]
    
    wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    ws = wb[sheet_name]
    
    header_idx = 0
    
    for row_idx, row in enumerate(ws.iter_rows(max_row=max_check, values_only=True)):
        # Gabungkan semua value dalam baris
        row_str = " ".join([str(val).lower() for val in row if val is not None])
        
        # Hitung kecocokan kata kunci
        matches = sum(1 for kw in target_keywords if kw in row_str)
        
        # Jika ketemu minimal 2 kata kunci kolom utama
        if matches >= 2:
            header_idx = row_idx
            break
            
    wb.close()
    return header_idx

def read_excel_dynamic_header(file_path: str, sheet_name: str) -> pd.DataFrame:
    """
    1. Scan presisi indeks header via openpyxl (Max 20 baris teratas).
    2. Otomatis tangani Multi-line / Merged Header (misal: BREAKDOWN OF SI + MD/Building).
    3. Baca SELURUH DATA TRANSAKSI tanpa batasan nrows.
    """
    # 1. Deteksi index baris header utama secara kilat
    header_idx = find_header_row_fast(file_path, sheet_name, max_check=20)
    
    # 2. Coba baca 2 baris teratas sebagai MultiIndex Header untuk mengantisipasi bertumpuk
    df = pd.read_excel(file_path, sheet_name=sheet_name, header=[header_idx, header_idx + 1])
    
    # 3. Jika terdeteksi MultiIndex (Header 2 baris)
    if isinstance(df.columns, pd.MultiIndex):
        new_cols = []
        for col_top, col_bot in df.columns:
            top_str = "" if "Unnamed:" in str(col_top) else str(col_top).strip()
            bot_str = "" if "Unnamed:" in str(col_bot) else str(col_bot).strip()
            
            # Gabungkan Parent Header + Sub Header (Contoh: "PERIOD OF" + "START" -> "PERIOD OF START")
            if top_str and bot_str and top_str.lower() != bot_str.lower():
                combined = f"{top_str} {bot_str}"
            else:
                combined = top_str or bot_str
                
            new_cols.append(combined)
            
        df.columns = new_cols
    else:
        # Fallback jika header hanya 1 baris
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=header_idx)

    # 4. Bersihkan nama kolom ke snake_case & buang baris kosong total
    df = df.dropna(how="all").reset_index(drop=True)
    
    return df