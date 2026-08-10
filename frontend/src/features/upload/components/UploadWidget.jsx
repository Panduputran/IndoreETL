import React, { useState } from 'react';
import CedantSearch from './CedantSearch';
import UploadBox from './UploadBox';

export default function UploadWidget({
  onNext,
  uploadMode,     // Prop dari parent UploadProcess
  setUploadMode,  // Prop dari parent UploadProcess
}) {
  const [selectedCedant, setSelectedCedant] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // FUNGSI TOGGLE MODE YANG BENAR
  const handleToggleMode = () => {
    const nextMode = uploadMode === 'batch' ? 'single' : 'batch';
    setUploadMode(nextMode);

    // Kalau pindah ke Single mode dan file lebih dari 1, pangkas sisa filenya
    if (nextMode === 'single' && files.length > 1) {
      setFiles([files[0]]);
    }
  };

  // Handler saat file baru dipilih / di-drop
  const handleFilesDrop = (newFiles) => {
    const formattedFiles = newFiles.map((file) => ({
      rawFile: file,
      name: file.name,
      category: '',
      period: '',
      receivedDate: ''
    }));

    if (uploadMode === 'single') {
      // Single Mode: Selalu ganti dengan 1 file paling baru
      setFiles([formattedFiles[0]]);
    } else {
      // Batch Mode: Tambahkan ke antrean
      setFiles((prev) => [...prev, ...formattedFiles]);
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

  const handleScan = () => {
    if (!selectedCedant || files.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onNext) {
        onNext({ cedant: selectedCedant, files: files });
      }
    }, 600);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-800">Upload Berkas Bordero</h2>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Pilih nama Cedant perusahaan dan unggah berkas IPR mentah (.xlsx / .csv).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 h-full">
          <CedantSearch selected={selectedCedant} onSelect={handleSelectCedant} />

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex-1 flex flex-col justify-between space-y-3 min-h-[140px]">
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className={`w-2 h-2 rounded-full ${selectedCedant ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                <span className="font-bold text-slate-700 text-xs">Informasi Template & Sistem:</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Status Template:</span>
                  <span className={`font-semibold ${selectedCedant ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200' : 'text-slate-400'}`}>
                    {selectedCedant ? '✓ Auto-Match Ready' : 'Menunggu Cedant'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Ekstensi Diizinkan:</span>
                  <span className="font-mono font-medium text-slate-700">.xlsx, .xls, .csv</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Maks. Batas Berkas:</span>
                  <span className="font-mono font-medium text-slate-700">10 MB / File</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 text-[10px] text-blue-700 leading-relaxed flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <strong>Tips ETL:</strong> Setelah mengunggah, backend akan langsung melakukan pengikatan (binding) kolom header sesuai aturan template Cedant terpilih.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 h-full">
          <UploadBox
            files={files}
            onFilesDrop={handleFilesDrop}
            onRemoveFile={handleRemoveFile}
            onUpdateFile={handleUpdateFile}
            onScan={handleScan}
            onReset={handleReset}
            loading={loading}
            isReady={!!selectedCedant}
            uploadMode={uploadMode}
            onToggleMode={handleToggleMode} // PASSING FUNGSI TOGGLE DI SINI
          />
        </div>
      </div>
    </div>
  );
}