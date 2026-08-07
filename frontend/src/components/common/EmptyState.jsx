// src/components/common/EmptyState.jsx

export default function EmptyState({ 
  icon, 
  title = "Data Kosong", 
  description = "Belum ada data yang tersedia saat ini.", 
  action, // Bisa diisi button/komponen lain
  className = "" 
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl ${className}`}>
      {/* Ikon Default (Inbox/Tray Kosong) jika tidak ada icon yang di-pass */}
      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
        {icon || (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      
      {/* Text Info */}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">{description}</p>
      
      {/* Tombol Action Opsional */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}