// src/features/preview/components/PreviewTable.jsx
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import ValidationBadge from './ValidationBadge';
import EmptyState from '../../../components/common/EmptyState';

export default function PreviewTable({ columns = [], data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-sm font-medium text-slate-500 animate-pulse">Memuat pratinjau data...</span>
      </div>
    );
  }

  if (!columns.length || !data.length) {
    return (
      <EmptyState 
        title="Belum Ada Data Preview" 
        description="Lakukan pemetaan kolom terlebih dahulu untuk melihat hasil pratinjau data."
      />
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="max-h-[450px] overflow-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableHead className="w-16 text-center">No</TableHead>
              <TableHead className="w-32">Status Validasi</TableHead>
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
                <TableCell>
                  <ValidationBadge status={row._validationStatus || 'valid'} message={row._validationMessage} />
                </TableCell>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className="max-w-[220px] truncate text-slate-700">
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
    </div>
  );
}