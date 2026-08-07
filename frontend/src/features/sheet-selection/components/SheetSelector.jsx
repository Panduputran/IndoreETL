// src/features/sheet-selection/components/SheetSelector.jsx
import React from 'react';

export default function SheetSelector({ sheets = [], selectedSheet, onSelect }) {
  if (!sheets || sheets.length === 0) {
    return (
      <div className="p-4 text-sm text-amber-600 bg-amber-50 rounded-xl border border-amber-200">
        Belum ada sheet yang terdeteksi. Pastikan file Excel sudah diproses.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-700">Pilih Sheet (Type COB)</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sheets.map((sheet, index) => {
          const isSelected = selectedSheet === sheet.name;
          return (
            <button
              key={index}
              onClick={() => onSelect(sheet.name)}
              className={`relative flex flex-col items-start p-4 text-left border rounded-xl transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                  {sheet.name}
                </span>
                {/* Indikator Check */}
                {isSelected && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {sheet.rows ? `${sheet.rows} Baris Data` : 'Siap dipetakan'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}