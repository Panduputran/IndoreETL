import AdvancedFilter from './AdvancedFilter';
import HistoryTable from './HistoryTable';

export default function HistoryView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            
            {/* 1. Filter Section (Sudah punya card sendiri) */}
            <AdvancedFilter />
            
            {/* 2. Table Section & Pagination Wrapper */}
            <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 space-y-4 min-h-[400px]">
                
                {/* History Table */}
                <HistoryTable />
                
                {/* Pagination & Summary Footer */}
                <div className="pt-2 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3 border-t border-slate-100">
                    <span className="font-medium text-[11px]">
                        Menampilkan <strong className="text-slate-800 font-bold">1 - 3</strong> dari <strong className="text-slate-800 font-bold">3</strong> data
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                        <button 
                            type="button"
                            className="px-3 py-1.5 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600 text-[11px] cursor-pointer shadow-2xs" 
                            disabled
                        >
                            &larr; Previous
                        </button>
                        <button 
                            type="button"
                            className="px-3 py-1.5 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600 text-[11px] cursor-pointer shadow-2xs" 
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