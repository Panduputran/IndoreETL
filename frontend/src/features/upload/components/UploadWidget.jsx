import React, { useState, useRef } from 'react';
import CedantSearch from './CedantSearch';

export default function UploadWidget({
  onNext,
  onBackToHistory, // Prop untuk navigasi kembali ke riwayat
  uploadMode,     // Prop dari parent UploadProcess
  setUploadMode,  // Prop dari parent UploadProcess
}) {
  const [selectedCedant, setSelectedCedant] = useState(null);
  const [files, setFiles] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal Konfirmasi
  const [activityTitle, setActivityTitle] = useState(''); // State Judul Kegiatan (Kosong di Awal)
  const fileInputRef = useRef(null);

  // Toggle Single vs Batch Mode
  const handleToggleMode = () => {
    const nextMode = uploadMode === 'batch' ? 'single' : 'batch';
    setUploadMode(nextMode);

    if (nextMode === 'single' && files.length > 1) {
      setFiles([files[0]]);
    }
  };

  // Handler Drop Files
  const handleFilesDrop = (newFiles) => {
    const formattedFiles = newFiles.map((file) => ({
      rawFile: file,
      name: file.name,
      category: '',
      period: '',
      receivedDate: ''
    }));

    if (uploadMode === 'single') {
      setFiles([formattedFiles[0]]);
    } else {
      setFiles((prev) => [...prev, ...formattedFiles]);
    }
  };

  const handleFileInput = (e) => {
    if (!selectedCedant) {
      alert("Silakan pilih Nama Cedant terlebih dahulu!");
      return;
    }
    if (e.target.files?.length > 0) {
      handleFilesDrop(Array.from(e.target.files));
      e.target.value = null;
    }
  };

  const handleUpdateFile = (index, field, value) => {
    setFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFiles([]);
  };

  const handleSelectCedant = (cedant) => {
    setSelectedCedant(cedant);
    if (!cedant) {
      setFiles([]);
    }
  };

  // Trigger Modal Konfirmasi (Reset Title ke String Kosong)
  const handleOpenConfirm = () => {
    if (!selectedCedant || files.length === 0) return;
    setActivityTitle(''); // Pastikan polos tanpa autofill
    setShowConfirmModal(true);
  };

  // Eksekusi Konfirmasi ETL
  const handleConfirmScan = () => {
    setShowConfirmModal(false);
    if (onNext) {
      onNext({ 
        cedant: selectedCedant, 
        files: files,
        activityTitle: activityTitle.trim() // Kirim Judul Kegiatan hasil ketikan user
      });
    }
  };

  // Validasi jika semua input metadata sudah terisi
  const isFormValid = files.length > 0 && files.every((file) => {
    const hasCategory = Boolean(file.category && file.category.trim() !== '');
    const hasPeriod = Boolean(file.period && file.period.trim() !== '');
    const hasReceivedDate = Boolean(file.receivedDate && file.receivedDate.trim().length === 4);
    return hasCategory && hasPeriod && hasReceivedDate;
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full space-y-5 text-xs relative overflow-hidden">

      {/* HEADER UTAMA CARD + TOMBOL KEMBALI KE RIWAYAT */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Upload Berkas Bordero</h2>

        {/* Tombol Sejajar di Kanan Header Card Upload */}
        <button
          type="button"
          onClick={onBackToHistory}
          className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>&larr; Kembali ke Riwayat</span>
        </button>
      </div>

      {/* STRUKTUR GRID 2X2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* BARIS 1 (ATAS KIRI): Cedant Search */}
        <div className="lg:col-span-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-center">
          <CedantSearch selected={selectedCedant} onSelect={handleSelectCedant} />
        </div>

        {/* BARIS 1 (ATAS KANAN): Info System Status */}
        <div className="lg:col-span-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Status Engine
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
              selectedCedant 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-white text-slate-400 border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${selectedCedant ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>{selectedCedant ? 'Auto-Match Ready' : 'Menunggu Cedant'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-normal">Format:</span>
              <span className="font-mono font-bold text-indigo-600">.XLSX / .CSV</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-normal">Max Size:</span>
              <span className="font-mono font-bold text-slate-800">10 MB</span>
            </div>
          </div>
        </div>

        {/* BARIS 2 (BAWAH KIRI): Upload Dropzone Box */}
        <div className="lg:col-span-5 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800">Unggah Berkas</h3>
            <button
              type="button"
              onClick={handleToggleMode}
              className="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-all shadow-2xs cursor-pointer"
            >
              Mode: <span className="text-indigo-600 uppercase">{uploadMode}</span>
            </button>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!selectedCedant) {
                alert("Silakan pilih Nama Cedant terlebih dahulu!");
                return;
              }
              if (e.dataTransfer.files?.length > 0) {
                handleFilesDrop(Array.from(e.dataTransfer.files));
              }
            }}
            onClick={() => selectedCedant && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all h-full min-h-[160px] ${
              !selectedCedant
                ? 'border-slate-200 bg-slate-100/50 opacity-60 cursor-not-allowed'
                : 'border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 cursor-pointer'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              disabled={!selectedCedant}
              className="hidden"
              multiple={uploadMode === 'batch'}
              accept=".xlsx, .xls, .csv"
            />

            <div className={`w-10 h-10 mb-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${
              !selectedCedant ? 'text-slate-300' : 'text-indigo-500'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>

            <p className="text-xs font-bold text-slate-700 text-center">
              {!selectedCedant
                ? 'Pilih Nama Cedant terlebih dahulu'
                : uploadMode === 'single' && files.length > 0
                  ? 'Tarik file baru untuk mengganti'
                  : 'Tarik & letakkan file di sini'
              }
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">atau klik untuk memilih berkas</p>
          </div>
        </div>

        {/* BARIS 2 (BAWAH KANAN): List File Diproses */}
        <div className="lg:col-span-7 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-3">
              <h3 className="text-xs font-bold text-slate-800">
                File Siap Diproses ({files.length})
              </h3>
              <span className={`text-[10px] font-semibold ${isFormValid ? 'text-emerald-600' : 'text-amber-500'}`}>
                {files.length === 0 ? '' : isFormValid ? '✓ Informasi Lengkap' : '* Lengkapi Tipe, Periode & Tahun'}
              </span>
            </div>

            {files.length === 0 ? (
              <div className="h-[150px] flex items-center justify-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl bg-white/50">
                Belum ada berkas yang diunggah
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                {files.map((fileObj, index) => (
                  <div key={index} className="relative group p-2.5 border border-slate-200 rounded-xl bg-white shadow-2xs hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                        XLSX
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

                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                      
                      {/* Tipe */}
                      <div className="flex flex-col">
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 ml-1 mb-0.5">Tipe (COB)</span>
                        <select
                          value={fileObj.category || ''}
                          onChange={(e) => handleUpdateFile(index, 'category', e.target.value)}
                          className={`bg-white border border-slate-200 rounded text-[10px] px-1.5 py-1 w-[90px] outline-none shadow-2xs font-medium cursor-pointer ${
                            !fileObj.category ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          <option value="" disabled>Pilih Tipe</option>
                          <option value="Premi" className="text-slate-700">Premi</option>
                          <option value="Claim" className="text-slate-700">Claim</option>
                          <option value="Subro" className="text-slate-700">Subro</option>
                          <option value="Premi-Claim" className="text-slate-700">Premi-Claim</option>
                          <option value="Premi-Subro" className="text-slate-700">Premi-Subro</option>
                          <option value="Claim-Subro" className="text-slate-700">Claim-Subro</option>
                          <option value="Semua" className="text-slate-700">Semua</option>
                        </select>
                      </div>

                      {/* Periode */}
                      <div className="flex flex-col">
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 ml-1 mb-0.5">Periode</span>
                        <select
                          value={fileObj.period || ''}
                          onChange={(e) => handleUpdateFile(index, 'period', e.target.value)}
                          className={`bg-white border border-slate-200 rounded text-[10px] px-1.5 py-1 w-[75px] outline-none shadow-2xs font-medium cursor-pointer ${
                            !fileObj.period ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          <option value="" disabled>Pilih</option>
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
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 ml-1 mb-0.5">Tahun</span>
                        <select
                          value={fileObj.receivedDate || ''}
                          onChange={(e) => handleUpdateFile(index, 'receivedDate', e.target.value)}
                          className={`bg-white border border-slate-200 rounded text-[10px] px-1.5 py-1 w-[75px] outline-none shadow-2xs font-medium cursor-pointer ${
                            !fileObj.receivedDate ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          <option value="" disabled>Pilih</option>
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

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-1.5 -right-1.5 bg-white text-slate-400 border border-slate-200 hover:text-rose-500 rounded-full p-0.5 shadow-2xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Hapus file"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-2.5 mt-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={files.length === 0}
              className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
            >
              Kosongkan
            </button>

            <button
              type="button"
              onClick={handleOpenConfirm}
              disabled={!selectedCedant || !isFormValid}
              className={`px-5 py-2 text-[11px] font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                selectedCedant && isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:-translate-y-px'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>Lanjut ke Proses ETL</span>
            </button>
          </div>

        </div>

      </div>

      {/* MODAL KONFIRMASI (TANPA AUTOFILL / MURNI INPUT MANUAL USER) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Konfirmasi Upload ETL</h3>
                <p className="text-[11px] text-slate-500">Masukkan judul kegiatan & periksa ringkasan berkas.</p>
              </div>
            </div>

            {/* INPUT FIELD JUDUL KEGIATAN (KOSONG / POLOS) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                Judul Kegiatan / Batch <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="Ketik judul kegiatan di sini..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* RINGKASAN DATA */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2 text-[11px]">
              
              {/* KODE & NAMA CEDANT */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cedant:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]" title={selectedCedant?.name || selectedCedant}>
                  {selectedCedant?.code ? `[${selectedCedant.code}] ` : ''}{selectedCedant?.name || selectedCedant}
                </span>
              </div>

              {/* JUMLAH BERKAS */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Mode Upload:</span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                  {uploadMode} ({files.length} File)
                </span>
              </div>

              {/* DAFTAR FILE RINGKAS (FORMAT PERIODE + TAHUN) */}
              <div className="pt-1.5 border-t border-slate-200/60 space-y-1 max-h-[100px] overflow-y-auto pr-1">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Daftar Berkas:</span>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-[10.5px] bg-white border border-slate-200/60 px-2 py-1 rounded-lg">
                    <span className="truncate max-w-[180px] font-medium text-slate-700">{f.name}</span>
                    <span className="text-slate-400 text-[9.5px] font-mono">{f.category} | {f.period} {f.receivedDate}</span>
                  </div>
                ))}
              </div>

            </div>

            <p className="text-[10px] text-slate-400 italic">
              Setelah dikonfirmasi, sistem akan mengekstrak sheet dan mencatat riwayat batch.
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!activityTitle.trim()}
                onClick={handleConfirmScan}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                  activityTitle.trim()
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Ya, Jalankan ETL
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}