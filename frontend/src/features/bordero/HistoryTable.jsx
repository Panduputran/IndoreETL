import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { ValidationBadge } from '../preview';

export default function HistoryTable() {
    const historyData = [
        { id: 1, fileName: "03 2026 Reinsurance Claim Report.xlsx", title: "Upload Bordero Q42026", cedant: "FIRE", period: "2026", status: "warning", message: "", startAt: "", completedAt: "" },
        { id: 2, fileName: "01 2026 Reinsurance Claim Report.xlsx", title: "Upload Bordero Q32026", cedant: "FIRE", period: "2026", status: "success", message: "File processed successfully.", startAt: "7/28/2026, 3:55 PM", completedAt: "7/28/2026, 3:55 PM" },
        { id: 3, fileName: "2025 06 MLP Summary Reindo.xlsx", title: "Upload Bordero Q2025", cedant: "FIRE", period: "2025", status: "success", message: "File processed successfully.", startAt: "6/8/2026, 2:47 PM", completedAt: "6/9/2026, 3:18 PM" }
    ];

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <Table className="w-full">
                <TableHeader>
                    <TableRow className="bg-slate-50 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">
                        <TableHead className="w-[20%]">File Name</TableHead>
                        <TableHead className="w-[12%]">Title</TableHead>
                        <TableHead className="w-[10%]">Cedant</TableHead>
                        <TableHead className="w-[8%]">Period</TableHead>
                        <TableHead className="w-[10%]">Status</TableHead>
                        <TableHead className="w-[15%]">Message</TableHead>
                        <TableHead className="w-[10%]">Start At</TableHead>
                        <TableHead className="w-[10%]">Completed At</TableHead>
                        <TableHead className="w-[120px] text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {historyData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-medium text-slate-800 text-sm whitespace-normal break-words">{item.fileName}</TableCell>
                            <TableCell className="text-sm text-slate-600 whitespace-normal break-words">{item.title}</TableCell>
                            <TableCell className="text-sm text-slate-600">{item.cedant}</TableCell>
                            <TableCell className="text-sm text-slate-600">{item.period}</TableCell>
                            <TableCell><ValidationBadge status={item.status === 'success' ? 'valid' : 'warning'} message={item.status === 'success' ? 'Success' : 'Warning'} /></TableCell>
                            <TableCell className="text-xs text-slate-500 whitespace-normal break-words">{item.message || "-"}</TableCell>
                            <TableCell className="text-xs text-slate-500">{item.startAt || "-"}</TableCell>
                            <TableCell className="text-xs text-slate-500">{item.completedAt || "-"}</TableCell>
                            <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                    <button title="View Details" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                    
                                    <button title="Edit Record" className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    
                                    <button title="Download File" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </button>
                                    
                                    <button title="Delete Record" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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