import { useState, useRef, useEffect } from 'react';
// Import CEDANTS dari global constants lu
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
    onSelect(cedant);
    setQuery(cedant.name); // Isi input dengan nama yang dipilih
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
    setQuery('');
    setIsOpen(true); // Buka dropdown lagi untuk milih ulang
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Input Field dengan gaya Clean SaaS */}
      <div 
        className="relative flex items-center w-full bg-[#F8F9FA] border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all"
      >
        <div className="pl-4 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          className="w-full py-3 px-3 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
          placeholder="Cari kode atau nama cedant..."
          value={selected ? selected.name : query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) onSelect(null); // Reset pilihan kalau user ngetik ulang
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
        />

        {/* Tombol X untuk clear data */}
        {(query || selected) && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-4 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {filteredCedants.length > 0 ? (
            filteredCedants.map((cedant) => (
              <button
                key={cedant.code}
                onClick={() => handleSelect(cedant)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer"
              >
                <span className="font-mono text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {cedant.code}
                </span>
                <span className="text-slate-700 font-medium truncate">
                  {cedant.name}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              Cedant tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}