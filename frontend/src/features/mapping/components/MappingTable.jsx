// src/features/mapping/components/MappingTable.jsx
import React from 'react';
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

  // Hitung statistik untuk header
  const unmappedCount = mappings.filter(m => !m.targetCol || m.status === 'unmapped').length;

  return (
    <div className="space-y-4">
      {/* Header Info Mapping */}
      <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Pemetaan Kolom (Data Mapping)</h3>
          <p className="text-xs text-slate-500 mt-1">
            Pastikan semua kolom sumber dari Excel telah dipetakan ke kolom database target.
          </p>
        </div>
        {unmappedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            {unmappedCount} Kolom belum dipetakan
          </div>
        )}
      </div>

      {/* Tabel Mapping */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Sumber (Header Excel)</TableHead>
              <TableHead className="text-center">Arah</TableHead>
              <TableHead>Target (Tabel PostgreSQL)</TableHead>
              <TableHead>Status Mapping</TableHead>
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
    </div>
  );
}