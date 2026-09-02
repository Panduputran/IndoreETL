import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Layers, 
  Clock,
  Eye
} from 'lucide-react';
import { getHistoryLogs } from '../../api/borderoApi';
import { CEDANTS } from '../../constants/data';
import EtlDetailModal from './EtlDetailModal';

export default function HistoryView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // Modal State
  const [selectedDetailLog, setSelectedDetailLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter States
  const [selectedCedant, setSelectedCedant] = useState('ALL');
  const [selectedCob, setSelectedCob] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data dari database PostgreSQL
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        cedant: selectedCedant !== 'ALL' ? selectedCedant : undefined,
        cob: selectedCob !== 'ALL' ? selectedCob : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      };
      const response = await getHistoryLogs(params);
      if (response && response.status === 'success') {
        setLogs(response.data || []);
        setTotalPages(response.total_pages || 1);
        setTotalRows(response.total_rows || 0);
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat ETL dari PostgreSQL:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCedant, selectedCob, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Summary Metrics
  const successCount = logs.filter(l => l.status === 'success').length;
  const totalRowsLoaded = logs.reduce((acc, l) => acc + (Number(l.rows_inserted) || 0), 0);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const displayedLogs = logs.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.cedant_name && l.cedant_name.toLowerCase().includes(q)) ||
      (l.cedant_code && l.cedant_code.toLowerCase().includes(q)) ||
      (l.target_table && l.target_table.toLowerCase().includes(q)) ||
      (l.file_name && l.file_name.toLowerCase().includes(q)) ||
      (l.period && l.period.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Total Log Tercatat
            </span>
            <span className="text-2xl font-bold text-slate-900">{totalRows}</span>
            <span className="text-xs text-slate-400 block mt-0.5">di database PostgreSQL</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Proses Sukses
            </span>
            <span className="text-2xl font-bold text-emerald-600">{successCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">pada halaman aktif</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Baris Data Masuk
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {totalRowsLoaded.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">baris data termuat</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Status Audit
            </span>
            <span className="text-sm font-bold text-slate-800 block">Tersinkronisasi</span>
            <span className="text-xs text-emerald-600 block mt-0.5">PostgreSQL Logger</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200/60">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan cedant, tabel target, nama file, atau periode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedCedant}
              onChange={(e) => { setSelectedCedant(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Semua Cedant</option>
              {CEDANTS.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedCob}
              onChange={(e) => { setSelectedCob(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Semua COB</option>
              <option value="FIRE">FIRE</option>
              <option value="CREDIT">CREDIT</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="premi">PREMI</option>
              <option value="claim">KLAIM</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="success">Sukses</option>
              <option value="failed">Gagal</option>
            </select>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
              title="Muat Ulang"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Waktu</th>
                <th className="py-3.5 px-5">Cedant</th>
                <th className="py-3.5 px-5 text-center">Lini Bisnis</th>
                <th className="py-3.5 px-5 text-center">Kategori</th>
                <th className="py-3.5 px-5">Target Tabel</th>
                <th className="py-3.5 px-5 text-center">Periode</th>
                <th className="py-3.5 px-5 text-right">Baris Data</th>
                <th className="py-3.5 px-5 text-right">Durasi</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data riwayat...
                  </td>
                </tr>
              ) : displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 italic">
                    Belum ada riwayat aktivitas ETL yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                displayedLogs.map((log) => {
                  const isSuccess = (log.status || '').toLowerCase() === 'success';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {formatDate(log.executed_at)}
                      </td>

                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {log.cedant_name || log.cedant_code?.toUpperCase()}
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {log.cob}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium uppercase">
                          {log.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                        {log.target_table}
                      </td>

                      <td className="py-3.5 px-5 text-center text-slate-600 text-xs">
                        {log.period || '-'}
                      </td>

                      <td className="py-3.5 px-5 text-right font-mono text-slate-800">
                        {(Number(log.rows_inserted) || 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3.5 px-5 text-right text-slate-400 font-mono text-xs">
                        {log.duration_ms ? `${log.duration_ms} ms` : '-'}
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                          <span>{isSuccess ? 'Sukses' : 'Gagal'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDetailLog(log);
                            setIsDetailModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          title="Lihat Detail Eksekusi & Hasil Mapping"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            Halaman {page} dari {totalPages} ({totalRows} total entri)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <EtlDetailModal
        log={selectedDetailLog}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailLog(null);
        }}
      />
    </div>
  );
}