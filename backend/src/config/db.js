const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const { initialAdmins, initialDonors, initialDonations } = require('../utils/seedData');

let pool = null;
let dbMode = 'mysql'; // 'mysql' or 'fallback'
let fallbackData = null;
const fallbackFilePath = path.join(__dirname, '..', 'data', 'db_store.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadFallbackData() {
  if (fs.existsSync(fallbackFilePath)) {
    try {
      const raw = fs.readFileSync(fallbackFilePath, 'utf8');
      fallbackData = JSON.parse(raw);
      return;
    } catch (e) {
      console.warn('Could not parse existing db_store.json, reinitializing.');
    }
  }

  // Clone seed data
  fallbackData = {
    admins: JSON.parse(JSON.stringify(initialAdmins)),
    donors: JSON.parse(JSON.stringify(initialDonors)),
    donation_records: JSON.parse(JSON.stringify(initialDonations)),
    nextAdminId: initialAdmins.length + 1,
    nextDonorId: initialDonors.length + 1,
    nextDonationId: initialDonations.length + 1
  };
  saveFallbackData();
}

function saveFallbackData() {
  if (fallbackData) {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(fallbackData, null, 2), 'utf8');
  }
}

async function initDb() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'bloodconnect_db';

  console.log(`[Database] Attempting MySQL connection to ${user}@${host}:${port}...`);

  try {
    // 1. Test server connection & create database if not exists
    const rootConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 4000
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Create pool for database
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    // 3. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
        status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_admin_email (email),
        INDEX idx_admin_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS donors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        mobile VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        emergency_contact_name VARCHAR(150) NOT NULL,
        emergency_contact_number VARCHAR(20) NOT NULL,
        last_donation_date DATE NULL,
        availability_status ENUM('Available', 'Not Available') NOT NULL DEFAULT 'Available',
        registration_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_blood_group (blood_group),
        INDEX idx_city (city),
        INDEX idx_district (district),
        INDEX idx_availability (availability_status),
        INDEX idx_registration (registration_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS donation_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donor_id INT NOT NULL,
        donation_date DATE NOT NULL,
        blood_group VARCHAR(10) NOT NULL,
        location VARCHAR(200) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
        INDEX idx_donor_id (donor_id),
        INDEX idx_donation_date (donation_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Seed if empty
    const [adminRows] = await pool.query('SELECT COUNT(*) as count FROM admins');
    if (adminRows[0].count === 0) {
      console.log('[Database] MySQL tables empty. Seeding initial demo data...');
      for (const a of initialAdmins) {
        await pool.query(
          'INSERT INTO admins (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
          [a.id, a.name, a.email, a.password_hash, a.role, a.status]
        );
      }
      for (const d of initialDonors) {
        await pool.query(
          `INSERT INTO donors (id, full_name, date_of_birth, gender, blood_group, mobile, email, password_hash, address, city, district, state, pincode, emergency_contact_name, emergency_contact_number, last_donation_date, availability_status, registration_status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [d.id, d.full_name, d.date_of_birth, d.gender, d.blood_group, d.mobile, d.email, d.password_hash, d.address, d.city, d.district, d.state, d.pincode, d.emergency_contact_name, d.emergency_contact_number, d.last_donation_date, d.availability_status, d.registration_status, d.created_at]
        );
      }
      for (const r of initialDonations) {
        await pool.query(
          'INSERT INTO donation_records (id, donor_id, donation_date, blood_group, location, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [r.id, r.donor_id, r.donation_date, r.blood_group, r.location, r.notes, r.created_at]
        );
      }
      console.log('[Database] Seeded 2 admins, 16 donors, and 12 donation records to MySQL successfully.');
    }

    dbMode = 'mysql';
    console.log(`[Database] MySQL Connected successfully to \`${database}\` on port ${port}!`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MySQL: ${error.message}`);
    console.warn('[Database Notice] If using a custom MySQL password, set DB_PASSWORD in backend/.env.');
    console.log('[Database Mode] Activating high-reliability local persistence driver (JSON store) so the system runs smoothly without blocking.');
    dbMode = 'fallback';
    loadFallbackData();
  }
}

async function query(sql, params = []) {
  if (dbMode === 'mysql' && pool) {
    return pool.query(sql, params);
  }
  return executeFallback(sql, params);
}

// Fallback execution engine for SQL queries
function executeFallback(sql, params = []) {
  if (!fallbackData) loadFallbackData();
  const trimmed = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT COUNT
  if (/^SELECT COUNT\(\*\) as count FROM donors/i.test(trimmed)) {
    let list = fallbackData.donors;
    return [[{ count: list.length }], []];
  }

  // 2. ADMIN AUTH queries
  if (/^SELECT \* FROM admins WHERE email = \?/i.test(trimmed)) {
    const email = params[0]?.toLowerCase();
    const admin = fallbackData.admins.find(a => a.email.toLowerCase() === email);
    return [admin ? [admin] : [], []];
  }
  if (/^SELECT \* FROM admins WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[0]);
    const admin = fallbackData.admins.find(a => a.id === id);
    return [admin ? [admin] : [], []];
  }
  if (/^SELECT id, name, email, role, status, created_at, updated_at FROM admins/i.test(trimmed)) {
    return [fallbackData.admins.map(({ password_hash, ...rest }) => rest), []];
  }
  if (/^INSERT INTO admins/i.test(trimmed)) {
    const newAdmin = {
      id: fallbackData.nextAdminId++,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'ADMIN',
      status: params[4] || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    fallbackData.admins.push(newAdmin);
    saveFallbackData();
    return [{ insertId: newAdmin.id, affectedRows: 1 }, []];
  }
  if (/^UPDATE admins SET (.+) WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[params.length - 1]);
    const admin = fallbackData.admins.find(a => a.id === id);
    if (admin) {
      if (params.length === 4) { // name, role, status, id
        admin.name = params[0];
        admin.role = params[1];
        admin.status = params[2];
      } else if (params.length === 2) {
        admin.status = params[0];
      }
      admin.updated_at = new Date().toISOString();
      saveFallbackData();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }
  if (/^DELETE FROM admins WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[0]);
    const idx = fallbackData.admins.findIndex(a => a.id === id);
    if (idx !== -1) {
      fallbackData.admins.splice(idx, 1);
      saveFallbackData();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 3. DONOR AUTH & LOOKUPS
  if (/^SELECT \* FROM donors WHERE email = \?/i.test(trimmed)) {
    const email = params[0]?.toLowerCase();
    const donor = fallbackData.donors.find(d => d.email.toLowerCase() === email);
    return [donor ? [donor] : [], []];
  }
  if (/^SELECT \* FROM donors WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[0]);
    const donor = fallbackData.donors.find(d => d.id === id);
    return [donor ? [donor] : [], []];
  }
  if (/^SELECT id, full_name, email, mobile, blood_group, availability_status, registration_status, last_donation_date FROM donors WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[0]);
    const donor = fallbackData.donors.find(d => d.id === id);
    if (donor) {
      const { password_hash, ...rest } = donor;
      return [[rest], []];
    }
    return [[], []];
  }
  if (/^SELECT (?:id|id,\s*email,\s*mobile|\*) FROM donors WHERE (?:email = \? OR mobile = \?|mobile = \? OR email = \?)/i.test(trimmed)) {
    const v1 = params[0]?.toLowerCase();
    const v2 = params[1];
    const exists = fallbackData.donors.find(d => 
      d.email?.toLowerCase() === v1 || d.mobile === v2 || d.email?.toLowerCase() === v2 || d.mobile === v1
    );
    return [exists ? [{ id: exists.id, email: exists.email, mobile: exists.mobile }] : [], []];
  }

  // 4. INSERT DONOR
  if (/^INSERT INTO donors/i.test(trimmed)) {
    const newDonor = {
      id: fallbackData.nextDonorId++,
      full_name: params[0],
      date_of_birth: params[1],
      gender: params[2],
      blood_group: params[3],
      mobile: params[4],
      email: params[5],
      password_hash: params[6],
      address: params[7],
      city: params[8],
      district: params[9],
      state: params[10],
      pincode: params[11],
      emergency_contact_name: params[12],
      emergency_contact_number: params[13],
      last_donation_date: params[14] || null,
      availability_status: params[15] || 'Available',
      registration_status: params[16] || 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    fallbackData.donors.unshift(newDonor);
    saveFallbackData();
    return [{ insertId: newDonor.id, affectedRows: 1 }, []];
  }

  // 5. UPDATE DONOR AVAILABILITY
  if (/^UPDATE donors SET availability_status = \? WHERE id = \?/i.test(trimmed)) {
    const status = params[0];
    const id = Number(params[1]);
    const donor = fallbackData.donors.find(d => d.id === id);
    if (donor) {
      donor.availability_status = status;
      donor.updated_at = new Date().toISOString();
      saveFallbackData();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 6. UPDATE DONOR REGISTRATION STATUS
  if (/^UPDATE donors SET registration_status = ('APPROVED'|'REJECTED'|\?) WHERE id = \?/i.test(trimmed)) {
    const match = trimmed.match(/registration_status = ('APPROVED'|'REJECTED'|\?)/i);
    let status = match && match[1] !== '?' ? match[1].replace(/'/g, '') : params[0];
    const id = Number(params[params.length - 1]);
    const donor = fallbackData.donors.find(d => d.id === id);
    if (donor) {
      donor.registration_status = status;
      donor.updated_at = new Date().toISOString();
      saveFallbackData();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 7. UPDATE DONOR PROFILE (BY DONOR OR ADMIN)
  if (/^UPDATE donors SET (.+) WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[params.length - 1]);
    const donor = fallbackData.donors.find(d => d.id === id);
    if (donor) {
      // Map params
      if (params.length >= 13) {
        donor.full_name = params[0] || donor.full_name;
        donor.date_of_birth = params[1] || donor.date_of_birth;
        donor.gender = params[2] || donor.gender;
        donor.blood_group = params[3] || donor.blood_group;
        donor.mobile = params[4] || donor.mobile;
        donor.address = params[5] || donor.address;
        donor.city = params[6] || donor.city;
        donor.district = params[7] || donor.district;
        donor.state = params[8] || donor.state;
        donor.pincode = params[9] || donor.pincode;
        donor.emergency_contact_name = params[10] || donor.emergency_contact_name;
        donor.emergency_contact_number = params[11] || donor.emergency_contact_number;
        donor.last_donation_date = params[12] || donor.last_donation_date;
        if (params.length >= 15) {
          donor.availability_status = params[13] || donor.availability_status;
          donor.registration_status = params[14] || donor.registration_status;
        }
      }
      donor.updated_at = new Date().toISOString();
      saveFallbackData();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 8. DELETE DONOR
  if (/^DELETE FROM donors WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[0]);
    const idx = fallbackData.donors.findIndex(d => d.id === id);
    if (idx !== -1) {
      fallbackData.donors.splice(idx, 1);
      // cascade donations
      fallbackData.donation_records = fallbackData.donation_records.filter(r => r.donor_id !== id);
      saveFallbackData();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 9. DONATION RECORDS
  if (/^SELECT \* FROM donation_records WHERE donor_id = \?/i.test(trimmed)) {
    const donorId = Number(params[0]);
    const records = fallbackData.donation_records
      .filter(r => r.donor_id === donorId)
      .sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date));
    return [records, []];
  }
  if (/^SELECT d\.\*, dn\.full_name as donor_name/i.test(trimmed) || /^SELECT (.+) FROM donation_records/i.test(trimmed)) {
    const list = fallbackData.donation_records.map(r => {
      const donor = fallbackData.donors.find(d => d.id === r.donor_id);
      return {
        ...r,
        donor_name: donor ? donor.full_name : 'Unknown Donor',
        donor_mobile: donor ? donor.mobile : '',
        donor_email: donor ? donor.email : ''
      };
    }).sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date));
    return [list, []];
  }
  if (/^INSERT INTO donation_records/i.test(trimmed)) {
    const newRecord = {
      id: fallbackData.nextDonationId++,
      donor_id: Number(params[0]),
      donation_date: params[1],
      blood_group: params[2],
      location: params[3],
      notes: params[4] || '',
      created_at: new Date().toISOString()
    };
    fallbackData.donation_records.unshift(newRecord);
    // update donor last_donation_date
    const donor = fallbackData.donors.find(d => d.id === newRecord.donor_id);
    if (donor) {
      donor.last_donation_date = newRecord.donation_date;
    }
    saveFallbackData();
    return [{ insertId: newRecord.id, affectedRows: 1 }, []];
  }
  if (/^UPDATE donation_records SET (.+) WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[params.length - 1]);
    const rec = fallbackData.donation_records.find(r => r.id === id);
    if (rec) {
      rec.donation_date = params[0];
      rec.blood_group = params[1];
      rec.location = params[2];
      rec.notes = params[3];
      saveFallbackData();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }
  if (/^DELETE FROM donation_records WHERE id = \?/i.test(trimmed)) {
    const id = Number(params[0]);
    const idx = fallbackData.donation_records.findIndex(r => r.id === id);
    if (idx !== -1) {
      fallbackData.donation_records.splice(idx, 1);
      saveFallbackData();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 10. GENERIC SELECT FOR DONORS (Filters, search, reports)
  if (/FROM donors/i.test(trimmed)) {
    let list = fallbackData.donors.map(({ password_hash, ...rest }) => rest);
    return [list, []];
  }

  return [[], []];
}

module.exports = {
  initDb,
  query,
  getDbMode: () => dbMode
};
