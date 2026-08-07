// src/features/etl/components/ProgressBar.jsx
import React from 'react';

export default function ProgressBar({ progress = 0, status = "Memproses data..." }) {
  // Pastikan progress nggak lewat dari 0-100
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-700">{status}</span>
        <span className="font-bold text-blue-600">{safeProgress}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${safeProgress}%` }}
        >
          <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-[shimmer_2s_infinite] -translate-x-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
        </div>
      </div>
    </div>
  );
}