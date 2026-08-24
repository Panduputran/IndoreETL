import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { iprMasterColumns } from '../data/iprMasterData';

export default function IprMaster() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, MANDATORY, OPTIONAL
  const [copiedKey, setCopiedKey] = useState(null);

  // Filter Logic
  const filteredColumns = iprMasterColumns.filter((col) => {
    const matchesSearch = 
      col.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'MANDATORY') return matchesSearch && col.isMandatory;
    if (filterType === 'OPTIONAL') return matchesSearch && !col.isMandatory;
    return matchesSearch;
  });

  const totalMandatory = iprMasterColumns.filter(c => c.isMandatory).length;

  // Fungsi Salin Key Kolom
  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Fungsi Export Template CSV
  const handleExportTemplate = () => {
    const headers = iprMasterColumns.map(c => c.key).join(',');
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'IPR_Master_Standard_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-5 text-xs bg-slate-50 min-h-screen font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>IPR Master Schema (Pusat Standard)</span>
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Daftar 51 standar atribut baku IPR (Individual Policy Record) acuan untuk seluruh Cedant/Ceding Companies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportTemplate}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Template CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Atribut IPR</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{iprMasterColumns.length} <span className="text-xs font-normal text-slate-500">Kolom</span></p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
            {iprMasterColumns.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mandatory (* Wajib)</p>
            <p className="text-xl font-bold text-rose-600 mt-1">{totalMandatory} <span className="text-xs font-normal text-slate-500">Kolom</span></p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">
            *
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optional (Bisa Null)</p>
            <p className="text-xl font-bold text-slate-600 mt-1">{iprMasterColumns.length - totalMandatory} <span className="text-xs font-normal text-slate-500">Kolom</span></p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">
            O
          </div>
        </div>
      </div>

      {/* Filter Bar & Table Container */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Cari nama kolom, key DB, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                filterType === 'ALL' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({iprMasterColumns.length})
            </button>
            <button
              onClick={() => setFilterType('MANDATORY')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                filterType === 'MANDATORY' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Wajib/Mandatory ({totalMandatory})
            </button>
            <button
              onClick={() => setFilterType('OPTIONAL')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                filterType === 'OPTIONAL' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Opsional ({iprMasterColumns.length - totalMandatory})
            </button>
          </div>

        </div>

        {/* Master Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse whitespace-nowrap sm:whitespace-normal">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 w-1/4">Nama Header IPR Standard</th>
                <th className="p-3 w-1/4">Database Field Key</th>
                <th className="p-3 w-32">Tipe Data</th>
                <th className="p-3 w-28 text-center">Status Atribut</th>
                <th className="p-3">Deskripsi Atribut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredColumns.length > 0 ? (
                filteredColumns.map((col) => (
                  <tr key={col.no} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* No */}
                    <td className="p-3 text-center font-bold text-slate-400">
                      {col.no}
                    </td>

                    {/* Header Label */}
                    <td className="p-3 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.isMandatory && <span className="text-rose-500 font-bold">*</span>}
                      </div>
                    </td>

                    {/* Database Field Key + Copy Button */}
                    <td className="p-3">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold text-blue-700 bg-blue-50/40 px-2 py-1 rounded-lg border border-blue-100">
                        <span>{col.key}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(col.key)}
                          title="Salin Key"
                          className="text-slate-400 hover:text-blue-600 transition cursor-pointer ml-1"
                        >
                          {copiedKey === col.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Data Type */}
                    <td className="p-3">
                      <span className={`font-mono px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        col.type.includes('DECIMAL') 
                          ? 'bg-amber-50 text-amber-700 border-amber-200/80' 
                          : col.type === 'TIMESTAMP'
                          ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                          : col.type === 'NUMBER' || col.type === 'INTEGER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                          : 'bg-slate-100 text-slate-600 border-slate-200/60'
                      }`}>
                        {col.type}
                      </span>
                    </td>

                    {/* Status Mandatory/Optional */}
                    <td className="p-3 text-center">
                      {col.isMandatory ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Mandatory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-200">
                          Optional
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="p-3 text-slate-500 text-[11px]">
                      {col.description}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada atribut IPR yang cocok dengan pencarian "<strong>{searchQuery}</strong>".
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