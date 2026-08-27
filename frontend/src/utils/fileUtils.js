// src/utils/fileUtils.js

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function getExt(name) {
  return name.split('.').pop().toUpperCase();
}

const MONTH_MAP = {
  'JAN': 'JAN', 'JANUARI': 'JAN', 'JANUARY': 'JAN',
  'FEB': 'FEB', 'FEBRUARI': 'FEB', 'FEBRUARY': 'FEB',
  'MAR': 'MAR', 'MARET': 'MAR', 'MARCH': 'MAR',
  'APR': 'APR', 'APRIL': 'APR',
  'MEI': 'MEI', 'MAY': 'MEI',
  'JUN': 'JUN', 'JUNI': 'JUN', 'JUNE': 'JUN',
  'JUL': 'JUL', 'JULI': 'JUL', 'JULY': 'JUL',
  'AGT': 'AGT', 'AGUSTUS': 'AGT', 'AUG': 'AGT', 'AUGUST': 'AGT',
  'SEP': 'SEP', 'SEPT': 'SEP', 'SEPTEMBER': 'SEP',
  'OKT': 'OKT', 'OKTOBER': 'OKT', 'OCT': 'OKT', 'OCTOBER': 'OKT',
  'NOV': 'NOV', 'NOVEMBER': 'NOV',
  'DES': 'DES', 'DESEMBER': 'DES', 'DEC': 'DES', 'DECEMBER': 'DES'
};

export function detectCategory(name) {
  const raw = String(name).toLowerCase();
  if (raw.includes('claim') || raw.includes('klaim') || raw.includes('clm')) return 'claim';
  if (raw.includes('subro')) return 'subro';
  return 'premi';
}

export function detectPeriodAndYear(fileName) {
  const raw = String(fileName).toUpperCase();
  const category = detectCategory(fileName);
  let period = 'TW1';

  // 1. Deteksi Triwulan / Kuartal Asli (Pertahankan TW vs Q)
  const twNumMatch = raw.match(/([1-4])\s*(TW|TRIWULAN)/i);
  const twLetterMatch = raw.match(/(TW|TRIWULAN)[\s_.-]*([1-4])/i);

  const qNumMatch = raw.match(/([1-4])\s*(Q|KUARTAL)/i);
  const qLetterMatch = raw.match(/(Q|KUARTAL)[\s_.-]*([1-4])/i);

  if (twNumMatch) {
    period = `TW${twNumMatch[1]}`;
  } else if (twLetterMatch) {
    period = `TW${twLetterMatch[2]}`;
  } else if (qNumMatch) {
    period = `Q${qNumMatch[1]}`;
  } else if (qLetterMatch) {
    period = `Q${qLetterMatch[2]}`;
  } else {
    // 2. Deteksi Bulanan
    for (const [key, val] of Object.entries(MONTH_MAP)) {
      const regex = new RegExp(`(^|[\\s_.-])${key}([\\s_.-]|$)`, 'i');
      if (regex.test(raw)) {
        period = val;
        break;
      }
    }
  }

  // 3. Deteksi Tahun (Mulai 2010)
  let year = '2025';
  const generalYearMatch = raw.match(/\b(20\d{2}|19\d{2})\b/);
  if (generalYearMatch) {
    year = generalYearMatch[1];
  }

  return { category, period, year };
}

export function detectCobFromSheet(sheetName) {
  const s = String(sheetName).toUpperCase();
  if (s.includes("FIRE") || s.includes("PROPERTY") || s.includes("HARTA")) return "FIRE";
  if (s.includes("ENG") || s.includes("ENGINEERING")) return "ENGINEERING";
  if (s.includes("CARGO")) return "CARGO";
  if (s.includes("HULL")) return "HULL";
  if (s.includes("MOTOR") || s.includes("MV") || s.includes("KENDARAAN")) return "MOTOR";
  if (s.includes("KREDIT") || s.includes("CREDIT") || s.includes("IGNA") || s.includes("JAMKRIDA")) return "CREDIT";
  if (s.includes("MONEY")) return "MONEY";
  if (s.includes("GA") || s.includes("GENERAL ACCIDENT")) return "GA";
  if (s.includes("LIABILITY")) return "LIABILITY";
  return "CREDIT";
}