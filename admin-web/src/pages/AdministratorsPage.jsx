import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Lock,
  User,
  Shield,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function AdministratorsPage() {
  const { isSuperAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    status: 'ACTIVE'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/administrators');
      if (res.data.success) {
        setAdmins(res.data.admins);
      }
    } catch (err) {
      console.error('Failed to load administrators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedAdminId(null);
    setForm({ name: '', email: '', password: '', role: 'ADMIN', status: 'ACTIVE' });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (a) => {
    setIsEditing(true);
    setSelectedAdminId(a.id);
    setForm({ name: a.name, email: a.email, password: '', role: a.role, status: a.status });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      setSubmitting(true);
      if (isEditing) {
        await api.put(`/admin/administrators/${selectedAdminId}`, {
          name: form.name,
          role: form.role,
          status: form.status
        });
      } else {
        if (!form.password || form.password.length < 6) {
          setFormError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }
        await api.post('/admin/administrators', form);
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (err) {
      console.error('Failed to save administrator:', err);
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await api.delete(`/admin/administrators/${deleteDialog.id}`);
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchAdmins();
    } catch (err) {
      console.error('Failed to remove admin:', err);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
        <Shield className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Administrator management requires Super Administrator permissions. Please contact your senior systems officer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-crimson-600" />
            <span>Administrator Access Control</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Administrator privilege management, role delegations, and account status controls
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Administrator</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-crimson-600" />
            <p className="text-xs">Loading authorized administrators...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Administrator Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6">Created On</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {a.name?.charAt(0)}
                        </div>
                        <span>{a.name}</span>
                        {a.id === 1 && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600">{a.email}</td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={a.role} type="role" />
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={a.status} type="activeStatus" />
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(a)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-crimson-600 hover:bg-slate-100 transition-colors"
                        title="Edit Admin"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {a.id !== 1 && (
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: a.id, name: a.name })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove Admin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Administrator Profile' : 'Add New Administrator'}
            </h3>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@bloodconnect.org"
                  disabled={isEditing}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none disabled:bg-slate-50"
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="ADMIN">ADMIN (Operations Staff)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Control)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-crimson-600 text-white font-bold hover:bg-crimson-700 transition-colors shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Remove Administrator"
        message={`Are you sure you want to revoke administrative access for "${deleteDialog.name}"?`}
        confirmText="Revoke Access"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
      />

    </div>
  );
}
