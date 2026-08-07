// src/components/layout/MainLayout.jsx
import React from 'react';
// IMPORT komponen Sidebar lu di sini
// (Pastikan path-nya benar, sesuaikan lokasi folder lu. Contoh di bawah mengasumsikan file sejajar)
import Sidebar from './Sidebar'; 

export default function MainLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-[#F8F9FA] font-sans">
            
            {/* ======================================= */}
            {/* SIDEBAR UI KIRI                         */}
            {/* ======================================= */}
            {/* Panggil komponen Sidebar yang sudah di-update tadi */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* ======================================= */}
            {/* AREA KONTEN KANAN UTAMA                 */}
            {/* ======================================= */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                
                {/* Header Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-sm font-medium text-slate-800">Treaty Management System</span>
                    </div>
                </header>

                {/* Area Render Halaman (Inject dari App.jsx) */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
                
            </main>
        </div>
    );
}