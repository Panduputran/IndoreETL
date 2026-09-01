// src/pages/UploadBordero.jsx
import React, { useState } from 'react';
import UploadWidget from '../features/upload/components/UploadWidget';
import ColumnMapper from '../features/mapping/components/ColumnMapper';
import { IPR_COLUMNS_DEFINITION } from '../data/iprMasterData';
import { autoMatchColumns } from '../features/mapping/utils/matcher';
import { processWithMapping } from '../api/borderoApi';
import { ArrowLeft, ArrowRight, DatabaseZap, CheckCircle2 } from 'lucide-react';

export default function UploadBordero() {
  const [currentStep, setCurrentStep] = useState('UPLOAD');
  const [uploadPayload, setUploadPayload] = useState(null);
  const [fileMappings, setFileMappings] = useState({});
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const handleUploadComplete = (payload) => {
    setUploadPayload(payload);

    // Jalankan auto-match langsung untuk seluruh file
    const initialMappings = {};
    (payload?.files || []).forEach((file, idx) => {
      const rawCat = String(file?.category || 'PREMIUM').toUpperCase();
      const catKey = rawCat.includes('CLAIM') || rawCat.includes('KLAIM') ? 'CLAIM' : 'PREMIUM';
      const schema = IPR_COLUMNS_DEFINITION?.[catKey] || IPR_COLUMNS_DEFINITION?.PREMIUM || [];
      
      const sourceCols = file?.available_sheets_columns?.[file?.selectedSheet] || [];
      initialMappings[idx] = autoMatchColumns(sourceCols, schema);
    });

    setFileMappings(initialMappings);
    setActiveFileIndex(0);
    setCurrentStep('MAPPING');
  };

  const handleExecuteDatabaseETL = async () => {
    if (!uploadPayload?.files?.length) return;
    setCurrentStep('EXECUTING');

    try {
      const formattedFiles = uploadPayload.files.map((file, idx) => ({
        file_id: file.file_id,
        category: file.category || 'premi',
        cob: file.cob || 'fire',
        period: file.period || 'TW1',
        received_date: String(file.receivedDate || new Date().getFullYear()),
        selected_sheet: file.selectedSheet || '',
        column_mapping: fileMappings[idx] || {},
      }));

      const body = {
        cedant_code: uploadPayload.cedant?.code || 'CEDANT',
        activity_title: uploadPayload.activityTitle || 'BATCH-ETL',
        files: formattedFiles,
      };

      await processWithMapping(body);
      sessionStorage.removeItem("etl_upload_widget_state");
      setCurrentStep('SUCCESS');
    } catch (err) {
      console.error('Gagal memproses ETL dengan mapping:', err);
      alert('Terjadi kesalahan saat memproses data ke database.');
      setCurrentStep('MAPPING');
    }
  };

  const activeFile = uploadPayload?.files?.[activeFileIndex] || null;
  const activeSourceColumns = activeFile?.available_sheets_columns?.[activeFile?.selectedSheet] || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Wizard Step Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        {['UPLOAD', 'MAPPING', 'EXECUTING'].map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep === step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {idx + 1}
            </span>
            <span className={`text-xs font-bold ${currentStep === step ? 'text-slate-900' : 'text-slate-400'}`}>
              {step === 'UPLOAD' && 'Upload & Inspect'}
              {step === 'MAPPING' && 'Mapping Kolom IPR'}
              {step === 'EXECUTING' && 'Load ke Database'}
            </span>
          </div>
        ))}
      </div>

      {currentStep === 'UPLOAD' && (
        <UploadWidget onNext={handleUploadComplete} />
      )}

      {currentStep === 'MAPPING' && activeFile && (
        <div className="space-y-6">
          {uploadPayload.files.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {uploadPayload.files.map((f, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveFileIndex(idx)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeFileIndex === idx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          <ColumnMapper
            fileItem={activeFile}
            category={activeFile.category}
            sourceColumns={activeSourceColumns}
            mapping={fileMappings[activeFileIndex] || {}}
            onMappingChange={(newMap) => setFileMappings((prev) => ({ ...prev, [activeFileIndex]: newMap }))}
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep('UPLOAD')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Upload</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteDatabaseETL}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Simpan & Proses ke Database</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'EXECUTING' && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-4 text-center">
          <DatabaseZap className="w-10 h-10 text-blue-600 animate-bounce" />
          <h2 className="text-base font-bold text-slate-800">Menjalankan Pipeline ETL & Loading Database...</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Data sedang distandarisasi sesuai pemetaan kolom IPR dan dimuat ke PostgreSQL.
          </p>
        </div>
      )}

      {currentStep === 'SUCCESS' && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-4 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          <h2 className="text-base font-bold text-slate-900">Proses ETL Berhasil!</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Seluruh data transaksi telah dimuat ke tabel fisik PostgreSQL.
          </p>
          <button
            type="button"
            onClick={() => setCurrentStep('UPLOAD')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Upload Dokumen Baru
          </button>
        </div>
      )}
    </div>
  );
}