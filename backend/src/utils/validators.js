const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_AVAILABILITY = ['Available', 'Not Available'];
const VALID_REGISTRATION_STATUS = ['PENDING', 'APPROVED', 'REJECTED'];

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

function validateMobile(mobile) {
  if (!mobile || typeof mobile !== 'string') return false;
  const cleaned = mobile.replace(/[\s\-+()]/g, '');
  // 10 digits or standard mobile (10-12 digits)
  return /^\d{10,12}$/.test(cleaned);
}

function validatePincode(pincode) {
  if (!pincode || typeof pincode !== 'string') return false;
  const cleaned = pincode.trim();
  return /^\d{6}$/.test(cleaned);
}

function validateDOB(dob) {
  if (!dob) return false;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  // Must be in the past
  if (d >= now) return false;
  // Must be at least 18 years old for blood donation
  const ageYears = (now - d) / (365.25 * 24 * 60 * 60 * 1000);
  return ageYears >= 17; // allow near 18
}

function validateDonorRegistration(data) {
  const errors = {};

  if (!data.full_name || !data.full_name.trim()) {
    errors.full_name = 'Full name is required.';
  }

  if (!data.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required.';
  } else if (!validateDOB(data.date_of_birth)) {
    errors.date_of_birth = 'Donor must be at least 18 years of age.';
  }

  if (!data.gender || !['Male', 'Female', 'Other'].includes(data.gender)) {
    errors.gender = 'Please select a valid gender.';
  }

  if (!data.blood_group || !VALID_BLOOD_GROUPS.includes(data.blood_group)) {
    errors.blood_group = 'Please select a valid blood group (A+, A-, B+, B-, AB+, AB-, O+, O-).';
  }

  if (!data.mobile || !data.mobile.trim()) {
    errors.mobile = 'Mobile number is required.';
  } else if (!validateMobile(data.mobile)) {
    errors.mobile = 'Please enter a valid 10-digit mobile number.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  if (data.confirm_password !== undefined && data.password !== data.confirm_password) {
    errors.confirm_password = 'Passwords do not match.';
  }

  if (!data.address || !data.address.trim()) {
    errors.address = 'Address is required.';
  }

  if (!data.city || !data.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!data.district || !data.district.trim()) {
    errors.district = 'District is required.';
  }

  if (!data.state || !data.state.trim()) {
    errors.state = 'State is required.';
  }

  if (!data.pincode || !data.pincode.trim()) {
    errors.pincode = 'Pincode is required.';
  } else if (!validatePincode(data.pincode)) {
    errors.pincode = 'Please enter a valid 6-digit postal pincode.';
  }

  if (!data.emergency_contact_name || !data.emergency_contact_name.trim()) {
    errors.emergency_contact_name = 'Emergency contact name is required.';
  }

  if (!data.emergency_contact_number || !data.emergency_contact_number.trim()) {
    errors.emergency_contact_number = 'Emergency contact number is required.';
  } else if (!validateMobile(data.emergency_contact_number)) {
    errors.emergency_contact_number = 'Please enter a valid 10-digit emergency contact phone.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  VALID_BLOOD_GROUPS,
  VALID_AVAILABILITY,
  VALID_REGISTRATION_STATUS,
  validateEmail,
  validateMobile,
  validatePincode,
  validateDOB,
  validateDonorRegistration
};
