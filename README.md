# 🩸 BloodConnect: Blood Donor Registration & Management System

> A complete, modern, professional healthcare platform consisting of two dedicated React.js web modules (Donor Web & Admin Web), an Express.js REST API backend, and MySQL database integration.

---

## 1. Project Overview

**BloodConnect** is an enterprise-grade voluntary blood donor registration and management healthcare platform designed to streamline the lifecycle of blood donations across regional blood banks and hospitals.

The platform provides two dedicated web modules:
1. **Donor Web Application (`donor-web/`)**: A public-facing portal for citizens to register as voluntary donors, maintain personal health and contact details, control live availability status with a single click, and view verified donation logs.
2. **Admin Web Portal (`admin-web/`)**: A restricted, role-based administrative portal for certified hospital medical staff and blood bank coordinators to audit registrations, review pending requests, search donors for emergency needs, track blood inventory distributions, log donation records, and generate analytical reports.

---

## 2. System Architecture

```
                          ┌────────────────────────────────┐
                          │   MySQL Database (Port 3306)   │
                          │        bloodconnect_db         │
                          └───────────────▲────────────────┘
                                          │
                                          │ (mysql2 / connection pool)
                                          │
                          ┌───────────────┴────────────────┐
                          │     Node.js + Express API      │
                          │          (Port 5000)           │
                          │   JWT Auth • BCrypt • CORS     │
                          └───────┬────────────────┬───────┘
                                  │                │
             REST API Calls (Axios)│                │REST API Calls (Axios)
                                  │                │
            ┌─────────────────────┴──┐          ┌──┴─────────────────────┐
            │   DONOR WEB APP        │          │   ADMIN WEB PORTAL     │
            │   React.js + Vite      │          │   React.js + Vite      │
            │   Tailwind CSS         │          │   Tailwind + Recharts  │
            │   (Port 5173)          │          │   (Port 5174)          │
            └────────────────────────┘          └────────────────────────┘
```

> **Important**: The React frontend applications never connect directly to MySQL. All communication strictly flows through the authenticated Node.js REST API with parameterized queries and role-based access control.

---

## 3. Technologies Used

### Donor Web Application (`donor-web/`)
- **React.js 18** with functional components and React Hooks
- **Vite 5** for lightning-fast build tooling and HMR
- **React Router DOM 6** for single-page routing
- **Axios** with request/response interceptors for Bearer token authorization
- **Tailwind CSS 3** with custom healthcare crimson palette
- **Lucide React** for accessible medical icons

### Admin Web Portal (`admin-web/`)
- **React.js 18** + **Vite 5**
- **Recharts 2** for responsive data visualizations (Bar, Pie, Area charts)
- **React Router DOM 6** with protected route guards
- **Tailwind CSS 3** for card layouts, data tables, and slide-out navigation drawer
- **Lucide React** for administrative iconography

### Backend REST API (`backend/`)
- **Node.js** (v18+ / v20+ / v24+) & **Express.js 4**
- **mysql2/promise** with connection pooling
- **JSON Web Tokens (`jsonwebtoken`)** for stateless session management
- **bcryptjs** for irreversible password hashing with salt rounds
- **express-rate-limit** for brute-force prevention on authentication routes
- **cors** configured for cross-origin isolation
- **Automated Fallback Persistence**: High-reliability driver ensuring the platform runs out of the box even while configuring MySQL credentials.

### Database (`database/`)
- **MySQL 8.0+**
- Strict foreign key constraints (`ON DELETE CASCADE`)
- Strategic indexing on frequently filtered fields (`blood_group`, `city`, `availability_status`, `registration_status`)

---

## 4. Prerequisites

Before running the system, verify that you have:
1. **Node.js** (v18.0.0 or higher) and **npm** (v9+)
   ```bash
   node -v
   npm -v
   ```
2. **MySQL Server** (v8.0+ installed and running on port 3306) or MySQL Workbench/XAMPP.

---

## 5. MySQL Database Setup & Initialization

### Option A: Using MySQL Command Line
1. Log in to your MySQL terminal:
   ```bash
   mysql -u root -p
   ```
2. Execute the schema script:
   ```sql
   source database/schema.sql;
   ```
3. Seed the sample dataset (16 realistic donors, admins, donation history):
   ```sql
   source database/seed.sql;
   ```

### Option B: Automatic Backend Provisioning
The backend REST API automatically verifies the MySQL connection upon startup, runs `CREATE DATABASE IF NOT EXISTS bloodconnect_db`, provisions all required tables, and auto-seeds the initial demo data if the tables are empty!

---

## 6. Database Schema

The database consists of 3 relational tables:

### 1. `admins` Table
Stores authenticated clinical administrators and system supervisors.
```sql
CREATE TABLE admins (
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
);
```

### 2. `donors` Table
Stores donor registrations, contact information, blood groups, and status flags.
```sql
CREATE TABLE donors (
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
);
```

### 3. `donation_records` Table
Stores verified blood collection entries logged by hospital staff.
```sql
CREATE TABLE donation_records (
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
);
```

---

## 7. Backend Setup & Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=bloodconnect_db
   JWT_SECRET=bloodconnect_super_secret_jwt_signing_key_2026_dev
   CLIENT_DONOR_URL=http://localhost:5173
   CLIENT_ADMIN_URL=http://localhost:5174
   ```
4. Start the backend REST API:
   ```bash
   npm start
   ```
   Server will listen on `http://localhost:5000`. Health check endpoint: `http://localhost:5000/api/health`.

---

## 8. Donor Web Application Setup

1. Open a new terminal and navigate to `donor-web/`:
   ```bash
   cd donor-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   **`http://localhost:5173`**

---

## 9. Admin Web Application Setup

1. Open a new terminal and navigate to `admin-web/`:
   ```bash
   cd admin-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   **`http://localhost:5174`**

---

## 10. Quick One-Click Launch (Windows)

You can launch all 3 applications simultaneously with one click:
- Double click **`start-all.bat`** in `blood-donor-management/` or in the root workspace.
- Or in PowerShell:
  ```powershell
  .\start-all.ps1
  ```
This starts the backend on port 5000, donor web on port 5173, admin web on port 5174, and opens your browser automatically!

---

## 11. Development Test Credentials

> ⚠️ **Notice**: These credentials are provided exclusively for local testing, evaluation, and development. Change all credentials before deploying to a production environment.

### Administrative Accounts (Admin Web: `http://localhost:5174`)
| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@bloodconnect.org` | `Admin@12345` | Full platform control, approve/reject, reports, manage administrators |
| **Operations Admin** | `staff@bloodconnect.org` | `Admin@12345` | Donor directory, review requests, record donations, search |

### Sample Donor Accounts (Donor Web: `http://localhost:5173`)
| Donor Name | Blood Group | Email | Password | City | Status |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **Arun Kumar** | `O+` | `arun.kumar@example.com` | `Donor@12345` | Chennai | Approved |
| **Priya Sharma** | `A+` | `priya.sharma@example.com` | `Donor@12345` | Coimbatore | Approved |
| **Karthik Raja** | `B+` | `karthik.raja@example.com` | `Donor@12345` | Madurai | Approved |
| **Deepa Venkatesh** | `AB+` | `deepa.v@example.com` | `Donor@12345` | Bangalore | Pending |
| **Mohammed Farooq** | `O-` | `farooq.m@example.com` | `Donor@12345` | Hyderabad | Approved |

*(Plus 11 additional pre-seeded donors across various blood groups and cities)*

---

## 12. REST API Documentation

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new voluntary blood donor (initial status `PENDING`) | Public |
| `POST` | `/api/auth/login` | Donor email/password login | Public |
| `POST` | `/api/admin/login` | Admin email/password login | Public |
| `POST` | `/api/auth/logout` | Terminate session | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |

### Donor Routes (`/api/donors`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/donors/me` | Get personal donor profile | Authenticated Donor |
| `PUT` | `/api/donors/me` | Update permitted profile fields | Authenticated Donor |
| `PUT` | `/api/donors/me/availability` | Toggle availability status (`Available` / `Not Available`) | Authenticated Donor |
| `GET` | `/api/donors/me/donations` | View past donation records for logged-in donor | Authenticated Donor |
| `GET` | `/api/donors/me/status` | Quick overview of registration & availability | Authenticated Donor |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Aggregated metrics, stat cards & Recharts datasets | Admin |
| `GET` | `/api/admin/donors` | Paginated donor directory with search & filters | Admin |
| `GET` | `/api/admin/donors/:id` | Full donor record & donation logs | Admin |
| `PUT` | `/api/admin/donors/:id` | Update donor information | Admin |
| `DELETE` | `/api/admin/donors/:id` | Delete donor and cascade donation history | Admin |
| `PUT` | `/api/admin/donors/:id/approve` | Set registration status to `APPROVED` | Admin |
| `PUT` | `/api/admin/donors/:id/reject` | Set registration status to `REJECTED` | Admin |
| `PUT` | `/api/admin/donors/:id/availability` | Admin override of donor availability status | Admin |
| `GET` | `/api/admin/registrations` | View newly submitted donor registration requests | Admin |
| `GET` | `/api/admin/donations` | View complete blood collection history | Admin |
| `POST` | `/api/admin/donations` | Record a new donation for any donor | Admin |
| `PUT` | `/api/admin/donations/:id` | Modify donation record details | Admin |
| `DELETE` | `/api/admin/donations/:id` | Delete donation record | Admin |
| `GET` | `/api/admin/reports` | Exportable metrics & full CSV data | Admin |
| `GET` | `/api/admin/administrators` | List administrative accounts | Super Admin |
| `POST` | `/api/admin/administrators` | Create new administrative staff account | Super Admin |
| `PUT` | `/api/admin/administrators/:id` | Edit administrator role/status | Super Admin |
| `DELETE` | `/api/admin/administrators/:id` | Revoke administrator access | Super Admin |

---

## 13. Step-by-Step Functional Verification

You can verify the entire multi-application lifecycle in under 3 minutes:

1. **Donor Registration**:
   - Go to `http://localhost:5173/register`.
   - Fill in personal info (e.g. "Vikas Malhotra", Blood Group: `O-`, City: `Chennai`).
   - Submit the form. Notice your initial status is **`PENDING`**.
2. **Admin Review & Approval**:
   - Go to `http://localhost:5174/admin/login` and log in with `admin@bloodconnect.org` / `Admin@12345`.
   - Navigate to **Registration Requests** (`/admin/registrations`).
   - Find "Vikas Malhotra" listed under Pending Review.
   - Click **Approve**. The status immediately becomes **`APPROVED`** in the database.
3. **Live Donor Reflection**:
   - Switch back to the Donor Web tab (`http://localhost:5173/dashboard`).
   - The status badge now displays **`✓ Verified Donor (APPROVED)`**.
4. **Availability Synchronization**:
   - On the donor dashboard, click **"Set as Not Available"**.
   - Switch to the Admin portal (`/admin/donors` or `/admin/search`).
   - The admin immediately sees the donor's updated status: **`Unavailable`**.
5. **Logging a Donation**:
   - In the Admin portal, open the donor's record and click **"Add Donation"**.
   - Enter donation date, hospital location, and notes (e.g. 450ml whole blood).
   - On the Donor Web, visit **Donation History** (`/donations`). The new verified donation is instantly visible!

---

## 14. Production Deployment Instructions

1. **Environment Security**:
   - Generate a cryptographically strong JWT secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - Store the secret in production environment managers (AWS Secrets Manager, Doppler, or Azure Key Vault).
2. **Build Frontends for Production**:
   ```bash
   cd donor-web && npm run build
   cd ../admin-web && npm run build
   ```
3. **Reverse Proxy & HTTPS**:
   - Deploy behind Nginx or Caddy with automated Let's Encrypt SSL/TLS certificates.
   - Serve frontend production builds (`dist/`) statically via Nginx and proxy `/api/*` requests to the Node.js backend cluster managed by PM2 (`pm2 start src/server.js -i max`).
4. **Database Hardening**:
   - Enable SSL connections (`useSSL=1`) for MySQL communication.
   - Restrict database user privileges to `SELECT, INSERT, UPDATE, DELETE` on `bloodconnect_db`.

---

## 15. License & Academic Disclaimer

This project is developed for educational and academic full-stack development demonstrations. It adheres to standard medical data privacy guidelines and software engineering best practices.
