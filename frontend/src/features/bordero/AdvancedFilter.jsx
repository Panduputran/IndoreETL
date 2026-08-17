import { useState, useRef, useEffect } from 'react';
import { Search, Building2, ChevronDown, RotateCcw, X } from 'lucide-react';

export default function AdvancedFilter({ onFilterChange }) {
  const [filterPeriodType, setFilterPeriodType] = useState('Range');
  const [searchTitle, setSearchTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State & Ref Autocomplete Cedant
  const [cedantSearch, setCedantSearch] = useState('');
  const [showCedantDropdown, setShowCedantDropdown] = useState(false);
  const cedantDropdownRef = useRef(null);

  const dummyCedants = [
    "CDT-001 (Askrida)", 
    "CDT-002 (Takaful)", 
    "CDT-003 (Jasindo)", 
    "CDT-004 (Central Asia)", 
    "CDT-005 (Tugu Insurance)", 
    "CDT-006 (Allianz)", 
    "CDT-007 (Zurich)"
  ];

  // Handle Click Outside Dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (cedantDropdownRef.current && !cedantDropdownRef.current.contains(event.target)) {
        setShowCedantDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCedants = dummyCedants.filter(cedant => 
    cedant.toLowerCase().includes(cedantSearch.toLowerCase())
  );

  // Reset Semua Filter
  const handleReset = () => {
    setCedantSearch('');
    setSearchTitle('');
    setStartDate('');
    setEndDate('');
    setFilterPeriodType('Range');
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-5 text-xs">
      
      {/* Layout Grid Responsif Presisi */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3">
        
        {/* 1. Cari & Pilih Cedant */}
        <div className="flex-1 min-w-[200px] relative" ref={cedantDropdownRef}>
          <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Cari & Pilih Cedant
          </label>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Pilih atau cari Cedant..." 
              value={cedantSearch}
              onChange={(e) => {
                setCedantSearch(e.target.value);
                setShowCedantDropdown(true);
              }}
              onFocus={() => setShowCedantDropdown(true)}
              className="w-full pl-3 pr-8 h-9 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/80 focus:bg-white text-xs font-semibold text-slate-800 transition-all shadow-2xs" 
            />
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 transition-transform ${showCedantDropdown ? 'rotate-180' : ''}`} />
          </div>

          {/* Pop-up List */}
          {showCedantDropdown && (
            <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
              <li 
                className="px-3 py-2 text-xs text-blue-600 font-bold hover:bg-blue-50 cursor-pointer"
                onClick={() => {
                  setCedantSearch('');
                  setShowCedantDropdown(false);
                }}
              >
                Semua Cedant
              </li>
              {filteredCedants.length > 0 ? (
                filteredCedants.map((cedant, index) => (
                  <li 
                    key={index}
                    className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium cursor-pointer transition-colors"
                    onClick={() => {
                      setCedantSearch(cedant);
                      setShowCedantDropdown(false);
                    }}
                  >
                    {cedant}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-xs text-slate-400 italic text-center">
                  Cedant tidak ditemukan
                </li>
              )}
            </ul>
          )}
        </div>

        {/* 2. Search Title */}
        <div className="flex-1 min-w-[180px]">
          <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5 text-[11px]">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Cari Judul / Berkas
          </label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Judul / nama file..." 
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-3 pr-8 h-9 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/80 focus:bg-white text-xs font-semibold text-slate-800 transition-all shadow-2xs" 
            />
            {searchTitle && (
              <button 
                type="button"
                onClick={() => setSearchTitle('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Period Type Toggle */}
        <div className="shrink-0">
          <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">Period Type</label>
          <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-0.5 h-9 items-center w-[130px]">
            <button 
              type="button"
              onClick={() => setFilterPeriodType('Single')} 
              className={`flex-1 h-full text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                filterPeriodType === 'Single' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Single
            </button>
            <button 
              type="button"
              onClick={() => setFilterPeriodType('Range')} 
              className={`flex-1 h-full text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                filterPeriodType === 'Range' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Range
            </button>
          </div>
        </div>

        {/* 4. Date Inputs & Tombol Reset (Aman & Tidak Meluap) */}
        <div className="flex items-center gap-2 shrink-0">
          {filterPeriodType === 'Range' ? (
            <div className="flex items-center gap-1.5">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[125px] px-2 h-9 border border-slate-200 rounded-xl text-[11px] bg-slate-50/80 focus:bg-white outline-none focus:border-blue-500 text-slate-700 font-semibold shadow-2xs cursor-pointer" 
              />
              <span className="text-slate-400 font-bold">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[125px] px-2 h-9 border border-slate-200 rounded-xl text-[11px] bg-slate-50/80 focus:bg-white outline-none focus:border-blue-500 text-slate-700 font-semibold shadow-2xs cursor-pointer" 
              />
            </div>
          ) : (
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[160px] px-2.5 h-9 border border-slate-200 rounded-xl text-[11px] bg-slate-50/80 focus:bg-white outline-none focus:border-blue-500 text-slate-700 font-semibold shadow-2xs cursor-pointer" 
            />
          )}

          {/* Tombol Reset */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset Filter"
            className="h-9 px-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}