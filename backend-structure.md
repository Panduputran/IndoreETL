# Backend Architecture & Directory Structure

Dokumentasi arsitektur, modul layanan, skema database, dan hierarki direktori backend untuk **Insurance Bordero ETL & Cleansing Platform (IndonesiaRe)**.

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
│   └── versions/                       # Berkas migrasi database Alembic
│       ├── 0001_create_app_users.py    # Migrasi tabel pengguna aplikasi (app_users)
│       ├── 0002_create_etl_activity_log.py # Migrasi tabel audit log aktivitas ETL
│       ├── 0003_create_mapping_presets.py  # Migrasi tabel preset pemetaan kolom
│       ├── 0004_update_app_users_sso.py    # Migrasi kolom auth_provider & avatar_url
│       └── 0005_add_mapping_config_to_etl_log.py # Migrasi kolom mapping_config & technical_log
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
    │       └── endpoints/
    │           ├── etl.py              # Endpoint inti pemrosesan ETL (/inspect, /create-table, /process-with-mapping)
    │           ├── history.py          # Endpoint riwayat audit ETL (/logs) & manajemen preset (/presets)
    │           ├── tables.py           # Endpoint query tabel resmi ({kategori}_{cedant}_{cob}), dashboard sub-ms, & Dev Drop Table endpoints (/dev/all-physical, /{table_name})
    │           └── user.py             # Endpoint autentikasi lokal & SSO (/login, /sso, /me, /register, /list)
    │
    ├── core/
    │   ├── config.py                   # Master Columns, Sheet Mapping, aturan skema IPR & konfigurasi global
    │   └── security.py                 # Pengamanan data, hashing password PBKDF2/Bcrypt & autentikasi JWT
    │
    ├── database/
    │   ├── connection.py               # Engine SQLAlchemy, SessionLocal, declarative Base & koneksi pool PostgreSQL
    │   └── loader.py                   # Engine injeksi batch & deduplikasi kolom (make_unique_column_names)
    │
    ├── models/                         # Definisi SQLAlchemy ORM Models
    │   ├── __init__.py                 # Re-export model & Base metadata
    │   ├── base.py                     # Base declarative export
    │   ├── user.py                     # Skema tabel app_users (auth_provider, avatar_url, role, last_login_at)
    │   ├── etl_log.py                  # Skema tabel etl_activity_log (mapping_config, technical_log)
    │   └── mapping_preset.py           # Skema tabel mapping_presets
    │
    ├── schema/
    │   ├── etl.py                      # Pydantic Schema untuk request/response inspeksi & eksekusi ETL
    │   ├── token.py                    # Pydantic Schema untuk validasi token akses JWT
    │   └── user.py                     # Pydantic Schema untuk data payload pengguna & SSO (UserSSOLogin)
    │
    ├── services/
    │   ├── etl_factory.py              # Dynamic Orchestrator yang mengarahkan payload ke kelas Cedant yang sesuai
    │   ├── inspector_service.py        # Logika inspeksi berkas Excel, dynamic header parsing, dan DDL generator
    │   ├── transformer_service.py      # Standardisasi skema Master IPR (Fire/Credit), vektorisasi 1D aman, & pembersihan baris
    │   │
    │   └── cedants/                    # Modul transformasi data spesifik per perusahaan asuransi (Cedant)
    │       ├── base.py                 # Abstract Base Class / Interface (process_premi & process_claim)
    │       ├── aca.py                  # Pembersihan & standardisasi skema PT Asuransi Central Asia (ACA)
    │       ├── askrida.py              # Pembersihan & standardisasi skema PT Asuransi Bangun Askrida (Askrida)
    │       ├── askrindo.py             # Pembersihan & standardisasi skema PT Asuransi Kredit Indonesia (Askrindo)
    │       ├── buanaindependent.py     # Pembersihan & standardisasi skema PT Asuransi Buana Independent (Buana Independent)
    │       ├── jakrejabar.py           # Pembersihan & standardisasi skema PT Jasa Raharja Cabang Jabar (Jakre Jabar)
    │       ├── jamkridajabar.py        # Pembersihan & standardisasi skema PT Penjaminan Kredit Daerah Jabar (Jamkrida Jabar)
    │       ├── jamkrindo.py            # Pembersihan & standardisasi skema PT Jaminan Kredit Indonesia (Jamkrindo)
    │       └── tripakarta.py           # Pembersihan & standardisasi skema PT Asuransi Tri Pakarta (Tripakarta)
    │
    └── utils/
        └── helpers.py                  # Fungsi utilitas sistem (pembuatan folder, formatting string, sanitasi dictionary)
```

---

## Modul & Layanan Utama

### 1. Database Persistence & Migrations
* **Alembic Database Migrations:** 5 berkas migrasi modular mengelola tabel `app_users`, `etl_activity_log`, dan `mapping_presets`.
* **SQLAlchemy ORM (`app/models/`):**
  * `app_users`: Menyimpan akun pengguna, peran otorisasi (`admin`, `operator`, `viewer`), provider SSO (`google`, `microsoft`, `local`), avatar, dan timestamp login terakhir.
  * `etl_activity_log`: Menyimpan riwayat audit lengkap, konfigurasi mapping JSON (`mapping_config`), dan catatan teknis (`technical_log`).
  * `mapping_presets`: Menyimpan template pemetaan kolom per kombinasi cedant + COB + kategori.
* **Direct COPY Stream Ingestion & Column Deduplication (`loader.py`):** Protokol pemuatan data tabular kecepatan tinggi ke tabel fisik PostgreSQL dengan fungsi `make_unique_column_names()` untuk mencegah konflik duplikasi nama kolom.

### 2. Keamanan & Autentikasi (`app/core/security.py`, `app/api/v1/endpoints/user.py`)
* Password hashing berbasis PBKDF2-HMAC-SHA256 dan Bcrypt.
* Autentikasi Single Sign-On (**Google OAuth2 & Microsoft Azure AD**) via endpoint `POST /api/v1/auth/sso`.
* Autentikasi berbasis JSON Web Token (JWT) dengan dependency `get_current_user`.

### 3. Filter Tabel Database Resmi Cedant (`app/api/v1/endpoints/tables.py`)
* Fungsi `is_official_bordero_table(tname)` menjamin hanya tabel transaksi fisik resmi yang ditampilkan dengan format:
  `{kategori}_{cedant}_{cob}`
  (misal `premi_aca_fire`, `claim_tripakarta_fire`, `premi_askrida_credit`).
* Menyaring dan menyembunyikan tabel sistem/metadata (`alembic_version`, `app_users`, `etl_activity_log`, `mapping_presets`) dan tabel backup.
* Kueri statistik instan sub-milidetik memanfaatkan `pg_stat_user_tables` untuk mengagregasi ratusan ribu baris data tanpa membebani server.