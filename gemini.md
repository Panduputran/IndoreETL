# IndoreETL — Dynamic Bordero Data Harmonization & Database Pipeline

> Document Version: 1.0.0 (Enterprise Release)
> Target Audience: Engineering Team, ETL Operators, System Administrators, Gemini Context Assistant
> Role Context: Project Manager & Lead Software Engineer

---

## 1. Project Vision & Executive Summary

IndoreETL adalah platform otomasi ekstraksi, transformasi, dan pemuatan data (*ETL Engine*) tingkat enterprise khusus untuk memproses berkas laporan bordero (*bordereaux*) dari berbagai perusahaan asuransi mitra (*cedants*) ke dalam basis data PostgreSQL yang terstandardisasi sesuai regulasi format IPR (Indonesia Re Standard).

### Masalah Utama yang Diselesaikan:
1. **Heterogenitas Format Sumber:** Setiap cedant (seperti Askrida, ACA, Tripakarta, Buana Independent, Jamkrida Jabar, Jakre Jabar, Askrindo, Jamkrindo, Marsh) mengirimkan berkas Excel mentah dengan struktur kolom, penamaan alias, baris header bertingkat (*merged headers*), dan jumlah kolom yang berbeda-beda.
2. **Keterbatasan Hardcoded Script:** Skrip kaku (*hardcoded mapping*) mudah rusak saat cedant mengubah sedikit penamaan kolom atau menambahkan kop surat.
3. **Pemberdayaan Operator & Data Preservation:** Sistem menyediakan antarmuka visual berbasis web (*Cockpit Mapping UI*) agar operator dapat memverifikasi pencocokan kolom secara otomatis, mengontrol kolom non-IPR tambahan tanpa kehilangan data, memilih/menerapkan preset mapping tersimpan, serta mengeksekusi migrasi ke tabel dinamis dengan aman.
4. **Keamanan & Manajemen Akses:** Dilengkapi autentikasi Single Sign-On (Google & Microsoft Azure AD) serta manajemen akun pengguna berbasis peran (*Role-Based Access Control*).

---

## 2. Core Architecture & Stack

### Backend Engine (Python / FastAPI)
* **Framework:** FastAPI (RESTful API & Modular Routers)
* **Data Processing:** Pandas, NumPy, OpenPyXL, Xlrd
* **Database Access:** SQLAlchemy Engine + PostgreSQL Client (psycopg2)
* **Migration Engine:** Alembic Database Migrations
* **Security & Auth:** JWT (JSON Web Tokens), PBKDF2-HMAC-SHA256, Bcrypt, SSO OAuth Handler
* **Detection Engine:** Dynamic text-scoring header & multi-level parser

### Frontend Interface (React / Vite)
* **Build Tool:** Vite + React 19 (Modular Functional Components & Hooks)
* **Styling & UI:** Tailwind CSS v4 + Lucide React Icons
* **Charts & Visualizations:** Recharts (Donut/Pie Chart, Bar Chart, Area Chart)
* **State & Auth Management:** React Context (`AuthContext`), Axios Interceptors, LocalStorage Preset Memory
* **Matching Utility:** Dual-tier Fuzzy Token Scoring Engine

---

## 3. Data Strategy & Schema Matrix

Sistem mendukung 4 Kuadran Standar IPR:
1. **FIRE_PREMIUM:** 51 Kolom Master IPR (Aset fisik, okupasi, zona risiko gempa bumi/EQ, nilai pertanggungan/TSI, tarif premi).
2. **FIRE_CLAIM:** 43 Kolom Master IPR (Nomor klaim, tanggal DOL, penyebab kerugian/cause of loss, estimasi klaim).
3. **CREDIT_PREMIUM:** Plafon kredit, debitur, tenor, asuransi jiwa kredit, suku bunga.
4. **CREDIT_CLAIM:** Klaim meninggal dunia, klaim macet, pelunasan sisa kredit.

### Naming Convention Tabel Resmi PostgreSQL:
Data dimuat secara dinamis ke tabel fisik dengan format resmi:
`table_name = {kategori}_{cedant}_{cob}`
Contoh: `premi_aca_fire`, `claim_aca_fire`, `premi_tripakarta_fire`, `claim_tripakarta_fire`, `premi_askrida_credit`, `claim_askrida_credit`, `claim_buanaindependent_fire`.

### Filter Tabel Database:
* Sistem menyaring dan **hanya menampilkan tabel resmi** bertransaksi bordero `{kategori}_{cedant}_{cob}`.
* Tabel sistem/metadata (`alembic_version`, `app_users`, `etl_activity_log`, `mapping_presets`) serta tabel temporer/backup (`*_backup`, `*_clean`, `*_all_quarter`) secara otomatis difilter dan disembunyikan dari dropdown pemilihan tabel bordero.

### Kolom Metadata Otomatis:
Setiap tabel PostgreSQL secara otomatis memiliki dua kolom metadata tambahan di posisi akhir:
1. `period` (TEXT): Format baku gabungan Periode & Tahun (misal `TW1 2025`, `Q2 2024`, `JANUARI 2025`).
2. `cedant_name` (TEXT): Nama entitas perusahaan asuransi (misal `ACA`, `TRIPAKARTA`, `ASKRIDA`).

---

## 4. Dynamic ETL Workflow Pipeline

```text
[ Excel / CSV Mentah ]
│
▼
INGESTION & INSPECT (/api/v1/etl/inspect)
├── Text-score header detection (Skip kop surat / baris logo)
├── Multi-level / Merged header merger (Parent - Child -> Flat string)
└── Ekstraksi metadata sheet & daftar nama kolom
│
▼
VISUAL MAPPING COCKPIT (Frontend Web UI)
├── Resolving Skema 4-Kuadran IPR
├── Auto-Match Fuzzy Token Matching (Exact, Alias, Context scoring)
├── Indikator Kontras Tinggi:
│   ├── Merah Tegas (Border-l-4 + Badge * WAJIB DIISI) untuk kolom wajib yang belum terpetakan
│   ├── Kuning / Amber untuk kolom opsional yang kosong
│   └── Hijau Bercentang untuk kolom terpetakan valid
├── Manajemen Preset Mapping (Dropdown Pilihan Preset, Terapkan Preset, Simpan ke Database)
└── Dynamic Non-IPR Toggle & Sanitasi Nama Field Database
│
▼
TRANSFORMATION & LOADING (/api/v1/etl/process-with-mapping)
├── Normalisasi tanggal, pembersihan teks mata uang, pemaksaan numerik 2 desimal
├── Deduplikasi nama kolom unik (make_unique_column_names) mencegah collision
├── Injeksi kolom period dan cedant_name
└── Pemuatan ke PostgreSQL via COPY stream multi-chunk
│
▼
AUDIT TRAIL & DASHBOARD
├── Pencatatan etl_activity_log (durasi, baris termuat, mapping_config JSON, technical_log)
├── Executive ERP Dashboard Analytics (Donut Chart, Bar Chart, Area Chart real-time)
└── Modal Detail Riwayat (Eye Action Icon) untuk peninjauan eksekusi & hasil mapping
```

---

## 5. Fitur Unggulan Sistem

### 1. Autentikasi Modern (Google & Microsoft SSO)
* Halaman login enterprise dengan integrasi SSO:
  * **Masuk dengan Google** (Google OAuth2).
  * **Masuk dengan Microsoft** (Azure AD / Microsoft Identity).
* Fallback login kredensial lokal untuk operator offline.
* Model `app_users` mencatat `auth_provider`, `avatar_url`, `role`, dan `last_login_at`.

### 2. Executive ERP Dashboard Analytics
* **Analitik Portofolio Bordero:** Donut chart proporsi premi vs klaim per COB (Fire & Credit) serta bar chart kontribusi volume data per cedant.
* **Analitik Sistem & Aktivitas ETL:** Donut chart distribusi peran user (Admin, Operator, Viewer), area chart kecepatan eksekusi ETL (*ms*), dan feed audit trail terkini.
* **Kueri Instan Sub-Milidetik:** Menggunakan PostgreSQL `pg_stat_user_tables` untuk mengagregasi ratusan ribu baris data secara instan (< 50 ms).

### 3. Modul Riwayat & Modal Detail Eksekusi
* Tabel riwayat ETL interaktif dengan filter cedant, COB, kategori, dan status.
* Tombol aksi **Mata (View Detail)** yang membuka modal detail komprehensif:
  1. *Ringkasan Eksekusi:* Metrik baris, durasi, status, nama file, dan pesan error jika gagal.
  2. *Hasil Pemetaan Kolom:* Visualisasi pemetaan kolom Excel asli terhadap field target database.
  3. *Log Teknis:* Catatan audit tahapan pipeline secara rinci.

### 4. Sistem Preset Pemetaan Terintegrasi Database
* Simpan konfigurasi pemetaan kolom langsung ke tabel `mapping_presets` di PostgreSQL.
* Dropdown pemilih preset dan tombol **"Terapkan Preset"** instan pada Column Mapper.

### 5. Unified COB Data Viewers & Ekspor Data
* Tampilan terpadu data bordero Fire dan Kredit dengan opsi *Per Cedant* maupun *Semua Cedant (Agregasi)*.
* Filter periode kuartal, pencarian multi-kolom, filter status integritas (*Valid* vs *Warning*), serta ekspor data ke Excel / CSV.

---

## 6. Struktur Direktori Lengkap

```text
IndoreETL/
├── .gitignore
├── CONTRIBUTION.md
├── LICENSE.md
├── README.md
├── setup.md
├── backend-structure.md
├── frontend-structure.md
├── gemini.md                           # Dokumentasi Arsitektur Utama
│
├── backend/                            # Backend API Service (FastAPI)
│   ├── .env                            # Konfigurasi Environment Aktif
│   ├── .env.example
│   ├── alembic.ini                     # Konfigurasi Alembic
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/                   # Migration Files
│   │       ├── 0001_create_app_users.py
│   │       ├── 0002_create_etl_activity_log.py
│   │       ├── 0003_create_mapping_presets.py
│   │       ├── 0004_update_app_users_sso.py
│   │       └── 0005_add_mapping_config_to_etl_log.py
│   ├── requirements.txt
│   ├── seed_admin.py
│   └── app/
│       ├── main.py                     # Entry point FastAPI & CORS
│       ├── api/v1/
│       │   ├── router.py
│       │   └── endpoints/
│       │       ├── etl.py              # Processing & Ingestion Engine
│       │       ├── history.py          # Audit Trail & Preset Endpoints
│       │       ├── tables.py           # Live DB Tables & Instant Dashboard
│       │       └── user.py             # Auth & SSO Endpoints
│       ├── core/
│       │   ├── config.py
│       │   └── security.py             # Password Hashing & JWT
│       ├── database/
│       │   ├── connection.py           # DB Engine & Session
│       │   └── loader.py               # Direct PostgreSQL COPY Ingestion
│       ├── models/                     # SQLAlchemy ORM Models
│       │   ├── user.py                 # AppUser (SSO + Local)
│       │   ├── etl_log.py              # EtlActivityLog (Mapping config + Tech log)
│       │   └── mapping_preset.py       # MappingPreset
│       └── schema/                     # Pydantic Schemas
│
└── frontend/                           # Frontend Client Application (React/Vite)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                     # Router & Protected Routes
        ├── api/
        │   └── borderoApi.js           # Central API Methods (Auth, ETL, Tables, History)
        ├── context/
        │   └── AuthContext.jsx         # Global Auth Provider (SSO + Local)
        ├── features/
        │   ├── bordero/
        │   │   ├── HistoryView.jsx     # ETL History with Action Eye Button
        │   │   └── EtlDetailModal.jsx  # Rich Execution, Mapping & Audit Modal
        │   └── mapping/
        │       └── components/
        │           └── ColumnMapper.jsx # High-Contrast Visual Mapping Cockpit
        ├── pages/
        │   ├── Dashboard.jsx           # Modern Executive ERP Analytics Dashboard
        │   ├── LoginPage.jsx           # Minimalist SSO & Local Login Page
        │   ├── UserGuide.jsx           # Stable Tab Navigation User Guide
        │   ├── UserManagement.jsx      # Role & User Management Portal
        │   ├── UploadBordero.jsx       # Multi-file Upload & ETL Wizard
        │   └── form/
        │       ├── FormFire.jsx        # Live Fire Viewer & Aggregator
        │       └── FormKredit.jsx      # Live Credit Viewer & Aggregator
        └── utils/
            └── apiClient.js            # Axios Instance with JWT Interceptor
```