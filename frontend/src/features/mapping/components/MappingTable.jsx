import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead } from '../../../components/ui/Table';
import ColumnMapper from './ColumnMapper';
import EmptyState from '../../../components/common/EmptyState';

export default function MappingTable({ 
  mappings = [], 
  dbColumns = [], 
  onMappingChange 
}) {
  
  if (!mappings.length) {
    return (
      <EmptyState 
        title="Menunggu Hasil Mapping" 
        description="Pilih sheet terlebih dahulu untuk melihat hasil pemetaan kolom otomatis."
      />
    );
  }

  // Hitung statistik mapping
  const totalCount = mappings.length;
  const unmappedCount = mappings.filter(m => !m.targetCol || m.status === 'unmapped').length;
  const mappedCount = totalCount - unmappedCount;

  return (
    <div className="space-y-4 text-xs">
      
      {/* Header Info Mapping */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-xs font-bold text-slate-800">Pemetaan Kolom (Data Mapping)</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pastikan semua kolom dari Excel telah dipetakan ke kolom database target.
          </p>
        </div>

        {/* Counter Badge Status */}
        <div className="flex items-center gap-2 shrink-0">
          {unmappedCount > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-lg font-bold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{unmappedCount} Kolom Belum Dipetakan</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Semua Kolom Terpetakan ({mappedCount}/{totalCount})</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabel Mapping */}
      <div className="relative border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="max-h-[400px] overflow-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 sticky top-0 z-10 shadow-sm text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <TableHead className="w-1/3">Sumber (Header Excel)</TableHead>
                <TableHead className="w-10 text-center">Arah</TableHead>
                <TableHead className="w-1/3">Target (Database)</TableHead>
                <TableHead className="w-1/4">Status Mapping</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((row, index) => (
                <ColumnMapper
                  key={index}
                  sourceCol={row.sourceCol}
                  targetCol={row.targetCol}
                  status={row.status}
                  dbOptions={dbColumns}
                  onChange={onMappingChange}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Ringkasan */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-[11px] font-medium text-slate-500 text-center">
          Total <strong className="text-slate-700">{totalCount}</strong> kolom terdeteksi dari sheet terpilih.
        </div>
      </div>

    </div>
  );
}