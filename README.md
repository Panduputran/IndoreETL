<div align="center">

# Insurance Bordero ETL & Cleansing Platform

### Enterprise-Grade Full-Stack Data Pipeline, Cleansing Engine & Analytics Portal

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## Overview

Insurance Bordero ETL & Cleansing Platform adalah platform otomasi pipeline data (Extract, Transform, Load) skala enterprise yang dirancang khusus untuk memproses, memvalidasi, dan membersihkan jutaan baris transaksi bordero reasuransi/asuransi dari berbagai perusahaan asuransi (cedants).

Platform ini menggabungkan antarmuka web modern berbasis React 19 & Tailwind CSS dengan mesin komputasi berkecepatan tinggi Python FastAPI, Pandas, & NumPy yang terintegrasi dengan database PostgreSQL melalui teknik injeksi PostgreSQL COPY berkinerja tinggi.

---

## Fitur Utama (Key Features)

* **Dynamic Header & Metadata Detection:** Otomatis mendeteksi baris offset metadata (kop surat, judul laporan) dan mengidentifikasi letak baris header kolom pada berbagai format berkas Excel/CSV.
* **Vectorized High-Speed Cleansing:** Memanfaatkan vektorisasi NumPy dan Pandas untuk normalisasi format tanggal tidak standar, konversi mata uang (currency stripping), pembersihan karakter non-numerik, dan validasi nomor polis.
* **Multi-Cedant Pluggable Architecture:** Mendukung modul transformasi modular per perusahaan asuransi mitra:
  * PT Asuransi Central Asia (ACA)
  * PT Asuransi Bangun Askrida
  * PT Asuransi Kredit Indonesia (Askrindo)
  * PT Asuransi Buana Independent
  * PT Jasa Raharja Cabang Jabar (Jakre Jabar)
  * PT Penjaminan Kredit Daerah Jabar (Jamkrida Jabar)
  * PT Jaminan Kredit Indonesia (Jamkrindo)
  * PT Asuransi Tri Pakarta
* **Dual IPR Master Schema:** Dukungan pemetaan otomatis untuk 2 Lini Bisnis (Class of Business / COB):
  * **IPR FIRE / Property Master:** 51 atribut standar (TSI 100%, Okupasi, Zona Risiko Gempa EQ, Lokasi Objek).
  * **IPR KREDIT / Financial Master:** 36–48 atribut standar (Plafon Kredit, Nama Debitur, Tenor, Cause of Loss, LKP/No. Klaim).
* **High-Throughput Batch Ingestion:** Pemuatan data batch yang hemat memori (memory-safe chunking) menggunakan PostgreSQL COPY stream untuk memproses dataset berskala besar.
* **Unified Live Data Viewer:** Antarmuka tabel interaktif untuk meninjau data Premi dan Klaim yang telah dinormalisasi lengkap dengan filter tabs, pencarian cepat, paginasi, dan modal konfirmasi penghapusan.

---

## Arsitektur Sistem

```text
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Web Portal)                 │
│  - Drag & Drop Upload with Auto-Inspection                  │
│  - Interactive Sheet Selection & Dynamic Mapping            │
│  - Real-Time ETL Terminal Logs & Visual Progress Monitor    │
│  - Unified COB Data Viewers (Fire & Credit)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / Multipart Form)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend Engine                    │
│  - File Inspector & Dynamic Header Parsing (Calamine/Excel) │
│  - Cedant-Specific Sanitization Modules (Factory Pattern)   │
│  - NumPy / Pandas High-Speed Vectorized Transformation      │
│  - Auto DDL & Table Structure Synchronization               │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL COPY Batch Stream
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                     │
│  - Normalized Bordero Tables (FIRE & KREDIT Master Data)    │
│  - Audit Logs & Error Trails                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Struktur Repositori

Untuk dokumentasi arsitektur modul secara mendalam, silakan merujuk ke dokumen berikut:
* **[Backend Architecture & Structure](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/backend-structure.md)**: Rincian modul router, services cedant, database loader, dan skema Pydantic.
* **[Frontend Architecture & Structure](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/frontend-structure.md)**: Rincian komponen UI, feature modules, routing, dan integrasi API Axios.

```text
IndonesiareETL/
├── backend/                            # Server FastAPI & Mesin Pemrosesan ETL
│   ├── app/                            # Kode sumber aplikasi backend (api, core, database, services)
│   ├── .env.example                    # Template variabel environment backend
│   └── requirements.txt                # Dependensi pustaka Python
├── frontend/                           # Aplikasi Web Portal React (Vite + Tailwind CSS)
│   ├── src/                            # Kode sumber frontend (components, features, pages, utils)
│   ├── .env                            # Variabel environment frontend
│   └── package.json                    # Dependensi paket Node.js
├── backend-structure.md                # Dokumentasi arsitektur backend
├── frontend-structure.md               # Dokumentasi arsitektur frontend
├── setup.md                            # Panduan instalasi dan setup dari awal
└── README.md                           # Ringkasan utama proyek
```

---

## Panduan Memulai Cepat (Quick Start)

Panduan instalasi langkah demi langkah dari awal dapat dilihat di **[setup.md](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/setup.md)**.

### Ringkasan Menjalankan Proyek:

#### 1. Setup Backend:
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1 | Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Sesuaikan kredensial PostgreSQL
uvicorn app.main:app --reload --port 8000
```
Backend API & Swagger Docs aktif di: `http://localhost:8000/docs`

#### 2. Setup Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Portal aktif di: `http://localhost:5173`

---

## Lisensi & Kontribusi

Silakan pelajari [CONTRIBUTION.md](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/CONTRIBUTION.md) dan [LICENSE.md](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/LICENSE.md) untuk pedoman kontribusi dan ketentuan lisensi proyek.