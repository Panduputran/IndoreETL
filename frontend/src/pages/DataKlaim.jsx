import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Pagination, ValidationBadge } from '../features/preview'; 

export default function DataKlaim() {
    // 1. STATE KONTROL UI & DATA
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [database, setDatabase] = useState([]); // State untuk nampung data
    const itemsPerPage = 5; 

    // Data bawaan kalau LocalStorage masih kosong
    const defaultDummy = [
        { id: 'KLM-8821', policy: 'POL-00912', client: 'PT Maju Jaya', amount: 'Rp 15.000.000', date: '2026-07-15' },
        { id: 'KLM-8822', policy: 'POL-00344', client: 'Andi Setiawan', amount: 'Rp 2.500.000', date: '2026-07-18' },
        { id: 'KLM-8823', policy: 'POL-00765', client: 'CV Makmur', amount: 'Rp 8.000.000', date: '2026-07-20' },
    ];

    // 2. AMBIL DATA DARI LOCAL STORAGE (Mirip narik dari API Backend)
    useEffect(() => {
        const storedData = localStorage.getItem('indore_data_klaim');
        if (storedData) {
            setDatabase(JSON.parse(storedData));
        } else {
            // Kalau kosong, set data default
            setDatabase(defaultDummy);
            localStorage.setItem('indore_data_klaim', JSON.stringify(defaultDummy));
        }
    }, []);

    // 3. FITUR PENCARIAN (Filter Data)
    const filteredData = useMemo(() => {
        if (!searchQuery) return database;
        return database.filter(item => 
            item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.policy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.client?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, database]);

    // 4. FITUR PAGINATION
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Balikin ke page 1 tiap kali ngetik
    };

    // Tombol untuk reset data Klaim (Testing/Presentasi)
    const handleResetData = () => {
        if(confirm("Yakin ingin menghapus seluruh data klaim?")) {
            localStorage.removeItem('indore_data_klaim');
            setDatabase([]);
        }
    }

    return (
        <div className="p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-[1400px] mx-auto space-y-6">
                
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Database Klaim</h1>
                        <p className="text-sm text-slate-500 mt-1">Master data klaim yang ditarik dari sheet Klaim Bordero.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search Bar yang Aktif */}
                        <div className="relative hidden sm:block">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Cari No. Klaim, Polis, atau Klien..." 
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <Button variant="secondary" size="md" onClick={handleResetData}>Reset Storage</Button>
                        <Button variant="outline" size="md" onClick={() => alert("Fitur Export Jalan!")}>Export Data</Button>
                    </div>
                </div>

                {/* Tabel Data Klaim */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>No. Klaim</TableHead>
                                <TableHead>No. Polis</TableHead>
                                <TableHead>Nama Tertanggung</TableHead>
                                <TableHead>Nilai Klaim</TableHead>
                                <TableHead>Tgl Pengajuan</TableHead>
                                <TableHead>Status DB</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-semibold text-rose-600">{row.id}</TableCell>
                                        <TableCell className="font-medium text-slate-600">{row.policy}</TableCell>
                                        <TableCell>{row.client}</TableCell>
                                        <TableCell className="font-mono text-sm text-slate-700">{row.amount}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell><ValidationBadge status="warning" message="Diproses" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                                        Data tidak ditemukan atau belum ada proses ETL Klaim.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
                    {/* Pagination yang Aktif */}
                    <div className="mt-auto border-t border-slate-100">
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            totalData={filteredData.length} 
                            onPageChange={setCurrentPage} 
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}