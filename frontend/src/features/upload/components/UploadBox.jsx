import React, { useRef } from 'react';

export default function UploadBox({
  files,
  onFilesDrop,
  onRemoveFile,
  onUpdateFile,
  onScan,
  onReset,
  loading,
  isReady,
  uploadMode,
  onToggleMode
}) {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length > 0) {
      onFilesDrop(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length > 0) {
      onFilesDrop(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">

      {/* Header dengan Tombol Toggle Mode */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Dokumen Bordero</h2>
            {/* Badge Status Mode Saat Ini */}
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${uploadMode === 'batch'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-amber-600 bg-amber-50'
              }`}>
              {uploadMode === 'batch' ? 'Batch Mode' : 'Single Mode'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unggah file Excel dan lengkapi detail informasinya.</p>
        </div>

        {/* Tombol Ganti Mode */}
        <button
          onClick={onToggleMode}
          className="px-3 py-1.5 text-[10px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Ubah ke {uploadMode === 'batch' ? 'Single' : 'Batch'} Mode
        </button>
      </div>

      {/* Compact Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-out"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          multiple={uploadMode === 'batch'}
          accept=".xlsx, .xls, .xlsb"
        />

        <div className="w-10 h-10 mb-2.5 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:text-indigo-600 transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </div>

        <h4 className="text-xs font-semibold text-slate-700">
          {uploadMode === 'single' && files.length > 0
            ? 'Tarik & letakkan file baru untuk mengganti'
            : 'Tarik & letakkan file di sini'
          }
        </h4>
        <div className="mt-2 bg-white border border-slate-100 px-2 py-1 rounded-md shadow-sm">
          <p className="text-[9px] text-slate-400 font-medium">Maks 10MB (.xlsx, .xls, .xlsb)</p>
        </div>
      </div>

      {/* List Uploaded Documents */}
      {files.length > 0 && (
        <div className="mt-5 flex-1 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">File Tertunda ({files.length})</h3>
          </div>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 pb-1">
            {files.map((fileObj, index) => (
              <div key={index} className="relative group p-2.5 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-indigo-100 hover:shadow transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3">

                {/* Left: Icon & File Name */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate" title={fileObj.name}>
                      {fileObj.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      {fileObj.rawFile?.size ? (fileObj.rawFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Menunggu...'}
                    </p>
                  </div>
                </div>

                {/* Right: Inputs Array */}
                <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100/80">

                  {/* Tipe (Semua, Premi, Klaim, Askrida) */}
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5 tracking-wider">Tipe</span>
                    <select
                      value={fileObj.category}
                      onChange={(e) => onUpdateFile(index, 'category', e.target.value)}
                      className="bg-white border border-slate-200 rounded-md text-[11px] px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none w-[90px] text-slate-700 shadow-sm cursor-pointer"
                    >
                      <option value="All">Semua</option>
                      <option value="Premi">Premi</option>
                      <option value="Claim">Klaim</option>
                      <option value="Askrida">Askrida</option>
                    </select>
                  </div>

                  {/* Periode (Otomatis Uppercase) */}
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5 tracking-wider">Periode</span>
                    <input
                      type="text"
                      placeholder="TW1 / Q1"
                      value={fileObj.period}
                      onChange={(e) => onUpdateFile(index, 'period', e.target.value.toUpperCase())}
                      className="bg-white border border-slate-200 rounded-md text-[11px] px-2 py-1 w-[85px] focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 shadow-sm uppercase"
                    />
                  </div>

                  {/* Diterima (String format tahun 4 digit) */}
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5 tracking-wider">Diterima</span>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="2026"
                      value={fileObj.receivedDate}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ''); // Hanya izinkan angka saja
                        onUpdateFile(index, 'receivedDate', val);
                      }}
                      className="bg-white border border-slate-200 rounded-md text-[11px] px-2 py-1 w-[70px] focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 shadow-sm"
                    />
                  </div>

                </div>

                {/* Floating Delete Button */}
                <button
                  onClick={() => onRemoveFile(index)}
                  className="absolute -top-2 -right-2 bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Hapus file"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 mt-auto">
        <button
          onClick={onReset}
          className="px-4 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50"
          disabled={files.length === 0}
        >
          Kosongkan
        </button>
        <button
          onClick={onScan}
          disabled={!isReady || files.length === 0 || loading}
          className={`px-4 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all ${isReady && files.length > 0 && !loading
            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:-translate-y-px'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
          {loading ? 'Memproses...' : 'Upload Dokumen'}
        </button>
      </div>
    </div>
  );
}