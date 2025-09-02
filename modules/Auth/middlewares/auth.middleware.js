const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'mera-default-secret';

const authMiddleware = async (req, res, next) => {
  // 1. Get token from the header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Find the user and attach to request
    const user = await prisma.user.findUnique({ where: { userId: decoded.userId } });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Attach user to the request object (excluding password)
    const { passwordHash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    // 4. Move to the next function
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = { authMiddleware };