import React, { useState } from 'react';
import { 
  BookOpen, 
  UploadCloud, 
  Table2, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  FileSpreadsheet, 
  HelpCircle,
  Layers,
  Zap,
  Info,
  SlidersHorizontal,
  Download,
  Building2,
  ShieldCheck,
  Search,
  FileCheck
} from 'lucide-react';

export default function UserGuide() {
  const [activeTab, setActiveTab] = useState('workflow');

  const steps = [
    {
      step: '01',
      title: 'Upload File Bordero & Pemilihan Konteks',
      desc: 'Masuk ke menu Upload Bordero. Pilih nama Cedant (seperti Askrida, ACA, Tripakarta, Buana Independent, Jamkrida Jabar, Jakre Jabar, Askrindo, Jamkrindo), tentukan Lini Bisnis (FIRE / KREDIT), serta Tahun dan Periode transaksi laporan (Q1-Q4 / Bulanan). Unggah berkas Excel (.xlsx/.xls) atau CSV.',
      icon: <UploadCloud className="w-5 h-5 text-blue-600" />
    },
    {
      step: '02',
      title: 'Inspeksi Cerdas & Dynamic Column Mapping',
      desc: 'Engine backend menginspeksi struktur berkas mentah, mendeteksi baris offset metadata dan baris header secara dinamis, serta melakukan auto-match kolom sumber terhadap atribut baku skema IPR. Operator dapat meninjau atau menyesuaikan pemetaan pada modul Column Mapping.',
      icon: <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
    },
    {
      step: '03',
      title: 'Eksekusi Sanitasi & Batch Ingestion (ETL Engine)',
      desc: 'Setelah skema tervalidasi, sistem menjalankan pembersihan data berbasis vektorisasi NumPy & Pandas (normalisasi tanggal, pembersihan teks mata uang, pemaksaan numerik 2 desimal) dan menyuntikkan data ke PostgreSQL menggunakan protokol COPY stream berkecepatan tinggi.',
      icon: <Zap className="w-5 h-5 text-amber-600" />
    },
    {
      step: '04',
      title: 'Unified COB Data Viewers & Agregasi Multi-Cedant',
      desc: 'Buka menu View Bordero (Fire atau Kredit). Gunakan fitur agregasi "Semua Premi" atau "Semua Klaim" untuk mengonsolidasi seluruh data lintas cedant dalam satu tabel, atau pilih tabel spesifik cedant untuk peninjauan mendalam.',
      icon: <Layers className="w-5 h-5 text-emerald-600" />
    },
    {
      step: '05',
      title: 'Audit Trail, Filter Validasi & Ekspor Data',
      desc: 'Setiap proses ETL otomatis tercatat ke tabel etl_activity_log (durasi, baris diimpor, status). Operator dapat memanfaatkan filter validasi status (Valid vs Warning) untuk mendeteksi kolom wajib kosong, pencarian multi-kolom, serta unduh data dalam format CSV/Excel.',
      icon: <Table2 className="w-5 h-5 text-purple-600" />
    }
  ];

  const faqs = [
    {
      q: 'Bagaimana cara melihat data per masing-masing Cedant atau seluruh Cedant sekaligus?',
      a: 'Pada halaman View Bordero (Fire atau Kredit), gunakan dropdown "Target Cedant". Anda dapat memilih nama spesifik perusahaan asuransi untuk melihat tabel tunggal, atau memilih "Semua Cedant" untuk menyatukan seluruh data fisik dari semua cedant secara otomatis pada antarmuka tabel.'
    },
    {
      q: 'Apa perbedaan antara status data Valid dan Warning pada tabel live viewer?',
      a: 'Status Valid menandakan seluruh kolom mandatory (seperti Nomor Polis, Nama Tertanggung/Debitur, Nilai TSI/Plafond, Nilai Premi/Klaim, Tanggal Periode/DOL) terisi lengkap. Status Warning menandakan ada kolom kunci yang bernilai kosong atau [NULL] di database.'
    },
    {
      q: 'Bagaimana cara kerja fitur Ekspor Excel / CSV?',
      a: 'Klik tombol "Export Excel / CSV" di sudut kanan atas. Sistem akan menampilkan modal konfirmasi dengan 2 pilihan cakupan: (1) Hanya Halaman Ini untuk mengunduh baris data yang sedang tampil, atau (2) Seluruh Data Terfilter untuk mengunduh seluruh baris dari database sesuai filter periode dan status yang sedang aktif.'
    },
    {
      q: 'Apakah sistem akan menimpa data jika file dengan periode yang sama diunggah ulang?',
      a: 'Ya. Pipeline ETL menerapkan mekanisme idempotent loading berdasarkan parameter periode dan cedant. Baris data lama untuk periode yang sama akan dibersihkan terlebih dahulu sebelum data baru dimasukkan sehingga tidak terjadi duplikasi data.'
    },
    {
      q: 'Mengapa tipe data tanggal distandarisasi sebagai TEXT pada skema database?',
      a: 'Setiap cedant menggunakan format tanggal yang beraneka ragam (DD/MM/YYYY, YYYY-MM-DD, serial Excel, hingga nama bulan teks bahasa Indonesia). Tipe TEXT menjamin integritas data awal tetap tersimpan 100% tanpa risiko parsing failure pada level database.'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          User Guide
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dokumentasi operasional end-to-end sistem otomasi ETL Bordero, integrasi skema IPR, dan pemantauan data reasuransi.
        </p>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'workflow'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Alur Kerja Pipeline
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('aggregation')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'aggregation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Agregasi Multi-Cedant
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('validation')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'validation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Aturan Validasi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'faq'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tanya Jawab (FAQ)
        </button>
      </div>

      {/* TAB 1: WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                      {item.icon}
                    </div>
                    <span className="font-mono font-bold text-slate-300 text-xl">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-base">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mt-2">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-5 flex items-start gap-3.5 text-blue-900">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Tips Penanganan Berkas Heterogen:</p>
              <p className="text-blue-700 leading-relaxed">
                Jika berkas Excel dari cedant memiliki banyak baris judul atau logo perusahaan di bagian atas, parser otomatis akan mendeteksi baris offset header secara mandiri. Pastikan lembar kerja (sheet) target telah terpilih dengan benar pada tahap inspeksi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AGGREGATION FEATURES */}
      {activeTab === 'aggregation' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Fitur Agregasi & Tampilan Terpadu (Unified COB Viewer)</h3>
            <p className="text-slate-500 text-sm mt-1">
              Konsolidasi data bordero lintas perusahaan asuransi tanpa perlu membuka tabel fisik secara terpisah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900 text-sm">Semua Premi (All Cedants)</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Menyatukan seluruh data transaksi premi dari seluruh tabel cedant yang aktif (misal: ACA, Tripakarta, Buana Independent, Askrida) ke dalam satu tampilan tabel besar. Disertai kolom identitas <code className="font-mono font-medium text-blue-700 bg-blue-100 px-1 py-0.5 rounded">cedant_name</code> untuk memudahkan pelacakan asal data.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-rose-600" />
                <span className="font-semibold text-rose-900 text-sm">Semua Klaim (All Cedants)</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Menyatukan seluruh data klaim dari seluruh cedant ke dalam antarmuka terpadu. Mempermudah audit total klaim, tanggal kejadian (DOL), nomor berkas klaim, dan penyebab kerugian (Cause of Loss) secara menyeluruh.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 text-sm text-slate-700">
            <h4 className="font-medium text-slate-800">Keuntungan Mode Agregasi:</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Pencarian data cepat lintas cedant hanya dengan mengetik nomor polis atau nama tertanggung pada search bar.</li>
              <li>Filter periode dinamis langsung menghitung total baris gabungan seluruh cedant pada kuartal yang dipilih.</li>
              <li>Ekspor CSV instan untuk kebutuhan rekapitulasi data dan pelaporan aktuaria reasuransi.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: VALIDATION RULES */}
      {activeTab === 'validation' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Status Integritas Data & Indikator Validasi</h3>
            <p className="text-slate-500 text-sm mt-1">
              Panduan pemahaman indikator kualitas data pada hasil pemuatan tabel database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800 text-sm">Status Valid</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Menandakan bahwa seluruh kolom penting (seperti Nomor Polis, Nama Tertanggung/Debitur, Nilai TSI, Premi/Klaim) terisi dengan data yang valid dan tidak kosong.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-800 text-sm">Status Warning</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Menandakan ada satu atau lebih kolom penting yang bernilai kosong atau NULL. Data tetap tersimpan di database namun memerlukan peninjauan lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FAQ */}
      {activeTab === 'faq' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Tanya Jawab Seputar Sistem (FAQ)</h3>
            <p className="text-slate-500 text-sm mt-1">
              Pertanyaan umum mengenai alur pemrosesan bordero dan pengelolaan database reasuransi.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((f, idx) => (
              <div key={idx} className="py-4 space-y-1.5">
                <h4 className="font-medium text-slate-900 text-sm">{f.q}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}