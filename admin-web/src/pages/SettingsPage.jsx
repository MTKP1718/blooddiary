import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  Shield,
  Key,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../services/api';

export function SettingsPage() {
  const { admin } = useAdminAuth();
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    try {
      setChecking(true);
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      console.error(err);
      setHealth({ status: 'DOWN', error: err.message });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-crimson-600" />
          <span>System & Administration Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Server configurations, database connectivity, and security parameters
        </p>
      </div>

      {/* Server & DB Diagnostics Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-sm">Backend API & Database Status</h3>
          </div>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Check Connectivity</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 block font-semibold text-[11px]">API ENDPOINT</span>
            <span className="font-mono font-bold text-slate-800">http://localhost:5000/api</span>
            <div className="pt-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'UP' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="font-semibold text-slate-700">Health: {health?.status || 'Connecting...'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 block font-semibold text-[11px]">DATABASE ENGINE</span>
            <span className="font-mono font-bold text-slate-800">MySQL 8.0 / bloodconnect_db</span>
            <p className="text-[11px] text-slate-500 pt-1">
              Supports automated schema initialization and persistent fallback.
            </p>
          </div>
        </div>
      </div>

      {/* Security Best Practices Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-crimson-600" />
          <h3 className="font-bold text-slate-900 text-sm">Security Best Practices & Data Protection</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">BCrypt Password Hashing:</strong> All donor and admin passwords are salt-hashed prior to database storage.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">JWT Token Expiry:</strong> Sessions are cryptographically signed and verified on every administrative API request.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Parameterized Queries:</strong> Protects against SQL injection vulnerabilities in all search and filter routes.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Confidential Donor Isolation:</strong> Public unauthenticated clients cannot browse or harvest donor contact numbers.
            </div>
          </div>
        </div>
      </div>

      {/* Active Session Info */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
        <div>
          <span>Authenticated as: <strong>{admin?.name}</strong> ({admin?.email})</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Role: {admin?.role}</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
          Session Active
        </span>
      </div>

    </div>
  );
}
