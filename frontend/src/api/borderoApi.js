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