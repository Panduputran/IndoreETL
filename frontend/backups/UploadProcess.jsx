import { useState, useRef, useEffect } from 'react';
import { FileSpreadsheet, CheckCircle2, AlertTriangle, Layers, AlertCircle, HelpCircle, Filter, FileText, ChevronDown, Check } from 'lucide-react';
import { UploadWidget } from '../upload';
import { PreviewTable } from '../preview';
import SheetSelector from '../sheet-selection/components/SheetSelector';
import Button from '../../components/ui/Button';

export default function UploadProcess({ onComplete }) {
  // Current Phase: 1 = Upload, 3 = Preview
  const [currentPhase, setCurrentPhase] = useState(1);
  const [uploadMode, setUploadMode] = useState('batch');
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // State Sheet
  const availableSheets = [
    { name: 'Premi QS', rows: 850 },
    { name: 'Claim QS', rows: 320 },
    { name: 'Subro', rows: 140 }
  ];
  const [selectedSheets, setSelectedSheets] = useState(['Premi QS', 'Claim QS', 'Subro']);
  
  // STATE PREVIEW
  const [activePreviewSheet, setActivePreviewSheet] = useState('Premi QS');
  const [statusFilter, setStatusFilter] = useState('all');

  // STATE TREATY CODE & CUSTOM DROPDOWN
  const [isTreatyOpen, setIsTreatyOpen] = useState(false);
  const treatyDropdownRef = useRef(null);

  const [treatyData, setTreatyData] = useState({
    autoMatchedCode: 'TRY-ASK-FIRE-2026',
    selectedCode: 'TRY-ASK-FIRE-2026',
    name: 'Askrida Quota Share Fire Treaty 2026'
  });

  const masterTreaties = [
    { code: 'TRY-ASK-FIRE-2026', name: 'Askrida Quota Share Fire Treaty 2026' },
    { code: 'TRY-ASK-MARINE-2026', name: 'Askrida Marine Cargo Treaty 2026' },
    { code: 'TRY-TAK-PROPERTY-2026', name: 'Takaful Property QS Treaty 2026' },
    { code: 'TRY-JAS-ENGINEERING-2025', name: 'Jasindo Engineering Risk 2025' }
  ];

  // Close dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (treatyDropdownRef.current && !treatyDropdownRef.current.contains(event.target)) {
        setIsTreatyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // State Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock Data Preview
  const mockSheetData = {
    'Premi QS': {
      columns: ['policy_no', 'insured_name', 'cob', 'fire_tsi', 'fire_gross_premium', 'fire_commission'],
      data: [
        { _validationStatus: 'valid', _errorReason: null, policy_no: 'FIR-2026-001', insured_name: 'PT Sentosa Raya', cob: 'FIRE', fire_tsi: 'Rp 5.000.000.000', fire_gross_premium: 'Rp 25.000.000', fire_commission: 'Rp 3.750.000' },
        { _validationStatus: 'invalid', _errorReason: 'Kolom Kosong (TSI & Premi Mandatori)', policy_no: 'FIR-2026-002', insured_name: 'CV Abadi Makmur', cob: 'FIRE', fire_tsi: '', fire_gross_premium: '', fire_commission: 'Rp 900.000' }
      ]
    },
    'Claim QS': {
      columns: ['claim_no', 'policy_no', 'insured_name', 'claim_amount', 'loss_date'],
      data: [
        { _validationStatus: 'valid', _errorReason: null, claim_no: 'CLM-2026-881', policy_no: 'FIR-2026-001', insured_name: 'PT Sentosa Raya', claim_amount: 'Rp 150.000.000', loss_date: '2026-05-12' }
      ]
    },
    'Subro': {
      columns: ['subro_no', 'claim_no', 'recovered_amount', 'recovery_date'],
      data: [
        { _validationStatus: 'valid', _errorReason: null, subro_no: 'SUB-2026-009', claim_no: 'CLM-2026-881', recovered_amount: 'Rp 45.000.000', recovery_date: '2026-06-20' }
      ]
    }
  };

  const handleSheetSelectionChange = (newSheets) => {
    setSelectedSheets(newSheets);
    if (!newSheets.includes(activePreviewSheet) && newSheets.length > 0) {
      setActivePreviewSheet(newSheets[0]);
    }
  };

  const currentSheetRawData = mockSheetData[activePreviewSheet]?.data || [];
  const currentSheetColumns = mockSheetData[activePreviewSheet]?.columns || [];

  const totalRows = currentSheetRawData.length;
  const validCount = currentSheetRawData.filter(d => d._validationStatus === 'valid').length;
  const invalidCount = currentSheetRawData.filter(d => d._validationStatus === 'invalid' || d._validationStatus === 'warning').length;

  const filteredPreviewData = currentSheetRawData.filter((item) => {
    if (statusFilter === 'valid') return item._validationStatus === 'valid';
    if (statusFilter === 'invalid') return item._validationStatus === 'invalid' || item._validationStatus === 'warning';
    return true;
  });

  const handleExecuteEtl = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    }, 1000);
  };

  return (
    <div className="space-y-4 relative text-xs">
      
      {/* PHASE 1: UPLOAD WIDGET */}
      {currentPhase === 1 && (
        <UploadWidget 
          uploadMode={uploadMode}
          setUploadMode={setUploadMode}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onNext={() => setCurrentPhase(3)} 
        />
      )}

      {/* PHASE 3: PREVIEW TABLE & EKSPLORASI DATA */}
      {currentPhase === 3 && (
        <div className="animate-in fade-in bg-white rounded-2xl p-5 border border-slate-200 space-y-5">
          
          {/* Header Preview & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Preview Data Bordero</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Periksa kesesuaian data dari sheet terpilih sebelum diproses ke database.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" onClick={() => setCurrentPhase(1)}>
                &larr; Kembali ke Upload
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => setShowConfirmModal(true)}
                disabled={selectedSheets.length === 0 || !treatyData.selectedCode}
                className={selectedSheets.length === 0 || !treatyData.selectedCode ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Jalankan ETL & Simpan ({selectedSheets.length} Sheet)
              </Button>
            </div>
          </div>

          {/* CARD INFO TREATY CODE - CUSTOM DROPDOWN UI */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative">
            
            {/* Left Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-800 text-xs">Treaty Code Binding</h4>
                  
                  {treatyData.autoMatchedCode ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Auto-Detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Manual Required
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kode perjanjian reasuransi terikat yang akan digunakan pada data ini.
                </p>
              </div>
            </div>

            {/* Right: Custom Dropdown UI */}
            <div className="relative min-w-[280px]" ref={treatyDropdownRef}>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Kode Master Terpilih
              </span>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsTreatyOpen(!isTreatyOpen)}
                className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-3.5 py-2 text-left flex items-center justify-between gap-2 shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20"
              >
                <div className="min-w-0">
                  <span className="font-mono font-bold text-blue-700 block text-xs truncate">
                    {treatyData.selectedCode || 'Pilih Treaty Code'}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate font-medium">
                    {treatyData.name || 'Klik untuk memilih dari master'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isTreatyOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Options Menu */}
              {isTreatyOpen && (
                <div className="absolute right-0 mt-1.5 w-full md:w-[320px] bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-1.5 max-h-[220px] overflow-y-auto space-y-0.5 custom-scrollbar">
                    {masterTreaties.map((item, idx) => {
                      const isSelected = treatyData.selectedCode === item.code;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setTreatyData({
                              autoMatchedCode: treatyData.autoMatchedCode,
                              selectedCode: item.code,
                              name: item.name
                            });
                            setIsTreatyOpen(false);
                          }}
                          className={`p-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-mono text-xs block font-bold">{item.code}</span>
                            <span className="text-[10px] text-slate-400 block truncate font-normal">{item.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* COMPONENT 1: SHEET SELECTOR */}
          <SheetSelector 
            sheets={availableSheets}
            selectedSheets={selectedSheets}
            onSelect={handleSheetSelectionChange}
          />

          {/* GUARDRAIL KOSONG */}
          {selectedSheets.length === 0 ? (
            <div className="p-8 bg-amber-50/60 border border-dashed border-amber-300 rounded-2xl text-center space-y-2 flex flex-col items-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-bold text-amber-800 text-xs">Tidak Ada Sheet Yang Dipilih</p>
                <p className="text-[11px] text-amber-600 mt-0.5">
                  Silakan centang minimal satu sheet di atas untuk diproses ETL.
                </p>
              </div>
            </div>
          ) : (
            /* COMPONENT 2: TAB SWITCHER + FILTER STATUS */
            <div className="space-y-3 pt-2">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                
                {/* Switcher Sheet Active */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
                    Sheet:
                  </span>
                  {selectedSheets.map((sheetName) => (
                    <button
                      key={sheetName}
                      type="button"
                      onClick={() => setActivePreviewSheet(sheetName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        activePreviewSheet === sheetName
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                      <span>{sheetName}</span>
                    </button>
                  ))}
                </div>

                {/* Filter Status Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 shrink-0 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Filter:
                  </span>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      statusFilter === 'all'
                        ? 'bg-white text-slate-800 border border-slate-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Semua</span>
                    <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-slate-100 font-bold">{totalRows}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('valid')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      statusFilter === 'valid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm'
                        : 'text-slate-500 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Valid</span>
                    <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-100 text-emerald-800 font-bold">{validCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('invalid')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      statusFilter === 'invalid'
                        ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-sm'
                        : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Invalid</span>
                    <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${invalidCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-500'}`}>
                      {invalidCount}
                    </span>
                  </button>
                </div>

              </div>

              {/* PREVIEW TABLE */}
              <PreviewTable 
                columns={currentSheetColumns} 
                data={filteredPreviewData} 
              />
            </div>
          )}

        </div>
      )}

      {/* MODAL KONFIRMASI */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Jalankan Proses ETL?</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Data akan terikat dengan Treaty <strong className="text-blue-600">{treatyData.selectedCode}</strong> dan <strong className="text-slate-700">{selectedSheets.length} sheet terpilih</strong> akan disimpan ke database master.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="w-1/2 justify-center py-2 text-xs"
              >
                Batal
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleExecuteEtl}
                disabled={isProcessing}
                className="w-1/2 justify-center py-2 text-xs bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? 'Memproses...' : 'Ya, Jalankan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-xl border border-slate-100 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">ETL Berhasil!</h3>
            <p className="text-[11px] text-slate-500">Data terikat ke {treatyData.selectedCode} & berhasil disimpan.</p>
            <Button variant="primary" onClick={() => { setShowSuccessModal(false); onComplete?.(); }} className="w-full justify-center py-2">
              Selesai
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}