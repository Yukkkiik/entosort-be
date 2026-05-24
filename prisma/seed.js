// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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
  console.log('✅ Admin created:', admin.username);

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
  console.log('✅ Peternak created:', peternak.username);

  // Node microcontroller → userId peternak1
  const microcontroller = await prisma.node.upsert({
    where: { nodeId: 'NODE-ESP32-001' },
    update: {},
    create: {
      nodeId:    'NODE-ESP32-001',
      nodeType:  'microcontroller',
      ipAddress: '192.168.1.100',
      status:    'offline',
      firmware:  'v1.0.0',
      userId:    peternak.id,
    },
  });
  console.log('✅ microcontroller node created:', microcontroller.nodeId, '→ userId:', peternak.id);

  // Node Raspberry Pi → userId peternak1
  const rpi = await prisma.node.upsert({
    where: { nodeId: 'NODE-RPI-001' },
    update: {},
    create: {
      nodeId:    'NODE-RPI-001',
      nodeType:  'raspberry',
      ipAddress: '192.168.1.101',
      status:    'offline',
      firmware:  'v2.0.0',
      userId:    peternak.id,
    },
  });
  console.log('✅ Raspberry Pi node created:', rpi.nodeId, '→ userId:', peternak.id);

  // Default settings ESP32
  await prisma.settings.upsert({
    where: { nodeId: 'NODE-ESP32-001' },
    update: {},
    create: {
      nodeId:         'NODE-ESP32-001',
      hsvLowerH: 20, hsvLowerS: 50, hsvLowerV: 50,
      hsvUpperH: 40, hsvUpperS: 255, hsvUpperV: 255,
      irThreshold:    500,
      motorSpeedRpm:  80,
      solenoidDelayMs: 300,
    },
  });
  console.log('✅ Default settings created for NODE-ESP32-001');

  const existingHarvest = await prisma.HarvestLog.count({
    where: { nodeId: 'NODE-ESP32-001' }
  });

  if (existingHarvest === 0) {
    const harvests = [
      {
        nodeId: 'NODE-ESP32-001',
        userId: peternak.id,
        larvaCount: 1200,
        prepupaCount: 80,
        rejectCount: 45,
        totalCount: 1325,
        durationSec: 3600,
        notes: 'Panen pertama batch 1',
        recordedAt: new Date('2026-05-01T08:00:00'),
      },
      {
        nodeId: 'NODE-ESP32-001',
        userId: peternak.id,
        larvaCount: 1500,
        prepupaCount: 95,
        rejectCount: 30,
        totalCount: 1625,
        durationSec: 4200,
        notes: 'Panen kedua batch 1',
        recordedAt: new Date('2026-05-08T09:00:00'),
      },
      {
        nodeId: 'NODE-ESP32-001',
        userId: peternak.id,
        larvaCount: 980,
        prepupaCount: 60,
        rejectCount: 55,
        totalCount: 1095,
        durationSec: 3000,
        notes: 'Panen ketiga - cuaca kurang mendukung',
        recordedAt: new Date('2026-05-15T07:30:00'),
      },
    ];

    await prisma.HarvestLog.createMany({ data: harvests });
    console.log('✅ Harvest data created:', harvests.length, 'records');
  } else {
    console.log('⏭️  Harvest data already exists, skipping...');
  }
   console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());