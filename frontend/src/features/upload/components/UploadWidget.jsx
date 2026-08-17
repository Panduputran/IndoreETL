import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  UploadCloud,
  Trash2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileCode2,
} from "lucide-react";
import { CEDANTS, PERIOD_LIST, YEAR_LIST } from "../../../constants/data";
import { inspectFile } from "../../../api/borderoApi";

// Helper deteksi COB dari nama Sheet
const detectCobFromSheet = (sheetName) => {
  const s = String(sheetName).toUpperCase();
  if (s.includes("FIRE") || s.includes("PROPERTY") || s.includes("HARTA"))
    return "FIRE";
  if (s.includes("ENG") || s.includes("ENGINEERING")) return "ENGINEERING";
  if (s.includes("CARGO")) return "CARGO";
  if (s.includes("HULL")) return "HULL";
  if (s.includes("MOTOR") || s.includes("MV") || s.includes("KENDARAAN"))
    return "MOTOR";
  if (s.includes("KREDIT") || s.includes("CREDIT")) return "CREDIT";
  if (s.includes("MONEY")) return "MONEY";
  if (s.includes("GA") || s.includes("GENERAL ACCIDENT")) return "GA";
  if (s.includes("LIABILITY")) return "LIABILITY";
  return sheetName;
};

const detectPeriodAndYear = (fileName) => {
  const raw = String(fileName).toUpperCase();

  let category = "premi";
  if (raw.includes("CLAIM") || raw.includes("KLAIM") || raw.includes("CLM")) {
    category = "claim";
  } else if (raw.includes("SUBRO")) {
    category = "subro";
  }

  let period = "Q1";

  const numFirstMatch = raw.match(/([1-4])\s*(Q|TW|TRIWULAN|KUARTAL)/i);

  const letterFirstMatch = raw.match(/(Q|TW|TRIWULAN|KUARTAL)[\s_.-]*([1-4])/i);

  if (numFirstMatch) {
    const type =
      numFirstMatch[2].toUpperCase().startsWith("TW") ||
      numFirstMatch[2].toUpperCase().startsWith("TRI")
        ? "TW"
        : "Q";
    period = `${type}${numFirstMatch[1]}`;
  } else if (letterFirstMatch) {
    const type =
      letterFirstMatch[1].toUpperCase().startsWith("TW") ||
      letterFirstMatch[1].toUpperCase().startsWith("TRI")
        ? "TW"
        : "Q";
    period = `${type}${letterFirstMatch[2]}`;
  }

  let year = "2025";

  const periodYearMatch = raw.match(
    /(?:[1-4]Q|Q[1-4]|TW[1-4]|[1-4]TW)[\s_.-]*(20\d{2}|19\d{2})/i,
  );

  const generalYearMatch =
    raw.match(/\b(20\d{2}|19\d{2})\b/) || raw.match(/(20\d{2}|19\d{2})/);

  if (periodYearMatch) {
    year = periodYearMatch[1];
  } else if (generalYearMatch) {
    year = generalYearMatch[1];
  }

  return { category, period, year };
};

export default function UploadWidget({
  onNext,
  onBackToHistory,
  uploadMode = "batch",
  setUploadMode,
}) {
  const [selectedCedant, setSelectedCedant] = useState(null);
  const [cedantSearchQuery, setCedantSearchQuery] = useState("");
  const [isCedantDropdownOpen, setIsCedantDropdownOpen] = useState(false);
  const cedantWrapperRef = useRef(null);

  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState("");

  const filteredCedants = CEDANTS.filter(
    (c) =>
      c.name.toLowerCase().includes(cedantSearchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(cedantSearchQuery.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        cedantWrapperRef.current &&
        !cedantWrapperRef.current.contains(e.target)
      ) {
        setIsCedantDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AUTO-INSPECT SAAT FILE DIPILIH
  const handleAddFiles = async (incomingFiles) => {
    if (!selectedCedant) {
      alert("Silakan pilih Nama Cedant terlebih dahulu!");
      return;
    }

    const validFiles = Array.from(incomingFiles).filter(
      (file) =>
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv"),
    );

    // 1. Ekstrak langsung dengan Parser Cerdas di Frontend
    const initialObjects = validFiles.map((file) => {
      const detected = detectPeriodAndYear(file.name);
      return {
        rawFile: file,
        name: file.name,
        size: file.size,
        category: detected.category,
        period: detected.period, // Langsung terisi Q1/Q2/Q3/Q4
        receivedDate: detected.year, // Langsung terisi 2026/2025/2024
        isInspecting: true,
        file_id: null,
        available_sheets: [],
        available_cobs: [],
        selectedSheet: "",
        cob: "",
      };
    });

    const updatedFileList =
      uploadMode === "single"
        ? initialObjects.slice(0, 1)
        : [...files, ...initialObjects];
    setFiles(updatedFileList);

    // 2. Eksekusi Inspect ke Backend hanya untuk mengambil file_id & available_sheets
    for (let i = 0; i < updatedFileList.length; i++) {
      const item = updatedFileList[i];
      if (!item.isInspecting) continue;

      try {
        const res = await inspectFile(
          item.rawFile,
          item.category,
          selectedCedant.code,
        );
        const sheets = res.data?.available_sheets || [];
        const returnedFileId = res.data?.file_id || null;

        const detectedCobs = sheets.map((sheet) => ({
          sheetName: sheet,
          cobCode: detectCobFromSheet(sheet),
        }));

        const defaultSheet = sheets[0] || "";
        const defaultCob = detectedCobs[0]?.cobCode || "FIRE";

        setFiles((prev) =>
          prev.map((f, idx) => {
            if (idx === i) {
              return {
                ...f,
                isInspecting: false,
                file_id: returnedFileId, // Simpan file_id asli dari backend
                available_sheets: sheets,
                available_cobs: detectedCobs,
                selectedSheet: defaultSheet,
                cob: defaultCob,
                // Pertahankan periode & tahun hasil deteksi cerdas nama file
                period: f.period,
                receivedDate: f.receivedDate,
              };
            }
            return f;
          }),
        );
      } catch (err) {
        console.error("Gagal auto-inspect:", err);
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, isInspecting: false } : f)),
        );
      }
    }
  };

  const handleUpdateFileField = (index, field, value) => {
    setFiles((prev) =>
      prev.map((f, i) => {
        if (i === index) {
          if (field === "cob") {
            const matched = f.available_cobs.find((c) => c.cobCode === value);
            return {
              ...f,
              cob: value,
              selectedSheet: matched ? matched.sheetName : f.selectedSheet,
            };
          }
          return { ...f, [field]: value };
        }
        return f;
      }),
    );
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isFormValid =
    selectedCedant &&
    files.length > 0 &&
    files.every(
      (f) =>
        !f.isInspecting &&
        f.file_id &&
        f.category &&
        f.cob &&
        f.period &&
        f.receivedDate,
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
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Upload Berkas Bordero
        </h1>
        <button
          type="button"
          onClick={onBackToHistory}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          &larr; Kembali ke Riwayat
        </button>
      </div>

      {/* Top Row: Cedant Search & Status Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Cedant Search Box */}
        <div
          className="lg:col-span-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/70 relative"
          ref={cedantWrapperRef}
        >
          <label className="block font-bold text-slate-700 mb-1.5">
            Nama / Kode Cedant Perusahaan{" "}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />

            {selectedCedant && (
              <span className="ml-2 font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md shrink-0">
                {selectedCedant.code}
              </span>
            )}

            <input
              type="text"
              placeholder={
                selectedCedant
                  ? selectedCedant.name
                  : "Cari atau pilih nama cedant..."
              }
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
                  setFiles([]);
                }}
                className="mr-3 text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isCedantDropdownOpen && (
            <div className="absolute left-4 right-4 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto custom-scrollbar p-1">
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
                    selectedCedant?.code === cedant.code
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {cedant.code}
                    </span>
                    <span>{cedant.name}</span>
                  </div>
                  {selectedCedant?.code === cedant.code && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Engine */}
        <div className="lg:col-span-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/70 flex flex-col justify-between space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            STATUS ENGINE
          </span>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                selectedCedant
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-white text-slate-400 border-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${selectedCedant ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
              />
              <span>
                {selectedCedant ? "Auto-Inspect Ready" : "Menunggu Cedant"}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-normal">Format:</span>
              <span className="font-mono font-bold text-indigo-600">
                .XLSX / .CSV
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-normal">Max Size:</span>
              <span className="font-mono font-bold text-slate-800">10 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dropzone & File List Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">
                Dokumen Bordero
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md text-indigo-600 bg-indigo-50 border border-indigo-100">
                {uploadMode === "batch" ? "BATCH MODE" : "SINGLE MODE"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Unggah berkas Excel dan biarkan sistem memindai sheet & file ID
              otomatis.
            </p>
          </div>
          {setUploadMode && (
            <button
              type="button"
              onClick={() =>
                setUploadMode(uploadMode === "batch" ? "single" : "batch")
              }
              className="px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Ubah ke {uploadMode === "batch" ? "Single" : "Batch"} Mode
            </button>
          )}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!selectedCedant)
              return alert("Pilih Nama Cedant terlebih dahulu!");
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
            {!selectedCedant
              ? "Pilih Nama Cedant terlebih dahulu"
              : "Tarik & letakkan file di sini"}
          </p>
          <span className="mt-1.5 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-400 shadow-2xs">
            Maks 10MB (.xlsx, .xls, .csv)
          </span>
        </div>

        {/* File List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              FILE SIAP DIPROSES ({files.length})
            </h3>
            <span
              className={`text-[10px] font-semibold ${isFormValid ? "text-emerald-600" : "text-amber-500"}`}
            >
              {files.length === 0
                ? ""
                : isFormValid
                  ? "✓ Terinspeksi & Siap Diproses"
                  : "* Sedang Menginspeksi / Lengkapi Pilihan"}
            </span>
          </div>

          {files.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 italic text-xs">
              Belum ada berkas yang diunggah.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
              {files.map((fileObj, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:border-blue-300 transition-all"
                >
                  {/* Info Berkas & File ID */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      XLSX
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p
                          className="font-bold text-slate-800 truncate text-xs"
                          title={fileObj.name}
                        >
                          {fileObj.name}
                        </p>
                        {/* BADGE FILE ID */}
                        {fileObj.file_id && (
                          <span className="font-mono text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                            <FileCode2 className="w-2.5 h-2.5" />
                            {fileObj.file_id}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <span className="text-slate-400 font-mono">
                          {(fileObj.size / 1024 / 1024).toFixed(2)} MB
                        </span>

                        {fileObj.isInspecting ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                            <span>Menginspeksi Sheet...</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>
                              {fileObj.available_sheets.length} Sheet Terdeteksi
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dropdowns Metadata */}
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                    {/* 1. KATEGORI */}
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5">
                        Kategori
                      </span>
                      <select
                        value={fileObj.category}
                        onChange={(e) =>
                          handleUpdateFileField(
                            index,
                            "category",
                            e.target.value,
                          )
                        }
                        className="bg-white border border-slate-200 rounded-lg text-[11px] font-semibold px-2 py-1 outline-none shadow-2xs cursor-pointer text-slate-700"
                      >
                        <option value="premi">Premi</option>
                        <option value="claim">Claim</option>
                        <option value="subro">Subro</option>
                      </select>
                    </div>

                    {/* 2. COB & SHEET TARGET */}
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5">
                        COB / Sheet
                      </span>
                      <select
                        disabled={
                          fileObj.isInspecting ||
                          fileObj.available_cobs.length === 0
                        }
                        value={fileObj.cob}
                        onChange={(e) =>
                          handleUpdateFileField(index, "cob", e.target.value)
                        }
                        className="bg-white border border-slate-200 rounded-lg text-[11px] font-bold px-2 py-1 outline-none shadow-2xs cursor-pointer text-blue-700 max-w-[140px]"
                      >
                        {fileObj.available_cobs.map((c, i) => (
                          <option key={i} value={c.cobCode}>
                            {c.cobCode} ({c.sheetName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. PERIODE */}
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5">
                        Periode
                      </span>
                      <select
                        value={fileObj.period}
                        onChange={(e) =>
                          handleUpdateFileField(index, "period", e.target.value)
                        }
                        className="bg-white border border-slate-200 rounded-lg text-[11px] font-semibold px-2 py-1 outline-none shadow-2xs cursor-pointer text-slate-700"
                      >
                        {PERIOD_LIST.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 4. TAHUN */}
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5">
                        Tahun
                      </span>
                      <select
                        value={fileObj.receivedDate}
                        onChange={(e) =>
                          handleUpdateFileField(
                            index,
                            "receivedDate",
                            e.target.value,
                          )
                        }
                        className="bg-white border border-slate-200 rounded-lg text-[11px] font-semibold px-2 py-1 outline-none shadow-2xs cursor-pointer text-slate-700"
                      >
                        {YEAR_LIST.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Hapus */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-3"
                      title="Hapus berkas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setFiles([])}
          disabled={files.length === 0}
          className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
        >
          Kosongkan
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

      {/* GitHub-Style Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Konfirmasi Eksekusi ETL
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tindakan ini akan memproses berkas dan memasukkannya ke
                  database.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Cedant:</span>
                <strong className="text-slate-800 font-mono">
                  {selectedCedant?.name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Total Berkas:</span>
                <strong className="text-blue-700 font-bold">
                  {files.length} Berkas
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Ketik teks berikut untuk mengonfirmasi eksekusi: <br />
                <code className="bg-slate-100 text-rose-600 font-mono font-bold px-2 py-0.5 rounded border border-slate-200 select-all mt-1 inline-block">
                  {expectedConfirmationText}
                </code>
              </p>
              <input
                type="text"
                autoFocus
                value={confirmInputText}
                onChange={(e) => setConfirmInputText(e.target.value)}
                placeholder="Ketik persis teks di atas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>

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
                className={`px-4 py-2 font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                  confirmInputText.trim() === expectedConfirmationText
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
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
