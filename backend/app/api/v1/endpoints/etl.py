import os
import re
import time
import json
from typing import Any, Dict, List, Optional
import pandas as pd
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from app.core.config import SHEET_TO_TABLE_MAPPING
from app.database.connection import SessionLocal
from app.database.loader import insert_data_to_db, load_dataframe_to_postgres, make_unique_column_names
from app.models.etl_log import EtlActivityLog
from app.models.mapping_preset import MappingPreset
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
    category: Optional[str] = "claim"
    cob: Optional[str] = "fire"
    period: Optional[str] = ""
    received_date: Optional[str] = ""
    selected_sheet: Optional[str] = ""
    column_mapping: Dict[str, Optional[str]] = {}
    non_ipr_mapping: Optional[Dict[str, Any]] = None


class EtlMappingRequest(BaseModel):
    cedant_code: str
    cedant_name: Optional[str] = None
    activity_title: Optional[str] = "BATCH-ETL"
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

            # ------------------------------------------------------------------
            # 1. TARGET TABLE CONSTRUCTION (STRICT CONFIG.PY SYNC)
            # ------------------------------------------------------------------
            clean_cat = re.sub(r"[^a-zA-Z0-9_]", "", str(file_info.category or "claim").lower())
            clean_ced = re.sub(r"[^a-zA-Z0-9_]", "", payload.cedant_code.lower())

            raw_sheet = str(file_info.selected_sheet or "").lower().strip()
            raw_cob_input = str(file_info.cob or "").lower().strip()

            # A. Cek pencocokan eksplisit dari SHEET_TO_TABLE_MAPPING di config.py
            detected_cob_from_config = SHEET_TO_TABLE_MAPPING.get(raw_sheet)

            # B. Evaluasi Hierarki COB
            if detected_cob_from_config:
                clean_cob = detected_cob_from_config
            elif any(fc in clean_ced for fc in ["aca", "buana", "buanaindependent", "tripakarta", "tugu", "astra"]):
                clean_cob = "fire"
            elif any(cc in clean_ced for cc in ["jakre", "jakrejabar", "jamkrida", "jamkridajabar", "askrida"]):
                clean_cob = "credit"
            else:
                if "credit" in raw_cob_input or "kredit" in raw_cob_input:
                    clean_cob = "credit"
                elif "fire" in raw_cob_input or "kebakaran" in raw_cob_input:
                    clean_cob = "fire"
                elif raw_cob_input:
                    clean_cob = re.sub(r"[^a-zA-Z0-9_]", "", raw_cob_input)
                else:
                    clean_cob = "fire"

            target_table_name = f"{clean_cat}_{clean_ced}_{clean_cob}"

            # 2. Baca data berdasarkan format berkas (CSV vs Excel)
            is_csv = file_path.lower().endswith(".csv")

            if is_csv:
                df_raw = pd.read_csv(file_path)
            else:
                excel_obj = pd.ExcelFile(file_path)
                selected_sheet = file_info.selected_sheet
                if not selected_sheet or selected_sheet not in excel_obj.sheet_names:
                    selected_sheet = excel_obj.sheet_names[0]

                # Deteksi baris header aktual
                df_preview = pd.read_excel(file_path, sheet_name=selected_sheet, header=None, nrows=25)
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

                has_sub_header = False
                if best_row_idx + 1 < len(df_preview):
                    next_row_vals = [str(val).strip() for val in df_preview.iloc[best_row_idx + 1] if pd.notnull(val) and str(val).strip() != ""]
                    sub_keywords = {"start", "end", "%", "in amount", "amount", "or", "qs", "surplus", "others", "md", "machinery", "stock", "tpl", "bi"}
                    if sum(1 for v in next_row_vals if v.lower() in sub_keywords) >= 2:
                        has_sub_header = True

                if has_sub_header:
                    df_raw = pd.read_excel(file_path, sheet_name=selected_sheet, header=[best_row_idx, best_row_idx + 1])
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
                    df_raw = pd.read_excel(file_path, sheet_name=selected_sheet, header=best_row_idx)

            # 3. Bangun DataFrame Terstandarisasi dengan Seluruh Kolom IPR (Lengkap + NULL jika unmapped)
            is_claim_op = ("claim" in clean_cat) or ("klaim" in clean_cat)
            is_credit_op = ("credit" in clean_cob) or ("kredit" in clean_cob)
            schema_key = f"{'CREDIT' if is_credit_op else 'FIRE'}_{'CLAIM' if is_claim_op else 'PREMIUM'}"
            
            canonical_ipr_schemas = {
                "FIRE_PREMIUM": [
                    "no", "cob", "policy_number", "certificate_number", "insured_name", "insured_affiliation",
                    "period_start", "period_end", "uw_year", "coverage", "policy_type", "currency",
                    "si_md_building", "si_machinery", "si_stock", "si_tpl", "si_bi", "si_others",
                    "tsi_100_percent", "basis_of_indemnity", "pml_amount", "pml_percentage", "eq_zone",
                    "occupation_code", "occupation", "location", "zip_code", "latitude", "longitude",
                    "construction_class", "source_business", "is_endorsement", "endorsement_effective_date",
                    "endorsement_description", "cedant_share_percent", "cedant_share_amount",
                    "total_coinsurance_panels", "risk_or", "risk_qs", "risk_surplus", "risk_others",
                    "premium_100_percent", "premium_gross_rate", "discount", "first_loss_scale",
                    "premium_net_rate", "ceded_premium_100", "indonesia_re_share_premium",
                    "special_acceptance", "special_acceptance_desc", "note"
                ],
                "FIRE_CLAIM": [
                    "no", "cob", "claim_ref_number", "policy_number", "certificate_number",
                    "reff_bordereaux_premium", "insured_name", "period_start", "period_end", "uw_year",
                    "occupation_code", "occupation", "location", "zip_code", "latitude", "longitude",
                    "date_of_loss", "settled_date", "proximate_cause", "cause_of_loss", "coverage_affected",
                    "currency", "claim_md_building", "claim_machinery", "claim_stock", "claim_tpl",
                    "claim_bi", "claim_other", "claim_adjuster_fee", "total_incurred_claim_100",
                    "cedant_share_percent", "cedant_share_amount", "claim_or", "claim_qs", "claim_surplus",
                    "claim_others", "type_of_loss", "paid_claims_reinsurer_share",
                    "outstanding_claims_reinsurer_share", "paid_claims_indonesia_re_share",
                    "outstanding_claims_indonesia_re_share", "note"
                ],
                "CREDIT_PREMIUM": [
                    "no", "policy_number", "insured_name", "date_of_birth", "tsi_100_percent",
                    "period_start", "period_end", "tenor_months", "premium_100_percent",
                    "indonesia_re_share_premium", "note"
                ],
                "CREDIT_CLAIM": [
                    "no", "claim_ref_number", "policy_number", "insured_name", "date_of_loss",
                    "cause_of_loss", "total_incurred_claim_100", "paid_claims_indonesia_re_share", "note"
                ]
            }
            canonical_cols = canonical_ipr_schemas.get(schema_key, canonical_ipr_schemas["FIRE_PREMIUM"])

            df_transformed = pd.DataFrame(index=df_raw.index)

            # A. Isi seluruh kolom IPR (data dari Excel jika di-mapping, atau NULL jika unmapped)
            user_mapping = file_info.column_mapping or {}
            for ipr_col in canonical_cols:
                src_col = user_mapping.get(ipr_col)
                if src_col and src_col in df_raw.columns:
                    df_transformed[ipr_col] = df_raw[src_col]
                else:
                    df_transformed[ipr_col] = None

            # B. Tambahkan kolom Non-IPR kustom yang diaktifkan
            active_non_ipr_columns = []
            if file_info.non_ipr_mapping:
                for source_col, cfg in file_info.non_ipr_mapping.items():
                    if isinstance(cfg, dict):
                        is_enabled = cfg.get("enabled", True)
                        target_db_name = cfg.get("dbField", source_col)
                    else:
                        is_enabled = getattr(cfg, "enabled", True)
                        target_db_name = getattr(cfg, "dbField", source_col)

                    clean_non_ipr = re.sub(r"[^a-zA-Z0-9_]", "_", str(target_db_name).strip().lower())
                    clean_non_ipr = re.sub(r"_+", "_", clean_non_ipr).strip("_")
                    if is_enabled and source_col in df_raw.columns and clean_non_ipr not in df_transformed.columns:
                        df_transformed[clean_non_ipr] = df_raw[source_col]
                        active_non_ipr_columns.append({"source": source_col, "target": clean_non_ipr})

            # 4. Format Periode & Cedant Name
            raw_period = str(file_info.period or "").strip()
            raw_year = str(file_info.received_date or "").strip()
            full_period = f"{raw_period.upper()} {raw_year}".strip() if (raw_year and raw_year not in raw_period) else raw_period.upper().strip()

            for reserved_col in ["period", "cedant_name"]:
                if reserved_col in df_transformed.columns:
                    df_transformed.drop(columns=[reserved_col], inplace=True)

            df_transformed["period"] = full_period
            df_transformed["cedant_name"] = cedant_label
            df_transformed.columns = make_unique_column_names(df_transformed.columns)

            # 5. Hapus Baris Kosong / Total Invalid
            if not df_transformed.empty:
                mapped_db_cols = [k for k, v in (file_info.column_mapping or {}).items() if v and k in df_transformed.columns]
                if not mapped_db_cols:
                    mapped_db_cols = [c for c in df_transformed.columns if c not in ["period", "cedant_name"]]

                if mapped_db_cols:
                    valid_mask = df_transformed[mapped_db_cols].apply(
                        lambda row: any(
                            pd.notna(val) and str(val).strip().lower() not in ['', 'nan', 'none', 'null', '<na>', 'total', 'jumlah']
                            for val in row
                        ),
                        axis=1
                    )
                    df_transformed = df_transformed[valid_mask].copy()

                df_transformed.reset_index(drop=True, inplace=True)

            # 6. Execution Load ke Database
            chunk_size = 200
            total_rows_loaded = 0
            
            if not df_transformed.empty:
                for i in range(0, len(df_transformed), chunk_size):
                    df_chunk = df_transformed.iloc[i : i + chunk_size].copy()
                    loaded = load_dataframe_to_postgres(df_chunk, target_table_name)
                    total_rows_loaded += (loaded if isinstance(loaded, int) else len(df_chunk))
            
            rows_loaded = total_rows_loaded
            duration_ms = int((time.time() - start_time) * 1000)

            # 7. Catat Log Aktivitas
            try:
                file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
                mapping_config_json = json.dumps({
                    "ipr_mapping": file_info.column_mapping or {},
                    "non_ipr_mapping": file_info.non_ipr_mapping or {},
                    "selected_sheet": file_info.selected_sheet,
                    "total_source_columns": len(df_raw.columns) if 'df_raw' in locals() else 0,
                    "total_target_columns": len(df_transformed.columns) if 'df_transformed' in locals() else 0,
                })
                technical_log_text = (
                    f"[START] Memulai pemrosesan berkas: {file_info.file_id}\n"
                    f"[INSPECT] Sheet terpilih: {file_info.selected_sheet or 'Default'}\n"
                    f"[TRANSFORM] Berhasil memetakan {len([k for k, v in (file_info.column_mapping or {}).items() if v])} kolom IPR dan {len(active_non_ipr_columns)} kolom Non-IPR.\n"
                    f"[CLEAN] Sanitasi data numerik, tanggal, dan teks mata uang selesai.\n"
                    f"[LOAD] Injeksi {rows_loaded} baris ke tabel PostgreSQL '{target_table_name}' berhasil dalam {duration_ms} ms.\n"
                    f"[STATUS] Eksekusi pipeline tuntas dengan status SUCCESS."
                )

                with SessionLocal() as db_session:
                    log_entry = EtlActivityLog(
                        cedant_code=payload.cedant_code.lower(),
                        cedant_name=cedant_label,
                        cob=clean_cob.upper(),
                        category=clean_cat,
                        target_table=target_table_name,
                        period=full_period,
                        file_name=file_info.file_id,
                        file_size_bytes=file_size,
                        rows_inserted=rows_loaded,
                        status="success",
                        duration_ms=duration_ms,
                        mapping_config=mapping_config_json,
                        technical_log=technical_log_text,
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
                "ipr_mapped_count": len([k for k, v in (file_info.column_mapping or {}).items() if v]),
                "non_ipr_added_count": len(active_non_ipr_columns),
                "period": full_period,
                "cedant_name": cedant_label,
                "duration_ms": duration_ms,
            })
            
        return {"status": "success", "processed_files": results}
    except HTTPException:
        raise
    except Exception as e:
        try:
            with SessionLocal() as db_session:
                err_entry = EtlActivityLog(
                    cedant_code=payload.cedant_code.lower(),
                    cedant_name=str(payload.cedant_name or payload.cedant_code).upper().strip(),
                    cob="UNKNOWN",
                    category="claim",
                    target_table="error_log",
                    period="",
                    file_name="",
                    rows_inserted=0,
                    status="failed",
                    error_message=str(e),
                )
                db_session.add(err_entry)
                db_session.commit()
        except Exception:
            pass
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