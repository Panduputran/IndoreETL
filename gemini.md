# IndoreETL — Dynamic Bordero Data Harmonization & Database Pipeline

> Document Version: 0.1.0
> Target Audience: Engineering Team, ETL Operators, Gemini Context Assistant
> Role Context: Project Manager & Lead Software Engineer

---

## 1. Project Vision & Executive Summary

IndoreETL adalah platform otomasi ekstraksi, transformasi, dan pemuatan data (ETL Engine) khusus untuk memproses berkas laporan bordero (bordereaux) dari berbagai perusahaan mitra (cedants) ke dalam basis data PostgreSQL yang terstandardisasi sesuai regulasi format IPR (Indonesia Re Standard).

### Masalah Utama yang Diselesaikan:
1. Heterogenitas Format Sumber: Setiap cedant (misal Askrida, ACA, Tripakarta, Marsh) mengirimkan berkas Excel mentah dengan struktur kolom, penamaan alias, baris header bertingkat (merged headers), dan jumlah kolom yang berbeda-beda.
2. Keterbatasan Hardcoded Script: Skrip kaku (hardcoded mapping) mudah rusak saat cedant mengubah sedikit penamaan kolom atau menambahkan kop surat.
3. Pemberdayaan Operator & Data Preservation: Sistem menyediakan antarmuka visual berbasis web (Cockpit Mapping UI) agar operator dapat memverifikasi pencocokan kolom secara otomatis, mengontrol kolom non-IPR tambahan tanpa kehilangan data, serta mengeksekusi migrasi ke tabel dinamis dengan aman.

---

## 2. Core Architecture & Stack

### Backend Engine (Python / FastAPI)
* Framework: FastAPI (RESTful API & Modular Routers)
* Data Processing: Pandas, OpenPyXL, Xlrd
* Database Access: SQLAlchemy Engine + PostgreSQL Client
* Detection Engine: Dynamic text-scoring header & multi-level parser

### Frontend Interface (React / Vite)
* Build Tool: Vite + React (Modular Functional Components & Hooks)
* Styling & UI: Tailwind CSS + Lucide Icons
* State Management: Transient SessionStorage + LocalStorage Preset Memory
* Matching Utility: Dual-tier Fuzzy Token Scoring Engine

---

## 3. Data Strategy & Schema Matrix

Sistem mendukung 4 Kuadran Standar IPR:
1. FIRE_PREMIUM (51 Kolom Master IPR)
2. FIRE_CLAIM (43 Kolom Master IPR)
3. CREDIT_PREMIUM (Plafon, Tenor, Asuransi Jiwa Kredit)
4. CREDIT_CLAIM (Klaim Meninggal/Macet Kredit)

### Naming Convention Tabel PostgreSQL:
Data dimuat secara dinamis ke tabel fisik dengan pola baku:
table_name = {kategori}_{cedant}_{cob}
Contoh: premi_marsh_fire, claim_tripakarta_fire, premi_askrida_credit.

### Aturan Kolom Sistem (System Injected Columns):
Setiap tabel PostgreSQL secara otomatis memiliki dua kolom metadata tambahan di posisi akhir:
1. period (TEXT): Format baku gabungan Periode & Tahun (misal TW1 2025, Q2 2024, JANUARI 2025).
2. cedant_name (TEXT): Nama entitas perusahaan pemegang polis/broker (misal MARSH, TRIPAKARTA, ACA).

---

## 4. Dynamic ETL Workflow Pipeline
[ Excel / CSV Mentah ]
│
▼

INGESTION & INSPECT (/api/v1/etl/inspect)
├── Text-score header detection (Skip kop surat/baris kosong)
├── Multi-level / Merged header merger (Parent - Child -> Flat string)
└── Ekstraksi metadata sheet & daftar nama kolom
│
▼

VISUAL MAPPING COCKPIT (Frontend Web UI)
├── Resolving Skema 4-Kuadran IPR
├── Auto-Match Fuzzy Matching (Bobot Context, Alias, Exact match)
├── Warning visual: Merah (Wajib & Kosong), Kuning (Opsional & Kosong)
├── Dynamic Non-IPR Toggle & Custom Field Renaming
└── Smart Preset Storage (LocalStorage) & Apply-to-All batch
│
▼

TRANSFORMATION & LOADING (/api/v1/etl/process-with-mapping)
├── Rename kolom sesuai skema IPR dan konfigurasi Non-IPR
├── Drop sisa kolom sampah (Unnamed/Empty cols)
├── Injeksi kolom period dan cedant_name
└── Pemuatan ke PostgreSQL via SQLAlchemy multi-chunk
│
▼

REPORTING & SUMMARY
└── Visual dashboard status: Baris termuat, kolom IPR, dan kolom ekstra

---


## 5. Complete Directory Structure Overview

```text
IndoreETL/
├── .gitignore
├── CONTRIBUTION.md
├── LICENSE.md
├── README.md
├── setup.md
├── backend-structure.md
├── frontend-structure.md
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   ├── test_db.py
│   ├── test_runner.py
│   ├── ETL Workflow.png
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── api/
│       │   └── v1/
│       │       ├── router.py
│       │       ├── endpoints/
│       │       │   ├── etl.py
│       │       │   ├── history.py
│       │       │   ├── tables.py
│       │       │   └── user.py
│       │       └── backups/
│       │           └── etl.py
│       ├── core/
│       │   ├── config.py
│       │   └── security.py
│       ├── database/
│       │   ├── app_db.py
│       │   ├── connection.py
│       │   ├── etl_db.py
│       │   ├── loader.py
│       │   └── backups/
│       │       └── loader.py
│       ├── schema/
│       │   ├── etl.py
│       │   ├── token.py
│       │   └── user.py
│       ├── services/
│       │   ├── __init__.py
│       │   ├── etl_factory.py
│       │   ├── inspector_service.py
│       │   ├── cedants/
│       │   │   ├── base.py
│       │   │   ├── aca.py
│       │   │   ├── askrida.py
│       │   │   ├── askrindo.py
│       │   │   ├── buanaindependent.py
│       │   │   ├── jakrejabar.py
│       │   │   ├── jamkridajabar.py
│       │   │   ├── jamkrindo.py
│       │   │   └── tripakarta.py
│       │   └── backup/
│       │       ├── aca.py
│       │       ├── askrida.py
│       │       ├── claim.py
│       │       ├── config.py
│       │       ├── inspector.py
│       │       ├── inspector_service.py
│       │       ├── premi.py
│       │       └── tripakarta.py
│       └── utils/
│           ├── __init__.py
│           ├── helpers.py
│           └── backups/
│               └── helpers.py
│
└── frontend/
    ├── .env
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── eslint.config.js
    ├── README.md
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    ├── backups/
    │   ├── UploadProcess.jsx
    │   └── UploadWidget.jsx
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── api/
        │   └── borderoApi.js
        ├── assets/
        │   ├── hero.png
        │   ├── indore.png
        │   ├── react.svg
        │   └── vite.svg
        ├── components/
        │   ├── common/
        │   │   ├── EmptyState.jsx
        │   │   ├── ErrorBoundary.jsx
        │   │   ├── ErrorMessage.jsx
        │   │   └── Loading.jsx
        │   ├── context/
        │   │   └── SidebarContext.jsx
        │   ├── layout/
        │   │   ├── Header.jsx
        │   │   ├── MainLayout.jsx
        │   │   ├── Navbar.jsx
        │   │   └── Sidebar.jsx
        │   └── ui/
        │       ├── Button.jsx
        │       ├── Input.jsx
        │       ├── Modal.jsx
        │       └── Table.jsx
        ├── constants/
        │   └── data.js
        ├── data/
        │   └── iprMasterData.js
        ├── features/
        │   ├── bordero/
        │   │   ├── AdvancedFilter.jsx
        │   │   ├── HistoryTable.jsx
        │   │   ├── HistoryView.jsx
        │   │   └── UploadProcess.jsx
        │   ├── etl/
        │   │   ├── index.jsx
        │   │   ├── components/
        │   │   │   └── EtlTerminalPage.jsx
        │   │   └── backups/
        │   │       └── EtlTerminalPage.jsx
        │   ├── mapping/
        │   │   ├── index.jsx
        │   │   ├── components/
        │   │   │   ├── ColumnMapper.jsx
        │   │   │   └── MappingTable.jsx
        │   │   ├── data/
        │   │   │   └── mappingData.js
        │   │   └── utils/
        │   │       └── matcher.js
        │   ├── sheet-selection/
        │   │   ├── index.jsx
        │   │   └── components/
        │   │       └── SheetSelector.jsx
        │   └── upload/
        │       ├── index.jsx
        │       └── components/
        │           ├── CedantSearch.jsx
        │           ├── DragDrop.jsx
        │           ├── FileList.jsx
        │           ├── FileQueueItem.jsx
        │           ├── PeriodSelector.jsx
        │           ├── UploadBox.jsx
        │           └── UploadWidget.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── FormIpr.jsx
        │   ├── MasterMapping.jsx
        │   ├── UploadBordero.jsx
        │   ├── UserGuide.jsx
        │   └── form/
        │       ├── FormFire.jsx
        │       └── FormKredit.jsx
        └── utils/
            ├── apiClient.js
            └── fileUtils.js
---


## 6. Strict AI & Developer Generation Rules
Setiap kali AI Agent atau developer menghasilkan kode atau memodifikasi berkas dalam proyek ini, aturan berikut wajib dipatuhi:

DILARANG MENGGUNAKAN EMOJI: Jangan menambahkan emoji apa pun di dalam kode sumber, komentar program, file dokumentasi markdown, commit message, maupun output antarmuka console.

DILARANG MERUSAK STRUKTUR SKEMA TABEL: Nama tabel target di PostgreSQL wajib mengikuti konvensi {kategori}_{cedant}_{cob}.

PRESERVASI KOLOM NON-IPR: Jangan membuang kolom sumber yang belum terdaftar di IPR tanpa izin operator. Berikan konfigurasi toggle aktif/nonaktif di UI dan sanitasi field name ke format snake_case aman.

INJEKSI KOLOM SISTEM: Setiap proses ETL wajib memastikan kolom period (gabungan periode dan tahun) serta cedant_name (nama entitas cedant huruf kapital) terinjeksi di bagian akhir tabel.

STANDARISASI TIPE DATA: Gunakan TEXT untuk seluruh field tanggal guna mencegah error konversi antar-format cedant, NUMERIC(20,2) untuk nilai moneter, dan BIGINT untuk integer ID/tahun.

LARANGAN CODE PLACEHOLDER: Dilarang menggunakan komentar pemotong seperti // ... rest of the code atau # existing code here saat menyajikan berkas perbaikan. Sajikan kode yang utuh, fungsional, dan dapat langsung di-copy-paste.