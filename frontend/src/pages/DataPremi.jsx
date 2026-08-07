import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Pagination, ValidationBadge } from '../features/preview'; 

export default function DataPremi() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [database, setDatabase] = useState([]); // State untuk nampung data
    const itemsPerPage = 5; 

    // Data bawaan kalau LocalStorage masih kosong
    const defaultDummy = [
        { id: 'PRM-001', cedant: 'Asuransi Central Asia', client: 'PT Maju Jaya', amount: 'Rp 5.000.000', date: '2026-07-01' },
        { id: 'PRM-002', cedant: 'Asuransi Tri Pakarta', client: 'CV Makmur', amount: 'Rp 3.500.000', date: '2026-07-02' },
        { id: 'PRM-003', cedant: 'Tugu Insurance', client: 'Toko Abadi', amount: 'Rp 12.000.000', date: '2026-07-05' },
    ];

    // Ambil data dari LocalStorage saat komponen pertama kali dirender
    useEffect(() => {
        const storedData = localStorage.getItem('indore_data_premi');
        if (storedData) {
            setDatabase(JSON.parse(storedData));
        } else {
            // Kalau kosong banget, pakai data default dan set ke local storage
            setDatabase(defaultDummy);
            localStorage.setItem('indore_data_premi', JSON.stringify(defaultDummy));
        }
    }, []);

    // Filter data berdasarkan Search
    const filteredData = useMemo(() => {
        if (!searchQuery) return database;
        return database.filter(item => 
            item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.cedant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.client?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, database]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };

    // Tombol untuk reset data (buat testing/presentasi biar gampang ngapusnya)
    const handleResetData = () => {
        if(confirm("Yakin ingin menghapus seluruh data premi?")) {
            localStorage.removeItem('indore_data_premi');
            setDatabase([]);
        }
    }

    return (
        <div className="p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-[1400px] mx-auto space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Database Premi</h1>
                        <p className="text-sm text-slate-500 mt-1">Master data premi hasil dari proses ETL Bordero.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative hidden sm:block">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Cari ID, Nasabah, Cedant..." 
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <Button variant="secondary" size="md" onClick={handleResetData}>Reset Storage</Button>
                        <Button variant="outline" size="md">Export Data</Button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>No. Transaksi</TableHead>
                                <TableHead>Cedant</TableHead>
                                <TableHead>Nama Nasabah</TableHead>
                                <TableHead>Nilai Premi</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status DB</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-semibold text-slate-900">{row.id}</TableCell>
                                        <TableCell>{row.cedant}</TableCell>
                                        <TableCell>{row.client}</TableCell>
                                        <TableCell className="font-mono text-sm text-slate-700">{row.amount}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell><ValidationBadge status="valid" message="Tersimpan" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                                        Data tidak ditemukan atau belum ada proses ETL.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
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