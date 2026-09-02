from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database.connection import get_db
from app.models.etl_log import EtlActivityLog
from app.models.mapping_preset import MappingPreset
from app.models.user import AppUser

router = APIRouter()


class SavePresetRequest(BaseModel):
    cedant_code: str
    cob: str
    category: str
    preset_name: str
    mapping_json: str
    created_by: Optional[int] = None


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
                    "mapping_config": log.mapping_config,
                    "technical_log": log.technical_log,
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
        if cedant and cedant.upper() != "ALL":
            query = query.filter(MappingPreset.cedant_code.ilike(f"%{cedant}%"))
        if cob and cob.upper() != "ALL":
            query = query.filter(MappingPreset.cob.ilike(f"%{cob}%"))
        if category and category.upper() != "ALL":
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


@router.post("/presets", status_code=status.HTTP_201_CREATED, summary="Save New Column Mapping Preset")
def save_mapping_preset(
    payload: SavePresetRequest,
    db: Session = Depends(get_db)
):
    """
    Menyimpan preset mapping baru ke database.
    """
    try:
        preset = MappingPreset(
            cedant_code=payload.cedant_code.lower().strip(),
            cob=payload.cob.upper().strip(),
            category=payload.category.lower().strip(),
            preset_name=payload.preset_name.strip(),
            mapping_json=payload.mapping_json,
            created_by=payload.created_by
        )
        db.add(preset)
        db.commit()
        db.refresh(preset)
        return {
            "status": "success",
            "message": "Preset mapping berhasil disimpan.",
            "data": {
                "id": preset.id,
                "preset_name": preset.preset_name,
                "cedant_code": preset.cedant_code,
                "cob": preset.cob,
                "category": preset.category
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan preset mapping: {str(e)}")


@router.delete("/presets/{preset_id}", summary="Delete Column Mapping Preset")
def delete_mapping_preset(
    preset_id: int,
    db: Session = Depends(get_db)
):
    """
    Menghapus preset mapping dari database.
    """
    preset = db.query(MappingPreset).filter(MappingPreset.id == preset_id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset tidak ditemukan.")
    
    db.delete(preset)
    db.commit()
    return {"status": "success", "message": f"Preset '{preset.preset_name}' berhasil dihapus."}
