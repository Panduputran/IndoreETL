// ────────────────────────────────────────────────────────────────────────────
// API layer — SAAT INI SEMUA MASIH MOCK (belum tersambung ke backend Python).
//
// Bentuk parameter & response sengaja disamakan dengan kontrak yang dikirim
// teman kamu (lihat JSON contoh: jenis_proses, cedant, target_sheet, kuartal,
// tahun, available_sheets, dst) supaya nanti pas backend-nya siap, cukup ganti
// ISI fungsi di file ini (jadi `fetch(...)`) — komponen yang memanggilnya
// (UploadPage, dkk) tidak perlu diubah sama sekali.
// ────────────────────────────────────────────────────────────────────────────

const MOCK_DELAY = 700

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

// Kumpulan sheet contoh untuk mensimulasikan hasil scan backend (Image 3).
// Nanti ini datang dari `available_sheets` di response BE, bukan dari sini.
const MOCK_SHEET_POOL = [
  'Property', 'MV', 'Cargo', 'Hull', 'Engineering',
  'Liability', 'Travel Ins', 'Credit Ins - SBQS & SBSPL',
  'Surety Ship', 'Misc', 'PA',
]

/**
 * Langkah 4-8: kirim file + parameter awal ke BE untuk di-scan (ringan, belum ETL).
 * BE mengembalikan daftar sheet yang tersedia di file Excel tsb.
 *
 * @param {File} file
 * @param {{ jenisProses: 'premi'|'klaim', cedant: string }} params
 * @returns {Promise<{ filename: string, tipe_proses: string, cedant: string, available_sheets: string[], message: string }>}
 */
export async function scanFile(file, { jenisProses, cedant }) {
  await sleep(MOCK_DELAY)

  // Simulasi: ambil beberapa sheet secara acak dari pool sebagai "available_sheets"
  const count = 3 + Math.floor(Math.random() * 4)
  const shuffled = [...MOCK_SHEET_POOL].sort(() => Math.random() - 0.5)

  return {
    filename: file.name,
    tipe_proses: jenisProses,
    cedant,
    available_sheets: shuffled.slice(0, count),
    message: 'Berhasil memindai file.',
  }
}

/**
 * Langkah 10-13: kirim file + parameter final (setelah user konfirmasi) untuk dieksekusi BE.
 *
 * @param {File} file
 * @param {{
 *   jenisProses: 'premi'|'klaim',
 *   cedant: string,
 *   sheet: string,
 *   tahun: string,
 *   kuartal: string,
 *   modeEksekusi: 'single'|'batch',
 * }} params
 * @returns {Promise<{
 *   status: 'success'|'failed',
 *   message: string,
 *   summary: { total_rows: number, inserted: number, failed: number },
 *   logs: string[],
 * }>}
 */
export async function processFile(file, params) {
  await sleep(MOCK_DELAY)

  const totalRows = 80 + Math.floor(Math.random() * 400)

  return {
    status: 'success',
    message: `${file.name} berhasil diproses.`,
    summary: { total_rows: totalRows, inserted: totalRows, failed: 0 },
    logs: [
      `Membaca sheet "${params.sheet}"...`,
      'Memvalidasi header terhadap struktur database...',
      `Membersihkan & mentransformasi ${totalRows} baris data...`,
      `Menyimpan ke tabel target (${params.jenisProses})...`,
      'Selesai.',
    ],
  }
}

/**
 * Proses banyak file sekaligus (mode batch) — memanggil processFile() untuk tiap file
 * lalu menggabungkan hasilnya.
 *
 * @param {{ file: File, sheet: string, tahun: string, kuartal: string }[]} items
 * @param {{ jenisProses: string, cedant: string, modeEksekusi: string }} sharedParams
 */
export async function processBatch(items, sharedParams) {
  const results = []
  for (const item of items) {
    const result = await processFile(item.file, { ...sharedParams, ...item })
    results.push({ filename: item.file.name, ...result })
  }
  return {
    status: results.every((r) => r.status === 'success') ? 'success' : 'partial',
    message: `${results.length} file selesai diproses.`,
    results,
  }
}