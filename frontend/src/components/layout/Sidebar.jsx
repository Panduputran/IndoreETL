import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import indoreLogo from '../../assets/indore.png'; // Import aset logo gambar

export default function Sidebar({ isBlocked = false }) {
  const location = useLocation();
  
  // State untuk melacak menu mana yang sedang dibuka (dropdown)
  const [openDropdown, setOpenDropdown] = useState('');

  // Data menu: Dashboard, Upload, Bordero Cedant, Master, IPR
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' 
    },
    { 
      id: 'upload', 
      label: 'Upload Bordero', 
      path: '/upload', 
      icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' 
    },
    {
      id: 'bordero-cedant',
      label: 'Bordero Cedant',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      subItems: [
        { id: 'fire', label: 'FIRE', path: '/form/form-fire' },
        { id: 'credit', label: 'CREDIT', path: '/form/form-kredit' }
      ]
    },
    {
      id: 'master',
      label: 'Master',
      icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', 
      subItems: [
        { id: 'mapping', label: 'Mapping', path: '/master/mapping' }
      ]
    },
    { 
      id: 'form-ipr', 
      label: 'IPR', 
      path: '/form-ipr', 
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' 
    },
  ];

  const otherItems = [
    { id: 'guide', label: 'User Guide', path: '/user-guide', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'help', label: 'Help Center', path: '/help', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  ];

  return (
    <aside 
      className={`w-[260px] bg-[#F8F9FA] border-r border-slate-200/60 h-screen sticky top-0 flex flex-col font-sans transition-all duration-200 ${
        isBlocked ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      {/* Logo Area dengan indore.png */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/40">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <img 
            src={indoreLogo} 
            alt="Logo Indore" 
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
              Indore Treaty RU
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 tracking-wider uppercase">
              ETL Pipeline
            </span>
          </div>
        </Link>

        {/* Indikator Terkunci saat Preview/Terminal Aktif */}
        {isBlocked && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Terkunci
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-8 custom-scrollbar">
        
        {/* Menu Utama */}
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              
              const isActive = hasSubItems 
                ? item.subItems.some(sub => location.pathname.startsWith(sub.path))
                : location.pathname.startsWith(item.path);

              const isOpen = openDropdown === item.id || (openDropdown === '' && isActive);

              const handleToggle = (e) => {
                e.preventDefault();
                if (isBlocked) return;
                setOpenDropdown(isOpen ? '' : item.id);
              };

              return (
                <div key={item.id} className="space-y-1">
                  {hasSubItems ? (
                    <button
                      onClick={handleToggle}
                      tabIndex={isBlocked ? -1 : 0}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive ? 'bg-slate-200/70 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <svg className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                        {item.label}
                      </div>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  ) : (
                    <Link 
                      to={isBlocked ? '#' : item.path}
                      tabIndex={isBlocked ? -1 : 0}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive ? 'bg-slate-200/70 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <svg className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      {item.label}
                    </Link>
                  )}

                  {/* Sub-menu Dropdown */}
                  {hasSubItems && isOpen && (
                    <div className="pl-11 pr-3 py-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.subItems.map((sub) => {
                        const isSubActive = location.pathname.startsWith(sub.path);
                        return (
                          <Link
                            key={sub.id}
                            to={isBlocked ? '#' : sub.path}
                            tabIndex={isBlocked ? -1 : 0}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSubActive ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Menu Others */}
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Others</p>
          <nav className="space-y-1">
            {otherItems.map((link) => (
              <Link 
                key={link.id} 
                to={isBlocked ? '#' : link.path} 
                tabIndex={isBlocked ? -1 : 0}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}