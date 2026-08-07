import { useState } from 'react';
import { UploadWidget } from '../upload';
import { SheetSelector } from '../sheet-selection';
import { MappingTable } from '../mapping';
import { PreviewTable } from '../preview';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';

export default function UploadProcess({ onComplete }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState('Premi (COB)');
  
  // State untuk Modal Sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Dummy State
  const dummySheets = [
    { id: 'premi', name: 'Premi (COB)', rows: 1250 },
    { id: 'klaim', name: 'Klaim', rows: 430 }
  ];

  const dummyDbColumns = [
    { name: 'no_polis', isRequired: true },
    { name: 'tertanggung', isRequired: true },
    { name: 'periode', isRequired: true },
    { name: 'tsi', isRequired: true },
    { name: 'gross_premium', isRequired: true },
    { name: 'komisi', isRequired: false },
    { name: 'net_premium', isRequired: false }
  ];

  const dummyMappings = [
    { sourceCol: { name: 'NO_POLIS', type: 'String' }, targetCol: 'no_polis', status: 'auto' },
    { sourceCol: { name: 'NAMA_INSURED', type: 'String' }, targetCol: 'tertanggung', status: 'auto' },
    { sourceCol: { name: 'PERIODE_UW', type: 'String' }, targetCol: 'periode', status: 'auto' },
    { sourceCol: { name: 'TSI_RP', type: 'Number' }, targetCol: 'tsi', status: 'auto' },
    { sourceCol: { name: 'GROSS_PREMI', type: 'Number' }, targetCol: 'gross_premium', status: 'auto' },
    { sourceCol: { name: 'KOMISI_RP', type: 'Number' }, targetCol: 'komisi', status: 'manual' },
    { sourceCol: { name: 'NET_PREMI', type: 'Number' }, targetCol: 'net_premium', status: 'auto' }
  ];

  const previewColumns = [
    'no_polis',
    'tertanggung',
    'periode',
    'tsi',
    'gross_premium',
    'komisi',
    'net_premium'
  ];

  // Mockup Data Hasil Cleansing / Validation (5 Baris dengan variasi status)
  const previewData = [
    {
      _validationStatus: 'valid',
      no_polis: 'POL-2026-001',
      tertanggung: 'PT Sentosa Raya',
      periode: 'TW1 2026',
      tsi: 'Rp 5.000.000.000',
      gross_premium: 'Rp 25.000.000',
      komisi: 'Rp 3.750.000',
      net_premium: 'Rp 21.250.000'
    },
    {
      _validationStatus: 'valid',
      no_polis: 'POL-2026-002',
      tertanggung: 'CV Abadi Makmur',
      periode: 'TW1 2026',
      tsi: 'Rp 1.200.000.000',
      gross_premium: 'Rp 6.000.000',
      komisi: 'Rp 900.000',
      net_premium: 'Rp 5.100.000'
    },
    {
      _validationStatus: 'error',
      _errorMessage: 'Nilai TSI tidak boleh kosong atau 0',
      no_polis: 'POL-2026-003',
      tertanggung: 'PT Nusantara Jaya',
      periode: 'TW1 2026',
      tsi: '0',
      gross_premium: 'Rp 12.000.000',
      komisi: 'Rp 1.800.000',
      net_premium: 'Rp 10.200.000'
    },
    {
      _validationStatus: 'warning',
      _warningMessage: 'Format periode terdeteksi beda standar, telah disesuaikan otomatis',
      no_polis: 'POL-2026-004',
      tertanggung: 'PT Buana Utama',
      periode: '2026-Q1',
      tsi: 'Rp 8.500.000.000',
      gross_premium: 'Rp 42.500.000',
      komisi: 'Rp 6.375.000',
      net_premium: 'Rp 36.125.000'
    },
    {
      _validationStatus: 'valid',
      no_polis: 'POL-2026-005',
      tertanggung: 'Koperasi Sejahtera',
      periode: 'TW1 2026',
      tsi: 'Rp 750.000.000',
      gross_premium: 'Rp 3.750.000',
      komisi: 'Rp 562.500',
      net_premium: 'Rp 3.187.500'
    }
  ];

  const handleRunETL = () => {
    // Tampilkan modal custom pengganti alert()
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    onComplete(); // Balik ke halaman history
  };

  return (
    <div className="space-y-6 relative">
      {/* PHASE 1: UPLOAD FILE */}
      {currentPhase === 1 && (
        <div className="animate-in fade-in bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <UploadWidget onScanSuccess={() => setCurrentPhase(2)} />
        </div>
      )}

      {/* PHASE 2: MAPPING & CONFIGURATION */}
      {currentPhase === 2 && (
        <div className="animate-in fade-in space-y-6">
          {!isConfiguring ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 min-h-[400px]">
              <EmptyState
                title="Data Siap Dikonfigurasi"
                action={
                  <Button variant="primary" onClick={() => setIsConfiguring(true)}>
                    Mulai Konfigurasi
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <SheetSelector
                  sheets={dummySheets}
                  selectedSheet={selectedSheet}
                  onSelect={setSelectedSheet}
                />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <MappingTable
                  selectedSheet={selectedSheet}
                  dbColumns={dummyDbColumns}
                  mappings={dummyMappings}
                />

                <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setCurrentPhase(1)}>
                    Kembali ke Upload
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentPhase(3)}>
                    Lanjut Preview & Validate
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* PHASE 3: PREVIEW & ETL EXECUTION */}
      {currentPhase === 3 && (
        <div className="animate-in fade-in bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => setCurrentPhase(2)}>
              Kembali ke Mapping
            </Button>
            <Button variant="primary" onClick={handleRunETL}>
              Jalankan ETL
            </Button>
          </div>
          <PreviewTable columns={previewColumns} data={previewData} />
        </div>
      )}

      {/* MODAL SUKSES (Pengganti alert) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            {/* Icon Centang */}
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1">
              ETL Berhasil Dijalankan!
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Seluruh data bordero telah berhasil diproses, dikondisikan, dan dimasukkan ke dalam database.
            </p>

            <Button variant="primary" onClick={handleModalClose} className="w-full justify-center py-2.5 bg-blue-600 hover:bg-blue-700">
              Selesai & Lihat Riwayat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}