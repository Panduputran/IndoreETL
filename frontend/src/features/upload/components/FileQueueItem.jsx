import React from "react";
import { Trash2, Loader2, Sparkles, FileCode2 } from "lucide-react";
import {
  YEAR_LIST,
  QUARTER_OPTIONS,
  MONTH_OPTIONS,
} from "../../../constants/data";
import { formatBytes } from "../../../utils/fileUtils";

export default function FileQueueItem({
  fileObj,
  index,
  globalPeriodType,
  onUpdateField,
  onRemove,
}) {
  const periodOptions =
    globalPeriodType === "monthly" ? MONTH_OPTIONS : QUARTER_OPTIONS;

  return (
    <div className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:border-blue-300 transition-all">
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
            {fileObj.file_id && (
              <span className="font-mono text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                <FileCode2 className="w-2.5 h-2.5" />
                {fileObj.file_id}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <span className="text-slate-400 font-mono">
              {formatBytes(fileObj.size)}
            </span>
            {fileObj.isInspecting ? (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                <span>Menginspeksi...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>
                  {fileObj.available_sheets?.length || 0} Sheet Terdeteksi
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 p-2 rounded-xl border border-slate-100 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5">
            Kategori
          </span>
          <select
            value={fileObj.category}
            onChange={(e) => onUpdateField(index, "category", e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-[11px] font-semibold px-2 py-1 outline-none shadow-2xs cursor-pointer text-slate-700"
          >
            <option value="premi">Premi</option>
            <option value="claim">Claim</option>
            <option value="subro">Subro</option>
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5">
            COB / Sheet
          </span>
          <select
            disabled={fileObj.isInspecting || !fileObj.available_cobs?.length}
            value={
              fileObj.selectedSheet ||
              (fileObj.available_cobs?.[0]?.sheetName ?? "")
            }
            onChange={(e) =>
              onUpdateField(index, "selectedSheet", e.target.value)
            }
            className="bg-white border border-slate-200 rounded-lg text-[11px] font-bold px-2 py-1 outline-none shadow-2xs cursor-pointer text-blue-700 max-w-[140px]"
          >
            {fileObj.available_cobs?.map((c, i) => (
              <option key={i} value={c.sheetName}>
                {c.cobCode} ({c.sheetName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5">
            Periode
          </span>
          <select
            value={fileObj.period}
            onChange={(e) => onUpdateField(index, "period", e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-[11px] font-bold px-2 py-1 outline-none shadow-2xs cursor-pointer text-slate-700 min-w-[110px]"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] uppercase font-bold text-slate-400 ml-1 mb-0.5">
            Tahun
          </span>
          <select
            value={fileObj.receivedDate}
            onChange={(e) =>
              onUpdateField(index, "receivedDate", e.target.value)
            }
            className="bg-white border border-slate-200 rounded-lg text-[11px] font-semibold px-2 py-1 outline-none shadow-2xs cursor-pointer text-slate-700 font-mono"
          >
            {YEAR_LIST.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-3"
          title="Hapus berkas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}