import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Droplet, Shield, Mail, Lock, AlertCircle, ArrowRight, Loader2, Info } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wasExpired = searchParams.get('expired') === 'true';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrator email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Invalid administrator credentials.');
      } else {
        setError('Cannot connect to authentication server. Please ensure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'super') {
      setEmail('admin@bloodconnect.org');
      setPassword('Admin@12345');
    } else {
      setEmail('staff@bloodconnect.org');
      setPassword('Admin@12345');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-crimson-600 text-white shadow-lg shadow-crimson-600/30 mb-2">
            <Droplet className="w-8 h-8 fill-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Blood<span className="text-crimson-500">Connect</span>
          </h1>
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
            Administrative Control Portal
          </p>
        </div>

        {wasExpired && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Administrative session expired. Please re-authenticate.</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Administrator Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized clinical officers and system managers only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bloodconnect.org"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-crimson-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-crimson-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-crimson-600 hover:bg-crimson-700 disabled:bg-crimson-400 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-crimson-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Development Quick Fill Options */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('super')}
                className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-[11px] font-semibold transition-colors truncate"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('staff')}
                className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold transition-colors truncate"
              >
                Operations Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          BloodConnect Secure Healthcare Administration System v1.0
        </p>

      </div>
    </div>
  );
}
