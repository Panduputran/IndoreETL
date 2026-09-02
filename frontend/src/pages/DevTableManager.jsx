import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  HardDrive, 
  ShieldAlert, 
  X,
  Flame,
  CreditCard,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { getDevPhysicalTables, dropPhysicalTable, dropAllDevPhysicalTables } from '../api/borderoApi';

export default function DevTableManager() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCob, setSelectedCob] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Modal states
  const [tableToDrop, setTableToDrop] = useState(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [isDropAllModalOpen, setIsDropAllModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDevPhysicalTables();
      const tableList = res?.tables || res?.data?.tables || (Array.isArray(res) ? res : []);
      setTables(tableList);
    } catch (err) {
      console.error('Gagal mengambil daftar tabel fisik:', err);
      showToast('error', 'Gagal memuat daftar tabel dari PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDropSingleTable = async () => {
    if (!tableToDrop) return;
    setActionLoading(true);
    try {
      await dropPhysicalTable(tableToDrop.table_name);
      showToast('success', `Tabel '${tableToDrop.table_name}' berhasil dihapus (dropped).`);
      setIsDropModalOpen(false);
      setTableToDrop(null);
      await fetchTables();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal menghapus tabel.';
      showToast('error', detail);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDropAllTables = async () => {
    setActionLoading(true);
    try {
      const res = await dropAllDevPhysicalTables();
      showToast('success', res.message || 'Seluruh tabel fisik bordero berhasil dibersihkan.');
      setIsDropAllModalOpen(false);
      await fetchTables();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal menghapus seluruh tabel.';
      showToast('error', detail);
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const totalTables = tables.length;
  const totalRows = tables.reduce((acc, t) => acc + (t.row_count || 0), 0);
  const totalBytes = tables.reduce((acc, t) => acc + (t.size_bytes || 0), 0);
  const totalSizePretty = totalBytes > 1024 * 1024 
    ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(totalBytes / 1024).toFixed(1)} KB`;

  const filteredTables = tables.filter((t) => {
    if (selectedCob !== 'ALL' && t.cob !== selectedCob) return false;
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.table_name.toLowerCase().includes(q) ||
        (t.cedant && t.cedant.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dev Tools: DB Table Manager
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-xs font-mono font-bold">
              DEV / TESTING
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen tabel fisik bordero PostgreSQL. Hapus atau reset tabel testing secara instan tanpa perlu membuka DBeaver.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTables}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Muat Ulang</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDropAllModalOpen(true)}
            disabled={tables.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Hapus Semua Tabel ({tables.length})</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
          toastMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Total Tabel Fisik
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{totalTables}</span>
            <span className="text-xs text-slate-400 block mt-0.5">di schema public</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Total Baris Data
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {totalRows.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">live tuples PostgreSQL</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Total Ukuran Disk
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{totalSizePretty}</span>
            <span className="text-xs text-slate-400 block mt-0.5">relational disk usage</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Mode Sandbox
            </span>
            <span className="text-sm font-bold text-emerald-600 block">Siap Testing</span>
            <span className="text-xs text-slate-400 block mt-0.5">Auto-ALTER & Drop Table</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Terminal className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama tabel fisik atau cedant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedCob}
            onChange={(e) => setSelectedCob(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua COB</option>
            <option value="FIRE">FIRE</option>
            <option value="CREDIT">CREDIT</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="PREMIUM">PREMIUM</option>
            <option value="KLAIM">KLAIM</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-medium tracking-wider">
                <th className="py-3.5 px-5">Nama Tabel Fisik</th>
                <th className="py-3.5 px-5">Perusahaan Cedant</th>
                <th className="py-3.5 px-5 text-center">Lini Bisnis</th>
                <th className="py-3.5 px-5 text-center">Kategori</th>
                <th className="py-3.5 px-5 text-right">Jumlah Baris</th>
                <th className="py-3.5 px-5 text-right">Ukuran Disk</th>
                <th className="py-3.5 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat daftar tabel fisik...
                  </td>
                </tr>
              ) : filteredTables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 italic">
                    Tidak ada tabel fisik bordero yang ditemukan di PostgreSQL.
                  </td>
                </tr>
              ) : (
                filteredTables.map((t) => (
                  <tr key={t.table_name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-medium text-blue-700">
                      {t.table_name}
                    </td>

                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      {t.cedant}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${
                        t.cob === 'FIRE'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {t.cob === 'FIRE' ? <Flame className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        <span>{t.cob}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium uppercase">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-900">
                      {(t.row_count || 0).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono text-slate-500">
                      {t.size_pretty || '-'}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setTableToDrop(t);
                          setIsDropModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        title={`Hapus tabel ${t.table_name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Drop Table</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE TABLE DROP CONFIRMATION MODAL */}
      {isDropModalOpen && tableToDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Tabel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Tabel:</span>
                <span className="font-mono font-bold text-rose-700">{tableToDrop.table_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Baris:</span>
                <span className="font-mono text-slate-800">{(tableToDrop.row_count || 0).toLocaleString('id-ID')} baris</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ukuran:</span>
                <span className="font-mono text-slate-800">{tableToDrop.size_pretty}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsDropModalOpen(false); setTableToDrop(null); }}
                disabled={actionLoading}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDropSingleTable}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Menghapus...' : 'Ya, Hapus Tabel Ini'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DROP ALL PHYSICAL TABLES MODAL */}
      {isDropAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Seluruh Tabel Bordero?</h3>
                <p className="text-xs text-rose-600 font-medium mt-0.5">Reset Total Seluruh Dataset Uji Coba</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-4 rounded-2xl border border-rose-200/60">
              Apakah Anda yakin ingin menghapus <strong>seluruh {tables.length} tabel fisik bordero</strong> di PostgreSQL? Seluruh data transaksi akan dihapus bersih untuk keperluan pengujian ulang. Tabel sistem (akun & log) akan tetap aman.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDropAllModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDropAllTables}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Menghapus Semua...' : 'Ya, Hapus Semua Tabel Fisik'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
