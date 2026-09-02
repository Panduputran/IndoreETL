# Panduan Setup & Instalasi dari Awal (Step-by-Step)

Panduan instalasi dan konfigurasi lokal lengkap untuk menjalankan Insurance Bordero ETL & Cleansing Platform (IndonesiaRe) dari awal.

---

## Prasyarat Sistem (Prerequisites)

Pastikan aplikasi-aplikasi berikut sudah terinstal di komputer Anda:

| Perangkat Lunak | Versi Minimal | Keterangan |
| :--- | :--- | :--- |
| **Python** | `3.11+` | Backend Runtime & Data Cleansing Engine |
| **Node.js** | `18+` (Direkomendasikan `20+`) | Frontend Runtime |
| **npm** | `9+` | Node Package Manager |
| **PostgreSQL** | `14+` (Direkomendasikan `15+`) | Database Penyimpanan Relasional |
| **Git** | Versi Terbaru | Version Control System |

---

## Langkah 1: Persiapan Database PostgreSQL

1. Buka terminal **psql** atau aplikasi **pgAdmin**.
2. Buat database baru bernama `indore_etl`:
   ```sql
   CREATE DATABASE indore_etl;
   ```
3. Catat kredensial PostgreSQL Anda:
   * **Host:** `localhost`
   * **Port:** `5432`
   * **Database Name:** `indore_etl`
   * **Username:** `postgres` (atau user PostgreSQL Anda)
   * **Password:** *password user PostgreSQL Anda*

---

## Langkah 2: Setup & Menjalankan Backend (FastAPI)

### 1. Masuk ke direktori backend
Buka terminal baru di root repository, lalu arahkan ke folder `backend`:
```powershell
cd backend
```

### 2. Buat Python Virtual Environment (`venv`)
* **Di Windows (PowerShell / Command Prompt):**
  ```powershell
  python -m venv venv
  ```
* **Di Linux / macOS:**
  ```bash
  python3 -m venv venv
  ```

### 3. Aktifkan Virtual Environment
* **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(Catatan: Jika muncul error Restricted Execution Policy di PowerShell, jalankan: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` lalu ulangi perintah aktivasi).*
* **Windows (Command Prompt / cmd.exe):**
  ```cmd
  venv\Scripts\activate.bat
  ```
* **Linux / macOS (Bash / Zsh):**
  ```bash
  source venv/bin/activate
  ```

### 4. Instal Dependensi Python
Jalankan instalasi pustaka yang ada di `requirements.txt`:
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Konfigurasi Environment File (`.env`)
Salin template `.env.example` menjadi `.env`:
* **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
* **Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

Buka file `.env` di folder `backend/` dan sesuaikan dengan kredensial database Anda:
```env
DB_USER=postgres
DB_PASSWORD=password_database_anda
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indore_etl

# JWT Authentication Config
JWT_SECRET_KEY=indore-treaty-ru-secret-key-super-secure-2025
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480
```

### 6. Jalankan Database Migration (Alembic)
Jalankan migrasi untuk membuat dan memperbarui tabel sistem (`app_users` dengan dukungan SSO, `etl_activity_log` dengan konfigurasi mapping, dan `mapping_presets`):
```powershell
alembic upgrade head
```

### 7. Buat Akun Administrator Default
Jalankan script seeder untuk membuat akun admin pertama:
```powershell
python seed_admin.py
```
*(Akun default: Username: `admin`, Password: `admin123`. Selain itu, Anda juga dapat langsung masuk menggunakan akun Google atau Microsoft Single Sign-On).*

### 8. Jalankan Server Backend
Jalankan server pengembangan FastAPI dengan hot-reload:
```powershell
uvicorn app.main:app --reload --port 8000
```
Jika berhasil, server backend akan berjalan di:
* **Base URL:** `http://localhost:8000`
* **Dokumentasi Interaktif Swagger UI:** `http://localhost:8000/docs`
* **Dokumentasi Redoc:** `http://localhost:8000/redoc`

---

## Langkah 3: Setup & Menjalankan Frontend (React + Vite)

### 1. Buka Terminal Baru dan Masuk ke Folder Frontend
Buka terminal terpisah di root repository:
```powershell
cd frontend
```

### 2. Konfigurasi Environment File (`.env`)
Pastikan file `.env` pada folder `frontend/` sudah mengarah ke backend API:
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Instal Dependensi Node.js
Jalankan perintah instalasi paket:
```powershell
npm install
```

### 4. Jalankan Frontend Development Server
Jalankan server aplikasi React:
```powershell
npm run dev
```

Aplikasi frontend akan terbuka secara lokal di browser pada alamat:
`http://localhost:5173`

---

## Langkah 4: Verifikasi & Uji Coba Sistem

1. **Uji Koneksi Backend:**
   * Buka browser dan akses `http://localhost:8000`.
   * Anda akan melihat respons JSON:
     ```json
     {"message": "IndonesiaRe ETL API Engine Service is Running!"}
     ```
2. **Uji Swagger API Docs:**
   * Akses `http://localhost:8000/docs`.
   * Anda dapat mencoba endpoint seperti `/api/v1/tables/` atau `/api/v1/etl/inspect`.
3. **Uji Antarmuka Web Portal:**
   * Buka `http://localhost:5173`.
   * Buka menu **Upload Bordero**, pilih salah satu Cedant (contoh: *Askrida* atau *Tripakarta*), pilih COB (**FIRE** / **KREDIT**), dan unggah berkas bordero Excel/CSV untuk menguji proses parsing dan preview.

---

## Panduan Troubleshooting (Masalah Umum)

### 1. Error: `Script execution is disabled on this system` (PowerShell)
**Solusi:** Berikan izin eksekusi script untuk sesi terminal saat ini:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 2. Error: `Gagal membuat koneksi database` / `Is the server running on host localhost...`
**Solusi:**
* Pastikan layanan PostgreSQL service sedang berjalan (*Services.msc* -> *postgresql-x64* -> *Start*).
* Periksa kembali `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` pada file `backend/.env`.

### 3. Error CORS (Cross-Origin Resource Sharing) pada Frontend
**Solusi:**
* Backend sudah dilengkapi middleware CORS dengan `allow_origins=["*"]`. Pastikan server FastAPI di `http://localhost:8000` sedang berjalan saat Anda mengakses frontend di `http://localhost:5173`.

### 4. Error Modul Python Missing (`ModuleNotFoundError`)
**Solusi:**
* Pastikan virtual environment dalam keadaan aktif (`(venv)` muncul di awal prompt terminal).
* Jalankan kembali: `pip install -r requirements.txt`.