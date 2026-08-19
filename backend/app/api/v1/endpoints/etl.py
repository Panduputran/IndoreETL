from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.inspector_service import (
    inspect_and_save_file,
    check_target_table_in_db,
    execute_create_table,
    get_target_table_name,
)
from app.services.etl_factory import run_etl_service
from app.utils.helpers import get_temp_file_path, clean_dict_for_json
from app.database.loader import insert_data_to_db

router = APIRouter()


class CheckDBRequest(BaseModel):
    file_id: str
    tipe_proses: str
    cedant: str
    target_sheet: str
    custom_table_name: Optional[str] = None


class ColumnSchema(BaseModel):
    column_name: str
    suggested_sql_type: str


class CreateTableRequest(BaseModel):
    table_name: str
    columns: List[ColumnSchema]


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


# --- ENDPOINTS ---


@router.post("/inspect", summary="Upload & Inspect File")
async def inspect_file(
    file: UploadFile = File(...), tipe_proses: str = Form(...), cedant: str = Form(...)
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
            custom_table_name=payload.custom_table_name,  # <- Teruskan custom_table_name
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal mengecek DB: {str(e)}")


@router.post("/create-table", summary="Create Table in PostgreSQL")
async def create_table_endpoint(payload: CreateTableRequest):
    try:
        result = execute_create_table(
            table_name=payload.table_name,
            schema_ddl=[col.dict() for col in payload.columns],
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal membuat tabel: {str(e)}")


@router.post("/process", summary="Process Single File ETL")
def process_etl(payload: ProcessETLRequest):
    try:
        file_path = get_temp_file_path(payload.file_id)
        periode_lengkap = f"{payload.kuartal.upper().strip()} {payload.tahun.strip()}"

        # 1. Eksekusi Orchestrator Factory
        df_clean = run_etl_service(
            cedant=payload.cedant.strip().lower(),
            tipe_proses=payload.tipe_proses.strip().lower(),
            file_path=file_path,
            target_sheet=payload.target_sheet,
            periode_lengkap=periode_lengkap,
            override_cob=payload.override_cob,
        )

        # Validasi jika dataframe kosong sebelum insert
        if df_clean is None or df_clean.empty:
            raise ValueError(
                f"Dataframe kosong setelah diproses! Periksa target sheet '{payload.target_sheet}' atau format file."
            )

        # 2. Hapus duplikasi jika dicentang
        if payload.deduplicate:
            df_clean = df_clean.drop_duplicates(keep="first")

        # 3. Penentuan nama tabel dinamis
        target_table = get_target_table_name(
            tipe_proses=payload.tipe_proses,
            cedant=payload.cedant,
            selected_sheet=payload.target_sheet,
            override_cob=payload.override_cob,
            custom_table_name=payload.custom_table_name,
        )

        # 4. Insert bulk ke PostgreSQL
        insert_data_to_db(df_clean, target_table)

        # Siapkan sample preview 1 baris pertama yang aman untuk JSON
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
def process_etl_batch(payloads: List[ProcessETLRequest]):  # Gunakan 'def'
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

            if item.deduplicate:
                df_clean = df_clean.drop_duplicates(keep="first")

            target_table = get_target_table_name(
                tipe_proses=item.tipe_proses,
                cedant=item.cedant,
                selected_sheet=item.target_sheet,
                override_cob=item.override_cob,
                custom_table_name=item.custom_table_name,
            )

            insert_data_to_db(df_clean, target_table)

            results.append(
                {
                    "item_index": idx + 1,
                    "status": "success",
                    "file_id": item.file_id,
                    "target_sheet": item.target_sheet,
                    "target_table": target_table,
                    "rows_inserted": len(df_clean),
                }
            )
        except Exception as e:
            results.append(
                {
                    "item_index": idx + 1,
                    "status": "failed",
                    "file_id": item.file_id,
                    "error_message": str(e),
                }
            )

    return {
        "status": "completed",
        "total_requested": len(payloads),
        "total_success": sum(1 for r in results if r["status"] == "success"),
        "total_failed": sum(1 for r in results if r["status"] == "failed"),
        "batch_details": results,
    }
