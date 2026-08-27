backend/
├── .env                                # Konfigurasi kredensial environment aktif
├── .env.backup                         # Backup environment file
├── .env.example                        # Template environment
├── .gitignore                          # Aturan abaikan file Git
├── ETL Workflow.png                    # Diagram visual arsitektur
├── requirements.txt                    # Daftar dependensi library Python
├── test_db.py                          # Skrip untuk tes koneksi database
├── test_runner.py                      # Skrip untuk menguji dan membandingkan hasil ETL
└── app/
    ├── __init__.py
    ├── main.py                         # Entry point aplikasi FastAPI & middleware CORS
    │
    ├── api/
    │   └── v1/
    │       ├── router.py               # Agregator utama untuk mendaftarkan semua endpoint
    │       ├── backups/
    │       │   └── etl.py              # Backup endpoint ETL versi sebelumnya
    │       └── endpoints/
    │           ├── etl.py              # Endpoint utama (/inspect, /check-db, /create-table, /process, /process-batch)
    │           ├── history.py          # Endpoint untuk riwayat pemrosesan
    │           ├── tables.py           # Endpoint untuk mengambil data live dari tabel PostgreSQL
    │           └── user.py             # Endpoint untuk manajemen data user
    │
    ├── core/
    │   ├── config.py                   # Master Columns, Sheet Mapping, dan variabel konfigurasi
    │   └── security.py                 # Pengamanan data (hashing password & JWT auth)
    │
    ├── database/
    │   ├── app_db.py                   # Modul koneksi untuk database utama/aplikasi
    │   ├── connection.py               # Inisiasi SQLAlchemy Engine & variabel .env
    │   ├── etl_db.py                   # Modul koneksi terpisah untuk database ETL
    │   ├── loader.py                   # Skrip injeksi database super cepat (PostgreSQL COPY)
    │   └── backups/
    │       └── loader.py               # Backup dari skrip database loader
    │
    ├── schema/                         
    │   ├── etl.py                      # Pydantic schema (validasi request/response ETL)
    │   ├── token.py                    # Pydantic schema untuk autentikasi Token/JWT
    │   └── user.py                     # Pydantic schema untuk struktur data User
    │
    ├── services/
    │   ├── etl_factory.py              # Orchestrator yang menghubungkan payload dengan kelas Cedant
    │   ├── inspector_service.py        # Logika inspeksi Excel, dynamic header, dan DDL generation
    │   │
    │   ├── cedants/                    # Modul transformasi spesifik per perusahaan
    │   │   ├── base.py                 # Abstract Base Class (interface untuk process_premi & process_claim)
    │   │   ├── aca.py                  # Skrip pembersihan & mapping untuk ACA
    │   │   ├── askrida.py              # Skrip pembersihan & mapping untuk Askrida
    │   │   ├── buanaindependent.py     # Skrip pembersihan & mapping untuk Buana Independent
    │   │   └── tripakarta.py           # Skrip pembersihan & mapping untuk Tripakarta
    │   │
    │   └── backup/                     # Arsip skrip services yang lama/belum di-refactor
    │       ├── aca.py
    │       ├── askrida.py
    │       ├── claim.py
    │       ├── config.py
    │       ├── inspector.py
    │       ├── inspector_service.py
    │       ├── premi.py
    │       └── tripakarta.py
    │
    └── utils/
        ├── __init__.py
        ├── helpers.py                  # Fungsi universal (detect_period, to_snake_case, format_date, dll)
        └── backups/
            └── helpers.py              # Backup dari skrip helper