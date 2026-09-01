// frontend/src/features/mapping/components/ColumnMapper.jsx
import React, { useMemo, useEffect } from 'react';
import { RefreshCcw, CheckCircle2, AlertCircle, Database, PlusCircle, Layers, ToggleLeft, ToggleRight, BookmarkCheck, CopyCheck } from 'lucide-react';
import { getIprSchema } from '../../../data/iprMasterData';
import { autoMatchColumns, sanitizeDbFieldName, suggestSqlType } from '../utils/matcher';

export default function ColumnMapper({
  fileItem = {},
  cob = 'FIRE',
  category = 'PREMIUM',
  cedantName = '',
  sourceColumns = [],
  mapping = {},
  nonIprConfig = {},
  onMappingChange,
  onNonIprConfigChange,
  onApplyToAllFiles,
}) {
  const activeCob = cob || fileItem?.cob || 'FIRE';
  const activeCategory = category || fileItem?.category || 'PREMIUM';
  const activeCedant = cedantName || fileItem?.cedant || 'CEDANT';

  const presetKey = `preset_mapping_${String(activeCedant).toLowerCase()}_${String(activeCob).toLowerCase()}_${String(activeCategory).toLowerCase()}`;

  const targetSchema = useMemo(() => {
    return getIprSchema(activeCob, activeCategory);
  }, [activeCob, activeCategory]);

  const safeSourceColumns = useMemo(() => {
    if (Array.isArray(sourceColumns) && sourceColumns.length > 0) {
      return sourceColumns;
    }
    const currentSheet = fileItem?.selectedSheet;
    return fileItem?.available_sheets_columns?.[currentSheet] || [];
  }, [sourceColumns, fileItem]);

  // 1. Auto-Load Preset Tersimpan atau Jalankan Auto-Match Otomatis
  useEffect(() => {
    if (safeSourceColumns.length > 0 && targetSchema.length > 0) {
      const currentKeys = Object.keys(mapping || {});
      if (currentKeys.length === 0 && onMappingChange) {
        const savedPreset = localStorage.getItem(presetKey);
        if (savedPreset) {
          try {
            const parsed = JSON.parse(savedPreset);
            onMappingChange(parsed.mapping || {});
            if (parsed.nonIprConfig && onNonIprConfigChange) {
              onNonIprConfigChange(parsed.nonIprConfig);
            }
            return;
          } catch (e) {
            console.error("Gagal parse preset tersimpan:", e);
          }
        }
        // Fallback auto-match
        const initialMatched = autoMatchColumns(safeSourceColumns, targetSchema);
        onMappingChange(initialMatched);
      }
    }
  }, [safeSourceColumns, targetSchema, presetKey]);

  // 2. Deteksi Kolom Non-IPR
  const unmappedSourceColumns = useMemo(() => {
    const mappedValues = new Set(Object.values(mapping || {}).filter(Boolean));
    return safeSourceColumns.filter((col) => !mappedValues.has(col));
  }, [safeSourceColumns, mapping]);

  useEffect(() => {
    if (unmappedSourceColumns.length > 0 && onNonIprConfigChange) {
      const updatedConfig = { ...nonIprConfig };
      let hasChange = false;

      unmappedSourceColumns.forEach((col) => {
        if (!updatedConfig[col]) {
          updatedConfig[col] = {
            enabled: true,
            dbField: sanitizeDbFieldName(col),
            sqlType: suggestSqlType(col),
          };
          hasChange = true;
        }
      });

      if (hasChange) {
        onNonIprConfigChange(updatedConfig);
      }
    }
  }, [unmappedSourceColumns]);

  const handleSelectField = (dbField, selectedSourceCol) => {
    if (onMappingChange) {
      onMappingChange({
        ...mapping,
        [dbField]: selectedSourceCol || null,
      });
    }
  };

  const handleManualAutoMatch = () => {
    const autoMatched = autoMatchColumns(safeSourceColumns, targetSchema);
    if (onMappingChange) {
      onMappingChange({ ...mapping, ...autoMatched });
    }
  };

  const handleSaveAsPreset = () => {
    const presetData = {
      mapping,
      nonIprConfig,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(presetKey, JSON.stringify(presetData));
    alert(`Preset mapping untuk ${activeCedant.toUpperCase()} (${activeCob.toUpperCase()} - ${activeCategory.toUpperCase()}) berhasil disimpan! Berkas berikutnya akan otomatis menggunakan settingan ini.`);
  };

  const handleUpdateNonIprField = (sourceCol, key, value) => {
    if (onNonIprConfigChange) {
      onNonIprConfigChange({
        ...nonIprConfig,
        [sourceCol]: {
          ...(nonIprConfig[sourceCol] || {
            enabled: true,
            dbField: sanitizeDbFieldName(sourceCol),
            sqlType: suggestSqlType(sourceCol),
          }),
          [key]: value,
        },
      });
    }
  };

  const totalRequired = targetSchema.filter((col) => col.required).length;
  const mappedRequired = targetSchema.filter((col) => col.required && mapping?.[col.dbField]).length;
  const isComplete = totalRequired > 0 && mappedRequired === totalRequired;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 text-xs font-sans shadow-xs">
      
      {/* Header Info & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md text-[10px]">
              {activeCob.toUpperCase()} - {activeCategory.toUpperCase()}
            </span>
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[10px]">
              CEDANT: {String(activeCedant).toUpperCase()}
            </span>
            <h3 className="text-sm font-bold text-slate-800">{fileItem?.name || 'Berkas Bordero'}</h3>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Sheet Target: <strong className="text-slate-600 font-mono">{fileItem?.selectedSheet || '-'}</strong> | 
            Total Kolom Sumber: <strong className="text-blue-600 font-bold">{safeSourceColumns.length}</strong> | 
            Format IPR: <strong className="text-slate-600">{targetSchema.length} Kolom</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onApplyToAllFiles && (
            <button
              type="button"
              onClick={() => onApplyToAllFiles(mapping, nonIprConfig)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs text-[11px]"
              title="Terapkan mapping ini ke semua berkas dalam antrean"
            >
              <CopyCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Samakan ke Semua File</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAsPreset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs text-[11px]"
            title="Simpan konfigurasi ini sebagai default template"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simpan Preset</span>
          </button>

          <button
            type="button"
            onClick={handleManualAutoMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs text-[11px]"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Auto-Match Ulang</span>
          </button>

          <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${
            isComplete
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {isComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kolom Wajib Lengkap ({mappedRequired}/{totalRequired})</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Kolom Wajib: {mappedRequired}/{totalRequired}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Tabel 1: Format Standar IPR */}
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
              const isRequired = targetCol.required;

              const rowClass = isMapped
                ? 'hover:bg-slate-50/50'
                : isRequired
                ? 'bg-rose-50/30 hover:bg-rose-50/50'
                : 'bg-amber-50/20 hover:bg-amber-50/40';

              const selectClass = isMapped
                ? 'bg-white border-blue-300 text-blue-900 focus:border-blue-500'
                : isRequired
                ? 'bg-white border-rose-400 text-rose-600 focus:border-rose-500'
                : 'bg-white border-amber-300 text-amber-700 focus:border-amber-500';

              return (
                <tr key={targetCol.dbField} className={`transition-colors ${rowClass}`}>
                  <td className="p-3 border-r border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800">{targetCol.iprLabel}</span>
                      {isRequired ? (
                        <span className="text-rose-600 font-bold text-[10px] shrink-0">* Wajib</span>
                      ) : (
                        <span className="text-amber-600 font-semibold text-[10px] shrink-0">Opsional</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 border-r border-slate-100">
                    <select
                      value={selectedValue}
                      onChange={(e) => handleSelectField(targetCol.dbField, e.target.value)}
                      className={`w-full p-2 rounded-xl text-xs font-semibold outline-none border transition-all cursor-pointer shadow-2xs ${selectClass}`}
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

      {/* Tabel 2: Kolom Tambahan Non-IPR dengan Toggle Aktif/Nonaktif */}
      {unmappedSourceColumns.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" /> Kolom Tambahan Sumber (Non-IPR)
            </h4>
            <span className="text-[10px] text-slate-400">{unmappedSourceColumns.length} kolom ekstra terdeteksi</span>
          </div>

          <div className="border border-indigo-100 rounded-2xl overflow-hidden bg-indigo-50/20 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50/60 border-b border-indigo-100 text-indigo-900 text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-3 w-1/12 text-center border-r border-indigo-100">Status</th>
                  <th className="p-3 w-4/12 border-r border-indigo-100">Kolom Asli di Excel</th>
                  <th className="p-3 w-4/12 border-r border-indigo-100">Target Nama Field DB (Editable)</th>
                  <th className="p-3 w-3/12">Tipe Data SQL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50 font-medium">
                {unmappedSourceColumns.map((col) => {
                  const cfg = nonIprConfig[col] || {
                    enabled: true,
                    dbField: sanitizeDbFieldName(col),
                    sqlType: suggestSqlType(col),
                  };

                  return (
                    <tr key={col} className={`transition-colors ${cfg.enabled ? 'hover:bg-indigo-50/40' : 'bg-slate-100/50 opacity-60'}`}>
                      <td className="p-3 text-center border-r border-indigo-100">
                        <button
                          type="button"
                          onClick={() => handleUpdateNonIprField(col, "enabled", !cfg.enabled)}
                          className="cursor-pointer focus:outline-none"
                          title={cfg.enabled ? "Nonaktifkan kolom ini" : "Aktifkan kolom ini"}
                        >
                          {cfg.enabled ? (
                            <ToggleRight className="w-6 h-6 text-indigo-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className={`p-3 border-r border-indigo-100 font-bold ${cfg.enabled ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                        {col}
                      </td>

                      <td className="p-3 border-r border-indigo-100">
                        <div className={`flex items-center gap-1 bg-white border rounded-xl px-2 py-1 ${cfg.enabled ? 'border-indigo-200' : 'border-slate-200 bg-slate-50'}`}>
                          <Database className={`w-3 h-3 ${cfg.enabled ? 'text-indigo-400' : 'text-slate-300'} shrink-0`} />
                          <input
                            type="text"
                            disabled={!cfg.enabled}
                            value={cfg.dbField}
                            onChange={(e) => handleUpdateNonIprField(col, "dbField", sanitizeDbFieldName(e.target.value))}
                            className="w-full text-xs font-mono text-indigo-900 bg-transparent outline-none disabled:text-slate-400"
                            placeholder="nama_field_db"
                          />
                        </div>
                      </td>

                      <td className="p-3">
                        <select
                          disabled={!cfg.enabled}
                          value={cfg.sqlType}
                          onChange={(e) => handleUpdateNonIprField(col, "sqlType", e.target.value)}
                          className="bg-white border border-indigo-200 text-indigo-900 text-xs font-mono font-bold rounded-xl px-2 py-1 outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="TEXT">TEXT</option>
                          <option value="NUMERIC(20, 2)">NUMERIC(20, 2)</option>
                          <option value="BIGINT">BIGINT</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Box 3: Preview Kolom Metadata Sistem */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" /> Kolom Sistem Tambahan Otomatis di Akhir Tabel
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
            <div>
              <span className="font-mono font-bold text-slate-800 block text-xs">period</span>
              <span className="text-[10px] text-slate-400">Periode transaksi / Kuartal / Bulanan</span>
            </div>
            <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-[10px] rounded-lg">
              {`${fileItem?.period || 'TW1'} ${fileItem?.receivedDate || ''}`.trim().toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
            <div>
              <span className="font-mono font-bold text-slate-800 block text-xs">cedant_name</span>
              <span className="text-[10px] text-slate-400">Nama entitas cedant perusahaan</span>
            </div>
            <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-[10px] rounded-lg">
              {String(activeCedant).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}