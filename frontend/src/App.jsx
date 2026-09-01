import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout & Provider Context
import MainLayout from './components/layout/MainLayout';
import { SidebarProvider } from './components/context/SidebarContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import Pages
import UploadBordero from './pages/UploadBordero';
import FormFire from './pages/form/FormFire';
import FormKredit from './pages/form/FormKredit';
import MasterMapping from './pages/MasterMapping';
import FormIpr from './pages/FormIpr';
import Dashboard from './pages/Dashboard';
import UserGuide from './pages/UserGuide';
import ValidasiBordero from './pages/ValidasiBordero';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import UserManagement from './pages/UserManagement';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            {/* Standalone Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Main Application Routes inside Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadBordero />} />
              <Route path="/form/form-fire" element={<FormFire />} />
              <Route path="/form/form-kredit" element={<FormKredit />} />
              <Route path="/validasi-bordero" element={<ValidasiBordero />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/master/mapping" element={<MasterMapping />} />
              <Route path="/form-ipr" element={<FormIpr />} />
              <Route path="/user-guide" element={<UserGuide />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}