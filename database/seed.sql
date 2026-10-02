-- Blood Donor Registration and Management System
-- Demo Data Seed File (15+ realistic donors, admins, donation records)

USE bloodconnect_db;

-- Clear previous data safely
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE donation_records;
TRUNCATE TABLE donors;
TRUNCATE TABLE admins;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Admins
-- Password for both admins: Admin@12345
INSERT INTO admins (id, name, email, password_hash, role, status) VALUES
(1, 'System Super Administrator', 'admin@bloodconnect.org', '$2a$10$gfVUl6i71vpFkSdfk6tcxul4dwAqLyildET43Vwn/Tnlvxu9FPgYy', 'SUPER_ADMIN', 'ACTIVE'),
(2, 'Staff Operations Admin', 'staff@bloodconnect.org', '$2a$10$gfVUl6i71vpFkSdfk6tcxul4dwAqLyildET43Vwn/Tnlvxu9FPgYy', 'ADMIN', 'ACTIVE');

-- 2. Insert Donors (16 diverse realistic donors)
-- Password for all seed donors: Donor@12345
INSERT INTO donors (id, full_name, date_of_birth, gender, blood_group, mobile, email, password_hash, address, city, district, state, pincode, emergency_contact_name, emergency_contact_number, last_donation_date, availability_status, registration_status, created_at) VALUES
(1, 'Arun Kumar', '1995-04-12', 'Male', 'O+', '9876543210', 'arun.kumar@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '12 Anna Nagar West', 'Chennai', 'Chennai', 'Tamil Nadu', '600040', 'Suresh Kumar', '9876543299', '2026-09-15', 'Available', 'APPROVED', '2026-01-10 10:00:00'),
(2, 'Priya Sharma', '1998-08-23', 'Female', 'A+', '9876543211', 'priya.sharma@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '45 Gandhi Road', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', '641001', 'Rajesh Sharma', '9876543298', '2026-07-20', 'Available', 'APPROVED', '2026-02-14 11:30:00'),
(3, 'Karthik Raja', '1992-11-05', 'Male', 'B+', '9876543212', 'karthik.raja@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '88 South Cross Road', 'Madurai', 'Madurai', 'Tamil Nadu', '625001', 'Meena Raja', '9876543297', '2026-05-18', 'Available', 'APPROVED', '2026-02-28 09:15:00'),
(4, 'Deepa Venkatesh', '2000-02-14', 'Female', 'AB+', '9876543213', 'deepa.v@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '104 Indira Nagar', 'Bangalore', 'Bangalore Urban', 'Karnataka', '560038', 'Venkatesh S', '9876543296', NULL, 'Available', 'PENDING', '2026-09-28 14:20:00'),
(5, 'Mohammed Farooq', '1994-06-30', 'Male', 'O-', '9876543214', 'farooq.m@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '32 Jubilee Hills', 'Hyderabad', 'Hyderabad', 'Telangana', '500033', 'Amina Begum', '9876543295', '2026-08-10', 'Available', 'APPROVED', '2026-03-05 16:45:00'),
(6, 'Sneha Patel', '1996-09-17', 'Female', 'A-', '9876543215', 'sneha.patel@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '77 MG Road', 'Chennai', 'Chennai', 'Tamil Nadu', '600001', 'Kirit Patel', '9876543294', '2026-06-02', 'Not Available', 'APPROVED', '2026-03-12 12:10:00'),
(7, 'Vikram Chandran', '1991-01-25', 'Male', 'B-', '9876543216', 'vikram.c@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '59 Raja Street', 'Salem', 'Salem', 'Tamil Nadu', '636001', 'Anitha Chandran', '9876543293', '2026-04-14', 'Available', 'APPROVED', '2026-04-01 10:25:00'),
(8, 'Ananya Sundaram', '1999-12-08', 'Female', 'AB-', '9876543217', 'ananya.s@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '15 Marina View', 'Chennai', 'Chennai', 'Tamil Nadu', '600004', 'Sundaram K', '9876543292', NULL, 'Not Available', 'APPROVED', '2026-04-18 15:40:00'),
(9, 'Rahul Nair', '1993-07-19', 'Male', 'O+', '9876543218', 'rahul.nair@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '202 Marine Drive', 'Kochi', 'Ernakulam', 'Kerala', '682011', 'Devika Nair', '9876543291', '2026-08-25', 'Available', 'APPROVED', '2026-05-10 11:05:00'),
(10, 'Kavitha Murugan', '1997-03-11', 'Female', 'B+', '9876543219', 'kavitha.m@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '18 Temple Road', 'Tiruchirappalli', 'Tiruchirappalli', 'Tamil Nadu', '620001', 'Murugan P', '9876543290', NULL, 'Available', 'PENDING', '2026-09-29 17:15:00'),
(11, 'Siddharth Rao', '1990-10-30', 'Male', 'A+', '9876543220', 'siddharth.rao@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '64 Lake Road', 'Bangalore', 'Bangalore Urban', 'Karnataka', '560076', 'Geetha Rao', '9876543289', '2026-07-05', 'Available', 'APPROVED', '2026-06-15 08:30:00'),
(12, 'Divya Krishnan', '2001-05-16', 'Female', 'O+', '9876543221', 'divya.k@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '91 Race Course', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', '641018', 'Krishnan V', '9876543288', '2026-09-02', 'Available', 'APPROVED', '2026-07-02 13:50:00'),
(13, 'Manoj Verma', '1989-08-14', 'Male', 'B+', '9876543222', 'manoj.verma@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '112 Station Road', 'Madurai', 'Madurai', 'Tamil Nadu', '625002', 'Sunita Verma', '9876543287', NULL, 'Not Available', 'REJECTED', '2026-07-20 10:10:00'),
(14, 'Nandhini Balan', '1996-12-22', 'Female', 'A-', '9876543223', 'nandhini.b@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '43 Velachery Main Rd', 'Chennai', 'Chennai', 'Tamil Nadu', '600042', 'Balan M', '9876543286', NULL, 'Available', 'PENDING', '2026-09-30 09:40:00'),
(15, 'Ganesh Prasad', '1995-02-03', 'Male', 'AB+', '9876543224', 'ganesh.p@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '71 Palayamkottai', 'Tirunelveli', 'Tirunelveli', 'Tamil Nadu', '627002', 'Lakshmi Prasad', '9876543285', '2026-08-19', 'Available', 'APPROVED', '2026-08-12 15:20:00'),
(16, 'Roshni Thomas', '1998-04-18', 'Female', 'O-', '9876543225', 'roshni.t@example.com', '$2a$10$9lyJlhXpmNJYhjo3kMtjeup9cmkedyk5.MpBBICAIO3RbSBU8MKkW', '55 Panampilly Nagar', 'Kochi', 'Ernakulam', 'Kerala', '682036', 'Thomas Kurian', '9876543284', '2026-09-10', 'Available', 'APPROVED', '2026-08-25 16:35:00');

-- 3. Insert Donation Records
INSERT INTO donation_records (id, donor_id, donation_date, blood_group, location, notes, created_at) VALUES
(1, 1, '2026-09-15', 'O+', 'Chennai Central Blood Bank', 'Whole blood donation - 450ml. Donor in excellent condition.', '2026-09-15 11:30:00'),
(2, 1, '2026-05-12', 'O+', 'Government General Hospital, Chennai', 'Emergency trauma donation. 450ml whole blood.', '2026-05-12 14:00:00'),
(3, 2, '2026-07-20', 'A+', 'Coimbatore Medical College Blood Bank', 'Routine replacement donation.', '2026-07-20 10:15:00'),
(4, 3, '2026-05-18', 'B+', 'Apollo Specialty Hospital, Madurai', 'Platelet pheresis donation.', '2026-05-18 12:45:00'),
(5, 5, '2026-08-10', 'O-', 'Red Cross Society, Hyderabad', 'Universal donor emergency reserve donation.', '2026-08-10 15:20:00'),
(6, 6, '2026-06-02', 'A-', 'Rotary Central Blood Bank, Chennai', 'Corporate blood donation camp.', '2026-06-02 11:00:00'),
(7, 7, '2026-04-14', 'B-', 'Salem Government Hospital', 'Voluntary replacement donation.', '2026-04-14 09:30:00'),
(8, 9, '2026-08-25', 'O+', 'Ernakulam General Hospital', 'Monsoon blood drive campaign.', '2026-08-25 13:10:00'),
(9, 11, '2026-07-05', 'A+', 'Bangalore Baptist Hospital', 'Voluntary donor program.', '2026-07-05 10:45:00'),
(10, 12, '2026-09-02', 'O+', 'KG Hospital Blood Bank, Coimbatore', 'Regular voluntary blood donation.', '2026-09-02 16:00:00'),
(11, 15, '2026-08-19', 'AB+', 'Tirunelveli Medical College Hospital', 'Whole blood donation for elective surgery patient.', '2026-08-19 11:20:00'),
(12, 16, '2026-09-10', 'O-', 'Amrita Institute Blood Centre, Kochi', 'Rare blood type emergency dispatch collection.', '2026-09-10 14:40:00');
