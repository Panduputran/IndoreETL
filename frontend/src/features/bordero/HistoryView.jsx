import React, { useState, useEffect } from 'react';
import AdvancedFilter from './AdvancedFilter';
import HistoryTable from './HistoryTable';

export default function HistoryView() {
  const [allHistory, setAllHistory] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState(null);

  // Ambil data asli dari LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('etl_history');
    if (saved) {
      try {
        setAllHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Gagal parse riwayat:", e);
      }
    }
  }, []);

  const handleUpdateData = (newHistory) => {
    setAllHistory(newHistory);
    localStorage.setItem('etl_history', JSON.stringify(newHistory));
  };

  // Filter dinamis
  const filteredHistory = allHistory.filter(item => {
    if (!filterCriteria) return true;

    const matchesCedant = !filterCriteria.cedantCode || 
      item.cedantCode?.toLowerCase() === filterCriteria.cedantCode.toLowerCase();

    const matchesSearch = !filterCriteria.searchTitle || 
      item.title?.toLowerCase().includes(filterCriteria.searchTitle) ||
      item.files?.some(f => f.fileName?.toLowerCase().includes(filterCriteria.searchTitle));

    return matchesCedant && matchesSearch;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
      {/* Filter Component */}
      <AdvancedFilter onFilterChange={setFilterCriteria} />

      {/* History Table Container */}
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-2xs border border-slate-200/80 space-y-4 min-h-[400px]">
        <HistoryTable 
          historyData={filteredHistory} 
          onUpdateData={handleUpdateData} 
        />

        {/* Footer Summary */}
        <div className="pt-3 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3 border-t border-slate-100">
          <span className="font-medium text-[11px]">
            Menampilkan <strong className="text-slate-800 font-bold">{filteredHistory.length}</strong> dari <strong className="text-slate-800 font-bold">{allHistory.length}</strong> riwayat batch
          </span>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl font-semibold bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 text-[11px] shadow-2xs" 
              disabled
            >
              &larr; Previous
            </button>
            <button 
              type="button"
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl font-semibold bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 text-[11px] shadow-2xs" 
              disabled
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}