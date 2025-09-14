const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mera-default-secret';

// Debug middleware to check token and user
const debugAuth = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided',
        authHeader: authHeader
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await prisma.user.findUnique({ 
      where: { userId: decoded.userId },
      include: { organization: true }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        userId: decoded.userId
      });
    }

    console.log('User found:', {
      userId: user.userId,
      email: user.email,
      role: user.role,
      orgType: user.orgType,
      isActive: user.isActive
    });

    res.json({ 
      success: true, 
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        orgType: user.orgType,
        isActive: user.isActive,
        organization: user.organization
      }
    });

  } catch (error) {
    console.error('Debug auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { debugAuth };