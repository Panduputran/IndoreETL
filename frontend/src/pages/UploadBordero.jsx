import React, { useState } from 'react';
import UploadWidget from '../features/upload/components/UploadWidget';
import ColumnMapper from '../features/mapping/components/ColumnMapper';
import { getIprSchema } from '../data/iprMasterData';
import { autoMatchColumns } from '../features/mapping/utils/matcher';
import { processWithMapping } from '../api/borderoApi';
import { ArrowLeft, ArrowRight, DatabaseZap, CheckCircle2, Database, RefreshCw, AlertCircle } from 'lucide-react';

export default function UploadBordero() {
  const [currentStep, setCurrentStep] = useState('UPLOAD');
  const [uploadPayload, setUploadPayload] = useState(null);
  const [fileMappings, setFileMappings] = useState({});
  const [nonIprMappings, setNonIprMappings] = useState({});
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [etlReportResults, setEtlReportResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUploadComplete = (payload) => {
    setUploadPayload(payload);
    setErrorMessage('');

    const initialMappings = {};
    (payload?.files || []).forEach((file, idx) => {
      const schema = getIprSchema(file?.cob, file?.category);
      const sourceCols = file?.available_sheets_columns?.[file?.selectedSheet] || [];
      initialMappings[idx] = autoMatchColumns(sourceCols, schema);
    });

    setFileMappings(initialMappings);
    setNonIprMappings({});
    setActiveFileIndex(0);
    setCurrentStep('MAPPING');
  };

  const handleExecuteDatabaseETL = async () => {
    if (!uploadPayload?.files?.length) return;
    setCurrentStep('EXECUTING');
    setErrorMessage('');

    try {
      const formattedFiles = uploadPayload.files.map((file, idx) => {
        const rawPeriod = String(file.period || 'TW1').trim();
        const rawYear = String(file.receivedDate || new Date().getFullYear()).trim();
        const fullPeriod = rawPeriod.includes(rawYear) ? rawPeriod : `${rawPeriod} ${rawYear}`;

        return {
          file_id: file.file_id,
          category: file.category || 'premi',
          cob: file.cob || 'fire',
          period: fullPeriod.toUpperCase(),
          received_date: rawYear,
          selected_sheet: file.selectedSheet || '',
          column_mapping: fileMappings[idx] || {},
          non_ipr_mapping: nonIprMappings[idx] || {},
        };
      });

      const body = {
        cedant_code: uploadPayload.cedant?.code || 'CEDANT',
        cedant_name: uploadPayload.cedant?.name || uploadPayload.cedant?.code?.toUpperCase() || 'CEDANT',
        activity_title: uploadPayload.activityTitle || 'BATCH-ETL',
        files: formattedFiles,
      };

      const res = await processWithMapping(body);
      sessionStorage.removeItem("etl_upload_widget_state");
      const processed = res.data?.processed_files || res.processed_files || [];
      setEtlReportResults(processed);
      setCurrentStep('SUCCESS');
    } catch (err) {
      console.error('Gagal memproses ETL dengan mapping:', err);
      const detail = err.response?.data?.detail || err.message || 'Terjadi kesalahan saat memproses data ke database.';
      setErrorMessage(detail);
      setCurrentStep('MAPPING');
    }
  };

  const handleApplyToAllFiles = (sourceMapping, sourceNonIprConfig) => {
    const updatedFileMappings = {};
    const updatedNonIprMappings = {};

    uploadPayload.files.forEach((_, idx) => {
      updatedFileMappings[idx] = { ...sourceMapping };
      updatedNonIprMappings[idx] = { ...sourceNonIprConfig };
    });

    setFileMappings(updatedFileMappings);
    setNonIprMappings(updatedNonIprMappings);
  };

  const activeFile = uploadPayload?.files?.[activeFileIndex] || null;
  const activeSourceColumns = activeFile?.available_sheets_columns?.[activeFile?.selectedSheet] || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Step Wizard Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
        {['UPLOAD', 'MAPPING', 'EXECUTING'].map((step, idx) => (
          <div key={step} className="flex items-center gap-3">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs transition-colors ${
              currentStep === step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {idx + 1}
            </span>
            <span className={`text-sm font-medium ${currentStep === step ? 'text-slate-800' : 'text-slate-400'}`}>
              {step === 'UPLOAD' && 'Unggah Berkas'}
              {step === 'MAPPING' && 'Pemetaan Kolom IPR'}
              {step === 'EXECUTING' && 'Proses Database'}
            </span>
          </div>
        ))}
      </div>

      {/* Error Alert jika terjadi kegagalan */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-600 hover:text-rose-800 font-medium underline text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {currentStep === 'UPLOAD' && (
        <UploadWidget onNext={handleUploadComplete} />
      )}

      {currentStep === 'MAPPING' && activeFile && (
        <div className="space-y-6">
          {uploadPayload.files.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {uploadPayload.files.map((f, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveFileIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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
            cob={activeFile?.cob || 'FIRE'}
            category={activeFile?.category || 'premi'}
            cedantName={uploadPayload?.cedant?.name || uploadPayload?.cedant?.code}
            sourceColumns={activeSourceColumns}
            mapping={fileMappings[activeFileIndex] || {}}
            nonIprConfig={nonIprMappings[activeFileIndex] || {}}
            onMappingChange={(newMap) => setFileMappings((prev) => ({ ...prev, [activeFileIndex]: newMap }))}
            onNonIprConfigChange={(newNonIpr) => setNonIprMappings((prev) => ({ ...prev, [activeFileIndex]: newNonIpr }))}
            onApplyToAllFiles={uploadPayload.files.length > 1 ? handleApplyToAllFiles : null}
          />

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep('UPLOAD')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Upload</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteDatabaseETL}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>Simpan & Proses ke Database</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'EXECUTING' && (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-4 text-center shadow-xs">
          <DatabaseZap className="w-12 h-12 text-blue-600 animate-bounce" />
          <h2 className="text-lg font-medium text-slate-800">Menjalankan Pipeline ETL & Loading Database...</h2>
          <p className="text-sm text-slate-400 max-w-md">
            Data sedang distandarisasi sesuai pemetaan kolom IPR dan dimuat ke tabel PostgreSQL.
          </p>
        </div>
      )}

      {currentStep === 'SUCCESS' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-6 shadow-xs">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-slate-900">Proses ETL Selesai</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Data transaksi bordero telah berhasil distandarisasi dan disimpan ke database.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-blue-600" /> Ringkasan Laporan Pemuatan
            </h3>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-5">Tabel Target</th>
                    <th className="py-3.5 px-5">Cedant</th>
                    <th className="py-3.5 px-5">Periode</th>
                    <th className="py-3.5 px-5 text-center">Kolom IPR</th>
                    <th className="py-3.5 px-5 text-center">Kolom Ekstra</th>
                    <th className="py-3.5 px-5 text-right">Baris Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(etlReportResults || []).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-5 font-mono text-xs text-blue-700 font-medium">{r.table_name}</td>
                      <td className="py-3.5 px-5 font-medium text-slate-800">{r.cedant_name}</td>
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-600">{r.period}</td>
                      <td className="py-3.5 px-5 text-center text-emerald-600 font-medium">{r.ipr_mapped_count} Kolom</td>
                      <td className="py-3.5 px-5 text-center text-indigo-600 font-medium">{r.non_ipr_added_count} Kolom</td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-900 font-medium">{r.total_rows_loaded?.toLocaleString()} Baris</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep('UPLOAD')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Upload Berkas Baru</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}