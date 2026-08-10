====================================
Frontend Structure - ETL Workflow UI
====================================

Dokumentasi arsitektur dan struktur direktori modul frontend untuk **Treaty Management System (ETL Workflow & Bordero Processing)**.

Aturan Arsitektur
=================

* **Feature-Based / Modular Directory**: Kode dikelompokkan berdasarkan domain fitur (misal: `upload-etl`, `history`, `master`, `bordero-cedant`).
* **State Orchestration**: Komponen `UploadProcess.jsx` bertindak sebagai orchestrator utama wizard 3 fase (Upload -> Mapping -> Preview/Validate).
* **UI Atomicity & Reusability**: Komponen visual umum dipisah ke folder `components/ui` (Table, Button, Badge) dan `components/common`.
* **Compact & Human-Readable Tables**: UI dirancang agar responsif, *compact* (menghindari *horizontal scrolling* dengan *text wrapping* & *grid action* 2x2), serta menggunakan penamaan header yang ramah pengguna.

Struktur Direktori
==================

.. code-block:: text

    src/
    ├── components/                # Reusable Global UI Components
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
    │   │   │   └── MappingTable.jsx    # Phase 2B: Konfigurasi Mapping Kolom DB (Target vs Source)
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
        ├── FormFire.jsx           # Data Viewer khusus COB Fire (Bordero Cedant -> FIRE)
        └── MasterMapping.jsx      # Master Configuration Template Profile (Auto-Match Rules)

Alur Proses (Workflow Phases)
==============================

1. **Phase 1: Upload File & Context Selection**
   * Pengguna memilih **Cedant Code** dan **Treaty Code** target.
   * Pengguna mengunggah file Excel/CSV melalui ``UploadWidget``.
   * Setelah berkas tervalidasi awal, alur berlanjut ke Phase 2.

2. **Phase 2: Mapping & Sheet Selection**
   * Pengguna memilih sheet target yang akan diproses via ``SheetSelector`` (misal: *Fire Premium*).
   * Pengguna menyesuaikan pemetaan kolom (*source Excel vs target PostgreSQL*) di ``MappingTable`` (dengan opsi *Auto-Matched* berbasis ketersediaan Master Template).

3. **Phase 3: Preview & ETL Execution**
   * Menampilkan simulasi data hasil ekstraksi & kualifikasi validasi di ``PreviewTable``.
   * Eksekusi tombol **Jalankan ETL** memasukkan baris transaksi ke Database Utama (Data IPR/Premi/Klaim) dan menyimpan aturan ke **Master Mapping Profile**.

4. **Post-ETL Management & Master Template**
   * Data terproses dapat dipantau di halaman **Riwayat Upload** (``HistoryView``) dengan filter *autocomplete* Cedant.
   * Template aturan pencocokan header disimpan di **Master Mapping** (``MasterMapping``) agar *upload* bulanan berikutnya dapat berjalan secara *Auto-Match 100%*.