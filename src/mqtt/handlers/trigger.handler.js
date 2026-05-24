// src/mqtt/handlers/trigger.handler.js
const nodeRepo = require('../../repositories/node.repository');
const { broadcast } = require('../../utils/websocket');

const handleInfraredData = async (nodeId, data) => {
  try {
    const { infrared, infraredRaw, firmware, ipAddress } = data;

    if (infrared === undefined) {
      console.warn(`⚠️ [InfraredHandler] Incomplete infrared data from ${nodeId}:`, data);
      return;
    }

    const existingNode = await nodeRepo.findByNodeId(nodeId);

    await nodeRepo.upsertByNodeId(nodeId, {
      nodeType: 'microcontroller',
      status: 'online',
      lastSeen: new Date(),
      ...(firmware && { firmware }),
      ...(ipAddress && { ipAddress }),
    });

    const infraredDetected =
      infrared === true ||
      infrared === 'true' ||
      infrared === 1 ||
      infrared === '1';

    broadcast({
      type: 'infrared_update',
      payload: {
        nodeId,
        nodeType: 'microcontroller',
        infrared: infraredDetected,
        infraredRaw: infraredRaw ?? null,
        recordedAt: new Date(),
        isNewNode: !existingNode,
      },
    });

    console.log(`✅ [InfraredHandler] Infrared data received from ${nodeId}:`, {
      infrared: infraredDetected,
      infraredRaw: infraredRaw ?? null,
    });
  } catch (err) {
    console.error(`❌ [InfraredHandler] Error processing data from ${nodeId}:`, err.message);
  }
};

module.exports = { handleInfraredData };