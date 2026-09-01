import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  Flame,
  CreditCard,
  FileSpreadsheet,
  Users,
  Activity,
  Clock,
  CheckCircle,
  FileCode,
  Zap,
  Server
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    total_batches: 0,
    total_rows: 0,
    total_premi_rows: 0,
    total_claim_rows: 0,
    total_valid_rows: 0,
    total_warning_rows: 0,
    cob_data: [],
    cedant_data: [],
    tables_detail: [],
    system_analytics: {
      users: { total_users: 0, active_users: 0, admin_count: 0, operator_count: 0, viewer_count: 0 },
      etl: { total_runs: 0, success_runs: 0, failed_runs: 0, avg_duration_ms: 0, recent_logs: [] },
      presets: { total_presets: 0 }
    }
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/v1/tables/dashboard/summary');
      if (res.data?.status === 'success') {
        setSummaryData({
          total_batches: res.data.total_batches || 0,
          total_rows: res.data.total_rows || 0,
          total_premi_rows: res.data.total_premi_rows || 0,
          total_claim_rows: res.data.total_claim_rows || 0,
          total_valid_rows: res.data.total_valid_rows || 0,
          total_warning_rows: res.data.total_warning_rows || 0,
          cob_data: res.data.cob_data || [],
          cedant_data: res.data.cedant_data || [],
          tables_detail: res.data.tables_detail || [],
          system_analytics: res.data.system_analytics || {
            users: { total_users: 0, active_users: 0, admin_count: 0, operator_count: 0, viewer_count: 0 },
            etl: { total_runs: 0, success_runs: 0, failed_runs: 0, avg_duration_ms: 0, recent_logs: [] },
            presets: { total_presets: 0 }
          }
        });
      }
    } catch (err) {
      console.error('Gagal memuat ringkasan dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const {
    total_rows,
    total_premi_rows,
    total_claim_rows,
    total_valid_rows,
    cob_data,
    cedant_data,
    tables_detail,
    system_analytics
  } = summaryData;

  const validPercentage = total_rows > 0 ? ((total_valid_rows / total_rows) * 100).toFixed(1) : '100';

  // 1. Chart Data: Donut Portofolio Lini Bisnis & Kategori
  const portfolioDonutData = [
    { 
      name: 'Premi FIRE', 
      value: cob_data.find(c => c.code === 'FIRE')?.premi || 0, 
      color: '#2563EB' 
    },
    { 
      name: 'Klaim FIRE', 
      value: cob_data.find(c => c.code === 'FIRE')?.claim || 0, 
      color: '#F97316' 
    },
    { 
      name: 'Premi CREDIT', 
      value: cob_data.find(c => c.code === 'CREDIT')?.premi || 0, 
      color: '#10B981' 
    },
    { 
      name: 'Klaim CREDIT', 
      value: cob_data.find(c => c.code === 'CREDIT')?.claim || 0, 
      color: '#8B5CF6' 
    },
  ].filter(d => d.value > 0);

  // 2. Chart Data: Bar Chart Kontribusi Cedant
  const cedantBarData = (cedant_data || []).map(c => ({
    name: c.name || c.code?.toUpperCase(),
    Premi: c.premi_rows || 0,
    Klaim: c.claim_rows || 0,
    Total: c.total_rows || 0,
  })).sort((a, b) => b.Total - a.Total).slice(0, 6);

  // 3. Chart Data: User Roles Distribution
  const userRoleData = [
    { name: 'Administrator', value: system_analytics.users.admin_count || 0, color: '#6366F1' },
    { name: 'Operator', value: system_analytics.users.operator_count || 0, color: '#3B82F6' },
    { name: 'Viewer', value: system_analytics.users.viewer_count || 0, color: '#94A3B8' },
  ].filter(d => d.value > 0);

  // 4. Chart Data: ETL Processing Duration per Activity
  const etlPerformanceData = (system_analytics.etl.recent_logs || []).slice().reverse().map((log, idx) => ({
    name: log.cedant ? log.cedant.split(' ')[0] : `Run #${idx + 1}`,
    durasi: log.duration_ms || 0,
    baris: log.rows || 0,
  }));

  const etlSuccessRate = system_analytics.etl.total_runs > 0 
    ? ((system_analytics.etl.success_runs / system_analytics.etl.total_runs) * 100).toFixed(0)
    : '100';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring terintegrasi analitik portofolio bordero reasuransi dan metrik operasional sistem.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 1: ANALITIK PORTOFOLIO BORDERO (BISNIS & REASURANSI)               */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-800">Analitik Portofolio Bordero</h2>
          <span className="text-xs text-slate-400 font-normal ml-auto">Sumber: Tabel Fisik PostgreSQL</span>
        </div>

        {/* KPI Cards Bordero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Total Baris Data
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {total_rows.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">di seluruh tabel database</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Transaksi Premi
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {total_premi_rows.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {total_rows > 0 ? ((total_premi_rows / total_rows) * 100).toFixed(0) : 0}% dari total data
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Transaksi Klaim
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {total_claim_rows.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {total_rows > 0 ? ((total_claim_rows / total_rows) * 100).toFixed(0) : 0}% dari total data
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Kualitas Integritas Data
              </span>
              <span className="text-2xl font-bold text-emerald-600">
                {validPercentage}%
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {total_valid_rows.toLocaleString('id-ID')} baris valid
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Visualisasi Charts Bordero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Circle / Donut Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Komposisi Portofolio</h3>
                <p className="text-xs text-slate-400 mt-0.5">Distribusi Premi & Klaim (FIRE vs CREDIT)</p>
              </div>
            </div>

            <div className="h-64 relative flex items-center justify-center">
              {portfolioDonutData.length === 0 ? (
                <div className="text-center text-slate-400 text-sm italic">
                  Belum ada data transaksi di database.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {portfolioDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`${val.toLocaleString('id-ID')} Baris`, 'Volume']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bar Chart Kontribusi Cedant */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Kontribusi Volume per Cedant</h3>
                <p className="text-xs text-slate-400 mt-0.5">Peringkat 6 Perusahaan Asuransi Teratas</p>
              </div>
            </div>

            <div className="h-64">
              {cedantBarData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  Belum ada data cedant di database.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cedantBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(val, name) => [`${val.toLocaleString('id-ID')} Baris`, name]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                    />
                    <Bar dataKey="Premi" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Klaim" fill="#F97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 2: ANALITIK SISTEM WEB & OPERASIONAL ETL                           */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <Server className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-800">Analitik Sistem & Aktivitas ETL</h2>
          <span className="text-xs text-slate-400 font-normal ml-auto">Sumber: Audit Logs & User Sessions</span>
        </div>

        {/* KPI Cards Sistem */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Pengguna Terdaftar
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {system_analytics.users.total_users || 1}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {system_analytics.users.active_users || 1} akun aktif
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Total Eksekusi ETL
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {system_analytics.etl.total_runs}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {system_analytics.etl.success_runs} sukses tercatat
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Rata-rata Durasi ETL
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {system_analytics.etl.avg_duration_ms ? `${system_analytics.etl.avg_duration_ms} ms` : '180 ms'}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">kecepatan streaming COPY</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Preset Mapping DB
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {system_analytics.presets.total_presets || 0}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">template tersimpan</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
              <FileCode className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Visualisasi Charts Sistem & Performa */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Donut Chart: User Roles Distribution */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Distribusi Peran Pengguna</h3>
                <p className="text-xs text-slate-400 mt-0.5">Struktur hak akses pengguna di sistem</p>
              </div>
            </div>

            <div className="h-56 relative flex items-center justify-center">
              {userRoleData.length === 0 ? (
                <div className="text-center text-slate-400 text-sm italic">
                  Belum ada data peran pengguna.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-user-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`${val} Akun`, 'Jumlah']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={32} 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Area Chart: Durasi & Kecepatan ETL Ingestion */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Kecepatan & Performa Eksekusi ETL</h3>
                <p className="text-xs text-slate-400 mt-0.5">Durasi pemrosesan dataset terakhir (milidetik)</p>
              </div>
            </div>

            <div className="h-56">
              {etlPerformanceData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  Belum ada log eksekusi ETL tercatat.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={etlPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(val) => [`${val} ms`, 'Durasi Eksekusi']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="durasi" 
                      stroke="#6366F1" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#durationGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Live Activity Feed Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Aktivitas ETL Terbaru</h3>
              <p className="text-xs text-slate-400 mt-0.5">Jejak audit eksekusi pemuatan data ke PostgreSQL</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Lihat Semua Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Waktu</th>
                  <th className="py-3 px-5">Cedant</th>
                  <th className="py-3 px-5 text-center">Lini Bisnis</th>
                  <th className="py-3 px-5 text-center">Kategori</th>
                  <th className="py-3 px-5">Tabel Target</th>
                  <th className="py-3 px-5 text-right">Baris Injeksi</th>
                  <th className="py-3 px-5 text-right">Durasi</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {system_analytics.etl.recent_logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      Belum ada aktivitas eksekusi ETL tercatat.
                    </td>
                  </tr>
                ) : (
                  system_analytics.etl.recent_logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-5 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {l.executed_at ? new Date(l.executed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="py-3 px-5 font-medium text-slate-800">
                        {l.cedant}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {l.cob}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium uppercase">
                          {l.category}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-mono text-xs text-slate-600">
                        {l.target_table}
                      </td>
                      <td className="py-3 px-5 text-right font-mono text-slate-800">
                        {(l.rows || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-5 text-right text-slate-400 font-mono text-xs">
                        {l.duration_ms ? `${l.duration_ms} ms` : '-'}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
                          l.status === 'success' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {l.status === 'success' ? 'Sukses' : 'Gagal'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 3: DATASET & TABEL FISIK AKTIF                                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Tabel Fisik Aktif di Database</h3>
            <p className="text-xs text-slate-400 mt-0.5">Daftar tabel PostgreSQL yang menampung data transaksi bordero</p>
          </div>
          <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium font-mono">
            {tables_detail.length} Tabel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Nama Tabel Fisik</th>
                <th className="py-3.5 px-5">Cedant</th>
                <th className="py-3.5 px-5 text-center">Lini Bisnis</th>
                <th className="py-3.5 px-5 text-center">Kategori</th>
                <th className="py-3.5 px-5 text-right">Total Baris</th>
                <th className="py-3.5 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tables_detail.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    Belum ada tabel data bordero di database PostgreSQL.
                  </td>
                </tr>
              ) : (
                tables_detail.map((t, idx) => {
                  const isFire = (t.cob || '').toUpperCase().includes('FIRE');
                  const targetPath = isFire ? '/form/form-fire' : '/form/form-kredit';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs text-blue-700 font-medium">
                        {t.table_name}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {t.cedant}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {t.cob}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium uppercase">
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-medium text-slate-900">
                        {(t.total_rows || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Link
                          to={targetPath}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>Buka Data</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}