import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  FileCode2, 
  Terminal, 
  AlertCircle,
  Database,
  Layers,
  Calendar,
  XCircle,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useSidebar } from '../../../components/context/SidebarContext';
import apiClient from '../../../utils/apiClient';

export default function EtlTerminalPage({ 
  files = [], 
  cedantCode, 
  cedantName, 
  uploadMode = 'batch',
  activityTitle = 'Upload Bordero Batch',
  onComplete,
  onCancel
}) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [processedSummary, setProcessedSummary] = useState(null);

  // State Modal Konfirmasi Batal ala GitHub
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelInputText, setCancelInputText] = useState('');

  const logEndRef = useRef(null);
  const hasStarted = useRef(false);
  const abortControllerRef = useRef(null);
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

    abortControllerRef.current = new AbortController();

    async function runExecution() {
      const startTime = new Date().toLocaleString('id-ID');
      const isSingle = uploadMode === 'single' || files.length === 1;

      addLog(`Inisialisasi pipeline ETL (${isSingle ? 'SINGLE MODE' : 'BATCH MODE'})...`, 'header');
      addLog(`Perusahaan Cedant : ${cedantName || cedantCode} [${cedantCode?.toUpperCase()}]`, 'info');
      addLog(`Jumlah Berkas    : ${files.length} Dokumen`, 'info');
      setProgress(10);

      // Siapkan payload terstruktur
      const payloadItems = files.map(f => {
        const targetTable = f.target_table || f.targetTable || null;
        
        return {
          file_id: f.file_id,
          tipe_proses: (f.category || 'premi').toLowerCase(),
          cedant: (cedantCode || 'tripakarta').toLowerCase(),
          target_sheet: f.selectedSheet || f.available_sheets?.[0] || 'Sheet1',
          kuartal: f.period || 'Q1',
          tahun: f.receivedDate || '2025',
          override_cob: f.cob || null,
          ...(targetTable ? { target_table: targetTable } : {}),
          deduplicate: false
        };
      });

      // Cetak Metadata Setiap Berkas ke Terminal
      payloadItems.forEach((item, idx) => {
        addLog(
          `[Item ${idx + 1}] File ID: ${item.file_id} | COB: ${item.override_cob || 'Auto'} | Periode: ${item.kuartal} ${item.tahun} | Sheet: "${item.target_sheet}"`,
          'file-ready',
          item
        );
        if (item.target_table) {
          addLog(`  ↳ Target Database: public."${item.target_table}"`, 'db-target');
        }
      });

      setProgress(25);

      try {
        let finalFilesReport = [];
        let totalInsertedRows = 0;

        if (isSingle) {
          const singlePayload = payloadItems[0];
          addLog(`Mengirim request eksekusi ke POST /api/v1/etl/process...`, 'process');
          addLog(`Memulai transformasi & validasi baris di server... Mohon tunggu.`, 'info');
          
          const response = await apiClient.post('/etl/process', singlePayload, {
            signal: abortControllerRef.current.signal
          });

          setProgress(90);

          if (response.data?.status === 'success') {
            const rows = response.data.detail?.total_rows_inserted || 0;
            const targetTableRes = response.data.detail?.target_table;
            totalInsertedRows = rows;
            addLog(`✓ Sukses: ${rows.toLocaleString('id-ID')} baris masuk ke tabel "${targetTableRes}".`, 'success');
            
            finalFilesReport.push({
              id: singlePayload.file_id,
              fileName: files[0]?.name || 'document.xlsx',
              sheet: singlePayload.target_sheet,
              cob: singlePayload.override_cob,
              period: `${singlePayload.kuartal} ${singlePayload.tahun}`,
              rows: rows,
              table: targetTableRes,
              status: 'success',
              logMessage: response.data.message
            });
          }
        } else {
          addLog(`Mengirim request batch (${payloadItems.length} berkas) ke POST /api/v1/etl/process-batch...`, 'process');
          addLog(`Memproses multi-sheet & insert bertahap...`, 'info');

          const response = await apiClient.post('/etl/process-batch', payloadItems, {
            signal: abortControllerRef.current.signal
          });

          setProgress(90);

          if (response.data?.status === 'completed') {
            response.data.batch_details?.forEach((detail, idx) => {
              const originalFile = files.find(f => f.file_id === detail.file_id) || files[idx];
              const isSuccess = detail.status === 'success';

              if (isSuccess) {
                totalInsertedRows += (detail.rows_inserted || 0);
                addLog(
                  `✓ [${detail.file_id}] Sheet "${detail.target_sheet}" ➔ Tabel "${detail.target_table}": ${detail.rows_inserted.toLocaleString('id-ID')} baris tersimpan.`,
                  'success'
                );
              } else {
                addLog(`✗ [${detail.file_id}] Gagal: ${detail.error_message}`, 'error');
              }

              finalFilesReport.push({
                id: detail.file_id,
                fileName: originalFile?.name || `File_${idx + 1}.xlsx`,
                sheet: detail.target_sheet,
                cob: originalFile?.cob,
                period: `${originalFile?.period || 'Q1'} ${originalFile?.receivedDate || '2025'}`,
                rows: detail.rows_inserted || 0,
                table: detail.target_table,
                status: detail.status,
                error: detail.error_message || null,
                logMessage: isSuccess 
                  ? `Berhasil diekstrak ke tabel "${detail.target_table}" (${detail.rows_inserted} baris).`
                  : `Gagal: ${detail.error_message}`
              });
            });
          }
        }

        const endTime = new Date().toLocaleString('id-ID');
        addLog(`Proses ETL tuntas tanpa kendala. Total ${totalInsertedRows.toLocaleString('id-ID')} baris siap diverifikasi!`, 'done');
        setProgress(100);
        setIsProcessing(false);
        setIsDone(true);

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
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          addLog(`⚠ Eksekusi ETL berhasil dibatalkan oleh pengguna.`, 'warn');
          setIsCancelled(true);
        } else {
          addLog(`✗ Terjadi kegagalan: ${error.response?.data?.detail || error.message}`, 'error');
        }
        setIsProcessing(false);
      }
    }

    runExecution();
  }, [files, cedantCode, cedantName, uploadMode, activityTitle]);

  // Handler Konfirmasi Pembatalan
  const handleConfirmCancel = () => {
    if (cancelInputText.trim() !== 'ABORT-PROCESS') return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setShowCancelModal(false);
  };

  return (
    <div className="w-full p-2 md:p-4 font-sans text-xs">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-7 shadow-xs space-y-5 w-full">
        
        {/* Header Terminal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Terminal className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800 text-sm">Terminal Eksekusi & Injeksi Database</h2>
                <span className="font-mono text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200 uppercase">
                  {cedantCode}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">Memvalidasi skema berkas mentah dan menyuntikkan data transaksi ke database.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Batal Eksekusi */}
            {isProcessing && (
              <button
                type="button"
                onClick={() => {
                  setCancelInputText('');
                  setShowCancelModal(true);
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Batalkan Proses</span>
              </button>
            )}

            <div className="flex items-center gap-2 font-mono font-bold text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-400">Progress:</span>
              <span className={isCancelled ? 'text-rose-600' : 'text-blue-600'}>
                {isCancelled ? 'BATAL' : `${progress}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Console Box Terminal */}
        <div className="bg-[#0D1117] text-slate-200 rounded-2xl p-5 h-96 overflow-y-auto space-y-2 font-mono text-[11px] custom-scrollbar w-full shadow-inner border border-slate-800">
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
                ) : log.type === 'warn' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                ) : log.type === 'file-ready' ? (
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                ) : log.type === 'db-target' ? (
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                ) : log.type === 'process' ? (
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <span className="text-slate-500 font-bold">&gt;</span>
                )}
              </span>

              <span className={`leading-relaxed ${
                log.type === 'done' ? 'text-emerald-300 font-bold' :
                log.type === 'success' ? 'text-slate-100' :
                log.type === 'error' ? 'text-rose-300 font-bold' :
                log.type === 'warn' ? 'text-amber-300 font-semibold' :
                log.type === 'file-ready' ? 'text-indigo-200 font-semibold' :
                log.type === 'db-target' ? 'text-cyan-300/80 font-mono text-[10.5px]' :
                log.type === 'process' ? 'text-amber-300 font-semibold' :
                log.type === 'header' ? 'text-blue-300 font-bold' :
                'text-slate-300'
              }`}>
                {log.text}
              </span>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-400 pt-3 font-sans font-semibold text-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Pipeline ETL sedang menyuntikkan data ke PostgreSQL, mohon tidak menutup jendela...</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${
                isCancelled ? 'bg-rose-500' : isDone ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${isCancelled ? 100 : progress}%` }}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 font-medium">
            {isDone ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Seluruh data transaksi telah ter-commit ke database.
              </span>
            ) : isCancelled ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Proses dibatalkan. Tidak ada data yang tersimpan.
              </span>
            ) : (
              <span>Sedang mengekstraksi dan memverifikasi baris data...</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isCancelled && (
              <button
                type="button"
                onClick={() => {
                  setIsSidebarBlocked(false);
                  onCancel?.();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
              >
                Kembali ke Upload
              </button>
            )}

            <button
              type="button"
              disabled={!isDone}
              onClick={() => {
                setIsSidebarBlocked(false);
                onComplete?.(processedSummary);
              }}
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

      {/* MODAL KONFIRMASI BATAL (GITHUB-STYLE VERIFICATION) */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Batalkan Proses ETL?</h3>
                <p className="text-[11px] text-slate-500">Koneksi ke database akan diputus dan pemrosesan dihentikan.</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 text-xs leading-relaxed">
                Ketik teks berikut untuk mengonfirmasi pembatalan: <br />
                <code className="bg-rose-50 text-rose-700 font-mono font-bold px-2 py-0.5 rounded border border-rose-200 select-all inline-block mt-1">
                  ABORT-PROCESS
                </code>
              </p>
              <input
                type="text"
                autoFocus
                value={cancelInputText}
                onChange={(e) => setCancelInputText(e.target.value)}
                placeholder="Ketik ABORT-PROCESS di sini..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-rose-500 transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer text-xs"
              >
                Lanjutkan Proses
              </button>
              <button
                type="button"
                disabled={cancelInputText.trim() !== 'ABORT-PROCESS'}
                onClick={handleConfirmCancel}
                className={`px-4 py-2 font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer ${
                  cancelInputText.trim() === 'ABORT-PROCESS'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Hentikan Sekarang
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}