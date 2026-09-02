import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UploadWidget from '../features/upload/components/UploadWidget';
import ColumnMapper from '../features/mapping/components/ColumnMapper';
import { getIprSchema } from '../data/iprMasterData';
import { autoMatchColumns } from '../features/mapping/utils/matcher';
import { processWithMapping } from '../api/borderoApi';
import { 
  ArrowLeft, 
  ArrowRight, 
  DatabaseZap, 
  CheckCircle2, 
  Database, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Zap,
  Layers,
  Server,
  Timer,
  Clock,
  Download,
  Flame,
  CreditCard,
  FileText
} from 'lucide-react';

export default function UploadBordero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('UPLOAD');
  const [uploadPayload, setUploadPayload] = useState(null);
  const [fileMappings, setFileMappings] = useState({});
  const [nonIprMappings, setNonIprMappings] = useState({});
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [etlReportResults, setEtlReportResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Progress Bar & Stopwatch Timer State
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatusText, setProgressStatusText] = useState('Mempersiapkan data...');
  const [currentProgressStep, setCurrentProgressStep] = useState(1);
  const [elapsedTimeSec, setElapsedTimeSec] = useState('0.0');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

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
    setProgressPercent(10);
    setProgressStatusText('1/4: Memvalidasi konfigurasi pemetaan skema IPR...');
    setCurrentProgressStep(1);
    setElapsedTimeSec('0.0');

    // Mulai stopwatch penghitung waktu real-time
    startTimeRef.current = performance.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const diff = (performance.now() - startTimeRef.current) / 1000;
        setElapsedTimeSec(diff.toFixed(1));
      }
    }, 100);

    // Progress animation interval
    const progressTimer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 40) {
          setProgressStatusText('2/4: Menjalankan sanitasi data & normalisasi tanggal/numerik...');
          setCurrentProgressStep(2);
          return prev + 10;
        } else if (prev < 75) {
          setProgressStatusText('3/4: Sinkronisasi skema DDL & verifikasi tabel PostgreSQL...');
          setCurrentProgressStep(3);
          return prev + 6;
        } else if (prev < 90) {
          setProgressStatusText('4/4: Batch streaming COPY protocol ke tabel fisik...');
          setCurrentProgressStep(4);
          return prev + 2;
        }
        return prev;
      });
    }, 400);

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
        user_id: user?.id || null,
        uploaded_by: user?.full_name || user?.username || user?.email || 'Administrator',
        user_role: user?.role || 'operator',
        files: formattedFiles,
      };

      const res = await processWithMapping(body);
      clearInterval(progressTimer);
      if (timerRef.current) clearInterval(timerRef.current);

      if (startTimeRef.current) {
        const finalDiff = (performance.now() - startTimeRef.current) / 1000;
        setElapsedTimeSec(finalDiff.toFixed(2));
      }

      setProgressPercent(100);
      setProgressStatusText('Selesai! Seluruh berkas batch berhasil dimuat ke database.');
      setCurrentProgressStep(4);

      sessionStorage.removeItem("etl_upload_widget_state");
      const processed = res.data?.processed_files || res.processed_files || [];
      
      setTimeout(() => {
        setEtlReportResults(processed);
        setCurrentStep('SUCCESS');
      }, 500);
    } catch (err) {
      clearInterval(progressTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      console.error('Gagal memproses ETL dengan mapping:', err);
      const detail = err.response?.data?.detail || err.message || 'Terjadi kesalahan saat memproses data ke database.';
      setErrorMessage(detail);
      setCurrentStep('MAPPING');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  // Agregasi Laporan Batch Konsolidasi
  const batchSummary = useMemo(() => {
    if (!etlReportResults || !etlReportResults.length) return null;
    const totalFiles = etlReportResults.length;
    const totalRows = etlReportResults.reduce((acc, curr) => acc + (curr.total_rows_loaded || 0), 0);
    const totalDurationMs = etlReportResults.reduce((acc, curr) => acc + (curr.duration_ms || 0), 0);
    const hasFire = etlReportResults.some(r => String(r.table_name).includes('_fire'));
    const hasCredit = etlReportResults.some(r => String(r.table_name).includes('_credit') || String(r.table_name).includes('_kredit'));
    const cedantName = etlReportResults[0]?.cedant_name || uploadPayload?.cedant?.name || 'Cedant';

    return {
      totalFiles,
      totalRows,
      totalDurationMs,
      hasFire,
      hasCredit,
      cedantName
    };
  }, [etlReportResults, uploadPayload]);

  const handleDownloadBatchJson = () => {
    if (!etlReportResults) return;
    const exportData = {
      batch_id: `BATCH_${Date.now()}`,
      cedant: uploadPayload?.cedant?.name || 'Cedant',
      execution_timestamp: new Date().toISOString(),
      total_duration_sec: elapsedTimeSec,
      total_files: etlReportResults.length,
      total_rows: batchSummary?.totalRows || 0,
      files: etlReportResults
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LAPORAN_BATCH_ETL_${(uploadPayload?.cedant?.code || 'CEDANT').toUpperCase()}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const progressSteps = [
    { num: 1, label: 'Validasi Berkas & Pemetaan IPR', desc: 'Mencocokkan kolom sumber terhadap standar baku IPR', icon: <FileCheck className="w-4 h-4" /> },
    { num: 2, label: 'Sanitasi Vektorisasi Data', desc: 'Pembersihan teks mata uang, tanggal, dan format numerik', icon: <Zap className="w-4 h-4" /> },
    { num: 3, label: 'Sinkronisasi Skema DDL', desc: 'Membuat/menyesuaikan tabel fisik PostgreSQL', icon: <Server className="w-4 h-4" /> },
    { num: 4, label: 'Batch Stream Ingestion (COPY)', desc: 'Menyuntikkan data berkecepatan tinggi ke database', icon: <DatabaseZap className="w-4 h-4" /> },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-800">
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

      {/* STEP 3: EXECUTING WITH REAL-TIME PROGRESS BAR, CHECKLIST & LIVE STOPWATCH */}
      {currentStep === 'EXECUTING' && (
        <div className="bg-white p-10 md:p-14 rounded-3xl border border-slate-200 shadow-xl space-y-8 max-w-3xl mx-auto animate-in fade-in duration-200">
          
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
              <DatabaseZap className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Memproses & Memuat ke Database PostgreSQL
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Pipeline ETL sedang menstandarisasi data sesuai skema IPR dan menyuntikkan baris transaksi ke basis data.
            </p>

            {/* Live Stopwatch Counter Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-mono font-semibold shadow-2xs">
                <Timer className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Waktu Proses: {elapsedTimeSec} detik</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">{progressStatusText}</span>
              <span className="text-blue-600 font-mono text-sm">{progressPercent}%</span>
            </div>
            
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step-by-Step Pipeline Checklist */}
          <div className="space-y-3 pt-2">
            {progressSteps.map((step) => {
              const isDone = currentProgressStep > step.num || progressPercent === 100;
              const isCurrent = currentProgressStep === step.num && progressPercent < 100;

              return (
                <div 
                  key={step.num}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isDone 
                      ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900' 
                      : isCurrent
                      ? 'bg-blue-50/50 border-blue-300 text-blue-900 shadow-2xs'
                      : 'bg-slate-50/50 border-slate-200/60 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isDone 
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                        : isCurrent
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold">{step.label}</h4>
                      <p className="text-[11px] text-slate-500">{step.desc}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-medium shrink-0">
                    {isDone ? 'SELESAI' : isCurrent ? 'MEMPROSES...' : 'MENUNGGU'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONSOLIDATED BATCH REPORT */}
      {currentStep === 'SUCCESS' && batchSummary && (
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 space-y-8 shadow-xs animate-in fade-in duration-200">
          
          {/* Batch Summary Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Laporan Eksekusi Batch Bordero</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full">
                    100% SUKSES
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh {batchSummary.totalFiles} berkas bordero untuk {batchSummary.cedantName} berhasil distandarisasi dan dimuat ke PostgreSQL.
                </p>
              </div>
            </div>

            {/* Total Duration Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
              <Clock className="w-4 h-4 text-slate-500" />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Durasi</span>
                <span className="font-mono font-bold text-slate-800">{elapsedTimeSec} detik</span>
              </div>
            </div>
          </div>

          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
              <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wider">Total Berkas Batch</span>
              <p className="text-2xl font-bold text-blue-950">{batchSummary.totalFiles} Berkas</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
              <span className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">Total Baris Dimuat</span>
              <p className="text-2xl font-bold text-indigo-950 font-mono">{batchSummary.totalRows.toLocaleString('id-ID')} Baris</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Integritas Skema IPR</span>
              <p className="text-2xl font-bold text-emerald-950">Terstandarisasi</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
              <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">Rata-rata Waktu / Berkas</span>
              <p className="text-2xl font-bold text-amber-950 font-mono">
                {batchSummary.totalFiles > 0 ? (batchSummary.totalDurationMs / batchSummary.totalFiles).toFixed(0) : 0} ms
              </p>
            </div>
          </div>

          {/* Detailed Batch Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Rincian Berkas dalam Laporan Batch
              </h3>
              <span className="text-xs text-slate-400">1 Laporan Terkonsolidasi</span>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                    <th className="py-3.5 px-4">Nama Berkas / ID</th>
                    <th className="py-3.5 px-4">Tabel Fisik Target</th>
                    <th className="py-3.5 px-4">Periode</th>
                    <th className="py-3.5 px-4 text-center">Kolom IPR</th>
                    <th className="py-3.5 px-4 text-center">Kolom Ekstra</th>
                    <th className="py-3.5 px-4 text-right">Baris Dimuat</th>
                    <th className="py-3.5 px-4 text-right">Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {etlReportResults.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                        {uploadPayload?.files?.[i]?.name || r.file_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-700 font-semibold">{r.table_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{r.period}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-medium">
                          {r.ipr_mapped_count} Kolom
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-medium">
                          {r.non_ipr_added_count} Kolom
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 font-bold">
                        {r.total_rows_loaded?.toLocaleString('id-ID')} Baris
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {r.duration_ms ? `${r.duration_ms} ms` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Navigation Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDownloadBatchJson}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Unduh Ringkasan Laporan Batch (JSON)</span>
            </button>

            <div className="flex items-center gap-3">
              {batchSummary.hasFire && (
                <button
                  type="button"
                  onClick={() => navigate('/form/form-fire')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Lihat di Data Viewer Fire</span>
                </button>
              )}

              {batchSummary.hasCredit && (
                <button
                  type="button"
                  onClick={() => navigate('/form/form-kredit')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Lihat di Data Viewer Kredit</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setCurrentStep('UPLOAD')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Upload Batch Berkas Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}