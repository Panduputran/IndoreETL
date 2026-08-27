import React from 'react';
import { QUARTER_OPTIONS, MONTH_OPTIONS } from '../../../constants/data';

export default function PeriodSelector({ periodType, periodValue, onTypeChange, onValueChange }) {
  return (
    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
      {/* 1. Tombol Switch Tipe Granularitas */}
      <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
        <button
          type="button"
          onClick={() => {
            onTypeChange('quarterly');
            onValueChange('Q1');
          }}
          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
            periodType === 'quarterly'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Kuartal
        </button>
        <button
          type="button"
          onClick={() => {
            onTypeChange('monthly');
            onValueChange('JAN');
          }}
          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
            periodType === 'monthly'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Bulan
        </button>
      </div>

      {/* 2. Dropdown Nilai Dinamis */}
      <select
        value={periodValue}
        onChange={(e) => onValueChange(e.target.value)}
        className="bg-transparent text-[11px] font-bold text-slate-800 outline-none cursor-pointer pr-1"
      >
        {periodType === 'quarterly'
          ? QUARTER_OPTIONS.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))
          : MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
      </select>
    </div>
  );
}