// prisma/seeders/02_units.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// unitId harus unik dan ini yang dipakai di MQTT topic: device/control/{unitId}
const getUnits = (users) => {
  const adminSulut  = users.find((u) => u.username === 'admin_sulut');
  const adminBolsel = users.find((u) => u.username === 'admin_bolsel');
  const andi        = users.find((u) => u.username === 'peternak_andi');
  const budi        = users.find((u) => u.username === 'peternak_budi');
  const citra       = users.find((u) => u.username === 'peternak_citra');

  return [
    {
      unitId:   'UNIT-BSF-001',
      adminId:  adminSulut.id,
      peterId:  andi.id,
      location: 'Kandang A - Desa Mopuya, Bolsel',
      status:   'online',
    },
    {
      unitId:   'UNIT-BSF-002',
      adminId:  adminSulut.id,
      peterId:  budi.id,
      location: 'Kandang B - Desa Inobonto, Bolsel',
      status:   'offline',
    },
    {
      unitId:   'UNIT-BSF-003',
      adminId:  adminBolsel.id,
      peterId:  citra.id,
      location: 'Kandang C - Desa Tomini, Bolsel',
      status:   'online',
    },
    {
      // Unit ke-4: punya admin tapi belum di-assign ke peternak
      unitId:   'UNIT-BSF-004',
      adminId:  adminBolsel.id,
      peterId:  null,
      location: 'Kandang D - Gudang Pusat, Bolsel',
      status:   'offline',
    },
  ];
};

async function seedUnits(users) {
  console.log('  Seeding units...');

  const units = getUnits(users);
  const result = [];

  for (const u of units) {
    const unit = await prisma.unit.upsert({
      where:  { unitId: u.unitId },
      update: { status: u.status, location: u.location },
      create: u,
    });
    result.push(unit);
    console.log(`    ✓ ${unit.unitId}  status: ${unit.status}`);
  }

  return result;
}

module.exports = { seedUnits };