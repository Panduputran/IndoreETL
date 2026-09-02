import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Database, 
  FileSpreadsheet, 
  Table2, 
  Layers, 
  Terminal, 
  Building2,
  Calendar,
  FileCode
} from 'lucide-react';

export default function EtlDetailModal({ log, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !log) return null;

  const isSuccess = (log.status || '').toLowerCase() === 'success';

  // Parse mapping config if available
  let parsedMapping = null;
  if (log.mapping_config) {
    try {
      parsedMapping = typeof log.mapping_config === 'string' 
        ? JSON.parse(log.mapping_config) 
        : log.mapping_config;
    } catch {
      parsedMapping = null;
    }
  }

  const iprMappings = parsedMapping?.ipr_mapping || {};
  const nonIprMappings = parsedMapping?.non_ipr_mapping || {};
  const iprEntries = Object.entries(iprMappings).filter(([_, v]) => Boolean(v));
  const nonIprEntries = Object.entries(nonIprMappings);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isSuccess 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Detail Eksekusi ETL #{log.id}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                  isSuccess 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {isSuccess ? 'Sukses' : 'Gagal'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {log.cedant_name || log.cedant_code?.toUpperCase()} • {log.target_table}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Header */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200/80 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ringkasan Eksekusi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mapping')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'mapping'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Hasil Pemetaan Kolom ({iprEntries.length + nonIprEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Log Teknis & Audit Trail
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* TAB 1: RINGKASAN EKSEKUSI */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Error Box if failed */}
              {!isSuccess && log.error_message && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Pesan Kesalahan Eksekusi:</span>
                  </div>
                  <p className="text-xs font-mono bg-white/70 p-2.5 rounded-xl border border-rose-200/80 text-rose-700 whitespace-pre-wrap">
                    {log.error_message}
                  </p>
                </div>
              )}

              {/* Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Baris Dimuat
                  </span>
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {(Number(log.rows_inserted) || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Durasi Proses
                  </span>
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {log.duration_ms ? `${log.duration_ms} ms` : '-'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Lini Bisnis (COB)
                  </span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {log.cob} - {String(log.category).toUpperCase()}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Periode Laporan
                  </span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {log.period || '-'}
                  </span>
                </div>
              </div>

              {/* Detail List */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="py-3 px-4 flex justify-between bg-white">
                  <span className="text-slate-500 font-medium">Nama Perusahaan Cedant</span>
                  <span className="text-slate-800 font-semibold">{log.cedant_name || log.cedant_code?.toUpperCase()}</span>
                </div>
                <div className="py-3 px-4 flex justify-between bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Target Tabel PostgreSQL</span>
                  <span className="font-mono text-blue-700 font-medium">{log.target_table}</span>
                </div>
                <div className="py-3 px-4 flex justify-between bg-white">
                  <span className="text-slate-500 font-medium">Nama Berkas Sumber</span>
                  <span className="font-mono text-slate-700 truncate max-w-sm">{log.file_name || '-'}</span>
                </div>
                <div className="py-3 px-4 flex justify-between bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Waktu Eksekusi</span>
                  <span className="font-mono text-slate-700">{formatDate(log.executed_at)}</span>
                </div>
                <div className="py-3 px-4 flex justify-between bg-white">
                  <span className="text-slate-500 font-medium">Ukuran Berkas</span>
                  <span className="font-mono text-slate-700">
                    {log.file_size_bytes ? `${(log.file_size_bytes / 1024).toFixed(1)} KB` : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HASIL PEMETAAN KOLOM */}
          {activeTab === 'mapping' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Kolom Standar IPR ({iprEntries.length} Terpetakan)
                </h4>
                {iprEntries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    Tidak ada catatan mapping kolom IPR pada eksekusi ini.
                  </p>
                ) : (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                          <th className="py-2.5 px-4">Field Database (IPR)</th>
                          <th className="py-2.5 px-4">Kolom Asli Excel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {iprEntries.map(([dbField, sourceCol], idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-semibold text-blue-700">{dbField}</td>
                            <td className="py-2.5 px-4 text-slate-800">{sourceCol}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {nonIprEntries.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    Kolom Tambahan Non-IPR ({nonIprEntries.length} Ekstra)
                  </h4>
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                          <th className="py-2.5 px-4">Kolom Asli Excel</th>
                          <th className="py-2.5 px-4">Target Field DB</th>
                          <th className="py-2.5 px-4">Tipe Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {nonIprEntries.map(([sourceCol, cfg], idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 text-slate-800">{sourceCol}</td>
                            <td className="py-2.5 px-4 text-indigo-700">{cfg.dbField || cfg}</td>
                            <td className="py-2.5 px-4 text-slate-500">{cfg.sqlType || 'TEXT'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOG TEKNIS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Output Log Pipeline:</span>
                <span className="text-[11px] font-mono text-slate-400">PostgreSQL Stream Ingestion</span>
              </div>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800 max-h-72">
                {log.technical_log ? (
                  <pre className="whitespace-pre-wrap font-mono">{log.technical_log}</pre>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-slate-400">
                    {`[INFO] Eksekusi ETL ID #${log.id}\n[INFO] Cedant: ${log.cedant_name || log.cedant_code}\n[INFO] Tabel Target: ${log.target_table}\n[INFO] Baris Masuk: ${log.rows_inserted}\n[INFO] Durasi: ${log.duration_ms || '-'} ms\n[STATUS] Selesai dengan status: ${log.status.toUpperCase()}`}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
