const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { signToken } = require('../utils/jwt');
const { validateDonorRegistration, validateEmail } = require('../utils/validators');

// 1. Donor Registration (POST /api/auth/register)
async function registerDonor(req, res, next) {
  try {
    const { isValid, errors } = validateDonorRegistration(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors
      });
    }

    const {
      full_name,
      date_of_birth,
      gender,
      blood_group,
      mobile,
      email,
      password,
      address,
      city,
      district,
      state,
      pincode,
      emergency_contact_name,
      emergency_contact_number,
      last_donation_date,
      availability_status
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    // Check unique email or mobile
    const [existing] = await db.query(
      'SELECT id, email, mobile FROM donors WHERE email = ? OR mobile = ?',
      [normalizedEmail, normalizedMobile]
    );

    if (existing && existing.length > 0) {
      if (existing[0].email?.toLowerCase() === normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: 'A donor with this email address is already registered.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'A donor with this mobile number is already registered.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const initialAvailability = availability_status || 'Available';
    const initialRegStatus = 'PENDING';

    const [result] = await db.query(
      `INSERT INTO donors (
        full_name, date_of_birth, gender, blood_group, mobile, email,
        password_hash, address, city, district, state, pincode,
        emergency_contact_name, emergency_contact_number,
        last_donation_date, availability_status, registration_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name.trim(),
        date_of_birth,
        gender,
        blood_group,
        normalizedMobile,
        normalizedEmail,
        password_hash,
        address.trim(),
        city.trim(),
        district.trim(),
        state.trim(),
        pincode.trim(),
        emergency_contact_name.trim(),
        emergency_contact_number.trim(),
        last_donation_date || null,
        initialAvailability,
        initialRegStatus
      ]
    );

    const newId = result.insertId;

    const token = signToken({
      id: newId,
      email: normalizedEmail,
      full_name: full_name.trim(),
      role: 'DONOR',
      type: 'donor'
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your application has been submitted with status PENDING for administrative verification.',
      token,
      donor: {
        id: newId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        mobile: normalizedMobile,
        blood_group,
        city: city.trim(),
        availability_status: initialAvailability,
        registration_status: initialRegStatus,
        last_donation_date: last_donation_date || null
      }
    });
  } catch (error) {
    next(error);
  }
}

// 2. Donor Login (POST /api/auth/login)
async function loginDonor(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const [rows] = await db.query('SELECT * FROM donors WHERE email = ?', [email.trim().toLowerCase()]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const donor = rows[0];
    const isMatch = await bcrypt.compare(password, donor.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken({
      id: donor.id,
      email: donor.email,
      full_name: donor.full_name,
      role: 'DONOR',
      type: 'donor'
    });

    const { password_hash, ...safeDonor } = donor;

    return res.json({
      success: true,
      message: `Welcome back, ${donor.full_name}!`,
      token,
      donor: safeDonor
    });
  } catch (error) {
    next(error);
  }
}

// 3. Admin Login (POST /api/admin/login)
async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both admin email and password.'
      });
    }

    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email.trim().toLowerCase()]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const admin = rows[0];
    if (admin.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Administrator account is deactivated. Please contact the Super Admin.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      type: 'admin'
    });

    return res.json({
      success: true,
      message: `Administrator login successful. Welcome, ${admin.name}!`,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (error) {
    next(error);
  }
}

// 4. Logout (POST /api/auth/logout)
function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}

// 5. Get Current User (GET /api/auth/me)
async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    if (req.user.type === 'donor') {
      const [rows] = await db.query('SELECT * FROM donors WHERE id = ?', [req.user.id]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Donor account not found.' });
      }
      const { password_hash, ...safeDonor } = rows[0];
      return res.json({
        success: true,
        type: 'donor',
        user: safeDonor
      });
    }

    if (req.user.type === 'admin') {
      const [rows] = await db.query('SELECT id, name, email, role, status, created_at FROM admins WHERE id = ?', [req.user.id]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Admin account not found.' });
      }
      return res.json({
        success: true,
        type: 'admin',
        user: rows[0]
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid user session type.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerDonor,
  loginDonor,
  loginAdmin,
  logout,
  getMe
};
