const { z } = require('zod');

// Schema for user registration
const registerUserSchema = z.object({
  body: z.object({
    email: z.email('A valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    organizationId: z.uuid('A valid organization ID is required'),
    blockchainIdentity: z.string().min(1).optional(),
    role: z.enum([
      'FARMER',
      'COOP_ADMIN',
      'PROCESSOR',
      'LAB_TECH',
      'MANUFACTURER_QA',
      'REGULATOR_ADMIN',
    ]),
  }),
});

// Schema for user login
const loginUserSchema = z.object({
  body: z.object({
    email: z.email('A valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
};