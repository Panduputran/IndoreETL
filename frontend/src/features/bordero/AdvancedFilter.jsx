import { useState } from 'react';

export default function AdvancedFilter() {
    const [filterPeriodType, setFilterPeriodType] = useState('Range');
    
    // State untuk Search Title
    const [searchTitle, setSearchTitle] = useState('');

    // State khusus untuk Dropdown Cedant
    const [cedantSearch, setCedantSearch] = useState('');
    const [showCedantDropdown, setShowCedantDropdown] = useState(false);

    // Dummy Data Cedant yang Selaras dengan Seluruh Sistem
    const dummyCedants = [
        "CDT-001 (Askrida)", 
        "CDT-002 (Takaful)", 
        "CDT-003 (Jasindo)", 
        "CDT-004 (Central Asia)", 
        "CDT-005 (Tugu Insurance)", 
        "CDT-006 (Allianz)", 
        "CDT-007 (Zurich)"
    ];

    // Logika filter rekomendasi Cedant
    const filteredCedants = dummyCedants.filter(cedant => 
        cedant.toLowerCase().includes(cedantSearch.toLowerCase())
    );

    return (
        <div className="flex flex-col xl:flex-row items-end gap-3 mb-5 text-xs">
            
            {/* 1. Cari & Pilih Cedant (Autocomplete) */}
            <div className="flex-1 w-full relative">
                <label className="block font-semibold text-slate-700 mb-1.5">
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
                        onBlur={() => setTimeout(() => setShowCedantDropdown(false), 200)}
                        className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white text-xs font-medium transition-all" 
                    />
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Pop-up Rekomendasi List Cedant */}
                {showCedantDropdown && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-50">
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
                            <li className="px-3 py-2 text-xs text-slate-400 italic">
                                Cedant tidak ditemukan
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* 2. Search Title (Desain Diselaraskan) */}
            <div className="flex-1 w-full">
                <label className="block font-semibold text-slate-700 mb-1.5">Search Title:</label>
                <div className="relative">
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Cari berdasarkan judul / nama file..." 
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white text-xs font-medium transition-all" 
                    />
                    {searchTitle && (
                        <button 
                            type="button"
                            onClick={() => setSearchTitle('')}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* 3. Period Type */}
            <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Period Type</label>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-100 p-0.5 h-[34px]">
                    <button 
                        onClick={() => setFilterPeriodType('Single')} 
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                            filterPeriodType === 'Single' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                        }`}
                    >
                        Single
                    </button>
                    <button 
                        onClick={() => setFilterPeriodType('Range')} 
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                            filterPeriodType === 'Range' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                        }`}
                    >
                        Range
                    </button>
                </div>
            </div>

            {/* 4 & 5. Date Pickers */}
            {filterPeriodType === 'Range' ? (
                <>
                    <div className="w-full xl:w-auto">
                        <label className="block font-semibold text-slate-700 mb-1.5">Start Period</label>
                        <input 
                            type="date" 
                            className="w-full xl:w-[140px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none focus:border-blue-500 text-slate-700 font-medium h-[34px]" 
                        />
                    </div>
                    <div className="w-full xl:w-auto">
                        <label className="block font-semibold text-slate-700 mb-1.5">End Period</label>
                        <input 
                            type="date" 
                            className="w-full xl:w-[140px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none focus:border-blue-500 text-slate-700 font-medium h-[34px]" 
                        />
                    </div>
                </>
            ) : (
                <div className="w-full xl:w-auto">
                    <label className="block font-semibold text-slate-700 mb-1.5">Select Period</label>
                    <input 
                        type="date" 
                        className="w-full xl:w-[140px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none focus:border-blue-500 text-slate-700 font-medium h-[34px]" 
                    />
                </div>
            )}
        </div>
    );
}