const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in again.'
    });
  }

  req.user = decoded;
  next();
}

function requireDonor(req, res, next) {
  if (!req.user || req.user.type !== 'donor') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Donor privileges required.'
    });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrator privileges required.'
    });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.type !== 'admin' || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Super Administrator privileges required for this operation.'
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireDonor,
  requireAdmin,
  requireSuperAdmin
};
