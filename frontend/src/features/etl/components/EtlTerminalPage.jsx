import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useSidebar } from '../../../components/context/SidebarContext';

export default function EtlTerminalPage({ 
  files = [], 
  cedantCode, 
  cedantName, 
  onComplete 
}) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isDone, setIsDone] = useState(false);

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

  // PROSES ETL SIMULASI DETEKSI SHEET & HITUNG ROW BERTAHAP
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const fileList = files.length > 0 ? files : [
      { name: 'bordero_kredit_askrida_q1.xlsx', sheet: 'Premi_Kredit_2026' },
      { name: 'bordero_klaim_askrida_q1.xlsx', sheet: 'Klaim_Kredit_2026' }
    ];

    const formattedCedant = cedantCode 
      ? `${cedantName || ''} (${cedantCode})` 
      : (cedantName || 'PT Asuransi Askrida');

    // Inisialisasi Log Awal
    setLogs([
      { text: 'Memulai pipeline pengolahan data...', type: 'info' },
      { text: `Sistem mengonfirmasi sumber data dari ${formattedCedant}`, type: 'info' }
    ]);
    setProgress(10);

    let delayMultiplier = 1;

    // Loping Sekuensial per File & Sheet
    fileList.forEach((fileObj, fIdx) => {
      const fileName = fileObj.name || fileObj.rawFile?.name || `Berkas_${fIdx + 1}.xlsx`;
      const sheetName = fileObj.sheet || (fIdx === 0 ? 'Data_Premi' : 'Data_Klaim');
      const rowCount = fIdx === 0 ? 1245 : 850; // Jumlah row simulasi

      // Step 1: Membuka File
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { text: `Membaca berkas [${fIdx + 1}/${fileList.length}]: "${fileName}"...`, type: 'info' }
        ]);
        setProgress(Math.round(((fIdx + 0.3) / fileList.length) * 80) + 10);
      }, delayMultiplier * 800);

      delayMultiplier++;

      // Step 2: Menemukan Sheet
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { text: `   > Sheet dipilih & diekstrak: "${sheetName}"`, type: 'info' }
        ]);
        setProgress(Math.round(((fIdx + 0.6) / fileList.length) * 80) + 10);
      }, delayMultiplier * 800);

      delayMultiplier++;

      // Step 3: Jumlah Data Valid Berhasil Masuk
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { text: `   ✓ Berhasil menyeragamkan ${rowCount.toLocaleString('id-ID')} baris data valid ke skema IPR Master.`, type: 'success' }
        ]);
        setProgress(Math.round(((fIdx + 1) / fileList.length) * 80) + 10);
      }, delayMultiplier * 800);

      delayMultiplier++;
    });

    // Step Final: Selesai
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        { text: 'Proses pemrosesan data selesai! Seluruh data ter-uniform dan siap di-match ke Treaty.', type: 'done' }
      ]);
      setProgress(100);
      setIsProcessing(false);
      setIsDone(true);
    }, delayMultiplier * 850);

  }, [files, cedantCode, cedantName]);

  return (
    <div className="w-full p-4 font-sans text-xs">
      
      {/* CARD MINIMALIS FULL WIDE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-2xs space-y-4 w-full">
        
        {/* HEADER SIMPLE */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Pemrosesan & Standardisasi Data</h2>
            <p className="text-slate-400 text-[11px] mt-0.5">Sistem sedang mengekstrak sheet dan menyeragamkan baris data ke IPR Master.</p>
          </div>

          <div className="font-mono font-bold text-xs text-blue-600">
            {progress}%
          </div>
        </div>

        {/* AREA LOG STREAMING DENGAN HEIGHT PAS (h-72) */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 h-72 overflow-y-auto space-y-2.5 font-sans text-[11px] custom-scrollbar w-full">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2.5 animate-in fade-in duration-150">
              <div className="mt-1">
                {log.type === 'done' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : log.type === 'success' ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                )}
              </div>
              <span className={
                log.type === 'done' 
                  ? 'text-emerald-700 font-bold' 
                  : log.type === 'success'
                  ? 'text-slate-800 font-semibold'
                  : 'text-slate-600 font-medium'
              }>
                {log.text}
              </span>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-1.5 text-blue-600 pt-1 font-medium text-[11px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span className="text-slate-400">Memproses berkas & sheet...</span>
            </div>
          )}

          <div ref={logEndRef} />
        </div>

        {/* PROGRESS BAR DI BAWAH */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${
                isDone ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* FOOTER TOMBOL ACTION COMPACT */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={!isDone}
            onClick={() => {
              setIsSidebarBlocked(false);
              onComplete?.();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              isDone 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Lihat Data IPR & Match Treaty</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}