from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.helpers import ensure_directories_exist
from app.api.v1.router import api_router

app = FastAPI(
    title="IndonesiaRe ETL API",
    description="Backend Service & Web Management untuk Processing Bordero Multi-Cedant",
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

# Integrasi Router Utama v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Health Check"])
def root():
    return {"message": "IndonesiaRe ETL API Engine Service is Running!"}