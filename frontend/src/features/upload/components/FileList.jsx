import { formatBytes } from '../../../utils/fileUtils';

export default function FileList({ files, onRemove, onClearAll, mode = 'BATCH' }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-4 space-y-3 text-xs animate-in fade-in">
      {/* Header Info & Tombol Clear All */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Antrean Dokumen ({files.length}) • <span className="text-blue-600">{mode.toUpperCase()}</span>
        </p>
        
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
          >
            Kosongkan Semua
          </button>
        )}
      </div>

      {/* Container dengan max-height & Scrollbar */}
      <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl group hover:border-emerald-300 hover:bg-white hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              {/* Icon Excel Style */}
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                XLSX
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400">
                    {formatBytes(file.size)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-[10px] font-semibold text-emerald-600">
                    ✓ Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Hapus File"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}