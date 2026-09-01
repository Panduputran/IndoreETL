# app/api/v1/endpoints/tables.py
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from app.database.connection import engine
import re
from typing import Dict, List, Any


router = APIRouter()

MANDATORY_KEYWORDS = [
    "policy",
    "polis",
    "insured",
    "debitur",
    "name",
    "tsi",
    "sum_insured",
    "premium",
    "premi",
    "amount",
    "claim",
    "klaim",
    "dol",
    "loss",
    "date",
    "bank_pemegang_polis",
    "nama_peserta_debitur",
    "no_sertifikat_peserta_debitur",
]

AGGREGATE_CONFIG = {
    "all_premi_fire": {
        "cob": "FIRE",
        "category": "PREMIUM",
        "label": "Semua Premi Fire (Seluruh Cedant)",
        "filter_sql": "table_name LIKE 'premi_%' AND (table_name LIKE '%_fire' OR table_name LIKE '%fire%')",
    },
    "all_claim_fire": {
        "cob": "FIRE",
        "category": "KLAIM",
        "label": "Semua Klaim Fire (Seluruh Cedant)",
        "filter_sql": "table_name LIKE 'claim_%' AND (table_name LIKE '%_fire' OR table_name LIKE '%fire%')",
    },
    "all_premi_credit": {
        "cob": "CREDIT",
        "category": "PREMIUM",
        "label": "Semua Premi Kredit (Seluruh Cedant)",
        "filter_sql": "table_name LIKE 'premi_%' AND (table_name LIKE '%_credit%' OR table_name LIKE '%kredit%' OR table_name LIKE '%_credit')",
    },
    "all_claim_credit": {
        "cob": "CREDIT",
        "category": "KLAIM",
        "label": "Semua Klaim Kredit (Seluruh Cedant)",
        "filter_sql": "table_name LIKE 'claim_%' AND (table_name LIKE '%_credit%' OR table_name LIKE '%kredit%' OR table_name LIKE '%_credit')",
    },
}


def extract_cedant_from_tablename(tname: str) -> str:
    """Mengekstrak nama Cedant dalam bentuk label terbaca dari nama tabel fisik."""
    t = tname.lower()
    for prefix in ["premi_", "claim_"]:
        if t.startswith(prefix):
            t = t[len(prefix):]
    for suffix in ["_fire", "_credit", "_kredit"]:
        if t.endswith(suffix):
            t = t[:-len(suffix)]
    if t.startswith("credit_"):
        t = t[len("credit_"):]
    if t.startswith("kredit_"):
        t = t[len("kredit_"):]

    mapping = {
        "aca": "ACA",
        "tripakarta": "TRIPAKARTA",
        "buanaindependent": "BUANA INDEPENDENT",
        "askrida": "ASKRIDA",
        "askrindo": "ASKRINDO",
        "jakrejabar": "JAKRE JABAR",
        "jamkridajabar": "JAMKRIDA JABAR",
        "jamkrindo": "JAMKRINDO",
        "marsh": "MARSH",
    }
    return mapping.get(t, t.upper().replace("_", " "))


@router.get("/dashboard/summary")
def get_dashboard_summary():
    """
    Mengambil ringkasan statistik real-time dari seluruh tabel fisik di database:
    total baris, total tabel, distribusi COB (FIRE & KREDIT), rekapitulasi premi vs klaim,
    distribusi per cedant, serta rasio validitas data.
    """
    try:
        with engine.connect() as conn:
            tables_query = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                  AND (table_name LIKE 'premi_%' OR table_name LIKE 'claim_%')
                ORDER BY table_name ASC;
            """)
            tables = [r[0] for r in conn.execute(tables_query).fetchall()]

            total_rows_all = 0
            total_premi_rows = 0
            total_claim_rows = 0
            total_valid_rows = 0
            total_warning_rows = 0

            cob_counts = {
                "FIRE": {"total": 0, "premi": 0, "claim": 0, "valid": 0, "warning": 0, "tables_count": 0},
                "CREDIT": {"total": 0, "premi": 0, "claim": 0, "valid": 0, "warning": 0, "tables_count": 0},
            }

            cedant_map: Dict[str, Dict[str, Any]] = {}
            tables_detail: List[Dict[str, Any]] = []

            for t in tables:
                t_clean = re.sub(r"[^a-zA-Z0-9_]", "", t)
                total = conn.execute(text(f'SELECT COUNT(*) FROM "{t_clean}"')).scalar() or 0
                total_rows_all += total

                t_lower = t.lower()
                is_credit = ("credit" in t_lower or "kredit" in t_lower)
                cob_key = "CREDIT" if is_credit else "FIRE"
                is_premi = t_lower.startswith("premi_")
                type_key = "PREMIUM" if is_premi else "KLAIM"
                cedant_label = extract_cedant_from_tablename(t)

                if is_premi:
                    total_premi_rows += total
                    cob_counts[cob_key]["premi"] += total
                else:
                    total_claim_rows += total
                    cob_counts[cob_key]["claim"] += total

                cob_counts[cob_key]["total"] += total
                cob_counts[cob_key]["tables_count"] += 1

                # Cek kolom untuk validasi
                col_query = text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = :tname
                """)
                cols = [r[0] for r in conn.execute(col_query, {"tname": t_clean}).fetchall()]
                
                mandatory_cols = [
                    f'"{c}"' for c in cols 
                    if any(kw in c.lower() for kw in MANDATORY_KEYWORDS) 
                    and not any(ex in c.lower() for ex in ["no", "id", "remarks", "unnamed", "notes", "period", "cob", "cedant_name", "created_at"])
                ]

                warning_count = 0
                if mandatory_cols and total > 0:
                    warn_cond = " OR ".join([
                        f"({c} IS NULL OR TRIM(CAST({c} AS TEXT)) IN ('', 'nan', 'NaN', 'None', '<NA>'))"
                        for c in mandatory_cols
                    ])
                    warning_count = conn.execute(
                        text(f'SELECT COUNT(*) FROM "{t_clean}" WHERE ({warn_cond})')
                    ).scalar() or 0

                valid_count = total - warning_count
                total_valid_rows += valid_count
                total_warning_rows += warning_count
                cob_counts[cob_key]["valid"] += valid_count
                cob_counts[cob_key]["warning"] += warning_count

                # Agregasi per Cedant
                if cedant_label not in cedant_map:
                    cedant_map[cedant_label] = {
                        "name": cedant_label,
                        "total_rows": 0,
                        "premi_rows": 0,
                        "claim_rows": 0,
                        "tables_count": 0,
                        "cobs": set()
                    }
                cedant_map[cedant_label]["total_rows"] += total
                if is_premi:
                    cedant_map[cedant_label]["premi_rows"] += total
                else:
                    cedant_map[cedant_label]["claim_rows"] += total
                cedant_map[cedant_label]["tables_count"] += 1
                cedant_map[cedant_label]["cobs"].add(cob_key)

                tables_detail.append({
                    "table_name": t_clean,
                    "cedant": cedant_label,
                    "cob": cob_key,
                    "type": type_key,
                    "total_rows": total,
                    "valid_rows": valid_count,
                    "warning_rows": warning_count
                })

            # Format data COB untuk chart & metrik
            cob_data_formatted = [
                {
                    "name": "Fire",
                    "code": "FIRE",
                    "total": cob_counts["FIRE"]["total"],
                    "premi": cob_counts["FIRE"]["premi"],
                    "claim": cob_counts["FIRE"]["claim"],
                    "valid": cob_counts["FIRE"]["valid"],
                    "warning": cob_counts["FIRE"]["warning"],
                    "tables_count": cob_counts["FIRE"]["tables_count"],
                    "bound": cob_counts["FIRE"]["valid"],
                    "unbound": cob_counts["FIRE"]["warning"],
                },
                {
                    "name": "Kredit",
                    "code": "CREDIT",
                    "total": cob_counts["CREDIT"]["total"],
                    "premi": cob_counts["CREDIT"]["premi"],
                    "claim": cob_counts["CREDIT"]["claim"],
                    "valid": cob_counts["CREDIT"]["valid"],
                    "warning": cob_counts["CREDIT"]["warning"],
                    "tables_count": cob_counts["CREDIT"]["tables_count"],
                    "bound": cob_counts["CREDIT"]["valid"],
                    "unbound": cob_counts["CREDIT"]["warning"],
                },
            ]

            cedant_data_formatted = [
                {
                    "name": v["name"],
                    "total_rows": v["total_rows"],
                    "premi_rows": v["premi_rows"],
                    "claim_rows": v["claim_rows"],
                    "tables_count": v["tables_count"],
                    "cobs": list(v["cobs"])
                }
                for v in sorted(cedant_map.values(), key=lambda x: x["total_rows"], reverse=True)
            ]

            # -------------------------------------------------------------
            # Analitik Sistem Web (Users, Activity Logs, Presets)
            # -------------------------------------------------------------
            user_stats = {"total_users": 0, "active_users": 0, "admin_count": 0, "operator_count": 0, "viewer_count": 0}
            etl_stats = {"total_runs": 0, "success_runs": 0, "failed_runs": 0, "avg_duration_ms": 0, "recent_logs": []}
            preset_stats = {"total_presets": 0}

            try:
                # 1. User Stats
                user_res = conn.execute(text("SELECT role, is_active, COUNT(*) FROM app_users GROUP BY role, is_active")).fetchall()
                for r in user_res:
                    role, is_act, cnt = r[0], r[1], r[2]
                    user_stats["total_users"] += cnt
                    if is_act:
                        user_stats["active_users"] += cnt
                    if role == "admin":
                        user_stats["admin_count"] += cnt
                    elif role == "operator":
                        user_stats["operator_count"] += cnt
                    elif role == "viewer":
                        user_stats["viewer_count"] += cnt
            except Exception:
                pass

            try:
                # 2. ETL Activity Stats
                etl_summary = conn.execute(text("""
                    SELECT 
                        COUNT(*),
                        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END),
                        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END),
                        AVG(duration_ms)
                    FROM etl_activity_log
                """)).fetchone()

                if etl_summary and etl_summary[0]:
                    etl_stats["total_runs"] = etl_summary[0] or 0
                    etl_stats["success_runs"] = etl_summary[1] or 0
                    etl_stats["failed_runs"] = etl_summary[2] or 0
                    etl_stats["avg_duration_ms"] = int(etl_summary[3] or 0)

                recent_res = conn.execute(text("""
                    SELECT id, cedant_name, cob, category, target_table, rows_inserted, duration_ms, status, executed_at
                    FROM etl_activity_log
                    ORDER BY executed_at DESC
                    LIMIT 6
                """)).fetchall()

                etl_stats["recent_logs"] = [
                    {
                        "id": r[0],
                        "cedant": r[1],
                        "cob": r[2],
                        "category": r[3],
                        "target_table": r[4],
                        "rows": r[5],
                        "duration_ms": r[6],
                        "status": r[7],
                        "executed_at": r[8].isoformat() if r[8] else None,
                    }
                    for r in recent_res
                ]
            except Exception:
                pass

            try:
                # 3. Presets Stats
                preset_cnt = conn.execute(text("SELECT COUNT(*) FROM mapping_presets")).scalar() or 0
                preset_stats["total_presets"] = preset_cnt
            except Exception:
                pass

            return {
                "status": "success",
                "total_batches": len(tables),
                "total_rows": total_rows_all,
                "total_premi_rows": total_premi_rows,
                "total_claim_rows": total_claim_rows,
                "total_valid_rows": total_valid_rows,
                "total_warning_rows": total_warning_rows,
                "cob_data": cob_data_formatted,
                "cedant_data": cedant_data_formatted,
                "tables_detail": tables_detail,
                "system_analytics": {
                    "users": user_stats,
                    "etl": etl_stats,
                    "presets": preset_stats
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
def list_available_tables(cob: str = Query("ALL")):
    """
    Mengambil daftar seluruh tabel yang tersedia di database,
    termasuk opsi agregasi (Semua Premi / Semua Klaim) dan tabel individual per cedant.
    """
    try:
        with engine.connect() as conn:
            tables_query = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                  AND (table_name LIKE 'premi_%' OR table_name LIKE 'claim_%')
                ORDER BY table_name ASC;
            """)
            physical_tables = [r[0] for r in conn.execute(tables_query).fetchall()]

            res_tables: List[Dict[str, Any]] = []
            cob_upper = cob.upper()

            # 1. Aggregate Options
            if cob_upper in ["FIRE", "ALL"]:
                res_tables.append({
                    "id": "all_premi_fire",
                    "label": "Semua Premi Fire (Seluruh Cedant)",
                    "type": "PREMIUM",
                    "cob": "FIRE",
                    "is_aggregate": True,
                })
                res_tables.append({
                    "id": "all_claim_fire",
                    "label": "Semua Klaim Fire (Seluruh Cedant)",
                    "type": "KLAIM",
                    "cob": "FIRE",
                    "is_aggregate": True,
                })

            if cob_upper in ["CREDIT", "KREDIT", "ALL"]:
                res_tables.append({
                    "id": "all_premi_credit",
                    "label": "Semua Premi Kredit (Seluruh Cedant)",
                    "type": "PREMIUM",
                    "cob": "CREDIT",
                    "is_aggregate": True,
                })
                res_tables.append({
                    "id": "all_claim_credit",
                    "label": "Semua Klaim Kredit (Seluruh Cedant)",
                    "type": "KLAIM",
                    "cob": "CREDIT",
                    "is_aggregate": True,
                })

            # 2. Individual Tables
            for t in physical_tables:
                t_lower = t.lower()
                is_credit = "credit" in t_lower or "kredit" in t_lower
                t_cob = "CREDIT" if is_credit else "FIRE"

                if cob_upper != "ALL" and t_cob != cob_upper and not (cob_upper == "KREDIT" and t_cob == "CREDIT"):
                    continue

                is_premi = t_lower.startswith("premi_")
                t_type = "PREMIUM" if is_premi else "KLAIM"
                cedant_label = extract_cedant_from_tablename(t)

                res_tables.append({
                    "id": t,
                    "label": f"Bordero {'Premi' if is_premi else 'Klaim'} {t_cob} ({cedant_label})",
                    "type": t_type,
                    "cob": t_cob,
                    "cedant": cedant_label,
                    "is_aggregate": False,
                })

            return {
                "status": "success",
                "cob": cob,
                "tables": res_tables,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{table_name}/periods")
def get_table_periods(table_name: str):
    """
    Mengambil daftar periode unik beserta total baris per periode
    baik untuk tabel tunggal maupun tabel agregasi gabungan (all_premi_fire, all_claim_fire, dll).
    """
    clean_table = re.sub(r"[^a-zA-Z0-9_]", "", table_name.lower())
    try:
        with engine.connect() as conn:
            # Kasus 1: Tabel Agregasi (Semua Premi / Semua Klaim)
            if clean_table in AGGREGATE_CONFIG:
                cfg = AGGREGATE_CONFIG[clean_table]
                find_query = text(f"""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' AND ({cfg['filter_sql']})
                    ORDER BY table_name ASC;
                """)
                matching_tables = [r[0] for r in conn.execute(find_query).fetchall()]
                if not matching_tables:
                    return {"status": "success", "periods": []}

                period_counts: Dict[str, int] = {}
                for t in matching_tables:
                    check_col = text("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.columns 
                            WHERE table_name = :tname AND column_name = 'period'
                        )
                    """)
                    if conn.execute(check_col, {"tname": t}).scalar():
                        q = text(f"""
                            SELECT "period", COUNT(*) as total_count 
                            FROM "{t}" 
                            WHERE "period" IS NOT NULL AND TRIM(CAST("period" AS TEXT)) NOT IN ('', 'nan', 'NaN', 'None')
                            GROUP BY "period"
                        """)
                        rows = conn.execute(q).fetchall()
                        for p_val, p_cnt in rows:
                            if p_val:
                                p_str = str(p_val).strip()
                                period_counts[p_str] = period_counts.get(p_str, 0) + int(p_cnt)

                sorted_periods = [
                    {"period": p, "count": cnt}
                    for p, cnt in sorted(period_counts.items(), key=lambda x: x[0])
                ]
                return {"status": "success", "periods": sorted_periods}

            # Kasus 2: Tabel Individual
            check_col = text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = :tname AND column_name = 'period'
                )
            """)
            has_period = conn.execute(check_col, {"tname": clean_table}).scalar()
            if not has_period:
                return {"status": "success", "periods": []}

            query = text(f"""
                SELECT "period", COUNT(*) as total_count 
                FROM "{clean_table}" 
                WHERE "period" IS NOT NULL AND TRIM(CAST("period" AS TEXT)) NOT IN ('', 'nan', 'NaN', 'None')
                GROUP BY "period"
                ORDER BY "period" ASC;
            """)
            result = conn.execute(query).fetchall()

            periods_data = [
                {"period": row[0], "count": int(row[1])} for row in result if row[0]
            ]
            return {"status": "success", "periods": periods_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{table_name}/data")
def get_table_data(
    table_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100000),
    status: str = Query("ALL"),  # 'ALL' | 'VALID' | 'WARNING'
    period: str = Query("ALL"),  # 'ALL' atau nilai spesifik seperti 'TW1 2025'
):
    clean_table = re.sub(r"[^a-zA-Z0-9_]", "", table_name.lower())
    offset = (page - 1) * limit

    try:
        with engine.connect() as conn:
            # ----------------------------------------------------
            # 1. Menentukan daftar tabel target (Tunggal vs Agregasi)
            # ----------------------------------------------------
            is_aggregate = clean_table in AGGREGATE_CONFIG
            target_tables: List[str] = []

            if is_aggregate:
                cfg = AGGREGATE_CONFIG[clean_table]
                find_query = text(f"""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' AND ({cfg['filter_sql']})
                    ORDER BY table_name ASC;
                """)
                target_tables = [r[0] for r in conn.execute(find_query).fetchall()]
            else:
                check_query = text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = :tname
                    )
                """)
                exists = conn.execute(check_query, {"tname": clean_table}).scalar()
                if exists:
                    target_tables = [clean_table]

            if not target_tables:
                return {
                    "status": "empty",
                    "table_name": clean_table,
                    "is_aggregate": is_aggregate,
                    "total_rows": 0,
                    "warning_total": 0,
                    "valid_total": 0,
                    "columns": [],
                    "data": [],
                }

            # ----------------------------------------------------
            # 2. Ekstraksi Kolom & Pembentukan Subquery Unified
            # ----------------------------------------------------
            table_cols_map: Dict[str, List[str]] = {}
            all_cols_ordered: List[str] = []

            # Ambil kolom untuk setiap tabel target
            for t in target_tables:
                col_q = text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = :tname 
                    ORDER BY ordinal_position ASC
                """)
                c_list = [r[0] for r in conn.execute(col_q, {"tname": t}).fetchall()]
                table_cols_map[t] = c_list
                for col in c_list:
                    if col not in all_cols_ordered:
                        all_cols_ordered.append(col)

            # Prioritaskan susunan kolom: letakkan kolom identitas di awal, metadata di akhir
            lead_keys = ["no", "id", "policy_number", "no_polis", "insured_name", "nama_tertanggung", "nama_peserta_debitur", "debitur"]
            tail_keys = ["cedant_name", "period", "created_at"]

            lead_cols = [c for c in all_cols_ordered if c in lead_keys]
            mid_cols = [c for c in all_cols_ordered if c not in lead_keys and c not in tail_keys]
            tail_cols = [c for c in all_cols_ordered if c in tail_keys]

            # Pastikan cedant_name selalu hadir pada mode agregasi
            if is_aggregate and "cedant_name" not in tail_cols:
                tail_cols.insert(0, "cedant_name")

            final_columns = lead_cols + mid_cols + tail_cols
            has_period_col = "period" in final_columns

            # ----------------------------------------------------
            # 3. Konstruksi Base SQL Source
            # ----------------------------------------------------
            if not is_aggregate and len(target_tables) == 1:
                base_source_sql = f'"{target_tables[0]}"'
            else:
                # Mode Agregasi: Bangun UNION ALL antar tabel fisik
                subqueries = []
                for t in target_tables:
                    t_cols = set(table_cols_map[t])
                    derived_cedant = extract_cedant_from_tablename(t)
                    select_exprs = []

                    for col in final_columns:
                        if col == "cedant_name":
                            if "cedant_name" in t_cols:
                                select_exprs.append(f'COALESCE("{col}", \'{derived_cedant}\') AS "{col}"')
                            else:
                                select_exprs.append(f"'{derived_cedant}' AS \"{col}\"")
                        elif col in t_cols:
                            select_exprs.append(f'"{col}"')
                        else:
                            select_exprs.append(f'NULL AS "{col}"')

                    subqueries.append(f'SELECT {", ".join(select_exprs)} FROM "{t}"')

                union_sql = " UNION ALL ".join(subqueries)
                base_source_sql = f"({union_sql}) AS unified_source"

            # ----------------------------------------------------
            # 4. Filter Mandatory & Kondisi WHERE
            # ----------------------------------------------------
            mandatory_cols = []
            for col in final_columns:
                c_low = col.lower()
                if any(kw in c_low for kw in MANDATORY_KEYWORDS) and not any(
                    ex in c_low
                    for ex in [
                        "no",
                        "id",
                        "remarks",
                        "unnamed",
                        "notes",
                        "period",
                        "cob",
                    ]
                ):
                    mandatory_cols.append(f'"{col}"')

            where_conditions = []

            # Filter Status
            warning_sql_condition = ""
            if mandatory_cols:
                warning_sql_condition = " OR ".join(
                    [
                        f"({col} IS NULL OR TRIM(CAST({col} AS TEXT)) IN ('', 'nan', 'NaN', 'None', '<NA>'))"
                        for col in mandatory_cols
                    ]
                )
                valid_sql_condition = " AND ".join(
                    [
                        f"({col} IS NOT NULL AND TRIM(CAST({col} AS TEXT)) NOT IN ('', 'nan', 'NaN', 'None', '<NA>'))"
                        for col in mandatory_cols
                    ]
                )

                if status == "WARNING":
                    where_conditions.append(f"({warning_sql_condition})")
                elif status == "VALID":
                    where_conditions.append(f"({valid_sql_condition})")

            # Filter Periode
            if period != "ALL" and has_period_col:
                where_conditions.append('"period" = :period_val')

            where_clause = (
                f"WHERE {' AND '.join(where_conditions)}" if where_conditions else ""
            )

            params = {"limit": limit, "offset": offset}
            if period != "ALL" and has_period_col:
                params["period_val"] = period

            # ----------------------------------------------------
            # 5. Eksekusi Query Hitung & Paginasi Data
            # ----------------------------------------------------
            total_all_rows = conn.execute(
                text(f"SELECT COUNT(*) FROM {base_source_sql}")
            ).scalar() or 0

            warning_total = 0
            valid_total = 0
            if mandatory_cols and warning_sql_condition:
                warning_total = conn.execute(
                    text(f"SELECT COUNT(*) FROM {base_source_sql} WHERE ({warning_sql_condition})")
                ).scalar() or 0
                valid_total = total_all_rows - warning_total
            else:
                valid_total = total_all_rows

            filtered_total_rows = conn.execute(
                text(f"SELECT COUNT(*) FROM {base_source_sql} {where_clause}"), params
            ).scalar() or 0

            order_by = ""
            if "no" in final_columns:
                order_by = 'ORDER BY "no" ASC'
            elif "id" in final_columns:
                order_by = 'ORDER BY "id" ASC'

            data_query = text(
                f"SELECT * FROM {base_source_sql} {where_clause} {order_by} LIMIT :limit OFFSET :offset"
            )
            result = conn.execute(data_query, params)

            result_cols = list(result.keys())
            rows = [dict(row._mapping) for row in result.fetchall()]

            for r in rows:
                for k, v in r.items():
                    if v is not None and hasattr(v, "isoformat"):
                        r[k] = v.isoformat()

            return {
                "status": "success",
                "table_name": clean_table,
                "is_aggregate": is_aggregate,
                "target_tables_count": len(target_tables),
                "total_rows": filtered_total_rows,
                "warning_total": warning_total,
                "valid_total": valid_total,
                "page": page,
                "limit": limit,
                "total_pages": (
                    (filtered_total_rows + limit - 1) // limit
                    if filtered_total_rows > 0
                    else 1
                ),
                "columns": result_cols,
                "data": rows,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
