import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 text-xs bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Ringkasan statistik pemrosesan ETL dan data Bordero IPR.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-medium">Total File ETL</span>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">128 File</h2>
          <span className="text-emerald-600 font-semibold text-[10px]">↑ +12% dari bulan lalu</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-medium">Total Gross Premium</span>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">Rp 4.2B</h2>
          <span className="text-emerald-600 font-semibold text-[10px]">Terkualifikasi</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-medium">Validation Rate</span>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">98.4%</h2>
          <span className="text-blue-600 font-semibold text-[10px]">Data Valid</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-medium">Active Cedants</span>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">16 Perusahaan</h2>
          <span className="text-slate-400 font-medium text-[10px]">Terhubung master</span>
        </div>
      </div>

      {/* Graph & Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center h-64 border-dashed">
          <p className="text-slate-400 font-medium">[ Area Grafik Volume ETL & TSI per COB (Fire, Marine, dll.) ]</p>
        </div>
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-700 text-sm">Aktivitas Terakhir</h3>
          <ul className="space-y-3 text-slate-600">
            <li className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <p className="font-semibold text-slate-800">Upload Bordero Fire</p>
                <span className="text-[10px] text-slate-400">CDT-001 • 10 menit lalu</span>
              </div>
              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold text-[10px]">Sukses</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <p className="font-semibold text-slate-800">Mapping Update</p>
                <span className="text-[10px] text-slate-400">TRT-2026-FIRE • 1 jam lalu</span>
              </div>
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold text-[10px]">Updated</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}