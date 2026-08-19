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


def inspect_and_save_file(
    file_bytes: bytes, filename: str, tipe_proses: str = None, cedant: str = None
) -> dict:
    file_id = f"file_{uuid.uuid4().hex}"
    saved_path = os.path.join(TEMP_UPLOAD_DIR, f"{file_id}_{filename}")

    # 1. Simpan file fisik ke disk
    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    available_sheets = []
    lower_name = filename.lower()

    # 2. Ekstraksi nama sheet instan via Zip Manifest (< 0.05 detik)
    if lower_name.endswith((".xlsx", ".xlsm", ".xltx")):
        try:
            with zipfile.ZipFile(saved_path, "r") as z:
                with z.open("xl/workbook.xml") as f_xml:
                    tree = ET.parse(f_xml)
                    root = tree.getroot()
                    for elem in root.iter():
                        if elem.tag.endswith("sheet"):
                            sheet_name = elem.attrib.get("name")
                            if sheet_name:
                                available_sheets.append(sheet_name)
        except Exception:
            wb = openpyxl.load_workbook(saved_path, read_only=True, keep_links=False)
            available_sheets = wb.sheetnames
            wb.close()

    elif lower_name.endswith(".xls"):
        excel_obj = pd.ExcelFile(saved_path, engine="xlrd")
        available_sheets = excel_obj.sheet_names
    elif lower_name.endswith(".csv"):
        available_sheets = ["CSV_DATA"]

    return {
        "file_id": file_id,
        "available_sheets": available_sheets,
        "saved_path": saved_path,
    }


def resolve_cob_from_sheet(sheet_name: str) -> str:
    """
    Mencari COB baku secara universal dari nama sheet cedant mana pun menggunakan SHEET_TO_TABLE_MAPPING.
    """
    raw_str = str(sheet_name or "").lower().strip()
    clean_name = re.sub(r"[^a-zA-Z0-9\s]", " ", raw_str)
    clean_name = re.sub(r"\s+", " ", clean_name).strip()

    # 1. Cek Exact Match di dictionary config
    if clean_name in SHEET_TO_TABLE_MAPPING:
        return SHEET_TO_TABLE_MAPPING[clean_name]
    if raw_str in SHEET_TO_TABLE_MAPPING:
        return SHEET_TO_TABLE_MAPPING[raw_str]

    # 2. Cek kecocokan Substring / Frasa Multi-kata (Urutkan dari keyword terpanjang)
    sorted_keywords = sorted(SHEET_TO_TABLE_MAPPING.keys(), key=len, reverse=True)
    for keyword in sorted_keywords:
        kw_clean = keyword.lower().strip()
        if kw_clean and (kw_clean in clean_name or kw_clean in raw_str):
            return SHEET_TO_TABLE_MAPPING[keyword]

    words = set(clean_name.split())

    # 3. Handle sheet Quota Share (QS) umum
    if "qs" in words and any(
        k in words for k in ["klaim", "claim", "premi", "premium"]
    ):
        return "credit"

    # Fallback: Pastikan tidak ada spasi di output fallback
    return to_snake_case(clean_name).replace(" ", "_")


def get_target_table_name(
    tipe_proses: str,
    cedant: str,
    selected_sheet: str,
    override_cob: str = None,
    custom_table_name: str = None,
) -> str:
    # 1. Jika user mengisi custom_table_name secara valid, prioritaskan itu
    if (
        custom_table_name
        and custom_table_name.strip()
        and custom_table_name.strip().lower() != "string"
    ):
        return custom_table_name.strip().lower().replace(" ", "_")

    # 2. Ambil target COB: utamakan override_cob jika ada, jika tidak pakai selected_sheet
    raw_target = selected_sheet
    if (
        override_cob
        and override_cob.strip()
        and override_cob.strip().lower() != "string"
    ):
        raw_target = override_cob.strip()

    # Lewatkan ke resolver agar frasa seperti "Non Marine" dipetakan ke "fire"
    cob_suffix = resolve_cob_from_sheet(raw_target)

    # Sanitasi karakter spasi/tanda hubung
    cob_suffix = cob_suffix.replace(" ", "_").replace("-", "_")
    clean_tipe = tipe_proses.lower().strip().replace(" ", "_")
    clean_cedant = cedant.lower().strip().replace(" ", "_")

    # 3. Khusus ASKRIDA: format {tipe}_{cob}_{cedant}
    if "askrida" in clean_cedant:
        if clean_tipe == "claim":
            if cob_suffix == "credit":
                cob_suffix = "kredit"
        else:
            if cob_suffix == "kredit":
                cob_suffix = "credit"

        return f"{clean_tipe}_{cob_suffix}_{clean_cedant}"

    # 4. Standar Cedant Lain: format {tipe}_{cedant}_{cob} (misal: claim_aca_fire)
    return f"{clean_tipe}_{clean_cedant}_{cob_suffix}"


def infer_sql_type_dynamically(col_name: str, sample_series: pd.Series = None) -> str:
    """
    Menentukan tipe SQL PostgreSQL secara dinamis dan semantik.
    """
    col_clean = str(col_name or "").lower().strip()

    # 1. Aturan Semantik Baku Nilai Uang / Nominal (Prioritas #1)
    if any(k in col_clean for k in [
        "amount", "insured_amount", "claim", "premi", "premium", "share", "tsi", 
        "sum_insured", "netto", "comm", "incurred", "loss", "pertanggungan", 
        "biaya", "tarif", "rate", "gross"
    ]):
        return "DOUBLE PRECISION"

    # 2. Aturan Tanggal / Waktu
    if any(k in col_clean for k in ["date", "tanggal", "start", "end", "incept", "expiry", "dob", "dol", "akad", "lahir"]):
        return "TIMESTAMP"

    # 3. Aturan Durasi / Angka Bulat
    if any(k in col_clean for k in ["year", "tahun", "bulan", "month", "usia", "age", "tenor"]):
        return "BIGINT"

    # 4. Inspeksi Tipe Aktual dari Data Series jika ada
    if isinstance(sample_series, pd.Series) and not sample_series.dropna().empty:
        dtype_str = str(sample_series.dtype).lower()
        if "datetime" in dtype_str:
            return "TIMESTAMP"
        if "int" in dtype_str:
            return "BIGINT"
        if "float" in dtype_str:
            return "DOUBLE PRECISION"

    # 5. Teks Panjang
    if any(k in col_clean for k in ["name", "insured", "bank", "location", "address", "note", "keterangan", "cause", "objek", "deskripsi"]):
        return "TEXT"

    # Default fallback untuk kode/string singkat
    return "VARCHAR(255)"


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
                "column_name": col,
                "status": "MATCH" if col in db_columns else "MISSING_IN_DB",
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
        df_sample = read_excel_dynamic_header(file_path, actual_sheet).head(10)
        df_sample.columns = [to_snake_case(col) for col in df_sample.columns]

        schema_suggestions = []
        for col in master_cols:
            sample_series = df_sample[col] if col in df_sample.columns else None
            suggested_type = infer_sql_type_dynamically(col, sample_series)

            schema_suggestions.append(
                {"column_name": col, "suggested_sql_type": suggested_type}
            )

        return {
            "file_id": file_id,
            "selected_sheet": actual_sheet,
            "table_name": table_name,
            "table_exists": False,
            "recommended_create_table_ddl": schema_suggestions,
            "message": f"Tabel '{table_name}' BELUM ADA di database.",
        }


def sanitize_column_name(col_name: str) -> str:
    col_name = col_name.strip().lower()
    match = re.match(r"^(\d+)_(.+)$", col_name)
    if match:
        number_part, text_part = match.groups()
        return f"{text_part}_{number_part}"
    return col_name


def execute_create_table(table_name: str, schema_ddl: list) -> dict:
    column_definitions = []
    for col in schema_ddl:
        safe_col_name = sanitize_column_name(col["column_name"])
        sql_type = col["suggested_sql_type"]
        column_definitions.append(f'"{safe_col_name}" {sql_type}')

    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS "{table_name}" (
        {", ".join(column_definitions)}
    );
    """

    with engine.begin() as conn:
        conn.execute(text(create_table_query))

    return {
        "status": "success",
        "table_name": table_name,
        "message": f"Tabel '{table_name}' berhasil dibuat murni dari kolom Excel!",
    }