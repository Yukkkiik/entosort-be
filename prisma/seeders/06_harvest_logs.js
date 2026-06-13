// prisma/seeders/06_harvest_logs.js
// Generate 30 sesi panen per unit yang punya peternak, dalam 30 hari terakhir.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const triggerSources = ['ir_sensor', 'ir_sensor', 'ir_sensor', 'manual']; // 75% otomatis

const generateSessions = (unit, users) => {
  const peternak = users.find((u) => u.id === unit.peterId);
  const sessions = [];
  const now = new Date();

  for (let i = 30; i >= 1; i--) {
    // 1-3 sesi per hari
    const sessionsPerDay = randomInt(1, 3);
    for (let s = 0; s < sessionsPerDay; s++) {
      const hoursOffset = randomInt(6, 18); // panen antara jam 6 pagi - 6 sore
      const recordedAt = new Date(now);
      recordedAt.setDate(recordedAt.getDate() - i);
      recordedAt.setHours(hoursOffset, randomInt(0, 59), 0, 0);

      const larvaCount   = randomInt(80, 350);
      const prepupaCount = randomInt(20, 120);
      const rejectCount  = randomInt(0, 30);

      sessions.push({
        unitId:        unit.unitId,
        userId:        peternak ? peternak.id : null,
        larvaCount,
        prepupaCount,
        rejectCount,
        totalCount:    larvaCount + prepupaCount + rejectCount,
        durationSec:   randomInt(30, 180),
        triggerSource: triggerSources[randomInt(0, triggerSources.length - 1)],
        notes:         s === 0 && i % 7 === 0 ? 'Panen rutin mingguan' : null,
        recordedAt,
      });
    }
  }
  return sessions;
};

async function seedHarvestLogs(units, users) {
  console.log('  Seeding harvest logs...');

  const assignedUnits = units.filter((u) => u.peterId !== null);
  let total = 0;

  for (const unit of assignedUnits) {
    const sessions = generateSessions(unit, users);
    await prisma.harvestLog.createMany({ data: sessions });
    total += sessions.length;
    console.log(`    ✓ ${sessions.length} sessions for ${unit.unitId}`);
  }

  console.log(`    total: ${total} harvest logs`);
}

module.exports = { seedHarvestLogs };