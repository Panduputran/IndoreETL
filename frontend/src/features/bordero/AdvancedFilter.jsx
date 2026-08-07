import { useState } from 'react';

export default function AdvancedFilter() {
    const [filterPeriodType, setFilterPeriodType] = useState('Range');
    
    // State khusus untuk Dropdown Cedant
    const [cedantSearch, setCedantSearch] = useState('');
    const [showCedantDropdown, setShowCedantDropdown] = useState(false);

    // Dummy Data Rekomendasi Cedant
    const dummyCedants = [
        "ALLIANZ", 
        "ZURICH", 
        "AMFS", 
        "TUGU INSURANCE", 
        "ASURANSI CENTRAL ASIA (ACA)", 
        "ASURANSI TRI PAKARTA", 
        "MAREIN", 
        "REINDO"
    ];

    // Logika untuk filter rekomendasi sesuai huruf yang diketik
    const filteredCedants = dummyCedants.filter(cedant => 
        cedant.toLowerCase().includes(cedantSearch.toLowerCase())
    );

    return (
        <div className="flex flex-col xl:flex-row items-end gap-4 mb-6">
            
            {/* 1. Cari & Pilih Cedant (Sekarang dengan Dropdown Autocomplete) */}
            <div className="flex-1 w-full relative">
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                    Cari & Pilih Cedant
                </label>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Pilih Cedant..." 
                        value={cedantSearch}
                        onChange={(e) => {
                            setCedantSearch(e.target.value);
                            setShowCedantDropdown(true);
                        }}
                        onFocus={() => setShowCedantDropdown(true)}
                        // setTimeout dipakai supaya klik di list dropdown ke-register sebelum dropdown nutup
                        onBlur={() => setTimeout(() => setShowCedantDropdown(false), 200)}
                        className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Pop-up Rekomendasi List Cedant */}
                {showCedantDropdown && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredCedants.length > 0 ? (
                            filteredCedants.map((cedant, index) => (
                                <li 
                                    key={index}
                                    className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setCedantSearch(cedant);
                                        setShowCedantDropdown(false);
                                    }}
                                >
                                    {cedant}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-slate-500 italic">
                                Cedant tidak ditemukan
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* 2. Search Title */}
            <div className="flex-1 w-full">
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Search Title:</label>
                <div className="relative">
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Cari Title..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
            </div>

            {/* 3. Period Type */}
            <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Period Type</label>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden h-[38px]">
                    <button onClick={() => setFilterPeriodType('Single')} className={`px-4 py-1.5 text-sm transition-colors ${filterPeriodType === 'Single' ? 'bg-blue-600 text-white font-medium' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Single</button>
                    <button onClick={() => setFilterPeriodType('Range')} className={`px-4 py-1.5 text-sm transition-colors ${filterPeriodType === 'Range' ? 'bg-blue-600 text-white font-medium' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Range</button>
                </div>
            </div>

            {/* 4 & 5. Date Pickers */}
            {filterPeriodType === 'Range' ? (
                <>
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Start Period</label>
                        <input type="date" className="w-full xl:w-[150px] px-3 py-2 border border-slate-200 rounded-lg text-sm h-[38px]" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">End Period</label>
                        <input type="date" className="w-full xl:w-[150px] px-3 py-2 border border-slate-200 rounded-lg text-sm h-[38px]" />
                    </div>
                </>
            ) : (
                <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Select Period</label>
                    <input type="date" className="w-full xl:w-[150px] px-3 py-2 border border-slate-200 rounded-lg text-sm h-[38px]" />
                </div>
            )}
        </div>
    );
}