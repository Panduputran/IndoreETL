// src/features/etl/components/PreviewTable.jsx
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import EmptyState from '../../../components/common/EmptyState';

export default function PreviewTable({ columns = [], data = [], isLoading = false }) {
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

  return (
    <div className="relative border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="max-h-[400px] overflow-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              {/* Kolom Nomor */}
              <TableHead className="w-16 text-center">No</TableHead>
              {columns.map((col, idx) => (
                <TableHead key={idx}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="text-center font-medium text-slate-400 bg-slate-50/50">
                  {rowIndex + 1}
                </TableCell>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className="max-w-[200px] truncate">
                    {/* Jika nilainya kosong, tampilkan strip abu-abu */}
                    {row[col] !== null && row[col] !== undefined && row[col] !== '' ? (
                      row[col]
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 text-center">
        Menampilkan {data.length} baris pertama sebagai preview.
      </div>
    </div>
  );
}