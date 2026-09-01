from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database.connection import get_db
from app.models.etl_log import EtlActivityLog
from app.models.mapping_preset import MappingPreset
from app.models.user import AppUser

router = APIRouter()


@router.get("/logs", summary="Get ETL Activity Logs with Filter & Pagination")
def get_etl_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    cedant: Optional[str] = Query(None),
    cob: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Mengambil riwayat proses ETL bordero dari tabel etl_activity_log.
    """
    try:
        query = db.query(EtlActivityLog)

        if cedant and cedant.upper() != "ALL":
            query = query.filter(EtlActivityLog.cedant_code.ilike(f"%{cedant}%"))
        if cob and cob.upper() != "ALL":
            query = query.filter(EtlActivityLog.cob.ilike(f"%{cob}%"))
        if category and category.upper() != "ALL":
            query = query.filter(EtlActivityLog.category.ilike(f"%{category}%"))
        if status and status.upper() != "ALL":
            query = query.filter(EtlActivityLog.status.ilike(f"%{status}%"))

        total_rows = query.count()
        offset = (page - 1) * limit
        logs = query.order_by(desc(EtlActivityLog.executed_at)).offset(offset).limit(limit).all()

        return {
            "status": "success",
            "page": page,
            "limit": limit,
            "total_rows": total_rows,
            "total_pages": max(1, (total_rows + limit - 1) // limit),
            "data": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "cedant_code": log.cedant_code,
                    "cedant_name": log.cedant_name,
                    "cob": log.cob,
                    "category": log.category,
                    "target_table": log.target_table,
                    "period": log.period,
                    "file_name": log.file_name,
                    "file_size_bytes": log.file_size_bytes,
                    "rows_inserted": log.rows_inserted,
                    "rows_deleted": log.rows_deleted,
                    "status": log.status,
                    "error_message": log.error_message,
                    "duration_ms": log.duration_ms,
                    "executed_at": log.executed_at.isoformat() if log.executed_at else None,
                }
                for log in logs
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil log aktivitas ETL: {str(e)}")


@router.get("/presets", summary="Get Saved Column Mapping Presets")
def get_mapping_presets(
    cedant: Optional[str] = Query(None),
    cob: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Mengambil daftar preset pemetaan kolom per cedant dan COB.
    """
    try:
        query = db.query(MappingPreset)
        if cedant:
            query = query.filter(MappingPreset.cedant_code.ilike(f"%{cedant}%"))
        if cob:
            query = query.filter(MappingPreset.cob.ilike(f"%{cob}%"))
        if category:
            query = query.filter(MappingPreset.category.ilike(f"%{category}%"))

        presets = query.order_by(desc(MappingPreset.created_at)).all()
        return {
            "status": "success",
            "data": [
                {
                    "id": p.id,
                    "cedant_code": p.cedant_code,
                    "cob": p.cob,
                    "category": p.category,
                    "preset_name": p.preset_name,
                    "mapping_json": p.mapping_json,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                }
                for p in presets
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil preset mapping: {str(e)}")
