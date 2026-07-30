from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel

from app.utils.helpers import ensure_directories_exist
from app.services.inspector import (
    inspect_and_save_file, 
    check_target_table_in_db, 
    execute_create_table
)
from app.services.premi import proses_data_premi
from app.services.claim import proses_data_claim

app = FastAPI(
    title="IndonesiaRe ETL API",
    description="Backend Service untuk Processing Bordero Multi-Cedant",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    ensure_directories_exist()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------
# 1. INSPECT (UPLOAD FILE ONCE -> GET FILE_ID)
# --------------------------------------------------------
@app.post("/api/v1/inspect", tags=["ETL Services"])
async def inspect_file(
    file: UploadFile = File(...),
    tipe_proses: str = Form(...),  # 'premi' / 'claim'
    cedant: str = Form(...)        # 'aca' / 'tripakarta' / 'buanaindependent'
):
    try:
        contents = await file.read()
        result = inspect_and_save_file(
            file_bytes=contents,
            filename=file.filename,
            tipe_proses=tipe_proses,
            cedant=cedant
        )
        return {
            "status": "success",
            "filename": file.filename,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal memindai file: {str(e)}")

# --------------------------------------------------------
# 2. CHECK DB (PAKAI FILE_ID)
# --------------------------------------------------------
class CheckDBRequest(BaseModel):
    file_id: str
    tipe_proses: str
    cedant: str
    target_sheet: str
    custom_table_name: str | None = None  

@app.post("/api/v1/check-db", tags=["ETL Services"])
async def check_db_endpoint(payload: CheckDBRequest):
    try:
        result = check_target_table_in_db(
            file_id=payload.file_id,
            tipe_proses=payload.tipe_proses,
            cedant=payload.cedant,
            target_sheet=payload.target_sheet
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal mengecek DB: {str(e)}")

# --------------------------------------------------------
# 3. CREATE TABLE
# --------------------------------------------------------
class ColumnSchema(BaseModel):
    column_name: str
    suggested_sql_type: str

class CreateTableRequest(BaseModel):
    table_name: str
    columns: List[ColumnSchema]

@app.post("/api/v1/create-table", tags=["Database Management"])
async def create_table_endpoint(payload: CreateTableRequest):
    try:
        result = execute_create_table(
            table_name=payload.table_name,
            schema_ddl=[col.dict() for col in payload.columns]
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal membuat tabel: {str(e)}")

# --------------------------------------------------------
# 4. PROCESS ETL (PAKAI FILE_ID)
# --------------------------------------------------------
class ProcessETLRequest(BaseModel):
    file_id: str
    tipe_proses: str
    cedant: str
    target_sheet: str
    kuartal: str
    tahun: str
    override_cob: str | None = None

@app.post("/api/v1/process", tags=["ETL Services"])
async def process_etl(payload: ProcessETLRequest):
    try:
        tipe = payload.tipe_proses.lower().strip()

        if tipe == "premi":
            hasil = proses_data_premi(
                file_id=payload.file_id,
                target_sheet=payload.target_sheet,
                cedant=payload.cedant,
                kuartal=payload.kuartal,
                tahun=payload.tahun,
                tipe_proses=payload.tipe_proses,
                override_cob=payload.override_cob
            )
            return {
                "status": "success",
                "message": f"Data PREMI {payload.cedant.upper()} berhasil diproses!",
                "detail": hasil
            }
            
        elif tipe == "claim":
            hasil = proses_data_claim(
                file_id=payload.file_id,
                target_sheet=payload.target_sheet,
                cedant=payload.cedant,
                kuartal=payload.kuartal,
                tahun=payload.tahun,
                tipe_proses=payload.tipe_proses,
                override_cob=payload.override_cob
            )
            return {
                "status": "success",
                "message": f"Data CLAIM {payload.cedant.upper()} berhasil diproses!",
                "detail": hasil
            }
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Tipe proses '{payload.tipe_proses}' tidak dikenal. Gunakan 'premi' atau 'claim'."
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses ETL: {str(e)}")


# --------------------------------------------------------
# 5. BATCH PROCESS ETL (SUPPORT MULTIPLE SHEETS / FILES)
# --------------------------------------------------------
@app.post("/api/v1/process-batch", tags=["ETL Services"])
async def process_etl_batch(payloads: List[ProcessETLRequest]):
    results = []
    
    for idx, item in enumerate(payloads):
        tipe = item.tipe_proses.lower().strip()
        item_id = f"Item #{idx+1} ({item.target_sheet})"
        
        try:
            if tipe == "premi":
                hasil = proses_data_premi(
                    file_id=item.file_id,
                    target_sheet=item.target_sheet,
                    cedant=item.cedant,
                    kuartal=item.kuartal,
                    tahun=item.tahun,
                    tipe_proses=item.tipe_proses,
                    override_cob=item.override_cob
                )
            elif tipe == "claim":
                hasil = proses_data_claim(
                    file_id=item.file_id,
                    target_sheet=item.target_sheet,
                    cedant=item.cedant,
                    kuartal=item.kuartal,
                    tahun=item.tahun,
                    tipe_proses=item.tipe_proses,
                    override_cob=item.override_cob
                )
            else:
                raise ValueError(f"Tipe proses '{item.tipe_proses}' tidak dikenal.")

            results.append({
                "item_index": idx + 1,
                "status": "success",
                "file_id": item.file_id,
                "target_sheet": item.target_sheet,
                "tipe_proses": tipe,
                "detail": hasil
            })

        except Exception as e:
            results.append({
                "item_index": idx + 1,
                "status": "failed",
                "file_id": item.file_id,
                "target_sheet": item.target_sheet,
                "tipe_proses": tipe,
                "error_message": str(e)
            })

    # Rekap hasil batch
    total_success = sum(1 for r in results if r["status"] == "success")
    total_failed = sum(1 for r in results if r["status"] == "failed")

    return {
        "status": "completed",
        "total_requested": len(payloads),
        "total_success": total_success,
        "total_failed": total_failed,
        "batch_details": results
    }