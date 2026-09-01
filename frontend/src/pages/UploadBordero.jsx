// frontend/src/pages/UploadBordero.jsx (Bagian render step SUCCESS)
import React, { useState } from 'react';
import UploadWidget from '../features/upload/components/UploadWidget';
import ColumnMapper from '../features/mapping/components/ColumnMapper';
import { getIprSchema } from '../data/iprMasterData';
import { autoMatchColumns } from '../features/mapping/utils/matcher';
import { processWithMapping } from '../api/borderoApi';
import { ArrowLeft, ArrowRight, DatabaseZap, CheckCircle2, Database, FileSpreadsheet, RefreshCw } from 'lucide-react';

export default function UploadBordero() {
  const [currentStep, setCurrentStep] = useState('UPLOAD');
  const [uploadPayload, setUploadPayload] = useState(null);
  const [fileMappings, setFileMappings] = useState({});
  const [nonIprMappings, setNonIprMappings] = useState({});
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [etlReportResults, setEtlReportResults] = useState(null);

  const handleUploadComplete = (payload) => {
    setUploadPayload(payload);

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
      setEtlReportResults(res.data?.processed_files || res.processed_files || []);
      setCurrentStep('SUCCESS');
    } catch (err) {
      console.error('Gagal memproses ETL dengan mapping:', err);
      alert('Terjadi kesalahan saat memproses data ke database.');
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
    alert(`Konfigurasi mapping berhasil disalin ke seluruh ${uploadPayload.files.length} berkas dalam batch!`);
  };

  const activeFile = uploadPayload?.files?.[activeFileIndex] || null;
  const activeSourceColumns = activeFile?.available_sheets_columns?.[activeFile?.selectedSheet] || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Step Wizard Bar */}
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
            cob={activeFile?.cob || 'FIRE'}
            category={activeFile?.category || 'CLAIM'}
            cedantName={uploadPayload?.cedant?.name || uploadPayload?.cedant?.code}
            sourceColumns={activeSourceColumns}
            mapping={fileMappings[activeFileIndex] || {}}
            nonIprConfig={nonIprMappings[activeFileIndex] || {}}
            onMappingChange={(newMap) => setFileMappings((prev) => ({ ...prev, [activeFileIndex]: newMap }))}
            onNonIprConfigChange={(newNonIpr) => setNonIprMappings((prev) => ({ ...prev, [activeFileIndex]: newNonIpr }))}
            onApplyToAllFiles={uploadPayload.files.length > 1 ? handleApplyToAllFiles : null}
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

      {/* Step SUCCESS: Report Hasil ETL & Mapping Lengkap */}
      {currentStep === 'SUCCESS' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Proses ETL & Database Loading Selesai!</h2>
              <p className="text-xs text-slate-500">
                Data transaksi bordero telah berhasil distandarisasi dan disimpan ke PostgreSQL.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" /> Ringkasan Laporan Pemuatan Tabel
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                    <th className="p-3">Tabel Target Database</th>
                    <th className="p-3">Cedant</th>
                    <th className="p-3">Periode</th>
                    <th className="p-3 text-center">Kolom IPR</th>
                    <th className="p-3 text-center">Kolom Ekstra</th>
                    <th className="p-3 text-right">Baris Termuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(etlReportResults || []).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-blue-700">{r.table_name}</td>
                      <td className="p-3">{r.cedant_name}</td>
                      <td className="p-3 font-mono text-[11px]">{r.period}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{r.ipr_mapped_count} Kolom</td>
                      <td className="p-3 text-center font-bold text-indigo-600">{r.non_ipr_added_count} Kolom</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{r.total_rows_loaded?.toLocaleString()} Baris</td>
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
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm"
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