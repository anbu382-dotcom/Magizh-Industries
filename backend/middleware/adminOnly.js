// Ensures only users with admin role can access protected routes (must be used after auth.middleware.js).

/**
 * Middleware to check if authenticated user has admin role
 * Must be used after authenticate middleware
 */
const adminOnly = (req, res, next) => {
  try {
    // Check if user was attached by authenticate middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // User is admin, allow them to proceed
    next();

  } catch (error) {
    console.error("Admin Check Middleware Error:", error);
    return res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = adminOnly;
