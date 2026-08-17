import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  Trash2,
  Edit,
  Plus,
  AlertCircle,
  X,
  Building2,
  ChevronDown,
  Filter,
  Check,
  Link2,
  CheckCircle
} from 'lucide-react';

const initialKreditBorderoData = [
  {
    id: 1,
    type: 'PREMIUM',
    cedantCode: 'CED-ASKRIDA',
    treatyCode: 'TRY-ASK-KRD-2026',
    policyNumber: 'POL-KRD-2026-001',
    claimReffNumber: '-',
    insuredBank: 'PT Bank Sumut Cab. Utama',
    debtorName: 'Ahmad Rizky Pratama',
    cob: 'KREDIT',
    plafond: 250000000,
    insuredAmount: 200000000,
    tenorMonth: 36,
    grossPremium: 3500000,
    claimAmountGross: 0,
    causeOfLoss: '-',
    dateOfLoss: '-',
    status: 'Valid'
  },
  {
    id: 2,
    type: 'PREMIUM',
    cedantCode: 'CED-ASKRIDA',
    treatyCode: 'Unbound', // <-- Contoh data Unbound dari hasil ETL
    policyNumber: 'POL-KRD-2026-002',
    claimReffNumber: '-',
    insuredBank: 'PT Bank Jateng Cab. Semarang',
    debtorName: 'Budi Santoso',
    cob: 'KREDIT',
    plafond: 500000000,
    insuredAmount: 400000000,
    tenorMonth: 60,
    grossPremium: 7000000,
    claimAmountGross: 0,
    causeOfLoss: '-',
    dateOfLoss: '-',
    status: 'Valid'
  },
  {
    id: 3,
    type: 'KLAIM',
    cedantCode: 'CED-JASINDO',
    treatyCode: 'Unbound', // <-- Contoh data Unbound dari hasil ETL
    policyNumber: 'POL-KRD-2026-003',
    claimReffNumber: 'LKP-ASK-2026-089',
    insuredBank: 'PT Bank BJB Cab. Bogor',
    debtorName: 'CV Karya Mandiri (Dedi)',
    cob: 'KREDIT',
    plafond: 0,
    insuredAmount: 120000000,
    tenorMonth: 0,
    grossPremium: 0,
    claimAmountGross: 85000000,
    causeOfLoss: 'Gagal Bayar / Menunggak > 90 Hari',
    dateOfLoss: '2026-09-20',
    status: 'Warning'
  }
];

export default function FormKredit() {
  const [dataList, setDataList] = useState(initialKreditBorderoData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); 
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  // State Notifikasi Toast Soft Minimalis
  const [toastMessage, setToastMessage] = useState(null);

  // State Custom Dropdown
  const [openTypeDropdown, setOpenTypeDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  
  const [formData, setFormData] = useState({
    id: null,
    type: 'PREMIUM',
    cedantCode: 'CED-ASKRIDA',
    treatyCode: 'TRY-ASK-KRD-2026',
    policyNumber: '',
    claimReffNumber: '',
    insuredBank: '',
    debtorName: '',
    cob: 'KREDIT',
    plafond: '',
    insuredAmount: '',
    tenorMonth: '',
    grossPremium: '',
    claimAmountGross: '',
    causeOfLoss: '',
    dateOfLoss: '',
    status: 'Valid'
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setOpenTypeDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setOpenStatusDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRupiah = (number) => {
    if (!number || number === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  };

  // FUNGSI SIMULASI INTERAKTIF MATCH TREATY CODE
  const handleBulkMatchTreaty = () => {
    const unboundCount = dataList.filter(d => d.treatyCode === 'Unbound' || d.treatyCode === '-').length;

    if (unboundCount === 0) {
      setToastMessage('Semua data sudah terikat (Linked) ke Treaty Code!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    // Ubah semua yang Unbound jadi TRY-ASK-KRD-2026 / TRY-JAS-KRD-2025
    setDataList(prev => prev.map(item => {
      if (item.treatyCode === 'Unbound' || item.treatyCode === '-') {
        const assignedCode = item.cedantCode === 'CED-JASINDO' ? 'TRY-JAS-KRD-2025' : 'TRY-ASK-KRD-2026';
        return { ...item, treatyCode: assignedCode };
      }
      return item;
    }));

    setToastMessage(`Berhasil mencocokkan ${unboundCount} data Unbound ke Treaty Code aktif!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setFormData({
      id: Date.now(),
      type: 'PREMIUM',
      cedantCode: 'CED-ASKRIDA',
      treatyCode: 'TRY-ASK-KRD-2026',
      policyNumber: '',
      claimReffNumber: '',
      insuredBank: '',
      debtorName: '',
      cob: 'KREDIT',
      plafond: '',
      insuredAmount: '',
      tenorMonth: '',
      grossPremium: '',
      claimAmountGross: '',
      causeOfLoss: '',
      dateOfLoss: '',
      status: 'Valid'
    });
    setModalMode('ADD');
  };

  const handleOpenEditModal = (item) => {
    setFormData({ ...item });
    setModalMode('EDIT');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const isPremi = formData.type === 'PREMIUM';
    const sanitizedData = {
      ...formData,
      policyNumber: formData.policyNumber?.trim() || 'POL-KRD-DRAFT',
      debtorName: formData.debtorName?.trim() || '-',
      insuredBank: formData.insuredBank?.trim() || '-',
      treatyCode: formData.treatyCode?.trim() || 'Unbound',
      insuredAmount: Number(formData.insuredAmount) || 0,
      
      // Khusus Premi
      plafond: isPremi ? (Number(formData.plafond) || 0) : 0,
      tenorMonth: isPremi ? (Number(formData.tenorMonth) || 0) : 0,
      grossPremium: isPremi ? (Number(formData.grossPremium) || 0) : 0,
      
      // Khusus Klaim
      claimReffNumber: !isPremi ? (formData.claimReffNumber?.trim() || 'LKP-DRAFT') : '-',
      claimAmountGross: !isPremi ? (Number(formData.claimAmountGross) || 0) : 0,
      causeOfLoss: !isPremi ? (formData.causeOfLoss?.trim() || '-') : '-',
      dateOfLoss: !isPremi ? (formData.dateOfLoss || '-') : '-'
    };

    if (modalMode === 'ADD') {
      setDataList([sanitizedData, ...dataList]);
    } else if (modalMode === 'EDIT') {
      setDataList(dataList.map(item => item.id === sanitizedData.id ? sanitizedData : item));
    }
    setModalMode(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setDataList(prev => prev.filter(item => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const filteredData = dataList.filter(item => {
    const matchesSearch = 
      item.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.insuredBank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cedantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.treatyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.claimReffNumber && item.claimReffNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const unboundCount = dataList.filter(d => d.treatyCode === 'Unbound' || d.treatyCode === '-').length;

  return (
    <div className="p-6 space-y-5 text-xs bg-slate-50 min-h-screen relative font-sans">
      
      {/* FLOATING TOAST NOTIFIKASI - CLEAN LIGHT SAAS THEME */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-white text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl border border-blue-100 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-bold text-xs text-slate-700">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 mt-0.5">
            <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Bordero Data - COB KREDIT (Askrida Standard)</span>
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Daftar seluruh data IPR Bordero Premi & Klaim terproses khusus Class of Business KREDIT.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* TOMBOL SIMULASI MATCH TREATY */}
          <button 
            type="button"
            onClick={handleBulkMatchTreaty}
            className={`flex items-center gap-1.5 font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer ${
              unboundCount > 0 
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse' 
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
            title="Klik untuk menghubungkan data Unbound ke Treaty Code secara otomatis"
          >
            <Link2 className="w-4 h-4 text-white" />
            <span>Match Treaty Code</span>
            {unboundCount > 0 && (
              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-md text-[10px] ml-1">
                {unboundCount}
              </span>
            )}
          </button>

          <button 
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>

          <button type="button" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer">
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        
        {/* Search & Filter Bar Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Cari Cedant, Treaty, No Polis, Debitur, LKP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* DROPDOWN FILTERS */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* DROPDOWN 1: TIPE TRANSAKSI */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setOpenTypeDropdown(!openTypeDropdown);
                  setOpenStatusDropdown(false);
                }}
                className={`flex items-center gap-2 bg-slate-50 border hover:bg-white text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-2xs cursor-pointer ${
                  openTypeDropdown ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white' : 'border-slate-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterType === 'ALL' && `Semua Tipe (${dataList.length})`}
                  {filterType === 'PREMIUM' && `Premi (${dataList.filter(d => d.type === 'PREMIUM').length})`}
                  {filterType === 'KLAIM' && `Klaim (${dataList.filter(d => d.type === 'KLAIM').length})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openTypeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {openTypeDropdown && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => { setFilterType('ALL'); setOpenTypeDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterType === 'ALL' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>Semua Tipe ({dataList.length})</span>
                    {filterType === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterType('PREMIUM'); setOpenTypeDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterType === 'PREMIUM' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Premi ({dataList.filter(d => d.type === 'PREMIUM').length})
                    </span>
                    {filterType === 'PREMIUM' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterType('KLAIM'); setOpenTypeDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterType === 'KLAIM' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Klaim ({dataList.filter(d => d.type === 'KLAIM').length})
                    </span>
                    {filterType === 'KLAIM' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* DROPDOWN 2: STATUS VALIDASI */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setOpenStatusDropdown(!openStatusDropdown);
                  setOpenTypeDropdown(false);
                }}
                className={`flex items-center gap-2 bg-slate-50 border hover:bg-white text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-2xs cursor-pointer ${
                  openStatusDropdown ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white' : 'border-slate-200'
                }`}
              >
                <span>
                  {filterStatus === 'ALL' && 'Semua Status'}
                  {filterStatus === 'Valid' && `Valid (${dataList.filter(d => d.status === 'Valid').length})`}
                  {filterStatus === 'Warning' && `Warning (${dataList.filter(d => d.status === 'Warning').length})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {openStatusDropdown && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => { setFilterStatus('ALL'); setOpenStatusDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === 'ALL' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>Semua Status</span>
                    {filterStatus === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterStatus('Valid'); setOpenStatusDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === 'Valid' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Valid ({dataList.filter(d => d.status === 'Valid').length})
                    </span>
                    {filterStatus === 'Valid' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterStatus('Warning'); setOpenStatusDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === 'Warning' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Warning ({dataList.filter(d => d.status === 'Warning').length})
                    </span>
                    {filterStatus === 'Warning' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* TABEL LENGKAP DENGAN SEMUA KOLOM IPR KREDIT */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs pb-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3 text-center">Tipe Transaksi</th>
                <th className="p-3">Cedant Code</th>
                <th className="p-3">Treaty Code</th>
                <th className="p-3">No. Polis</th>
                <th className="p-3">LKP / No. Klaim</th>
                <th className="p-3">Bank Tertanggung</th>
                <th className="p-3">Nama Debitur</th>
                <th className="p-3 text-center">COB</th>
                <th className="p-3">Plafond Kredit</th>
                <th className="p-3">Nilai Pertanggungan</th>
                <th className="p-3 text-center">Tenor</th>
                <th className="p-3">Gross Premium</th>
                <th className="p-3 text-center">Tgl Kejadian</th>
                <th className="p-3">Penyebab Kerugian</th>
                <th className="p-3">Nilai Klaim (Gross)</th>
                <th className="p-3 text-center">Status Data</th>
                <th className="p-3 text-center shrink-0">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Tipe Transaksi */}
                    <td className="p-3 text-center">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                        item.type === 'PREMIUM' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.type === 'PREMIUM' ? 'PREMI' : 'KLAIM'}
                      </span>
                    </td>

                    {/* Cedant Code */}
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {item.cedantCode || '-'}
                      </span>
                    </td>
                    
                    {/* Treaty Code (Simulasi Badge Unbound / Linked) */}
                    <td className="p-3">
                      {item.treatyCode && item.treatyCode !== '-' && item.treatyCode !== 'Unbound' ? (
                        <span className="font-mono font-bold text-blue-700 bg-blue-50/80 border border-blue-200 px-2 py-0.5 rounded text-[10px] animate-in zoom-in-95 duration-150">
                          {item.treatyCode}
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Unbound
                        </span>
                      )}
                    </td>

                    {/* Identitas Polis & Debitur */}
                    <td className="p-3 font-bold font-mono text-slate-800">{item.policyNumber}</td>
                    <td className="p-3 font-mono font-bold text-rose-700 bg-rose-50/20">{item.claimReffNumber || '-'}</td>
                    <td className="p-3 font-bold text-slate-700">{item.insuredBank}</td>
                    <td className="p-3 text-slate-800 font-semibold">{item.debtorName}</td>
                    
                    {/* COB */}
                    <td className="p-3 text-center">
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 font-bold px-2 py-0.5 rounded text-[10px]">
                        {item.cob}
                      </span>
                    </td>

                    {/* Kolom Finansial Premi */}
                    <td className="p-3 font-mono font-bold text-slate-800">{formatRupiah(item.plafond)}</td>
                    <td className="p-3 font-mono text-slate-700">{formatRupiah(item.insuredAmount)}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{item.tenorMonth > 0 ? `${item.tenorMonth} Bln` : '-'}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{formatRupiah(item.grossPremium)}</td>
                    
                    {/* Kolom Finansial Klaim */}
                    <td className="p-3 text-center font-mono text-slate-600">{item.dateOfLoss || '-'}</td>
                    <td className="p-3 text-slate-700 max-w-[180px] truncate" title={item.causeOfLoss}>
                      {item.causeOfLoss || '-'}
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-600">{formatRupiah(item.claimAmountGross)}</td>

                    {/* Status Data */}
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

                    {/* Aksi CRUD */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-blue-200"
                          title="Edit Data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-200"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={17} className="p-8 text-center text-slate-400 italic">
                    Tidak ada data Bordero KREDIT yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM (CREATE / EDIT) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {modalMode === 'ADD' ? 'Tambah Data Kredit' : 'Edit Data Kredit'}
              </h3>
              <button 
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              {/* Row 1: Cedant & Treaty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cedant Code (Opsional)</label>
                  <select
                    value={formData.cedantCode}
                    onChange={(e) => setFormData({ ...formData, cedantCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="CED-ASKRIDA">CED-ASKRIDA (Askrida)</option>
                    <option value="CED-JASINDO">CED-JASINDO (Jasindo)</option>
                    <option value="CED-TAKAFUL">CED-TAKAFUL (Takaful)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Treaty Code Binding (Opsional)</label>
                  <select
                    value={formData.treatyCode}
                    onChange={(e) => setFormData({ ...formData, treatyCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-blue-700 outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="TRY-ASK-KRD-2026">TRY-ASK-KRD-2026 (Aktif)</option>
                    <option value="TRY-JAS-KRD-2025">TRY-JAS-KRD-2025 (Aktif)</option>
                    <option value="Unbound">Unbound (Belum Linked)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Tipe Transaksi & Status Validasi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipe Transaksi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="PREMIUM">PREMI</option>
                    <option value="KLAIM">KLAIM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Validasi</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Valid" className="text-emerald-600 font-bold">Valid</option>
                    <option value="Warning" className="text-amber-600 font-bold">Warning / Error</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Polis & LKP Klaim */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">No. Polis (Opsional)</label>
                  <input
                    type="text"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    placeholder="POL-KRD-2026-xxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white"
                  />
                </div>

                {formData.type === 'KLAIM' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">LKP / No. Klaim (Opsional)</label>
                    <input
                      type="text"
                      value={formData.claimReffNumber}
                      onChange={(e) => setFormData({ ...formData, claimReffNumber: e.target.value })}
                      placeholder="LKP-ASK-2026-xxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-rose-600 outline-none focus:bg-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Debitur (Opsional)</label>
                    <input
                      type="text"
                      value={formData.debtorName}
                      onChange={(e) => setFormData({ ...formData, debtorName: e.target.value })}
                      placeholder="Nama Debitur"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Row 4: Bank & Sub Debitur (Jika Klaim) */}
              <div className="grid grid-cols-2 gap-3">
                {formData.type === 'KLAIM' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Debitur (Opsional)</label>
                    <input
                      type="text"
                      value={formData.debtorName}
                      onChange={(e) => setFormData({ ...formData, debtorName: e.target.value })}
                      placeholder="Nama Debitur"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white"
                    />
                  </div>
                )}

                <div className={formData.type === 'PREMIUM' ? 'col-span-2' : ''}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Tertanggung (Opsional)</label>
                  <input
                    type="text"
                    value={formData.insuredBank}
                    onChange={(e) => setFormData({ ...formData, insuredBank: e.target.value })}
                    placeholder="PT Bank xxx Cab..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* FIELD SPESIFIK INPUT PREMI */}
              {formData.type === 'PREMIUM' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Plafond (Rp)</label>
                    <input
                      type="number"
                      value={formData.plafond || ''}
                      onChange={(e) => setFormData({ ...formData, plafond: e.target.value })}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nilai Pertanggungan</label>
                    <input
                      type="number"
                      value={formData.insuredAmount || ''}
                      onChange={(e) => setFormData({ ...formData, insuredAmount: e.target.value })}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gross Premium</label>
                    <input
                      type="number"
                      value={formData.grossPremium || ''}
                      onChange={(e) => setFormData({ ...formData, grossPremium: e.target.value })}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-emerald-600 font-bold outline-none focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* FIELD SPESIFIK INPUT KLAIM */}
              {formData.type === 'KLAIM' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nilai Pertanggungan</label>
                      <input
                        type="number"
                        value={formData.insuredAmount || ''}
                        onChange={(e) => setFormData({ ...formData, insuredAmount: e.target.value })}
                        placeholder="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nilai Klaim Gross (Rp)</label>
                      <input
                        type="number"
                        value={formData.claimAmountGross || ''}
                        onChange={(e) => setFormData({ ...formData, claimAmountGross: e.target.value })}
                        placeholder="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-rose-600 font-bold outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tgl Kejadian (Date of Loss)</label>
                      <input
                        type="date"
                        value={formData.dateOfLoss || ''}
                        onChange={(e) => setFormData({ ...formData, dateOfLoss: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penyebab Kerugian</label>
                      <input
                        type="text"
                        value={formData.causeOfLoss}
                        onChange={(e) => setFormData({ ...formData, causeOfLoss: e.target.value })}
                        placeholder="Menunggak > 90 hari..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {modalMode === 'ADD' ? 'Simpan Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS DATA */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Hapus Data Kredit?</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                No. Polis: <strong className="text-slate-800 font-mono">{deleteTarget.policyNumber}</strong><br />
                Debitur: <strong className="text-slate-700">{deleteTarget.debtorName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}