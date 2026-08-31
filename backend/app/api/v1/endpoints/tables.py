# app/api/v1/endpoints/tables.py
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from app.database.connection import engine
import re


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

# Endpoint baru: Ambil daftar periode unik yang ada di tabel
@router.get("/dashboard/summary")
def get_dashboard_summary():
    try:
        with engine.connect() as conn:
            # 1. Ambil semua tabel premi & klaim yang ada
            tables_query = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                  AND (table_name LIKE 'premi_%' OR table_name LIKE 'claim_%');
            """)
            tables = [r[0] for r in conn.execute(tables_query).fetchall()]

            cob_counts = {
                'FIRE': {'bound': 0, 'unbound': 0},
                'CARGO': {'bound': 0, 'unbound': 0},
                'PROP': {'bound': 0, 'unbound': 0},
                'CREDIT': {'bound': 0, 'unbound': 0},
                'ENG': {'bound': 0, 'unbound': 0},
            }
            
            total_rows_all = 0

            # 2. Agregasi data dari tiap tabel fisik
            for t in tables:
                t_clean = re.sub(r'[^a-zA-Z0-9_]', '', t)
                total = conn.execute(text(f'SELECT COUNT(*) FROM "{t_clean}"')).scalar() or 0
                total_rows_all += total

                # Klasifikasi ke COB
                cob_key = 'CREDIT' if ('credit' in t or 'kredit' in t) else ('FIRE' if 'fire' in t else 'PROP')
                cob_counts[cob_key]['bound'] += total

            cob_data_formatted = [
                {'name': 'Fire / Harta', 'code': 'FIRE', 'bound': cob_counts['FIRE']['bound'], 'unbound': cob_counts['FIRE']['unbound']},
                {'name': 'Marine Cargo', 'code': 'CARGO', 'bound': cob_counts['CARGO']['bound'], 'unbound': cob_counts['CARGO']['unbound']},
                {'name': 'Property', 'code': 'PROP', 'bound': cob_counts['PROP']['bound'], 'unbound': cob_counts['PROP']['unbound']},
                {'name': 'Kredit', 'code': 'CREDIT', 'bound': cob_counts['CREDIT']['bound'], 'unbound': cob_counts['CREDIT']['unbound']},
                {'name': 'Engineering', 'code': 'ENG', 'bound': cob_counts['ENG']['bound'], 'unbound': cob_counts['ENG']['unbound']},
            ]

            return {
                "status": "success",
                "total_batches": len(tables),
                "total_rows": total_rows_all,
                "cob_data": cob_data_formatted
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{table_name}/periods")
def get_table_periods(table_name: str):
    clean_table = re.sub(r"[^a-zA-Z0-9_]", "", table_name)
    try:
        with engine.connect() as conn:
            # 1. Cek apakah kolom period ada di tabel
            check_col = text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = :tname AND column_name = 'period'
                )
            """)
            has_period = conn.execute(check_col, {"tname": clean_table}).scalar()
            if not has_period:
                return {"status": "success", "periods": []}

            # 2. Ambil nilai unik period beserta agregasi jumlah baris (count)
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
    limit: int = Query(50, ge=1, le=500),
    status: str = Query("ALL"),  # 'ALL' | 'VALID' | 'WARNING'
    period: str = Query(
        "ALL"
    ),  # 'ALL' atau nilai spesifik seperti 'TW1 2025', 'AGUSTUS 2024'
):
    clean_table = re.sub(r"[^a-zA-Z0-9_]", "", table_name)
    offset = (page - 1) * limit

    try:
        with engine.connect() as conn:
            check_query = text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = :tname
                )
            """)
            exists = conn.execute(check_query, {"tname": clean_table}).scalar()
            if not exists:
                return {
                    "status": "empty",
                    "table_name": clean_table,
                    "total_rows": 0,
                    "warning_total": 0,
                    "valid_total": 0,
                    "columns": [],
                    "data": [],
                }

            col_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = :tname
                ORDER BY ordinal_position ASC
            """)
            cols_res = conn.execute(col_query, {"tname": clean_table}).fetchall()
            all_columns = [r[0] for r in cols_res]
            has_period_col = "period" in all_columns

            # Filter Mandatory Columns
            mandatory_cols = []
            for col in all_columns:
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

            # Filter SQL Conditions
            where_conditions = []

            # 1. Filter Status Valid / Warning
            if mandatory_cols:
                warning_sql_condition = " OR ".join(
                    [
                        f"({col} IS NULL OR TRIM(CAST({col} AS TEXT)) IN ('', 'nan', 'NaN', 'None'))"
                        for col in mandatory_cols
                    ]
                )
                valid_sql_condition = " AND ".join(
                    [
                        f"({col} IS NOT NULL AND TRIM(CAST({col} AS TEXT)) NOT IN ('', 'nan', 'NaN', 'None'))"
                        for col in mandatory_cols
                    ]
                )

                if status == "WARNING":
                    where_conditions.append(f"({warning_sql_condition})")
                elif status == "VALID":
                    where_conditions.append(f"({valid_sql_condition})")

            # 2. Filter Periode
            if period != "ALL" and has_period_col:
                where_conditions.append(f'"period" = :period_val')

            where_clause = (
                f"WHERE {' AND '.join(where_conditions)}" if where_conditions else ""
            )

            params = {"limit": limit, "offset": offset}
            if period != "ALL" and has_period_col:
                params["period_val"] = period

            # Hitung counts
            total_all_rows = conn.execute(
                text(f'SELECT COUNT(*) FROM "{clean_table}"')
            ).scalar()

            warning_total = 0
            valid_total = 0
            if mandatory_cols:
                warning_total = conn.execute(
                    text(
                        f'SELECT COUNT(*) FROM "{clean_table}" WHERE ({warning_sql_condition})'
                    )
                ).scalar()
                valid_total = total_all_rows - warning_total
            else:
                valid_total = total_all_rows

            filtered_total_rows = conn.execute(
                text(f'SELECT COUNT(*) FROM "{clean_table}" {where_clause}'), params
            ).scalar()

            has_no = "no" in all_columns
            order_by = 'ORDER BY "no" ASC' if has_no else ""

            data_query = text(
                f'SELECT * FROM "{clean_table}" {where_clause} {order_by} LIMIT :limit OFFSET :offset'
            )
            result = conn.execute(data_query, params)

            columns = list(result.keys())
            rows = [dict(row._mapping) for row in result.fetchall()]

            for r in rows:
                for k, v in r.items():
                    if v is not None and hasattr(v, "isoformat"):
                        r[k] = v.isoformat()

            return {
                "status": "success",
                "table_name": clean_table,
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
                "columns": columns,
                "data": rows,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
