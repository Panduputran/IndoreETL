import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, ShieldCheck, RefreshCw, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserManagement() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'operator',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/list');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Gagal mengambil daftar pengguna:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.full_name.trim()) {
      setFormError('Semua kolom wajib diisi.');
      return;
    }

    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      await apiClient.post('/auth/register', formData);
      setFormSuccess(`Pengguna '${formData.username}' berhasil didaftarkan.`);
      setFormData({ username: '', email: '', full_name: '', password: '', role: 'operator' });
      fetchUsers();
      setTimeout(() => {
        setModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal mendaftarkan pengguna baru.';
      setFormError(detail);
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola akun pengguna, peran otorisasi, dan hak akses portal ETL IndonesiaRe.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-800">Daftar Akun Pengguna</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
              {users.length} Akun
            </span>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Nama Lengkap</th>
                <th className="py-3.5 px-5">Username</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5 text-center">Peran</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5">Dibuat Pada</th>
                <th className="py-3.5 px-5">Login Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 italic">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = currentUser?.username === u.username;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {u.full_name}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-normal">
                            Akun Anda
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                        {u.username}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">
                        {formatDate(u.last_login_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-800">Tambah Pengguna Baru</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-sm font-sans">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Operator"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  placeholder="Contoh: ahmad.op"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  placeholder="ahmad@indonesia-re.co.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Peran (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="operator">Operator (Upload & View Data)</option>
                  <option value="admin">Administrator (Akses Penuh)</option>
                  <option value="viewer">Viewer (Hanya Lihat)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
