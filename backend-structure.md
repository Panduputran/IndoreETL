# Backend Architecture & Directory Structure

Dokumentasi mengenai arsitektur, modul layanan, dan hierarki direktori backend untuk Insurance Bordero ETL & Cleansing Platform (IndonesiaRe).

---

## Struktur Direktori Backend

```text
backend/
├── .env                                # Variabel environment aktif (Koneksi DB, Host, Port, JWT Secret)
├── .env.example                        # Template konfigurasi environment
├── .gitignore                          # Aturan pengecualian file Git (venv, temp, dll)
├── alembic.ini                         # Konfigurasi database migration Alembic
├── alembic/
│   ├── env.py                          # Runtime script migrasi terhubung ke engine PostgreSQL
│   ├── script.py.mako                  # Template pembuatan migration revision
│   └── versions/                       # Berkas migrasi database
│       └── 0001_initial_schema.py      # Initial migration (app_users, etl_activity_log, mapping_presets)
├── ETL Workflow.png                    # Diagram alur proses ETL bordero
├── requirements.txt                    # Dependensi pustaka Python (FastAPI, Pandas, SQLAlchemy, Alembic, dll)
├── seed_admin.py                       # Script inisialisasi akun administrator default
├── temp/                               # Direktori penyimpanan sementara file inspeksi
├── temp_uploads/                       # Buffer unggahan file Excel/CSV sebelum diproses
│
└── app/
    ├── __init__.py
    ├── main.py                         # Entry point aplikasi FastAPI, konfigurasi CORS & event startup
    │
    ├── api/
    │   └── v1/
    │       ├── router.py               # Agregator router utama yang menggabungkan seluruh endpoint v1
    │       ├── backups/                # Arsip histori router
    │       └── endpoints/
    │           ├── etl.py              # Endpoint inti pemrosesan ETL (/inspect, /create-table, /process, /process-with-mapping)
    │           ├── history.py          # Endpoint riwayat & audit trail proses ETL (/logs, /presets)
    │           ├── tables.py           # Endpoint pengambilan & agregasi data live PostgreSQL (COB Fire/Kredit)
    │           └── user.py             # Endpoint autentikasi dan manajemen pengguna (/login, /me, /register, /list)
    │
    ├── core/
    │   ├── config.py                   # Master Columns, Sheet Mapping, aturan skema IPR & konfigurasi global
    │   └── security.py                 # Pengamanan data, hashing password PBKDF2/Bcrypt & autentikasi JWT
    │
    ├── database/
    │   ├── connection.py               # Engine SQLAlchemy, SessionLocal, declarative Base & koneksi pool PostgreSQL
    │   ├── loader.py                   # Engine injeksi batch (PostgreSQL binary/COPY stream)
    │   └── backups/                    # Arsip histori modul database
    │
    ├── models/                         # Definisi SQLAlchemy ORM Models
    │   ├── __init__.py                 # Re-export model & Base metadata
    │   ├── base.py                     # Base declarative export
    │   ├── user.py                     # Skema tabel app_users
    │   ├── etl_log.py                  # Skema tabel etl_activity_log
    │   └── mapping_preset.py           # Skema tabel mapping_presets
    │
    ├── schema/
    │   ├── etl.py                      # Pydantic Schema untuk request/response inspeksi & eksekusi ETL
    │   ├── token.py                    # Pydantic Schema untuk validasi token akses JWT
    │   └── user.py                     # Pydantic Schema untuk data payload pengguna
    │
    ├── services/
    │   ├── etl_factory.py              # Dynamic Orchestrator yang mengarahkan payload ke kelas Cedant yang sesuai
    │   ├── inspector_service.py        # Logika inspeksi berkas Excel, dynamic header parsing, dan DDL generator
    │   │
    │   ├── cedants/                    # Modul transformasi data spesifik per perusahaan asuransi (Cedant)
    │   │   ├── base.py                 # Abstract Base Class / Interface (process_premi & process_claim)
    │   │   ├── aca.py                  # Pembersihan & standardisasi skema PT Asuransi Central Asia (ACA)
    │   │   ├── askrida.py              # Pembersihan & standardisasi skema PT Asuransi Bangun Askrida (Askrida)
    │   │   ├── askrindo.py             # Pembersihan & standardisasi skema PT Asuransi Kredit Indonesia (Askrindo)
    │   │   ├── buanaindependent.py     # Pembersihan & standardisasi skema PT Asuransi Buana Independent (Buana Independent)
    │   │   ├── jakrejabar.py           # Pembersihan & standardisasi skema PT Jasa Raharja Cabang Jabar (Jakre Jabar)
    │   │   ├── jamkridajabar.py        # Pembersihan & standardisasi skema PT Penjaminan Kredit Daerah Jabar (Jamkrida Jabar)
    │   │   ├── jamkrindo.py            # Pembersihan & standardisasi skema PT Jaminan Kredit Indonesia (Jamkrindo)
    │   │   └── tripakarta.py           # Pembersihan & standardisasi skema PT Asuransi Tri Pakarta (Tripakarta)
    │   │
    │   └── backup/                     # Arsip versi terdahulu services
    │
    └── utils/
        └── helpers.py                  # Fungsi utilitas sistem (pembuatan folder, formatting string, sanitasi dictionary)
```

---

## Modul & Layanan Utama

### 1. Database Persistence Layer
* **Alembic Database Migration:** Mengelola evolusi skema tabel sistem secara terstruktur dan dapat direplikasi via `alembic upgrade head`.
* **SQLAlchemy ORM (`app/models/`):**
  * `app_users`: Menyimpan akun pengguna, peran otorisasi, dan status aktif.
  * `etl_activity_log`: Menyimpan riwayat audit proses upload dan transformasi bordero secara otomatis.
  * `mapping_presets`: Menyimpan template pemetaan kolom per cedant dan lini bisnis.
* **Direct COPY Stream Ingestion (`loader.py`):** Protokol pemuatan data tabular kecepatan tinggi ke tabel fisik PostgreSQL.

### 2. Keamanan & Autentikasi (`app/core/security.py`)
* Password hashing berbasis PBKDF2-HMAC-SHA256 dan Bcrypt standar industri.
* Autentikasi berbasis JSON Web Token (JWT) dengan masa berlaku terkonfigurasi.
* FastAPI Dependency `get_current_user` untuk memproteksi endpoint privat.

### 3. API Endpoints v1
* **`/api/v1/etl`:** Endpoint inspeksi berkas, pembuatan tabel, dan eksekusi transformasi dinamis.
* **`/api/v1/tables`:** Endpoint pengambilan data live, agregasi multi-cedant, dan summary dashboard.
* **`/api/v1/auth`:** Endpoint login JWT, data pengguna aktif (`/me`), registrasi user, dan daftar pengguna.
* **`/api/v1/history`:** Endpoint audit trail riwayat ETL (`/logs`) dan template pemetaan kolom (`/presets`).