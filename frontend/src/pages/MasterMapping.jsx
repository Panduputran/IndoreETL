import React from 'react';
import { Sparkles, Layers, Sliders, ArrowRight, ShieldCheck, Database } from 'lucide-react';

export default function MasterMapping() {
  return (
    <div className="p-6 space-y-6 text-xs bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          <span>Dynamic Column Mapping Engine</span>
        </h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Pusat konfigurasi pemetaan mandiri skema file mentah ke database master.
        </p>
      </div>

      {/* Hero Coming Soon Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 shadow-xs text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-2xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 text-blue-700 px-3 py-1 rounded-full font-bold text-[11px] mb-4 shadow-2xs animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Feature Roadmap / In Development</span>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold text-slate-800 max-w-xl mx-auto mb-3">
          Self-Service UI Mapping untuk Konfigurasi Cedant Baru Secara Dinamis
        </h2>

        <p className="text-slate-500 text-xs max-w-lg mx-auto leading-relaxed mb-8">
          Fitur ini akan memungkinkan tim operasional memetakan kolom file Excel baru langsung lewat antarmuka web tanpa perlu modifikasi script Python di backend.
        </p>

        {/* Current Active Engine Info */}
        <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4 text-left grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-700">Dedicated Service</p>
              <p className="text-[10px] text-slate-500">Pipeline modular Python menangani pembersihan & sanitasi multi-level header.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-700">Live PostgreSQL</p>
              <p className="text-[10px] text-slate-500">Data terstruktur langsung tersimpan dengan tipe data presisi (ISO Timestamp & Numeric).</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-700">Metadata-Driven</p>
              <p className="text-[10px] text-slate-500">Akan diintegrasikan pada fase scale-up penambahan puluhan cedant baru.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}