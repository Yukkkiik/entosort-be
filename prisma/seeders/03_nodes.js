// prisma/seeders/03_nodes.js
// Tiap unit punya 1 ESP32 dan 1 Raspberry Pi.
// nodeId = ID unik hardware untuk MQTT.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getNodes = (units) =>
  units.flatMap((unit) => [
    {
      nodeId:    `${unit.unitId}-ESP32`,
      unitId:    unit.unitId,
      nodeType:  'esp32',
      ipAddress: unit.status === 'online' ? '192.168.1.10' : null,
      status:    unit.status,
      firmware:  'v1.2.0',
      lastSeen:  unit.status === 'online' ? new Date() : null,
    },
    {
      nodeId:    `${unit.unitId}-RPI`,
      unitId:    unit.unitId,
      nodeType:  'raspberry',
      ipAddress: unit.status === 'online' ? '192.168.1.11' : null,
      status:    unit.status,
      firmware:  'bsf-model-v2.1',
      lastSeen:  unit.status === 'online' ? new Date() : null,
    },
  ]);

async function seedNodes(units) {
  console.log('  Seeding nodes...');

  const nodes = getNodes(units);
  const result = [];

  for (const n of nodes) {
    const node = await prisma.node.upsert({
      where:  { nodeId: n.nodeId },
      update: { status: n.status, ipAddress: n.ipAddress, lastSeen: n.lastSeen },
      create: n,
    });
    result.push(node);
    console.log(`    ✓ ${node.nodeId.padEnd(24)} type: ${node.nodeType}`);
  }

  return result;
}

module.exports = { seedNodes };