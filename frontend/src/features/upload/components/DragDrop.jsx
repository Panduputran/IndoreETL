import { useState, useRef } from 'react';

export default function DragDrop({ onFiles }) {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Ubah FileList object jadi Array biar gampang di-map nanti
      onFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(Array.from(e.target.files));
      // Reset input value biar file yang sama bisa diupload ulang kalo dihapus
      e.target.value = null; 
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${
        isHovering
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <input
        type="file"
        multiple
        accept=".xlsx, .xls, .xlsb"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="hidden"
      />

      {/* Icon Upload Modern */}
      <div className={`w-14 h-14 mb-4 rounded-full flex items-center justify-center transition-colors ${
        isHovering ? 'bg-blue-100 text-blue-600' : 'bg-white shadow-sm border border-slate-100 text-slate-400 group-hover:text-blue-500'
      }`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      {/* Typography Minimalis */}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">
          Klik untuk pilih file <span className="text-slate-500 font-normal">atau seret ke area ini</span>
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Mendukung ekstensi <span className="font-medium text-slate-500">.xlsx, .xls</span>
        </p>
      </div>
    </div>
  );
}