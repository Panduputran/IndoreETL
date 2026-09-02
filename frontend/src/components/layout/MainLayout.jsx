import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Users, ChevronDown, Shield } from 'lucide-react';

export default function MainLayout() {
  const { isSidebarBlocked } = useSidebar();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  // Get current page title for breadcrumb
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Analytics';
    if (path.includes('/upload')) return 'Upload Bordero';
    if (path.includes('/form/form-fire')) return 'Bordero Data — FIRE';
    if (path.includes('/form/form-kredit')) return 'Bordero Data — Credit';
    if (path.includes('/validasi-bordero')) return 'Validation Bordero';
    if (path.includes('/history')) return 'ETL History & Audit Trail';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/master/mapping')) return 'Master Mapping';
    if (path.includes('/form-ipr')) return 'IPR Format';
    if (path.includes('/user-guide')) return 'User Guide';
    return 'Treaty Management System';
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans">
      {/* SIDEBAR UI KIRI */}
      <div className="hidden md:block">
        <Sidebar isBlocked={isSidebarBlocked} />
      </div>

      {/* AREA KONTEN KANAN UTAMA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Topbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-800">
              {getPageTitle()}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-400 font-normal">
              IndonesiaRe Treaty RU
            </span>
          </div>

          {/* User Profile / Menu Top Right */}
          <div className="relative" ref={menuRef}>
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-medium text-xs">
                    {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-medium text-slate-800 block leading-tight">
                      {user.full_name || user.username}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal capitalize block">
                      {user.role || 'Operator'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <span className="text-xs font-medium text-slate-800 block">
                        {user.full_name || user.username}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {user.email || `${user.username}@indonesia-re.co.id`}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/users"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>User Management</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Masuk (Login)</span>
              </Link>
            )}
          </div>
        </header>

        {/* Area Render Halaman */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}