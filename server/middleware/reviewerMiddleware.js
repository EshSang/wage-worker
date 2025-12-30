/**
 * Reviewer authorization middleware
 * Checks if the authenticated user has reviewer privileges
 */
function isReviewer(req, res, next) {
  // Check if user is authenticated (should be set by auth middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Check if user has reviewer role
  if (req.user.usertype !== 'REVIEWER') {
    console.log(`[${new Date().toISOString()}] REVIEWER ACCESS DENIED - User: ${req.user.email} (Type: ${req.user.usertype})`);
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Reviewer access required',
    });
  }

  console.log(`[${new Date().toISOString()}] REVIEWER ACCESS GRANTED - User: ${req.user.email}`);
  next();
}

module.exports = { isReviewer };
