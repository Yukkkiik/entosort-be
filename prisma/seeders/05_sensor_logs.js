// prisma/seeders/05_sensor_logs.js
// Generate data sensor 24 jam terakhir, tiap 15 menit, untuk unit yang online.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simulasi fluktuasi suhu/kelembaban BSF yang realistis
const randomFloat = (min, max, decimals = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const generateReadings = (unit, esp32Node) => {
  const readings = [];
  const now = new Date();
  const intervalMs = 15 * 60 * 1000; // 15 menit
  const totalPoints = 24 * 4; // 96 data point per unit

  for (let i = totalPoints; i >= 0; i--) {
    const recordedAt = new Date(now.getTime() - i * intervalMs);
    // Suhu BSF ideal 25-30°C, kelembaban 60-80%
    readings.push({
      nodeId:      esp32Node.nodeId,
      unitId:      unit.unitId,
      temperature: randomFloat(24.5, 31.5),
      humidity:    randomFloat(58, 82),
      pressure:    randomFloat(1010, 1016),
      recordedAt,
    });
  }
  return readings;
};

async function seedSensorLogs(units, nodes) {
  console.log('  Seeding sensor logs...');

  const onlineUnits = units.filter((u) => u.status === 'online');
  let total = 0;

  for (const unit of onlineUnits) {
    const esp32 = nodes.find(
      (n) => n.unitId === unit.unitId && n.nodeType === 'esp32'
    );
    if (!esp32) continue;

    const readings = generateReadings(unit, esp32);

    // createMany lebih cepat untuk data batch
    await prisma.sensorLog.createMany({ data: readings });
    total += readings.length;
    console.log(`    ✓ ${readings.length} readings for ${unit.unitId}`);
  }

  console.log(`    total: ${total} sensor logs`);
}

module.exports = { seedSensorLogs };