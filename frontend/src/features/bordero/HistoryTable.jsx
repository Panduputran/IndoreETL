import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '../../components/ui/Table';
import { 
  ChevronDown, 
  FileSpreadsheet, 
  FileText, 
  Trash2, 
  Edit, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  FileCode2,
  X
} from 'lucide-react';

function StatusBadge({ status }) {
  const isSuccess = status === 'success' || status === 'valid' || status === 'completed';
  return (
    <span className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wide border ${
      isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {isSuccess ? 'VALID' : 'WARNING'}
    </span>
  );
}

export default function HistoryTable({ historyData = [], onUpdateData }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [editModal, setEditModal] = useState({ isOpen: false, item: null, newTitle: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
  const [detailModal, setDetailModal] = useState({ isOpen: false, item: null });

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveEdit = () => {
    if (!editModal.newTitle.trim()) return;
    const updated = historyData.map(item => 
      item.id === editModal.item.id ? { ...item, title: editModal.newTitle.trim() } : item
    );
    onUpdateData(updated);
    setEditModal({ isOpen: false, item: null, newTitle: '' });
  };

  const handleConfirmDelete = () => {
    const updated = historyData.filter(item => item.id !== deleteModal.id);
    onUpdateData(updated);
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
          {historyData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="p-10 text-center text-slate-400 italic">
                Belum ada riwayat pemrosesan ETL yang tersimpan.
              </TableCell>
            </TableRow>
          ) : (
            historyData.map((item) => {
              const isExpanded = !!expandedRows[item.id];
              const isBatch = item.isBatch || (item.files && item.files.length > 1);

              return (
                <React.Fragment key={item.id}>
                  <TableRow 
                    className={`transition-colors ${isBatch ? 'hover:bg-slate-50/80 cursor-pointer' : 'hover:bg-slate-50/80'}`}
                    onClick={() => isBatch && toggleRow(item.id)}
                  >
                    {/* Panah Accordion */}
                    <TableCell className="p-3.5 text-center text-slate-400">
                      {isBatch && (
                        <ChevronDown className={`w-4 h-4 text-blue-600 mx-auto transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </TableCell>

                    {/* Nama Berkas / Batch */}
                    <TableCell className="p-3.5">
                      {isBatch ? (
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.files?.length || 0} BATCH FILES
                          </span>
                          <span className="font-semibold text-slate-800 text-xs truncate max-w-[200px]" title={item.files?.[0]?.fileName}>
                            {item.files?.[0]?.fileName} {item.files?.length > 1 ? `+${item.files.length - 1} file` : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 font-bold text-[9px]">
                            XLSX
                          </div>
                          <span className="font-semibold text-slate-800 text-xs truncate max-w-[220px]" title={item.files?.[0]?.fileName || item.fileName}>
                            {item.files?.[0]?.fileName || item.fileName}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* Judul Kegiatan */}
                    <TableCell className="text-xs text-slate-700 font-semibold p-3.5">
                      <div className="flex items-center gap-1.5 group">
                        <span>{item.title}</span>
                        <button 
                          type="button"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditModal({ isOpen: true, item, newTitle: item.title }); 
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>

                    {/* Cedant */}
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
                      <StatusBadge status={item.status} />
                    </TableCell>

                    {/* Pesan Log */}
                    <TableCell className="text-[11px] p-3.5">
                      <span className="truncate max-w-[180px] block text-slate-500" title={item.message}>
                        {item.message || "-"}
                      </span>
                    </TableCell>

                    {/* Waktu */}
                    <TableCell className="text-[11px] font-mono text-slate-500 p-3.5 whitespace-nowrap">
                      {item.startAt || "-"}
                    </TableCell>
                    <TableCell className="text-[11px] font-mono text-slate-500 p-3.5 whitespace-nowrap">
                      {item.completedAt || "-"}
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          type="button"
                          onClick={() => setDetailModal({ isOpen: true, item })}
                          title="Lihat Rincian Log"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setDeleteModal({ isOpen: true, id: item.id, title: item.title })}
                          title="Hapus Riwayat"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Accordion Detail File untuk Batch */}
                  {isBatch && isExpanded && (
                    <TableRow className="bg-slate-50/70 border-y border-slate-100">
                      <TableCell colSpan={10} className="p-4 pl-12">
                        <div className="space-y-2 border-l-2 border-blue-400 pl-4 py-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Daftar Berkas Terproses dalam Batch ({item.files?.length} File):
                          </span>

                          <div className="grid grid-cols-1 gap-2 max-w-3xl">
                            {item.files?.map((f, fIdx) => (
                              <div key={fIdx} className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs text-xs">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-[9px] shrink-0">
                                    XLSX
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate" title={f.fileName}>{f.fileName}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                      <span>Sheet: <strong className="text-slate-700">{f.sheet || '-'}</strong></span>
                                      <span>•</span>
                                      <span>COB: <strong className="text-blue-600">{f.type || f.cob || 'FIRE'}</strong></span>
                                      <span>•</span>
                                      <span>Rows: <strong className="text-emerald-600">{f.rows?.toLocaleString('id-ID') || 0}</strong></span>
                                    </div>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                  f.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {f.status || 'OK'}
                                </span>
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

      {/* Modal Edit Judul */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Edit Judul Kegiatan</h3>
            <input 
              type="text" 
              autoFocus
              value={editModal.newTitle} 
              onChange={(e) => setEditModal(prev => ({ ...prev, newTitle: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500" 
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setEditModal({ isOpen: false, item: null, newTitle: '' })} className="px-3.5 py-1.5 text-xs text-slate-600">Batal</button>
              <button onClick={handleSaveEdit} className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 text-center">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Hapus Riwayat ETL?</h3>
            <p className="text-xs text-slate-500">Riwayat "{deleteModal.title}" akan dihapus dari daftar riwayat.</p>
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setDeleteModal({ isOpen: false, id: null, title: '' })} className="px-3.5 py-1.5 text-xs text-slate-600">Batal</button>
              <button onClick={handleConfirmDelete} className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail & Report */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Detail Audit Trail ETL</h3>
              <button onClick={() => setDetailModal({ isOpen: false, item: null })} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between"><span>Judul Batch:</span> <strong className="text-slate-800">{detailModal.item?.title}</strong></div>
              <div className="flex justify-between"><span>Cedant:</span> <strong className="text-blue-600 font-mono">{detailModal.item?.cedantCode} ({detailModal.item?.cedantName})</strong></div>
              <div className="flex justify-between"><span>Waktu Eksekusi:</span> <strong className="text-slate-700">{detailModal.item?.completedAt}</strong></div>
            </div>
            <div className="pt-2 border-t border-slate-100 max-h-56 overflow-y-auto space-y-2 custom-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Berkas Terproses:</span>
              {detailModal.item?.files?.map((f, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span className="truncate">{f.fileName}</span>
                    <span className="text-emerald-600">{f.rows?.toLocaleString('id-ID')} Baris</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500">{f.logMessage || `Sheet: ${f.sheet} (COB: ${f.type})`}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}