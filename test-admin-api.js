const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mera-default-secret';

async function testAdminAPI() {
  try {
    // First, login as admin to get a token
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@ayutrace.com' }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found');
      return;
    }

    // Generate token
    const token = jwt.sign({ userId: adminUser.userId }, JWT_SECRET, { expiresIn: '1d' });
    console.log('✅ Generated admin token');

    // Test fetching users
    console.log('\n=== Testing Users API ===');
    const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Users API working:', usersData.data.users.length, 'users found');
    } else {
      const errorText = await usersResponse.text();
      console.error('❌ Users API failed:', usersResponse.status, errorText);
    }

    // Test fetching organizations
    console.log('\n=== Testing Organizations API ===');
    const orgsResponse = await fetch('http://localhost:3000/api/admin/organizations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (orgsResponse.ok) {
      const orgsData = await orgsResponse.json();
      console.log('✅ Organizations API working:', orgsData.data.length, 'organizations found');
    } else {
      const errorText = await orgsResponse.text();
      console.error('❌ Organizations API failed:', orgsResponse.status, errorText);
    }

  } catch (error) {
    console.error('❌ Error testing admin API:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPI();