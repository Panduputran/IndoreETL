// src/features/preview/components/Pagination.jsx
import React from 'react';
import Button from '../../../components/ui/Button';

export default function Pagination({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  totalData = 0 
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-slate-200 rounded-b-xl">
      <span className="text-xs text-slate-500 font-medium">
        Menampilkan halaman <span className="font-semibold text-slate-800">{currentPage}</span> dari <span className="font-semibold text-slate-800">{totalPages}</span> (Total: {totalData} baris)
      </span>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Sebelumnya
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}