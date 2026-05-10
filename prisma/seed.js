// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await hashPassword('admin123'),
      role: 'admin',
      phone: '08123456789',
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // Seed peternak user
  const peternak = await prisma.user.upsert({
    where: { username: 'peternak1' },
    update: {},
    create: {
      username: 'peternak1',
      password: await hashPassword('peternak123'),
      role: 'peternak',
      phone: '08987654321',
    },
  });
  console.log('✅ Peternak user created:', peternak.username);

  // Seed ESP32 node (kontrol hardware)
  const esp32Node = await prisma.node.upsert({
    where: { nodeId: 'NODE-ESP32-001' },
    update: {},
    create: {
      nodeId: 'NODE-ESP32-001',
      nodeType: 'microcontroller',
      ipAddress: '192.168.1.100',
      status: 'offline',
      firmware: 'v1.0.0',
    },
  });
  console.log('✅ ESP32 node created:', esp32Node.nodeId);

  // Seed Raspberry Pi node (edge AI / CV)
  const rpiNode = await prisma.node.upsert({
    where: { nodeId: 'NODE-RPI-001' },
    update: {},
    create: {
      nodeId: 'NODE-RPI-001',
      nodeType: 'raspberry',
      ipAddress: '192.168.1.101',
      status: 'offline',
      firmware: 'v2.0.0',
    },
  });
  console.log('✅ Raspberry Pi node created:', rpiNode.nodeId);

  // Seed default settings untuk ESP32
  await prisma.settings.upsert({
    where: { nodeId: 'NODE-ESP32-001' },
    update: {},
    create: {
      nodeId: 'NODE-ESP32-001',
      hsvLowerH: 20,
      hsvLowerS: 50,
      hsvLowerV: 50,
      hsvUpperH: 40,
      hsvUpperS: 255,
      hsvUpperV: 255,
      irThreshold: 500,
      motorSpeedRpm: 80,
      solenoidDelayMs: 300,
    },
  });
  console.log('✅ Default settings created for NODE-ESP32-001');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });