import apiClient from '../utils/apiClient';

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
    return response.data;
  } catch (error) {
    console.error('Gagal create table:', error);
    throw error;
  }
}

export async function processFile(payload) {
  try {
    const response = await apiClient.post('/etl/process', payload);
    return response.data;
  } catch (error) {
    console.error('Gagal proses ETL:', error);
    throw error;
  }
}

export async function processBatch(payloadList) {
  try {
    const response = await apiClient.post('/etl/process-batch', payloadList);
    return response.data;
  } catch (error) {
    console.error('Gagal proses batch ETL:', error);
    throw error;
  }
}

// ==========================================
// HISTORY & AUDIT LOG API
// ==========================================

export async function getHistoryLogs(params = {}) {
  try {
    const response = await apiClient.get('/history/logs', { params });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil history logs:', error);
    throw error;
  }
}

export async function getMappingPresets(params = {}) {
  try {
    const response = await apiClient.get('/history/presets', { params });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil mapping presets:', error);
    throw error;
  }
}

export async function saveMappingPreset(payload) {
  try {
    const response = await apiClient.post('/history/presets', payload);
    return response.data;
  } catch (error) {
    console.error('Gagal menyimpan preset mapping:', error);
    throw error;
  }
}

export async function deleteMappingPreset(presetId) {
  try {
    const response = await apiClient.delete(`/history/presets/${presetId}`);
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus preset mapping:', error);
    throw error;
  }
}

// ==========================================
// AUTHENTICATION API
// ==========================================

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
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data user:', error);
    throw error;
  }
}

// ==========================================
// DEV & TABLE MANAGEMENT API
// ==========================================

export async function getDevPhysicalTables() {
  try {
    const response = await apiClient.get('/tables/dev/all-physical');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar tabel dev:', error);
    throw error;
  }
}

export async function dropPhysicalTable(tableName) {
  try {
    const response = await apiClient.delete(`/tables/${tableName}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal menghapus tabel ${tableName}:`, error);
    throw error;
  }
}

export async function dropAllDevPhysicalTables() {
  try {
    const response = await apiClient.delete('/tables/dev/drop-all-physical');
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus seluruh tabel fisik:', error);
    throw error;
  }
}