import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Clock, 
  Layers, 
  TrendingUp,
  ArrowUpRight,
  Database,
  RefreshCw
} from 'lucide-react';

const INITIAL_COB_DATA = [
  { name: 'Fire / Harta', bound: 0, unbound: 0, code: 'FIRE' },
  { name: 'Marine Cargo', bound: 0, unbound: 0, code: 'CARGO' },
  { name: 'Property', bound: 0, unbound: 0, code: 'PROP' },
  { name: 'Kredit', bound: 0, unbound: 0, code: 'CREDIT' },
  { name: 'Engineering', bound: 0, unbound: 0, code: 'ENG' },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [cobData, setCobData] = useState(INITIAL_COB_DATA);
  const [totalRows, setTotalRows] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/v1/tables/dashboard/summary');
      if (res.data?.status === 'success') {
        setCobData(res.data.cob_data || INITIAL_COB_DATA);
        setTotalRows(res.data.total_rows || 0);
        setTotalBatches(res.data.total_batches || 0);
      }
    } catch (err) {
      console.error('Gagal memuat ringkasan dashboard:', err);
      // Fallback tetap menampilkan template jika backend endpoint belum siap
      setCobData(INITIAL_COB_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalBound = (cobData || []).reduce((acc, curr) => acc + (curr.bound || 0), 0);
  const totalUnbound = (cobData || []).reduce((acc, curr) => acc + (curr.unbound || 0), 0);

  // Mencegah NaN atau pembagian dengan nol
  const calculatedMax = Math.max(...(cobData || []).map((d) => Math.max(d.bound || 0, d.unbound || 0)), 100);
  const maxVal = calculatedMax > 0 ? calculatedMax : 100;

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
          <button
            type="button"
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-2xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span className="font-mono text-[11px] font-bold text-slate-700">REFRESH</span>
          </button>
        </div>
      </div>

      {/* 2. HERO STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Tabel / Batch</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {totalBatches}
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">Tabel aktif di PostgreSQL</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Baris Transaksi</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {totalRows.toLocaleString()}
            </div>
            <p className="text-emerald-600 font-semibold text-[10px] mt-0.5 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Akumulasi data live
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Bound (Valid)</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-600 font-mono tracking-tight">
              {totalBound.toLocaleString()}
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">Tervalidasi & siap rekonsiliasi</p>
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
            <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
              {totalUnbound.toLocaleString()}
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">Perlu mapping limit</p>
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
              <p className="text-[11px] text-slate-400 mt-0.5">Perbandingan rasio transaksi valid per Class of Business</p>
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
              {cobData.map((item, idx) => {
                const boundHeight = Math.min(100, Math.max(0, ((item.bound || 0) / maxVal) * 100));
                const unboundHeight = Math.min(100, Math.max(0, ((item.unbound || 0) / maxVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    
                    {/* Tooltip Card */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-900 text-white text-[10px] font-mono py-1.5 px-2.5 rounded-xl shadow-xl transition-all duration-150 pointer-events-none whitespace-nowrap z-20 flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{item.code}:</span>
                      <span>Bound {item.bound || 0}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-amber-400">Unb {item.unbound || 0}</span>
                    </div>

                    {/* Bar Columns Container with Track Background */}
                    <div className="flex items-end justify-center gap-2 w-full h-full bg-slate-50/80 rounded-2xl p-1 border border-slate-100">
                      {/* Bound Bar */}
                      <div className="w-full max-w-[20px] h-full flex items-end">
                        <div 
                          style={{ height: `${boundHeight > 0 ? boundHeight : 3}%` }}
                          className={`w-full rounded-xl transition-all duration-300 shadow-2xs ${
                            boundHeight > 0 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-slate-200'
                          }`}
                        />
                      </div>
                      {/* Unbound Bar */}
                      <div className="w-full max-w-[20px] h-full flex items-end">
                        <div 
                          style={{ height: `${unboundHeight > 0 ? unboundHeight : 3}%` }}
                          className={`w-full rounded-xl transition-all duration-300 shadow-2xs ${
                            unboundHeight > 0 ? 'bg-amber-500 group-hover:bg-amber-600' : 'bg-slate-200'
                          }`}
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
            <span>Menampilkan 5 Class of Business</span>
            <span className="font-mono text-slate-500">Skala Puncak: {maxVal.toLocaleString()} Baris</span>
          </div>
        </div>

        {/* RECENT ACTIVITY (4 COLS) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Status Sinkronisasi</h3>
              <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-bold text-slate-500">
                PostgreSQL Live
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-800 text-xs">Koneksi Database PostgreSQL</p>
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Semua tabel bordero tersimpan secara terstruktur dan siap untuk query laporan.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-800 text-xs">Pipeline ETL</p>
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    Standby
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Mendukung berkas bordero Excel multi-sheet (.xlsx, .xls, .csv).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
              <span>Buka Menu Upload Bordero</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}