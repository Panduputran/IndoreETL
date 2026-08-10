import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  AlertCircle
} from 'lucide-react';

// Data Dummy IPR KREDIT Berdasarkan Format IPR Kredit Askrida (Premi & Klaim)
const dummyKreditBorderoData = [
  {
    id: 1,
    type: 'PREMIUM', // PREMIUM / KLAIM
    policyNumber: 'POL-KRD-2016-001',
    claimReffNumber: '-',
    insuredBank: 'PT Bank Sumut Cab. Utama',
    debtorName: 'Ahmad Rizky Pratama',
    cob: 'KREDIT',
    plafond: 250000000,
    insuredAmount: 200000000,
    tenorMonth: 36,
    periodStart: '2016-10-01',
    periodEnd: '2019-10-01',
    grossPremium: 3500000,
    reindoSharePremium: 1750000,
    dateOfLoss: '-',
    causeOfLoss: '-',
    claimAmountGross: 0,
    collectability: '1 (Lancar)',
    status: 'Valid'
  },
  {
    id: 2,
    type: 'PREMIUM',
    policyNumber: 'POL-KRD-2016-002',
    claimReffNumber: '-',
    insuredBank: 'PT Bank Jateng Cab. Semarang',
    debtorName: 'Budi Santoso',
    cob: 'KREDIT',
    plafond: 500000000,
    insuredAmount: 400000000,
    tenorMonth: 60,
    periodStart: '2016-11-15',
    periodEnd: '2021-11-15',
    grossPremium: 7000000,
    reindoSharePremium: 3500000,
    dateOfLoss: '-',
    causeOfLoss: '-',
    claimAmountGross: 0,
    collectability: '1 (Lancar)',
    status: 'Valid'
  },
  {
    id: 3,
    type: 'KLAIM',
    policyNumber: 'POL-KRD-2016-003',
    claimReffNumber: 'LKP-ASK-2016-089',
    insuredBank: 'PT Bank BJB Cab. Bogor',
    debtorName: 'CV Karya Mandiri (Dedi)',
    cob: 'KREDIT',
    plafond: 150000000,
    insuredAmount: 120000000,
    tenorMonth: 24,
    periodStart: '2016-01-10',
    periodEnd: '2018-01-10',
    grossPremium: 2100000,
    reindoSharePremium: 1050000,
    dateOfLoss: '2016-09-20',
    causeOfLoss: 'Gagal Bayar / Menunggak > 90 Hari',
    claimAmountGross: 85000000,
    collectability: '5 (Macet)',
    status: 'Valid'
  },
  {
    id: 4,
    type: 'KLAIM',
    policyNumber: 'POL-KRD-2016-004',
    claimReffNumber: 'LKP-ASK-2016-102',
    insuredBank: 'PT Bank DKI Cab. Juanda',
    debtorName: 'Siti Rahmawati',
    cob: 'KREDIT',
    plafond: 300000000,
    insuredAmount: 240000000,
    tenorMonth: 48,
    periodStart: '2016-03-01',
    periodEnd: '2020-03-01',
    grossPremium: 4200000,
    reindoSharePremium: 2100000,
    dateOfLoss: '2016-11-05',
    causeOfLoss: 'Debitur Usaha Bangkrut',
    claimAmountGross: 195000000,
    collectability: '5 (Macet)',
    status: 'Warning'
  }
];

export default function FormKredit() {
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

  const filteredData = dummyKreditBorderoData.filter(item => {
    const matchesSearch = 
      item.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.insuredBank.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <CreditCard className="w-5 h-5 text-blue-600" />
            Bordero Data — COB KREDIT (Askrida Standard)
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Daftar seluruh data IPR Bordero Premi & Klaim terproses khusus Class of Business KREDIT / Pembiayaan Bank.
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
              placeholder="Cari No Polis, Debitur, Bank Tertanggung, LKP..."
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
              Semua ({dummyKreditBorderoData.length})
            </button>
            <button
              onClick={() => setFilterType('PREMIUM')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                filterType === 'PREMIUM' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Premi Kredit ({dummyKreditBorderoData.filter(d => d.type === 'PREMIUM').length})
            </button>
            <button
              onClick={() => setFilterType('KLAIM')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                filterType === 'KLAIM' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Klaim Kredit ({dummyKreditBorderoData.filter(d => d.type === 'KLAIM').length})
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
                <th className="p-3">Bank Tertanggung</th>
                <th className="p-3">Nama Debitur</th>
                <th className="p-3 text-center">COB</th>
                <th className="p-3">Plafond Kredit</th>
                <th className="p-3">Nilai Pertanggungan</th>
                <th className="p-3 text-center">Tenor</th>
                <th className="p-3">Gross Premium</th>
                <th className="p-3">Nilai Klaim (Gross)</th>
                <th className="p-3">Penyebab Loss (DOL)</th>
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

                    {/* Insured Bank */}
                    <td className="p-3 font-bold text-slate-700">
                      {item.insuredBank}
                    </td>

                    {/* Debtor Name */}
                    <td className="p-3 text-slate-800 font-semibold">
                      {item.debtorName}
                    </td>

                    {/* COB Badge */}
                    <td className="p-3 text-center">
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 font-bold px-2 py-0.5 rounded text-[10px]">
                        {item.cob}
                      </span>
                    </td>

                    {/* Plafond Kredit */}
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {formatRupiah(item.plafond)}
                    </td>

                    {/* Nilai Pertanggungan */}
                    <td className="p-3 font-mono text-slate-700">
                      {formatRupiah(item.insuredAmount)}
                    </td>

                    {/* Tenor Month */}
                    <td className="p-3 text-center font-mono text-slate-600">
                      {item.tenorMonth} Bln
                    </td>

                    {/* Gross Premium */}
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {formatRupiah(item.grossPremium)}
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
                  <td colSpan={13} className="p-8 text-center text-slate-400">
                    Tidak ada data Bordero KREDIT yang cocok dengan pencarian.
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