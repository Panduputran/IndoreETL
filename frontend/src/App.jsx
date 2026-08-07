import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import komponen layout
import MainLayout from './components/layout/MainLayout';

// Import halaman (pages)
import UploadBordero from './pages/UploadBordero';
import DataPremi from './pages/DataPremi';
import DataKlaim from './pages/DataKlaim';

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
          <Route path="/bordero-premi" element={<DataPremi />} />
          <Route path="/bordero-klaim" element={<DataKlaim />} />
          
          {/* Halaman Dashboard (Masih Placeholder) */}
          <Route path="/dashboard" element={<div className="p-10 text-slate-600">Dashboard (Coming Soon)</div>} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}