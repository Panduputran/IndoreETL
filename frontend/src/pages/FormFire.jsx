import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Building2, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

// Data Dummy IPR FIRE Berdasarkan Transaksi Premi & Klaim Properti
const dummyFireBorderoData = [
  {
    id: 1,
    type: 'PREMIUM', // PREMIUM / KLAIM
    policyNumber: 'POL-FIRE-2026-001',
    claimReffNumber: '-',
    insuredName: 'PT Sentosa Jaya Abadi',
    cedantName: 'PT Asuransi Tripakarta',
    cob: 'FIRE',
    tsi100: 5000000000,
    occupation: 'Pabrik Tekstil / Ruko',
    location: 'Kab. Bogor, Jawa Barat (EQ Zone 3)',
    periodStart: '2026-01-01',
    periodEnd: '2027-01-01',
    premium100: 25000000,
    reindoSharePremium: 12500000,
    dateOfLoss: '-',
    claimAmountGross: 0,
    causeOfLoss: '-',
    status: 'Valid'
  },
  {
    id: 2,
    type: 'PREMIUM',
    policyNumber: 'POL-FIRE-2026-002',
    claimReffNumber: '-',
    insuredName: 'CV Abadi Makmur Industri',
    cedantName: 'PT Asuransi Central Asia (ACA)',
    cob: 'FIRE',
    tsi100: 1200000000,
    occupation: 'Gudang Logistik',
    location: 'Kawasan Industri Cikarang (EQ Zone 2)',
    periodStart: '2026-02-15',
    periodEnd: '2027-02-15',
    premium100: 6000000,
    reindoSharePremium: 3000000,
    dateOfLoss: '-',
    claimAmountGross: 0,
    causeOfLoss: '-',
    status: 'Valid'
  },
  {
    id: 3,
    type: 'KLAIM',
    policyNumber: 'POL-FIRE-2026-003',
    claimReffNumber: 'LKP-FIRE-2026-012',
    insuredName: 'PT Nusantara Megah Properti',
    cedantName: 'PT Asuransi Buana Independent',
    cob: 'FIRE',
    tsi100: 8500000000,
    occupation: 'Gedung Perkantoran / Mall',
    location: 'Jakarta Selatan (EQ Zone 4)',
    periodStart: '2026-03-01',
    periodEnd: '2027-03-01',
    premium100: 42500000,
    reindoSharePremium: 21250000,
    dateOfLoss: '2026-05-14',
    claimAmountGross: 1500000000,
    causeOfLoss: 'Korsleting Listrik Area Lt. 2',
    status: 'Valid'
  },
  {
    id: 4,
    type: 'KLAIM',
    policyNumber: 'POL-FIRE-2026-004',
    claimReffNumber: 'LKP-FIRE-2026-018',
    insuredName: 'PT Buana Utama Enterprise',
    cedantName: 'PT Asuransi Askrida',
    cob: 'FIRE',
    tsi100: 3000000000,
    occupation: 'Pabrik Makanan & Minuman',
    location: 'Surabaya, Jawa Timur (EQ Zone 3)',
    periodStart: '2026-04-10',
    periodEnd: '2027-04-10',
    premium100: 15000000,
    reindoSharePremium: 7500000,
    dateOfLoss: '2026-06-02',
    claimAmountGross: 450000000,
    causeOfLoss: 'Kebakaran Mesin Pengolahan',
    status: 'Warning'
  }
];

export default function FormFire() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'PREMIUM' | 'KLAIM'

  // Format IDR Currency
  const formatRupiah = (number) => {
    if (!number || number === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  };

  const filteredData = dummyFireBorderoData.filter(item => {
    const matchesSearch = 
      item.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.insuredName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cedantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.claimReffNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'PREMIUM') return matchesSearch && item.type === 'PREMIUM';
    if (filterType === 'KLAIM') return matchesSearch && item.type === 'KLAIM';
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-5 text-xs bg-slate-50 min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Treaty Management System</span>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 mt-0.5">
            <Building2 className="w-5 h-5 text-blue-600" />
            Bordero Data — COB FIRE (IPR Standard)
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Daftar seluruh data IPR Bordero Premi & Klaim terproses khusus Class of Business FIRE / Kebakaran Properti.
          </p>
        </div>

        <button className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer shrink-0">
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Cari No Polis, Tertanggung, Cedant, Okupasi, LKP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* Filter Type Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                filterType === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({dummyFireBorderoData.length})
            </button>
            <button
              onClick={() => setFilterType('PREMIUM')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                filterType === 'PREMIUM' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Premi Fire ({dummyFireBorderoData.filter(d => d.type === 'PREMIUM').length})
            </button>
            <button
              onClick={() => setFilterType('KLAIM')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                filterType === 'KLAIM' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Klaim Fire ({dummyFireBorderoData.filter(d => d.type === 'KLAIM').length})
            </button>
          </div>

        </div>

        {/* Table Container */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3 text-center">Tipe Transaksi</th>
                <th className="p-3">No. Polis</th>
                <th className="p-3">LKP / No. Klaim</th>
                <th className="p-3">Nama Tertanggung</th>
                <th className="p-3">Cedant / Reinsured</th>
                <th className="p-3 text-center">COB</th>
                <th className="p-3">Okupasi & Lokasi Properti</th>
                <th className="p-3">100% TSI</th>
                <th className="p-3">100% Premium</th>
                <th className="p-3">Nilai Klaim (Gross)</th>
                <th className="p-3">Penyebab Fire (DOL)</th>
                <th className="p-3 text-center">Status Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Tipe Transaksi Badge */}
                    <td className="p-3 text-center">
                      {item.type === 'PREMIUM' ? (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          PREMI
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          KLAIM
                        </span>
                      )}
                    </td>

                    {/* Policy Number */}
                    <td className="p-3 font-bold font-mono text-slate-800">
                      {item.policyNumber}
                    </td>

                    {/* Claim Reff / LKP */}
                    <td className="p-3 font-mono font-bold text-slate-600">
                      {item.claimReffNumber}
                    </td>

                    {/* Insured Name */}
                    <td className="p-3 font-bold text-slate-700">
                      {item.insuredName}
                    </td>

                    {/* Cedant Name */}
                    <td className="p-3 text-slate-600">
                      {item.cedantName}
                    </td>

                    {/* COB Badge */}
                    <td className="p-3 text-center">
                      <span className="bg-rose-50 text-rose-600 border border-rose-200/80 font-bold px-2 py-0.5 rounded text-[10px]">
                        {item.cob}
                      </span>
                    </td>

                    {/* Occupation & Location */}
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{item.occupation}</div>
                      <div className="text-[10px] text-slate-400">{item.location}</div>
                    </td>

                    {/* 100% TSI */}
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {formatRupiah(item.tsi100)}
                    </td>

                    {/* 100% Premium */}
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {formatRupiah(item.premium100)}
                    </td>

                    {/* Claim Amount Gross */}
                    <td className="p-3 font-mono font-bold text-rose-600">
                      {formatRupiah(item.claimAmountGross)}
                    </td>

                    {/* Cause of Loss & DOL */}
                    <td className="p-3">
                      {item.type === 'KLAIM' ? (
                        <div>
                          <div className="font-semibold text-slate-800">{item.causeOfLoss}</div>
                          <div className="text-[10px] text-slate-400 font-mono">DOL: {item.dateOfLoss}</div>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      {item.status === 'Valid' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-md text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-md text-[10px] border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Warning
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400">
                    Tidak ada data Bordero FIRE yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}