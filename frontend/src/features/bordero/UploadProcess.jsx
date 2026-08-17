import { useState } from 'react';
import { UploadWidget } from '../upload';
import EtlTerminalPage from '../etl/components/EtlTerminalPage';

export default function UploadProcess({ onComplete }) {
  const [uploadMode, setUploadMode] = useState('batch');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadData, setUploadData] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload' | 'terminal'

  const handleStartEtl = (dataFromWidget) => {
    setUploadData(dataFromWidget);
    setCurrentStep('terminal');
  };

  const handleCompleteEtl = (summaryFromTerminal) => {
    if (summaryFromTerminal) {
      const existingHistory = JSON.parse(localStorage.getItem('etl_history') || '[]');
      
      const newHistoryItem = {
        id: `BATCH-${Date.now()}`,
        isBatch: summaryFromTerminal.isBatch,
        title: summaryFromTerminal.title || "Upload Bordero",
        cedantCode: summaryFromTerminal.cedantCode || "CED-GENERAL",
        cedantName: summaryFromTerminal.cedantName || "Unknown",
        period: summaryFromTerminal.period || "2026",
        status: "success",
        message: `Berhasil memproses ${summaryFromTerminal.files.length} file (${summaryFromTerminal.totalRows.toLocaleString('id-ID')} baris data).`,
        startAt: summaryFromTerminal.startAt,
        completedAt: summaryFromTerminal.completedAt,
        files: summaryFromTerminal.files.map((f, idx) => ({
          id: f.id || Date.now() + idx,
          fileName: f.fileName,
          rows: f.rows,
          sheet: f.sheet,
          type: f.cob || "FIRE",
          status: f.status,
          logMessage: f.logMessage
        }))
      };

      const updatedHistory = [newHistoryItem, ...existingHistory];
      localStorage.setItem('etl_history', JSON.stringify(updatedHistory));
    }

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
          cedantName={uploadData?.cedant?.name}
          uploadMode={uploadData?.uploadMode || uploadMode}
          activityTitle={uploadData?.activityTitle}
          onComplete={handleCompleteEtl}
        />
      )}
    </div>
  );
}