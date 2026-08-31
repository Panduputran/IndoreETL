import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Download,
  CreditCard,
  RefreshCw,
  ChevronDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Check,
  DatabaseZap,
  FolderOpen,
  Calendar,
} from "lucide-react";

export default function FormKredit() {
  const creditTables = [
    {
      id: "claim_jamkridajabar_credit",
      label: "Bordero Klaim Kredit (Jamkrida Jabar)",
      type: "KLAIM",
    },
    {
      id: "premi_jamkridajabar_credit",
      label: "Bordero Premi Kredit (Jamkrida Jabar)",
      type: "PREMIUM",
    },
    {
      id: "premi_credit_askrida",
      label: "Bordero Premi Kredit (Askrida)",
      type: "PREMIUM",
    },
    {
      id: "claim_kredit_askrida",
      label: "Bordero Klaim Kredit (Askrida)",
      type: "KLAIM",
    },
    {
      id: "premi_jakrejabar_credit",
      label: "Bordero Premi Kredit (Jakre Jabar)",
      type: "PREMIUM",
    },
    {
      id: "claim_jakrejabar_credit",
      label: "Bordero Claim Kredit (Jakre Jabar)",
      type: "CLAIM",
    },
  ];

  const [selectedTable, setSelectedTable] = useState(
    "claim_jamkridajabar_credit",
  );
  const [openTableDropdown, setOpenTableDropdown] = useState(false);
  const tableDropdownRef = useRef(null);

  // State Filter Status
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);

  // State Filter Periode Dinamis
  const [periodList, setPeriodList] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("ALL");
  const [openPeriodDropdown, setOpenPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef(null);

  const [columns, setColumns] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isTableExists, setIsTableExists] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [warningTotal, setWarningTotal] = useState(0);
  const [validTotal, setValidTotal] = useState(0);

  const mandatoryKeywords = [
    "policy",
    "polis",
    "insured",
    "debitur",
    "name",
    "tsi",
    "sum_insured",
    "premium",
    "premi",
    "amount",
    "claim",
    "klaim",
    "dol",
    "loss",
    "date",
    "bank_pemegang_polis",
    "nama_peserta_debitur",
    "no_sertifikat_peserta_debitur",
  ];

  // 1. Ambil daftar periode unik saat tabel berganti
  const fetchPeriodList = async (tableName) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/tables/${tableName}/periods`,
      );
      if (response.data.status === "success") {
        setPeriodList(response.data.periods || []);
      }
    } catch (err) {
      console.error("Gagal mengambil daftar periode:", err);
      setPeriodList([]);
    }
  };

  // 2. Fetch data tabel dengan filter status & periode
  const fetchCreditData = async (
    tableName,
    targetPage = 1,
    currentLimit = limit,
    currentStatus = filterStatus,
    currentPeriod = filterPeriod,
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/tables/${tableName}/data`,
        {
          params: {
            page: targetPage,
            limit: currentLimit,
            status: currentStatus,
            period: currentPeriod,
          },
        },
      );

      if (response.data.status === "empty") {
        setIsTableExists(false);
        setDataList([]);
        setColumns([]);
        setTotalRows(0);
        setWarningTotal(0);
        setValidTotal(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      if (response.data.status === "success") {
        setIsTableExists(true);
        setColumns(response.data.columns || []);
        setDataList(response.data.data || []);
        setTotalRows(response.data.total_rows || 0);
        setWarningTotal(response.data.warning_total || 0);
        setValidTotal(response.data.valid_total || 0);
        setTotalPages(response.data.total_pages || 1);
        setPage(response.data.page || 1);
      }
    } catch (err) {
      console.error("Gagal mengambil data kredit dari database:", err);
      setIsTableExists(false);
      setDataList([]);
      setColumns([]);
      setTotalRows(0);
      setWarningTotal(0);
      setValidTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodList(selectedTable);
    setFilterPeriod("ALL");
  }, [selectedTable]);

  useEffect(() => {
    fetchCreditData(selectedTable, page, limit, filterStatus, filterPeriod);
  }, [selectedTable, limit, filterStatus, filterPeriod]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        tableDropdownRef.current &&
        !tableDropdownRef.current.contains(event.target)
      ) {
        setOpenTableDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setOpenStatusDropdown(false);
      }
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(event.target)
      ) {
        setOpenPeriodDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTableChange = (newTableId) => {
    setSelectedTable(newTableId);
    setOpenTableDropdown(false);
    setPage(1);
  };

  const handleStatusChange = (newStatus) => {
    setFilterStatus(newStatus);
    setOpenStatusDropdown(false);
    setPage(1);
  };

  const handlePeriodChange = (newPeriod) => {
    setFilterPeriod(newPeriod);
    setOpenPeriodDropdown(false);
    setPage(1);
  };

  const processedData = useMemo(() => {
    if (!isTableExists) return [];
    return dataList.map((row) => {
      const missingFields = [];

      columns.forEach((col) => {
        const colLower = col.toLowerCase();
        const isMandatory =
          mandatoryKeywords.some((kw) => colLower.includes(kw)) &&
          ![
            "no",
            "id",
            "remarks",
            "unnamed",
            "notes",
            "trx",
            "period",
            "cob",
          ].includes(colLower);
        const val = row[col];

        if (
          isMandatory &&
          (val === null ||
            val === undefined ||
            String(val).trim() === "" ||
            String(val).toLowerCase() === "nan")
        ) {
          missingFields.push(col);
        }
      });

      return {
        ...row,
        _status: missingFields.length > 0 ? "WARNING" : "VALID",
        _missingFields: missingFields,
      };
    });
  }, [dataList, columns, isTableExists]);

  const filteredData = processedData.filter((item) => {
    if (!searchQuery.trim()) return true;
    return Object.values(item).some((val) =>
      String(val || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  });

  return (
    <div className="p-6 space-y-5 text-xs bg-slate-50 min-h-screen relative font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 mt-0.5">
            <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Bordero Data - COB KREDIT (Live PostgreSQL)</span>
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Monitoring data real-time bordero Premi & Klaim dengan validasi SQL
            database otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              fetchCreditData(
                selectedTable,
                page,
                limit,
                filterStatus,
                filterPeriod,
              )
            }
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            disabled={!isTableExists}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full xl:w-72 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari pada data halaman ini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!isTableExists}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* Filter Bar (Periode, Status, Tabel, Limit) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* 1. DROPDOWN FILTER BY PERIODE (Dinamis dari Kolom Periode di DB) */}
            <div className="relative" ref={periodDropdownRef}>
              <button
                type="button"
                disabled={!isTableExists || periodList.length === 0}
                onClick={() => setOpenPeriodDropdown(!openPeriodDropdown)}
                className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  filterPeriod !== "ALL"
                    ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/10"
                    : "bg-slate-50 hover:bg-white text-slate-700 border-slate-200"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {filterPeriod === "ALL"
                    ? `Semua Periode (${totalRows.toLocaleString()})`
                    : `${filterPeriod} (${(periodList.find((p) => p.period === filterPeriod)?.count || 0).toLocaleString()})`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openPeriodDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {openPeriodDropdown && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                  {/* Opsi Semua Periode */}
                  <button
                    type="button"
                    onClick={() => handlePeriodChange("ALL")}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterPeriod === "ALL"
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>Semua Periode</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-bold">
                      {totalRows.toLocaleString()}
                    </span>
                  </button>

                  {/* Daftar Item Periode Dinamis + Count */}
                  {periodList.map((item) => (
                    <button
                      key={item.period}
                      type="button"
                      onClick={() => handlePeriodChange(item.period)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        filterPeriod === item.period
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="font-mono truncate pr-2">
                        {item.period}
                      </span>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                          filterPeriod === item.period
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {item.count.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Dropdown Filter Status Validasi */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                disabled={!isTableExists}
                onClick={() => setOpenStatusDropdown(!openStatusDropdown)}
                className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  filterStatus === "WARNING"
                    ? "bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/10"
                    : filterStatus === "VALID"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-slate-50 hover:bg-white text-slate-700 border-slate-200"
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterStatus === "ALL" &&
                    `Semua Status (${validTotal + warningTotal})`}
                  {filterStatus === "VALID" && `Valid (${validTotal})`}
                  {filterStatus === "WARNING" && `Warning (${warningTotal})`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openStatusDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {openStatusDropdown && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("ALL")}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === "ALL"
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>Semua Status ({validTotal + warningTotal})</span>
                    {filterStatus === "ALL" && (
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("VALID")}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === "VALID"
                        ? "bg-emerald-50 text-emerald-700 font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Valid ({validTotal})
                    </span>
                    {filterStatus === "VALID" && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("WARNING")}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      filterStatus === "WARNING"
                        ? "bg-amber-50 text-amber-700 font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Warning ({warningTotal})
                    </span>
                    {filterStatus === "WARNING" && (
                      <Check className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 3. Dropdown Pilihan Tabel */}
            <div className="relative" ref={tableDropdownRef}>
              <button
                type="button"
                onClick={() => setOpenTableDropdown(!openTableDropdown)}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-white text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {creditTables.find((t) => t.id === selectedTable)?.label ||
                    selectedTable}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openTableDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {openTableDropdown && (
                <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  {creditTables.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTableChange(t.id)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        selectedTable === t.id
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span>{t.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          t.type === "PREMIUM"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {t.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Selector Limit */}
            <select
              value={limit}
              disabled={!isTableExists}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-50 font-bold px-2.5 py-2 rounded-xl text-xs outline-none focus:bg-white cursor-pointer shadow-2xs"
            >
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
            </select>
          </div>
        </div>

        {/* Tabel Data / Empty State */}
        {!isTableExists ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 py-16 px-4 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Data Belum Tersedia
            </h3>
            <p className="text-slate-500 max-w-md">
              Tabel{" "}
              <strong className="text-blue-600 font-mono font-medium">
                {selectedTable}
              </strong>{" "}
              belum pernah diisi. Silakan lakukan proses ETL Bordero terlebih
              dahulu di Upload Bordero untuk menampilkan data.
            </p>
          </div>
        ) : (
          <>
            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs pb-1 relative min-h-[350px]">
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-white px-4 py-2 rounded-xl shadow-md border border-blue-50">
                    <DatabaseZap className="w-4 h-4 animate-pulse" />
                    <span>Memuat data PostgreSQL Kredit...</span>
                  </div>
                </div>
              )}

              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3 text-center border-r border-slate-100 bg-slate-100/60 sticky left-0 z-10">
                      Status Data
                    </th>
                    {columns.map((colName) => (
                      <th
                        key={colName}
                        className="p-3 border-r border-slate-100 last:border-r-0"
                      >
                        {colName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {filteredData.length > 0 ? (
                    filteredData.map((row, rowIdx) => {
                      const isWarning = row._status === "WARNING";

                      return (
                        <tr
                          key={rowIdx}
                          className={`transition-colors ${isWarning ? "bg-amber-50/30 hover:bg-amber-50/60" : "hover:bg-blue-50/30"}`}
                        >
                          <td className="p-3 text-center border-r border-slate-100 sticky left-0 bg-white/95 backdrop-blur-xs">
                            {isWarning ? (
                              <span
                                title={`Kolom kosong: ${row._missingFields.join(", ")}`}
                                className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                Warning ({row._missingFields.length})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                Valid
                              </span>
                            )}
                          </td>

                          {columns.map((colName) => {
                            const val = row[colName];
                            const isNull =
                              val === null ||
                              val === undefined ||
                              String(val).trim() === "" ||
                              String(val).toLowerCase() === "nan";
                            const isMissingMandatory =
                              row._missingFields.includes(colName);

                            return (
                              <td
                                key={colName}
                                className={`p-3 border-r border-slate-50 last:border-r-0 ${
                                  isMissingMandatory
                                    ? "bg-amber-100/50 text-amber-900 font-bold"
                                    : ""
                                }`}
                              >
                                {isNull ? (
                                  <span
                                    className={`italic font-mono ${isMissingMandatory ? "text-amber-700 font-bold underline decoration-wavy" : "text-slate-300"}`}
                                  >
                                    [NULL]
                                  </span>
                                ) : typeof val === "number" ? (
                                  <span
                                    className={`font-mono ${val < 0 ? "text-rose-600 font-bold" : "text-slate-700"}`}
                                  >
                                    {val.toLocaleString("id-ID")}
                                  </span>
                                ) : (
                                  <span className="text-slate-800">
                                    {String(val)}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="p-8 text-center text-slate-400 italic"
                      >
                        {loading
                          ? "Sedang memuat data..."
                          : "Tidak ada data yang sesuai dengan filter."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <div>
                Menampilkan{" "}
                <span className="font-bold text-slate-700">
                  {filteredData.length}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-700">
                  {totalRows.toLocaleString()}
                </span>{" "}
                baris data
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600">
                  Halaman <strong className="text-slate-800">{page}</strong>{" "}
                  dari <strong className="text-slate-800">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() =>
                      fetchCreditData(
                        selectedTable,
                        page - 1,
                        limit,
                        filterStatus,
                        filterPeriod,
                      )
                    }
                    disabled={page <= 1 || loading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      fetchCreditData(
                        selectedTable,
                        page + 1,
                        limit,
                        filterStatus,
                        filterPeriod,
                      )
                    }
                    disabled={page >= totalPages || loading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
