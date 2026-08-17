import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSidebar } from '../context/SidebarContext';

export default function MainLayout() {
  const { isSidebarBlocked } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans">
      
      {/* SIDEBAR UI KIRI */}
      <div className="hidden md:block">
        <Sidebar isBlocked={isSidebarBlocked} />
      </div>

      {/* AREA KONTEN KANAN UTAMA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="text-sm font-medium text-slate-800">
              Treaty Management System
            </span>
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