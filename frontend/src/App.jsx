import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout & Provider Context
import MainLayout from './components/layout/MainLayout';
import { SidebarProvider } from './components/context/SidebarContext';

// Import Pages
import UploadBordero from './pages/UploadBordero';
import FormFire from './pages/form/FormFire';
import FormKredit from './pages/form/FormKredit';
import MasterMapping from './pages/MasterMapping';
import FormIpr from './pages/FormIpr';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadBordero />} />
            <Route path="/form/form-fire" element={<FormFire />} />
            <Route path="/form/form-kredit" element={<FormKredit />} />
            <Route path="/master/mapping" element={<MasterMapping />} />
            <Route path="/form-ipr" element={<FormIpr />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}