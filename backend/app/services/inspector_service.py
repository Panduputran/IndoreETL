import io
import os
import re
import uuid
import xml.etree.ElementTree as ET
import zipfile
import openpyxl
import pandas as pd
from sqlalchemy import inspect, text
from app.core.config import (
    MASTER_COLUMNS_CLAIM,
    MASTER_COLUMNS_PREMI,
    SHEET_TO_TABLE_MAPPING,
)
from app.database.connection import engine
from app.utils.helpers import (
    detect_period_from_filename,
    get_temp_file_path,
    read_excel_dynamic_header,
    save_temp_file,
    to_snake_case,
)

TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)


def sanitize_column_name(col_name: str) -> str:
    """Sanitasi nama kolom SQL: snake_case, huruf kecil, dan angka di awal dipindah ke belakang."""
    col_name = str(col_name or "").strip().lower()
    col_name = to_snake_case(col_name)
    col_name = re.sub(r'[^a-z0-9_]', '', col_name)
    match = re.match(r"^(\d+)_(.+)$", col_name)
    if match:
        number_part, text_part = match.groups()
        return f"{text_part}_{number_part}"
    return col_name


def infer_sql_type_dynamically(col_name: str, sample_series: pd.Series = None) -> str:
    """
    Pemetaan tipe data universal yang selaras dengan loader.py:
    - Kolom Angka / Uang / Share -> NUMERIC(20, 2)
    - Kolom No / ID / Tenor -> BIGINT
    - SEMUA Tanggal & Teks Bebas -> TEXT (Anti Error Limit & Out of Range)
    """
    col_clean = sanitize_column_name(col_name)

    # 1. Kolom Bilangan Bulat Urut -> BIGINT
    int_cols = {'no', 'id', 'uw_year', 'tahun', 'waktu_pertanggungan_bulan', 'tenor', 'usia_saat_akad_tahun', 'seq'}
    if col_clean in int_cols:
        return "BIGINT"

    # 2. Kolom Angka Keuangan / Uang / Share -> NUMERIC(20, 2)
    money_keywords = [
        'amount', 'claim', 'premi', 'premium', 'tsi', 'sum_insured',
        'share_percent', 'our_share', 'reinsurer_share', 'comm', 'netto',
        'incurred', 'loss_scaled', 'paid_claim', 'exposure', 'net', 'roe', 'rate'
    ]
    if any(mk in col_clean for mk in money_keywords) and not any(tx in col_clean for tx in ['event', 'cause', 'desc', 'note', 'type', 'name', 'occupation']):
        return "NUMERIC(20, 2)"

    # 3. SEMUA Kolom Tanggal, Polis, dan Teks Bebas -> WAJIB TEXT
    return "TEXT"


def inspect_and_save_file(
    file_bytes: bytes, filename: str, tipe_proses: str = None, cedant: str = None
) -> dict:
    file_id = f"file_{uuid.uuid4().hex}"
    saved_path = os.path.join(TEMP_UPLOAD_DIR, f"{file_id}_{filename}")
    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    available_sheets = []
    lower_name = filename.lower()

    if lower_name.endswith((".xlsx", ".xlsm", ".xltx")):
        try:
            # 1. Ekstraksi XML dan baca status state tiap sheet
            with zipfile.ZipFile(saved_path, "r") as z:
                with z.open("xl/workbook.xml") as f_xml:
                    tree = ET.parse(f_xml)
                    root = tree.getroot()
                    for elem in root.iter():
                        if elem.tag.endswith("sheet"):
                            sheet_name = elem.attrib.get("name")
                            sheet_state = elem.attrib.get("state", "visible").lower()
                            if sheet_name:
                                available_sheets.append({
                                    "name": sheet_name,
                                    "is_hidden": sheet_state in ["hidden", "veryhidden"]
                                })
        except Exception:
            wb = openpyxl.load_workbook(saved_path, read_only=False, keep_links=False)
            available_sheets = [
                {
                    "name": ws.title,
                    "is_hidden": ws.sheet_state in ["hidden", "veryHidden"]
                }
                for ws in wb.worksheets
            ]
            wb.close()
            
    elif lower_name.endswith(".xls"):
        excel_obj = pd.ExcelFile(saved_path, engine="xlrd")
        available_sheets = [{"name": s, "is_hidden": False} for s in excel_obj.sheet_names]
    elif lower_name.endswith(".csv"):
        available_sheets = [{"name": "CSV_DATA", "is_hidden": False}]

    # Ambil default sheet pertama yang berstatus visible (tidak hidden)
    visible_first = next((s["name"] for s in available_sheets if not s["is_hidden"]), available_sheets[0]["name"] if available_sheets else "")

    return {
        "file_id": file_id,
        "available_sheets": [s["name"] for s in available_sheets],
        "sheet_details": available_sheets,
        "default_sheet": visible_first,
        "saved_path": saved_path,
    }


def resolve_cob_from_sheet(sheet_name: str) -> str:
    """
    Menentukan kode COB secara dinamis berdasarkan nama sheet.
    Memastikan 'Non Marine', 'Fire', 'Kebakaran', 'Property' dipeta ke 'fire'.
    """
    if not sheet_name:
        return "credit"

    # 1. Bersihkan string (termasuk karakter tersembunyi \xa0 dari Excel)
    raw_str = str(sheet_name).lower().replace('\xa0', ' ').strip()
    clean_name = re.sub(r"[^a-zA-Z0-9\s]", " ", raw_str)
    clean_name = re.sub(r"\s+", " ", clean_name).strip()

    # 2. Prioritas Utama: Deteksi Fire / Non Marine / Kebakaran / Property
    fire_keywords = ["fire", "kebakaran", "non marine", "nonmarine", "property"]
    if any(k in clean_name for k in fire_keywords) or any(k in raw_str for k in fire_keywords):
        return "fire"

    # 3. Cek exact & substring pada SHEET_TO_TABLE_MAPPING dari config
    if clean_name in SHEET_TO_TABLE_MAPPING:
        return SHEET_TO_TABLE_MAPPING[clean_name]
    if raw_str in SHEET_TO_TABLE_MAPPING:
        return SHEET_TO_TABLE_MAPPING[raw_str]

    sorted_keywords = sorted(SHEET_TO_TABLE_MAPPING.keys(), key=len, reverse=True)
    for keyword in sorted_keywords:
        kw_clean = keyword.lower().strip()
        if kw_clean and (kw_clean in clean_name or kw_clean in raw_str):
            return SHEET_TO_TABLE_MAPPING[keyword]

    # 4. Fallback murni
    return to_snake_case(clean_name).replace(" ", "_")


def get_target_table_name(
    tipe_proses: str,
    cedant: str,
    selected_sheet: str,
    override_cob: str = None,
    custom_table_name: str = None,
) -> str:
    if custom_table_name and custom_table_name.strip() and custom_table_name.strip().lower() not in ["string", "none", "null"]:
        return custom_table_name.strip().lower().replace(" ", "_")

    raw_target = selected_sheet
    if override_cob and override_cob.strip() and override_cob.strip().lower() not in ["string", "none", "null"]:
        raw_target = override_cob.strip()

    cob_suffix = resolve_cob_from_sheet(raw_target)
    cob_suffix = cob_suffix.replace(" ", "_").replace("-", "_")
    clean_tipe = tipe_proses.lower().strip().replace(" ", "_")
    clean_cedant = cedant.lower().strip().replace(" ", "_")

    # 1. KHUSUS ASKRIDA:
    # Format tabel {tipe}_{cob}_{cedant} dan menggunakan kata "kredit" untuk claim
    if "askrida" in clean_cedant:
        if clean_tipe == "claim":
            if cob_suffix == "credit":
                cob_suffix = "kredit"
        else:
            if cob_suffix == "kredit":
                cob_suffix = "credit"
        return f"{clean_tipe}_{cob_suffix}_{clean_cedant}"

    # 2. UNTUK SEMUA CEDANT LAIN (Jakre Jabar, ACA, dll):
    # Paksa kata 'kredit' kembali ke standar bahasa Inggris 'credit'
    if cob_suffix == "kredit":
        cob_suffix = "credit"

    return f"{clean_tipe}_{clean_cedant}_{cob_suffix}"


def check_target_table_in_db(
    file_id: str,
    tipe_proses: str,
    cedant: str,
    target_sheet: str,
    override_cob: str = None,
    custom_table_name: str = None,
) -> dict:
    file_path = get_temp_file_path(file_id)
    cedant_key = cedant.lower().strip()

    excel_file = pd.ExcelFile(file_path)
    sheets_map = {sheet.lower().strip(): sheet for sheet in excel_file.sheet_names}
    actual_sheet = sheets_map.get(target_sheet.lower().strip(), target_sheet)

    table_name = get_target_table_name(
        tipe_proses=tipe_proses,
        cedant=cedant,
        selected_sheet=actual_sheet,
        override_cob=override_cob,
        custom_table_name=custom_table_name,
    )

    if tipe_proses.lower().strip() == "claim":
        master_cols = MASTER_COLUMNS_CLAIM.get(cedant_key, [])
    else:
        master_cols = MASTER_COLUMNS_PREMI.get(cedant_key, [])

    try:
        inspector = inspect(engine)
        table_exists = inspector.has_table(table_name)
    except Exception as e:
        print(f"[-] Warning DB Inspector: {e}")
        table_exists = False

    if table_exists:
        db_columns_info = inspector.get_columns(table_name)
        db_columns = [col["name"] for col in db_columns_info]

        mapping_matrix = [
            {
                "column_name": sanitize_column_name(col),
                "status": "MATCH" if sanitize_column_name(col) in db_columns else "MISSING_IN_DB",
            }
            for col in master_cols
        ]

        return {
            "file_id": file_id,
            "selected_sheet": actual_sheet,
            "table_name": table_name,
            "table_exists": True,
            "mapping_matrix": mapping_matrix,
            "message": f"Tabel '{table_name}' SUDAH EKSIS di database.",
        }
    else:
        schema_suggestions = []
        for col in master_cols:
            clean_col = sanitize_column_name(col)
            if clean_col == "id":
                continue
            suggested_type = infer_sql_type_dynamically(clean_col)
            schema_suggestions.append(
                {"column_name": clean_col, "suggested_sql_type": suggested_type}
            )

        return {
            "file_id": file_id,
            "selected_sheet": actual_sheet,
            "table_name": table_name,
            "table_exists": False,
            "recommended_create_table_ddl": schema_suggestions,
            "message": f"Tabel '{table_name}' BELUM ADA di database.",
        }


def execute_create_table(table_name: str, schema_ddl: list) -> dict:
    column_definitions = []
    for col in schema_ddl:
        safe_col_name = sanitize_column_name(col["column_name"])
        if safe_col_name == "id":
            continue
        sql_type = col.get("suggested_sql_type") or infer_sql_type_dynamically(safe_col_name)
        column_definitions.append(f'"{safe_col_name}" {sql_type}')

    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS "{table_name}" (
        id SERIAL PRIMARY KEY,
        {", ".join(column_definitions)},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    with engine.begin() as conn:
        conn.execute(text(create_table_query))

    return {
        "status": "success",
        "table_name": table_name,
        "message": f"Tabel '{table_name}' berhasil dibuat dengan skema seragam!",
    }