// src/components/common/ErrorMessage.jsx

export default function ErrorMessage({ title = "Terjadi Kesalahan", message, onRetry, className = "" }) {
  return (
    <div className={`bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 ${className}`}>
      {/* Icon Error */}
      <div className="mt-0.5 text-red-500 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      {/* Konten Text */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-red-800">{title}</h3>
        {message && <p className="text-sm text-red-600 mt-1 leading-relaxed">{message}</p>}
        
        {/* Tombol Action Opsional */}
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-3 px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}