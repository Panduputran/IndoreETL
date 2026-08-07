from fastapi import APIRouter
from app.api.v1.endpoints import etl  # Import modul router etl
# Nanti tinggal import endpoint lain: from app.api.v1.endpoints import auth, users, cedants

api_router = APIRouter()

# Menambahkan prefix dan tags otomatis
api_router.include_router(etl.router, prefix="/etl", tags=["ETL Services"])
# api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# api_router.include_router(users.router, prefix="/users", tags=["User Management"])
# api_router.include_router(cedants.router, prefix="/cedants", tags=["Master Cedants"])