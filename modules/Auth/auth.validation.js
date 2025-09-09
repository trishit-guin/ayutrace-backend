const { z } = require('zod');
const { ENUMS } = require('../../config/enums');

// Schema for user registration
const registerUserSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    orgType: z.enum(ENUMS.OrgType.values),
    organizationId: z.string().uuid('A valid organization ID is required'),
    blockchainIdentity: z.string().min(1).optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

// Schema for user login
const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
};