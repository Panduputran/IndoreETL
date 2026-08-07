import { useState } from 'react';
import Button from '../components/ui/Button';
import HistoryView from '../features/bordero/HistoryView';
import UploadProcess from '../features/bordero/UploadProcess';

export default function UploadBordero() {
    const [currentView, setCurrentView] = useState('history');

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-8 font-sans">
            <div className="max-w-[1400px] mx-auto">
                
                {/* Header Utama & Tombol-Tombol */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {currentView === 'history' ? 'Riwayat Upload Bordero' : 'Proses Upload Baru'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {currentView === 'history'
                                ? 'Pantau status file ETL dan kelola data bordero yang telah masuk.'
                                : 'Unggah, konfigurasi mapping, dan validasi data sebelum menjalankan ETL.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {currentView === 'history' ? (
                            <>
                                <Button variant="outline" className="gap-2 text-emerald-600 border-emerald-600 hover:bg-emerald-50">Download Excel</Button>
                                <Button variant="primary" onClick={() => setCurrentView('upload')} className="gap-2 bg-blue-600 hover:bg-blue-700">Upload</Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={() => setCurrentView('history')} className="gap-2 text-slate-600 border-slate-300">Kembali ke Riwayat</Button>
                        )}
                    </div>
                </div>

                {/* Kondisi Tampilan: Panggil Komponen yang Udah Dipecah */}
                {currentView === 'history' ? (
                    <HistoryView />
                ) : (
                    <UploadProcess onComplete={() => setCurrentView('history')} />
                )}

            </div>
        </div>
    );
}