import React from 'react';
import { FileSpreadsheet, ShieldCheck, AlertTriangle, Building2, Clock } from 'lucide-react';

// Data COB Murni (Class of Business Asuransi/Reasuransi)
const COB_DATA = [
  { name: 'Fire / Harta', bound: 1240, unbound: 45 },
  { name: 'Marine Cargo', bound: 850, unbound: 12 },
  { name: 'Property', bound: 620, unbound: 80 },
  { name: 'Kredit', bound: 1450, unbound: 20 },
  { name: 'Engineering', bound: 380, unbound: 15 },
];

const RECENT_ACTIVITIES = [
  {
    title: 'Upload Bordero Fire Q1 2026',
    cedant: 'CDT-001 (Askrida)',
    time: '3:55 PM',
    status: 'valid',
  },
  {
    title: 'Upload Bordero Marine Q2 2026',
    cedant: 'CDT-002 (Takaful)',
    time: '3:55 PM',
    status: 'valid',
  },
  {
    title: 'Upload Bordero Fire Q4 2025',
    cedant: 'CDT-003 (Jasindo)',
    time: 'Kemarin',
    status: 'warning',
  }
];

export default function Dashboard() {
  // Nilai maksimum untuk skala tinggi balok vertikal
  const maxVal = 1600;

  return (
    <div className="p-6 space-y-6 text-xs bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER SIMPLE */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 text-[11px] mt-0.5">Ringkasan pemrosesan data Bordero IPR & Treaty.</p>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>

      {/* SUMMARY CARDS (CLEAN & RINGKAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider block">Total Batch</span>
            <h2 className="text-xl font-bold text-slate-800 mt-0.5">128 File</h2>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider block">Total TSI / Plafon</span>
            <h2 className="text-xl font-bold text-slate-800 mt-0.5">Rp 4.2 T</h2>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider block">Unbound Treaty</span>
            <h2 className="text-xl font-bold text-amber-600 mt-0.5">157 Baris</h2>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider block">Active Cedants</span>
            <h2 className="text-xl font-bold text-slate-800 mt-0.5">16 Perusahaan</h2>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* MAIN CONTENT: GRAFIK BALOK KE ATAS & ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* GRAFIK BALOK KE ATAS (VERTICAL BAR CHART) (8 COLS) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-xs">Volume Data Baris per Class of Business (COB)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Murni Lini Bisnis Asuransi (Tanpa Kategori Klaim)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" /> Bound (Valid)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Unbound
              </span>
            </div>
          </div>

          {/* AREA GRAFIK BALOK VERTIKAL */}
          <div className="pt-4 pb-2 px-2">
            <div className="h-52 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200/80 pb-1">
              {COB_DATA.map((item, idx) => {
                const boundHeight = (item.bound / maxVal) * 100;
                const unboundHeight = (item.unbound / maxVal) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    
                    {/* Tooltip Hover Sederhana */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-slate-800 text-white text-[9.5px] py-1 px-2 rounded-md shadow-md transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Bound: {item.bound} | Unbound: {item.unbound}
                    </div>

                    {/* Pasangan Balok Vertikal */}
                    <div className="flex items-end justify-center gap-1.5 w-full h-full">
                      {/* Balok Bound */}
                      <div 
                        style={{ height: `${boundHeight}%` }}
                        className="w-full max-w-[24px] bg-blue-600 rounded-t-md transition-all duration-300 hover:bg-blue-700"
                      />
                      {/* Balok Unbound */}
                      <div 
                        style={{ height: `${Math.max(unboundHeight, 3)}%` }}
                        className="w-full max-w-[24px] bg-amber-500 rounded-t-md transition-all duration-300 hover:bg-amber-600"
                      />
                    </div>

                    {/* Label COB di Bawah */}
                    <span className="text-[10px] font-semibold text-slate-600 mt-2 text-center truncate w-full">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AKTIVITAS TERAKHIR (4 COLS) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-3 mb-3">Aktivitas Terakhir</h3>

            <div className="space-y-2.5">
              {RECENT_ACTIVITIES.map((act, i) => (
                <div key={i} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-semibold text-slate-800 text-xs truncate">{act.title}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-mono font-bold text-blue-600">{act.cedant}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{act.time}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                    act.status === 'valid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {act.status === 'valid' ? 'Valid' : 'Warning'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}