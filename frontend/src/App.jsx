import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

// Import Layout & Provider Context
import MainLayout from './components/layout/MainLayout';
import { SidebarProvider } from './components/context/SidebarContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy-Loaded Pages for Optimal Bundle Splitting & Instant First Contentful Paint
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UploadBordero = lazy(() => import('./pages/UploadBordero'));
const FormFire = lazy(() => import('./pages/form/FormFire'));
const FormKredit = lazy(() => import('./pages/form/FormKredit'));
const ValidasiBordero = lazy(() => import('./pages/ValidasiBordero'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const MasterMapping = lazy(() => import('./pages/MasterMapping'));
const FormIpr = lazy(() => import('./pages/FormIpr'));
const UserGuide = lazy(() => import('./pages/UserGuide'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const DevTableManager = lazy(() => import('./pages/DevTableManager'));

function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 font-sans text-slate-500 animate-in fade-in duration-150">
      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      <span className="text-xs font-medium tracking-wide">Memuat Halaman...</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <SidebarProvider>
            <Suspense fallback={<PageLoadingFallback />}>
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
                  <Route path="/dev-tools" element={<DevTableManager />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/master/mapping" element={<MasterMapping />} />
                  <Route path="/form-ipr" element={<FormIpr />} />
                  <Route path="/user-guide" element={<UserGuide />} />
                </Route>
              </Routes>
            </Suspense>
          </SidebarProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}