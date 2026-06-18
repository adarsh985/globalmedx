const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('./loggingMiddleware');

// Authenticate JWT Token
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'globalmedx_super_secret_jwt_key_2026');
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found in system' });
      }
      next();
    } catch (error) {
      logger.error('JWT authorization failed', { error: error.message });
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User context not found' });
    }
    if (!roles.includes(req.user.role)) {
      logger.warn('RBAC access violation attempted', {
        user: req.user.email,
        role: req.user.role,
        requiredRoles: roles,
        path: req.originalUrl
      });
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
