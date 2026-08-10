import { useState, useRef } from 'react';

export default function DragDrop({ onFiles, disabled = false }) {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      onFiles(Array.from(e.target.files));
      e.target.value = null; // Reset input value biar file yang sama bisa re-upload
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-200 group ${
        disabled
          ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
          : isHovering
          ? 'border-blue-500 bg-blue-50/50 cursor-pointer'
          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
      }`}
    >
      <input
        type="file"
        multiple
        accept=".xlsx, .xls, .xlsb, .csv"
        onChange={handleFileSelect}
        ref={fileInputRef}
        disabled={disabled}
        className="hidden"
      />

      {/* Icon Upload Modern */}
      <div
        className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center transition-colors ${
          disabled
            ? 'bg-slate-100 text-slate-300'
            : isHovering
            ? 'bg-blue-100 text-blue-600'
            : 'bg-white shadow-sm border border-slate-100 text-slate-400 group-hover:text-blue-500'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      {/* Typography Minimalis & Dinamis */}
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-700">
          {disabled ? (
            <span className="text-slate-400">Pilih Nama Cedant terlebih dahulu</span>
          ) : (
            <>
              Klik untuk pilih file <span className="text-slate-500 font-normal">atau seret ke area ini</span>
            </>
          )}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {disabled
            ? 'Form upload akan aktif setelah Cedant dipilih'
            : 'Mendukung ekstensi .xlsx, .xls, .csv'}
        </p>
      </div>
    </div>
  );
}