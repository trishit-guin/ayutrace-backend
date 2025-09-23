const jwt = require('jsonwebtoken');
const dbConnection = require('../../../utils/database');
const prisma = dbConnection.getClient();

const JWT_SECRET = process.env.JWT_SECRET || 'mera-default-secret';

const authMiddleware = async (req, res, next) => {
  // 1. Get token from the header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.',
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Find the user and attach to request
    const user = await prisma.user.findUnique({ 
      where: { userId: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'User account is deactivated',
        timestamp: new Date().toISOString(),
      });
    }

    // Attach user to the request object (excluding password)
    const { passwordHash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    // 4. Move to the next function
    next();
  } catch (error) {
    let message = 'Invalid token.';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token.';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not active.';
    }

    return res.status(401).json({ 
      message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Admin middleware - checks if user has admin role
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user has admin role or is ADMIN org type
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.orgType !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error checking admin privileges',
      timestamp: new Date().toISOString(),
    });
  }
};

// Super admin middleware - checks if user has super admin role
const superAdminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        message: 'Access denied. Super admin privileges required.',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error checking super admin privileges',
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { authMiddleware, adminMiddleware, superAdminMiddleware };