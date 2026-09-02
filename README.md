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

Platform ini menggabungkan antarmuka web modern berbasis **React 19, Tailwind CSS v4, dan Recharts** dengan mesin komputasi berkecepatan tinggi **Python FastAPI, Pandas, & NumPy** yang terintegrasi dengan basis data **PostgreSQL** melalui teknik injeksi binary COPY stream berkinerja tinggi serta arsitektur modular skala produksi.

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
* **Global Maximum-Weight Bipartite Auto-Matching & Full IPR Guarantee:**
  * Algoritma pencocokan bipartit yang memprioritaskan kecocokan persis (*exact & alias match*) dan mencegah perebutan kolom yang tidak semestinya.
  * Penjaminan seluruh kolom standar Master IPR (51 kolom `FIRE_PREMIUM`, 43 kolom `FIRE_CLAIM`, dll.) selalu terbuat di database (diisi `NULL` jika tidak di-mapping).
  * Auto-ALTER dinamis (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) untuk penambahan kolom baru secara instan.
* **Dev Tools: DB Table Manager & Testing Reset Portal:**
  * Halaman khusus developer & tester untuk melihat seluruh tabel fisik di PostgreSQL (`premi_*` dan `claim_*`) beserta jumlah baris (*live tuples*) dan ukuran disk.
  * Fitur **"Drop Table"** per baris dan **"Hapus Semua Tabel Uji Coba"** dengan 1 klik tanpa perlu membuka DBeaver.
* **Visual Mapping Cockpit dengan Kontras Visual Tinggi:**
  * Penandaan baris *Required* yang belum terpetakan dengan border merah tebal (`border-l-4 border-l-rose-500`), latar merah muda (`bg-rose-50/80`), dan badge `* WAJIB DIISI`.
  * Integrasi manajemen preset pemetaan (*"Terapkan Preset"* & *"Simpan Preset ke Database"*).
* **Audit Trail & Modal Detail Eksekusi (Eye Action Icon):**
  * Tabel riwayat ETL dengan tombol aksi **Mata (Detail)** yang membuka modal interaktif 3 tab (*Ringkasan Eksekusi, Hasil Pemetaan Kolom, dan Log Teknis & Audit*).
* **Optimasi Performa Produksi (Sub-Second Response):**
  * **Frontend Code Splitting & Lazy Loading:** Ukuran berkas utama `index.js` tereduksi drastis menjadi **17.8 kB** (5.4 kB gzip) dengan pemisahan *vendor chunks* (`vendor-react`, `vendor-charts`, `vendor-icons`).
  * **In-Memory Query Cache & Deduplication:** Caching client-side cerdas dengan TTL 15-30s dan *auto-invalidation* saat mutasi data berlangsung.
  * **SQLAlchemy Connection Pooling:** Konfigurasi pool konkurensi tinggi (`pool_size=20`, `max_overflow=10`, `pool_recycle=1800`, `pool_pre_ping=True`).
* **Keamanan & Vulnerability Hardening:**
  * **Pencegahan Path Traversal:** Validasi ketat nama file pada folder `temp_uploads/` menggunakan `os.path.basename` dan `os.path.commonpath`.
  * **Pencegahan SQL Injection:** Validasi pola nama tabel dengan regex whitelist `^[a-zA-Z0-9_]+$` dan *quoted identifiers*.

---

## Arsitektur Sistem

```text
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Web Portal)                 │
│  - Google & Microsoft SSO + Local Auth Provider             │
│  - Executive ERP Analytics Dashboard (Recharts Visualizer)  │
│  - Lazy-Loaded Route Splitting & In-Memory Query Caching    │
│  - High-Contrast Visual Mapping Cockpit with Presets        │
│  - Dev Table Manager (Drop Table & Testing Reset Portal)    │
│  - Unified COB Data Viewers & Data Exporter (Fire & Credit) │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / Multipart Form)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend Engine                    │
│  - SSO OAuth & JWT Security Router                          │
│  - File Inspector & Dynamic Header Parsing Engine           │
│  - Transformer Service (Canonical IPR & 1D Vectorization)   │
│  - Connection Pool Optimization (pool_size=20, pre-ping)    │
│  - Path Traversal Guard & SQL Identifier Whitelisting       │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL COPY Batch Stream
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                     │
│  - Official Cedant Tables ({kategori}_{cedant}_{cob})       │
│  - Dynamic Schema Migration (Auto-ALTER Missing Columns)    │
│  - System Metadata (app_users, etl_activity_log, presets)   │
│  - Sub-ms Live Statistics via pg_stat_user_tables           │
└─────────────────────────────────────────────────────────────┘
```

---

## Struktur Repositori

Untuk dokumentasi arsitektur modul secara mendalam, silakan merujuk ke dokumen berikut:
* **[Dokumentasi Arsitektur Utama (gemini.md)](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/gemini.md)**: Ringkasan komprehensif arsitektur, workflow pipeline, dan skema data.
* **[Backend Architecture & Structure](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/backend-structure.md)**: Rincian modul router, transformer service, database loader, dan connection pooling.
* **[Frontend Architecture & Structure](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/frontend-structure.md)**: Rincian komponen UI, lazy loading, caching query, dan konfigurasi chunk Vite.
* **[Panduan Instalasi & Setup (setup.md)](file:///c:/Pandu/Github%20Desktop/IndonesiareETL/setup.md)**: Petunjuk konfigurasi environment, database setup, dan build production.