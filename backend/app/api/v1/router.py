from fastapi import APIRouter
from app.api.v1.endpoints import etl
from app.api.v1.endpoints import tables
from app.api.v1.endpoints import user
from app.api.v1.endpoints import history

api_router = APIRouter()

# Register endpoint routes
api_router.include_router(etl.router, prefix="/etl", tags=["ETL Services"])
api_router.include_router(tables.router, prefix="/tables", tags=["Database Tables & Data Viewer"])
api_router.include_router(user.router, prefix="/auth", tags=["Authentication & User Management"])
api_router.include_router(history.router, prefix="/history", tags=["ETL History & Activity Log"])