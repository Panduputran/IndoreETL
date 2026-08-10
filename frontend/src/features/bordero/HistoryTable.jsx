import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { ValidationBadge } from '../preview';

export default function HistoryTable() {
    const historyData = [
        { 
            id: 1, 
            fileName: "IPR_Fire_Askrida_TW1_2026.xlsx", 
            title: "Upload Bordero Fire Q1 2026", 
            cedant: "CDT-001 (Askrida)", 
            period: "2026", 
            status: "success", 
            message: "File processed successfully (850 rows).", 
            startAt: "7/28/2026, 3:55 PM", 
            completedAt: "7/28/2026, 3:55 PM" 
        },
        { 
            id: 2, 
            fileName: "Bordero_Marine_Takaful_Q2_2026.xlsx", 
            title: "Upload Bordero Marine Q2 2026", 
            cedant: "CDT-002 (Takaful)", 
            period: "2026", 
            status: "success", 
            message: "File processed successfully (320 rows).", 
            startAt: "7/28/2026, 3:55 PM", 
            completedAt: "7/28/2026, 3:55 PM" 
        },
        { 
            id: 3, 
            fileName: "IPR_Property_Jasindo_Draft.xlsx", 
            title: "Upload Bordero Fire Q4 2025", 
            cedant: "CDT-003 (Jasindo)", 
            period: "2025", 
            status: "warning", 
            message: "Unmapped columns detected at row 42.", 
            startAt: "6/8/2026, 2:47 PM", 
            completedAt: "6/8/2026, 2:48 PM" 
        }
    ];

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white w-full">
            <Table className="w-full text-xs">
                <TableHeader>
                    <TableRow className="bg-slate-50 text-[11px] uppercase text-slate-500 font-bold tracking-wider border-b border-slate-200">
                        <TableHead className="p-3">File Name</TableHead>
                        <TableHead className="p-3">Title</TableHead>
                        <TableHead className="p-3">Cedant</TableHead>
                        <TableHead className="p-3 text-center">Period</TableHead>
                        <TableHead className="p-3 text-center">Status</TableHead>
                        <TableHead className="p-3">Message</TableHead>
                        <TableHead className="p-3">Start At</TableHead>
                        <TableHead className="p-3">Completed At</TableHead>
                        <TableHead className="p-3 text-center w-[70px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                    {historyData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <TableCell className="font-bold text-slate-800 text-xs p-3">
                                {item.fileName}
                            </TableCell>
                            
                            <TableCell className="text-xs text-slate-600 font-medium p-3">
                                {item.title}
                            </TableCell>

                            <TableCell className="text-xs font-semibold text-blue-600 p-3">
                                {item.cedant}
                            </TableCell>

                            <TableCell className="text-xs font-mono text-slate-500 p-3 text-center">
                                {item.period}
                            </TableCell>

                            {/* PERBAIKAN DI SINI: Hapus prop message agar tidak muncul teks abu-abu ganda */}
                            <TableCell className="p-3 text-center">
                                <ValidationBadge 
                                    status={item.status === 'success' ? 'valid' : 'warning'} 
                                />
                            </TableCell>

                            <TableCell className="text-[11px] text-slate-500 p-3">
                                {item.message || "-"}
                            </TableCell>

                            <TableCell className="text-[11px] font-mono text-slate-400 p-3 whitespace-nowrap">
                                {item.startAt || "-"}
                            </TableCell>

                            <TableCell className="text-[11px] font-mono text-slate-400 p-3 whitespace-nowrap">
                                {item.completedAt || "-"}
                            </TableCell>

                            {/* Action Buttons: Format Grid 2x2 */}
                            <TableCell className="p-3 text-center">
                                <div className="grid grid-cols-2 gap-1 w-[52px] mx-auto">
                                    {/* Read / View */}
                                    <button title="View Details" className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>

                                    {/* Edit */}
                                    <button title="Edit Record" className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>

                                    {/* Download */}
                                    <button title="Download File" className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </button>

                                    {/* Delete */}
                                    <button title="Delete Record" className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}