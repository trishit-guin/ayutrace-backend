const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createOrganization(data) {
  return await prisma.organization.create({ data });
}

module.exports = { createOrganization };
