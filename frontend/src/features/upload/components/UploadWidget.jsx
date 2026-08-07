import { useState } from 'react';
import CedantSearch from './CedantSearch';
import UploadBox from './UploadBox';
import { scanFile } from '../../../api/borderoApi';

export default function UploadWidget({ onScanSuccess }) {
  const [cedant, setCedant] = useState(null);
  
  const [uploadMode, setUploadMode] = useState('batch'); 
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleUploadMode = () => {
    if (uploadMode === 'batch') {
      setUploadMode('single');
      if (files.length > 1) {
        setFiles([files[0]]);
      }
    } else {
      setUploadMode('batch');
    }
  };

  // HANDLER DROPZONE DIUPDATE DI SINI
  const handleFilesDrop = (newFiles) => {
    if (uploadMode === 'single') {
      // Validasi: Cegah user drag & drop lebih dari 1 file
      if (newFiles.length > 1) {
        alert("Peringatan: Dalam Single Mode, Anda hanya dapat mengunggah 1 file sekaligus. Silakan ubah ke Batch Mode untuk file banyak.");
        return; // Hentikan eksekusi, file ditolak
      }
      
      const f = newFiles[0];
      setFiles([{
        rawFile: f,
        name: f.name,
        category: 'All', 
        period: '',
        receivedDate: ''
      }]);
    } else {
      setFiles((prev) => {
        const existingNames = prev.map((f) => f.name);
        const filteredNew = newFiles
          .filter((f) => !existingNames.includes(f.name))
          .map((f) => ({
            rawFile: f,
            name: f.name,
            category: 'All', 
            period: '',
            receivedDate: ''
          }));
        return [...prev, ...filteredNew];
      });
    }
  };

  const handleUpdateFile = (index, field, value) => {
    setFiles((prev) => 
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFiles([]);
    setCedant(null);
  };

  const handleScan = async () => {
    if (!cedant || files.length === 0) return;
    
    setLoading(true);
    
    try {
      const scanPromises = files.map(fileObj => 
        scanFile(fileObj.rawFile, { 
          jenisProses: fileObj.category,
          cedant: cedant.name, 
          period: fileObj.period,
          receivedDate: fileObj.receivedDate
        })
      );

      const scanResults = await Promise.all(scanPromises);
      onScanSuccess(scanResults, files); 

    } catch (error) {
      console.error("Gagal melakukan scan:", error);
      alert("Terjadi kesalahan saat memindai file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* KIRI: Setup Parameter */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight mb-4">Parameter Setup</h2>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Cedant
            </label>
            <CedantSearch selected={cedant} onSelect={setCedant} />
          </div>

          {cedant && (
            <div className="mt-5 p-4 bg-slate-50 border border-slate-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Detail Cedant Terpilih</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Nama Perusahaan</p>
                  <p className="text-xs font-semibold text-slate-700">{cedant.name || 'Unknown'}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border border-transparent border-t-slate-200/60">
                  <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Kode Cedant</p>
                    <p className="text-xs font-semibold text-slate-700">{cedant.code || 'CD-REQ-001'}</p> 
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 mb-0.5">Status Kontrak</p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-indigo-800/80 leading-relaxed">
              Pastikan Anda memilih <b>Cedant</b> dan melengkapi detail pada masing-masing dokumen di sebelah kanan sebelum mengunggah.
            </p>
          </div>
        </div>
      </div>

      {/* KANAN: Upload Zone */}
      <div className="lg:col-span-8 h-full">
        <UploadBox
          files={files}
          onFilesDrop={handleFilesDrop}
          onRemoveFile={handleRemoveFile}
          onUpdateFile={handleUpdateFile}
          onScan={handleScan}
          onReset={handleReset}
          loading={loading}
          isReady={cedant !== null} 
          uploadMode={uploadMode}
          onToggleMode={toggleUploadMode}
        />
      </div>

    </div>
  );
}