import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  FileCode2, 
  Terminal, 
  AlertCircle,
  Database,
  Layers
} from 'lucide-react';
import { useSidebar } from '../../../components/context/SidebarContext';
import { processFile, processBatch } from '../../../api/borderoApi';

export default function EtlTerminalPage({ 
  files = [], 
  cedantCode, 
  cedantName, 
  uploadMode = 'batch',
  activityTitle = 'Upload Bordero Batch',
  onComplete 
}) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [processedSummary, setProcessedSummary] = useState(null);

  const logEndRef = useRef(null);
  const hasStarted = useRef(false);
  const { setIsSidebarBlocked } = useSidebar();

  useEffect(() => {
    setIsSidebarBlocked(true);
    return () => setIsSidebarBlocked(false);
  }, [setIsSidebarBlocked]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (text, type = 'info', meta = null) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour12: false });
    setLogs(prev => [...prev, { text, type, timestamp, meta }]);
  };

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function runExecution() {
      const startTime = new Date().toLocaleString('id-ID');
      const isSingle = uploadMode === 'single' || files.length === 1;

      addLog(`Memulai ETL Pipeline (${isSingle ? 'SINGLE MODE' : 'BATCH MODE'})...`, 'header');
      addLog(`Cedant Terpilih: ${cedantName || cedantCode} [${cedantCode?.toUpperCase()}]`, 'info');
      addLog(`Total File dalam Antrean: ${files.length} Dokumen`, 'info');
      setProgress(15);

      // Siapkan payload terstandarisasi untuk backend
      const payloadItems = files.map(f => ({
        file_id: f.file_id,
        tipe_proses: f.category || 'premi',
        cedant: cedantCode || 'tripakarta',
        target_sheet: f.selectedSheet || f.available_sheets?.[0] || 'Sheet1',
        kuartal: f.period || 'Q1',
        tahun: f.receivedDate || '2025',
        override_cob: f.cob || null,
        deduplicate: false
      }));

      // Log awal per berkas
      files.forEach((f, idx) => {
        addLog(
          `[Antrean ${idx + 1}] ID: ${f.file_id} | ${f.name} (Sheet: "${f.selectedSheet || f.cob}")`,
          'file-ready',
          { file_id: f.file_id }
        );
      });

      setProgress(35);

      try {
        let finalFilesReport = [];
        let totalInsertedRows = 0;

        if (isSingle) {
          // ── SINGLE FILE EXECUTION ──
          addLog('Mengirim single payload ke endpoint: POST /api/v1/etl/process...', 'process');
          const singlePayload = payloadItems[0];
          const response = await processFile(singlePayload);

          setProgress(85);

          if (response.status === 'success') {
            const rows = response.detail?.total_rows_inserted || 0;
            totalInsertedRows = rows;
            addLog(`✓ [${singlePayload.file_id}] Sukses menginjeksi ${rows} baris ke tabel "${response.detail?.target_table}".`, 'success');
            
            finalFilesReport.push({
              id: singlePayload.file_id,
              fileName: files[0]?.name || 'document.xlsx',
              sheet: singlePayload.target_sheet,
              cob: singlePayload.override_cob || files[0]?.cob,
              rows: rows,
              status: 'success',
              table: response.detail?.target_table,
              logMessage: response.message || 'File processed successfully.'
            });
          } else {
            throw new Error(response.message || 'Gagal memproses file.');
          }
        } else {
          // ── BATCH MULTI-FILE EXECUTION ──
          addLog(`Mengirim batch ${payloadItems.length} payload ke: POST /api/v1/etl/process-batch...`, 'process');
          const response = await processBatch(payloadItems);

          setProgress(85);

          if (response.status === 'completed') {
            response.batch_details?.forEach((detail, idx) => {
              const originalFile = files.find(f => f.file_id === detail.file_id) || files[idx];
              const isSuccess = detail.status === 'success';

              if (isSuccess) {
                totalInsertedRows += (detail.rows_inserted || 0);
                addLog(`✓ [${detail.file_id}] Sheet "${detail.target_sheet}" sukses: ${detail.rows_inserted} baris tersimpan.`, 'success');
              } else {
                addLog(`✗ [${detail.file_id}] Gagal: ${detail.error_message}`, 'error');
              }

              finalFilesReport.push({
                id: detail.file_id,
                fileName: originalFile?.name || `File_${idx + 1}.xlsx`,
                sheet: detail.target_sheet || originalFile?.selectedSheet,
                cob: originalFile?.cob,
                rows: detail.rows_inserted || 0,
                status: detail.status,
                error: detail.error_message || null,
                logMessage: isSuccess 
                  ? `Berhasil diekstrak dari sheet "${detail.target_sheet}" (${detail.rows_inserted} baris).`
                  : `Gagal: ${detail.error_message}`
              });
            });
          }
        }

        const endTime = new Date().toLocaleString('id-ID');
        addLog('Pipeline ETL selesai dijalankan. Seluruh data transaksi siap di-review!', 'done');
        setProgress(100);
        setIsProcessing(false);
        setIsDone(true);

        // Kumpulkan data rangkuman untuk riwayat (History)
        setProcessedSummary({
          title: activityTitle,
          cedantCode: cedantCode?.toUpperCase(),
          cedantName: cedantName || cedantCode,
          period: `${files[0]?.period || 'Q1'} ${files[0]?.receivedDate || '2025'}`,
          startAt: startTime,
          completedAt: endTime,
          totalRows: totalInsertedRows,
          isBatch: !isSingle,
          files: finalFilesReport
        });

      } catch (error) {
        addLog(`Terjadi kesalahan sistem: ${error.response?.data?.detail || error.message}`, 'error');
        setIsProcessing(false);
      }
    }

    runExecution();
  }, [files, cedantCode, cedantName, uploadMode, activityTitle]);

  const handleFinish = () => {
    setIsSidebarBlocked(false);
    if (onComplete) {
      onComplete(processedSummary);
    }
  };

  return (
    <div className="w-full p-2 md:p-4 font-sans text-xs">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-7 shadow-xs space-y-5 w-full">
        
        {/* Header Terminal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Terminal className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>Terminal Eksekusi & Injeksi Database</span>
                <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                  {cedantCode?.toUpperCase()}
                </span>
              </h2>
              <p className="text-slate-400 text-[11px] mt-0.5">Pipeline sedang mengekstrak berkas mentah dan menyuntikkan data ke PostgreSQL.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono font-bold text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span className="text-slate-400">Progress:</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
        </div>

        {/* Console Log Area */}
        <div className="bg-[#0D1117] text-slate-200 rounded-2xl p-5 h-88 overflow-y-auto space-y-2.5 font-mono text-[11.5px] custom-scrollbar w-full shadow-inner border border-slate-800">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2.5 animate-in fade-in duration-100">
              <span className="text-slate-600 select-none text-[10px] pt-0.5">[{log.timestamp}]</span>
              
              <span className="shrink-0 mt-0.5">
                {log.type === 'done' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : log.type === 'success' ? (
                  <span className="text-emerald-400 font-bold">✔</span>
                ) : log.type === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : log.type === 'file-ready' ? (
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                ) : log.type === 'process' ? (
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <span className="text-slate-500 font-bold">&gt;</span>
                )}
              </span>

              <span className={`leading-relaxed ${
                log.type === 'done' ? 'text-emerald-300 font-bold' :
                log.type === 'success' ? 'text-slate-100' :
                log.type === 'error' ? 'text-rose-300 font-bold' :
                log.type === 'file-ready' ? 'text-indigo-200 font-semibold' :
                log.type === 'process' ? 'text-amber-300 font-semibold' :
                log.type === 'header' ? 'text-blue-300 font-bold' :
                'text-slate-300'
              }`}>
                {log.text}
              </span>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-400 pt-2 font-sans font-semibold text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Pipeline sedang berjalan, mohon jangan menutup peramban...</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${isDone ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-[11px] text-slate-400">
            {isDone ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Data berhasil terintegrasi penuh ke database.
              </span>
            ) : (
              <span>Menunggu seluruh transaksi diproses...</span>
            )}
          </div>

          <button
            type="button"
            disabled={!isDone}
            onClick={handleFinish}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              isDone 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:-translate-y-px' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Lihat Riwayat & Detail Batch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}