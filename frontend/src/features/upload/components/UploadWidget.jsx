import React, { useState, useRef, useEffect } from "react";
import { Search, X, UploadCloud, ArrowRight } from "lucide-react";
import { CEDANTS } from "../../../constants/data";
import { inspectFile } from "../../../api/borderoApi";
import { detectPeriodAndYear, detectCobFromSheet } from "../../../utils/fileUtils";
import FileQueueItem from "./FileQueueItem";

const SESSION_KEY = "etl_upload_widget_state";

export default function UploadWidget({
  onNext,
  onBackToHistory,
  uploadMode = "batch",
  setUploadMode,
}) {
  const [selectedCedant, setSelectedCedant] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved).selectedCedant : null;
  });

  const [files, setFiles] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved).files : [];
  });

  // State Pilihan Tipe Periode Global di Atas (Kuartal / Bulanan)
  const [globalPeriodType, setGlobalPeriodType] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved).globalPeriodType || "quarterly" : "quarterly";
  });

  const [cedantSearchQuery, setCedantSearchQuery] = useState("");
  const [isCedantDropdownOpen, setIsCedantDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState("");

  const cedantWrapperRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ selectedCedant, files, globalPeriodType })
    );
  }, [selectedCedant, files, globalPeriodType]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (cedantWrapperRef.current && !cedantWrapperRef.current.contains(e.target)) {
        setIsCedantDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCedants = CEDANTS.filter(
    (c) =>
      c.name.toLowerCase().includes(cedantSearchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(cedantSearchQuery.toLowerCase())
  );

  // Jika user mengubah tipe periode di atas, update semua file yang ada di antrean
  const handleGlobalPeriodTypeChange = (newType) => {
    setGlobalPeriodType(newType);
    const defaultVal = newType === "monthly" ? "JAN" : "TW1";
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        period: defaultVal,
      }))
    );
  };

  const handleAddFiles = async (incomingFiles) => {
    if (!selectedCedant) {
      alert("Silakan pilih Nama Cedant terlebih dahulu!");
      return;
    }

    const validFiles = Array.from(incomingFiles).filter(
      (f) => f.name.endsWith(".xlsx") || f.name.endsWith(".xls") || f.name.endsWith(".csv")
    );
    if (!validFiles.length) return;

    const defaultCobForCedant = selectedCedant.defaultCob || "FIRE";

    const newFileObjects = validFiles.map((file) => {
      const detected = detectPeriodAndYear(file.name);
      
      // Sesuaikan default period berdasarkan mode global aktif jika nama file tidak terdeteksi
      let initialPeriod = detected.period;
      if (globalPeriodType === "monthly" && !['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGT', 'SEP', 'OKT', 'NOV', 'DES'].includes(initialPeriod)) {
        initialPeriod = "JAN";
      } else if (globalPeriodType === "quarterly" && !['Q1', 'Q2', 'Q3', 'Q4', 'TW1', 'TW2', 'TW3', 'TW4'].includes(initialPeriod)) {
        initialPeriod = "TW1";
      }

      return {
        rawFile: file,
        name: file.name,
        size: file.size,
        category: detected.category,
        period: initialPeriod,
        receivedDate: detected.year,
        isInspecting: true,
        file_id: null,
        available_sheets: [],
        available_cobs: [],
        selectedSheet: "",
        cob: defaultCobForCedant,
      };
    });

    const targetList = uploadMode === "single" ? newFileObjects.slice(0, 1) : [...files, ...newFileObjects];
    setFiles(targetList);

    const inspectPromises = targetList.map(async (item) => {
      if (!item.isInspecting || !item.rawFile) return item;

      try {
        const res = await inspectFile(item.rawFile, item.category, selectedCedant.code);
        const sheets = res.data?.available_sheets || [];
        const returnedFileId = res.data?.file_id || null;

        const detectedCobs = sheets.map((sheet) => ({
          sheetName: sheet,
          cobCode: detectCobFromSheet(sheet),
        }));

        const defaultSheet = sheets[0] || "";
        const finalCob = defaultCobForCedant === "CREDIT" ? "CREDIT" : (detectedCobs[0]?.cobCode || "FIRE");

        return {
          ...item,
          isInspecting: false,
          file_id: returnedFileId,
          available_sheets: sheets,
          available_cobs: detectedCobs,
          selectedSheet: defaultSheet,
          cob: finalCob,
        };
      } catch (err) {
        console.error(`Gagal inspect file ${item.name}:`, err);
        return { ...item, isInspecting: false };
      }
    });

    const resolvedFiles = await Promise.all(inspectPromises);
    setFiles(resolvedFiles);
  };

  const handleUpdateFileField = (index, field, value) => {
    setFiles((prev) =>
      prev.map((f, i) => {
        if (i === index) {
          if (field === "cob") {
            const matched = f.available_cobs?.find((c) => c.cobCode === value);
            return {
              ...f,
              cob: value,
              selectedSheet: matched ? matched.sheetName : f.selectedSheet,
            };
          }
          return { ...f, [field]: value };
        }
        return f;
      })
    );
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const isFormValid =
    selectedCedant &&
    files.length > 0 &&
    files.every(
      (f) => !f.isInspecting && f.file_id && f.category && f.cob && f.period && f.receivedDate
    );

  const expectedConfirmationText = selectedCedant
    ? `${selectedCedant.code.toUpperCase()}-PROCESS-ALL`
    : "CONFIRM";

  const handleExecuteFinal = () => {
    if (confirmInputText.trim() !== expectedConfirmationText) return;
    setShowConfirmModal(false);

    if (onNext) {
      onNext({
        cedant: selectedCedant,
        files: files,
        uploadMode: uploadMode,
        activityTitle: expectedConfirmationText,
      });
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xs border border-slate-200/80 w-full space-y-6 text-xs font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Upload Berkas Bordero</h1>
        <button
          type="button"
          onClick={onBackToHistory}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          &larr; Kembali ke Riwayat
        </button>
      </div>

      {/* Row 1: Cedant Selector & Engine Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/70 relative" ref={cedantWrapperRef}>
          <label className="block font-bold text-slate-700 mb-1.5">
            Nama / Kode Cedant Perusahaan <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
            {selectedCedant && (
              <span className="ml-2 font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md shrink-0">
                {selectedCedant.code.toUpperCase()}
              </span>
            )}
            <input
              type="text"
              placeholder={selectedCedant ? selectedCedant.name : "Cari atau pilih nama cedant..."}
              value={selectedCedant ? selectedCedant.name : cedantSearchQuery}
              onChange={(e) => {
                setCedantSearchQuery(e.target.value);
                if (selectedCedant) setSelectedCedant(null);
                setIsCedantDropdownOpen(true);
              }}
              onFocus={() => setIsCedantDropdownOpen(true)}
              className="w-full py-2.5 px-3 bg-transparent text-xs font-semibold text-slate-800 outline-none"
            />
            {(selectedCedant || cedantSearchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCedant(null);
                  setCedantSearchQuery("");
                  handleClearAll();
                }}
                className="mr-3 text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isCedantDropdownOpen && (
            <div className="absolute left-4 right-4 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1">
              {filteredCedants.map((cedant) => (
                <button
                  key={cedant.code}
                  type="button"
                  onClick={() => {
                    setSelectedCedant(cedant);
                    setIsCedantDropdownOpen(false);
                    setCedantSearchQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCedant?.code === cedant.code ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {cedant.code.toUpperCase()}
                    </span>
                    <span>{cedant.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 font-bold">
                    {cedant.defaultCob}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/70 flex flex-col justify-between space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STATUS PIPELINE</span>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
              selectedCedant ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400 border-slate-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${selectedCedant ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
              <span>{selectedCedant ? `Siap: ${selectedCedant.defaultCob}` : "Menunggu Cedant"}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-normal">Format:</span>
              <span className="font-mono font-bold text-indigo-600">.XLSX / .XLS / .CSV</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dropzone Box */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Dokumen Bordero</h2>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md text-indigo-600 bg-indigo-50 border border-indigo-100">
                {uploadMode === "batch" ? "BATCH MODE" : "SINGLE MODE"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Unggah berkas Excel mentah untuk diekstrak oleh pipeline ETL.</p>
          </div>

          <div className="flex items-center gap-3">
            {setUploadMode && (
              <button
                type="button"
                onClick={() => setUploadMode(uploadMode === "batch" ? "single" : "batch")}
                className="px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Ubah ke {uploadMode === "batch" ? "Single" : "Batch"} Mode
              </button>
            )}
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!selectedCedant) return alert("Pilih Nama Cedant terlebih dahulu!");
            if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
          }}
          onClick={() => selectedCedant && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
            !selectedCedant
              ? "border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed"
              : "border-slate-200 hover:border-blue-500 bg-slate-50/30 hover:bg-blue-50/10 cursor-pointer group"
          }`}
        >
          <input
            type="file"
            multiple={uploadMode === "batch"}
            ref={fileInputRef}
            disabled={!selectedCedant}
            accept=".xlsx,.xls,.csv"
            onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-700 text-center text-xs">
            {!selectedCedant ? "Pilih Nama Cedant terlebih dahulu" : "Tarik & letakkan file di sini"}
          </p>
          <span className="mt-1.5 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-400 shadow-2xs">
            Maks 50MB (.xlsx, .xls, .csv)
          </span>
        </div>

        {/* Header List Antrean + SWITCH PILIHAN PERIODE DI ATAS */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">
                FILE SIAP DIPROSES ({files.length})
              </h3>
              <span className={`text-[10px] font-semibold ${isFormValid ? "text-emerald-600" : "text-amber-500"}`}>
                {files.length === 0 ? "" : isFormValid ? "✓ Siap Diproses" : "* Lengkapi Opsi Kolom"}
              </span>
            </div>

            {/* SWITCH PERIODE GLOBAL: KUARATAL / TRIWULAN VS BULANAN */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format Periode:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => handleGlobalPeriodTypeChange("quarterly")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    globalPeriodType === "quarterly"
                      ? "bg-white text-blue-600 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Kuartal / Triwulan
                </button>
                <button
                  type="button"
                  onClick={() => handleGlobalPeriodTypeChange("monthly")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    globalPeriodType === "monthly"
                      ? "bg-white text-blue-600 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>
          </div>

          {/* List Files */}
          {files.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 italic text-xs">
              Belum ada berkas yang diunggah.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
              {files.map((fileObj, index) => (
                <FileQueueItem
                  key={fileObj.file_id || index}
                  fileObj={fileObj}
                  index={index}
                  globalPeriodType={globalPeriodType}
                  onUpdateField={handleUpdateFileField}
                  onRemove={handleRemoveFile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Submit Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleClearAll}
          disabled={files.length === 0}
          className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
        >
          Kosongkan Semua
        </button>
        <button
          type="button"
          disabled={!isFormValid}
          onClick={() => {
            setConfirmInputText("");
            setShowConfirmModal(true);
          }}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:-translate-y-px"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Lanjut & Proses ETL</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900">Konfirmasi Eksekusi ETL</h3>
            <p className="text-[11px] text-slate-500">
              Ketik <code className="bg-slate-100 text-rose-600 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">{expectedConfirmationText}</code> untuk menjalankan proses:
            </p>
            <input
              type="text"
              autoFocus
              value={confirmInputText}
              onChange={(e) => setConfirmInputText(e.target.value)}
              placeholder="Ketik persis teks di atas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={confirmInputText.trim() !== expectedConfirmationText}
                onClick={handleExecuteFinal}
                className={`px-4 py-2 font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer ${
                  confirmInputText.trim() === expectedConfirmationText
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Konfirmasi & Jalankan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}