import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Search,
  Droplet,
  Loader2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import api from '../services/api';

const PIE_COLORS = ['#16a34a', '#dc2626'];
const BLOOD_BAR_COLORS = ['#dc2626', '#ef4444', '#b91c1c', '#f87171', '#991b1b', '#fca5a5', '#7f1d1d', '#fee2e2'];

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      setError('');
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to load dashboard metrics from REST API.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-crimson-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Aggregating hospital donor statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Blood Donor Management Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics and volunteer registry metrics across participating hospital centers
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>

          <Link
            to="/admin/search"
            className="px-4 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Emergency Search</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* 1. Total Donors */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Total Donors</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats?.totalDonors?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400">Total registered profiles</p>
        </div>

        {/* 2. Available Donors */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Available Donors</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {stats?.availableDonors?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Ready for immediate dispatch</p>
        </div>

        {/* 3. Unavailable Donors */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Unavailable</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-600">
            {stats?.unavailableDonors?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400">Resting or off-duty</p>
        </div>

        {/* 4. Pending Registrations */}
        <Link
          to="/admin/registrations"
          className="bg-white rounded-3xl p-5 border border-amber-200 hover:border-amber-300 shadow-2xs space-y-2 transition-all group"
        >
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">
            {stats?.pendingRegistrations?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-amber-700 font-semibold group-hover:underline">
            Requires admin action →
          </p>
        </Link>

        {/* 5. Approved Donors */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Approved Donors</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">
            {stats?.approvedDonors?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400">Verified medical status</p>
        </div>

        {/* 6. Donations This Month */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>This Month</span>
            <div className="w-8 h-8 rounded-xl bg-crimson-50 text-crimson-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-crimson-600">
            {stats?.donationsThisMonth?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400">Recorded clinical units</p>
        </div>

      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Donors by Blood Group */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Donors by Blood Group</h3>
              <p className="text-xs text-slate-500">Distribution across all 8 major human blood types</p>
            </div>
            <span className="text-xs font-bold text-crimson-600 bg-crimson-50 px-2.5 py-1 rounded-full">
              Real-time
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.donorsByBloodGroup || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="blood_group" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Available vs Unavailable (Donut) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Availability Ratio</h3>
            <p className="text-xs text-slate-500">Available vs resting donors</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.availabilityRatio || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.availabilityRatio || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 text-center">
            {stats?.totalDonors > 0
              ? `${Math.round((stats.availableDonors / stats.totalDonors) * 100)}% of registered donors are currently active`
              : 'No donor activity recorded'}
          </div>
        </div>

        {/* Chart 2: Donors by City */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Donors by City</h3>
            <p className="text-xs text-slate-500">Regional coverage across healthcare districts</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts?.donorsByCity || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis type="category" dataKey="city" stroke="#64748b" fontSize={12} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Registrations (Area) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Monthly Registrations</h3>
            <p className="text-xs text-slate-500">New volunteer sign-ups over the past 6 months</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyRegistrations || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2.5} fillOpacity={1} fill="url(#regGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
