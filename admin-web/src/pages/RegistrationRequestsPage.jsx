import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  Loader2,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function RegistrationRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING'); // default PENDING
  const [loading, setLoading] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    donorId: null,
    donorName: '',
    action: '' // 'approve' | 'reject'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/registrations', {
        params: { status: statusFilter }
      });
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Failed to load registration requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleExecuteAction = async () => {
    const { donorId, action } = confirmDialog;
    if (!donorId) return;

    try {
      setActionLoading(true);
      if (action === 'approve') {
        await api.put(`/admin/donors/${donorId}/approve`);
      } else {
        await api.put(`/admin/donors/${donorId}/reject`);
      }
      setConfirmDialog({ isOpen: false, donorId: null, donorName: '', action: '' });
      fetchRequests();
    } catch (err) {
      console.error('Failed to update registration status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-crimson-600" />
            <span>Donor Registration Requests</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review new blood donor submissions, perform clinical screening verification, and grant approval
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            statusFilter === 'PENDING'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Pending Review</span>
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Approved</span>
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Rejected</span>
        </button>

        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            statusFilter === ''
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>All Submissions</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-crimson-600" />
            <p className="text-xs">Fetching registration submissions...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">
              No registration requests in "{statusFilter || 'ALL'}" state
            </p>
            <p className="text-xs text-slate-400">
              New submissions from the Donor Web application will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-5">Donor Name</th>
                  <th className="py-3.5 px-5">Blood Group</th>
                  <th className="py-3.5 px-5">City / District</th>
                  <th className="py-3.5 px-5">Mobile Contact</th>
                  <th className="py-3.5 px-5">Registration Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <Link to={`/admin/donors/${r.id}`} className="hover:text-crimson-600 transition-colors">
                        {r.full_name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-full bg-crimson-50 text-crimson-700 font-extrabold text-[11px] border border-crimson-100">
                        {r.blood_group}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{r.city}, {r.district}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{r.mobile}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={r.registration_status} type="registration" />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`/admin/donors/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>

                      {r.registration_status !== 'APPROVED' && (
                        <button
                          onClick={() => setConfirmDialog({
                            isOpen: true,
                            donorId: r.id,
                            donorName: r.full_name,
                            action: 'approve'
                          })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {r.registration_status !== 'REJECTED' && (
                        <button
                          onClick={() => setConfirmDialog({
                            isOpen: true,
                            donorId: r.id,
                            donorName: r.full_name,
                            action: 'reject'
                          })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action === 'approve' ? 'Approve Registration' : 'Reject Registration'}
        message={
          confirmDialog.action === 'approve'
            ? `Do you want to approve "${confirmDialog.donorName}"? The donor will immediately see their APPROVED status on their dashboard.`
            : `Are you sure you want to mark the registration for "${confirmDialog.donorName}" as REJECTED?`
        }
        confirmText={confirmDialog.action === 'approve' ? 'Yes, Approve Donor' : 'Yes, Reject'}
        confirmVariant={confirmDialog.action === 'approve' ? 'primary' : 'danger'}
        isLoading={actionLoading}
        onConfirm={handleExecuteAction}
        onCancel={() => setConfirmDialog({ isOpen: false, donorId: null, donorName: '', action: '' })}
      />

    </div>
  );
}
