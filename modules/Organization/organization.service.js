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

// Get all organizations
async function getAllOrganizations() {
  return await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          users: true
        }
      }
    },
    orderBy: {
      type: 'asc'
    }
  });
}

module.exports = {
  createOrganization,
  findOrganizationByType,
  getAllOrganizations,
};
