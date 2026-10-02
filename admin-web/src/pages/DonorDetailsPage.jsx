import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  ShieldCheck,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  Loader2,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function DonorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Donation Modal state
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [donationForm, setDonationForm] = useState({
    donation_date: new Date().toISOString().split('T')[0],
    blood_group: '',
    location: '',
    notes: ''
  });
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

  const fetchDonorData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/donors/${id}`);
      if (res.data.success) {
        setDonor(res.data.donor);
        setDonations(res.data.donations || []);
        setDonationForm(prev => ({ ...prev, blood_group: res.data.donor.blood_group }));
      }
    } catch (err) {
      console.error('Error fetching donor details:', err);
      setError('Could not load donor details from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, [id]);

  const handleApprove = async () => {
    try {
      await api.put(`/admin/donors/${id}/approve`);
      fetchDonorData();
    } catch (err) {
      console.error('Error approving donor:', err);
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/admin/donors/${id}/reject`);
      fetchDonorData();
    } catch (err) {
      console.error('Error rejecting donor:', err);
    }
  };

  const handleToggleAvailability = async () => {
    if (!donor) return;
    const newStatus = donor.availability_status === 'Available' ? 'Not Available' : 'Available';
    try {
      await api.put(`/admin/donors/${id}/availability`, { availability_status: newStatus });
      fetchDonorData();
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleDeleteDonor = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/admin/donors/${id}`);
      navigate('/admin/donors');
    } catch (err) {
      console.error('Error deleting donor:', err);
      setIsDeleting(false);
    }
  };

  const handleAddDonationSubmit = async (e) => {
    e.preventDefault();
    if (!donationForm.donation_date || !donationForm.location) return;

    try {
      setIsSubmittingDonation(true);
      await api.post('/admin/donations', {
        donor_id: Number(id),
        donation_date: donationForm.donation_date,
        blood_group: donationForm.blood_group || donor.blood_group,
        location: donationForm.location,
        notes: donationForm.notes
      });
      setShowAddDonationModal(false);
      fetchDonorData();
    } catch (err) {
      console.error('Error adding donation:', err);
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-crimson-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading donor profile #{id}...</p>
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Donor Record Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested donor does not exist.'}</p>
        <Link
          to="/admin/donors"
          className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Donor Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            to="/admin/donors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-crimson-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Donors</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {donor.full_name}
            </h1>
            <StatusBadge status={donor.registration_status} type="registration" />
            <StatusBadge status={donor.availability_status} type="availability" />
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {donor.registration_status !== 'APPROVED' && (
            <button
              onClick={handleApprove}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Donor</span>
            </button>
          )}

          {donor.registration_status !== 'REJECTED' && (
            <button
              onClick={handleReject}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          )}

          <button
            onClick={handleToggleAvailability}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            {donor.availability_status === 'Available' ? (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-400" />
                <span>Mark Unavailable</span>
              </>
            ) : (
              <>
                <ToggleRight className="w-4 h-4 text-emerald-600" />
                <span>Mark Available</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddDonationModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Donation</span>
          </button>

          <Link
            to={`/admin/donors/${id}/edit`}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            title="Delete Donor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Blood Info Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-crimson-700 to-crimson-500 text-white flex items-center justify-center font-extrabold text-4xl shadow-lg shadow-crimson-600/30">
            {donor.blood_group}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{donor.full_name}</h3>
            <p className="text-xs text-slate-500">Donor ID: #{String(donor.id).padStart(3, '0')}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-xs text-left space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Availability:</span>
              <span className="font-semibold text-slate-900">{donor.availability_status}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Status:</span>
              <span className="font-semibold text-slate-900">{donor.registration_status}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Total Donations:</span>
              <span className="font-semibold text-slate-900">{donations.length} Units</span>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Details Grid */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          
          {/* Personal & Blood */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-crimson-600 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Personal Information</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-900">
                  {donor.date_of_birth ? new Date(donor.date_of_birth).toLocaleDateString() : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Gender</span>
                <span className="font-semibold text-slate-900">{donor.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="font-bold text-crimson-700">{donor.blood_group}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs uppercase font-bold tracking-wider text-crimson-600 mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>Contact Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Primary Mobile</span>
                <span className="font-mono font-bold text-slate-900">{donor.mobile}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="font-medium text-slate-900">{donor.email}</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs uppercase font-bold tracking-wider text-crimson-600 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Location & Residence</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Street Address</span>
                <span className="font-semibold text-slate-900">{donor.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">City / District</span>
                <span className="font-semibold text-slate-900">{donor.city}, {donor.district}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">State / Pincode</span>
                <span className="font-semibold text-slate-900">{donor.state} - {donor.pincode}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact & Registration info */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs uppercase font-bold tracking-wider text-crimson-600 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Emergency Contact & Registration</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Emergency Contact</span>
                <span className="font-semibold text-slate-900">{donor.emergency_contact_name || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Emergency Phone</span>
                <span className="font-mono font-semibold text-slate-900">{donor.emergency_contact_number || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Registered On</span>
                <span className="font-semibold text-slate-900">{new Date(donor.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Donation Records Table for this donor */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-base">Donation History Records</h3>
          </div>
          <button
            onClick={() => setShowAddDonationModal(true)}
            className="px-3 py-1.5 rounded-xl bg-crimson-50 text-crimson-700 hover:bg-crimson-100 font-bold text-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
        </div>

        {donations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No donation records logged for this donor yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Hospital / Blood Bank</th>
                  <th className="py-3 px-4">Clinical Notes</th>
                  <th className="py-3 px-4 text-right">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {new Date(d.donation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-crimson-50 text-crimson-700 font-extrabold text-[11px]">
                        {d.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{d.location}</td>
                    <td className="py-3 px-4 text-slate-500">{d.notes || '—'}</td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Donor Account"
        message={`Are you sure you want to permanently delete "${donor.full_name}"? All associated donation records will also be erased.`}
        confirmText="Yes, Delete Donor"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteDonor}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Add Donation Modal */}
      {showAddDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900">Record Blood Donation</h3>
            <p className="text-xs text-slate-500">
              Log a completed whole blood or component collection for <strong>{donor.full_name}</strong>.
            </p>

            <form onSubmit={handleAddDonationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Donation Date *</label>
                <input
                  type="date"
                  value={donationForm.donation_date}
                  onChange={(e) => setDonationForm({ ...donationForm, donation_date: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                <input
                  type="text"
                  value={donationForm.blood_group}
                  onChange={(e) => setDonationForm({ ...donationForm, blood_group: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital / Blood Bank *</label>
                <input
                  type="text"
                  value={donationForm.location}
                  onChange={(e) => setDonationForm({ ...donationForm, location: e.target.value })}
                  placeholder="e.g. Chennai Central Blood Bank"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  value={donationForm.notes}
                  onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                  placeholder="e.g. 450ml whole blood. Vitals stable."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDonationModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDonation}
                  className="px-5 py-2 rounded-xl bg-crimson-600 text-white font-bold hover:bg-crimson-700 transition-colors shadow-sm"
                >
                  {isSubmittingDonation ? 'Saving...' : 'Save Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
