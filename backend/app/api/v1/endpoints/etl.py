import os
import re
import time
from typing import Dict, List, Optional
import pandas as pd
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.database.connection import SessionLocal
from app.models.etl_log import EtlActivityLog
from app.models.mapping_preset import MappingPreset
from app.database.loader import insert_data_to_db, load_dataframe_to_postgres
from app.services.etl_factory import run_etl_service
from app.services.inspector_service import (
    check_target_table_in_db,
    execute_create_table,
    get_target_table_name,
    inspect_and_save_file,
)
from app.utils.helpers import clean_dict_for_json, get_temp_file_path

router = APIRouter()


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class ColumnSchema(BaseModel):
    column_name: str
    suggested_sql_type: str


class CreateTableRequest(BaseModel):
    table_name: str
    columns: List[ColumnSchema]


class CheckDBRequest(BaseModel):
    file_id: str
    tipe_proses: str
    cedant: str
    target_sheet: str
    custom_table_name: Optional[str] = None


class ProcessETLRequest(BaseModel):
    file_id: str
    tipe_proses: str
    cedant: str
    target_sheet: str
    kuartal: str
    tahun: str
    override_cob: Optional[str] = None
    custom_table_name: Optional[str] = None
    deduplicate: bool = False


class NonIprFieldConfig(BaseModel):
    enabled: bool = True
    dbField: str
    sqlType: str


class FileMappingPayload(BaseModel):
    file_id: str
    category: str
    cob: str
    period: str
    received_date: str
    selected_sheet: str
    column_mapping: Dict[str, Optional[str]]
    non_ipr_mapping: Optional[Dict[str, NonIprFieldConfig]] = None


class EtlMappingRequest(BaseModel):
    cedant_code: str
    cedant_name: Optional[str] = None
    activity_title: str
    files: List[FileMappingPayload]


# ==========================================
# ENDPOINTS
# ==========================================

@router.post("/inspect", summary="Upload & Inspect File")
async def inspect_file(
    file: UploadFile = File(...),
    tipe_proses: str = Form(...),
    cedant: str = Form(...)
):
    try:
        contents = await file.read()
        result = inspect_and_save_file(
            file_bytes=contents,
            filename=file.filename,
            tipe_proses=tipe_proses,
            cedant=cedant,
        )
        return {"status": "success", "filename": file.filename, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal memindai file: {str(e)}")


@router.post("/check-db", summary="Check Database Table Existence")
async def check_db_endpoint(payload: CheckDBRequest):
    try:
        result = check_target_table_in_db(
            file_id=payload.file_id,
            tipe_proses=payload.tipe_proses,
            cedant=payload.cedant,
            target_sheet=payload.target_sheet,
            custom_table_name=payload.custom_table_name,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal mengecek database: {str(e)}")


@router.post("/create-table", summary="Create Table in PostgreSQL")
async def create_table_endpoint(payload: CreateTableRequest):
    try:
        result = execute_create_table(
            table_name=payload.table_name,
            schema_ddl=[col.model_dump() for col in payload.columns],
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal membuat tabel: {str(e)}")


@router.post("/process-with-mapping", summary="Process ETL with Custom Dynamic Mapping")
def process_etl_with_mapping(payload: EtlMappingRequest):
    try:
        results = []
        cedant_label = str(payload.cedant_name or payload.cedant_code).upper().strip()

        header_keywords = {
            "no", "polis", "policy", "insured", "tertanggung", "name", "nama", 
            "start", "end", "mulai", "akhir", "tsi", "premi", "premium", "claim", 
            "klaim", "curr", "currency", "date", "tanggal", "share", "rate", "cob",
            "certificate", "sertifikat", "loss", "cause", "location", "lokasi",
            "dol", "spreading", "incurred", "outstanding", "paid", "reinsurer"
        }

        for file_info in payload.files:
            start_time = time.time()
            file_path = get_temp_file_path(file_info.file_id)
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail=f"Berkas {file_info.file_id} tidak ditemukan.")

            # 1. Deteksi Baris Header Aktual (Mendukung Header Bertingkat / Merged Header)
            df_preview = pd.read_excel(file_path, sheet_name=file_info.selected_sheet, header=None, nrows=25)
            
            best_row_idx = 0
            best_score = -1
            for idx, row in df_preview.iterrows():
                row_vals = [str(val).strip() for val in row if pd.notnull(val) and str(val).strip() != ""]
                if not row_vals:
                    continue
                text_cells = sum(1 for v in row_vals if not v.replace(".", "").replace(",", "").replace("-", "").replace("/", "").isdigit())
                keyword_hits = sum(3 for v in row_vals if any(kw in v.lower() for kw in header_keywords))
                score = text_cells + keyword_hits
                if score > best_score and text_cells >= 2:
                    best_score = score
                    best_row_idx = idx

            # Periksa kemungkinan sub-header di baris berikutnya
            has_sub_header = False
            if best_row_idx + 1 < len(df_preview):
                next_row_vals = [str(val).strip() for val in df_preview.iloc[best_row_idx + 1] if pd.notnull(val) and str(val).strip() != ""]
                sub_keywords = {"start", "end", "%", "in amount", "amount", "or", "qs", "surplus", "others", "md", "machinery", "stock", "tpl", "bi"}
                if sum(1 for v in next_row_vals if v.lower() in sub_keywords) >= 2:
                    has_sub_header = True

            # 2. Baca DataFrame Riil
            if has_sub_header:
                df_raw = pd.read_excel(file_path, sheet_name=file_info.selected_sheet, header=[best_row_idx, best_row_idx + 1])
                flat_cols = []
                for col_tuple in df_raw.columns:
                    p_col = str(col_tuple[0]).strip() if not str(col_tuple[0]).startswith("Unnamed:") else ""
                    c_col = str(col_tuple[1]).strip() if not str(col_tuple[1]).startswith("Unnamed:") else ""
                    if p_col and c_col and p_col.lower() != c_col.lower():
                        flat_cols.append(f"{p_col} - {c_col}")
                    elif c_col:
                        flat_cols.append(c_col)
                    elif p_col:
                        flat_cols.append(p_col)
                    else:
                        flat_cols.append(f"unnamed_{len(flat_cols)}")
                df_raw.columns = flat_cols
            else:
                df_raw = pd.read_excel(file_path, sheet_name=file_info.selected_sheet, header=best_row_idx)

            # 3. Siapkan Kamus Rename Kolom
            rename_map = {}
            active_non_ipr_columns = []
            
            # 1. Mapping Standar IPR
            for target_field, source_col in file_info.column_mapping.items():
                if source_col and source_col in df_raw.columns:
                    rename_map[source_col] = target_field

            # 2. Mapping Kolom Non-IPR (Hanya yang enabled == True)
            if file_info.non_ipr_mapping:
                for source_col, cfg in file_info.non_ipr_mapping.items():
                    is_enabled = cfg.enabled if hasattr(cfg, "enabled") else cfg.get("enabled", True)
                    if is_enabled and source_col in df_raw.columns and source_col not in rename_map:
                        target_db_name = cfg.dbField if hasattr(cfg, "dbField") else cfg.get("dbField", source_col)
                        rename_map[source_col] = target_db_name
                        active_non_ipr_columns.append({"source": source_col, "target": target_db_name})

            df_transformed = df_raw.rename(columns=rename_map)

            # Buang kolom non-IPR yang dinonaktifkan (unmapped columns)
            keep_columns = list(rename_map.values())
            df_transformed = df_transformed[[c for c in df_transformed.columns if c in keep_columns]]

            # 3. Format Periode & Cedant Name
            raw_period = str(file_info.period or "").strip()
            raw_year = str(file_info.received_date or "").strip()
            full_period = f"{raw_period.upper()} {raw_year}".strip() if (raw_year and raw_year not in raw_period) else raw_period.upper().strip()

            df_transformed["period"] = full_period
            df_transformed["cedant_name"] = cedant_label

            clean_cat = re.sub(r"[^a-zA-Z0-9_]", "", file_info.category.lower())
            clean_ced = re.sub(r"[^a-zA-Z0-9_]", "", payload.cedant_code.lower())
            clean_cob = re.sub(r"[^a-zA-Z0-9_]", "", file_info.cob.lower())
            target_table_name = f"{clean_cat}_{clean_ced}_{clean_cob}"

            rows_loaded = load_dataframe_to_postgres(df_transformed, target_table_name)
            duration_ms = int((time.time() - start_time) * 1000)

            # Catat aktivitas ke tabel etl_activity_log
            try:
                file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
                with SessionLocal() as db_session:
                    log_entry = EtlActivityLog(
                        cedant_code=payload.cedant_code.lower(),
                        cedant_name=cedant_label,
                        cob=file_info.cob.upper(),
                        category=file_info.category.lower(),
                        target_table=target_table_name,
                        period=full_period,
                        file_name=file_info.file_id,
                        file_size_bytes=file_size,
                        rows_inserted=rows_loaded,
                        status="success",
                        duration_ms=duration_ms,
                    )
                    db_session.add(log_entry)
                    db_session.commit()
            except Exception as log_err:
                print(f"[WARN] Gagal mencatat etl_activity_log: {log_err}")

            results.append({
                "file_id": file_info.file_id,
                "table_name": target_table_name,
                "total_rows_loaded": rows_loaded,
                "total_columns": len(df_transformed.columns),
                "ipr_mapped_count": len([k for k, v in file_info.column_mapping.items() if v]),
                "non_ipr_added_count": len(active_non_ipr_columns),
                "period": full_period,
                "cedant_name": cedant_label,
                "duration_ms": duration_ms,
            })
            
        return {"status": "success", "processed_files": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses ETL mapping: {str(e)}")


@router.post("/process", summary="Process Single File ETL")
def process_etl(payload: ProcessETLRequest):
    try:
        file_path = get_temp_file_path(payload.file_id)
        periode_lengkap = f"{payload.kuartal.upper().strip()} {payload.tahun.strip()}"

        df_clean = run_etl_service(
            cedant=payload.cedant.strip().lower(),
            tipe_proses=payload.tipe_proses.strip().lower(),
            file_path=file_path,
            target_sheet=payload.target_sheet,
            periode_lengkap=periode_lengkap,
            override_cob=payload.override_cob,
        )

        if df_clean is None or df_clean.empty:
            raise ValueError(
                f"Dataframe kosong setelah diproses! Periksa sheet '{payload.target_sheet}' atau format file."
            )

        if payload.deduplicate:
            df_clean = df_clean.drop_duplicates(keep="first")

        target_table = get_target_table_name(
            tipe_proses=payload.tipe_proses,
            cedant=payload.cedant,
            selected_sheet=payload.target_sheet,
            override_cob=payload.override_cob,
            custom_table_name=payload.custom_table_name,
        )

        insert_data_to_db(df_clean, target_table)

        sample_records = df_clean.head(1).to_dict(orient="records")
        preview = clean_dict_for_json(sample_records)

        return {
            "status": "success",
            "message": f"Data {payload.tipe_proses.upper()} {payload.cedant.upper()} berhasil diproses!",
            "detail": {
                "period": periode_lengkap,
                "cedant": payload.cedant,
                "target_sheet": payload.target_sheet,
                "target_table": target_table,
                "total_rows_inserted": len(df_clean),
                "sample_preview": preview,
            },
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses ETL: {str(e)}")


@router.post("/process-batch", summary="Batch Process Multiple ETL")
def process_etl_batch(payloads: List[ProcessETLRequest]):
    results = []
    for idx, item in enumerate(payloads):
        try:
            file_path = get_temp_file_path(item.file_id)
            periode_lengkap = f"{item.kuartal.upper()} {item.tahun}"

            df_clean = run_etl_service(
                cedant=item.cedant,
                tipe_proses=item.tipe_proses,
                file_path=file_path,
                target_sheet=item.target_sheet,
                periode_lengkap=periode_lengkap,
                override_cob=item.override_cob,
            )

            if item.deduplicate and df_clean is not None:
                df_clean = df_clean.drop_duplicates(keep="first")

            target_table = get_target_table_name(
                tipe_proses=item.tipe_proses,
                cedant=item.cedant,
                selected_sheet=item.target_sheet,
                override_cob=item.override_cob,
                custom_table_name=item.custom_table_name,
            )

            insert_data_to_db(df_clean, target_table)

            results.append({
                "item_index": idx + 1,
                "status": "success",
                "file_id": item.file_id,
                "target_sheet": item.target_sheet,
                "target_table": target_table,
                "rows_inserted": len(df_clean) if df_clean is not None else 0,
            })
        except Exception as e:
            results.append({
                "item_index": idx + 1,
                "status": "failed",
                "file_id": item.file_id,
                "error_message": str(e),
            })

    return {
        "status": "completed",
        "total_requested": len(payloads),
        "total_success": sum(1 for r in results if r["status"] == "success"),
        "total_failed": sum(1 for r in results if r["status"] == "failed"),
        "batch_details": results,
    }