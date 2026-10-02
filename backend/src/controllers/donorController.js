const db = require('../config/db');
const { registerDonor } = require('./authController');

// 1. Create donor (alias for registration)
async function createDonor(req, res, next) {
  return registerDonor(req, res, next);
}

// 2. GET /api/donors/me (Donor gets their own profile)
async function getMyProfile(req, res, next) {
  try {
    const donorId = req.user.id;
    const [rows] = await db.query('SELECT * FROM donors WHERE id = ?', [donorId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found.'
      });
    }

    const { password_hash, ...donor } = rows[0];
    return res.json({
      success: true,
      donor
    });
  } catch (error) {
    next(error);
  }
}

// 3. PUT /api/donors/me (Donor updates their own profile)
async function updateMyProfile(req, res, next) {
  try {
    const donorId = req.user.id;
    const {
      full_name,
      date_of_birth,
      gender,
      blood_group,
      mobile,
      address,
      city,
      district,
      state,
      pincode,
      emergency_contact_name,
      emergency_contact_number,
      last_donation_date
    } = req.body;

    // Check if donor exists
    const [existing] = await db.query('SELECT * FROM donors WHERE id = ?', [donorId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found.'
      });
    }

    const current = existing[0];

    // If mobile is being changed, check if mobile is already used by someone else
    if (mobile && mobile !== current.mobile) {
      const [mobCheck] = await db.query('SELECT id FROM donors WHERE mobile = ? AND id != ?', [mobile, donorId]);
      if (mobCheck && mobCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'The new mobile number is already in use by another donor.'
        });
      }
    }

    const updatedData = {
      full_name: full_name ? full_name.trim() : current.full_name,
      date_of_birth: date_of_birth || current.date_of_birth,
      gender: gender || current.gender,
      blood_group: blood_group || current.blood_group,
      mobile: mobile ? mobile.trim() : current.mobile,
      address: address ? address.trim() : current.address,
      city: city ? city.trim() : current.city,
      district: district ? district.trim() : current.district,
      state: state ? state.trim() : current.state,
      pincode: pincode ? pincode.trim() : current.pincode,
      emergency_contact_name: emergency_contact_name ? emergency_contact_name.trim() : current.emergency_contact_name,
      emergency_contact_number: emergency_contact_number ? emergency_contact_number.trim() : current.emergency_contact_number,
      last_donation_date: last_donation_date !== undefined ? last_donation_date : current.last_donation_date
    };

    await db.query(
      `UPDATE donors SET
        full_name = ?, date_of_birth = ?, gender = ?, blood_group = ?, mobile = ?,
        address = ?, city = ?, district = ?, state = ?, pincode = ?,
        emergency_contact_name = ?, emergency_contact_number = ?, last_donation_date = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        updatedData.full_name,
        updatedData.date_of_birth,
        updatedData.gender,
        updatedData.blood_group,
        updatedData.mobile,
        updatedData.address,
        updatedData.city,
        updatedData.district,
        updatedData.state,
        updatedData.pincode,
        updatedData.emergency_contact_name,
        updatedData.emergency_contact_number,
        updatedData.last_donation_date,
        donorId
      ]
    );

    const [updatedRows] = await db.query('SELECT * FROM donors WHERE id = ?', [donorId]);
    const { password_hash, ...safeUpdated } = updatedRows[0];

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      donor: safeUpdated
    });
  } catch (error) {
    next(error);
  }
}

// 4. PUT /api/donors/me/availability (Donor updates availability status)
async function updateMyAvailability(req, res, next) {
  try {
    const donorId = req.user.id;
    const { availability_status } = req.body;

    if (!['Available', 'Not Available'].includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status. Must be "Available" or "Not Available".'
      });
    }

    await db.query('UPDATE donors SET availability_status = ? WHERE id = ?', [availability_status, donorId]);

    return res.json({
      success: true,
      message: `Availability status successfully updated to ${availability_status}.`,
      availability_status
    });
  } catch (error) {
    next(error);
  }
}

// 5. GET /api/donors/me/donations (Donor donation history)
async function getMyDonations(req, res, next) {
  try {
    const donorId = req.user.id;
    const [rows] = await db.query(
      'SELECT id, donor_id, donation_date, blood_group, location, notes, created_at FROM donation_records WHERE donor_id = ? ORDER BY donation_date DESC',
      [donorId]
    );

    return res.json({
      success: true,
      donations: rows || []
    });
  } catch (error) {
    next(error);
  }
}

// 6. GET /api/donors/me/status (Donor status overview)
async function getMyStatus(req, res, next) {
  try {
    const donorId = req.user.id;
    const [rows] = await db.query(
      'SELECT id, full_name, blood_group, availability_status, registration_status, last_donation_date FROM donors WHERE id = ?',
      [donorId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    return res.json({
      success: true,
      status: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDonor,
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  getMyDonations,
  getMyStatus
};
