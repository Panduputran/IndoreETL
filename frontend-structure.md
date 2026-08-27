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
   etl-indore-fe/
├── .env                        # Variabel environment (misal: REACT_APP_API_BASE_URL)
├── package.json                # Dependensi (react, axios, lucide-react, tailwindcss)
├── tailwind.config.js          # Konfigurasi Tailwind & JSX parser
├── vite.config.js              # Konfigurasi *bundler* Vite
└── src/
    ├── App.jsx                 # Routing utama aplikasi
    ├── index.css               # Global styling
    ├── main.jsx                # Entry point React
    ├── api/
    │   └── borderoApi.js       # Kumpulan fungsi pemanggilan endpoint Axios
    ├── components/             # UI Components yang *reusable*
    │   ├── common/
    │   │   └── EmptyState.jsx  # Tampilan saat data kosong
    │   ├── context/
    │   │   └── SidebarContext.jsx # Manajemen state navigasi sidebar
    │   ├── layout/
    │   │   ├── MainLayout.jsx  # Wrapper layout utama
    │   │   └── Sidebar.jsx     # Navigasi menu kiri
    │   └── ui/                 # Atomic UI (Button, Input, Table)
    ├── constants/
    │   └── data.js             # Master data statis (Daftar Cedant, COB, Periode)
    ├── data/
    │   └── iprMasterData.js    # Definisi 51 atribut standar skema IPR
    ├── features/               # Modul terisolasi berdasarkan fungsionalitas
    │   ├── bordero/            # Fitur pengelolaan dan riwayat bordero
    │   ├── etl/                # Fitur terminal eksekusi ETL & logs
    │   ├── mapping/            # Fitur UI untuk *dynamic column mapping*
    │   ├── sheet-selection/    # Fitur seleksi *sheet* Excel
    │   └── upload/             # Fitur *drag-and-drop* & *upload widget*
    ├── pages/                  # Komponen halaman penuh (*Routed Views*)
    │   ├── Dashboard.jsx       # Ringkasan data & analitik
    │   ├── FormIpr.jsx         # Referensi Master IPR
    │   ├── MasterMapping.jsx   # Halaman *self-service mapping*
    │   ├── UploadBordero.jsx   # Halaman unggah berkas
    │   ├── UserGuide.jsx       # Dokumentasi & FAQ sistem
    │   └── form/
    │       ├── FormFire.jsx    # Tabel live database COB Fire
    │       └── FormKredit.jsx  # Tabel live database COB Kredit
    └── utils/
        ├── apiClient.js        # Konfigurasi global Axios (Timeout 5 menit)
        └── fileUtils.js        # *Helper* regex nama file (Tahun, Kuartal, Kategori)
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