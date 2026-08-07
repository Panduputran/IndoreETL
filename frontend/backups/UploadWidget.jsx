import { useState } from 'react';
import CedantSearch from './CedantSearch';
import UploadBox from './UploadBox';
import { scanFile } from '../../../api/borderoApi'; // Import API lu yang tadi

export default function UploadWidget({ onScanSuccess }) {
  // State untuk parameter
  const [jenisProses, setJenisProses] = useState('premi');
  const [cedant, setCedant] = useState(null);
  
  // State untuk files & loading
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handler untuk Dropzone
  const handleFilesDrop = (newFiles) => {
    // Gabung file lama dengan file baru, hindari duplikat nama
    setFiles((prev) => {
      const existingNames = prev.map((f) => f.name);
      const filteredNew = newFiles.filter((f) => !existingNames.includes(f.name));
      return [...prev, ...filteredNew];
    });
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFiles([]);
    setCedant(null);
    setJenisProses('premi');
  };

  // Handler ketika tombol "Next Step: Preview" di-klik
  const handleScan = async () => {
    if (!cedant || files.length === 0) return;
    
    setLoading(true);
    
    try {
      // Karena API lu (scanFile) nerima 1 file, kita loop pakai Promise.all kalau filenya banyak (Batch)
      const scanPromises = files.map(file => 
        scanFile(file, { 
          jenisProses: jenisProses, 
          cedant: cedant.name // Passing string sesuai format API lu
        })
      );

      // Tunggu semua file selesai di-scan backend
      const scanResults = await Promise.all(scanPromises);

      // Lempar hasilnya ke halaman utama (Orchestrator) untuk lanjut ke fase Preview
      onScanSuccess(scanResults, files); 

    } catch (error) {
      console.error("Gagal melakukan scan:", error);
      alert("Terjadi kesalahan saat memindai file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* KIRI: Setup Parameter (Lebar 4 kolom) */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border-0">
          <h2 className="text-base font-bold text-slate-900 mb-5">Parameter Setup</h2>
          
          {/* Toggle Jenis Proses */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Jenis Proses
            </label>
            <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setJenisProses('premi')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  jenisProses === 'premi'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Premi
              </button>
              <button
                type="button"
                onClick={() => setJenisProses('klaim')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  jenisProses === 'klaim'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Klaim
              </button>
            </div>
          </div>

          {/* Search Cedant */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Pilih Cedant
            </label>
            <CedantSearch selected={cedant} onSelect={setCedant} />
          </div>
        </div>
        
        {/* Info Box Opsional bergaya SaaS */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800/80 leading-relaxed">
              Pastikan Anda memilih <b>Cedant</b> dan <b>Jenis Proses</b> yang sesuai sebelum mengunggah dokumen Excel untuk menghindari kegagalan validasi.
            </p>
          </div>
        </div>
      </div>

      {/* KANAN: Upload Zone (Lebar 8 kolom) */}
      <div className="lg:col-span-8 h-full">
        <UploadBox
          files={files}
          onFilesDrop={handleFilesDrop}
          onRemoveFile={handleRemoveFile}
          onScan={handleScan}
          onReset={handleReset}
          loading={loading}
          isReady={cedant !== null} // Tombol Scan hanya aktif kalau cedant udah dipilih
        />
      </div>

    </div>
  );
}