import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  ShieldCheck,
  Save,
  AlertCircle,
  Loader2
} from 'lucide-react';
import api from '../services/api';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function DonorFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    mobile: '',
    email: '',
    password: '',
    confirm_password: '',
    address: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    last_donation_date: '',
    availability_status: 'Available',
    registration_status: 'APPROVED'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isEdit) {
      async function loadDonor() {
        try {
          const res = await api.get(`/admin/donors/${id}`);
          if (res.data.success) {
            const d = res.data.donor;
            setFormData({
              full_name: d.full_name || '',
              date_of_birth: d.date_of_birth ? d.date_of_birth.split('T')[0] : '',
              gender: d.gender || 'Male',
              blood_group: d.blood_group || 'O+',
              mobile: d.mobile || '',
              email: d.email || '',
              password: '',
              confirm_password: '',
              address: d.address || '',
              city: d.city || '',
              district: d.district || '',
              state: d.state || 'Tamil Nadu',
              pincode: d.pincode || '',
              emergency_contact_name: d.emergency_contact_name || '',
              emergency_contact_number: d.emergency_contact_number || '',
              last_donation_date: d.last_donation_date ? d.last_donation_date.split('T')[0] : '',
              availability_status: d.availability_status || 'Available',
              registration_status: d.registration_status || 'APPROVED'
            });
          }
        } catch (err) {
          console.error('Error fetching donor for edit:', err);
          setServerError('Could not load donor record.');
        } finally {
          setLoading(false);
        }
      }
      loadDonor();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required.';
    if (!formData.date_of_birth) errs.date_of_birth = 'Date of birth is required.';
    if (!formData.blood_group) errs.blood_group = 'Blood group is required.';

    const mobileClean = formData.mobile.replace(/[\s\-+()]/g, '');
    if (!formData.mobile.trim()) errs.mobile = 'Mobile is required.';
    else if (!/^\d{10,12}$/.test(mobileClean)) errs.mobile = 'Enter a valid 10-digit mobile number.';

    if (!formData.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errs.email = 'Enter a valid email.';

    if (!isEdit) {
      if (!formData.password) errs.password = 'Password is required.';
      else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
      if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match.';
    }

    if (!formData.address.trim()) errs.address = 'Address is required.';
    if (!formData.city.trim()) errs.city = 'City is required.';
    if (!formData.district.trim()) errs.district = 'District is required.';
    if (!formData.pincode.trim()) errs.pincode = 'Pincode is required.';
    else if (!/^\d{6}$/.test(formData.pincode.trim())) errs.pincode = 'Enter a valid 6-digit pincode.';

    if (!formData.emergency_contact_name.trim()) errs.emergency_contact_name = 'Emergency contact name is required.';
    if (!formData.emergency_contact_number.trim()) errs.emergency_contact_number = 'Emergency contact number is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setServerError('');

    try {
      if (isEdit) {
        await api.put(`/admin/donors/${id}`, {
          ...formData,
          last_donation_date: formData.last_donation_date || null
        });
        navigate(`/admin/donors/${id}`);
      } else {
        await api.post('/auth/register', {
          ...formData,
          password: formData.password || 'Donor@12345',
          confirm_password: formData.password || 'Donor@12345',
          last_donation_date: formData.last_donation_date || null
        });
        navigate('/admin/donors');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setServerError(err.response?.data?.message || 'Failed to save donor record.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-crimson-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <Link
          to="/admin/donors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-crimson-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Donors List</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isEdit ? 'Edit Donor Information' : 'Register New Donor'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isEdit ? 'Update verified donor attributes and location data' : 'Manually record a new blood donor into the database'}
        </p>
      </div>

      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-8">
        
        {/* Section 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-sm">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
              />
              {errors.full_name && <p className="text-rose-600 mt-0.5">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
              />
              {errors.date_of_birth && <p className="text-rose-600 mt-0.5">{errors.date_of_birth}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Heart className="w-4 h-4 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-sm">Blood & Status Settings</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none bg-white font-bold"
              >
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Availability *</label>
              <select
                name="availability_status"
                value={formData.availability_status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none bg-white"
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registration Status *</label>
              <select
                name="registration_status"
                value={formData.registration_status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none bg-white font-semibold"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Phone className="w-4 h-4 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-sm">Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
              />
              {errors.mobile && <p className="text-rose-600 mt-0.5">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isEdit}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none disabled:bg-slate-50"
              />
              {errors.email && <p className="text-rose-600 mt-0.5">{errors.email}</p>}
            </div>

            {!isEdit && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                  />
                  {errors.password && <p className="text-rose-600 mt-0.5">{errors.password}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                  />
                  {errors.confirm_password && <p className="text-rose-600 mt-0.5">{errors.confirm_password}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-sm">Location Details</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
              />
              {errors.address && <p className="text-rose-600 mt-0.5">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
                {errors.city && <p className="text-rose-600 mt-0.5">{errors.city}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">District *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
                {errors.district && <p className="text-rose-600 mt-0.5">{errors.district}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
                />
                {errors.pincode && <p className="text-rose-600 mt-0.5">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-crimson-600" />
            <h3 className="font-bold text-slate-900 text-sm">Emergency Contact & Past Donation</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Name *</label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
              />
              {errors.emergency_contact_name && <p className="text-rose-600 mt-0.5">{errors.emergency_contact_name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone *</label>
              <input
                type="tel"
                name="emergency_contact_number"
                value={formData.emergency_contact_number}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
              />
              {errors.emergency_contact_number && <p className="text-rose-600 mt-0.5">{errors.emergency_contact_number}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Blood Donation Date</label>
              <input
                type="date"
                name="last_donation_date"
                value={formData.last_donation_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-crimson-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/admin/donors')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 disabled:bg-crimson-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Donor...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Save Changes' : 'Create Donor'}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
