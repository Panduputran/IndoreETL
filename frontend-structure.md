# Frontend Architecture & Directory Structure

Dokumentasi arsitektur, hierarki direktori, dan modul fitur frontend untuk **IndonesiaRe Treaty Management & Bordero ETL Processing Portal**.

---

## Arsitektur & Prinsip Desain

* **Framework & Build Tool:** React 19 bersama Vite untuk kompilasi ultra-cepat dan Hot Module Replacement (HMR).
* **Styling System:** Tailwind CSS v4 dengan struktur utility-class bersih, desain berstandar enterprise, dan palet warna HSL modern.
* **Autentikasi & SSO:** Halaman login profesional mendukung **Google OAuth2** dan **Microsoft Azure AD SSO** serta form operator lokal dengan manajemen sesi global berbasis React Context (`AuthContext`) dan Axios JWT Request Interceptors.
* **Executive ERP Analytics Dashboard:** Visualisasi data real-time dengan grafik **Recharts** (Donut/Pie Chart untuk komposisi portofolio & peran user, Bar Chart untuk kontribusi volume cedant, Area Chart untuk kecepatan eksekusi ETL) dengan query sub-milidetik.
* **Visual Mapping Cockpit (High Contrast):**
  * Penandaan baris *Required* yang belum terpetakan dengan border merah tegas tebal (`border-l-4 border-l-rose-500`), latar merah muda mencolok (`bg-rose-50/80`), dan badge `* WAJIB DIISI`.
  * Penandaan baris opsional kosong berwarna kuning/amber (`border-l-4 border-l-amber-400`).
  * Penandaan baris valid berwarna hijau bercentang (`border-l-4 border-l-emerald-500`).
  * Panel kontrol Preset Mapping untuk memilih, menerapkan (*"Terapkan Preset"*), dan menyimpan konfigurasi ke PostgreSQL.
* **Audit Trail & Detail Modal (Eye Action Icon):** Tabel riwayat ETL dilengkapi tombol aksi **Mata (Detail)** yang membuka modal rincian eksekusi (*Execution Overview*, *Column Mapping Results*, dan *Technical Audit Trail*).
* **User Guide Bebas Layout Shift:** Tab navigasi dengan fixed-border dan kontainer `min-h-[420px]` untuk menjamin stabilitas antarmuka saat pengguna berpindah tab.
* **Unified COB Data Viewer & Ekspor Data:** Penampil tabel transaksi live PostgreSQL untuk Lini Bisnis Properti/Fire dan Keuangan/Kredit dengan mode *Per Cedant* maupun *Semua Cedant (Agregasi)*, filter status validitas data (*Valid* vs *Warning*), pencarian interaktif, dan modal ekspor Excel/CSV.

---

## Struktur Direktori Frontend

```text
frontend/
├── .env                                # Variabel environment (VITE_API_BASE_URL)
├── .gitignore                          # Aturan pengecualian file Git (node_modules, dist, dll)
├── eslint.config.js                    # Konfigurasi ESLint & linting rules
├── index.html                          # Root HTML entry point
├── package.json                        # Dependensi (React, Vite, Axios, Lucide React, Recharts)
├── postcss.config.js                   # Konfigurasi PostCSS
├── tailwind.config.js                  # Konfigurasi tema Tailwind CSS
├── vite.config.js                      # Konfigurasi bundler Vite
│
└── src/
    ├── App.css                         # CSS styling pendukung
    ├── App.jsx                         # Router utama aplikasi & deklarasi rute terproteksi
    ├── index.css                       # Global CSS & Tailwind directives
    ├── main.jsx                        # Entry point render React DOM
    │
    ├── api/
    │   └── borderoApi.js               # Service API Axios (Auth, SSO, ETL, Tables, History, Presets)
    │
    ├── assets/                         # Asset statis, logo resmi IndonesiaRe
    │
    ├── context/
    │   └── AuthContext.jsx             # React Context untuk autentikasi user (SSO & Local)
    │
    ├── components/                     # Komponen UI global (Reusable)
    │   ├── common/
    │   │   └── EmptyState.jsx          # Tampilan placeholder data kosong
    │   ├── layout/
    │   │   ├── MainLayout.jsx          # Wrapper layout utama (Topbar Breadcrumb, User Profile Menu)
    │   │   └── Sidebar.jsx             # Panel navigasi sisi kiri (User Guide, User Management, Viewers)
    │   └── ui/                         # Atomic UI components
    │
    ├── constants/
    │   └── data.js                     # Master data statis (Daftar Cedant, Pilihan COB, Periode Kuartal/Tahun)
    │
    ├── data/
    │   └── iprMasterData.js            # Kamus atribut standar baku skema IPR FIRE dan IPR KREDIT
    │
    ├── features/                       # Modul fitur terisolasi
    │   ├── bordero/                    # Modul riwayat & audit trail ETL
    │   │   ├── AdvancedFilter.jsx      # Panel filter multi-kriteria
    │   │   ├── EtlDetailModal.jsx      # Modal detail eksekusi, hasil mapping & log audit teknis
    │   │   ├── HistoryTable.jsx        # Tabel riwayat eksekusi ETL
    │   │   └── HistoryView.jsx         # View container riwayat transaksi dengan tombol Eye Detail
    │   │
    │   ├── mapping/                    # Modul visual pemetaan kolom dinamis
    │   │   ├── components/
    │   │   │   ├── ColumnMapper.jsx    # Cockpit pemetaan kolom IPR/Non-IPR dengan kontras tinggi & preset selector
    │   │   │   └── MappingTable.jsx    # Tabel mapping interaktif
    │   │   ├── data/
    │   │   │   └── mappingData.js      # Data acuan mapping
    │   │   └── utils/
    │   │       └── matcher.js          # Token fuzzy-scoring matcher & sanitasi field DB
    │   │
    │   ├── sheet-selection/            # Komponen seleksi lembar kerja (SheetSelector.jsx)
    │   └── upload/                     # Komponen interaktif wizard upload berkas
    │
    ├── pages/                          # Halaman tampilan utama (Routed Pages)
    │   ├── Dashboard.jsx               # Executive ERP Analytics Dashboard dengan Recharts real-time
    │   ├── LoginPage.jsx               # Halaman Login SSO (Google & Microsoft) + Fallback Lokal
    │   ├── UserGuide.jsx               # Panduan pengguna dengan navigasi tab stabil
    │   ├── UserManagement.jsx          # Halaman administrasi akun pengguna & peran otorisasi
    │   ├── FormIpr.jsx                 # Kamus atribut Master IPR (FIRE & KREDIT)
    │   ├── HistoryPage.jsx             # Halaman audit trail riwayat pemrosesan ETL live PostgreSQL
    │   ├── MasterMapping.jsx           # Manajemen pemetaan kolom mandiri
    │   ├── UploadBordero.jsx           # Wizard utama unggah dan proses berkas bordero
    │   ├── ValidasiBordero.jsx         # Modul inspeksi validasi & integritas data
    │   └── form/
    │       ├── FormFire.jsx            # Live Database Viewer untuk transaksi COB Properti/Fire
    │       └── FormKredit.jsx          # Live Database Viewer untuk transaksi COB Keuangan/Kredit
    │
    └── utils/
        ├── apiClient.js                # Instance Axios terpusat dengan Request Interceptor JWT Token
        └── fileUtils.js                # Helper ekstensi file, regex, dan formatting ukuran byte
```