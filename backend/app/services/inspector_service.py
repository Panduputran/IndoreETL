# backend/app/services/inspector_service.py
import io
import os
import re
import uuid
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
    save_temp_file,
    to_snake_case,
)

TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)


# ==========================================
# SANITIZATION & SCHEMA HELPERS
# ==========================================

def sanitize_column_name(col_name: str) -> str:
    col_name = str(col_name or "").strip().lower()
    col_name = to_snake_case(col_name)
    col_name = re.sub(r"[^a-z0-9_]", "", col_name)
    match = re.match(r"^(\d+)_(.+)$", col_name)
    if match:
        number_part, text_part = match.groups()
        return f"{text_part}_{number_part}"
    return col_name


def infer_sql_type_dynamically(col_name: str, sample_series: pd.Series = None) -> str:
    col_clean = sanitize_column_name(col_name)

    int_cols = {
        "no", "id", "uw_year", "tahun", "waktu_pertanggungan_bulan",
        "tenor", "usia_saat_akad_tahun", "seq",
    }
    if col_clean in int_cols:
        return "BIGINT"

    money_keywords = [
        "amount", "claim", "premi", "premium", "tsi", "sum_insured",
        "share_percent", "our_share", "reinsurer_share", "comm", "netto",
        "incurred", "loss_scaled", "paid_claim", "exposure", "net", "roe", "rate",
    ]
    is_money = any(mk in col_clean for mk in money_keywords)
    is_text = any(
        tx in col_clean
        for tx in ["event", "cause", "desc", "note", "type", "name", "occupation"]
    )

    if is_money and not is_text:
        return "NUMERIC(20, 2)"

    return "TEXT"


# ==========================================
# COB & TABLE RESOLVERS
# ==========================================

def resolve_cob_from_sheet(sheet_name: str) -> str:
    if not sheet_name:
        return "credit"

    raw_str = str(sheet_name).lower().replace("\xa0", " ").strip()
    clean_name = re.sub(r"[^a-zA-Z0-9\s]", " ", raw_str)
    clean_name = re.sub(r"\s+", " ", clean_name).strip()

    fire_keywords = ["fire", "kebakaran", "non marine", "nonmarine", "property"]
    if any(k in clean_name for k in fire_keywords) or any(
        k in raw_str for k in fire_keywords
    ):
        return "fire"

    if clean_name in SHEET_TO_TABLE_MAPPING:
        return SHEET_TO_TABLE_MAPPING[clean_name]
    if raw_str in SHEET_TO_TABLE_MAPPING:
        return SHEET_TO_TABLE_MAPPING[raw_str]

    sorted_keywords = sorted(SHEET_TO_TABLE_MAPPING.keys(), key=len, reverse=True)
    for keyword in sorted_keywords:
        kw_clean = keyword.lower().strip()
        if kw_clean and (kw_clean in clean_name or kw_clean in raw_str):
            return SHEET_TO_TABLE_MAPPING[keyword]

    return to_snake_case(clean_name).replace(" ", "_")


def get_target_table_name(
    tipe_proses: str,
    cedant: str,
    selected_sheet: str,
    override_cob: str = None,
    custom_table_name: str = None,
) -> str:
    if (
        custom_table_name
        and custom_table_name.strip()
        and custom_table_name.strip().lower() not in ["string", "none", "null"]
    ):
        return custom_table_name.strip().lower().replace(" ", "_")

    raw_target = selected_sheet
    if (
        override_cob
        and override_cob.strip()
        and override_cob.strip().lower() not in ["string", "none", "null"]
    ):
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

    if cob_suffix == "kredit":
        cob_suffix = "credit"

    return f"{clean_tipe}_{clean_cedant}_{cob_suffix}"


# ==========================================
# FILE INSPECTION & MULTI-HEADER PARSING
# ==========================================

def extract_excel_columns_dynamically(file_path: str, sheet_name: str) -> list:
    """
    Mendeteksi baris header bertingkat (parent-child / multi-level headers) 
    dan menggabungkannya menjadi satu format kolom terstandarisasi.
    """
    try:
        df_raw = pd.read_excel(file_path, sheet_name=sheet_name, header=None, nrows=25)
        if df_raw.empty:
            return []

        header_keywords = {
            "no", "polis", "policy", "insured", "tertanggung", "name", "nama", 
            "start", "end", "mulai", "akhir", "tsi", "premi", "premium", "claim", 
            "klaim", "curr", "currency", "date", "tanggal", "share", "rate", "cob",
            "certificate", "sertifikat", "loss", "cause", "location", "lokasi",
            "dol", "spreading", "incurred", "outstanding", "paid", "reinsurer"
        }

        # 1. Cari baris utama yang memiliki indikasi header terkuat
        best_row_idx = 0
        best_score = -1
        for idx, row in df_raw.iterrows():
            row_vals = [str(val).strip() for val in row if pd.notnull(val) and str(val).strip() != ""]
            if not row_vals:
                continue

            text_cells = sum(1 for v in row_vals if not v.replace(".", "").replace(",", "").replace("-", "").isdigit())
            keyword_hits = sum(3 for v in row_vals if any(kw in v.lower() for kw in header_keywords))
            score = text_cells + keyword_hits

            if score > best_score and text_cells >= 2:
                best_score = score
                best_row_idx = idx

        # 2. Periksa apakah baris tepat di bawahnya merupakan sub-header (header bertingkat)
        has_sub_header = False
        if best_row_idx + 1 < len(df_raw):
            next_row_vals = [str(val).strip() for val in df_raw.iloc[best_row_idx + 1] if pd.notnull(val) and str(val).strip() != ""]
            sub_keywords = {"start", "end", "%", "in amount", "amount", "or", "qs", "surplus", "others", "md", "machinery", "stock", "tpl", "bi"}
            sub_hits = sum(1 for v in next_row_vals if v.lower() in sub_keywords)
            if sub_hits >= 2:
                has_sub_header = True

        # 3. Baca dan gabungkan header
        if has_sub_header:
            df_multi = pd.read_excel(file_path, sheet_name=sheet_name, header=[best_row_idx, best_row_idx + 1], nrows=2)
            merged_cols = []
            for col_tuple in df_multi.columns:
                p_col = str(col_tuple[0]).strip() if not str(col_tuple[0]).startswith("Unnamed:") else ""
                c_col = str(col_tuple[1]).strip() if not str(col_tuple[1]).startswith("Unnamed:") else ""
                
                if p_col and c_col and p_col.lower() != c_col.lower():
                    merged_cols.append(f"{p_col} - {c_col}")
                elif c_col:
                    merged_cols.append(c_col)
                elif p_col:
                    merged_cols.append(p_col)
            
            final_cols = [c for c in merged_cols if c and not c.replace(".", "").isdigit()]
            if final_cols:
                return final_cols

        # Fallback single header
        df_single = pd.read_excel(file_path, sheet_name=sheet_name, header=best_row_idx, nrows=2)
        return [
            str(c).strip() 
            for c in df_single.columns 
            if str(c).strip() and not str(c).startswith("Unnamed:") and not str(c).replace(".", "").isdigit()
        ]
    except Exception as e:
        print(f"[-] Gagal mengekstrak header kolom pada sheet {sheet_name}: {e}")
        return []


def inspect_and_save_file(
    file_bytes: bytes, filename: str, tipe_proses: str = None, cedant: str = None
) -> dict:
    file_id = f"file_{uuid.uuid4().hex}"
    saved_path = os.path.join(TEMP_UPLOAD_DIR, f"{file_id}_{filename}")
    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    available_sheets = []
    sheet_columns = {}
    lower_name = filename.lower()

    if lower_name.endswith((".xlsx", ".xlsm", ".xltx", ".xls")):
        try:
            wb = openpyxl.load_workbook(saved_path, read_only=True, data_only=True)
            for ws in wb.worksheets:
                is_hidden = ws.sheet_state in ["hidden", "veryHidden"]
                available_sheets.append({"name": ws.title, "is_hidden": is_hidden})
            wb.close()
        except Exception:
            excel_obj = pd.ExcelFile(saved_path)
            available_sheets = [{"name": s, "is_hidden": False} for s in excel_obj.sheet_names]

        for s in available_sheets:
            sheet_columns[s["name"]] = extract_excel_columns_dynamically(saved_path, s["name"])

    elif lower_name.endswith(".csv"):
        available_sheets = [{"name": "CSV_DATA", "is_hidden": False}]
        try:
            df_header = pd.read_csv(saved_path, nrows=3)
            sheet_columns["CSV_DATA"] = [str(c).strip() for c in df_header.columns]
        except Exception:
            sheet_columns["CSV_DATA"] = []

    visible_first = next(
        (s["name"] for s in available_sheets if not s["is_hidden"]),
        available_sheets[0]["name"] if available_sheets else "",
    )

    return {
        "file_id": file_id,
        "available_sheets": [s["name"] for s in available_sheets],
        "sheet_details": available_sheets,
        "sheet_columns": sheet_columns,
        "default_sheet": visible_first,
        "saved_path": saved_path,
    }


# ==========================================
# DATABASE CHECKS & DDL EXECUTION
# ==========================================

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
                "status": (
                    "MATCH"
                    if sanitize_column_name(col) in db_columns
                    else "MISSING_IN_DB"
                ),
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
        sql_type = col.get("suggested_sql_type") or infer_sql_type_dynamically(
            safe_col_name
        )
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