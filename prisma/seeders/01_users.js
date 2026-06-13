// prisma/seeders/01_users.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = [
  {
    username: 'superadmin',
    password: 'superadmin123',
    role: 'superadmin',
    phone: '081200000001',
  },
  {
    username: 'admin_sulut',
    password: 'admin123',
    role: 'admin',
    phone: '081200000002',
  },
  {
    username: 'admin_bolsel',
    password: 'admin123',
    role: 'admin',
    phone: '081200000003',
  },
  {
    username: 'peternak_andi',
    password: 'peternak123',
    role: 'peternak',
    phone: '081200000004',
  },
  {
    username: 'peternak_budi',
    password: 'peternak123',
    role: 'peternak',
    phone: '081200000005',
  },
  {
    username: 'peternak_citra',
    password: 'peternak123',
    role: 'peternak',
    phone: '081200000006',
  },
];

async function seedUsers() {
  console.log('  Seeding users...');

  const result = [];
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: { ...u, password: hashed },
    });
    result.push(user);
    console.log(`    ✓ ${user.role.padEnd(12)} ${user.username}`);
  }

  return result;
}

module.exports = { seedUsers };