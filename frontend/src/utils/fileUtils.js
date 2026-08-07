/**
 * Format file size in bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

/**
 * Get uppercase file extension from filename
 * @param {string} name
 * @returns {string}
 */
export function getExt(name) {
  return name.split('.').pop().toUpperCase()
}

/**
 * Auto-detect period (YYYY-MM) from filename containing pola kuartal, misal:
 * - "2Q20252026" / "2Q2025-2026"  (angka kuartal duluan, baru Q)
 * - "Q2 2025"                     (Q duluan, baru angka kuartal)
 * @param {string} name
 * @returns {string}
 */
export function detectPeriod(name) {
  const qMap = { '1': '03', '2': '06', '3': '09', '4': '12' }

  // Pola "2Q2025..." — kuartal sebelum huruf Q
  let match = name.match(/(\d)Q(\d{4})/i)
  if (match) {
    return `${match[2]}-${qMap[match[1]] ?? '01'}`
  }

  // Pola "Q2 2025" — kuartal setelah huruf Q, wajib ada pemisah sebelum tahun
  match = name.match(/Q(\d)[\s_-]+(\d{4})/i)
  if (match) {
    return `${match[2]}-${qMap[match[1]] ?? '01'}`
  }

  return ''
}

/**
 * Auto-detect Tahun & Kuartal terpisah dari nama file, misal:
 * - "2Q20252026" / "2Q2025-2026"  (angka kuartal duluan, baru Q)
 * - "Q2 2025"                     (Q duluan, baru angka kuartal)
 * @param {string} name
 * @returns {{ year: string, quarter: string }}  quarter berformat "Q1".."Q4"
 */
export function detectQuarterYear(name) {
  // Pola "2Q2025..." — kuartal sebelum huruf Q
  let match = name.match(/(\d)Q(\d{4})/i)
  if (match) {
    return { year: match[2], quarter: `Q${match[1]}` }
  }

  // Pola "Q2 2025" — kuartal setelah huruf Q, wajib ada pemisah sebelum thun
  match = name.match(/Q(\d)[\s_-]+(\d{4})/i)
  if (match) {
    return { year: match[2], quarter: `Q${match[1]}` }
  }

  return { year: '', quarter: '' }
}

/**
 * Auto-detect category (premi | claim) from filenam
 * @param {string} name
 * @returns {'premi'|'claim'}
 */
export function detectCategory(name) {
  return name.toLowerCase().includes('claim') ? 'claim' : 'premi'
}