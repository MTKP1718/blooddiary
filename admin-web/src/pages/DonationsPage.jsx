import React, { useState, useEffect } from 'react';
import {
  History,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  FileText,
  User,
  Loader2,
  RefreshCw,
  Search
} from 'lucide-react';
import api from '../services/api';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [donorsList, setDonorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states for Add & Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [form, setForm] = useState({
    donor_id: '',
    donation_date: new Date().toISOString().split('T')[0],
    blood_group: 'O+',
    location: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const [resDonations, resDonors] = await Promise.all([
        api.get('/admin/donations'),
        api.get('/admin/donors?limit=100')
      ]);

      if (resDonations.data.success) {
        setDonations(resDonations.data.donations || []);
      }
      if (resDonors.data.success) {
        setDonorsList(resDonors.data.donors || []);
      }
    } catch (err) {
      console.error('Error fetching donation records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({
      donor_id: donorsList[0]?.id || '',
      donation_date: new Date().toISOString().split('T')[0],
      blood_group: donorsList[0]?.blood_group || 'O+',
      location: '',
      notes: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (rec) => {
    setIsEditing(true);
    setCurrentId(rec.id);
    setForm({
      donor_id: rec.donor_id,
      donation_date: rec.donation_date ? rec.donation_date.split('T')[0] : '',
      blood_group: rec.blood_group,
      location: rec.location,
      notes: rec.notes || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleDonorSelectChange = (e) => {
    const dId = Number(e.target.value);
    const sel = donorsList.find(d => d.id === dId);
    setForm(prev => ({
      ...prev,
      donor_id: dId,
      blood_group: sel ? sel.blood_group : prev.blood_group
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.donor_id || !form.donation_date || !form.location) {
      setFormError('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      if (isEditing) {
        await api.put(`/admin/donations/${currentId}`, {
          donation_date: form.donation_date,
          blood_group: form.blood_group,
          location: form.location,
          notes: form.notes
        });
      } else {
        await api.post('/admin/donations', {
          donor_id: Number(form.donor_id),
          donation_date: form.donation_date,
          blood_group: form.blood_group,
          location: form.location,
          notes: form.notes
        });
      }

      setModalOpen(false);
      fetchDonations();
    } catch (err) {
      console.error('Failed to save donation record:', err);
      setFormError(err.response?.data?.message || 'Failed to save donation record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/admin/donations/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: null });
      fetchDonations();
    } catch (err) {
      console.error('Failed to delete donation record:', err);
    }
  };

  // Filter donations
  const filteredDonations = donations.filter(d => {
    const s = search.toLowerCase();
    return (
      (d.donor_name && d.donor_name.toLowerCase().includes(s)) ||
      (d.location && d.location.toLowerCase().includes(s)) ||
      (d.blood_group && d.blood_group.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-crimson-600" />
            <span>Donation Records Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log and audit blood collection events, mobile drives, and hospital hospital units
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDonations}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Donation</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donation records by donor name, blood bank, or blood group..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-crimson-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-crimson-600" />
            <p className="text-xs">Fetching donation records...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No donation records found</p>
            <p className="text-xs text-slate-400">
              Click "Record New Donation" above to log a completed blood unit.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-5">#</th>
                  <th className="py-3.5 px-5">Donor Name</th>
                  <th className="py-3.5 px-5">Blood Group</th>
                  <th className="py-3.5 px-5">Donation Date</th>
                  <th className="py-3.5 px-5">Hospital / Blood Bank</th>
                  <th className="py-3.5 px-5">Clinical Notes</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDonations.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{d.donor_name || `Donor #${d.donor_id}`}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-full bg-crimson-50 text-crimson-700 font-extrabold text-[11px] border border-crimson-100">
                        {d.blood_group}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(d.donation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{d.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">
                      {d.notes || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(d)}
                        title="Edit donation record"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-crimson-600 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: d.id })}
                        title="Delete record"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Donation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Donation Record' : 'Record New Blood Donation'}
            </h3>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Donor *</label>
                {isEditing ? (
                  <p className="p-2.5 rounded-xl bg-slate-100 font-semibold text-slate-800">
                    {donorsList.find(d => d.id === form.donor_id)?.full_name || `Donor #${form.donor_id}`}
                  </p>
                ) : (
                  <select
                    value={form.donor_id}
                    onChange={handleDonorSelectChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="">-- Select Registered Donor --</option>
                    {donorsList.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.blood_group}) - {d.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Donation Date *</label>
                  <input
                    type="date"
                    value={form.donation_date}
                    onChange={(e) => setForm({ ...form, donation_date: e.target.value })}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <input
                    type="text"
                    value={form.blood_group}
                    onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Center / Hospital *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Government General Hospital, Chennai"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. 450ml whole blood collection, vitals verified stable"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-crimson-600 text-white font-bold hover:bg-crimson-700 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Dialog */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Delete Donation Record"
        message="Are you sure you want to delete this verified donation record from the database?"
        confirmText="Yes, Delete Record"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />

    </div>
  );
}
