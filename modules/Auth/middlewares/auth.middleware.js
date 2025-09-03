const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
      where: { userId: decoded.userId },
      include: {
        organization: {
          select: {
            organizationId: true,
            name: true,
            type: true,
            isActive: true,
          }
        }
      }
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

    // Check if user's organization is active
    if (!user.organization.isActive) {
      return res.status(403).json({ 
        message: 'Organization is deactivated',
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

module.exports = { authMiddleware };