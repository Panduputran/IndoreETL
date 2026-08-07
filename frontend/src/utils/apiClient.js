import axios from 'axios';

const apiClient = axios.create({
  // Tambahkan /v1 di belakangnya agar rapi
  baseURL: 'http://localhost:8000/api/v1', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

export default apiClient;