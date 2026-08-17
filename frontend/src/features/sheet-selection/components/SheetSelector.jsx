import React from 'react';
import { CheckCircle2, AlertTriangle, Files } from 'lucide-react';

export default function SheetSelector({ 
  sheets = [], 
  activePreviewSheet,
  onPreviewSelect
}) {
  if (!sheets || sheets.length === 0) {
    return (
      <div className="p-4 text-xs text-amber-600 bg-amber-50 rounded-xl border border-amber-200">
        Belum ada sheet yang terdeteksi. Pastikan file Excel sudah diproses.
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs">
      {/* Header Utama Minimalis */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 block">Inspeksi Data Per-Sheet</label>
        
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 rounded-lg shrink-0">
          {sheets.length} Skema Target
        </span>
      </div>

      {/* Grid Cards Sheet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sheets.map((sheet, index) => {
          const isActivePreview = activePreviewSheet === sheet.name;
          const hasError = sheet.invalidCount && sheet.invalidCount > 0;

          return (
            <div
              key={index}
              onClick={() => onPreviewSelect && onPreviewSelect(sheet.name)}
              className={`relative flex flex-col justify-between p-3.5 text-left border rounded-xl transition-all duration-200 space-y-3 cursor-pointer ${
                isActivePreview
                  ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Top Bar Card */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  {/* Judul Sheet tanpa Badge Redundan */}
                  <span className={`font-bold text-xs truncate block ${isActivePreview ? 'text-blue-700' : 'text-slate-800'}`}>
                    {sheet.name}
                  </span>

                  {/* Info Baris & Jumlah File */}
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-bold text-slate-600">
                      {sheet.rows ? `${sheet.rows} Baris` : 'Siap diproses'}
                    </span>
                    
                    {sheet.filesCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                        <Files className="w-2.5 h-2.5" />
                        <span>{sheet.filesCount} File</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Validasi */}
                {hasError ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200/80 shrink-0">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{sheet.invalidCount} Error</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Valid</span>
                  </span>
                )}
              </div>

              {/* Bottom Action Button */}
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isActivePreview
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 group-hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                <span>{isActivePreview ? 'Sedang Dipreview' : 'Lihat Preview'}</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}