import React, { useState } from 'react';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import Button from '../components/ui/Button';
import HistoryView from '../features/bordero/HistoryView';
import UploadProcess from '../features/bordero/UploadProcess';

export default function UploadBordero() {
  const [currentView, setCurrentView] = useState('history');
  const [isExporting, setIsExporting] = useState(false);

  // Handler dummy untuk Export Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Berkas Excel Riwayat Bordero berhasil diunduh!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-8 font-sans text-xs">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Utama */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              {currentView === 'history' ? 'Riwayat Upload Bordero' : 'Proses Upload Baru'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentView === 'history'
                ? 'Pantau status file ETL dan kelola data bordero yang telah masuk.'
                : 'Unggah berkas bordero dan jalankan proses eksekusi ETL.'}
            </p>
          </div>

          {/* Tombol Aksi Kanan (Hanya Muncul di View History) */}
          {currentView === 'history' && (
            <div className="flex items-center gap-2.5 shrink-0">
              
              {/* Tombol Download Excel */}
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting}
                className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isExporting ? 'Mengunduh...' : 'Download Excel'}</span>
              </button>

              {/* Tombol Upload Baru */}
              <button
                type="button"
                onClick={() => setCurrentView('upload')}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs hover:-translate-y-px cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Baru</span>
              </button>

            </div>
          )}
        </div>

        {/* Dynamic View: History / Upload */}
        {currentView === 'history' ? (
          <HistoryView />
        ) : (
          <UploadProcess onComplete={() => setCurrentView('history')} />
        )}

      </div>
    </div>
  );
}