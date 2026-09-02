import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import indoreLogo from '../../assets/indore.png';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Table2, 
  ShieldCheck, 
  History, 
  FileCode, 
  BookOpen, 
  HelpCircle, 
  Users,
  ChevronDown,
  Terminal
} from 'lucide-react';

export default function Sidebar({ isBlocked = false }) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState('');

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard,
    },
    { 
      id: 'upload', 
      label: 'Upload Bordero', 
      path: '/upload', 
      icon: UploadCloud,
    },
    {
      id: 'bordero-cedant',
      label: 'View Bordero',
      icon: Table2,
      subItems: [
        { id: 'fire', label: 'Bordero FIRE', path: '/form/form-fire' },
        { id: 'credit', label: 'Bordero Credit', path: '/form/form-kredit' }
      ]
    },
    {
      id: 'validasi-bordero',
      label: 'Validation Bordero',
      path: '/validasi-bordero',
      icon: ShieldCheck,
    },
    {
      id: 'history',
      label: 'ETL History',
      path: '/history',
      icon: History,
    },
    {
      id: 'master',
      label: 'Master',
      icon: FileCode,
      subItems: [
        { id: 'mapping', label: 'Mapping', path: '/master/mapping' }
      ]
    },
    { 
      id: 'form-ipr', 
      label: 'IPR Format', 
      path: '/form-ipr', 
      icon: BookOpen,
    },
  ];

  const secondaryItems = [
    { id: 'dev-tools', label: 'Dev Tools', path: '/dev-tools', icon: Terminal, badge: 'DEV' },
    { id: 'users', label: 'User Management', path: '/users', icon: Users },
    { id: 'guide', label: 'User Guide', path: '/user-guide', icon: HelpCircle },
  ];

  return (
    <aside 
      className={`w-[260px] bg-[#F8F9FA] border-r border-slate-200/80 h-screen sticky top-0 flex flex-col font-sans transition-all duration-200 ${
        isBlocked ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/60">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img 
            src={indoreLogo} 
            alt="Logo Indore" 
            className="h-8 w-auto object-contain" 
          />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-sm tracking-tight leading-tight">
              Indore Treaty RU
            </span>
            <span className="text-[11px] text-slate-400 font-normal tracking-wide">
              ETL Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigasi Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              
              const isActive = hasSubItems 
                ? item.subItems.some(sub => location.pathname.startsWith(sub.path))
                : location.pathname === item.path;

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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                        isActive 
                          ? 'bg-slate-200/70 text-slate-900 font-semibold' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180 text-slate-700' : 'text-slate-400'}`} />
                    </button>
                  ) : (
                    <Link 
                      to={isBlocked ? '#' : item.path}
                      tabIndex={isBlocked ? -1 : 0}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive 
                          ? 'bg-slate-200/70 text-slate-900 font-semibold' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  )}

                  {/* Sub-menu Dropdown */}
                  {hasSubItems && isOpen && (
                    <div className="pl-10 pr-2 py-1 space-y-1 animate-in fade-in duration-150">
                      {item.subItems.map((sub) => {
                        const isSubActive = location.pathname.startsWith(sub.path);
                        return (
                          <Link
                            key={sub.id}
                            to={isBlocked ? '#' : sub.path}
                            tabIndex={isBlocked ? -1 : 0}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSubActive 
                                ? 'text-blue-600 bg-blue-50 font-semibold' 
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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

        {/* Menu Lainnya */}
        <div>
          <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Others</p>
          <nav className="space-y-1">
            {secondaryItems.map((link) => {
              const IconComp = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link 
                  key={link.id} 
                  to={isBlocked ? '#' : link.path} 
                  tabIndex={isBlocked ? -1 : 0}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-slate-200/70 text-slate-900 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <IconComp className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="flex items-center justify-between w-full">
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        {link.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}