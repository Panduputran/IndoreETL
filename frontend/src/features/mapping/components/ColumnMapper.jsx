import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  PlusCircle, 
  ToggleLeft, 
  ToggleRight, 
  BookmarkCheck, 
  CopyCheck, 
  Sparkles,
  Layers,
  Check,
  Trash2
} from 'lucide-react';
import { getIprSchema } from '../../../data/iprMasterData';
import { autoMatchColumns, sanitizeDbFieldName, suggestSqlType } from '../utils/matcher';
import { getMappingPresets, saveMappingPreset, deleteMappingPreset } from '../../../api/borderoApi';

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

  const [availablePresets, setAvailablePresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [presetFeedback, setPresetFeedback] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

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

  // Load daftar preset dari database PostgreSQL
  const loadPresetsList = useCallback(async () => {
    try {
      const res = await getMappingPresets({
        cedant: String(activeCedant).toLowerCase(),
        cob: String(activeCob).toUpperCase(),
        category: String(activeCategory).toLowerCase(),
      });
      if (res && res.data) {
        setAvailablePresets(res.data);
        if (res.data.length > 0 && !selectedPresetId) {
          setSelectedPresetId(String(res.data[0].id));
        }
      }
    } catch (err) {
      console.warn('Gagal memuat daftar preset:', err);
    }
  }, [activeCedant, activeCob, activeCategory, selectedPresetId]);

  useEffect(() => {
    loadPresetsList();
  }, [loadPresetsList]);

  // Auto-Load Preset Tersimpan pertama kali jika mapping belum terisi
  useEffect(() => {
    if (safeSourceColumns.length > 0 && targetSchema.length > 0) {
      const currentKeys = Object.keys(mapping || {});
      if (currentKeys.length === 0 && onMappingChange) {
        getMappingPresets({
          cedant: String(activeCedant).toLowerCase(),
          cob: String(activeCob).toUpperCase(),
          category: String(activeCategory).toLowerCase(),
        }).then(res => {
          if (res && res.data && res.data.length > 0) {
            try {
              const parsed = JSON.parse(res.data[0].mapping_json);
              onMappingChange(parsed.mapping || parsed);
              if (parsed.nonIprConfig && onNonIprConfigChange) {
                onNonIprConfigChange(parsed.nonIprConfig);
              }
              setPresetFeedback({
                type: 'info',
                message: `Otomatis memuat preset '${res.data[0].preset_name}' dari database.`,
              });
              setTimeout(() => setPresetFeedback(null), 4000);
              return;
            } catch (err) {
              console.warn('Gagal parse preset dari database:', err);
            }
          }

          // Fallback LocalStorage
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
              console.error('Gagal parse preset lokal:', e);
            }
          }

          // Fallback auto-match
          const initialMatched = autoMatchColumns(safeSourceColumns, targetSchema);
          onMappingChange(initialMatched);
        }).catch(() => {
          const initialMatched = autoMatchColumns(safeSourceColumns, targetSchema);
          onMappingChange(initialMatched);
        });
      }
    }
  }, [safeSourceColumns, targetSchema, presetKey, activeCedant, activeCob, activeCategory]);

  // Fungsi Terapkan Preset yang dipilih
  const handleApplySelectedPreset = () => {
    if (!selectedPresetId) return;
    const targetPreset = availablePresets.find(p => String(p.id) === String(selectedPresetId));
    if (!targetPreset) return;

    try {
      const parsed = JSON.parse(targetPreset.mapping_json);
      const newMapping = parsed.mapping || parsed;
      const newNonIpr = parsed.nonIprConfig || {};

      if (onMappingChange) onMappingChange(newMapping);
      if (onNonIprConfigChange) onNonIprConfigChange(newNonIpr);

      setPresetFeedback({
        type: 'success',
        message: `Preset '${targetPreset.preset_name}' berhasil diterapkan ke berkas ini!`,
      });
      setTimeout(() => setPresetFeedback(null), 3500);
    } catch (err) {
      console.error('Gagal menerapkan preset:', err);
      setPresetFeedback({
        type: 'error',
        message: 'Format preset tidak valid atau rusak.',
      });
      setTimeout(() => setPresetFeedback(null), 3500);
    }
  };

  // Fungsi Simpan Preset ke PostgreSQL
  const handleSaveAsPreset = async () => {
    const presetName = prompt(
      'Masukkan nama preset mapping:',
      `Preset ${String(activeCedant).toUpperCase()} (${String(activeCob).toUpperCase()} - ${String(activeCategory).toUpperCase()})`
    );

    if (!presetName || !presetName.trim()) return;

    const presetData = {
      mapping,
      nonIprConfig,
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(presetKey, JSON.stringify(presetData));

    try {
      setSaveStatus('saving');
      const res = await saveMappingPreset({
        cedant_code: String(activeCedant).toLowerCase(),
        cob: String(activeCob).toUpperCase(),
        category: String(activeCategory).toLowerCase(),
        preset_name: presetName.trim(),
        mapping_json: JSON.stringify(presetData),
      });
      
      setSaveStatus('success');
      await loadPresetsList();
      if (res && res.data?.id) {
        setSelectedPresetId(String(res.data.id));
      }

      setPresetFeedback({
        type: 'success',
        message: `Preset '${presetName}' berhasil disimpan permanen ke database!`,
      });
      setTimeout(() => {
        setSaveStatus(null);
        setPresetFeedback(null);
      }, 3500);
    } catch (err) {
      console.error('Gagal menyimpan preset ke DB:', err);
      setSaveStatus('error');
      setPresetFeedback({
        type: 'error',
        message: 'Gagal menyimpan preset ke database.',
      });
      setTimeout(() => {
        setSaveStatus(null);
        setPresetFeedback(null);
      }, 3500);
    }
  };

  // Deteksi Kolom Non-IPR
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
    setPresetFeedback({
      type: 'info',
      message: 'Berhasil melakukan auto-match ulang kolom berkas.',
    });
    setTimeout(() => setPresetFeedback(null), 3000);
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 font-sans shadow-xs">
      
      {/* Header Info & File Specs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
              {activeCob.toUpperCase()} - {activeCategory.toUpperCase()}
            </span>
            <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
              {String(activeCedant).toUpperCase()}
            </span>
            <h3 className="text-base font-semibold text-slate-800">{fileItem?.name || 'Berkas Bordero'}</h3>
          </div>
          <p className="text-slate-500 text-xs mt-1.5 font-normal">
            Sheet: <span className="text-slate-800 font-mono font-medium">{fileItem?.selectedSheet || '-'}</span> • 
            Kolom Sumber: <span className="text-slate-800 font-medium">{safeSourceColumns.length}</span> • 
            Target IPR: <span className="text-slate-800 font-medium">{targetSchema.length} Kolom</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onApplyToAllFiles && (
            <button
              type="button"
              onClick={() => onApplyToAllFiles(mapping, nonIprConfig)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl transition-colors cursor-pointer text-xs"
              title="Terapkan konfigurasi mapping ini ke semua berkas dalam antrean"
            >
              <CopyCheck className="w-4 h-4 text-slate-600" />
              <span>Samakan ke Semua File</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleManualAutoMatch}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl transition-colors cursor-pointer text-xs"
          >
            <RefreshCcw className="w-4 h-4 text-slate-600" />
            <span>Auto-Match Ulang</span>
          </button>

          <span className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
            isComplete
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {isComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kolom Wajib Lengkap ({mappedRequired}/{totalRequired})</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Kolom Wajib: {mappedRequired}/{totalRequired}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Preset Control Bar */}
      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <BookmarkCheck className="w-5 h-5 text-blue-600 shrink-0 hidden sm:block" />
          <div className="flex-1 max-w-md">
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {availablePresets.length === 0 ? (
                <option value="">Belum ada preset tersimpan untuk cedant ini</option>
              ) : (
                availablePresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.preset_name} ({new Date(p.created_at).toLocaleDateString('id-ID')})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={handleApplySelectedPreset}
            disabled={availablePresets.length === 0 || !selectedPresetId}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan Preset</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAsPreset}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan Mapping Saat Ini sebagai Preset'}</span>
          </button>
        </div>
      </div>

      {/* Preset Feedback Toast Banner */}
      {presetFeedback && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
          presetFeedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : presetFeedback.type === 'error'
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          {presetFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : presetFeedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          ) : (
            <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
          )}
          <span>{presetFeedback.message}</span>
        </div>
      )}

      {/* Tabel 1: Format Standar IPR */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse font-sans text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-medium tracking-wider">
              <th className="py-3.5 px-4 w-4/12 border-r border-slate-200/80">Format Standar IPR</th>
              <th className="py-3.5 px-4 w-4/12 border-r border-slate-200/80">Kolom Sumber (Excel)</th>
              <th className="py-3.5 px-4 w-2/12 border-r border-slate-200/80">Field Database</th>
              <th className="py-3.5 px-4 w-2/12">Tipe Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {targetSchema.map((targetCol) => {
              const selectedValue = mapping?.[targetCol.dbField] || '';
              const isMapped = Boolean(selectedValue);
              const isRequired = targetCol.required;

              const rowClass = isMapped
                ? 'hover:bg-slate-50/50'
                : isRequired
                ? 'bg-rose-50/20 hover:bg-rose-50/30'
                : 'bg-amber-50/15 hover:bg-amber-50/25';

              return (
                <tr key={targetCol.dbField} className={`transition-colors ${rowClass}`}>
                  <td className="py-3.5 px-4 border-r border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">{targetCol.iprLabel}</span>
                      {isRequired ? (
                        <span className="text-rose-600 font-medium text-xs shrink-0">* Wajib</span>
                      ) : (
                        <span className="text-slate-400 text-xs shrink-0">Opsional</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 border-r border-slate-100">
                    <select
                      value={selectedValue}
                      onChange={(e) => handleSelectField(targetCol.dbField, e.target.value)}
                      className="w-full py-2 px-3 bg-white rounded-xl text-sm outline-none border border-slate-200 focus:border-blue-500 transition-colors cursor-pointer text-slate-700"
                    >
                      <option value="">-- Lewati / Kosongkan --</option>
                      {safeSourceColumns.map((col, idx) => (
                        <option key={idx} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-4 border-r border-slate-100">
                    <span className="font-mono text-xs text-slate-600 truncate block">
                      {targetCol.dbField}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-slate-500">
                      {targetCol.sqlType}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tabel 2: Kolom Tambahan Non-IPR */}
      {unmappedSourceColumns.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-800 text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-slate-500" /> Kolom Tambahan Sumber (Non-IPR)
            </h4>
            <span className="text-xs text-slate-400">{unmappedSourceColumns.length} kolom ekstra terdeteksi</span>
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-sm font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-medium tracking-wider">
                  <th className="py-3.5 px-4 w-1/12 text-center border-r border-slate-200/80">Status</th>
                  <th className="py-3.5 px-4 w-4/12 border-r border-slate-200/80">Kolom Asli Excel</th>
                  <th className="py-3.5 px-4 w-4/12 border-r border-slate-200/80">Target Field DB</th>
                  <th className="py-3.5 px-4 w-3/12">Tipe Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {unmappedSourceColumns.map((col) => {
                  const cfg = nonIprConfig[col] || {
                    enabled: true,
                    dbField: sanitizeDbFieldName(col),
                    sqlType: suggestSqlType(col),
                  };

                  return (
                    <tr key={col} className={`transition-colors ${cfg.enabled ? 'hover:bg-slate-50/50' : 'bg-slate-50/40 opacity-60'}`}>
                      <td className="py-3.5 px-4 text-center border-r border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleUpdateNonIprField(col, 'enabled', !cfg.enabled)}
                          className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          {cfg.enabled ? (
                            <ToggleRight className="w-6 h-6 text-blue-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 border-r border-slate-100 text-slate-800">
                        {col}
                      </td>

                      <td className="py-3.5 px-4 border-r border-slate-100">
                        <input
                          type="text"
                          value={cfg.dbField}
                          onChange={(e) => handleUpdateNonIprField(col, 'dbField', e.target.value)}
                          disabled={!cfg.enabled}
                          className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={cfg.sqlType}
                          onChange={(e) => handleUpdateNonIprField(col, 'sqlType', e.target.value)}
                          disabled={!cfg.enabled}
                          className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                        >
                          <option value="TEXT">TEXT</option>
                          <option value="NUMERIC(20, 2)">NUMERIC(20, 2)</option>
                          <option value="BIGINT">BIGINT</option>
                          <option value="TIMESTAMP">TIMESTAMP</option>
                          <option value="DATE">DATE</option>
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
    </div>
  );
}