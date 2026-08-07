// src/features/mapping/components/ColumnMapper.jsx
import React from 'react';
import { TableRow, TableCell } from '../../../components/ui/Table';

export default function ColumnMapper({ 
  sourceCol, 
  targetCol, 
  dbOptions = [], 
  status = 'unmapped', // 'auto', 'manual', 'unmapped', 'ignored'
  onChange 
}) {
  // Styling untuk badge status biar informatif
  const statusConfig = {
    auto: { label: 'Auto-Matched', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    manual: { label: 'Manual', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    ignored: { label: 'Diabaikan', classes: 'bg-slate-100 text-slate-500 border-slate-200' },
    unmapped: { label: 'Belum Dipetakan', classes: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const currentStatus = statusConfig[status] || statusConfig.unmapped;

  return (
    <TableRow className={status === 'ignored' ? 'opacity-60 bg-slate-50/50' : 'bg-white'}>
      {/* Kolom Sumber (Excel) */}
      <TableCell className="w-1/3">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{sourceCol.name}</span>
          <span className="text-xs text-slate-400 mt-0.5">Tipe: {sourceCol.type || 'String'}</span>
        </div>
      </TableCell>

      {/* Ikon Panah Mapping */}
      <TableCell className="w-12 px-0 text-center">
        <div className="flex justify-center text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </TableCell>

      {/* Kolom Target (Database) - Dropdown */}
      <TableCell className="w-1/3">
        <select
          value={targetCol || ''}
          onChange={(e) => onChange(sourceCol.name, e.target.value)}
          className={`w-full appearance-none bg-white border rounded-lg px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer
            ${!targetCol ? 'border-rose-300 text-rose-600 focus:border-rose-500' : 'border-slate-200 text-slate-700 focus:border-blue-500'}
          `}
        >
          <option value="" disabled>-- Pilih Kolom Tujuan --</option>
          <option value="ignore" className="text-slate-400 font-italic">Kosongkan / Abaikan (Ignore)</option>
          
          {dbOptions.map((opt) => (
            <option key={opt.name} value={opt.name}>
              {opt.name} {opt.isRequired ? '*' : ''}
            </option>
          ))}
        </select>
      </TableCell>

      {/* Status Indikator */}
      <TableCell className="w-1/4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${currentStatus.classes}`}>
          {currentStatus.label}
        </span>
      </TableCell>
    </TableRow>
  );
}