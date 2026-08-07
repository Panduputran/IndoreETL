// src/features/preview/components/ValidationBadge.jsx
import React from 'react';

export default function ValidationBadge({ status = 'valid', message }) {
  const configs = {
    valid: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Valid'
    },
    warning: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Warning'
    },
    error: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Error'
    }
  };

  const current = configs[status] || configs.valid;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${current.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
        {current.label}
      </span>
      {message && (
        <span className="text-xs text-slate-400 truncate max-w-[150px]" title={message}>
          {message}
        </span>
      )}
    </div>
  );
}