const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/authController');
const {
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
} = require('../controllers/adminController');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/authMiddleware');

// Public admin login
router.post('/login', loginAdmin);

// All subsequent admin routes require admin authentication
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Donors management
router.get('/donors', getDonors);
router.get('/donors/:id', getDonorById);
router.put('/donors/:id', updateDonor);
router.delete('/donors/:id', deleteDonor);
router.put('/donors/:id/approve', approveDonor);
router.put('/donors/:id/reject', rejectDonor);
router.put('/donors/:id/availability', updateDonorAvailability);

// Registration requests
router.get('/registrations', getRegistrationRequests);

// Donations management
router.get('/donations', getDonations);
router.post('/donations', addDonation);
router.put('/donations/:id', updateDonation);
router.delete('/donations/:id', deleteDonation);

// Reports
router.get('/reports', getReports);

// Super Admin only routes for managing administrators
router.get('/administrators', requireSuperAdmin, getAdministrators);
router.post('/administrators', requireSuperAdmin, addAdministrator);
router.put('/administrators/:id', requireSuperAdmin, updateAdministrator);
router.delete('/administrators/:id', requireSuperAdmin, deleteAdministrator);

module.exports = router;
