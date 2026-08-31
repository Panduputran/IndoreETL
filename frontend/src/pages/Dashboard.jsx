import React from 'react';
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Clock, 
  Layers, 
  TrendingUp,
  ArrowUpRight,
  Database
} from 'lucide-react';

const COB_DATA = [
  { name: 'Fire', bound: 1240, unbound: 45, code: 'FIRE' },
  { name: 'Marine Cargo', bound: 850, unbound: 12, code: 'CARGO' },
  { name: 'Property', bound: 620, unbound: 80, code: 'PROP' },
  { name: 'Kredit', bound: 1450, unbound: 20, code: 'CREDIT' },
  { name: 'Engineering', bound: 380, unbound: 15, code: 'ENG' },
];

const RECENT_ACTIVITIES = [
  {
    title: 'Upload Bordero Klaim Agustus 2024',
    cedant: 'JAMKRIDA JABAR',
    time: '10 mnt lalu',
    status: 'valid',
    records: '1,450 baris'
  },
  {
    title: 'Upload Bordero Premi TW1 2025',
    cedant: 'ASKRIDA',
    time: '10:45 AM',
    status: 'valid',
    records: '3,120 baris'
  },
  {
    title: 'Upload Bordero Fire Q4 2024',
    cedant: 'TRIPAKARTA',
    time: 'Kemarin',
    status: 'warning',
    records: '840 baris'
  },
  {
    title: 'Upload Bordero Premi Juli 2024',
    cedant: 'BUANA INDEPENDENT',
    time: '2 hari lalu',
    status: 'valid',
    records: '620 baris'
  }
];

export default function Dashboard() {
  const maxVal = 1600;
  const totalBound = COB_DATA.reduce((acc, curr) => acc + curr.bound, 0);
  const totalUnbound = COB_DATA.reduce((acc, curr) => acc + curr.unbound, 0);

  return (
    <div className="p-6 md:p-8 space-y-6 text-xs bg-slate-50/50 min-h-screen font-sans text-slate-800">
      
      {/* 1. HEADER COCKPIT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Layers className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Executive Dashboard Overview</h1>
          </div>
          <p className="text-slate-400 text-[11px] mt-1">
            Monitoring data stream pipeline ETL Bordero, validasi IPR, dan status konsolidasi database PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-slate-700">LIVE SYNC</span>
          </div>
        </div>
      </div>

      {/* 2. HERO STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Batch ETL</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">128</div>
            <p className="text-slate-400 text-[10px] mt-0.5">Berkas XLSX & CSV terproses</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total TSI / Plafon</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">Rp 4.2 T</div>
            <p className="text-emerald-600 font-semibold text-[10px] mt-0.5 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Akumulasi portofolio aktif
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Unbound Treaty</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">157</div>
            <p className="text-slate-400 text-[10px] mt-0.5">Perlu konfirmasi limit IPR</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Active Cedants</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">5 Cedants</div>
            <p className="text-slate-400 text-[10px] mt-0.5">Askrida, Tripakarta, Jamkrida, dll</p>
          </div>
        </div>

      </div>

      {/* 3. MAIN ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* CHART CONTAINER (8 COLS) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Distribusi Volume Data per COB</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Perbandingan rasio transaksi valid vs unbound per Class of Business</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/70 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-md bg-blue-600" /> Bound ({totalBound.toLocaleString()})
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-md bg-amber-500" /> Unbound ({totalUnbound.toLocaleString()})
              </span>
            </div>
          </div>

          {/* VERTICAL BAR CHART AREA */}
          <div className="pt-6 pb-2">
            <div className="h-60 flex items-end justify-between gap-4 sm:gap-8 border-b border-slate-100 pb-2">
              {COB_DATA.map((item, idx) => {
                const boundHeight = (item.bound / maxVal) * 100;
                const unboundHeight = (item.unbound / maxVal) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    
                    {/* Tooltip Card */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-900 text-white text-[10px] font-mono py-1.5 px-2.5 rounded-xl shadow-xl transition-all duration-150 pointer-events-none whitespace-nowrap z-20 flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{item.code}:</span>
                      <span>Bound {item.bound}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-amber-400">Unb {item.unbound}</span>
                    </div>

                    {/* Bar Columns Container with Track Background */}
                    <div className="flex items-end justify-center gap-2 w-full h-full bg-slate-50/80 rounded-2xl p-1 border border-slate-100">
                      {/* Bound Bar */}
                      <div className="w-full max-w-[20px] h-full flex items-end">
                        <div 
                          style={{ height: `${boundHeight}%` }}
                          className="w-full bg-blue-600 rounded-xl transition-all duration-300 group-hover:bg-blue-700 shadow-2xs"
                        />
                      </div>
                      {/* Unbound Bar */}
                      <div className="w-full max-w-[20px] h-full flex items-end">
                        <div 
                          style={{ height: `${Math.max(unboundHeight, 4)}%` }}
                          className="w-full bg-amber-500 rounded-xl transition-all duration-300 group-hover:bg-amber-600 shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Label COB */}
                    <span className="text-[10px] font-bold text-slate-700 mt-2.5 text-center truncate w-full">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Menampilkan 5 Class of Business aktif</span>
            <span className="font-mono text-slate-500">Kapasitas Maksimal Skala: {maxVal.toLocaleString()} Baris</span>
          </div>
        </div>

        {/* RECENT ACTIVITY TIMELINE (4 COLS) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Aktivitas Pipeline</h3>
              <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-bold text-slate-500">
                Log ETL
              </span>
            </div>

            <div className="space-y-3">
              {RECENT_ACTIVITIES.map((act, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-800 text-xs truncate leading-snug">{act.title}</p>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase shrink-0 ${
                      act.status === 'valid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {act.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded-md">
                      {act.cedant}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{act.records}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <Clock className="w-2.5 h-2.5" />
                        {act.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
              <span>Buka Semua Riwayat ETL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}