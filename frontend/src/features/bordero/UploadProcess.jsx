import { useState } from 'react';
import { UploadWidget } from '../upload';

// Import Halaman Terminal CMD ETL
import EtlTerminalPage from '../etl/components/EtlTerminalPage';

export default function UploadProcess({ onComplete }) {
  const [uploadMode, setUploadMode] = useState('batch');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // State untuk menyimpan data payload dari UploadWidget (cedant, files & activityTitle)
  const [uploadData, setUploadData] = useState(null);

  // View State: 'upload' atau 'terminal'
  const [currentStep, setCurrentStep] = useState('upload');

  const masterTreaties = [
    { code: 'TRY-ASK-FIRE-2026', name: 'Askrida Quota Share Fire Treaty 2026' },
    { code: 'TRY-ASK-MARINE-2026', name: 'Askrida Marine Cargo Treaty 2026' },
    { code: 'TRY-TAK-PROPERTY-2026', name: 'Takaful Property QS Treaty 2026' },
    { code: 'TRY-JAS-ENGINEERING-2025', name: 'Jasindo Engineering Risk 2025' }
  ];

  // Handler saat tombol 'Lanjut ke Proses ETL' di UploadWidget diklik
  const handleStartEtl = (dataFromWidget) => {
    setUploadData(dataFromWidget); // Simpan cedant, files, & activityTitle
    setCurrentStep('terminal');     // Pindah ke Halaman ETL Terminal
  };

  // Handler saat ETL di EtlTerminalPage selesai
  const handleCompleteEtl = () => {
    if (uploadData) {
      // Ambil riwayat yang sudah ada di localStorage (atau buat array kosong)
      const existingHistory = JSON.parse(localStorage.getItem('etl_history') || '[]');
      const now = new Date().toLocaleString('id-ID');

      // Ambil file pertama untuk mengekstrak periode + tahun
      const firstFile = uploadData.files[0];
      const combinedPeriod = firstFile 
        ? `${firstFile.period || ''} ${firstFile.receivedDate || ''}`.trim() 
        : '2026';

      // Buat Objek History Baru
      const newHistoryItem = {
        id: `BATCH-2026-${String(existingHistory.length + 1).padStart(3, '0')}`,
        isBatch: uploadData.files.length > 1,
        title: uploadData.activityTitle || "Upload Bordero",
        cedantCode: uploadData.cedant?.code || "CDT-999",
        cedantName: uploadData.cedant?.name || uploadData.cedant || "Unknown",
        period: combinedPeriod || "2026", // Menggabungkan Periode & Tahun (misal: "TW1 2026")
        status: "success",
        message: `File processed successfully (${uploadData.files.length} file).`,
        startAt: now,
        completedAt: now,
        files: uploadData.files.map((f, idx) => ({
          id: Date.now() + idx,
          fileName: f.name || f.rawFile?.name || "file_bordero.xlsx",
          rows: Math.floor(Math.random() * 800) + 200, // Simulasi jumlah baris data
          type: f.category || "PROS"
        }))
      };

      // Simpan item baru di urutan teratas ke localStorage
      const updatedHistory = [newHistoryItem, ...existingHistory];
      localStorage.setItem('etl_history', JSON.stringify(updatedHistory));
    }

    // Panggil callback navigasi kembali ke History
    onComplete?.();
  };

  return (
    <div className="space-y-4 relative text-xs">
      {currentStep === 'upload' ? (
        <UploadWidget
          uploadMode={uploadMode}
          setUploadMode={setUploadMode}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onNext={handleStartEtl}
          onBackToHistory={onComplete}
        />
      ) : (
        <EtlTerminalPage
          files={uploadData?.files || []}
          cedantCode={uploadData?.cedant?.code}
          cedantName={uploadData?.cedant?.name || uploadData?.cedant}
          masterTreaties={masterTreaties}
          onComplete={handleCompleteEtl}
        />
      )}
    </div>
  );
}