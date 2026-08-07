import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  // Deteksi judul berdasarkan path biar dinamis
  const getPageTitle = () => {
    if (location.pathname.includes('upload')) return 'Upload Bordero';
    if (location.pathname.includes('dashboard')) return 'Dashboard';
    return 'Treaty Management';
  };

  return (
    <nav className="h-20 bg-[#F8F9FA] flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Kiri: Judul Halaman */}
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Kanan: Icons & Profile */}
      <div className="flex items-center gap-5">
        {/* Ikon Settings & Notif */}
        <div className="flex items-center gap-2 border-r border-slate-300 pr-5">
          <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Profil */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img src="https://ui-avatars.com/api/?name=Abu+Rizky&background=0D8ABC&color=fff" alt="Profile" className="w-9 h-9 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 leading-tight">Abu Rizky</span>
            <span className="text-xs text-slate-400">Admin</span>
          </div>
          <svg className="w-4 h-4 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </nav>
  );
}