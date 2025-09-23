const dbConnection = require('../../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = dbConnection.getClient();

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

  // Check if organization exists
  const organization = await prisma.organization.findUnique({ 
    where: { organizationId: input.organizationId } 
  });
  if (!organization) {
    throw new Error('Organization not found');
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      orgType: input.orgType,
      organizationId: input.organizationId,
      phone: input.phone,
      blockchainIdentity: input.blockchainIdentity,
      location: input.location,
      latitude: input.latitude,
      longitude: input.longitude,
    },
  });

  // Generate JWT token for immediate authentication
  const token = jwt.sign(
    {
      userId: user.userId,
      orgType: user.orgType,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Don't return the password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

// Service to handle user login
async function loginUser(input) {
  // Find user by email
  const user = await prisma.user.findUnique({ 
    where: { email: input.email }
  });
  
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new Error('Invalid email or password');
  }

  // Check if user account is active
  if (!user.isActive) {
    throw new Error('User account is deactivated');
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
      orgType: user.orgType,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Don't return the password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

module.exports = {
  registerUser,
  loginUser,
};