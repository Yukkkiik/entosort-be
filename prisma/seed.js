// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { seedUsers }      = require('./seeders/01_users');
const { seedUnits }      = require('./seeders/02_units');
const { seedNodes }      = require('./seeders/03_nodes');
const { seedSettings }   = require('./seeders/04_settings');
const { seedSensorLogs } = require('./seeders/05_sensor_logs');
const { seedHarvestLogs} = require('./seeders/06_harvest_logs');
const { seedErrorLogs }  = require('./seeders/07_error_logs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  console.log('📦 [1/7] Users');
  const users = await seedUsers();

  console.log('\n📦 [2/7] Units');
  const units = await seedUnits(users);

  console.log('\n📦 [3/7] Nodes (ESP32 + RPi)');
  const nodes = await seedNodes(units);

  console.log('\n📦 [4/7] Settings');
  await seedSettings(units);

  console.log('\n📦 [5/7] Sensor logs (24 jam terakhir)');
  await seedSensorLogs(units, nodes);

  console.log('\n📦 [6/7] Harvest logs (30 hari terakhir)');
  await seedHarvestLogs(units, users);

  console.log('\n📦 [7/7] Error logs');
  await seedErrorLogs(units);

  console.log('\n✅ Seed selesai!\n');
  console.log('━'.repeat(50));
  console.log('Akun untuk testing:');
  console.log('━'.repeat(50));
  console.log('  superadmin   / superadmin123  (superadmin)');
  console.log('  admin_sulut  / admin123        (admin)');
  console.log('  admin_bolsel / admin123        (admin)');
  console.log('  peternak_andi  / peternak123   (peternak) → UNIT-BSF-001');
  console.log('  peternak_budi  / peternak123   (peternak) → UNIT-BSF-002');
  console.log('  peternak_citra / peternak123   (peternak) → UNIT-BSF-003');
  console.log('━'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });