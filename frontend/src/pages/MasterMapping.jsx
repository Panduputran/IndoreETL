import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  Save, 
  Check, 
  MinusCircle,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

// IMPORT DATA DARI FILE TERPISAH
import { dummyEtlSources } from "../features/mapping/data/mappingData";

export default function MasterMapping() {
  // State pilihan dokumen ETL
  const [selectedEtlSource, setSelectedEtlSource] = useState('ETL-IPR-FORMAT');
  
  // State tab sheet yang aktif
  const [activeSheetTab, setActiveSheetTab] = useState('IPR Premium');

  // STATE MODAL KONFIRMASI & PROSES
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Data File & Sheet Active
  const currentSourceObj = dummyEtlSources.find(s => s.id === selectedEtlSource);
  const currentSheetObj = currentSourceObj?.sheets.find(s => s.name === activeSheetTab);
  const rawExcelHeaders = currentSourceObj?.rawHeaders || [];

  // State Mappings
  const [sheetMappings, setSheetMappings] = useState({
    'IPR Premium': dummyEtlSources[0].sheets[0].defaultMappings,
    'Bordero Claim': dummyEtlSources[1].sheets[0].defaultMappings
  });

  const handleSelectDocument = (docId) => {
    setSelectedEtlSource(docId);
    const doc = dummyEtlSources.find(s => s.id === docId);
    if (doc && doc.sheets.length > 0) {
      setActiveSheetTab(doc.sheets[0].name);
    }
  };

  const handleMappingChange = (sheetName, dbKey, selectedExcelCol) => {
    setSheetMappings(prev => ({
      ...prev,
      [sheetName]: {
        ...prev[sheetName],
        [dbKey]: selectedExcelCol
      }
    }));
  };

  const handleExecuteSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmModal(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-5 text-xs bg-slate-50 min-h-screen relative">
      
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Master Mapping Profile (Pusat)</h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Konfigurasi pemetaan header Excel mentah ke skema database master (IPR & Claim Bordero).
          </p>
        </div>

        {selectedEtlSource && (
          <button 
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>Simpan Template Mapping</span>
          </button>
        )}
      </div>

      {/* Alert Banner Sukses Simpan */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl flex items-center justify-between animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Berhasil!</span>
            <span>Template pemetaan untuk <strong>{currentSourceObj?.name}</strong> berhasil diperbarui ke Master Database.</span>
          </div>
        </div>
      )}

      {/* STEP 1: PILIH DOKUMEN ETL SOURCE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Pilih Sumber Berkas Mentah</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">
              Sampel Berkas Mentah <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedEtlSource}
              onChange={(e) => handleSelectDocument(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm transition-all"
            >
              <option value="">-- Pilih Berkas Mentah --</option>
              {dummyEtlSources.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.id}] {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Profil Cedant & Tipe File</label>
            <input 
              type="text" 
              readOnly 
              value={
                selectedEtlSource 
                  ? `${currentSourceObj?.cedant} — ${currentSourceObj?.type}` 
                  : 'Otomatis terdeteksi dari source'
              }
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100/70 text-slate-600 font-bold text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* STEP 2: MAPPING MATRIX */}
      {selectedEtlSource && currentSourceObj ? (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Matriks Pemetaan Kolom ({currentSourceObj.type})</h3>
                <p className="text-[10px] text-slate-500">
                  Pemetaan header fisik Excel mentah ke skema kolom database master.
                </p>
              </div>
            </div>

            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg border border-blue-100 shrink-0">
              {rawExcelHeaders.length - 1} Header Terdeteksi
            </span>
          </div>

          {/* BANNER INFORMASI AUTO-INJECT SYSTEM */}
          {selectedEtlSource === 'ETL-ASK-CLAIM' && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-xs">Aturan Transformatif ETL Sistem Auto-Inject:</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Kolom <strong className="text-amber-900 font-mono">COB</strong> tidak ada pada fisik file Excel mentah Askrida Claim. Pipeline ETL backend secara otomatis menyuntikkan kolom <strong className="text-amber-900 font-mono">COB</strong> berisi nilai string <strong className="text-amber-900 font-bold">'KREDIT'</strong> pada saat proses penyimpanan.
                </p>
              </div>
            </div>
          )}

          {/* TABLE MATRIX MAPPING */}
          {currentSheetObj && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-3 w-1/3">Header Excel Mentah (Source)</th>
                      <th className="p-3 w-1/3">Nama Kolom di Database (Target)</th>
                      <th className="p-3 w-1/6">Format Data</th>
                      <th className="p-3 text-center">Status Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {currentSheetObj.dbColumns.map((col) => {
                      const currentMappedVal = sheetMappings[activeSheetTab]?.[col.key];
                      const isMapped = currentMappedVal && !currentMappedVal.includes('Biarkan Kosong');

                      return (
                        <tr key={col.key} className={`transition-colors ${!isMapped ? 'bg-slate-50/40' : 'hover:bg-slate-50/80'}`}>
                          
                          {/* 1. Header Excel Mentah Selection */}
                          <td className="p-3">
                            <select
                              value={currentMappedVal || rawExcelHeaders[0]}
                              onChange={(e) => handleMappingChange(activeSheetTab, col.key, e.target.value)}
                              className={`w-full p-2 border rounded-xl outline-none font-bold text-xs transition-all cursor-pointer shadow-sm ${
                                isMapped 
                                  ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900 focus:border-emerald-500' 
                                  : 'border-slate-200 bg-white text-slate-400 focus:border-blue-500'
                              }`}
                            >
                              {rawExcelHeaders.map((hdr, i) => (
                                <option key={i} value={hdr}>{hdr}</option>
                              ))}
                            </select>
                          </td>

                          {/* 2. Target DB Column Name */}
                          <td className="p-3">
                            <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{col.key}</span>
                              {col.required && <span className="text-rose-500 font-bold">*</span>}
                            </div>
                            <span className="text-[10px] text-slate-400 font-sans block">{col.label}</span>
                          </td>

                          {/* 3. Data Format */}
                          <td className="p-3">
                            <span className={`font-mono px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              col.type.includes('DECIMAL') 
                                ? 'bg-amber-50 text-amber-700 border-amber-200/80' 
                                : col.type === 'TIMESTAMP'
                                ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                                : 'bg-slate-100 text-slate-600 border-slate-200/60'
                            }`}>
                              {col.type}
                            </span>
                          </td>

                          {/* 4. Status Badge */}
                          <td className="p-3 text-center">
                            {isMapped ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md text-[10px] border border-emerald-200/80">
                                <Check className="w-3 h-3 text-emerald-600" /> Matched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-md text-[10px] border border-slate-200/80">
                                <MinusCircle className="w-3 h-3 text-slate-400" /> Ignored
                              </span>
                            )}
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
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto border border-slate-200/60">
            <FileSpreadsheet className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Pilih Sumber Dokumen Terlebih Dahulu</h4>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Silakan pilih sampel berkas mentah pada Step 1 untuk menguji skema pemetaan.
            </p>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI SIMPAN TEMPLATE */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 text-center space-y-4 relative">
            <button 
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 text-sm">Simpan Template Mapping?</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Perubahan aturan pemetaan untuk <strong className="text-blue-700">{currentSourceObj?.cedant}</strong> akan disimpan ke master dan menjadi rujukan otomatis untuk proses ETL berikutnya.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="w-1/2 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              
              <button 
                type="button"
                onClick={handleExecuteSave}
                disabled={isProcessing}
                className="w-1/2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                {isProcessing ? 'Memproses...' : 'Ya, Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}