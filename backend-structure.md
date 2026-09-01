# Backend Architecture & Directory Structure

Dokumentasi mengenai arsitektur, modul layanan, dan hierarki direktori backend untuk Insurance Bordero ETL & Cleansing Platform (IndonesiaRe).

---

## Struktur Direktori Backend

```text
backend/
├── .env                                # Variabel environment aktif (Koneksi DB, Host, Port)
├── .env.example                        # Template konfigurasi environment
├── .gitignore                          # Aturan pengecualian file Git (venv, temp, dll)
├── ETL Workflow.png                    # Diagram alur proses ETL bordero
├── requirements.txt                    # Dependensi pustaka Python (FastAPI, Pandas, SQLAlchemy, dll)
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
    │           ├── etl.py              # Endpoint inti pemrosesan ETL (/inspect, /create-table, /process, /process-batch)
    │           ├── history.py          # Endpoint riwayat & audit trail proses ETL
    │           ├── tables.py           # Endpoint pengambilan & manipulasi data live tabel PostgreSQL (COB Fire/Kredit)
    │           └── user.py             # Endpoint autentikasi dan manajemen pengguna
    │
    ├── core/
    │   ├── config.py                   # Master Columns, Sheet Mapping, aturan skema IPR & konfigurasi global
    │   └── security.py                 # Pengamanan data, hashing password & autentikasi JWT
    │
    ├── database/
    │   ├── app_db.py                   # Handler koneksi database aplikasi/pengguna
    │   ├── connection.py               # Engine SQLAlchemy & koneksi pool PostgreSQL
    │   ├── etl_db.py                   # Handler koneksi khusus database pemrosesan ETL
    │   ├── loader.py                   # Engine injeksi batch (PostgreSQL binary/COPY stream)
    │   └── backups/                    # Arsip histori modul database
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
    │   │   ├── askrida.py              # Pembersihan & standardisasi skema PT Asuransi Bangun Askrida
    │   │   ├── askrindo.py             # Pembersihan & standardisasi skema PT Asuransi Kredit Indonesia (Askrindo)
    │   │   ├── buanaindependent.py     # Pembersihan & standardisasi skema PT Asuransi Buana Independent
    │   │   ├── jakrejabar.py           # Pembersihan & standardisasi skema PT Jasa Raharja Cabang Jabar
    │   │   ├── jamkridajabar.py        # Pembersihan & standardisasi skema PT Penjaminan Kredit Daerah Jabar
    │   │   ├── jamkrindo.py            # Pembersihan & standardisasi skema PT Jaminan Kredit Indonesia (Jamkrindo)
    │   │   └── tripakarta.py           # Pembersihan & standardisasi skema PT Asuransi Tri Pakarta
    │   │
    │   └── backup/                     # Arsip versi terdahulu services
    │
    └── utils/
        ├── __init__.py
        ├── helpers.py                  # Utilitas: to_snake_case, format_date, detect_period, auto mkdir
        └── backups/                    # Arsip histori helper
```

---

## Modul & Komponen Kunci

### 1. app/api/v1/endpoints/etl.py
Menyediakan antarmuka REST API untuk seluruh siklus hidup pemrosesan bordero:
* POST /api/v1/etl/inspect: Menginspeksi metadata file Excel/CSV mentah, mendeteksi baris header secara dinamis, mengidentifikasi daftar lembar kerja (sheets), dan menghasilkan estimasi tipe data kolom.
* POST /api/v1/etl/create-table: Otomatis membuat tabel baru di PostgreSQL berdasarkan skema DDL yang teridentifikasi.
* POST /api/v1/etl/process: Mengeksekusi proses sanitasi, normalisasi skema IPR, dan injeksi data secara langsung ke database.
* POST /api/v1/etl/process-batch: Memproses data dalam potongan (chunk/batch) untuk berkas berukuran besar secara hemat memori.

### 2. app/api/v1/endpoints/tables.py
Menangani interaksi antarmuka viewer tabel ke database:
* Mengambil data transaksi bordero yang sudah dinormalisasi berdasarkan Lini Bisnis (Class of Business / COB) seperti FIRE dan KREDIT.
* Mendukung paginasi, pencarian multi-kolom, filter periode/cedant, serta aksi penghapusan baris data.

### 3. app/services/inspector_service.py
Engine inspeksi berkas yang didukung pustaka berkecepatan tinggi (python-calamine / openpyxl / pandas):
* Menganalisis baris-baris awal file Excel untuk mendeteksi offset metadata (logo perusahaan, judul laporan) dan menentukan letak pasti baris Header.
* Menentukan pemetaan kolom otomatis (Auto-Matching) terhadap skema standar IPR (FIRE vs KREDIT).

### 4. app/services/etl_factory.py & app/services/cedants/
Arsitektur berbasis Factory Pattern:
* Mengarahkan berkas yang masuk ke handler spesifik cedant (contoh: AskridaCedant, TripakartaCedant, AcaCedant, BuanaIndependentCedant).
* Menerapkan aturan sanitasi khusus per cedant (format tanggal campur, pemisahan teks mata uang IDR/Rp, pembersihan karakter non-numerik pada nilai premi/TSI/klaim).

### 5. app/database/loader.py
Mesin pemuatan data ke PostgreSQL:
* Menggunakan teknik PostgreSQL COPY (melalui buffer in-memory StringIO atau psycopg2 cursor.copy_expert) untuk performa injeksi data berkecepatan tinggi dibandingkan INSERT standar.