import React from 'react';
import { ArrowRight, CheckCircle2, HelpCircle, MinusCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { TableRow, TableCell } from '../../../components/ui/Table';

export default function ColumnMapper({ 
  sourceCol, 
  targetCol, 
  dbOptions = [], 
  status = 'unmapped', // 'auto', 'manual', 'unmapped', 'ignored'
  onChange 
}) {
  // Styling & icon indikator status konsisten dengan komponen ETL lainnya
  const statusConfig = {
    auto: { 
      label: 'Auto-Matched', 
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: CheckCircle2 
    },
    manual: { 
      label: 'Manual', 
      classes: 'bg-blue-50 text-blue-700 border-blue-200/80',
      icon: HelpCircle 
    },
    ignored: { 
      label: 'Diabaikan', 
      classes: 'bg-slate-100 text-slate-500 border-slate-200',
      icon: MinusCircle 
    },
    unmapped: { 
      label: 'Belum Dipetakan', 
      classes: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: AlertCircle 
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.unmapped;
  const StatusIcon = currentStatus.icon;

  return (
    <TableRow className={`text-xs transition-colors ${status === 'ignored' ? 'opacity-60 bg-slate-50/50' : 'hover:bg-slate-50/50 bg-white'}`}>
      
      {/* 1. Kolom Sumber (Excel Header) */}
      <TableCell className="w-1/3">
        <div className="flex flex-col space-y-0.5">
          <span className="font-bold text-slate-800">{sourceCol?.name || sourceCol}</span>
          <span className="text-[10px] text-slate-400 font-medium">
            Tipe Data: <strong className="text-slate-600">{sourceCol?.type || 'String'}</strong>
          </span>
        </div>
      </TableCell>

      {/* 2. Ikon Panah Mapping */}
      <TableCell className="w-10 px-0 text-center">
        <div className="flex justify-center text-slate-300">
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </TableCell>

      {/* 3. Kolom Target (Database Master) - Select Input */}
      <TableCell className="w-1/3">
        <div className="relative">
          <select
            value={targetCol || ''}
            onChange={(e) => onChange(sourceCol?.name || sourceCol, e.target.value)}
            className={`w-full appearance-none bg-white border rounded-xl px-3 py-1.5 pr-8 text-xs font-bold transition-all focus:outline-none focus:ring-2 cursor-pointer shadow-sm ${
              !targetCol || targetCol === ''
                ? 'border-rose-300 text-rose-600 focus:ring-rose-500/20 focus:border-rose-500'
                : targetCol === 'ignore'
                ? 'border-slate-200 text-slate-400 focus:ring-slate-500/20 focus:border-slate-400'
                : 'border-slate-200 text-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
            }`}
          >
            <option value="" disabled>-- Pilih Kolom Tujuan --</option>
            <option value="ignore" className="text-slate-400 font-normal">
              Kosongkan / Abaikan (Ignore)
            </option>
            
            {dbOptions.map((opt) => (
              <option key={opt.name} value={opt.name} className="text-slate-700 font-medium">
                {opt.name} {opt.isRequired ? '*' : ''}
              </option>
            ))}
          </select>

          {/* Icon Chevron Custom menggantikan panah native */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </TableCell>

      {/* 4. Status Indikator Badge */}
      <TableCell className="w-1/4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${currentStatus.classes}`}>
          <StatusIcon className="w-3 h-3 shrink-0" />
          <span>{currentStatus.label}</span>
        </span>
      </TableCell>

    </TableRow>
  );
}