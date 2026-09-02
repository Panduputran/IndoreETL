import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  History,
  Building2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Layers, 
  Clock,
  Eye,
  User,
  Shield,
  Users,
  TrendingUp,
  Activity,
  FileCheck2,
  ChevronRight,
  Download,
  Filter,
  X,
  FileSpreadsheet,
  Check,
  ChevronDown,
  BarChart3,
  Server,
  Zap,
  Copy
} from 'lucide-react';
import { getHistoryLogs, getHistoryStatistics } from '../../api/borderoApi';
import { CEDANTS } from '../../constants/data';
import EtlDetailModal from './EtlDetailModal';

export default function HistoryView() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // Active View Tab: 'logs' | 'operator_recap'
  const [activeTab, setActiveTab] = useState('logs');

  // Modal State
  const [selectedDetailLog, setSelectedDetailLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter States
  const [selectedCedant, setSelectedCedant] = useState('ALL');
  const [selectedCob, setSelectedCob] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Statistik Keseluruhan & Aktivitas Operator
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getHistoryStatistics();
      if (res && res.status === 'success') {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil statistik riwayat:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch log riwayat dengan filter & paginasi
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
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefreshAll = () => {
    fetchStats();
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSelectedCedant('ALL');
    setSelectedCob('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setPage(1);
  };

  const isFiltered = selectedCedant !== 'ALL' || selectedCob !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || searchQuery.trim() !== '';

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return {
        date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  // Ekspor Log Riwayat ke CSV (UTF-8 BOM)
  const handleExportCsv = () => {
    if (!logs || logs.length === 0) {
      alert('Tidak ada data log riwayat untuk diekspor.');
      return;
    }

    const headers = [
      'ID',
      'Waktu Eksekusi',
      'Operator Pengunggah',
      'Peran (Role)',
      'Perusahaan Cedant',
      'Lini Bisnis (COB)',
      'Kategori',
      'Target Tabel PostgreSQL',
      'Periode',
      'Nama Berkas',
      'Baris Dimuat',
      'Durasi (ms)',
      'Status',
      'Pesan Error'
    ];

    const rows = logs.map((log) => [
      log.id,
      log.executed_at || '',
      `"${(log.uploaded_by || 'Administrator').replace(/"/g, '""')}"`,
      log.user_role || 'operator',
      `"${(log.cedant_name || log.cedant_code || '').replace(/"/g, '""')}"`,
      log.cob || '',
      log.category || '',
      log.target_table || '',
      `"${(log.period || '').replace(/"/g, '""')}"`,
      `"${(log.file_name || '').replace(/"/g, '""')}"`,
      log.rows_inserted || 0,
      log.duration_ms || 0,
      log.status || '',
      `"${(log.error_message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AUDIT_LOG_ETL_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const displayedLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(l => (
      (l.cedant_name && l.cedant_name.toLowerCase().includes(q)) ||
      (l.cedant_code && l.cedant_code.toLowerCase().includes(q)) ||
      (l.target_table && l.target_table.toLowerCase().includes(q)) ||
      (l.file_name && l.file_name.toLowerCase().includes(q)) ||
      (l.period && l.period.toLowerCase().includes(q)) ||
      (l.uploaded_by && l.uploaded_by.toLowerCase().includes(q)) ||
      (l.user_role && l.user_role.toLowerCase().includes(q))
    ));
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* 1. Header & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Audit Trail & Riwayat Aktivitas ETL</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Catatan historis seluruh proses transformasi data bordero, status pemuatan PostgreSQL, dan atribusi operator.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={loading || statsLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loading || statsLoading) ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Muat Ulang</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Unified Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Riwayat Eksekusi
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {stats?.total_runs ? stats.total_runs.toLocaleString('id-ID') : totalRows}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {stats?.failed_runs ? `${stats.failed_runs} proses gagal tercatat` : 'Seluruh proses tercatat'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Tingkat Keberhasilan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {stats?.success_rate !== undefined ? `${stats.success_rate}%` : '100%'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {stats?.success_runs || 0} Sukses
              </span>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              dari {stats?.total_runs || totalRows} total proses
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Baris Data Masuk
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {(stats?.total_rows_inserted || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              Tersimpan di tabel PostgreSQL
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Operator Terdaftar
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {stats?.total_operators || 1} Operator
            </span>
            <span className="text-xs text-blue-600 font-medium block mt-0.5">
              Atribusi Pengguna Terotentikasi
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. View Switcher Tabs (Segmented Control) */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Daftar Log Aktivitas</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            activeTab === 'logs' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {totalRows}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('operator_recap')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'operator_recap'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Rekapitulasi Operator & Cedant</span>
          {stats?.user_activity && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === 'operator_recap' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {stats.user_activity.length} User
            </span>
          )}
        </button>
      </div>

      {/* 4. TAB 1: LOG AKTIVITAS PIPELINE */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama cedant, operator pengunggah, tabel target, periode, atau nama berkas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCedant}
                  onChange={(e) => { setSelectedCedant(e.target.value); setPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="ALL">Semua Cedant</option>
                  {CEDANTS.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={selectedCob}
                  onChange={(e) => { setSelectedCob(e.target.value); setPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="ALL">Semua COB</option>
                  <option value="FIRE">FIRE</option>
                  <option value="CREDIT">CREDIT</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="premi">PREMI</option>
                  <option value="claim">KLAIM</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="success">Sukses</option>
                  <option value="failed">Gagal</option>
                </select>

                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Waktu Eksekusi</th>
                    <th className="py-3.5 px-4">Diunggah Oleh</th>
                    <th className="py-3.5 px-4">Perusahaan Cedant</th>
                    <th className="py-3.5 px-4 text-center">Lini Bisnis</th>
                    <th className="py-3.5 px-4 text-center">Kategori</th>
                    <th className="py-3.5 px-4">Target Tabel</th>
                    <th className="py-3.5 px-4 text-center">Periode</th>
                    <th className="py-3.5 px-4 text-right">Baris Data</th>
                    <th className="py-3.5 px-4 text-right">Durasi</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        <span>Memuat data riwayat aktivitas...</span>
                      </td>
                    </tr>
                  ) : displayedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-slate-400 italic">
                        Tidak ada riwayat aktivitas ETL yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    displayedLogs.map((log) => {
                      const isSuccess = (log.status || '').toLowerCase() === 'success';
                      const role = String(log.user_role || 'operator').toLowerCase();
                      const isAdmin = role === 'admin';
                      const uploaderName = log.uploaded_by || 'Administrator';
                      const formattedTime = formatDate(log.executed_at);

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          
                          {/* Waktu */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">{formattedTime.date}</span>
                            <span className="font-mono text-[11px] text-slate-400">{formattedTime.time}</span>
                          </td>

                          {/* Diunggah Oleh (RBAC) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isAdmin 
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                {uploaderName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800 block text-xs">
                                  {uploaderName}
                                </span>
                                <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded-full uppercase border ${
                                  isAdmin
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {role}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Cedant */}
                          <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            {log.cedant_name || log.cedant_code?.toUpperCase()}
                          </td>

                          {/* COB */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md font-semibold text-[11px] ${
                              log.cob === 'FIRE' 
                                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {log.cob}
                            </span>
                          </td>

                          {/* Kategori */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase">
                              {log.category}
                            </span>
                          </td>

                          {/* Target Tabel */}
                          <td className="py-3.5 px-4 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">
                            {log.target_table}
                          </td>

                          {/* Periode */}
                          <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-700 font-medium">
                            {log.period || '-'}
                          </td>

                          {/* Baris Data */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                            {(Number(log.rows_inserted) || 0).toLocaleString('id-ID')}
                          </td>

                          {/* Durasi */}
                          <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                            {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : '-'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                              <span>{isSuccess ? 'Sukses' : 'Gagal'}</span>
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDetailLog(log);
                                setIsDetailModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Lihat Detail Eksekusi & Pemetaan"
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
            <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <span>
                Menampilkan halaman <strong className="text-slate-800">{page}</strong> dari <strong className="text-slate-800">{totalPages}</strong> ({totalRows} total aktivitas)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: REKAPITULASI OPERATOR & CEDANT */}
      {activeTab === 'operator_recap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          
          {/* Operator Activity Table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Aktivitas Pengunggah / Operator (RBAC)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar operator yang mengeksekusi pipeline ETL dan volume data yang diproses.
                </p>
              </div>
            </div>

            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4 text-center">Peran</th>
                    <th className="py-3 px-4 text-right">Frekuensi Run</th>
                    <th className="py-3 px-4 text-right">Total Baris Dimuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(stats?.user_activity || []).map((u, idx) => {
                    const isAdmin = String(u.role).toLowerCase() === 'admin';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAdmin 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {u.uploader ? u.uploader.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span>{u.uploader}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                            isAdmin
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {u.role || 'operator'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {u.total_runs} Eksekusi
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-indigo-700">
                          {u.total_rows.toLocaleString('id-ID')} Baris
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Cedants Volume Ingestion */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Volume Data per Cedant</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  6 Perusahaan asuransi dengan volume data termuat terbesar.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(stats?.cedant_activity || []).map((c, idx) => {
                const maxRows = stats.cedant_activity[0]?.rows || 1;
                const percent = Math.min(100, Math.round((c.rows / maxRows) * 100));

                return (
                  <div key={idx} className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {c.cedant}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {c.rows.toLocaleString('id-ID')} Baris
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{c.runs} kali proses upload</span>
                      <span className="font-mono">{percent}% volume relatif</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Detail Modal */}
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