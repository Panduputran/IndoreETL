import apiClient from '../utils/apiClient';

// ==============================================================================
// IN-MEMORY CLIENT-SIDE QUERY CACHE & DEDUPLICATION
// ==============================================================================

const memoryCache = new Map();

/**
 * Mengambil data dari memory cache jika belum expired.
 * @param {string} key - Cache key identifier
 * @param {number} ttlMs - Masa aktif cache dalam milidetik (default 30 detik)
 */
function getCached(key, ttlMs = 30000) {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > ttlMs) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

/**
 * Menyimpan data ke dalam memory cache.
 * @param {string} key - Cache key identifier
 * @param {any} data - Data response
 */
function setCached(key, data) {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Menghapus cache API berdasarkan prefix tertentu atau reset seluruh cache.
 * @param {string} [prefix=''] - Prefix cache key
 */
export function invalidateApiCache(prefix = '') {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(prefix)) {
      memoryCache.delete(k);
    }
  }
}

// ==============================================================================
// ETL & INSPECTOR API
// ==============================================================================

export async function inspectFile(file, tipeProses = 'premi', cedantCode = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipe_proses', tipeProses.toLowerCase());
  formData.append('cedant', cedantCode.toLowerCase());

  try {
    const response = await apiClient.post('/etl/inspect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Gagal inspect file:', error);
    throw error;
  }
}

export async function processWithMapping(payload) {
  try {
    const response = await apiClient.post('/etl/process-with-mapping', payload);
    invalidateApiCache(); // Invalidate cache setelah data baru masuk
    return response.data;
  } catch (error) {
    console.error('Gagal proses ETL dengan mapping:', error);
    throw error;
  }
}

export async function checkDatabase(payload) {
  try {
    const response = await apiClient.post('/etl/check-db', payload);
    return response.data;
  } catch (error) {
    console.error('Gagal cek database:', error);
    throw error;
  }
}

export async function createTable(payload) {
  try {
    const response = await apiClient.post('/etl/create-table', payload);
    invalidateApiCache('tables');
    return response.data;
  } catch (error) {
    console.error('Gagal create table:', error);
    throw error;
  }
}

export async function processFile(payload) {
  try {
    const response = await apiClient.post('/etl/process', payload);
    invalidateApiCache();
    return response.data;
  } catch (error) {
    console.error('Gagal proses ETL:', error);
    throw error;
  }
}

export async function processBatch(payloadList) {
  try {
    const response = await apiClient.post('/etl/process-batch', payloadList);
    invalidateApiCache();
    return response.data;
  } catch (error) {
    console.error('Gagal proses batch ETL:', error);
    throw error;
  }
}

// ==============================================================================
// HISTORY & AUDIT LOG API
// ==============================================================================

export async function getHistoryLogs(params = {}) {
  const cacheKey = `history_logs_${JSON.stringify(params)}`;
  const cached = getCached(cacheKey, 15000); // 15 detik TTL
  if (cached) return cached;

  try {
    const response = await apiClient.get('/history/logs', { params });
    setCached(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil history logs:', error);
    throw error;
  }
}

export async function getMappingPresets(params = {}) {
  const cacheKey = `mapping_presets_${JSON.stringify(params)}`;
  const cached = getCached(cacheKey, 30000); // 30 detik TTL
  if (cached) return cached;

  try {
    const response = await apiClient.get('/history/presets', { params });
    setCached(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil mapping presets:', error);
    throw error;
  }
}

export async function saveMappingPreset(payload) {
  try {
    const response = await apiClient.post('/history/presets', payload);
    invalidateApiCache('mapping_presets');
    return response.data;
  } catch (error) {
    console.error('Gagal menyimpan preset mapping:', error);
    throw error;
  }
}

export async function deleteMappingPreset(presetId) {
  try {
    const response = await apiClient.delete(`/history/presets/${presetId}`);
    invalidateApiCache('mapping_presets');
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus preset mapping:', error);
    throw error;
  }
}

// ==============================================================================
// AUTHENTICATION API
// ==============================================================================

export async function loginUser(username, password) {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Gagal login:', error);
    throw error;
  }
}

export async function loginSSOUser(payload) {
  try {
    const response = await apiClient.post('/auth/sso', payload);
    return response.data;
  } catch (error) {
    console.error('Gagal login SSO:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  const cacheKey = 'auth_current_user';
  const cached = getCached(cacheKey, 60000); // 60 detik TTL
  if (cached) return cached;

  try {
    const response = await apiClient.get('/auth/me');
    setCached(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data user:', error);
    throw error;
  }
}

// ==============================================================================
// DEV & TABLE MANAGEMENT API
// ==============================================================================

export async function getDevPhysicalTables() {
  const cacheKey = 'tables_dev_physical';
  const cached = getCached(cacheKey, 15000); // 15 detik TTL
  if (cached) return cached;

  try {
    const response = await apiClient.get('/tables/dev/all-physical');
    setCached(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar tabel dev:', error);
    throw error;
  }
}

export async function dropPhysicalTable(tableName) {
  try {
    const response = await apiClient.delete(`/tables/${tableName}`);
    invalidateApiCache(); // Invalidate seluruh cache tabel & analitik
    return response.data;
  } catch (error) {
    console.error(`Gagal menghapus tabel ${tableName}:`, error);
    throw error;
  }
}

export async function dropAllDevPhysicalTables() {
  try {
    const response = await apiClient.delete('/tables/dev/drop-all-physical');
    invalidateApiCache();
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus seluruh tabel fisik:', error);
    throw error;
  }
}