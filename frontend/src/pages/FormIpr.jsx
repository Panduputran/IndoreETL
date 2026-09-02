import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  AlertCircle,
  Building2,
  CheckCircle2,
  Filter,
  Eye,
  Info
} from 'lucide-react';
import { IPR_COMPARISON_MATRIX, CEDANTS_COMPARISON_LIST } from '../data/iprComparisonData';

export default function FormIpr() {
  const [activeSheet, setActiveSheet] = useState('FIRE_PREMIUM');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, MANDATORY, OPTIONAL
  const [copiedKey, setCopiedKey] = useState(null);

  // Daftar sheet / quadrant IPR
  const sheets = [
    { id: 'FIRE_PREMIUM', label: 'FIRE — PREMIUM', count: IPR_COMPARISON_MATRIX.FIRE_PREMIUM.length },
    { id: 'FIRE_CLAIM', label: 'FIRE — CLAIM', count: IPR_COMPARISON_MATRIX.FIRE_CLAIM.length },
    { id: 'CREDIT_PREMIUM', label: 'CREDIT — PREMIUM', count: IPR_COMPARISON_MATRIX.CREDIT_PREMIUM.length },
    { id: 'CREDIT_CLAIM', label: 'CREDIT — CLAIM', count: IPR_COMPARISON_MATRIX.CREDIT_CLAIM.length },
  ];

  const currentData = IPR_COMPARISON_MATRIX[activeSheet] || [];

  // Filter Baris IPR
  const filteredRows = useMemo(() => {
    return currentData.filter((row) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        row.iprLabel.toLowerCase().includes(q) ||
        row.dbField.toLowerCase().includes(q) ||
        (row.description && row.description.toLowerCase().includes(q)) ||
        Object.values(row.cedants).some(val => val && val.toLowerCase().includes(q));

      if (filterType === 'MANDATORY') return matchesSearch && row.required;
      if (filterType === 'OPTIONAL') return matchesSearch && !row.required;
      return matchesSearch;
    });
  }, [currentData, searchQuery, filterType]);

  const totalMandatory = currentData.filter(c => c.required).length;

  // Handler Copy Text
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Export Matrix ke CSV dengan UTF-8 BOM
  const handleExportCsv = () => {
    const headers = [
      'No',
      'FORMAT IPR (Standard)',
      'Database Field Key',
      'Data Type',
      'Status',
      ...CEDANTS_COMPARISON_LIST.map(c => c.label),
      'Description'
    ];

    const rows = filteredRows.map(r => [
      r.no,
      `"${r.iprLabel.replace(/"/g, '""')}"`,
      r.dbField,
      r.sqlType,
      r.required ? 'MANDATORY' : 'OPTIONAL',
      ...CEDANTS_COMPARISON_LIST.map(c => `"${(r.cedants[c.id] || '-').replace(/"/g, '""')}"`),
      `"${(r.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IPR_Format_Matrix_${activeSheet}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 font-sans text-slate-800">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>IPR Format</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Matriks perbandingan format standar IPR (Individual Policy Record) dengan struktur kolom masing-masing Cedant.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Matrix (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Excel Spreadsheet Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
        
        {/* Excel Tab Bar (Top Sheet Selector) */}
        <div className="bg-slate-100/80 border-b border-slate-200/90 px-4 pt-3 flex items-center gap-1.5 overflow-x-auto">
          {sheets.map((s) => {
            const isActive = activeSheet === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSheet(s.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-emerald-700 border-slate-200/90 shadow-2xs border-b-2 border-b-transparent -mb-[1px]'
                    : 'bg-transparent text-slate-600 hover:bg-slate-200/60 border-transparent hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{s.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {s.count} Kolom
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar / Formula Bar Excel */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Formula Bar Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-slate-400">
              fx
            </div>
            <input
              type="text"
              placeholder="Cari nama kolom IPR, key database, atau nama kolom cedant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium shadow-2xs"
            />
          </div>

          {/* Filter Mandatory & Quick Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterType === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({currentData.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('MANDATORY')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterType === 'MANDATORY' ? 'bg-rose-500 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wajib ({totalMandatory})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('OPTIONAL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterType === 'OPTIONAL' ? 'bg-slate-200 text-slate-800' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Opsional ({currentData.length - totalMandatory})
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="font-semibold text-slate-800">{filteredRows.length}</span>
              <span>baris ditampilkan</span>
            </div>
          </div>

        </div>

        {/* 3. Excel Spreadsheet Grid Table */}
        <div className="overflow-x-auto max-h-[720px] divide-y divide-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 shadow-2xs border-b border-slate-300">
              <tr className="text-slate-700 text-[11px] font-bold">
                
                {/* Excel Row Index Header */}
                <th className="py-3 px-3 w-12 text-center bg-slate-200/90 border-r border-slate-300 font-mono text-slate-500">
                  #
                </th>

                {/* Main Column: FORMAT IPR (Standard) */}
                <th className="py-3 px-4 min-w-[280px] bg-emerald-50/80 border-r border-slate-300 text-emerald-950 font-bold uppercase tracking-wider">
                  <div className="flex items-center justify-between">
                    <span>FORMAT IPR (Standard)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      BAKU
                    </span>
                  </div>
                </th>

                {/* Column: Status */}
                <th className="py-3 px-3 w-28 text-center bg-slate-100 border-r border-slate-300 text-slate-600 uppercase tracking-wider">
                  Status
                </th>

                {/* Cedant Columns (ACA, Tripakarta, Buana, Askrida, Jamkrida Jabar, Jakre Jabar) */}
                {CEDANTS_COMPARISON_LIST.map((cedant) => (
                  <th 
                    key={cedant.id}
                    className="py-3 px-4 min-w-[180px] bg-white border-r border-slate-300 text-slate-800 uppercase tracking-wider hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold truncate" title={cedant.fullName}>
                        {cedant.label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-sans text-slate-800 bg-white">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={3 + CEDANTS_COMPARISON_LIST.length} className="py-16 text-center text-slate-400 italic">
                    Tidak ada atribut yang cocok dengan pencarian "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  return (
                    <tr 
                      key={row.no} 
                      className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    >
                      {/* Excel Row Index */}
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-400 bg-slate-100/60 border-r border-slate-200 text-[11px] select-none">
                        {row.no}
                      </td>

                      {/* FORMAT IPR Cell */}
                      <td className="py-2.5 px-4 border-r border-slate-200 bg-emerald-50/20">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {row.iprLabel}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {row.sqlType}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
                              <span>{row.dbField}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(row.dbField)}
                                title="Salin Field Key"
                                className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer ml-0.5"
                              >
                                {copiedKey === row.dbField ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {row.description && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={row.description}>
                                {row.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Mandatory/Optional */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 whitespace-nowrap">
                        {row.required ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Wajib</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Opsional
                          </span>
                        )}
                      </td>

                      {/* Cedant Cells (ACA, TRIPAKARTA, BUANA INDEPENDENT, ASKRIDA, JAMKRIDA JABAR, JAKRE JABAR) */}
                      {CEDANTS_COMPARISON_LIST.map((cedant) => {
                        const val = row.cedants[cedant.id] || '-';
                        const isMapped = val !== '-' && val.trim() !== '';

                        return (
                          <td 
                            key={cedant.id} 
                            className={`py-2.5 px-4 border-r border-slate-200 font-mono text-xs transition-colors ${
                              isMapped ? 'bg-white text-slate-800' : 'bg-slate-50/40 text-slate-300 text-center'
                            }`}
                          >
                            {isMapped ? (
                              <div className="flex items-center justify-between gap-1.5 group">
                                <span className="font-semibold text-slate-800 hover:text-blue-700 transition-colors" title={`Kolom ${cedant.label}: ${val}`}>
                                  {val}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(val)}
                                  title={`Salin nama kolom: ${val}`}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition cursor-pointer p-0.5"
                                >
                                  {copiedKey === val ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Spreadsheet Footer Info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Format Baku Resmi Indonesia Re</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Total: <strong>{filteredRows.length}</strong> Atribut IPR Terdaftar</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Kolom Mandatory / Wajib
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Kolom Opsional
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}