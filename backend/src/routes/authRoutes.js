const express = require('express');
const router = express.Router();
const { registerDonor, loginDonor, loginAdmin, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', registerDonor);
router.post('/login', loginDonor);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
