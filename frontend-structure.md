# Frontend Architecture & Directory Structure

Dokumentasi arsitektur dan struktur direktori frontend untuk Treaty Management System & Bordero ETL Processing Portal (IndonesiaRe).

---

## Arsitektur & Prinsip Desain

* **Framework & Build Tool:** Menggunakan React 19 bersama Vite untuk performa build dan Hot Module Replacement (HMR) cepat.
* **Styling System:** Didukung oleh Tailwind CSS v4 untuk styling responsif dan modular.
* **Feature-Driven Architecture:** Kode dikelompokkan ke dalam direktori modul fitur yang terisolasi (`upload`, `bordero`, `etl`, `mapping`, `sheet-selection`).
* **Multi-Schema Master Support:** Mendukung pemrosesan dan visualisasi skema IPR terpisah berdasarkan Lini Bisnis (Class of Business / COB):
  * **IPR FIRE / Property Master:** 51 atribut aset fisik, tarif premi, okupasi, zona risiko gempa bumi (EQ).
  * **IPR KREDIT / Financial Master:** 36–48 atribut perbankan, plafon kredit, debitur, tenor, LKP, cause of loss.
* **Unified COB Data Viewer & Validasi:** Menampilkan visualisasi data Premi dan Klaim dalam tampilan tabel interaktif dengan pilihan Per Cedant maupun Semua Cedant, filter status Valid/Warning, filter periode dinamis, serta Modal Ekspor Data (Halaman Aktif / Seluruh Data Terfilter).
* **Live Analytics Dashboard:** Menampilkan metrik real-time dari PostgreSQL, perbandingan volume Premi vs Klaim, distribusi per lini bisnis (Fire & Kredit), peringkat kontribusi cedant, dan tabel rincian dataset aktif.

---

## Struktur Direktori Frontend

```text
frontend/
├── .env                                # Variabel environment (REACT_APP_API_BASE_URL)
├── .gitignore                          # Aturan abaikan file Git (node_modules, dist, dll)
├── eslint.config.js                    # Konfigurasi ESLint & linting rules
├── index.html                          # Root HTML entry point
├── package.json                        # Definisi dependensi (React, Vite, Axios, Lucide React, Recharts)
├── postcss.config.js                   # Konfigurasi PostCSS
├── tailwind.config.js                  # Konfigurasi tema Tailwind CSS
├── vite.config.js                      # Konfigurasi bundler Vite
│
└── src/
    ├── App.css                         # CSS pendukung
    ├── App.jsx                         # Router utama aplikasi & deklarasi rute halaman
    ├── index.css                       # Global styles & konfigurasi Tailwind directive
    ├── main.jsx                        # Entry point React DOM render
    │
    ├── api/
    │   └── borderoApi.js               # Service client Axios untuk integrasi API backend
    │
    ├── assets/                         # Asset statis, logo, ikon gambar
    │
    ├── components/                     # Komponen UI global yang dapat digunakan kembali (reusable)
    │   ├── common/
    │   │   └── EmptyState.jsx          # Tampilan placeholder saat data kosong / belum dimuat
    │   ├── context/
    │   │   └── SidebarContext.jsx      # React Context untuk status navigasi sidebar
    │   ├── layout/
    │   │   ├── MainLayout.jsx          # Wrapper layout utama aplikasi (Navbar, Sidebar, Content Area)
    │   │   └── Sidebar.jsx             # Panel navigasi sisi kiri dengan navigasi rute aktif
    │   └── ui/                         # Atomic components (Button, Input, Table, Badge, Modal, Card)
    │
    ├── constants/
    │   └── data.js                     # Master data statis (Daftar Cedant, Pilihan COB, Periode Kuartal/Tahun)
    │
    ├── data/
    │   └── iprMasterData.js            # Kamus atribut standar baku skema IPR FIRE dan IPR KREDIT
    │
    ├── features/                       # Modul fitur terisolasi
    │   ├── bordero/                    # Pengelolaan data bordero & riwayat pemrosesan
    │   │   ├── AdvancedFilter.jsx      # Panel filter multi-kriteria (Cedant, Periode, COB)
    │   │   ├── HistoryTable.jsx        # Tabel riwayat eksekusi ETL & status log
    │   │   ├── HistoryView.jsx         # View container riwayat transaksi
    │   │   └── UploadProcess.jsx       # State Orchestrator alur wizard unggah berkas
    │   │
    │   ├── etl/                        # Terminal eksekusi ETL & visualisasi log real-time
    │   │   └── components/
    │   │       └── EtlTerminalPage.jsx # Konsol log terminal proses cleansing & ingestion
    │   │
    │   ├── mapping/                    # Antarmuka pemetaan kolom dinamis (dynamic column mapping)
    │   ├── sheet-selection/            # Komponen seleksi lembar kerja (sheet selector) untuk file multi-sheet
    │   └── upload/                     # Komponen interaktif upload file
    │       └── components/
    │           ├── CedantSearch.jsx    # Pencarian cepat & pemilihan nama perusahaan asuransi
    │           ├── DragDrop.jsx        # Area drag-and-drop file dengan validasi ekstensi
    │           ├── FileList.jsx        # Daftar file dalam antrean upload
    │           ├── FileQueueItem.jsx   # Item status unggahan per file
    │           ├── PeriodSelector.jsx  # Pilihan kuartal (Q1–Q4) dan tahun transaksi
    │           ├── UploadBox.jsx       # Container utama kotak upload
    │           └── UploadWidget.jsx    # Widget wizard upload terintegrasi
    │
    ├── pages/                          # Halaman tampilan utama (Routed Pages)
    │   ├── Dashboard.jsx               # Dashboard analitik transaksi, grafik statistik, & metrik utama
    │   ├── FormIpr.jsx                 # Halaman referensi kamus atribut Master IPR (FIRE & KREDIT)
    │   ├── MasterMapping.jsx           # Halaman konfigurasi & manajemen pemetaan kolom mandiri
    │   ├── UploadBordero.jsx           # Halaman utama proses unggah berkas bordero
    │   ├── UserGuide.jsx               # Dokumentasi panduan pengguna, alur kerja, & FAQ sistem
    │   └── form/
    │       ├── FormFire.jsx            # Live Database Viewer untuk transaksi COB Properti/Fire
    │       └── FormKredit.jsx          # Live Database Viewer untuk transaksi COB Keuangan/Kredit
    │
    └── utils/
        ├── apiClient.js                # Konfigurasi instance Axios global (base URL, timeout, headers)
        └── fileUtils.js                # Helper regex nama file, parsing ekstensi, formatting ukuran byte
```

---

## Alur Kerja Pengguna (User Workflow)

1. **Upload Berkas & Konteks Transaksi (`UploadBordero.jsx`)**
   * Pengguna memilih nama Cedant (misal: Askrida, ACA, Tripakarta), Lini Bisnis (FIRE atau KREDIT), serta Periode (Tahun & Kuartal).
   * Menyeret berkas Excel/CSV ke dalam area `UploadWidget`.

2. **Inspeksi & Auto-Mapping**
   * Berkas dikirim ke endpoint backend `/api/v1/etl/inspect`.
   * Sistem mendeteksi header secara otomatis dan mencocokkan kolom mentah terhadap kolom target skema baku IPR.
   * Pengguna dapat meninjau lembar kerja (sheet) yang aktif dan melakukan penyesuaian pemetaan jika terdapat kolom khusus.

3. **Preview & Eksekusi Pipeline ETL**
   * Pengguna melihat cuplikan data hasil sanitasi awal (Preview Table) dan validasi kolom wajib (Mandatory fields).
   * Menekan tombol Jalankan ETL untuk memulai sanitasi vektor NumPy/Pandas dan injeksi batch ke PostgreSQL melalui terminal monitor.

4. **Monitoring & Akses Data (`FormFire.jsx` & `FormKredit.jsx`)**
   * Hasil data yang telah diproses langsung dapat diakses pada menu Bordero Cedant (Fire/Kredit).
   * Dilengkapi fitur filter Premi/Klaim, pencarian, paginasi, serta export data.