import React from 'react';
import { ShieldCheck, Sparkles, ArrowLeft, Layers, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ValidasiBordero() {
  return (
    <div className="p-6 md:p-8 space-y-6 text-xs bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Validasi Bordero</h1>
          </div>
          <p className="text-slate-500 text-[11px] mt-1">
            Modul pengujian kepatuhan aturan bisnis, verifikasi treaty limit, dan audit data bordero reasuransi.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl font-bold text-slate-700 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      {/* Main Feature Container */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center space-y-5 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            Modul Baru
          </span>
          <h2 className="text-base font-bold text-slate-900">Modul Validasi Bordero Sedang Disiapkan</h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
            Halaman ini disiapkan khusus untuk pipeline validasi mendalam, rekonsiliasi treaty limit per cedant, dan verifikasi otomatis aturan bisnis sebelum data dibukukan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verifikasi Treaty Limit</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Pemeriksaan otomatis batas kapasitas treaty dan retensi per risiko.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Cross-Validation IPR</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Validasi konsistensi kode okupasi, zona risiko gempa, dan tarif premi.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
