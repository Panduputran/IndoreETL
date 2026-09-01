import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, 
  Download, 
  Building2, 
  RefreshCw, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Check,
  DatabaseZap,
  FolderOpen,
  Calendar,
  Layers,
  FileSpreadsheet,
  X,
  FileDown,
  Info
} from 'lucide-react';

export default function FormFire() {
  // Master Cedant untuk COB Fire
  const fireCedants = [
    { code: 'ALL', name: 'Semua Cedant', is_all: true },
    { code: 'askrida', name: 'PT Asuransi Bangun Askrida (Askrida)', prefix_premi: 'premi_askrida_fire', prefix_claim: 'claim_askrida_fire' },
    { code: 'aca', name: 'PT Asuransi Central Asia (ACA)', prefix_premi: 'premi_aca_fire', prefix_claim: 'claim_aca_fire' },
    { code: 'tripakarta', name: 'PT Asuransi Tri Pakarta (Tripakarta)', prefix_premi: 'premi_tripakarta_fire', prefix_claim: 'claim_tripakarta_fire' },
    { code: 'buanaindependent', name: 'PT Asuransi Buana Independent (Buana Independent)', prefix_premi: 'premi_buanaindependent_fire', prefix_claim: 'claim_buanaindependent_fire' },
  ];

  // State Pilihan Cedant & Tipe (PREMIUM / KLAIM)
  const [selectedCedant, setSelectedCedant] = useState('ALL');
  const [selectedType, setSelectedType] = useState('PREMIUM'); // 'PREMIUM' | 'KLAIM'

  const [openCedantDropdown, setOpenCedantDropdown] = useState(false);
  const cedantDropdownRef = useRef(null);

  // State Filter Status Validasi
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'VALID' | 'WARNING'
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);

  // State Filter Periode Dinamis
  const [periodList, setPeriodList] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('ALL');
  const [openPeriodDropdown, setOpenPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef(null);

  // State Data & Table
  const [columns, setColumns] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isTableExists, setIsTableExists] = useState(true);
  const [isAggregateView, setIsAggregateView] = useState(true);
  const [targetTablesCount, setTargetTablesCount] = useState(0);

  // State Paginasi
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [warningTotal, setWarningTotal] = useState(0);
  const [validTotal, setValidTotal] = useState(0);

  // State Modal Export
  const [openExportModal, setOpenExportModal] = useState(false);
  const [exportScope, setExportScope] = useState('CURRENT_PAGE'); // 'CURRENT_PAGE' | 'ALL_DATA'
  const [isExporting, setIsExporting] = useState(false);

  // Menentukan tabel target aktif berdasarkan selectedCedant dan selectedType
  const currentTableName = useMemo(() => {
    if (selectedCedant === 'ALL') {
      return selectedType === 'PREMIUM' ? 'all_premi_fire' : 'all_claim_fire';
    }
    const found = fireCedants.find(c => c.code === selectedCedant);
    if (found) {
      return selectedType === 'PREMIUM' ? found.prefix_premi : found.prefix_claim;
    }
    return selectedType === 'PREMIUM' ? `premi_${selectedCedant}_fire` : `claim_${selectedCedant}_fire`;
  }, [selectedCedant, selectedType]);

  // Kata kunci kolom wajib utama
  const mandatoryKeywords = [
    'policy', 'polis', 'insured', 'name', 
    'tsi', 'sum_insured', 'premium', 'premi', 'gross_premium',
    'claim_no', 'claim_number', 'claim_amount', 'reinsurance_claim',
    'cause_of_loss', 'cause', 'penyebab',
    'date_of_loss', 'dol', 'loss_date', 'period_of_insurance_start',
    'period_of_insurance_end', 'start_period', 'end_period'
  ];

  // Kolom opsional yang dikecualikan
  const exactExcludedColumns = new Set([
    'no', 'id', 'remarks', 'unnamed', 'notes', 'object_info_1', 'object_info_2',
    'treaty_id', 'treaty_year', 'reinsurer_id', 'claim_event',
    'start_period_master_policy', 'our_share_percent', 'reinsurer_share_percent',
    'created_at', 'period', 'cedant_name'
  ]);

  const excludedSubstrings = [
    'spl', 'surplus', 'share_spl', 'share_qs', 'others', 'spreading',
    'breakdown', 'mb', 'stock', 'tpl', 'bi'
  ];

  // 1. Ambil daftar periode unik
  const fetchPeriodList = async (tableName) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/tables/${tableName}/periods`);
      if (response.data.status === 'success') {
        setPeriodList(response.data.periods || []);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar periode:', err);
      setPeriodList([]);
    }
  };

  // 2. Fetch data tabel
  const fetchFireData = async (
    tableName, 
    targetPage = 1, 
    currentLimit = limit, 
    currentStatus = filterStatus,
    currentPeriod = filterPeriod
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/tables/${tableName}/data`, {
        params: {
          page: targetPage,
          limit: currentLimit,
          status: currentStatus,
          period: currentPeriod
        }
      });

      if (response.data.status === 'empty') {
        setIsTableExists(false);
        setIsAggregateView(response.data.is_aggregate || false);
        setTargetTablesCount(0);
        setDataList([]);
        setColumns([]);
        setTotalRows(0);
        setWarningTotal(0);
        setValidTotal(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      if (response.data.status === 'success') {
        setIsTableExists(true);
        setIsAggregateView(response.data.is_aggregate || false);
        setTargetTablesCount(response.data.target_tables_count || 1);
        setColumns(response.data.columns || []);
        setDataList(response.data.data || []);
        setTotalRows(response.data.total_rows || 0);
        setWarningTotal(response.data.warning_total || 0);
        setValidTotal(response.data.valid_total || 0);
        setTotalPages(response.data.total_pages || 1);
        setPage(response.data.page || 1);
      }
    } catch (err) {
      console.error('Gagal mengambil data Fire dari database:', err);
      setIsTableExists(false);
      setDataList([]);
      setColumns([]);
      setTotalRows(0);
      setWarningTotal(0);
      setValidTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodList(currentTableName);
    setFilterPeriod('ALL');
  }, [currentTableName]);

  useEffect(() => {
    fetchFireData(currentTableName, page, limit, filterStatus, filterPeriod);
  }, [currentTableName, page, limit, filterStatus, filterPeriod]);

  // Click outside listener untuk dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (cedantDropdownRef.current && !cedantDropdownRef.current.contains(event.target)) {
        setOpenCedantDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setOpenStatusDropdown(false);
      }
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
        setOpenPeriodDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCedantChange = (cedantCode) => {
    setSelectedCedant(cedantCode);
    setOpenCedantDropdown(false);
    setPage(1);
  };

  const handleTypeChange = (typeVal) => {
    setSelectedType(typeVal);
    setPage(1);
  };

  const handleStatusChange = (newStatus) => {
    setFilterStatus(newStatus);
    setOpenStatusDropdown(false);
    setPage(1);
  };

  const handlePeriodChange = (newPeriod) => {
    setFilterPeriod(newPeriod);
    setOpenPeriodDropdown(false);
    setPage(1);
  };

  // Logika Eksekusi Ekspor Data
  const executeExport = async () => {
    setIsExporting(true);
    try {
      let exportRows = [];
      let exportCols = columns;

      if (exportScope === 'CURRENT_PAGE') {
        exportRows = dataList;
      } else {
        // Ambil seluruh data terfilter dari backend
        const response = await axios.get(`http://localhost:8000/api/v1/tables/${currentTableName}/data`, {
          params: {
            page: 1,
            limit: 100000,
            status: filterStatus,
            period: filterPeriod
          }
        });
        if (response.data.status === 'success') {
          exportRows = response.data.data || [];
          exportCols = response.data.columns || columns;
        }
      }

      if (exportRows.length === 0) {
        alert('Tidak ada baris data untuk diekspor.');
        setIsExporting(false);
        setOpenExportModal(false);
        return;
      }

      // Bangun konten CSV dengan UTF-8 BOM agar kompatibel dengan Excel tanpa merusak karakter/angka
      const headers = exportCols.join(',');
      const rows = exportRows.map(row => 
        exportCols.map(col => {
          let val = row[col];
          if (val === null || val === undefined) val = '';
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        }).join(',')
      );

      const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      const cedantLabel = selectedCedant === 'ALL' ? 'SEMUA_CEDANT' : selectedCedant.toUpperCase();
      const typeLabel = selectedType === 'PREMIUM' ? 'PREMI' : 'KLAIM';
      const periodLabel = filterPeriod === 'ALL' ? 'SEMUA_PERIODE' : filterPeriod.replace(/\s+/g, '_');
      const scopeLabel = exportScope === 'CURRENT_PAGE' ? `HAL_${page}` : 'ALL';
      
      link.setAttribute('download', `BORDERO_FIRE_${cedantLabel}_${typeLabel}_${periodLabel}_${scopeLabel}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setOpenExportModal(false);
    } catch (err) {
      console.error('Gagal mengekspor data:', err);
      alert('Terjadi kesalahan saat memproses ekspor data.');
    } finally {
      setIsExporting(false);
    }
  };

  // Evaluasi kolom kosong untuk baris yang sedang tampil
  const processedData = useMemo(() => {
    if (!isTableExists) return [];
    return dataList.map((row) => {
      const missingFields = [];

      columns.forEach((col) => {
        const colLower = String(col).toLowerCase().trim();
        const isExcluded = exactExcludedColumns.has(colLower) || excludedSubstrings.some(sub => colLower.includes(sub));
        const isMandatory = mandatoryKeywords.some(kw => colLower === kw || colLower.includes(kw)) && !isExcluded;

        const val = row[col];
        const isNullOrEmpty = (
          val === null ||
          val === undefined ||
          String(val).trim() === '' ||
          String(val).toLowerCase() === 'nan' ||
          String(val).toLowerCase() === '<na>' ||
          String(val).toLowerCase() === 'none' ||
          String(val).toLowerCase() === 'null'
        );

        if (isMandatory && isNullOrEmpty) {
          missingFields.push(col);
        }
      });

      return {
        ...row,
        _status: missingFields.length > 0 ? 'WARNING' : 'VALID',
        _missingFields: missingFields
      };
    });
  }, [dataList, columns, isTableExists]);

  const filteredData = processedData.filter((item) => {
    if (!searchQuery.trim()) return true;
    return Object.values(item).some((val) => 
      String(val || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeCedantObj = fireCedants.find(c => c.code === selectedCedant) || { name: selectedCedant };

  return (
    <div className="p-6 space-y-5 text-xs bg-slate-50 min-h-screen relative font-sans">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 mt-0.5">
            <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Bordero Data - COB Fire</span>
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Monitoring data real-time transaksi Premi dan Klaim Lini Bisnis Fire.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => fetchFireData(currentTableName, page, limit, filterStatus, filterPeriod)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button 
            type="button" 
            onClick={() => setOpenExportModal(true)}
            disabled={!isTableExists || totalRows === 0}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Main Filter & Navigation Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
        
        {/* Row 1: Cedant Selector & Transaction Type (Premi vs Klaim) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
          {/* 1. Selector Pilihan Cedant (Default Per-Cedant dengan opsi Konsolidasi) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-bold text-[11px] flex items-center gap-1 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Cedant:</span>
            </span>

            <div className="relative" ref={cedantDropdownRef}>
              <button
                type="button"
                onClick={() => setOpenCedantDropdown(!openCedantDropdown)}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-white text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-2xs cursor-pointer min-w-64 justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${selectedCedant === 'ALL' ? 'bg-indigo-600' : 'bg-emerald-500'}`}></span>
                  <span className="truncate">{activeCedantObj.name}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${openCedantDropdown ? 'rotate-180' : ''}`} />
              </button>

              {openCedantDropdown && (
                <div className="absolute left-0 mt-1.5 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                    Mode Tampilan
                  </div>

                  {/* Opsi Semua Cedant */}
                  <button
                    type="button"
                    onClick={() => handleCedantChange('ALL')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      selectedCedant === 'ALL' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Semua Cedant
                    </span>
                    {selectedCedant === 'ALL' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 mt-1 border-t border-slate-100">
                    Daftar Perusahaan
                  </div>

                  {/* Daftar Cedant Individual */}
                  {fireCedants.filter(c => !c.is_all).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCedantChange(c.code)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        selectedCedant === c.code ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate pr-2">{c.name}</span>
                      {selectedCedant === c.code && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Toggle Tipe Transaksi: PREMI vs KLAIM */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold text-[11px] shrink-0">Kategori:</span>
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleTypeChange('PREMIUM')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'PREMIUM'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Premi</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('KLAIM')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'KLAIM'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Klaim</span>
              </button>
            </div>
          </div>

        </div>

        {/* Row 2: Search, Filter Periode, Status, Limit, and Indicator */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          
          <div className="relative w-full xl:w-72 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Cari pada data halaman ini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!isTableExists}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            
            {/* Filter Periode Dinamis */}
            <div className="relative" ref={periodDropdownRef}>
              <button
                type="button"
                disabled={!isTableExists || periodList.length === 0}
                onClick={() => setOpenPeriodDropdown(!openPeriodDropdown)}
                className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  filterPeriod !== 'ALL' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/10' 
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {filterPeriod === 'ALL' 
                    ? `Semua Periode (${totalRows.toLocaleString()})` 
                    : `${filterPeriod} (${(periodList.find(p => p.period === filterPeriod)?.count || 0).toLocaleString()})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openPeriodDropdown ? 'rotate-180' : ''}`} />
              </button>

              {openPeriodDropdown && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('ALL')}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterPeriod === 'ALL' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>Semua Periode</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-bold">
                      {totalRows.toLocaleString()}
                    </span>
                  </button>

                  {periodList.map((item) => (
                    <button
                      key={item.period}
                      type="button"
                      onClick={() => handlePeriodChange(item.period)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        filterPeriod === item.period ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-mono truncate pr-2">{item.period}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                        filterPeriod === item.period
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {item.count.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Status Validasi */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                disabled={!isTableExists}
                onClick={() => setOpenStatusDropdown(!openStatusDropdown)}
                className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  filterStatus === 'WARNING' 
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/10' 
                    : filterStatus === 'VALID' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterStatus === 'ALL' && `Semua Status (${validTotal + warningTotal})`}
                  {filterStatus === 'VALID' && `Valid (${validTotal})`}
                  {filterStatus === 'WARNING' && `Warning (${warningTotal})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {openStatusDropdown && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('ALL')}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === 'ALL' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>Semua Status ({validTotal + warningTotal})</span>
                    {filterStatus === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('VALID')}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === 'VALID' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Valid ({validTotal})
                    </span>
                    {filterStatus === 'VALID' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('WARNING')}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === 'WARNING' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Warning ({warningTotal})
                    </span>
                    {filterStatus === 'WARNING' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Selector Limit Baris */}
            <select
              value={limit}
              disabled={!isTableExists}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-50 font-bold px-2.5 py-2 rounded-xl text-xs outline-none focus:bg-white cursor-pointer shadow-2xs"
            >
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
            </select>
          </div>
        </div>

      </div>

      {/* Info Banner Mode Aktif */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          {isAggregateView ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-800 font-semibold">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tampilan Konsolidasi: Seluruh tabel fisik {selectedType === 'PREMIUM' ? 'Premi' : 'Klaim'} ({targetTablesCount} tabel) disatukan pada antarmuka ini.</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Tabel Fisik: <code className="font-mono text-blue-700">{currentTableName}</code></span>
            </span>
          )}
        </div>

        <div>
          Total: <strong className="text-slate-800">{totalRows.toLocaleString()}</strong> baris data
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        
        {!isTableExists ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 py-16 px-4 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Data Belum Tersedia</h3>
            <p className="text-slate-500 max-w-md">
              Data untuk <strong className="text-blue-600 font-medium">{activeCedantObj.name}</strong> ({selectedType === 'PREMIUM' ? 'Premi' : 'Klaim'}) belum pernah diunggah. Silakan lakukan proses ETL Bordero di menu Upload Bordero.
            </p>
          </div>
        ) : (
          <>
            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs pb-1 relative min-h-[350px]">
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-white px-4 py-2 rounded-xl shadow-md border border-blue-50">
                    <DatabaseZap className="w-4 h-4 animate-pulse" />
                    <span>Memuat data PostgreSQL FIRE...</span>
                  </div>
                </div>
              )}

              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3 text-center border-r border-slate-100 bg-slate-100/60 sticky left-0 z-10">
                      Status Data
                    </th>
                    {columns.map((colName) => (
                      <th key={colName} className="p-3 border-r border-slate-100 last:border-r-0">
                        {colName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {filteredData.length > 0 ? (
                    filteredData.map((row, rowIdx) => {
                      const isWarning = row._status === 'WARNING';

                      return (
                        <tr 
                          key={rowIdx} 
                          className={`transition-colors ${isWarning ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-blue-50/30'}`}
                        >
                          <td className="p-3 text-center border-r border-slate-100 sticky left-0 bg-white/95 backdrop-blur-xs">
                            {isWarning ? (
                              <span 
                                title={`Kolom kosong: ${row._missingFields.join(', ')}`}
                                className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                Warning ({row._missingFields.length})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                Valid
                              </span>
                            )}
                          </td>

                          {columns.map((colName) => {
                            const val = row[colName];
                            const isNull = val === null || val === undefined || String(val).trim() === '' || String(val).toLowerCase() === 'nan' || String(val).toLowerCase() === 'none' || String(val).toLowerCase() === 'null';
                            const isMissingMandatory = row._missingFields.includes(colName);

                            return (
                              <td 
                                key={colName} 
                                className={`p-3 border-r border-slate-50 last:border-r-0 ${
                                  isMissingMandatory ? 'bg-amber-100 text-amber-900 font-bold ring-1 ring-inset ring-amber-300' : ''
                                }`}
                              >
                                {isNull ? (
                                  <span className={`italic font-mono ${isMissingMandatory ? 'text-amber-800 font-bold underline decoration-wavy' : 'text-slate-300'}`}>
                                    [NULL]
                                  </span>
                                ) : colName === 'cedant_name' ? (
                                  <span className="inline-block font-bold text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                    {String(val)}
                                  </span>
                                ) : typeof val === 'number' ? (
                                  <span className={`font-mono ${val < 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                                    {val.toLocaleString('id-ID')}
                                  </span>
                                ) : (
                                  <span className="text-slate-800">{String(val)}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-8 text-center text-slate-400 italic">
                        {loading ? 'Sedang memuat data...' : 'Tidak ada data yang sesuai dengan filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <div>
                Menampilkan <span className="font-bold text-slate-700">{filteredData.length}</span> dari{' '}
                <span className="font-bold text-slate-700">{totalRows.toLocaleString()}</span> baris data
                {isAggregateView && (
                  <span className="ml-2 text-indigo-600 font-semibold">(Gabungan {targetTablesCount} Tabel)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600">
                  Halaman <strong className="text-slate-800">{page}</strong> dari <strong className="text-slate-800">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() => fetchFireData(currentTableName, page - 1, limit, filterStatus, filterPeriod)}
                    disabled={page <= 1 || loading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fetchFireData(currentTableName, page + 1, limit, filterStatus, filterPeriod)}
                    disabled={page >= totalPages || loading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Modal Opsi Ekspor Data */}
      {openExportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 font-sans">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Ekspor Data Bordero Fire</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenExportModal(false)}
                disabled={isExporting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                <p className="font-bold text-slate-800">Ringkasan Target Ekspor:</p>
                <p className="text-[11px] text-slate-600">
                  Cedant: <strong className="text-slate-800">{activeCedantObj.name}</strong>
                </p>
                <p className="text-[11px] text-slate-600">
                  Kategori: <strong className="text-slate-800">{selectedType === 'PREMIUM' ? 'Premi Fire' : 'Klaim Fire'}</strong>
                </p>
                <p className="text-[11px] text-slate-600">
                  Filter Aktif: Periode <strong className="text-slate-800">{filterPeriod}</strong> | Status <strong className="text-slate-800">{filterStatus}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Pilih Cakupan Baris:</label>
                
                {/* Opsi 1: Halaman Aktif */}
                <label 
                  onClick={() => setExportScope('CURRENT_PAGE')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    exportScope === 'CURRENT_PAGE'
                      ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/10'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'CURRENT_PAGE'}
                    onChange={() => setExportScope('CURRENT_PAGE')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">Hanya Halaman Ini ({filteredData.length} baris)</p>
                    <p className="text-[11px] text-slate-500">Mengekspor baris data yang sedang tampil pada halaman {page}.</p>
                  </div>
                </label>

                {/* Opsi 2: Seluruh Data Terfilter */}
                <label 
                  onClick={() => setExportScope('ALL_DATA')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    exportScope === 'ALL_DATA'
                      ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/10'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'ALL_DATA'}
                    onChange={() => setExportScope('ALL_DATA')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">Seluruh Data Terfilter ({totalRows.toLocaleString()} baris)</p>
                    <p className="text-[11px] text-slate-500">Mengekspor seluruh baris data dari database sesuai kriteria filter aktif.</p>
                  </div>
                </label>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                *File akan diunduh dalam format CSV terstandarisasi UTF-8 BOM yang langsung terbaca rapi oleh Microsoft Excel.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpenExportModal(false)}
                disabled={isExporting}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeExport}
                disabled={isExporting}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses Ekspor...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh File</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}