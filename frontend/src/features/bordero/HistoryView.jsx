import AdvancedFilter from './AdvancedFilter';
import HistoryTable from './HistoryTable';

export default function HistoryView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px] space-y-4">
            {/* Filter Section */}
            <AdvancedFilter />
            
            {/* Table Section */}
            <HistoryTable />
            
            {/* Pagination & Summary Footer */}
            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3 border-t border-slate-100">
                <span className="font-medium">
                  Menampilkan <strong className="text-slate-700">1 - 3</strong> dari <strong className="text-slate-700">3</strong> data
                </span>
                
                <div className="flex items-center gap-1.5">
                    <button 
                      className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600" 
                      disabled
                    >
                      ← Previous
                    </button>
                    <button 
                      className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600" 
                      disabled
                    >
                      Next →
                    </button>
                </div>
            </div>
        </div>
    );
}