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

// ── Sidebar Navigation Links (Sesuai Routing App.jsx) ───────────────────────
export const NAV_LINKS = [
  { 
    key: 'dashboard', 
    label: 'Dashboard', 
    path: '/dashboard' 
  },
  { 
    key: 'upload', 
    label: 'Upload Bordero', 
    path: '/upload' 
  },
  {
    key: 'bordero-fire',
    label: 'Bordero Fire',
    path: '/form/form-fire'
  },
  {
    key: 'bordero-kredit',
    label: 'Bordero Kredit',
    path: '/form/form-kredit'
  },
  {
    key: 'master-mapping',
    label: 'Master Mapping',
    path: '/master/mapping'
  },
  {
    key: 'master-ipr',
    label: 'IPR Schema Master',
    path: '/form-ipr'
  }
];