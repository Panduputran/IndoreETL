// src/constants/data.js

export const CEDANTS = [
  // 4 Cedant Asli Eksisting
  { code: 'askrida', name: 'PT Asuransi Askrida', alias: 'CED-ASKRIDA', defaultCob: 'CREDIT' },
  { code: 'tripakarta', name: 'PT Asuransi Tripakarta', alias: 'CED-TRIPAKARTA', defaultCob: 'FIRE' },
  { code: 'aca', name: 'PT Asuransi Central Asia (ACA)', alias: 'CED-ACA', defaultCob: 'FIRE' },
  { code: 'buanaindependent', name: 'PT Asuransi Buana Independent', alias: 'CED-BUANA', defaultCob: 'FIRE' },

  // Cedant Baru (COB KREDIT & Bulanan)
  { code: 'jamkridajabar', name: 'PT Jamkrida Jabar (Igna Asia)', alias: 'CED-JAMKRIDA-JABAR', defaultCob: 'CREDIT' }
];

export const QUARTER_OPTIONS = [
  // Format Q
  { value: 'Q1', label: 'Q1 (Kuartal 1)' },
  { value: 'Q2', label: 'Q2 (Kuartal 2)' },
  { value: 'Q3', label: 'Q3 (Kuartal 3)' },
  { value: 'Q4', label: 'Q4 (Kuartal 4)' },
  // Format TW (Tetap asli tanpa diubah ke Q)
  { value: 'TW1', label: 'TW1 (Triwulan 1)' },
  { value: 'TW2', label: 'TW2 (Triwulan 2)' },
  { value: 'TW3', label: 'TW3 (Triwulan 3)' },
  { value: 'TW4', label: 'TW4 (Triwulan 4)' }
];

export const MONTH_OPTIONS = [
  { value: 'JAN', label: '01 - Januari' },
  { value: 'FEB', label: '02 - Februari' },
  { value: 'MAR', label: '03 - Maret' },
  { value: 'APR', label: '04 - April' },
  { value: 'MEI', label: '05 - Mei' },
  { value: 'JUN', label: '06 - Juni' },
  { value: 'JUL', label: '07 - Juli' },
  { value: 'AGT', label: '08 - Agustus' },
  { value: 'SEP', label: '09 - September' },
  { value: 'OKT', label: '10 - Oktober' },
  { value: 'NOV', label: '11 - November' },
  { value: 'DES', label: '12 - Desember' }
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

// Rentang Tahun Dinamis mulai dari 2010
const currentYear = new Date().getFullYear() + 1;
export const YEAR_LIST = Array.from(
  { length: currentYear - 2010 + 1 },
  (_, i) => String(currentYear - i)
);

export const NAV_LINKS = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'upload', label: 'Upload Bordero', path: '/upload' },
  { key: 'bordero-fire', label: 'Bordero Fire', path: '/form/form-fire' },
  { key: 'bordero-kredit', label: 'Bordero Kredit', path: '/form/form-kredit' },
  { key: 'master-mapping', label: 'Master Mapping', path: '/master/mapping' },
  { key: 'master-ipr', label: 'IPR Schema Master', path: '/form-ipr' }
];