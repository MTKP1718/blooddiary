import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Search,
  History,
  FileBarChart,
  ShieldCheck,
  Settings,
  LogOut,
  Droplet,
  X,
  ExternalLink
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export function AdminSidebar({ isOpen, onClose }) {
  const { admin, isSuperAdmin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/donors', label: 'Donors', icon: Users },
    { to: '/admin/registrations', label: 'Registration Requests', icon: UserCheck },
    { to: '/admin/search', label: 'Search Donors', icon: Search },
    { to: '/admin/donations', label: 'Donation Records', icon: History },
    { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
    ...(isSuperAdmin
      ? [{ to: '/admin/administrators', label: 'Administrators', icon: ShieldCheck }]
      : []),
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-crimson-600 flex items-center justify-center text-white shadow-md shadow-crimson-600/30">
            <Droplet className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">
              Blood<span className="text-crimson-500">Connect</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-rose-400">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Close button on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin Profile Mini Card */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-crimson-400 flex items-center justify-center font-bold text-sm border border-slate-700">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{admin?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isSuperAdmin ? 'bg-purple-400' : 'bg-blue-400'}`}></span>
              <span className="text-[11px] text-slate-400 uppercase font-medium">
                {isSuperAdmin ? 'Super Admin' : 'Admin Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
          Management
        </p>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-crimson-600 text-white shadow-sm shadow-crimson-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800/80">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Droplet className="w-3.5 h-3.5 text-crimson-500" />
              <span>Donor Web App</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-64 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
