// src/features/etl/components/ResultCard.jsx
import React from 'react';

export default function ResultCard({ 
  status = 'success', // 'success' | 'warning' | 'error'
  title = "ETL Berhasil",
  message = "Data telah berhasil dimuat ke database.",
  stats = { total: 0, success: 0, failed: 0 }
}) {
  const config = {
    success: {
      bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      iconColor: 'text-emerald-500'
    },
    warning: {
      bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
      iconColor: 'text-amber-500'
    },
    error: {
      bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      iconColor: 'text-rose-500'
    }
  };

  const current = config[status] || config.success;

  return (
    <div className={`p-6 rounded-2xl border ${current.bg} ${current.border}`}>
      <div className="flex items-start gap-4">
        <svg className={`w-8 h-8 ${current.iconColor} flex-shrink-0 mt-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {current.icon}
        </svg>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${current.text}`}>{title}</h3>
          <p className={`text-sm mt-1 mb-4 opacity-90 ${current.text}`}>{message}</p>
          
          {/* Statistik Baris */}
          <div className="grid grid-cols-3 gap-4 bg-white/60 p-4 rounded-xl border border-white/40">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Baris</span>
              <span className="text-xl font-bold text-slate-800">{stats.total}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-emerald-600 uppercase">Sukses</span>
              <span className="text-xl font-bold text-emerald-700">{stats.success}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-rose-600 uppercase">Gagal</span>
              <span className="text-xl font-bold text-rose-700">{stats.failed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}