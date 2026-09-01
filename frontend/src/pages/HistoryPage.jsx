import React from 'react';
import HistoryView from '../features/bordero/HistoryView';

export default function HistoryPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Riwayat Aktivitas ETL
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftar seluruh proses transformasi data bordero dan pemuatan ke database.
        </p>
      </div>

      {/* Main Content Component */}
      <HistoryView />
    </div>
  );
}
