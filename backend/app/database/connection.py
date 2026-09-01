import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')

def get_database_url() -> str:
    """Mengembalikan URL koneksi database PostgreSQL"""
    return f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

def get_db_engine():
    """Fungsi untuk membuat koneksi engine ke PostgreSQL"""
    try:
        uri = get_database_url()
        engine = create_engine(uri, pool_pre_ping=True)
        return engine
    except Exception as e:
        print(f"[-] Gagal membuat koneksi database: {e}")
        return None

engine = get_db_engine()

# SQLAlchemy Session & Base Model
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency generator untuk FastAPI session database"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()