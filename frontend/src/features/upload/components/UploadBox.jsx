import React, { useRef } from 'react';

export default function UploadBox({
  files,
  onFilesDrop,
  onRemoveFile,
  onUpdateFile,
  onScan,
  onReset,
  loading,
  isReady, // Cedant sudah dipilih
  uploadMode,
  onToggleMode
}) {
  const fileInputRef = useRef(null);

  // 1. FUNGSI CEK MISMATCH & WARNING PER FILE
  const checkFileMismatch = (fileObj) => {
    if (!fileObj || !fileObj.name) return { isMismatch: false, reason: '' };
    const lowerName = fileObj.name.toLowerCase();

    const hasPremiKeyword = lowerName.includes('premi');
    const hasClaimKeyword = lowerName.includes('klaim') || lowerName.includes('claim');
    const hasSubroKeyword = lowerName.includes('subro');

    // A. Cek Kategori (HANYA Mismatch kalau ada kata kunci yang berlawanan di file)
    if (fileObj.category) {
      const cat = fileObj.category.toLowerCase();
      
      if (cat === 'premi' && hasClaimKeyword) {
        return { isMismatch: true, reason: 'Kategori "Premi" bertolak belakang dengan kata kunci Klaim pada nama berkas' };
      }
      if ((cat === 'claim' || cat === 'klaim') && hasPremiKeyword) {
        return { isMismatch: true, reason: 'Kategori "Claim" bertolak belakang dengan kata kunci Premi pada nama berkas' };
      }
      if (cat === 'subro' && (hasPremiKeyword || hasClaimKeyword)) {
        return { isMismatch: true, reason: 'Kategori "Subro" bertolak belakang dengan kata kunci Premi/Klaim pada nama berkas' };
      }
    }

    // B. Cek Periode (Peringatan Mismatch hanya jika nama file punya pola TW / Q)
    if (fileObj.period) {
      const per = fileObj.period.toLowerCase();
      const hasPeriodPattern = lowerName.includes('tw') || lowerName.includes('q');
      
      if (hasPeriodPattern && !lowerName.includes(per)) {
        return { isMismatch: true, reason: `Periode "${fileObj.period}" tidak sesuai dengan kode periode pada nama berkas` };
      }
    }

    // C. Cek Tahun (Peringatan Mismatch hanya jika terdeteksi 4 digit angka tahun di nama file)
    if (fileObj.receivedDate) {
      const yr = fileObj.receivedDate.trim();
      const hasYearPattern = /\d{4}/.test(lowerName); // Cek apakah ada format tahun 4 digit di file
      
      if (hasYearPattern && !lowerName.includes(yr)) {
        return { isMismatch: true, reason: `Tahun "${yr}" tidak cocok dengan angka tahun pada nama berkas` };
      }
    }

    return { isMismatch: false, reason: '' };
  };

  // 2. CEK APAKAH ADA FILE YANG MISMATCH
  const hasMismatch = files.some((file) => checkFileMismatch(file).isMismatch);

  // 3. VALIDASI FORM: Harus Terisi Lengkap DAN Bebas Mismatch!
  const isFormValid = files.length > 0 && !hasMismatch && files.every((file) => {
    const hasCategory = Boolean(file.category && file.category.trim() !== '');
    const hasPeriod = Boolean(file.period && file.period.trim() !== '');
    const hasReceivedDate = Boolean(file.receivedDate && file.receivedDate.trim().length === 4);

    return hasCategory && hasPeriod && hasReceivedDate;
  });

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    if (!isReady) {
      alert("Silakan pilih Nama Cedant terlebih dahulu!");
      return;
    }
    if (e.dataTransfer.files?.length > 0) {
      onFilesDrop(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (!isReady) {
      alert("Silakan pilih Nama Cedant terlebih dahulu!");
      return;
    }
    if (e.target.files?.length > 0) {
      onFilesDrop(Array.from(e.target.files));
      e.target.value = null;
    }
  };

  const handleDropzoneClick = () => {
    if (!isReady) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative text-xs">

      {/* Header dengan Tombol Toggle Mode */}
      <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Dokumen Bordero</h2>
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${uploadMode === 'batch'
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-100'
              : 'text-amber-600 bg-amber-50 border border-amber-100'
              }`}>
              {uploadMode === 'batch' ? 'Batch Mode' : 'Single Mode'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Unggah file Excel mentah dan periksa detail informasinya.</p>
        </div>

        <button
          type="button"
          onClick={onToggleMode}
          className="px-3 py-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
        >
          Ubah ke {uploadMode === 'batch' ? 'Single' : 'Batch'} Mode
        </button>
      </div>

      {/* Compact Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
        className={`group relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center transition-all duration-300 ease-out ${!isReady
          ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
          : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 cursor-pointer'
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          disabled={!isReady}
          className="hidden"
          multiple={uploadMode === 'batch'}
          accept=".xlsx, .xls, .xlsb, .csv"
        />

        <div className={`w-10 h-10 mb-2 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center transition-all duration-300 ${!isReady ? 'text-slate-300' : 'text-indigo-500 group-hover:scale-110 group-hover:text-indigo-600'
          }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </div>

        <h4 className="text-xs font-bold text-slate-700">
          {!isReady
            ? 'Pilih Nama Cedant terlebih dahulu'
            : uploadMode === 'single' && files.length > 0
              ? 'Tarik & letakkan file baru untuk mengganti'
              : 'Tarik & letakkan file di sini'
          }
        </h4>
        <div className="mt-1.5 bg-white border border-slate-100 px-2.5 py-0.5 rounded-md shadow-sm">
          <p className="text-[9px] text-slate-400 font-medium">Maks 10MB (.xlsx, .xls, .csv)</p>
        </div>
      </div>

      {/* List Uploaded Documents */}
      {files.length > 0 && (
        <div className="mt-4 flex-1 animate-in fade-in duration-300 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">File Siap Diproses ({files.length})</h3>

            {/* Indicator Petunjuk Kelengkapan & Validasi Mismatch */}
            <div className={`flex items-center gap-1 text-[10px] font-semibold ${
              hasMismatch 
                ? 'text-rose-600 font-bold' 
                : isFormValid 
                ? 'text-emerald-600' 
                : 'text-amber-500'
            }`}>
              {hasMismatch ? (
                <>
                  <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Pilihan opsi tidak sesuai dengan nama berkas</span>
                </>
              ) : isFormValid ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Informasi Lengkap</span>
                </>
              ) : (
                <span>* Lengkapi Tipe, Periode & Tahun</span>
              )}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 pb-1">
            {files.map((fileObj, index) => {
              const mismatchInfo = checkFileMismatch(fileObj);

              return (
                <div key={index} className={`relative group p-2.5 border rounded-xl bg-white shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                  mismatchInfo.isMismatch 
                    ? 'border-rose-300 bg-rose-50/20' 
                    : 'border-slate-200 hover:border-indigo-200'
                }`}>

                  {/* Left: Icon & File Name */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg font-bold text-[9px] flex items-center justify-center shrink-0 ${
                      mismatchInfo.isMismatch ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      XLSX
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate" title={fileObj.name}>
                        {fileObj.name}
                      </p>
                      {mismatchInfo.isMismatch ? (
                        <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>{mismatchInfo.reason}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] font-medium text-slate-400">
                          {fileObj.rawFile?.size ? (fileObj.rawFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Menunggu...'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Meta Inputs */}
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100/80">
                    <div className="flex items-center gap-2">

                      {/* Tipe (COB) */}
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5 tracking-wider">Kategori</span>
                        <select
                          value={fileObj.category || ''}
                          onChange={(e) => onUpdateFile(index, 'category', e.target.value)}
                          className={`bg-white border rounded-md text-[11px] px-2 py-1 w-[100px] focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm font-medium cursor-pointer ${
                            mismatchInfo.isMismatch && fileObj.category ? 'border-rose-400 text-rose-600 font-bold' : 'border-slate-200 text-slate-700'
                          } ${!fileObj.category ? 'text-slate-400' : ''}`}
                        >
                          <option value="" disabled className="text-slate-400">Pilih Tipe</option>
                          <option value="Premi" className="text-slate-700">Premi</option>
                          <option value="Claim" className="text-slate-700">Claim</option>
                        </select>
                      </div>

                      {/* Periode */}
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5 tracking-wider">Periode</span>
                        <select
                          value={fileObj.period || ''}
                          onChange={(e) => onUpdateFile(index, 'period', e.target.value)}
                          className={`bg-white border rounded-md text-[11px] px-2 py-1 w-[80px] focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm font-medium cursor-pointer ${
                            mismatchInfo.isMismatch && fileObj.period ? 'border-rose-400 text-rose-600 font-bold' : 'border-slate-200 text-slate-700'
                          } ${!fileObj.period ? 'text-slate-400' : ''}`}
                        >
                          <option value="" disabled className="text-slate-400">Pilih</option>
                          <option value="TW1" className="text-slate-700">TW1</option>
                          <option value="TW2" className="text-slate-700">TW2</option>
                          <option value="TW3" className="text-slate-700">TW3</option>
                          <option value="TW4" className="text-slate-700">TW4</option>
                          <option value="Q1" className="text-slate-700">Q1</option>
                          <option value="Q2" className="text-slate-700">Q2</option>
                          <option value="Q3" className="text-slate-700">Q3</option>
                          <option value="Q4" className="text-slate-700">Q4</option>
                        </select>
                      </div>

                      {/* Tahun */}
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5 tracking-wider">Tahun</span>
                        <select
                          value={fileObj.receivedDate || ''}
                          onChange={(e) => onUpdateFile(index, 'receivedDate', e.target.value)}
                          className={`bg-white border rounded-md text-[11px] px-2 py-1 w-[80px] focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm font-medium cursor-pointer ${
                            mismatchInfo.isMismatch && fileObj.receivedDate ? 'border-rose-400 text-rose-600 font-bold' : 'border-slate-200 text-slate-700'
                          } ${!fileObj.receivedDate ? 'text-slate-400' : ''}`}
                        >
                          <option value="" disabled className="text-slate-400">Pilih</option>
                          <option value="2026" className="text-slate-700">2026</option>
                          <option value="2025" className="text-slate-700">2025</option>
                          <option value="2024" className="text-slate-700">2024</option>
                          <option value="2023" className="text-slate-700">2023</option>
                          <option value="2022" className="text-slate-700">2022</option>
                          <option value="2021" className="text-slate-700">2021</option>
                          <option value="2020" className="text-slate-700">2020</option>
                          <option value="2019" className="text-slate-700">2019</option>
                          <option value="2018" className="text-slate-700">2018</option>
                          <option value="2017" className="text-slate-700">2017</option>
                          <option value="2016" className="text-slate-700">2016</option>
                          <option value="2015" className="text-slate-700">2015</option>
                          <option value="2014" className="text-slate-700">2014</option>
                          <option value="2013" className="text-slate-700">2013</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* Floating Delete Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="absolute -top-2 -right-2 bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                    title="Hapus file"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 mt-auto">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          disabled={files.length === 0}
        >
          Kosongkan
        </button>

        {/* TOMBOL LANJUT */}
        <button
          type="button"
          onClick={onScan}
          disabled={!isReady || !isFormValid || loading}
          className={`px-5 py-2 text-[11px] font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${isReady && isFormValid && !loading
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:-translate-y-px'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
          {loading ? 'Menginspeksi Berkas...' : 'Lanjut & Inspeksi Berkas'}
        </button>
      </div>
    </div>
  );
}