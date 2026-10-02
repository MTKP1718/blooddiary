const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { VALID_BLOOD_GROUPS, validateEmail } = require('../utils/validators');

// 1. GET /api/admin/dashboard
async function getDashboardStats(req, res, next) {
  try {
    const [allDonors] = await db.query('SELECT * FROM donors');
    const [allDonations] = await db.query('SELECT * FROM donation_records');

    const totalDonors = allDonors.length;
    const availableDonors = allDonors.filter(d => d.availability_status === 'Available').length;
    const unavailableDonors = allDonors.filter(d => d.availability_status === 'Not Available').length;
    const pendingRegistrations = allDonors.filter(d => d.registration_status === 'PENDING').length;
    const approvedDonors = allDonors.filter(d => d.registration_status === 'APPROVED').length;

    // Donations this month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const donationsThisMonth = allDonations.filter(d => {
      const dt = new Date(d.donation_date);
      return dt.getFullYear() === currentYear && dt.getMonth() === currentMonth;
    }).length;

    // Chart 1: Donors by Blood Group
    const bloodGroupCounts = {};
    VALID_BLOOD_GROUPS.forEach(bg => { bloodGroupCounts[bg] = 0; });
    allDonors.forEach(d => {
      if (bloodGroupCounts[d.blood_group] !== undefined) {
        bloodGroupCounts[d.blood_group]++;
      }
    });
    const donorsByBloodGroup = VALID_BLOOD_GROUPS.map(bg => ({
      blood_group: bg,
      count: bloodGroupCounts[bg]
    }));

    // Chart 2: Donors by City (Top 7)
    const cityCounts = {};
    allDonors.forEach(d => {
      const c = d.city ? d.city.trim() : 'Other';
      cityCounts[c] = (cityCounts[c] || 0) + 1;
    });
    const donorsByCity = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Chart 3: Monthly Registrations (Last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRegistrationsMap = {};
    // initialize recent 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRegistrationsMap[key] = 0;
    }
    allDonors.forEach(donor => {
      const dt = new Date(donor.created_at || Date.now());
      const key = `${months[dt.getMonth()]} ${dt.getFullYear()}`;
      if (monthlyRegistrationsMap[key] !== undefined) {
        monthlyRegistrationsMap[key]++;
      }
    });
    const monthlyRegistrations = Object.entries(monthlyRegistrationsMap).map(([month, count]) => ({
      month,
      count
    }));

    // Chart 4: Monthly Donations (Last 6 months)
    const monthlyDonationsMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyDonationsMap[key] = 0;
    }
    allDonations.forEach(donation => {
      const dt = new Date(donation.donation_date);
      const key = `${months[dt.getMonth()]} ${dt.getFullYear()}`;
      if (monthlyDonationsMap[key] !== undefined) {
        monthlyDonationsMap[key]++;
      }
    });
    const monthlyDonations = Object.entries(monthlyDonationsMap).map(([month, count]) => ({
      month,
      count
    }));

    // Chart 5: Available vs Unavailable
    const availabilityRatio = [
      { name: 'Available', value: availableDonors, color: '#16a34a' },
      { name: 'Not Available', value: unavailableDonors, color: '#dc2626' }
    ];

    return res.json({
      success: true,
      stats: {
        totalDonors,
        availableDonors,
        unavailableDonors,
        pendingRegistrations,
        approvedDonors,
        donationsThisMonth
      },
      charts: {
        donorsByBloodGroup,
        donorsByCity,
        monthlyRegistrations,
        monthlyDonations,
        availabilityRatio
      }
    });
  } catch (error) {
    next(error);
  }
}

// 2. GET /api/admin/donors (List with search, filters, pagination)
async function getDonors(req, res, next) {
  try {
    const {
      search = '',
      blood_group = '',
      city = '',
      district = '',
      availability_status = '',
      registration_status = '',
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const [allDonors] = await db.query('SELECT * FROM donors');

    // Filter in-memory for consistency across both MySQL and Fallback engines
    let filtered = allDonors.map(({ password_hash, ...d }) => d);

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(d =>
        (d.full_name && d.full_name.toLowerCase().includes(s)) ||
        (d.email && d.email.toLowerCase().includes(s)) ||
        (d.mobile && d.mobile.includes(s)) ||
        (d.city && d.city.toLowerCase().includes(s)) ||
        (d.district && d.district.toLowerCase().includes(s)) ||
        (d.blood_group && d.blood_group.toLowerCase().includes(s))
      );
    }

    if (blood_group && blood_group.trim()) {
      filtered = filtered.filter(d => d.blood_group === blood_group.trim());
    }

    if (city && city.trim()) {
      filtered = filtered.filter(d => d.city && d.city.toLowerCase() === city.trim().toLowerCase());
    }

    if (district && district.trim()) {
      filtered = filtered.filter(d => d.district && d.district.toLowerCase() === district.trim().toLowerCase());
    }

    if (availability_status && availability_status.trim()) {
      filtered = filtered.filter(d => d.availability_status === availability_status.trim());
    }

    if (registration_status && registration_status.trim()) {
      filtered = filtered.filter(d => d.registration_status === registration_status.trim());
    }

    // Sort
    filtered.sort((a, b) => {
      let valA = a[sort_by] ?? '';
      let valB = b[sort_by] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sort_order.toUpperCase() === 'ASC' ? -1 : 1;
      if (valA > valB) return sort_order.toUpperCase() === 'ASC' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (pageNum - 1) * pageSize;
    const donors = filtered.slice(startIndex, startIndex + pageSize);

    // Extract unique cities for filter dropdowns
    const availableCities = Array.from(new Set(allDonors.map(d => d.city).filter(Boolean))).sort();

    return res.json({
      success: true,
      donors,
      availableCities,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

// 3. GET /api/admin/donors/:id (Donor details)
async function getDonorById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [rows] = await db.query('SELECT * FROM donors WHERE id = ?', [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    const { password_hash, ...donor } = rows[0];

    // Fetch donor's donations
    const [donations] = await db.query(
      'SELECT * FROM donation_records WHERE donor_id = ? ORDER BY donation_date DESC',
      [id]
    );

    return res.json({
      success: true,
      donor,
      donations: donations || []
    });
  } catch (error) {
    next(error);
  }
}

// 4. PUT /api/admin/donors/:id (Update donor)
async function updateDonor(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.query('SELECT * FROM donors WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    const cur = existing[0];
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
      last_donation_date,
      availability_status,
      registration_status
    } = req.body;

    await db.query(
      `UPDATE donors SET
        full_name = ?, date_of_birth = ?, gender = ?, blood_group = ?, mobile = ?,
        address = ?, city = ?, district = ?, state = ?, pincode = ?,
        emergency_contact_name = ?, emergency_contact_number = ?, last_donation_date = ?,
        availability_status = ?, registration_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        full_name || cur.full_name,
        date_of_birth || cur.date_of_birth,
        gender || cur.gender,
        blood_group || cur.blood_group,
        mobile || cur.mobile,
        address || cur.address,
        city || cur.city,
        district || cur.district,
        state || cur.state,
        pincode || cur.pincode,
        emergency_contact_name || cur.emergency_contact_name,
        emergency_contact_number || cur.emergency_contact_number,
        last_donation_date !== undefined ? last_donation_date : cur.last_donation_date,
        availability_status || cur.availability_status,
        registration_status || cur.registration_status,
        id
      ]
    );

    const [updated] = await db.query('SELECT * FROM donors WHERE id = ?', [id]);
    const { password_hash, ...safe } = updated[0];

    return res.json({
      success: true,
      message: 'Donor information updated successfully.',
      donor: safe
    });
  } catch (error) {
    next(error);
  }
}

// 5. DELETE /api/admin/donors/:id
async function deleteDonor(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [result] = await db.query('DELETE FROM donors WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found or already deleted.' });
    }

    return res.json({
      success: true,
      message: 'Donor and associated records deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// 6. PUT /api/admin/donors/:id/approve
async function approveDonor(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [result] = await db.query('UPDATE donors SET registration_status = ? WHERE id = ?', ['APPROVED', id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    return res.json({
      success: true,
      message: 'Donor registration approved successfully.',
      registration_status: 'APPROVED'
    });
  } catch (error) {
    next(error);
  }
}

// 7. PUT /api/admin/donors/:id/reject
async function rejectDonor(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [result] = await db.query('UPDATE donors SET registration_status = ? WHERE id = ?', ['REJECTED', id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    return res.json({
      success: true,
      message: 'Donor registration rejected.',
      registration_status: 'REJECTED'
    });
  } catch (error) {
    next(error);
  }
}

// 8. PUT /api/admin/donors/:id/availability
async function updateDonorAvailability(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { availability_status } = req.body;

    if (!['Available', 'Not Available'].includes(availability_status)) {
      return res.status(400).json({ success: false, message: 'Invalid availability status.' });
    }

    const [result] = await db.query('UPDATE donors SET availability_status = ? WHERE id = ?', [availability_status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    return res.json({
      success: true,
      message: `Donor availability updated to ${availability_status}.`,
      availability_status
    });
  } catch (error) {
    next(error);
  }
}

// 9. GET /api/admin/registrations
async function getRegistrationRequests(req, res, next) {
  try {
    const { status } = req.query;
    const [allDonors] = await db.query('SELECT * FROM donors');

    let requests = allDonors.map(({ password_hash, ...d }) => d);
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      requests = requests.filter(d => d.registration_status === status.toUpperCase());
    }

    // Sort pending first, then newest
    requests.sort((a, b) => {
      if (a.registration_status === 'PENDING' && b.registration_status !== 'PENDING') return -1;
      if (a.registration_status !== 'PENDING' && b.registration_status === 'PENDING') return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return res.json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
}

// 10. GET /api/admin/donations (Donations list)
async function getDonations(req, res, next) {
  try {
    const [rows] = await db.query('SELECT d.*, dn.full_name as donor_name, dn.mobile as donor_mobile, dn.email as donor_email FROM donation_records d LEFT JOIN donors dn ON d.donor_id = dn.id ORDER BY d.donation_date DESC');
    return res.json({
      success: true,
      donations: rows
    });
  } catch (error) {
    next(error);
  }
}

// 11. POST /api/admin/donations (Add donation record)
async function addDonation(req, res, next) {
  try {
    const { donor_id, donation_date, blood_group, location, notes } = req.body;

    if (!donor_id || !donation_date || !blood_group || !location) {
      return res.status(400).json({
        success: false,
        message: 'donor_id, donation_date, blood_group, and location are required.'
      });
    }

    const [donorRows] = await db.query('SELECT id, full_name FROM donors WHERE id = ?', [donor_id]);
    if (!donorRows || donorRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected donor does not exist.' });
    }

    const [result] = await db.query(
      'INSERT INTO donation_records (donor_id, donation_date, blood_group, location, notes) VALUES (?, ?, ?, ?, ?)',
      [donor_id, donation_date, blood_group, location.trim(), notes ? notes.trim() : '']
    );

    // Update donor's last_donation_date if this donation is newer or equal
    await db.query('UPDATE donors SET last_donation_date = ? WHERE id = ?', [donation_date, donor_id]);

    return res.status(201).json({
      success: true,
      message: 'Donation record added successfully.',
      donation_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

// 12. PUT /api/admin/donations/:id
async function updateDonation(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { donation_date, blood_group, location, notes } = req.body;

    const [result] = await db.query(
      'UPDATE donation_records SET donation_date = ?, blood_group = ?, location = ?, notes = ? WHERE id = ?',
      [donation_date, blood_group, location, notes, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    return res.json({
      success: true,
      message: 'Donation record updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// 13. DELETE /api/admin/donations/:id
async function deleteDonation(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [result] = await db.query('DELETE FROM donation_records WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    return res.json({
      success: true,
      message: 'Donation record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// 14. GET /api/admin/reports (Summary and export data)
async function getReports(req, res, next) {
  try {
    const [allDonors] = await db.query('SELECT * FROM donors');
    const [allDonations] = await db.query('SELECT d.*, dn.full_name as donor_name FROM donation_records d LEFT JOIN donors dn ON d.donor_id = dn.id');

    // Summary calculations
    const totalDonors = allDonors.length;
    const availableDonors = allDonors.filter(d => d.availability_status === 'Available').length;
    const pendingCount = allDonors.filter(d => d.registration_status === 'PENDING').length;
    const approvedCount = allDonors.filter(d => d.registration_status === 'APPROVED').length;
    const totalDonations = allDonations.length;

    // Blood group breakdown
    const bloodGroupStats = {};
    VALID_BLOOD_GROUPS.forEach(bg => { bloodGroupStats[bg] = { total: 0, available: 0 }; });
    allDonors.forEach(d => {
      if (bloodGroupStats[d.blood_group]) {
        bloodGroupStats[d.blood_group].total++;
        if (d.availability_status === 'Available') {
          bloodGroupStats[d.blood_group].available++;
        }
      }
    });

    // City distribution
    const cityMap = {};
    allDonors.forEach(d => {
      const c = d.city || 'Other';
      cityMap[c] = (cityMap[c] || 0) + 1;
    });

    return res.json({
      success: true,
      summary: {
        totalDonors,
        availableDonors,
        unavailableDonors: totalDonors - availableDonors,
        pendingCount,
        approvedCount,
        totalDonations
      },
      bloodGroupStats,
      cityDistribution: cityMap,
      exportData: {
        donors: allDonors.map(({ password_hash, ...d }) => d),
        donations: allDonations
      }
    });
  } catch (error) {
    next(error);
  }
}

// 15. Administrators management (SUPER_ADMIN only)
async function getAdministrators(req, res, next) {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, status, created_at, updated_at FROM admins ORDER BY id ASC');
    return res.json({
      success: true,
      admins: rows
    });
  } catch (error) {
    next(error);
  }
}

async function addAdministrator(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
    }

    const [existing] = await db.query('SELECT id FROM admins WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An admin with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const adminRole = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';

    const [result] = await db.query(
      'INSERT INTO admins (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), password_hash, adminRole, 'ACTIVE']
    );

    return res.status(201).json({
      success: true,
      message: 'Administrator created successfully.',
      admin: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: adminRole,
        status: 'ACTIVE'
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdministrator(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, role, status } = req.body;

    // Prevent self-demotion / deactivation of the primary super admin id 1
    if (id === 1 && (status === 'INACTIVE' || role !== 'SUPER_ADMIN')) {
      return res.status(400).json({ success: false, message: 'The primary system Super Administrator cannot be demoted or deactivated.' });
    }

    const [result] = await db.query(
      'UPDATE admins SET name = ?, role = ?, status = ? WHERE id = ?',
      [name, role, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Administrator not found.' });
    }

    return res.json({
      success: true,
      message: 'Administrator updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdministrator(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (id === 1) {
      return res.status(400).json({ success: false, message: 'The primary system Super Administrator cannot be deleted.' });
    }

    const [result] = await db.query('DELETE FROM admins WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Administrator not found.' });
    }

    return res.json({
      success: true,
      message: 'Administrator removed successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
  approveDonor,
  rejectDonor,
  updateDonorAvailability,
  getRegistrationRequests,
  getDonations,
  addDonation,
  updateDonation,
  deleteDonation,
  getReports,
  getAdministrators,
  addAdministrator,
  updateAdministrator,
  deleteAdministrator
};
