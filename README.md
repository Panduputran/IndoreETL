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

**Insurance Bordero ETL & Cleansing Platform (IndoreETL)** adalah platform otomasi pipeline data (*Extract, Transform, Load*) skala enterprise yang dirancang khusus untuk memproses, memvalidasi, menstandardisasi, dan menganalisis jutaan baris transaksi bordero reasuransi/asuransi dari berbagai perusahaan asuransi (*cedants*).

Platform ini menggabungkan antarmuka web modern berbasis **React 19, Tailwind CSS v4, dan Recharts** dengan mesin komputasi berkecepatan tinggi **Python FastAPI, Pandas, & NumPy** yang terintegrasi dengan basis data **PostgreSQL** melalui teknik injeksi binary COPY stream berkinerja tinggi.

---

## Fitur Utama (Key Features)

* **Autentikasi Modern & SSO (Google & Microsoft Identity):**
  * Tombol login Single Sign-On (SSO) terintegrasi dengan Google OAuth2 dan Microsoft Azure AD.
  * Form login akun lokal/operator untuk kebutuhan offline fallback.
  * Skema penyimpanan profil user (`auth_provider`, `avatar_url`, `role`, `last_login_at`).
* **Executive ERP Analytics Dashboard:**
  * Metrik KPI real-time dengan kueri instan sub-milidetik (`pg_stat_user_tables`).
  * Visualisasi grafik Donut/Pie Chart untuk komposisi premi vs klaim dan distribusi peran user.
  * Grafik Bar Chart kontribusi volume transaksi per cedant dan Area Chart kecepatan eksekusi ETL (*ms*).
* **Filter Tabel Database Resmi Cedant (`{kategori}_{cedant}_{cob}`):**
  * Sistem kueri menyaring dan hanya menampilkan tabel fisik resmi (misal `premi_aca_fire`, `claim_tripakarta_fire`, `premi_askrida_credit`).
  * Tabel sistem/metadata (`alembic_version`, `app_users`, `etl_activity_log`, `mapping_presets`) dan tabel backup otomatis disembunyikan.
* **Visual Mapping Cockpit dengan Kontras Visual Tinggi:**
  * Penandaan baris *Required* yang belum terpetakan dengan border merah tebal (`border-l-4 border-l-rose-500`), latar merah muda (`bg-rose-50/80`), dan badge `* WAJIB DIISI`.
  * Penandaan baris opsional kosong berwarna kuning/amber (`border-l-4 border-l-amber-400`).
  * Penandaan baris valid berwarna hijau (`border-l-4 border-l-emerald-500`).
  * Integrasi manajemen preset pemetaan (*"Terapkan Preset"* & *"Simpan Preset ke Database"*).
* **Audit Trail & Modal Detail Eksekusi (Eye Action Icon):**
  * Tabel riwayat ETL dengan tombol aksi **Mata (Detail)** yang membuka modal interaktif 3 tab:
    1. *Ringkasan Eksekusi:* Metrik baris, durasi, status, nama file, dan banner error.
    2. *Hasil Pemetaan Kolom:* Visualisasi pemetaan kolom sumber terhadap field target IPR & Non-IPR.
    3. *Log Teknis & Audit:* Konsol catatan tahapan inspeksi, sanitasi, dan stream injeksi ke database.
* **User Guide Bebas Layout Shift:**
  * Antarmuka panduan pengguna terstruktur dengan tombol tab fixed-border dan kontainer stabil (`min-h-[420px]`).
* **Dynamic Header & Metadata Detection:**
  * Otomatis mendeteksi baris offset metadata (kop surat, judul laporan) dan mengidentifikasi letak baris header kolom pada berkas Excel/CSV.
* **Vectorized High-Speed Cleansing:**
  * Memanfaatkan vektorisasi NumPy dan Pandas untuk normalisasi format tanggal, pembersihan teks mata uang, pemaksaan numerik 2 desimal, dan validasi integritas data.
* **High-Throughput Batch Ingestion:**
  * Pemuatan data batch hemat memori (*memory-safe chunking*) menggunakan PostgreSQL COPY stream multi-chunk.

---

## Arsitektur Sistem

```text
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Web Portal)                 │
│  - Google & Microsoft SSO + Local Auth Provider             │
│  - Executive ERP Analytics Dashboard (Recharts Visualizer)  │
│  - High-Contrast Visual Mapping Cockpit with Presets        │
│  - Unified COB Data Viewers & Data Exporter (Fire & Credit) │
│  - ETL Audit Trail & Multi-Tab Execution Detail Modal       │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / Multipart Form)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend Engine                    │
│  - SSO OAuth & JWT Security Router                          │
│  - File Inspector & Dynamic Header Parsing Engine           │
│  - NumPy / Pandas High-Speed Vectorized Transformation      │
│  - Official Table Name Filter & Sub-ms PG Stats Dashboard   │
│  - Column Name Deduplication (make_unique_column_names)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL COPY Batch Stream
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                     │
│  - Official Cedant Tables ({kategori}_{cedant}_{cob})       │
│  - System Metadata (app_users, etl_activity_log, presets)   │
│  - Sub-ms Live Statistics via pg_stat_user_tables           │
└─────────────────────────────────────────────────────────────┘
```

---

## Struktur Repositori

Untuk dokumentasi arsitektur modul secara mendalam, silakan merujuk ke dokumen berikut:
* **[Dokumentasi Arsitektur Utama (gemini.md)](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/gemini.md)**: Ringkasan komprehensif arsitektur, workflow pipeline, dan skema data.
* **[Backend Architecture & Structure](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/backend-structure.md)**: Rincian modul router, services cedant, database loader, dan skema Pydantic.
* **[Frontend Architecture & Structure](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/frontend-structure.md)**: Rincian komponen UI, feature modules, routing, dan integrasi API Axios.
* **[Panduan Instalasi & Setup (setup.md)](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/setup.md)**: Panduan setup database PostgreSQL, backend FastAPI, dan frontend React.