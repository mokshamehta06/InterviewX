/**
 * Admin Role Middleware
 * Must be used AFTER the auth middleware.
 * Checks if the authenticated user has admin role.
 * 
 * Usage: router.get('/admin-only', auth, admin, controller.method)
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
};

module.exports = admin;
