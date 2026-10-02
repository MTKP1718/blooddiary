import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  Droplet
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';

const bloodGroups = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const availabilityOptions = ['', 'Available', 'Not Available'];
const statusOptions = ['', 'PENDING', 'APPROVED', 'REJECTED'];

export function DonorsListPage() {
  const navigate = useNavigate();

  const [donors, setDonors] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    donorId: null,
    donorName: '',
    action: '' // 'delete' | 'approve' | 'reject'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDonors = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/donors', {
        params: {
          search,
          blood_group: selectedBloodGroup,
          city: selectedCity,
          availability_status: selectedAvailability,
          registration_status: selectedStatus,
          page,
          limit: pagination.limit,
          sort_by: sortBy,
          sort_order: sortOrder
        }
      });

      if (res.data.success) {
        setDonors(res.data.donors);
        setPagination(res.data.pagination);
        if (res.data.availableCities) {
          setAvailableCities(res.data.availableCities);
        }
      }
    } catch (err) {
      console.error('Error fetching donors list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors(1);
  }, [selectedBloodGroup, selectedCity, selectedAvailability, selectedStatus, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBloodGroup('');
    setSelectedCity('');
    setSelectedAvailability('');
    setSelectedStatus('');
    setSortBy('created_at');
    setSortOrder('DESC');
  };

  const triggerSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

  const handleConfirmAction = async () => {
    const { donorId, action } = confirmDialog;
    if (!donorId) return;

    try {
      setActionLoading(true);
      if (action === 'delete') {
        await api.delete(`/admin/donors/${donorId}`);
      } else if (action === 'approve') {
        await api.put(`/admin/donors/${donorId}/approve`);
      } else if (action === 'reject') {
        await api.put(`/admin/donors/${donorId}/reject`);
      }
      setConfirmDialog({ isOpen: false, donorId: null, donorName: '', action: '' });
      fetchDonors(pagination.page);
    } catch (err) {
      console.error('Failed to execute action:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Donor Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, verify and manage registered voluntary blood donors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDonors(pagination.page)}
            title="Refresh Table"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/donors/add"
            className="px-4 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Donor</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donor by name, mobile, email, city, or district..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-crimson-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Blood Group */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Blood Group</label>
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-crimson-600"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.filter(Boolean).map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-crimson-600"
            >
              <option value="">All Cities</option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-crimson-600"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          {/* Registration Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Registration Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-crimson-600"
            >
              <option value="">All Registrations</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="flex items-end col-span-2 sm:col-span-1">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Donors Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-crimson-600" />
            <p className="text-xs">Loading donor directory...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No donors match your search or filter criteria</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => triggerSort('id')}>
                    <span className="flex items-center gap-1">ID <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => triggerSort('full_name')}>
                    <span className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-3.5 px-4">Blood</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => triggerSort('created_at')}>
                    <span className="flex items-center gap-1">Registered <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                      #{String(d.id).padStart(3, '0')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <Link to={`/admin/donors/${d.id}`} className="hover:text-crimson-600 transition-colors">
                        {d.full_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-crimson-50 text-crimson-700 font-extrabold text-[11px] border border-crimson-100">
                        {d.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{d.mobile}</td>
                    <td className="py-3 px-4 text-slate-500">{d.email}</td>
                    <td className="py-3 px-4">{d.city}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.availability_status} type="availability" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.registration_status} type="registration" />
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link
                        to={`/admin/donors/${d.id}`}
                        title="View details"
                        className="inline-flex p-1.5 rounded-lg text-slate-600 hover:text-crimson-600 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {d.registration_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setConfirmDialog({
                              isOpen: true,
                              donorId: d.id,
                              donorName: d.full_name,
                              action: 'approve'
                            })}
                            title="Approve Donor"
                            className="inline-flex p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDialog({
                              isOpen: true,
                              donorId: d.id,
                              donorName: d.full_name,
                              action: 'reject'
                            })}
                            title="Reject Donor"
                            className="inline-flex p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setConfirmDialog({
                          isOpen: true,
                          donorId: d.id,
                          donorName: d.full_name,
                          action: 'delete'
                        })}
                        title="Delete Donor"
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <div>
            Showing <strong>{donors.length}</strong> of <strong>{pagination.total}</strong> total registered donors
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDonors(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchDonors(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.action === 'delete'
            ? 'Delete Donor Profile'
            : confirmDialog.action === 'approve'
            ? 'Approve Donor Registration'
            : 'Reject Donor Registration'
        }
        message={
          confirmDialog.action === 'delete'
            ? `Are you sure you want to permanently delete donor "${confirmDialog.donorName}"? This will remove all their personal and donation records from the system.`
            : confirmDialog.action === 'approve'
            ? `Are you sure you want to approve "${confirmDialog.donorName}"? Their status will be set to APPROVED and they will be eligible for emergency donations.`
            : `Are you sure you want to reject the registration request for "${confirmDialog.donorName}"?`
        }
        confirmText={
          confirmDialog.action === 'delete'
            ? 'Delete Donor'
            : confirmDialog.action === 'approve'
            ? 'Approve'
            : 'Reject'
        }
        confirmVariant={confirmDialog.action === 'approve' ? 'primary' : 'danger'}
        isLoading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ isOpen: false, donorId: null, donorName: '', action: '' })}
      />

    </div>
  );
}
