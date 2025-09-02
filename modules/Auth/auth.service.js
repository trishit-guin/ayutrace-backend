const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// In a real app, these would be in a .env file
const JWT_SECRET = process.env.JWT_SECRET || 'mera-default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Service to handle user registration
async function registerUser(input) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Separate the password from the rest of the user data
  const { password, ...userData } = input;

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      ...userData,
      passwordHash: passwordHash, // Match the schema field `passwordHash`
    },
  });

  // Don't return the password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Service to handle user login
async function loginUser(input) {
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new Error('Invalid email or password');
  }

  // Update last login time
  await prisma.user.update({
    where: { userId: user.userId },
    data: { lastLogin: new Date() },
  });

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user.userId,
      role: user.role,
      organizationId: user.organizationId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token };
}

module.exports = {
  registerUser,
  loginUser,
};