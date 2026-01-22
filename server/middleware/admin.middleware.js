/**
 * Admin authorization middleware
 * Checks if the authenticated user has admin or reviewer privileges
 */
function isAdmin(req, res, next) {
  // Check if user is authenticated (should be set by auth middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Check if user has admin or reviewer role
  if (req.user.usertype !== 'ADMIN' && req.user.usertype !== 'REVIEWER') {
    console.log(`[${new Date().toISOString()}] ADMIN/REVIEWER ACCESS DENIED - User: ${req.user.email} (Type: ${req.user.usertype})`);
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin or Reviewer access required',
    });
  }

  console.log(`[${new Date().toISOString()}] ADMIN/REVIEWER ACCESS GRANTED - User: ${req.user.email}`);
  next();
}

module.exports = { isAdmin };
