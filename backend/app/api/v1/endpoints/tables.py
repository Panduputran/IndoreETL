# app/api/v1/endpoints/tables.py
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from app.database.connection import engine
import re

router = APIRouter()

# Daftar kolom wajib untuk deteksi Warning
MANDATORY_KEYWORDS = [
    'policy', 'polis', 'insured', 'debitur', 'name', 
    'tsi', 'sum_insured', 'premium', 'premi', 'amount',
    'claim', 'klaim', 'dol', 'loss', 'date'
]

@router.get("/list")
def get_available_tables():
    try:
        with engine.connect() as conn:
            query = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                  AND (table_name LIKE 'premi_%' OR table_name LIKE 'claim_%')
                ORDER BY table_name ASC;
            """)
            result = conn.execute(query).fetchall()
            tables = [row[0] for row in result]
            return {"status": "success", "tables": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{table_name}/data")
def get_table_data(
    table_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    status: str = Query('ALL')  # 'ALL' | 'VALID' | 'WARNING'
):
    clean_table = re.sub(r'[^a-zA-Z0-9_]', '', table_name)
    offset = (page - 1) * limit

    try:
        with engine.connect() as conn:
            # 1. Cek keberadaan tabel
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
                    "data": []
                }

            # 2. Ambil daftar kolom tabel
            col_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = :tname
                ORDER BY ordinal_position ASC
            """)
            cols_res = conn.execute(col_query, {"tname": clean_table}).fetchall()
            all_columns = [r[0] for r in cols_res]

            # 3. Tentukan kolom mana saja yang wajib (mandatory)
            mandatory_cols = []
            for col in all_columns:
                c_low = col.lower()
                if any(kw in c_low for kw in MANDATORY_KEYWORDS) and not any(ex in c_low for ex in ['no', 'id', 'remarks', 'unnamed', 'notes']):
                    mandatory_cols.append(f'"{col}"')

            # 4. Bangun Kondisi SQL Filter Warning vs Valid
            where_clause = ""
            if mandatory_cols:
                # Warning: ada salah satu kolom mandatory bernilai NULL atau string kosong
                null_conditions = [f"({col} IS NULL OR TRIM(CAST({col} AS TEXT)) IN ('', 'nan', 'NaN', 'None'))" for col in mandatory_cols]
                warning_sql_condition = " OR ".join(null_conditions)
                valid_sql_condition = " AND ".join([f"({col} IS NOT NULL AND TRIM(CAST({col} AS TEXT)) NOT IN ('', 'nan', 'NaN', 'None'))" for col in mandatory_cols])

                if status == 'WARNING':
                    where_clause = f"WHERE ({warning_sql_condition})"
                elif status == 'VALID':
                    where_clause = f"WHERE ({valid_sql_condition})"

            # 5. Hitung Statistik Keseluruhan Tabel di Database
            total_all_rows = conn.execute(text(f'SELECT COUNT(*) FROM "{clean_table}"')).scalar()
            
            warning_total = 0
            valid_total = 0
            if mandatory_cols:
                warning_total = conn.execute(text(f'SELECT COUNT(*) FROM "{clean_table}" WHERE ({warning_sql_condition})')).scalar()
                valid_total = total_all_rows - warning_total
            else:
                valid_total = total_all_rows

            # Hitung total baris yang sedang difilter
            filtered_total_rows = conn.execute(text(f'SELECT COUNT(*) FROM "{clean_table}" {where_clause}')).scalar()

            # 6. Sorting
            has_no = "no" in all_columns
            order_by = 'ORDER BY "no" ASC' if has_no else ''

            # 7. Query Data Paginated
            data_query = text(f'SELECT * FROM "{clean_table}" {where_clause} {order_by} LIMIT :limit OFFSET :offset')
            result = conn.execute(data_query, {"limit": limit, "offset": offset})

            columns = list(result.keys())
            rows = [dict(row._mapping) for row in result.fetchall()]

            for r in rows:
                for k, v in r.items():
                    if v is not None and hasattr(v, 'isoformat'):
                        r[k] = v.isoformat()

            return {
                "status": "success",
                "table_name": clean_table,
                "total_rows": filtered_total_rows,
                "warning_total": warning_total,
                "valid_total": valid_total,
                "page": page,
                "limit": limit,
                "total_pages": (filtered_total_rows + limit - 1) // limit if filtered_total_rows > 0 else 1,
                "columns": columns,
                "data": rows
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))