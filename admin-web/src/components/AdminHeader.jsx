import React from 'react';
import { Menu, Bell, Shield, Droplet } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export function AdminHeader({ onMenuClick, title = 'Administration' }) {
  const { admin, isSuperAdmin } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time system pulse */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>REST API Active</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center font-bold text-xs">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-slate-800 leading-tight">{admin?.name}</p>
            <p className="text-slate-500 text-[10px]">{isSuperAdmin ? 'Super Administrator' : 'Administrator'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
