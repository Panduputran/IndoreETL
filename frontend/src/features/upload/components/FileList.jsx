import { formatBytes } from '../../../utils/fileUtils';
export default function FileList({ files, onRemove }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Antrean Dokumen ({files.length})
      </p>
      
      {/* Container dengan max-height biar kalau filenya banyak bisa di-scroll tanpa merusak layout */}
      <div className="flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl group hover:border-blue-200 hover:shadow-[0_2px_10px_-4px_rgba(59,130,246,0.15)] transition-all duration-200"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Icon Excel Style */}
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>
            
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Hapus File"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}