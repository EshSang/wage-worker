const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log(`[${new Date().toISOString()}] AUTH MIDDLEWARE - ${req.method} ${req.path}`);

  if (!token) {
    console.log(`[${new Date().toISOString()}] AUTH FAILED - No token provided for ${req.path}`);
    return res.status(401).json({
      error: 'Access denied. No token provided.',
      message: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    req.user = decoded; // Attach user info to request object
    console.log(`[${new Date().toISOString()}] AUTH SUCCESS - User: ${decoded.email} (ID: ${decoded.id})`);
    next();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] AUTH ERROR - ${error.name}:`, error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid.'
      });
    }
    return res.status(403).json({
      error: 'Token verification failed',
      message: error.message
    });
  }
};

module.exports = authenticateToken;
