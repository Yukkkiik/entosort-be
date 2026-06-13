// prisma/seeders/04_settings.js
// Satu settings per unit -- berisi config ESP32 (IR/motor/solenoid) + RPi (HSV).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSettings = (units) =>
  units.map((unit) => ({
    unitId: unit.unitId,
    // HSV untuk deteksi larva (hijau kekuningan) -- nilai awal kalibrasi
    hsvLowerH: 20,
    hsvLowerS: 40,
    hsvLowerV: 40,
    hsvUpperH: 80,
    hsvUpperS: 255,
    hsvUpperV: 255,
    // ESP32 aktuator
    irThreshold:     500,
    motorSpeedRpm:   100,
    solenoidDelayMs: 200,
    manualMode:      false,
    motorOn:         false,
    solenoidOn:      false,
  }));

async function seedSettings(units) {
  console.log('  Seeding settings...');

  const result = [];
  for (const s of getSettings(units)) {
    const settings = await prisma.settings.upsert({
      where:  { unitId: s.unitId },
      update: {},
      create: s,
    });
    result.push(settings);
    console.log(`    ✓ settings for ${settings.unitId}`);
  }

  return result;
}

module.exports = { seedSettings };