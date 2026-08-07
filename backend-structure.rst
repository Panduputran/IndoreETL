backend/
└── app/
    ├── api/
    │   └── v1/
    │       ├── endpoints/
    │       │   ├── auth.py              # Login, Register, Refresh Token
    │       │   ├── users.py             # CRUD User, Change Password, Profile
    │       │   ├── cedants.py           # CRUD Master Data Cedant
    │       │   └── etl.py               # Inspect, Process, Process Batch, Check Database, Create Table
    │       └── router.py                # API Router v1
    │
    ├── core/
    │   ├── config.py                    # Konfigurasi Aplikasi, Master Columns, Sheet Mapping
    │   └── security.py                  # Password Hashing (Bcrypt) & JWT Handler
    │
    ├── models/
    │   ├── user.py                      # Model Tabel Users
    │   ├── cedant.py                    # Model Tabel Master Cedants
    │   └── etl_log.py                   # Model Tabel ETL Logs (Audit Trail)
    │
    ├── schemas/
    │   ├── user.py                      # UserCreate, UserResponse
    │   ├── token.py                     # Token, TokenData
    │   └── etl.py                       # Request & Response Schema ETL
    │
    ├── services/
    │   ├── user_service.py              # Logika User Management & Authentication
    │   ├── inspector_service.py         # Logika Inspect, Check Database, & DDL Generator
    │   ├── etl_factory.py               # Orchestrator ETL (Factory Pattern)
    │   └── cedants/
    │       ├── __init__.py
    │       ├── base.py                  # Abstract Base Class
    │       ├── aca.py                   # ETL Modul ACA
    │       ├── tripakarta.py            # ETL Modul Tripakarta
    │       ├── buanaindependent.py      # ETL Modul Buana Independent
    │       └── askrida.py               # ETL Modul Askrida
    │
    ├── database/
    │   ├── connection.py                # SQLAlchemy Engine & Session
    │   └── loader.py                    # Smart Batch Loader & Idempotent Loader
    │
    ├── utils/
    │   └── helpers.py                   # Utility Functions
    │
    └── main.py                          # FastAPI Application Entry Point