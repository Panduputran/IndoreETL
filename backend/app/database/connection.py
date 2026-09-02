import os
from urllib.parse import quote_plus
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
    """
    Mengembalikan URL koneksi database PostgreSQL.
    Menggunakan quote_plus untuk mengantisipasi karakter khusus pada password.
    """
    safe_password = quote_plus(DB_PASSWORD) if DB_PASSWORD else ""
    return f'postgresql://{DB_USER}:{safe_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

def get_db_engine():
    """
    Membuat koneksi engine ke PostgreSQL dengan konfigurasi pool yang dioptimalkan untuk beban ETL skala besar. Menyertakan pengaturan pool_size, max_overflow, pool_timeout, pool_recycle, pool_pre_ping, serta connect_args untuk mengatur statement_timeout di sisi Postgres.
    """
    try:
        uri = get_database_url()
        engine = create_engine(
            uri,
            echo=False,                # Pastikan False agar log SQL tidak memenuhi konsol & memperlambat RAM/CPU
            pool_pre_ping=True,        # Cek apakah koneksi masih hidup sebelum eksekusi query
            pool_size=20,              # Jumlah koneksi standby di pool (menggunakan nilai yang lebih konservatif/kapasitas lebih besar dari master)
            max_overflow=25,           # Koneksi ekstra yang diizinkan saat lonjakan beban ETL (mengambil nilai lebih besar untuk spike handling)
            pool_timeout=30,           # Waktu tunggu maksimal koneksi sebelum error (detik)
            pool_recycle=1800,         # Daur ulang koneksi setiap 30 menit agar tidak stale
            connect_args={
                "options": "-c statement_timeout=600000" # Timeout query di sisi Postgres (10 menit)
            }

        )
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