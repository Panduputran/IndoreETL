import AdvancedFilter from './AdvancedFilter';
import HistoryTable from './HistoryTable';

export default function HistoryView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
            <AdvancedFilter />
            <HistoryTable />
            
            <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
                <span>Menampilkan 1 - 3 dari 3 data</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                </div>
            </div>
        </div>
    );
}