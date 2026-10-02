import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, Menu, X, User, LogOut, HeartHandshake, History, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { donor, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-crimson-700 to-crimson-500 flex items-center justify-center shadow-md shadow-crimson-500/20 group-hover:scale-105 transition-transform">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-crimson-600 transition-colors">
                Blood<span className="text-crimson-600">Connect</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
                Donor Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <a href="/#about" className="text-sm font-medium text-slate-600 hover:text-crimson-600 transition-colors">
                  Why Donate
                </a>
                <a href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-crimson-600 transition-colors">
                  How It Works
                </a>
                <a href="/#blood-groups" className="text-sm font-medium text-slate-600 hover:text-crimson-600 transition-colors">
                  Blood Groups
                </a>
                <a href="/#faq" className="text-sm font-medium text-slate-600 hover:text-crimson-600 transition-colors">
                  FAQ
                </a>
                <a href="/#contact" className="text-sm font-medium text-slate-600 hover:text-crimson-600 transition-colors">
                  Contact
                </a>
                <div className="h-5 w-px bg-slate-200"></div>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-crimson-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Donor Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-crimson-600 hover:bg-crimson-700 px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:shadow-crimson-600/20 transition-all"
                >
                  Register as Donor
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/dashboard') ? 'bg-crimson-50 text-crimson-700 font-semibold' : 'text-slate-600 hover:text-crimson-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/profile') ? 'bg-crimson-50 text-crimson-700 font-semibold' : 'text-slate-600 hover:text-crimson-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <Link
                  to="/donations"
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/donations') ? 'bg-crimson-50 text-crimson-700 font-semibold' : 'text-slate-600 hover:text-crimson-600'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Donation History
                </Link>
                <div className="h-5 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center font-bold text-xs">
                      {donor?.blood_group || 'O+'}
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-slate-800 leading-tight">{donor?.full_name}</p>
                      <p className="text-slate-500 text-[11px]">{donor?.city}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-3">
          {!isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <a
                href="/#about"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50"
              >
                Why Donate
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50"
              >
                How It Works
              </a>
              <a
                href="/#blood-groups"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50"
              >
                Blood Groups
              </a>
              <a
                href="/#faq"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50"
              >
                FAQ
              </a>
              <a
                href="/#contact"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50"
              >
                Contact
              </a>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Donor Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-crimson-600 rounded-xl hover:bg-crimson-700 shadow-sm"
                >
                  Register as Donor
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="px-3 py-2 bg-slate-50 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center font-bold text-sm">
                  {donor?.blood_group}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{donor?.full_name}</p>
                  <p className="text-xs text-slate-500">{donor?.email}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                My Profile
              </Link>
              <Link
                to="/donations"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 flex items-center gap-2"
              >
                <History className="w-4 h-4 text-slate-400" />
                Donation History
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 rounded-md hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
