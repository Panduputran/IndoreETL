import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import komponen layout
import MainLayout from './components/layout/MainLayout';

// Import halaman (pages)
import UploadBordero from './pages/UploadBordero';
import FormFire from './pages/FormFire';
import FormKredit from './pages/FormKredit';
import Dashboard from './pages/Dashboard';
import MasterMapping from './pages/MasterMapping';

// 1. IMPORT KOMPONEN HAK CIPTA / IPR KAMU DI SINI (sesuaikan nama file & path-nya)
import FormIpr from './pages/FormIpr'; 

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Redirect dari root / langsung ke /upload */}
          <Route path="/" element={<Navigate to="/upload" replace />} />
          
          {/* Halaman Utama ETL */}
          <Route path="/upload" element={<UploadBordero />} />
          
          {/* UPDATE: Sesuaikan path ini dengan URL to="..." di MainLayout lu */}
          <Route path="/form-fire" element={<FormFire />} />
          <Route path="/form-kredit" element={<FormKredit />} />
          <Route path="/master/mapping" element={<MasterMapping />} />

          {/* 2. TAMBAHKAN ROUTE IPR DI SINI */}
          <Route path="/form-ipr" element={<FormIpr />} />

          {/* Halaman Dashboard (Masih Placeholder) */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}