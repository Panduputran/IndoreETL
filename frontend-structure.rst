====================================
Frontend Structure - ETL Workflow UI
====================================

Dokumentasi arsitektur dan struktur direktori modul frontend untuk **Treaty Management System (ETL Workflow & Bordero Processing)**.

Aturan Arsitektur
=================

* **Feature-Based / Modular Directory**: Kode dikelompokkan berdasarkan domain fitur (misal: `upload-etl`, `history`, `mapping`, `master`, `bordero-cedant`).
* **State Orchestration**: Komponen `UploadProcess.jsx` bertindak sebagai orchestrator utama wizard 3 fase (Upload -> Mapping -> Preview/Validate).
* **Multi-Schema Master Support**: Aplikasi mendukung skema IPR terpisah berdasarkan Lini Bisnis (*Class of Business / COB*), yaitu **IPR FIRE / Property Master** (51 atribut fisik/properti) dan **IPR KREDIT / Financial Master** (36-48 atribut keuangan/bank).
* **Unified COB Data Viewer**: Menu *Bordero Cedant* menyatukan data Premi dan Klaim dalam satu antarmuka berbasis COB dengan pembeda badge visual serta tab filter cepat (*Semua / Premi / Klaim*), menghilangkan rute *redundant* terpisah.
* **UI Atomicity & Safety**: Komponen visual umum dipisah ke folder `components/ui` (Table, Button, Badge, Modal). Aksi sensitif seperti hapus data pada viewer dilapisi dengan *Confirmation Modal*.

Struktur Direktori
==================

.. code-block:: text

    src/
    ├── components/                 # Reusable Global UI Components
    │   ├── common/
    │   │   └── EmptyState.jsx     # Placeholder UI untuk state kosong / unselected
    │   ├── ui/
    │   │   ├── Button.jsx         # Standardized Button component
    │   │   └── Table.jsx          # Reusable Table primitives (Header, Body, Row, Cell)
    │   └── Sidebar.jsx            # Main App Navigation (Collapsible Dropdowns & Active Routes)
    │
    ├── features/                  # Modular Feature Domains
    │   ├── upload-etl/            # Core Wizard Module (ETL Upload Workflow)
    │   │   ├── upload/
    │   │   │   └── UploadWidget.jsx    # Phase 1: Upload & Drag-drop file (Select Cedant & Treaty)
    │   │   ├── sheet-selection/
    │   │   │   └── SheetSelector.jsx   # Phase 2A: Pemilihan Sheet (COB Filter)
    │   │   ├── mapping/
    │   │   │   ├── MappingTable.jsx    # Phase 2B: Konfigurasi Mapping Kolom DB (Target vs Source)
    │   │   │   └── data/
    │   │   │       └── mappingData.js  # Raw Headers & Preset Default Mapping (Tripakarta, ACA, Buana, Askrida)
    │   │   ├── preview/
    │   │   │   ├── PreviewTable.jsx    # Phase 3: Preview Data Transaksi IPR
    │   │   │   └── ValidationBadge.jsx # Indicator Status (Valid / Warning / Error)
    │   │   └── UploadProcess.jsx       # Main State Orchestrator (Phase 1 -> 2 -> 3)
    │   │
    │   └── history/               # Module History & Processing Logs
    │       ├── HistoryView.jsx         # Container View untuk Riwayat Upload
    │       ├── AdvancedFilter.jsx      # Filter Pencarian (Cedant Autocomplete & Date Range)
    │       └── HistoryTable.jsx        # Log Table dengan Action Grid 2x2 & Compact Text Wrapping
    │
    └── pages/                     # Standalone Route Pages
        ├── Dashboard.jsx          # Analytics & ETL Summary Statistics
        ├── FormFire.jsx           # Data Viewer khusus COB FIRE (Bordero Cedant -> FIRE)
        ├── FormKredit.jsx         # Data Viewer khusus COB KREDIT (Bordero Cedant -> CREDIT)
        ├── IprMaster.jsx          # Pusat Standard Acuan Atribut IPR (Multi-Schema Dropdown Switcher)
        └── MasterMapping.jsx      # Master Configuration Template Profile (Auto-Match Rules per Cedant)

Alur Proses (Workflow Phases)
==============================

1. **Phase 1: Upload File & Context Selection**
   * Pengguna memilih berkas mentah / preset file target (seperti *Bordero Premi Kredit Askrida*, *Bordero Claim Kredit Askrida*, *Bordero Tripakarta*, *Bordero ACA*, atau *Bordero Buana I*).
   * Pengguna mengunggah file Excel/CSV melalui ``UploadWidget``.
   * Sistem otomatis mengekstrak header berkas dan melakukan verifikasi pencocokan (*auto-match*) terhadap target skema IPR yang sesuai (FIRE vs KREDIT).
   * Setelah berkas tervalidasi awal, alur langsung berlanjut ke Phase 2 (Preview).

2. **Phase 2: Preview & ETL Execution**
   * Menampilkan simulasi data hasil ekstraksi & kualifikasi validasi di ``PreviewTable``.
   * Sistem otomatis memvalidasi kolom *Mandatory* (`*`) dan format tipe data (misal: `DECIMAL (0.01)` / `NUMERIC` pecahan 2 digit desimal untuk nilai pertanggungan/premi/klaim).
   * Eksekusi tombol **Jalankan ETL** memasukkan seluruh baris transaksi ke Database Utama (*Data IPR Master*).

3. **Post-ETL Management & COB Viewers**
   * Data terproses hasil ETL dikelompokkan ke dalam antarmuka viewer sesuai COB:
     * **Bordero Cedant -> FIRE** (``FormFire.jsx``): Menampilkan transaksi properti/kebakaran (TSI 100%, Premium 100%, Okupasi, Lokasi/EQ Zone, Nilai Klaim) dengan Tab Filter (*Semua / Premi Fire / Klaim Fire*).
     * **Bordero Cedant -> CREDIT** (``FormKredit.jsx``): Menampilkan transaksi keuangan/pembiayaan bank (Bank Tertanggung, Nama Debitur, Plafond Kredit, Tenor Bulan, LKP/No. Klaim, Cause of Loss & DOL) dengan Tab Filter (*Semua / Premi Kredit / Klaim Kredit*).
   * Setiap tabel viewer bebas dari kolom urut `NO` yang *redundant* (langsung dimulai dari identitas `No. Polis`), serta dilengkapi *Delete Confirmation Modal* untuk keamanan pengelolaan data.
   * Template acuan atribut baku dapat dipantau di **IPR Master Schema** (``IprMaster.jsx``) dengan *Dropdown Switcher* (🏢 IPR FIRE vs 💳 IPR KREDIT).