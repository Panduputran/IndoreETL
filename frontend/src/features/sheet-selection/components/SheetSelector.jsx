import React from 'react';
import { Eye, Check } from 'lucide-react';

export default function SheetSelector({ 
  sheets = [
    { name: 'Premi QS', rows: 850 },
    { name: 'Claim QS', rows: 320 },
    { name: 'Subro', rows: 140 }
  ], 
  selectedSheets = [], 
  activePreviewSheet,
  onPreviewSelect,
  onSelect 
}) {
  if (!sheets || sheets.length === 0) {
    return (
      <div className="p-4 text-xs text-amber-600 bg-amber-50 rounded-xl border border-amber-200">
        Belum ada sheet yang terdeteksi. Pastikan file Excel sudah diproses.
      </div>
    );
  }

  const isAllSelected = sheets.length > 0 && selectedSheets.length === sheets.length;

  const handleToggleSheet = (sheetName) => {
    if (selectedSheets.includes(sheetName)) {
      onSelect(selectedSheets.filter((name) => name !== sheetName));
    } else {
      onSelect([...selectedSheets, sheetName]);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelect([]);
    } else {
      onSelect(sheets.map((s) => s.name));
    }
  };

  return (
    <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-800 block">Pilih Sheet Yang Akan Diproses ETL</label>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Gunakan tombol preview untuk melihat isi data sebelum mencentang sheet yang akan disimpan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSelectAll}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/60 px-3 py-1 rounded-lg transition-all cursor-pointer shrink-0"
        >
          {isAllSelected ? '✕ Batal Pilih Semua' : '✓ Pilih Semua Sheet'}
        </button>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sheets.map((sheet, index) => {
          const isSelected = selectedSheets.includes(sheet.name);
          const isActivePreview = activePreviewSheet === sheet.name;

          return (
            <div
              key={index}
              className={`relative flex flex-col justify-between p-3.5 text-left border rounded-xl transition-all duration-200 space-y-3 ${
                isActivePreview
                  ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : isSelected
                  ? 'bg-white border-slate-300'
                  : 'bg-slate-100/50 border-slate-200'
              }`}
            >
              {/* Top Bar Card: Checkbox + Title */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-xs ${isActivePreview ? 'text-blue-700' : 'text-slate-800'}`}>
                      {sheet.name}
                    </span>
                    {isActivePreview && (
                      <span className="px-1.5 py-0.2 text-[8px] uppercase font-bold bg-blue-100 text-blue-700 rounded">
                        Sedang Dilihat
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {sheet.rows ? `${sheet.rows} Baris Data` : 'Siap diproses'}
                  </p>
                </div>

                {/* Checkbox Pilihan ETL */}
                <button
                  type="button"
                  onClick={() => handleToggleSheet(sheet.name)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  title={isSelected ? 'Batalkan pilihan sheet ini' : 'Pilih sheet ini untuk diproses ETL'}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              </div>

              {/* Bottom Bar Card: Tombol Preview Khusus */}
              <button
                type="button"
                onClick={() => onPreviewSelect && onPreviewSelect(sheet.name)}
                className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActivePreview
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isActivePreview ? 'Sedang Dipreview' : 'Lihat Preview'}</span>
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}