import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Droplet,
  Calendar,
  MapPin,
  FileText,
  Heart,
  Loader2,
  ArrowLeft,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function DonationsPage() {
  const { donor } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDonations() {
      try {
        setLoading(true);
        const res = await api.get('/donors/me/donations');
        if (res.data.success) {
          setDonations(res.data.donations || []);
        }
      } catch (err) {
        console.error('Error fetching donations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDonations();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-crimson-600 hover:text-crimson-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-crimson-600" />
            <span>Donation History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of your past voluntary blood donations verified by healthcare centers.
          </p>
        </div>

        {/* Milestone Badge */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Total Donations</p>
            <p className="text-xl font-extrabold text-slate-900">{donations.length} Units Donated</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-crimson-600" />
            <p className="text-xs">Fetching verified donation records...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3 px-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-crimson-600 flex items-center justify-center mx-auto">
              <Droplet className="w-8 h-8 fill-crimson-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Donation History Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              When you donate blood at any certified hospital or community blood camp, the medical administrator records the event and it will appear here.
            </p>
            <Link
              to="/dashboard"
              className="inline-block mt-2 px-5 py-2 rounded-xl bg-crimson-600 text-white text-xs font-semibold hover:bg-crimson-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">#</th>
                  <th className="py-4 px-6 font-semibold">Donation Date</th>
                  <th className="py-4 px-6 font-semibold">Blood Group</th>
                  <th className="py-4 px-6 font-semibold">Hospital / Blood Bank</th>
                  <th className="py-4 px-6 font-semibold">Clinical Notes</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {donations.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.donation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-crimson-50 text-crimson-700 font-extrabold text-[11px] border border-crimson-100">
                        {item.blood_group || donor?.blood_group}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-xs">
                      {item.notes ? (
                        <span className="flex items-start gap-1">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span>{item.notes}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Verified Complete
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lifesaving Impact Note */}
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-900 flex items-center gap-3">
        <Heart className="w-5 h-5 text-crimson-600 shrink-0" />
        <p>
          <strong>Lifesaving Impact:</strong> Your {donations.length} recorded donation{donations.length !== 1 ? 's have' : ' has'} potentially impacted up to <strong>{donations.length * 3} lives</strong> in surgical recovery, trauma intensive care, and hematology oncology.
        </p>
      </div>

    </div>
  );
}
