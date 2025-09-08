const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createOrganization(data) {
  // Only use 'type' field for creation
  return await prisma.organization.create({
    data: {
      type: data.type
    }
  });
}

// Find organization by type
async function findOrganizationByType(type) {
  return await prisma.organization.findFirst({
    where: { type }
  });
}

module.exports = {
  createOrganization,
  findOrganizationByType,
};
