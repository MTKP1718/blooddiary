import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Droplet,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: searchParams.get('blood_group') || '',
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
    availability_status: 'Available'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    const bgParam = searchParams.get('blood_group');
    if (bgParam && bloodGroups.includes(bgParam)) {
      setFormData(prev => ({ ...prev, blood_group: bgParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};

    // 1. Personal Info
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required.';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters.';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required.';
    } else {
      const dob = new Date(formData.date_of_birth);
      const now = new Date();
      const ageYears = (now - dob) / (365.25 * 24 * 60 * 60 * 1000);
      if (isNaN(dob.getTime()) || dob >= now) {
        newErrors.date_of_birth = 'Please enter a valid past birth date.';
      } else if (ageYears < 18) {
        newErrors.date_of_birth = 'Donor must be at least 18 years old to register.';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender.';
    }

    if (!formData.blood_group) {
      newErrors.blood_group = 'Please select your blood group.';
    }

    // 2. Contact Info
    const mobileClean = formData.mobile.replace(/[\s\-+()]/g, '');
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10,12}$/.test(mobileClean)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password.';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
    }

    // 3. Location
    if (!formData.address.trim()) {
      newErrors.address = 'Street address is required.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }
    if (!formData.district.trim()) {
      newErrors.district = 'District is required.';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit postal pincode.';
    }

    // 4. Emergency Contact
    if (!formData.emergency_contact_name.trim()) {
      newErrors.emergency_contact_name = 'Emergency contact person is required.';
    }
    const emergMobileClean = formData.emergency_contact_number.replace(/[\s\-+()]/g, '');
    if (!formData.emergency_contact_number.trim()) {
      newErrors.emergency_contact_number = 'Emergency contact phone number is required.';
    } else if (!/^\d{10,12}$/.test(emergMobileClean)) {
      newErrors.emergency_contact_number = 'Please enter a valid 10-digit emergency contact phone.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        blood_group: formData.blood_group,
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        emergency_contact_name: formData.emergency_contact_name.trim(),
        emergency_contact_number: formData.emergency_contact_number.trim(),
        last_donation_date: formData.last_donation_date || null,
        availability_status: formData.availability_status
      };

      const res = await register(payload);
      if (res.success) {
        setSuccessModal(true);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response && err.response.data) {
        setServerError(err.response.data.message || 'Registration failed. Please check the form.');
        if (err.response.data.errors) {
          setErrors(prev => ({ ...prev, ...err.response.data.errors }));
        }
      } else {
        setServerError('Cannot reach server. Please ensure the backend API is running.');
      }
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-crimson-100 text-crimson-700 mb-3">
          <Droplet className="w-6 h-6 fill-crimson-600 text-crimson-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Blood Donor Registration</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
          Join our verified donor registry. Your initial registration status will be marked as <strong className="text-amber-700">PENDING</strong> for administrator verification.
        </p>
      </div>

      {/* Global Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to submit registration</p>
            <p>{serverError}</p>
          </div>
        </div>
      )}

      {/* Registration Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        
        {/* SECTION 1: Personal Information */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
            <User className="w-5 h-5 text-crimson-600" />
            <h3 className="text-base font-bold text-slate-900">1. Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-crimson-600">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Arun Kumar"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.full_name ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.full_name && <p className="text-xs text-rose-600 mt-1">{errors.full_name}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date of Birth <span className="text-crimson-600">*</span>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.date_of_birth ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.date_of_birth && <p className="text-xs text-rose-600 mt-1">{errors.date_of_birth}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender <span className="text-crimson-600">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-crimson-600 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Blood Group <span className="text-crimson-600">*</span>
              </label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors bg-white ${
                  errors.blood_group ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              >
                <option value="">-- Select Blood Group --</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              {errors.blood_group && <p className="text-xs text-rose-600 mt-1">{errors.blood_group}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 2: Contact Information */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
            <Phone className="w-5 h-5 text-crimson-600" />
            <h3 className="text-base font-bold text-slate-900">2. Contact & Security Credentials</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number <span className="text-crimson-600">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.mobile ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.mobile && <p className="text-xs text-rose-600 mt-1">{errors.mobile}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-crimson-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="donor@example.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.email ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password <span className="text-crimson-600">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.password ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password <span className="text-crimson-600">*</span>
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.confirm_password ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.confirm_password && <p className="text-xs text-rose-600 mt-1">{errors.confirm_password}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 3: Location Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
            <MapPin className="w-5 h-5 text-crimson-600" />
            <h3 className="text-base font-bold text-slate-900">3. Residential Location</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Street Address <span className="text-crimson-600">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House/Door No, Street Name, Area"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.address ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    errors.city ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                  }`}
                />
                {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city}</p>}
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  District <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    errors.district ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                  }`}
                />
                {errors.district && <p className="text-xs text-rose-600 mt-1">{errors.district}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-crimson-600"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pincode <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="6-digit pincode"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    errors.pincode ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                  }`}
                />
                {errors.pincode && <p className="text-xs text-rose-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Donation & Availability Status */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
            <Heart className="w-5 h-5 text-crimson-600" />
            <h3 className="text-base font-bold text-slate-900">4. Donation History & Availability</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Last Donation Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last Blood Donation Date (Leave empty if first time)
              </label>
              <input
                type="date"
                name="last_donation_date"
                value={formData.last_donation_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-crimson-600"
              />
            </div>

            {/* Availability Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Availability Status <span className="text-crimson-600">*</span>
              </label>
              <select
                name="availability_status"
                value={formData.availability_status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-crimson-600 bg-white"
              >
                <option value="Available">Available (Ready to donate when needed)</option>
                <option value="Not Available">Not Available (Temporarily unable to donate)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                You can change this availability status anytime directly from your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 5: Emergency Contact */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
            <ShieldCheck className="w-5 h-5 text-crimson-600" />
            <h3 className="text-base font-bold text-slate-900">5. Emergency Contact (Family / Relative)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Emergency Contact Name <span className="text-crimson-600">*</span>
              </label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="Parent / Spouse / Relative name"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.emergency_contact_name ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.emergency_contact_name && <p className="text-xs text-rose-600 mt-1">{errors.emergency_contact_name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Emergency Contact Phone <span className="text-crimson-600">*</span>
              </label>
              <input
                type="tel"
                name="emergency_contact_number"
                value={formData.emergency_contact_number}
                onChange={handleChange}
                placeholder="10-digit emergency contact phone"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  errors.emergency_contact_number ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-crimson-600'
                }`}
              />
              {errors.emergency_contact_number && <p className="text-xs text-rose-600 mt-1">{errors.emergency_contact_number}</p>}
            </div>
          </div>
        </div>

        {/* Healthcare Agreement Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-800 mb-1">Donor Undertaking & Declaration:</p>
          <p>
            By clicking "Register as Donor", I confirm that the information provided is accurate and true to my knowledge. I understand that BloodConnect connects voluntary donors with patients, and my registration will undergo administrative review. Final physical eligibility will be evaluated at the blood bank prior to collection.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-700 disabled:bg-crimson-400 text-white font-bold text-base shadow-md hover:shadow-lg hover:shadow-crimson-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting Registration...</span>
              </>
            ) : (
              <>
                <Droplet className="w-5 h-5 fill-white" />
                <span>Submit Donor Registration</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Already registered as a donor?{' '}
            <Link to="/login" className="font-semibold text-crimson-600 hover:underline">
              Log in to your dashboard
            </Link>
          </p>
        </div>
      </form>

      {/* Success Confirmation Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                Status: PENDING REVIEW
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-3">Registration Submitted!</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Thank you, <strong>{formData.full_name}</strong>! Your blood donor profile has been recorded with blood group <strong>{formData.blood_group}</strong>.
              </p>
              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-600 text-left space-y-1 border border-slate-200">
                <p>• Initial Registration Status: <span className="font-semibold text-amber-600">PENDING</span></p>
                <p>• Administrator Verification: Under review</p>
                <p>• You can log in and update your availability anytime.</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold text-sm shadow-md transition-colors"
            >
              Go to Donor Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
