// src/features/mapping/components/ColumnMapper.jsx
import React, { useMemo } from 'react';
import { ArrowRight, RefreshCcw, CheckCircle2, AlertCircle, Database, PlusCircle, Tag } from 'lucide-react';
import { IPR_COLUMNS_DEFINITION } from '../../../data/iprMasterData';
import { autoMatchColumns } from '../utils/matcher';

export default function ColumnMapper({
  fileItem = {},
  category = 'PREMIUM',
  sourceColumns = [],
  mapping = {},
  onMappingChange,
}) {
  const targetSchema = useMemo(() => {
    const rawCat = String(category || 'PREMIUM').toUpperCase();
    const catKey = rawCat.includes('CLAIM') || rawCat.includes('KLAIM') ? 'CLAIM' : 'PREMIUM';
    return IPR_COLUMNS_DEFINITION?.[catKey] || IPR_COLUMNS_DEFINITION?.PREMIUM || [];
  }, [category]);

  const safeSourceColumns = Array.isArray(sourceColumns) ? sourceColumns : [];

  // Mendeteksi kolom dari file Excel yang belum masuk ke mapping standar IPR
  const unmappedSourceColumns = useMemo(() => {
    const mappedSources = new Set(Object.values(mapping).filter(Boolean));
    return safeSourceColumns.filter((col) => !mappedSources.has(col));
  }, [safeSourceColumns, mapping]);

  const handleSelectField = (dbField, selectedSourceCol) => {
    onMappingChange({
      ...mapping,
      [dbField]: selectedSourceCol || null,
    });
  };

  const handleRunAutoMatch = () => {
    const autoMatched = autoMatchColumns(safeSourceColumns, targetSchema);
    onMappingChange({ ...mapping, ...autoMatched });
  };

  const totalRequired = targetSchema.filter((col) => col.required).length;
  const mappedRequired = targetSchema.filter((col) => col.required && mapping?.[col.dbField]).length;
  const isComplete = mappedRequired === totalRequired;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 text-xs font-sans shadow-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md text-[10px]">
              {fileItem?.cob || 'COB'}
            </span>
            <h3 className="text-sm font-bold text-slate-800">{fileItem?.name || 'Berkas Bordero'}</h3>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Sheet Target: <strong className="text-slate-600 font-mono">{fileItem?.selectedSheet || '-'}</strong> | 
            Total Kolom Sumber: <strong className="text-blue-600 font-bold">{safeSourceColumns.length}</strong> | 
            Format IPR: <strong className="text-slate-600">{targetSchema.length} Kolom</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunAutoMatch}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Auto-Match Otomatis</span>
          </button>
          <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${
            isComplete
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kolom Wajib Lengkap ({mappedRequired}/{totalRequired})</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Kolom Wajib: {mappedRequired}/{totalRequired}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Tabel 1: Mapping Format IPR Utama */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" /> Standar Format Kolom IPR
          </h4>
          <span className="text-[10px] text-slate-400">Cocokkan kolom Excel dengan format resmi IPR</span>
        </div>

        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3 w-4/12 border-r border-slate-200">1. Format Standar IPR</th>
                <th className="p-3 w-4/12 border-r border-slate-200">2. Kolom Berkas Sumber (Excel)</th>
                <th className="p-3 w-2/12 border-r border-slate-200">3. Field Database</th>
                <th className="p-3 w-2/12">4. Tipe Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {targetSchema.map((targetCol) => {
                const selectedValue = mapping?.[targetCol.dbField] || '';
                const isMapped = Boolean(selectedValue);

                return (
                  <tr 
                    key={targetCol.dbField} 
                    className={`transition-colors ${
                      isMapped ? 'hover:bg-slate-50/60' : targetCol.required ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50/30'
                    }`}
                  >
                    <td className="p-3 border-r border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{targetCol.iprLabel}</span>
                        {targetCol.required ? (
                          <span className="text-rose-500 font-bold text-[10px] shrink-0">* Wajib</span>
                        ) : (
                          <span className="text-slate-400 text-[10px] shrink-0">Opsional</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 border-r border-slate-100">
                      <select
                        value={selectedValue}
                        onChange={(e) => handleSelectField(targetCol.dbField, e.target.value)}
                        className={`w-full p-2 rounded-xl text-xs font-semibold outline-none border transition-all cursor-pointer ${
                          isMapped
                            ? 'bg-blue-50/40 border-blue-300 text-blue-900 focus:border-blue-500'
                            : targetCol.required
                            ? 'bg-white border-amber-300 text-slate-400 focus:border-blue-500'
                            : 'bg-white border-slate-200 text-slate-400 focus:border-blue-500'
                        }`}
                      >
                        <option value="">-- Lewati / Kosongkan --</option>
                        {safeSourceColumns.map((col, idx) => (
                          <option key={idx} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 border-r border-slate-100">
                      <div className="flex items-center gap-1.5 font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[11px]">
                        <Database className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{targetCol.dbField}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                        targetCol.sqlType.includes('NUMERIC')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : targetCol.sqlType.includes('BIGINT')
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {targetCol.sqlType}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel 2: Kolom Tambahan Berkas Non-IPR (Optional Carry-over) */}
      {unmappedSourceColumns.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" /> Kolom Tambahan Berkas (Non-IPR)
            </h4>
            <span className="text-[10px] text-slate-400">{unmappedSourceColumns.length} kolom ditemukan di file sumber</span>
          </div>

          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl">
            <p className="text-[11px] text-slate-500 mb-3">
              Kolom berikut ada di berkas Excel tetapi tidak termasuk dalam format wajib IPR. Kolom ini akan otomatis tetap disimpan ke tabel database sebagai kolom pendukung:
            </p>
            <div className="flex flex-wrap gap-2">
              {unmappedSourceColumns.map((col, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}