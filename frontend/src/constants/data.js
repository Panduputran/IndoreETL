// src/constants/data.js

// ── Master Data Konfigurasi ETL ──────────────────────────────────────────────
export const CEDANTS = [
  { code: 'askrida', name: 'PT Asuransi Askrida', alias: 'CED-ASKRIDA' },
  { code: 'tripakarta', name: 'PT Asuransi Tripakarta', alias: 'CED-TRIPAKARTA' },
  { code: 'aca', name: 'PT Asuransi Central Asia (ACA)', alias: 'CED-ACA' },
  { code: 'buanaindependent', name: 'PT Asuransi Buana Independent', alias: 'CED-BUANA' },
  { code: 'jasindo', name: 'PT Asuransi Jasa Indonesia (Jasindo)', alias: 'CED-JASINDO' },
  { code: 'takaful', name: 'PT Asuransi Takaful Umum', alias: 'CED-TAKAFUL' },
  { code: 'tugu', name: 'PT Asuransi Tugu Pratama Indonesia', alias: 'CED-TUGU' }
];

export const COB_LIST = [
  { code: 'FIRE', label: 'FIRE / PROPERTY' },
  { code: 'CREDIT', label: 'CREDIT / KEUANGAN' },
  { code: 'ENGINEERING', label: 'ENGINEERING' },
  { code: 'CARGO', label: 'MARINE CARGO' },
  { code: 'HULL', label: 'MARINE HULL' },
  { code: 'MOTOR', label: 'MOTOR VEHICLE' },
  { code: 'LIABILITY', label: 'LIABILITY' },
  { code: 'MISCELLANEOUS', label: 'MISCELLANEOUS (ANEKA)' }
];

export const PERIOD_LIST = ['Q1', 'Q2', 'Q3', 'Q4', 'TW1', 'TW2', 'TW3', 'TW4'];
export const YEAR_LIST = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];


// ── Sidebar Navigation ────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { 
    key: 'dashboard', 
    label: 'Dashboard', 
    icon: 'bi-house', 
    path: '/dashboard' 
  },
  { 
    key: 'upload', 
    label: 'Upload File', 
    icon: 'bi-cloud-arrow-up', 
    path: '/upload' 
  },
  {
    key: 'bordero',
    label: 'Bordero',
    icon: 'bi-table',
    children: [
      { key: 'bordero-premi', label: 'Bordero - Premi', path: '/bordero-premi' },
      { key: 'bordero-klaim', label: 'Bordero - Klaim', path: '/bordero-klaim' },
    ],
  },
];

// ── Filter Options untuk Halaman Bordero ──────────────────────────────────────
export const PRODUCTS = [
  { code: 'PR-01', name: 'Produk Contoh 1' },
  { code: 'PR-02', name: 'Produk Contoh 2' },
  { code: 'PR-03', name: 'Produk Contoh 3' },
];

export const PLANS = [
  { code: 'PL-01', name: 'Plan Contoh 1' },
  { code: 'PL-02', name: 'Plan Contoh 2' },
  { code: 'PL-03', name: 'Plan Contoh 3' },
];

// ── Struktur Kolom & Data Tabel Bordero (Premi) ──────────────────────────────
export const BORDERO_PREMI_COLUMNS = Array.from({ length: 14 }, (_, i) => ({
  key: `col${i + 1}`,
  label: `Kolom ${i + 1}`,
}));
export const BORDERO_PREMI_DATA = [];

// ── Struktur Kolom & Data Tabel Bordero (Claim) ──────────────────────────────
export const BORDERO_CLAIM_COLUMNS = Array.from({ length: 12 }, (_, i) => ({
  key: `col${i + 1}`,
  label: `Kolom ${i + 1}`,
}));
export const BORDERO_CLAIM_DATA = [];