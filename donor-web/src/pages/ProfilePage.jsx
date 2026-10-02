import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  ShieldCheck,
  Edit2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Droplet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function ProfilePage() {
  const { donor, updateProfile, refreshDonor } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    mobile: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    last_donation_date: ''
  });

  useEffect(() => {
    if (donor) {
      setForm({
        full_name: donor.full_name || '',
        date_of_birth: donor.date_of_birth ? donor.date_of_birth.split('T')[0] : '',
        gender: donor.gender || 'Male',
        blood_group: donor.blood_group || 'O+',
        mobile: donor.mobile || '',
        address: donor.address || '',
        city: donor.city || '',
        district: donor.district || '',
        state: donor.state || '',
        pincode: donor.pincode || '',
        emergency_contact_name: donor.emergency_contact_name || '',
        emergency_contact_number: donor.emergency_contact_number || '',
        last_donation_date: donor.last_donation_date ? donor.last_donation_date.split('T')[0] : ''
      });
    }
  }, [donor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await updateProfile({
        ...form,
        last_donation_date: form.last_donation_date || null
      });

      if (res.success) {
        setSuccessMsg('Your profile has been updated successfully!');
        setIsEditing(false);
        refreshDonor();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Update error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!donor) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-crimson-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-crimson-700 to-crimson-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-crimson-600/20">
            {donor.blood_group}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{donor.full_name}</h1>
              <StatusBadge status={donor.registration_status} type="registration" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered Email: {donor.email} • Donor ID: #{String(donor.id).padStart(3, '0')}
            </p>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile View / Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-base">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">{donor.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {donor.date_of_birth ? new Date(donor.date_of_birth).toLocaleDateString() : '—'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-sm font-semibold text-slate-900">{donor.gender}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Blood Group</label>
              {isEditing ? (
                <select
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none bg-white"
                >
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-crimson-50 text-crimson-700 font-bold text-xs inline-block">
                  {donor.blood_group}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-5 h-5 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-base">Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mobile Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">{donor.mobile}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address (Login ID)</label>
              <p className="text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-slate-500">
                {donor.email} <span className="text-[11px] text-slate-400 font-normal">(Primary account ID)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Residential Location */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-base">Location & Address</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">{donor.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{donor.city}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">District</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{donor.district}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{donor.state}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{donor.pincode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Contacts & Donation Record */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-base">Emergency Contact & Donation Record</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Emergency Contact Person</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">{donor.emergency_contact_name || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Emergency Contact Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="emergency_contact_number"
                  value={form.emergency_contact_number}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">{donor.emergency_contact_number || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Last Recorded Donation</label>
              {isEditing ? (
                <input
                  type="date"
                  name="last_donation_date"
                  value={form.last_donation_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-crimson-600 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {donor.last_donation_date
                    ? new Date(donor.last_donation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'No past donation on record'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Save button if editing */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-7 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 disabled:bg-crimson-400 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
