import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { ValidationBadge } from '../preview';

// 3 Data Dummy Bawaan Awal
const INITIAL_DUMMY_DATA = [
    { 
        id: "BATCH-2026-001", 
        isBatch: true,
        title: "Upload Bordero Fire Q1 2026", 
        cedantCode: "CDT-001",
        cedantName: "Askrida", 
        period: "TW1 2026", 
        status: "success", 
        message: "File processed successfully (1,170 rows).", 
        startAt: "7/28/2026, 3:55 PM", 
        completedAt: "7/28/2026, 3:55 PM",
        files: [
            { id: 101, fileName: "IPR_Fire_Askrida_TW1_2026.xlsx", rows: 850, type: "FIRE" },
            { id: 102, fileName: "Bordero_Klaim_Fire_Askrida.xlsx", rows: 320, type: "FIRE" }
        ]
    },
    { 
        id: "BATCH-2026-002", 
        isBatch: false,
        fileName: "Bordero_Marine_Takaful_Q2_2026.xlsx", 
        title: "Upload Bordero Marine Q2 2026", 
        cedantCode: "CDT-002",
        cedantName: "Takaful", 
        period: "Q2 2026", 
        status: "success", 
        message: "File processed successfully (320 rows).", 
        startAt: "7/28/2026, 3:55 PM", 
        completedAt: "7/28/2026, 3:55 PM",
        files: [
            { id: 201, fileName: "Bordero_Marine_Takaful_Q2_2026.xlsx", rows: 320, type: "MARINE" }
        ]
    },
    { 
        id: "BATCH-2026-003", 
        isBatch: false,
        fileName: "IPR_Property_Jasindo_Draft.xlsx", 
        title: "Upload Bordero Fire Q4 2025", 
        cedantCode: "CDT-003",
        cedantName: "Jasindo", 
        period: "Q4 2025", 
        status: "warning", 
        message: "Unmapped columns detected at row 42.", 
        startAt: "6/8/2026, 2:47 PM", 
        completedAt: "6/8/2026, 2:48 PM",
        files: [
            { id: 301, fileName: "IPR_Property_Jasindo_Draft.xlsx", rows: 450, type: "PROPERTY" }
        ]
    }
];

export default function HistoryTable({ data, setHistoryData }) {
    // State lokal jika parent tidak mengoper prop 'data'
    const [localData, setLocalData] = useState(() => {
        const saved = localStorage.getItem('etl_history');
        return saved ? JSON.parse(saved) : INITIAL_DUMMY_DATA;
    });

    const [expandedRows, setExpandedRows] = useState({});

    // State untuk Modal Custom Edit & Hapus
    const [editModal, setEditModal] = useState({ isOpen: false, item: null, newTitle: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });

    // Sinkronkan Local Storage
    useEffect(() => {
        if (!data) {
            localStorage.setItem('etl_history', JSON.stringify(localData));
        }
    }, [localData, data]);

    const activeData = data || localData;

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // --- HANDLER MODAL EDIT ---
    const handleOpenEditModal = (item) => {
        setEditModal({
            isOpen: true,
            item: item,
            newTitle: item.title
        });
    };

    const handleSaveEdit = () => {
        if (!editModal.newTitle.trim()) return;

        const updateFn = prev => prev.map(item => 
            item.id === editModal.item.id ? { ...item, title: editModal.newTitle.trim() } : item
        );

        if (setHistoryData) {
            setHistoryData(updateFn);
        } else {
            setLocalData(updateFn);
        }

        setEditModal({ isOpen: false, item: null, newTitle: '' });
    };

    // --- HANDLER MODAL HAPUS ---
    const handleOpenDeleteModal = (item) => {
        setDeleteModal({
            isOpen: true,
            id: item.id,
            title: item.title
        });
    };

    const handleConfirmDelete = () => {
        const deleteFn = prev => prev.filter(item => item.id !== deleteModal.id);

        if (setHistoryData) {
            setHistoryData(deleteFn);
        } else {
            setLocalData(deleteFn);
        }

        setDeleteModal({ isOpen: false, id: null, title: '' });
    };

    return (
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs bg-white w-full relative">
            <Table className="w-full text-xs font-sans">
                <TableHeader>
                    <TableRow className="bg-slate-50/80 text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-200/80">
                        <TableHead className="p-3.5 w-8 text-center"></TableHead>
                        <TableHead className="p-3.5">Nama Berkas / Batch</TableHead>
                        <TableHead className="p-3.5">Judul Kegiatan</TableHead>
                        <TableHead className="p-3.5">Cedant</TableHead>
                        <TableHead className="p-3.5 text-center">Periode</TableHead>
                        <TableHead className="p-3.5 text-center">Status</TableHead>
                        <TableHead className="p-3.5">Pesan Log ETL</TableHead>
                        <TableHead className="p-3.5">Waktu Mulai</TableHead>
                        <TableHead className="p-3.5">Selesai</TableHead>
                        <TableHead className="p-3.5 text-center w-[110px]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 font-medium">
                    {activeData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="p-8 text-center text-slate-400 italic">
                                Belum ada riwayat pemrosesan ETL.
                            </TableCell>
                        </TableRow>
                    ) : (
                        activeData.map((item) => {
                            const isExpanded = !!expandedRows[item.id];
                            const isBatch = item.isBatch || (item.files && item.files.length > 1);

                            return (
                                <React.Fragment key={item.id}>
                                    <TableRow 
                                        className={`transition-colors ${
                                            isBatch ? 'hover:bg-slate-50/80 cursor-pointer' : 'hover:bg-slate-50/80'
                                        }`}
                                        onClick={() => isBatch && toggleRow(item.id)}
                                    >
                                        {/* Panah Accordion */}
                                        <TableCell className="p-3.5 text-center text-slate-400">
                                            {isBatch && (
                                                <svg 
                                                    className={`w-4 h-4 text-blue-600 mx-auto transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2.5" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </TableCell>

                                        {/* Nama Berkas / Batch Badge */}
                                        <TableCell className="p-3.5">
                                            {isBatch ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded text-[10px]">
                                                        {item.files.length} BATCH FILES
                                                    </span>
                                                    <span className="font-semibold text-slate-800 text-xs">
                                                        {item.files[0]?.fileName} {item.files.length > 1 ? `+${item.files.length - 1} file` : ''}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 font-bold text-[9px]">
                                                        XLSX
                                                    </div>
                                                    <span className="font-semibold text-slate-800 text-xs tracking-tight hover:text-blue-600 transition-colors cursor-pointer" title={item.files?.[0]?.fileName || item.fileName}>
                                                        {item.files?.[0]?.fileName || item.fileName}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        
                                        {/* Judul Kegiatan (Satu-satunya tempat Edit Judul) */}
                                        <TableCell className="text-xs text-slate-700 font-semibold p-3.5">
                                            <div className="flex items-center gap-1.5 group">
                                                <span>{item.title}</span>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                                                    title="Edit Judul Kegiatan"
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </TableCell>

                                        {/* Cedant Badge */}
                                        <TableCell className="p-3.5">
                                            <span className="font-mono font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/80 text-[11px]">
                                                {item.cedantCode} ({item.cedantName})
                                            </span>
                                        </TableCell>

                                        {/* Periode */}
                                        <TableCell className="text-xs font-bold text-slate-600 p-3.5 text-center font-mono">
                                            {item.period}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="p-3.5 text-center">
                                            <ValidationBadge 
                                                status={item.status === 'success' ? 'valid' : 'warning'} 
                                            />
                                        </TableCell>

                                        {/* Message Log */}
                                        <TableCell className="text-[11px] p-3.5">
                                            <span className={`truncate max-w-[180px] block ${
                                                item.status === 'success' ? 'text-slate-500' : 'text-amber-700 font-semibold'
                                            }`} title={item.message}>
                                                {item.message || "-"}
                                            </span>
                                        </TableCell>

                                        {/* Waktu Mulai & Selesai */}
                                        <TableCell className="text-[11px] font-mono text-slate-500 p-3.5 whitespace-nowrap">
                                            {item.startAt || "-"}
                                        </TableCell>
                                        <TableCell className="text-[11px] font-mono text-slate-500 p-3.5 whitespace-nowrap">
                                            {item.completedAt || "-"}
                                        </TableCell>

                                        {/* BARIS TOMBOL AKSI (TANPA TOMBOL EDIT LAGI) */}
                                        <TableCell className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                
                                                {/* 1. Download Berkas Mentah (Single File Only) */}
                                                {!isBatch && (
                                                    <button 
                                                        type="button"
                                                        title="Unduh Berkas Mentah (.xlsx)" 
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-emerald-100"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* 2. Download Log ETL */}
                                                <button 
                                                    type="button"
                                                    title="Unduh Catatan Log ETL" 
                                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-amber-100"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </button>

                                                {/* 3. Delete */}
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenDeleteModal(item)}
                                                    title="Hapus Riwayat Batch" 
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>

                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* ACCORDION DROPDOWN (BILA BATCH) */}
                                    {isBatch && isExpanded && (
                                        <TableRow className="bg-slate-50/70 border-y border-slate-100">
                                            <TableCell colSpan={10} className="p-3 pl-12">
                                                <div className="space-y-2 border-l-2 border-blue-400 pl-4 py-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                                        Daftar Berkas Excel dalam Batch Ini ({item.files.length} File):
                                                    </span>
                                                    
                                                    <div className="grid grid-cols-1 gap-1.5 max-w-2xl">
                                                        {item.files.map((file) => (
                                                            <div key={file.id} className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs">
                                                                <div className="flex items-center gap-2.5">
                                                                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-1.5 py-0.5 rounded text-[9px]">
                                                                        XLSX
                                                                    </span>
                                                                    <span className="font-semibold text-slate-800 text-xs tracking-tight">
                                                                        {file.fileName}
                                                                    </span>
                                                                </div>

                                                                <button 
                                                                    type="button" 
                                                                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                    <span>Unduh Berkas</span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {/* MODAL EDIT JUDUL KEGIATAN */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
                        
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Edit Judul Kegiatan</h3>
                                <p className="text-[11px] text-slate-500">Perbarui nama/judul untuk riwayat batch ini.</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                Judul Kegiatan Baru <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                autoFocus
                                value={editModal.newTitle}
                                onChange={(e) => setEditModal(prev => ({ ...prev, newTitle: e.target.value }))}
                                placeholder="Ketik judul baru..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all shadow-2xs"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setEditModal({ isOpen: false, item: null, newTitle: '' })}
                                className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={!editModal.newTitle.trim()}
                                onClick={handleSaveEdit}
                                className={`px-4 py-1.5 text-[11px] font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                                    editModal.newTitle.trim()
                                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                Simpan Perubahan
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
                        
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-800">Hapus Riwayat ETL?</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Apakah Anda yakin ingin menghapus riwayat <strong className="text-slate-700">"{deleteModal.title}"</strong>? Data ini akan dihapus dari riwayat lokal.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
                                className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-4 py-1.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer"
                            >
                                Ya, Hapus Data
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}