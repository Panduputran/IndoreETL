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
    """Pemetaan tipe data universal: prioritaskan ID/Tanggal/Uang, sisanya TEXT."""
    col_clean = sanitize_column_name(col_name)

    # 1. Tanggal / Waktu -> TIMESTAMP
    date_list = [
        "sdate", "edate", "sdate_master_policy", "date_of_loss", "start_period", 
        "end_period", "period_of_insurance_start", "period_of_insurance_end", 
        "underwriting_date", "inception_date", "expiry_date", "tanggal_akad", 
        "dob", "dol", "date_of_accident", "date_of_claim"
    ]
    if col_clean in date_list or any(k in col_clean for k in ["date", "tanggal", "incept", "expiry", "_at"]):
        return "TIMESTAMP"

    # 2. Nilai Uang / Angka / Desimal / Share / Rate -> DOUBLE PRECISION (123)
    num_list = [
        "tsi_100", "ourshare", "exposure", "premium", "commission", "net", "roe",
        "tsi", "sum_insured", "gross_premium", "ri_comm", "net_premium",
        "our_share_percent", "reinsurer_share_percent", "claim_amount_100", "reinsurance_claim",
        "nilai_pertanggungan", "premi_indore_share", "reindo_netto", "incurred", "loss",
        "reindo_sum_insured", "reindo_ri_comm", "biaya_administrasi", "rate",
        "claim_amount", "paid_claim", "outstanding_claim", "deductible", "salvage", "fac_tsi", "fac_premium"
    ]
    if col_clean in num_list or any(k in col_clean for k in ["amount", "claim", "premi", "premium", "comm", "share", "rate", "tarif", "biaya", "tsi", "netto", "gross", "exposure", "roe", "salvage"]):
        return "DOUBLE PRECISION"

    # 3. Durasi / Angka Bulat -> BIGINT
    if any(k in col_clean for k in ["tahun", "bulan", "usia", "age", "tenor"]):
        return "BIGINT"

    # 4. Nomor Identitas / Kode Pendek / Label Periode -> VARCHAR(255)
    id_list = [
        "policyno", "policy_no", "endorsement", "id", "treatytype", "treaty_id",
        "treaty_year", "treatyyear", "class_of_business", "cob", "type_of_cover",
        "currency", "period", "no", "number", "code", "kode", "claim_no", 
        "register_no", "reff_of_no_bordereaux", "no_peserta", "no_polis", "status"
    ]
    if col_clean in id_list or col_clean == "period":
        return "VARCHAR(255)"

    # 5. SEMUA KOLOM TEKS LAINNYA (occupation, insured_name, address, remarks, dll) -> TEXT (Bebas Batas Karakter)
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
    raw_str = str(sheet_name or "").lower().strip()
    clean_name = re.sub(r"[^a-zA-Z0-9\s]", " ", raw_str)
    clean_name = re.sub(r"\s+", " ", clean_name).strip()

    if clean_name in SHEET_TO_TABLE_MAPPING:
        return SHEET_TO_TABLE_MAPPING[clean_name]
    if raw_str in SHEET_TO_TABLE_MAPPING:
        return SHEET_TO_TABLE_MAPPING[raw_str]

    sorted_keywords = sorted(SHEET_TO_TABLE_MAPPING.keys(), key=len, reverse=True)
    for keyword in sorted_keywords:
        kw_clean = keyword.lower().strip()
        if kw_clean and (kw_clean in clean_name or kw_clean in raw_str):
            return SHEET_TO_TABLE_MAPPING[keyword]

    words = set(clean_name.split())
    if "qs" in words and any(k in words for k in ["klaim", "claim", "premi", "premium"]):
        return "credit"

    return to_snake_case(clean_name).replace(" ", "_")


def get_target_table_name(
    tipe_proses: str,
    cedant: str,
    selected_sheet: str,
    override_cob: str = None,
    custom_table_name: str = None,
) -> str:
    if custom_table_name and custom_table_name.strip() and custom_table_name.strip().lower() != "string":
        return custom_table_name.strip().lower().replace(" ", "_")

    raw_target = selected_sheet
    if override_cob and override_cob.strip() and override_cob.strip().lower() != "string":
        raw_target = override_cob.strip()

    cob_suffix = resolve_cob_from_sheet(raw_target)
    cob_suffix = cob_suffix.replace(" ", "_").replace("-", "_")
    clean_tipe = tipe_proses.lower().strip().replace(" ", "_")
    clean_cedant = cedant.lower().strip().replace(" ", "_")

    if "askrida" in clean_cedant:
        if clean_tipe == "claim":
            if cob_suffix == "credit":
                cob_suffix = "kredit"
        else:
            if cob_suffix == "kredit":
                cob_suffix = "credit"
        return f"{clean_tipe}_{cob_suffix}_{clean_cedant}"

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
        sql_type = col.get("suggested_sql_type") or infer_sql_type_dynamically(safe_col_name)
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