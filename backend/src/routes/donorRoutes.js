const express = require('express');
const router = express.Router();
const {
  createDonor,
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  getMyDonations,
  getMyStatus
} = require('../controllers/donorController');
const { authenticate, requireDonor } = require('../middleware/authMiddleware');

// Public registration endpoint alias
router.post('/', createDonor);

// Protected routes for authenticated donor
router.get('/me', authenticate, requireDonor, getMyProfile);
router.put('/me', authenticate, requireDonor, updateMyProfile);
router.put('/me/availability', authenticate, requireDonor, updateMyAvailability);
router.get('/me/donations', authenticate, requireDonor, getMyDonations);
router.get('/me/status', authenticate, requireDonor, getMyStatus);

module.exports = router;
