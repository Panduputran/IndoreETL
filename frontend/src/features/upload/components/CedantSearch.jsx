import React, { useState, useRef, useEffect } from 'react';
// Import CEDANTS dari global constants
import { CEDANTS } from '../../../constants/data';

export default function CedantSearch({ selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Filter logika pencarian menggunakan CEDANTS dari global
  const filteredCedants = CEDANTS.filter((cedant) =>
    cedant.name.toLowerCase().includes(query.toLowerCase()) ||
    cedant.code.toLowerCase().includes(query.toLowerCase())
  );

  // Menutup dropdown kalau user klik di luar area komponen
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cedant) => {
    onSelect(cedant); // Mengirim objek lengkap { code, name } ke parent component
    setQuery('');     // Reset query karena tampilan sudah di-handle oleh `selected.name`
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null); // Triggers parent reset (menghapus objek selected)
    setQuery('');
    setIsOpen(true); // Buka dropdown lagi untuk milih ulang
  };

  return (
    <div className="space-y-1.5 relative text-xs" ref={wrapperRef}>
      <label className="block font-bold text-slate-700">
        Nama / Kode Cedant Perusahaan <span className="text-red-500">*</span>
      </label>

      {/* Input Field Clean SaaS Style */}
      <div 
        className={`relative flex items-center w-full bg-[#F8F9FA] border rounded-xl overflow-hidden transition-all ${
          isOpen ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white' : 'border-slate-200'
        }`}
      >
        <div className="pl-3.5 text-slate-400 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Indikator Badge Kode saat Cedant sudah dipilih */}
        {selected?.code && !query && (
          <span className="ml-2 font-mono text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded shrink-0">
            {selected.code}
          </span>
        )}

        <input
          type="text"
          className="w-full py-2.5 px-2.5 bg-transparent text-xs text-slate-800 font-semibold placeholder-slate-400 focus:outline-none"
          placeholder="Cari kode atau nama cedant..."
          value={selected ? selected.name : query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (selected) onSelect(null); // Reset pilihan parent saat ngetik ulang
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
        />

        {/* Tombol X untuk clear data */}
        {(query || selected) && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-3 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
            title="Clear"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-30 w-full mt-1 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-1.5 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 animate-in fade-in duration-150">
          {filteredCedants.length > 0 ? (
            filteredCedants.map((cedant) => (
              <button
                key={cedant.code}
                type="button"
                onClick={() => handleSelect(cedant)}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  selected?.code === cedant.code ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0 border border-blue-100">
                    {cedant.code}
                  </span>
                  <span className="text-slate-700 font-medium truncate">
                    {cedant.name}
                  </span>
                </div>

                {selected?.code === cedant.code && (
                  <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-slate-400 text-center italic">
              Cedant tidak ditemukan
            </div>
          )}
        </div>
      )}

    </div>
  );
}