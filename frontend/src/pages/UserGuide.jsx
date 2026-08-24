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
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export default function UserGuide() {
  const [activeTab, setActiveTab] = useState('workflow');

  const steps = [
    {
      step: '01',
      title: 'Upload File Bordero Mentah',
      desc: 'Masuk ke menu Upload Bordero. Pilih Cedant (misal: Askrida, Tripakarta, Buana), pilih COB (FIRE / KREDIT), tentukan Periode & Tahun laporan, lalu unggah file Excel (.xlsx / .xls).',
      icon: <UploadCloud className="w-5 h-5 text-blue-600" />
    },
    {
      step: '02',
      title: 'Proses ETL Otomatis',
      desc: 'Sistem backend otomatis membaca file, membuka merged cell, mendeteksi header secara dinamis, melakukan sanitasi angka/tanggal, dan menyimpannya ke database PostgreSQL.',
      icon: <Zap className="w-5 h-5 text-amber-600" />
    },
    {
      step: '03',
      title: 'Monitoring & Filter Validasi Data',
      desc: 'Buka menu Bordero Fire atau Bordero Kredit. Gunakan filter status (Valid / Warning) untuk mengecek apakah ada baris data yang kolom wajibnya (seperti No Polis, Nilai Klaim, Debitur) masih kosong.',
      icon: <Table2 className="w-5 h-5 text-emerald-600" />
    },
    {
      step: '04',
      title: 'Pusat Referensi IPR Master',
      desc: 'Gunakan menu IPR Schema Master sebagai kamus data acuan 51 atribut standar industri untuk mengetahui format kolom dan tipe data yang wajib disediakan.',
      icon: <Database className="w-5 h-5 text-purple-600" />
    }
  ];

  const faqs = [
    {
      q: 'Apa perbedaan status Valid dan Warning pada tabel?',
      a: 'Status Valid berarti semua kolom wajib (mandatory) terisi dengan benar. Status Warning menandakan ada kolom kunci (misalnya No. Polis, Tanggal Kejadian, atau Nilai Pertanggungan) yang bernilai NULL/kosong di database.'
    },
    {
      q: 'Mengapa muncul tampilan "Data Belum Tersedia" saat memilih tabel tertentu?',
      a: 'Tampilan tersebut muncul jika tabel cedant tersebut belum pernah diunggah/diproses melalui menu Upload Bordero. Setelah file diunggah dan diproses, data akan otomatis muncul.'
    },
    {
      q: 'Apakah kolom breakdown seperti SPL atau QS yang kosong akan memicu Warning?',
      a: 'Tidak. Kolom opsional dan proporsi khusus (seperti SPL, QS, atau breakdown per item) sudah dikecualikan dari aturan validasi sehingga tidak akan memicu warning palsu.'
    },
    {
      q: 'Bagaimana cara mengekspor data yang sudah diproses?',
      a: 'Klik tombol "Export Excel" di pojok kanan atas pada halaman Bordero Fire atau Bordero Kredit untuk mengunduh data yang sedang aktif.'
    }
  ];

  return (
    <div className="p-6 space-y-6 text-xs bg-slate-50 min-h-screen font-sans">
      
      {/* Header Halaman */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>Panduan Pengguna (User Guide)</span>
        </h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Panduan operasional sistem pemrosesan data Bordero dan validasi skema IPR reasuransi.
        </p>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'workflow'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          Alur Kerja Sistem (Workflow)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('validation')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'validation'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          Aturan Validasi & Indikator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'faq'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          Tanya Jawab (FAQ)
        </button>
      </div>

      {/* TAB 1: WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-2xs">
                    {item.icon}
                  </div>
                  <span className="font-mono font-bold text-slate-300 text-lg">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-4 flex items-start gap-3 text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px]">
              <p className="font-bold">Tips Operasional:</p>
              <p className="text-blue-700 leading-relaxed">
                Pastikan file Excel yang diunggah memiliki sheet yang sesuai (misal: sheet PREMI atau KLAIM) agar parser pipeline dapat menemukan baris header secara tepat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VALIDATION RULES */}
      {activeTab === 'validation' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Status dan Indikator Data</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Sistem menerapkan validasi otomatis pada baris data untuk memastikan integritas laporan sebelum disetujui.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-800">Status Valid</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Baris data memenuhi semua kriteria kelengkapan data mandatory. Seluruh atribut utama seperti identitas polis, tanggal periode, dan nilai pertanggungan terisi penuh.
              </p>
            </div>

            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-amber-800">Status Warning</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Terdapat kolom kunci yang bernilai <code className="font-mono font-bold text-amber-700 bg-amber-100/70 px-1 py-0.5 rounded">[NULL]</code>. Arahkan kursor ke badge Warning untuk melihat daftar kolom apa saja yang belum terisi.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-700 mb-2">Kolom Wajib (Mandatory Checklist)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 font-semibold">• Policy Number</div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 font-semibold">• Insured / Debitur</div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 font-semibold">• 100% TSI / Plafond</div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 font-semibold">• 100% Premium / Claim</div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 font-semibold">• Date of Loss (Klaim)</div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 font-semibold">• Period Start & End</div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 font-semibold">• Occupation / Risk</div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 font-semibold">• Underwriting Year</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ */}
      {activeTab === 'faq' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Pertanyaan yang Sering Diajukan (FAQ)</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Jawaban atas kendala teknis dan pemahaman penggunaan sistem.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, i) => (
              <div key={i} className="py-3.5 space-y-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{faq.q}</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed pl-5.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}