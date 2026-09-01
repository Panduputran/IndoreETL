import os
import re
from typing import Dict, List, Optional
import pandas as pd
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

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


class FileMappingPayload(BaseModel):
    file_id: str
    category: str
    cob: str
    period: str
    received_date: str
    selected_sheet: str
    column_mapping: Dict[str, Optional[str]] # { "target_field": "source_column" }

class EtlMappingRequest(BaseModel):
    cedant_code: str
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
        for file_info in payload.files:
            file_path = get_temp_file_path(file_info.file_id)
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail=f"Berkas {file_info.file_id} tidak ditemukan.")

            df_raw = read_excel_dynamic_header(file_path, sheet_name=file_info.selected_sheet)

            # Invert mapping: { "KOLOM_EXCEL_ASLI": "target_db_field" }
            rename_map = {}
            for target_field, source_col in file_info.column_mapping.items():
                if source_col and source_col in df_raw.columns:
                    rename_map[source_col] = target_field

            # 1. Rename kolom yang di-mapping
            df_transformed = df_raw.rename(columns=rename_map)

            # 2. Injeksi kolom metadata sistem jika belum ada
            if "period" not in df_transformed.columns:
                df_transformed["period"] = file_info.period
            if "cob" not in df_transformed.columns:
                df_transformed["cob"] = file_info.cob
            if "received_year" not in df_transformed.columns:
                df_transformed["received_year"] = file_info.received_date

            # 3. Format nama tabel fisik PostgreSQL
            clean_cat = re.sub(r'[^a-zA-Z0-9_]', '', file_info.category.lower())
            clean_ced = re.sub(r'[^a-zA-Z0-9_]', '', payload.cedant_code.lower())
            clean_cob = re.sub(r'[^a-zA-Z0-9_]', '', file_info.cob.lower())
            target_table_name = f"{clean_cat}_{clean_ced}_{clean_cob}"

            # 4. Simpan ke database
            rows_loaded = load_dataframe_to_postgres(df_transformed, target_table_name)

            results.append({
                "file_id": file_info.file_id,
                "table_name": target_table_name,
                "total_columns": len(df_transformed.columns),
                "rows_loaded": rows_loaded,
            })

        return {"status": "success", "processed_files": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses ETL: {str(e)}")


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