// Data di bawah ini adalah data uji coba (dummy) untuk kebutuhan tampilan UI.

export const CEDANTS = [
  { code: 'CD-01', name: 'PT Asuransi Askrida' },
  { code: 'CD-02', name: 'PT Asuransi Takaful Keluarga' },
  { code: 'CD-03', name: 'PT Asuransi Jasindo' },
  { code: 'CD-04', name: 'PT Asuransi Central Asia (ACA)' },
  { code: 'CD-05', name: 'PT Asuransi Tugu Pratama Indonesia' },
  { code: 'CD-06', name: 'PT Asuransi Allianz Utama Indonesia' },
  { code: 'CD-07', name: 'PT Asuransi Tripakarta' }
];

// ── Sidebar Navigation ────────────────────────────────────────────────────────
// Ditambahkan properti `path` untuk mendukung React Router URL-based navigation
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
]

// ── Filter Options untuk Halaman Bordero ──────────────────────────────────────
export const PRODUCTS = [
  { code: 'PR-01', name: 'Produk Contoh 1' },
  { code: 'PR-02', name: 'Produk Contoh 2' },
  { code: 'PR-03', name: 'Produk Contoh 3' },
]

export const PLANS = [
  { code: 'PL-01', name: 'Plan Contoh 1' },
  { code: 'PL-02', name: 'Plan Contoh 2' },
  { code: 'PL-03', name: 'Plan Contoh 3' },
]

// ── Struktur Kolom & Data Tabel Bordero (Premi) ──────────────────────────────
export const BORDERO_PREMI_COLUMNS = Array.from({ length: 14 }, (_, i) => ({
  key: `col${i + 1}`,
  label: `Kolom ${i + 1}`,
}))

export const BORDERO_PREMI_DATA = []

// ── Struktur Kolom & Data Tabel Bordero (Claim) ──────────────────────────────
export const BORDERO_CLAIM_COLUMNS = Array.from({ length: 12 }, (_, i) => ({
  key: `col${i + 1}`,
  label: `Kolom ${i + 1}`,
}))

export const BORDERO_CLAIM_DATA = []