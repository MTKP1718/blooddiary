import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplet,
  Heart,
  Calendar,
  User,
  History,
  Edit,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Loader2,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';

export function DashboardPage() {
  const { donor, logout, updateAvailability, refreshDonor } = useAuth();
  const navigate = useNavigate();

  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [recentDonations, setRecentDonations] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoadingDonations, setIsLoadingDonations] = useState(true);

  useEffect(() => {
    // Refresh donor data from API to catch live admin approvals
    refreshDonor();
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setIsLoadingDonations(true);
      const res = await api.get('/donors/me/donations');
      if (res.data.success) {
        setRecentDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setIsLoadingDonations(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!donor) return;
    const newStatus = donor.availability_status === 'Available' ? 'Not Available' : 'Available';

    try {
      setIsUpdatingAvailability(true);
      const res = await updateAvailability(newStatus);
      if (res.success) {
        showToast(`Availability status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update availability:', err);
      showToast('Could not update availability status. Please try again.');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!donor) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-crimson-600 animate-spin" />
      </div>
    );
  }

  const isApproved = donor.registration_status === 'APPROVED';
  const isPending = donor.registration_status === 'PENDING';
  const isRejected = donor.registration_status === 'REJECTED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-crimson-600">Donor Dashboard</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">ID: #{String(donor.id).padStart(3, '0')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, <span className="text-crimson-700">{donor.full_name}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{donor.city}, {donor.state || 'Tamil Nadu'}</span>
            <span className="text-slate-300">•</span>
            <span>Registered: {new Date(donor.created_at).toLocaleDateString()}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={refreshDonor}
            title="Refresh status from server"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>My Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Registration Status Notification Banner */}
      {isPending && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Registration Status: Under Review (PENDING)</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Your profile is submitted and waiting for verification by our medical administrator. You can still update your details and availability anytime.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-200 text-amber-900 whitespace-nowrap">
            Verification Pending
          </span>
        </div>
      )}

      {isApproved && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Account Verified & Active (APPROVED)</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your donor credentials have been verified by the medical team. You are eligible to receive emergency blood requests.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-200 text-emerald-900 whitespace-nowrap">
            ✓ Verified Donor
          </span>
        </div>
      )}

      {isRejected && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Application Status: REJECTED</p>
              <p className="text-xs text-rose-800 mt-0.5">
                Your registration could not be verified with current criteria. Please update your profile information or contact the blood bank coordinator.
              </p>
            </div>
          </div>
          <Link
            to="/profile?edit=true"
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors whitespace-nowrap"
          >
            Review Profile
          </Link>
        </div>
      )}

      {/* Primary 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Blood Group */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Blood Group</span>
            <div className="w-9 h-9 rounded-xl bg-crimson-50 text-crimson-600 flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-crimson-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">{donor.blood_group}</span>
            <span className="text-xs text-slate-500 font-medium">Rh Type</span>
          </div>
          <p className="text-xs text-slate-500">
            Registered blood group on certified donor record
          </p>
        </div>

        {/* Card 2: Availability */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Availability</span>
            <StatusBadge status={donor.availability_status} type="availability" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 block">
              {donor.availability_status}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {donor.availability_status === 'Available'
                ? 'Visible to emergency medical dispatch'
                : 'Temporarily resting from donations'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={isUpdatingAvailability}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              donor.availability_status === 'Available'
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {isUpdatingAvailability ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : donor.availability_status === 'Available' ? (
              <>
                <ToggleLeft className="w-4 h-4" />
                <span>Set as Not Available</span>
              </>
            ) : (
              <>
                <ToggleRight className="w-4 h-4" />
                <span>Set as Available</span>
              </>
            )}
          </button>
        </div>

        {/* Card 3: Registration Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registration Status</span>
            <StatusBadge status={donor.registration_status} type="registration" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 block">
              {donor.registration_status}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Admin verification state in database
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Updates in real-time when admin approves or modifies status.
          </div>
        </div>

        {/* Card 4: Last Donation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Last Donation</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 block">
              {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Record Yet'}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {donor.last_donation_date ? 'Recorded in blood bank database' : 'Eligible to make your first donation'}
            </p>
          </div>
          <Link
            to="/donations"
            className="text-xs font-semibold text-crimson-600 hover:text-crimson-700 flex items-center justify-between pt-1"
          >
            <span>View All Records</span>
            <span>→</span>
          </Link>
        </div>

      </div>

      {/* Action Buttons Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Management Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/profile"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center mx-auto mb-2 shadow-xs group-hover:text-crimson-600">
              <User className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm text-slate-800">My Profile</p>
            <p className="text-[11px] text-slate-500">View personal data</p>
          </Link>

          <Link
            to="/profile?edit=true"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center mx-auto mb-2 shadow-xs group-hover:text-crimson-600">
              <Edit className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm text-slate-800">Edit Profile</p>
            <p className="text-[11px] text-slate-500">Update contact & location</p>
          </Link>

          <button
            onClick={handleToggleAvailability}
            disabled={isUpdatingAvailability}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center mx-auto mb-2 shadow-xs group-hover:text-emerald-600">
              <RefreshCw className={`w-5 h-5 ${isUpdatingAvailability ? 'animate-spin' : ''}`} />
            </div>
            <p className="font-bold text-sm text-slate-800">Update Availability</p>
            <p className="text-[11px] text-slate-500">Toggle donor status</p>
          </button>

          <Link
            to="/donations"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center mx-auto mb-2 shadow-xs group-hover:text-crimson-600">
              <History className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm text-slate-800">Donation History</p>
            <p className="text-[11px] text-slate-500">Review blood bank visits</p>
          </Link>
        </div>
      </div>

      {/* Recent Donations & Tips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Donations Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-crimson-600" />
              <h3 className="font-bold text-slate-900 text-base">Recent Donation History</h3>
            </div>
            <Link to="/donations" className="text-xs font-semibold text-crimson-600 hover:underline">
              View All ({recentDonations.length})
            </Link>
          </div>

          {isLoadingDonations ? (
            <div className="py-8 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading records...</p>
            </div>
          ) : recentDonations.length === 0 ? (
            <div className="py-10 text-center text-slate-500 space-y-2">
              <Droplet className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm text-slate-700">No donation records recorded yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once you donate at any affiliated blood bank or hospital drive, administrators will log your donation records here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Blood Group</th>
                    <th className="pb-3 font-semibold">Hospital / Blood Bank</th>
                    <th className="pb-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentDonations.slice(0, 3).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {new Date(d.donation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-crimson-50 text-crimson-700 font-bold text-[11px]">
                          {d.blood_group}
                        </span>
                      </td>
                      <td className="py-3 text-slate-700 font-medium">{d.location}</td>
                      <td className="py-3 text-slate-500">{d.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Health Preparation Guide */}
        <div className="lg:col-span-4 bg-gradient-to-br from-crimson-900 to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-rose-300" />
            <span>Donor Care & Readiness</span>
          </div>

          <h4 className="text-lg font-bold">Preparation for Your Next Donation</h4>

          <ul className="space-y-3 text-xs text-rose-100/90 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
              <span>Drink 500ml of water or hydrating fluids 2 to 3 hours prior to donation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
              <span>Consume an iron-rich meal (spinach, beans, lean meats) and avoid fatty fried foods.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
              <span>Ensure a restful sleep of at least 7 hours the previous night.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
              <span>Refrain from smoking 2 hours before and after the blood collection.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-white/10 text-[11px] text-rose-200">
            Emergency hotline: <strong>1800-11-9988</strong>
          </div>
        </div>
      </div>

    </div>
  );
}
