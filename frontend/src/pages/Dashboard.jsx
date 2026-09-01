import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Layers, 
  TrendingUp,
  ArrowUpRight,
  Database,
  RefreshCw,
  CheckCircle2,
  FileCheck2,
  CreditCard
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    total_batches: 0,
    total_rows: 0,
    total_premi_rows: 0,
    total_claim_rows: 0,
    total_valid_rows: 0,
    total_warning_rows: 0,
    cob_data: [],
    cedant_data: [],
    tables_detail: []
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/v1/tables/dashboard/summary');
      if (res.data?.status === 'success') {
        setSummaryData({
          total_batches: res.data.total_batches || 0,
          total_rows: res.data.total_rows || 0,
          total_premi_rows: res.data.total_premi_rows || 0,
          total_claim_rows: res.data.total_claim_rows || 0,
          total_valid_rows: res.data.total_valid_rows || 0,
          total_warning_rows: res.data.total_warning_rows || 0,
          cob_data: res.data.cob_data || [],
          cedant_data: res.data.cedant_data || [],
          tables_detail: res.data.tables_detail || []
        });
      }
    } catch (err) {
      console.error('Gagal memuat ringkasan dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const {
    total_batches,
    total_rows,
    total_premi_rows,
    total_claim_rows,
    total_valid_rows,
    total_warning_rows,
    cob_data,
    cedant_data,
    tables_detail
  } = summaryData;

  const validPercentage = total_rows > 0 ? ((total_valid_rows / total_rows) * 100).toFixed(1) : '100';
  const maxCobTotal = Math.max(...(cob_data || []).map(d => d.total || 0), 10);
  const maxCedantTotal = Math.max(...(cedant_data || []).map(d => d.total_rows || 0), 10);

  return (
    <div className="p-6 md:p-8 space-y-6 text-xs bg-slate-50/50 min-h-screen font-sans text-slate-800">
      
      {/* 1. Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Layers className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Executive Dashboard Overview</h1>
          </div>
          <p className="text-slate-500 text-[11px] mt-1">
            Monitoring data real-time pipeline ETL Bordero, validasi atribut IPR, dan statistik konsolidasi database.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span className="text-xs font-bold text-slate-700">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Transaksi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Baris Transaksi</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {total_rows.toLocaleString()}
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">Akumulasi seluruh data di database</p>
          </div>
        </div>

        {/* Card 2: Total Tabel / Batch */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Tabel Aktif</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {total_batches}
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">Tabel fisik terdaftar</p>
          </div>
        </div>

        {/* Card 3: Premi vs Klaim */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Komposisi Transaksi</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-blue-600 font-mono">{total_premi_rows.toLocaleString()}</span>
              <span className="text-slate-400 text-[10px]">Premi</span>
              <span className="text-slate-300">/</span>
              <span className="text-lg font-black text-rose-600 font-mono">{total_claim_rows.toLocaleString()}</span>
              <span className="text-slate-400 text-[10px]">Klaim</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">Perbandingan Premi & Klaim</p>
          </div>
        </div>

        {/* Card 4: Rasio Validitas Data */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Integritas Data</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight">{validPercentage}%</span>
              <span className="text-slate-400 text-[10px]">Valid</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">
              {total_warning_rows.toLocaleString()} baris memiliki kolom kosong
            </p>
          </div>
        </div>

      </div>

      {/* 3. Section Volume per COB & Distribusi Cedant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COB Distribution (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Distribusi Volume per Lini Bisnis</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Rasio volume data premi dan klaim berdasarkan Class of Business</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
              {cob_data.length} Lini Bisnis
            </span>
          </div>

          <div className="space-y-4">
            {cob_data.map((cob) => {
              const premiWidth = cob.total > 0 ? ((cob.premi / maxCobTotal) * 100) : 0;
              const claimWidth = cob.total > 0 ? ((cob.claim / maxCobTotal) * 100) : 0;

              return (
                <div key={cob.code} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cob.code === 'FIRE' ? (
                        <Building2 className="w-4 h-4 text-blue-600" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                      )}
                      <span className="font-bold text-slate-800 text-xs">{cob.name}</span>
                      <span className="text-[10px] text-slate-400">({cob.tables_count} tabel)</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {cob.total.toLocaleString()} Baris
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden flex">
                    <div 
                      style={{ width: `${premiWidth}%` }} 
                      className="bg-blue-600 h-full transition-all duration-300"
                      title={`Premi: ${cob.premi.toLocaleString()} baris`}
                    />
                    <div 
                      style={{ width: `${claimWidth}%` }} 
                      className="bg-rose-500 h-full transition-all duration-300"
                      title={`Klaim: ${cob.claim.toLocaleString()} baris`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Premi: <strong className="text-slate-700">{cob.premi.toLocaleString()}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Klaim: <strong className="text-slate-700">{cob.claim.toLocaleString()}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Valid: <strong className="text-emerald-700">{cob.valid.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <Link to="/form/form-fire" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
              <span>Buka Validasi Fire</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/form/form-kredit" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
              <span>Buka Validasi Kredit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Cedant Ranking (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Volume per Perusahaan Cedant</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Daftar kontribusi transaksi per entitas asuransi</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
              {cedant_data.length} Cedant
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {cedant_data.length > 0 ? (
              cedant_data.map((item, idx) => {
                const barWidth = maxCedantTotal > 0 ? ((item.total_rows / maxCedantTotal) * 100) : 0;

                return (
                  <div key={item.name} className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs truncate max-w-44">
                        {idx + 1}. {item.name}
                      </span>
                      <span className="font-mono text-slate-800 text-xs font-bold">
                        {item.total_rows.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        style={{ width: `${barWidth}%` }} 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{item.tables_count} tabel ({item.cobs.join(', ')})</span>
                      <span>Premi: {item.premi_rows.toLocaleString()} | Klaim: {item.claim_rows.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 italic">
                Belum ada tabel cedant yang diproses di database.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link to="/upload" className="flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-blue-600 transition-colors">
              <span>Proses Berkas Baru di Upload Bordero</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 4. Real Active Tables Summary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Daftar Tabel Fisik Terdaftar</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Status dan rincian baris dari seluruh tabel aktif di database</p>
          </div>
          <span className="font-mono text-[10px] bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-600">
            Total {tables_detail.length} Tabel
          </span>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Nama Tabel</th>
                <th className="p-3">Cedant</th>
                <th className="p-3">Lini Bisnis</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 text-right">Total Baris</th>
                <th className="p-3 text-right">Valid</th>
                <th className="p-3 text-right">Warning</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tables_detail.length > 0 ? (
                tables_detail.map((t) => (
                  <tr key={t.table_name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{t.table_name}</td>
                    <td className="p-3 text-slate-700">{t.cedant}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.cob === 'FIRE' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {t.cob}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.type === 'PREMIUM' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.type === 'PREMIUM' ? 'Premi' : 'Klaim'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{t.total_rows.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-emerald-600 font-semibold">{t.valid_rows.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-amber-600 font-semibold">
                      {t.warning_rows > 0 ? t.warning_rows.toLocaleString() : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <Link 
                        to={t.cob === 'FIRE' ? '/form/form-fire' : '/form/form-kredit'}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-[11px]"
                      >
                        <span>Lihat Data</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Belum ada tabel yang terdaftar di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}