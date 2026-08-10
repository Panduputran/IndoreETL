import React, { useState } from 'react';
import { Filter, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import EmptyState from '../../../components/common/EmptyState';

export default function PreviewTable({ columns = [], data = [], isLoading = false }) {
  // State Filter Status: 'all' | 'valid' | 'invalid'
  const [statusFilter, setStatusFilter] = useState('all');

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-sm font-medium text-slate-500 animate-pulse">Memuat preview data...</span>
      </div>
    );
  }

  if (!columns.length || !data.length) {
    return (
      <EmptyState 
        title="Tidak ada preview" 
        description="Data belum tersedia untuk dipreview."
      />
    );
  }

  // Hitung jumlah data per status
  const totalCount = data.length;
  const validCount = data.filter((item) => item._validationStatus === 'valid').length;
  const invalidCount = data.filter((item) => item._validationStatus === 'invalid' || item._validationStatus === 'warning').length;

  // Filter data sesuai tombol yang diklik
  const filteredData = data.filter((item) => {
    if (statusFilter === 'valid') {
      return item._validationStatus === 'valid';
    }
    if (statusFilter === 'invalid') {
      return item._validationStatus === 'invalid' || item._validationStatus === 'warning';
    }
    return true; // 'all'
  });

  return (
    <div className="space-y-3 text-xs">
      
      {/* BAR FILTER STATUS (SEGMENTED TABS) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Status:</span>
          </div>

          {/* Button Semua */}
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'all'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${statusFilter === 'all' ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/60 text-slate-500'}`}>
              {totalCount}
            </span>
          </button>

          {/* Button Valid */}
          <button
            type="button"
            onClick={() => setStatusFilter('valid')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'valid'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Valid</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-emerald-100 text-emerald-800">
              {validCount}
            </span>
          </button>

          {/* Button Invalid / Warning */}
          <button
            type="button"
            onClick={() => setStatusFilter('invalid')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'invalid'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Invalid / Warning</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${invalidCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200/60 text-slate-500'}`}>
              {invalidCount}
            </span>
          </button>
        </div>

        {/* Counter Info Baris */}
        <span className="text-[10px] text-slate-400 font-medium shrink-0 px-1">
          Menampilkan <strong className="text-slate-700">{filteredData.length}</strong> dari {totalCount} baris
        </span>
      </div>

      {/* TABEL DATA HASIL FILTER */}
      <div className="relative border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="max-h-[380px] overflow-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                {columns.map((col, idx) => (
                  <TableHead key={idx} className="whitespace-nowrap">{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => {
                  const isInvalid = row._validationStatus === 'invalid' || row._validationStatus === 'warning';

                  return (
                    <TableRow 
                      key={rowIndex}
                      className={isInvalid ? 'bg-rose-50/40 hover:bg-rose-50/80' : 'hover:bg-slate-50/80'}
                    >
                      {/* Kolom Nomor */}
                      <TableCell className="text-center font-medium text-slate-400 bg-slate-50/50">
                        {rowIndex + 1}
                      </TableCell>

                      {/* Kolom Badge Status */}
                      <TableCell className="text-center whitespace-nowrap">
                        {isInvalid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            Invalid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            Valid
                          </span>
                        )}
                      </TableCell>

                      {/* Kolom Data */}
                      {columns.map((col, colIndex) => (
                        <TableCell key={colIndex} className="max-w-[200px] truncate">
                          {row[col] !== null && row[col] !== undefined && row[col] !== '' ? (
                            row[col]
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                /* State Kosong Jika Filter Tidak Menemukan Data */
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center p-8 text-slate-400 italic">
                    Tidak ada data dengan status <strong className="text-slate-600">{statusFilter}</strong>.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 text-center">
          Menampilkan {filteredData.length} baris hasil filter sebagai preview.
        </div>
      </div>

    </div>
  );
}