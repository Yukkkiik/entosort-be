// src/mqtt/handlers/nodeStatus.handler.js
const nodeRepo = require('../../repositories/node.repository');
const { broadcast } = require('../../utils/websocket');

/**
 * Handle node online/offline status dari ESP32 / Raspberry Pi.
 * Jika node belum terdaftar, otomatis di-register (auto-register).
 *
 * Topic  : sensor/status/{nodeId}
 * Payload: { status: 'online'|'offline', nodeType?, firmware?, ipAddress? }
 *
 * Contoh payload dari ESP32:
 *   { "status": "online", "nodeType": "microcontroller", "firmware": "v1.0.0", "ipAddress": "192.168.1.50" }
 *
 * Contoh payload dari Raspberry Pi:
 *   { "status": "online", "nodeType": "raspberry", "firmware": "v2.1.0", "ipAddress": "192.168.1.60" }
 */
const handleNodeStatus = async (nodeId, data) => {
  try {
    const { status, nodeType, firmware, ipAddress } = data;

    if (!status || !['online', 'offline'].includes(status)) {
      console.warn(`⚠️  [NodeStatusHandler] Invalid status from ${nodeId}:`, data);
      return;
    }

    const validNodeTypes = ['microcontroller', 'raspberry'];

    // Auto-register node jika belum ada di database
    const existingNode = await nodeRepo.findByNodeId(nodeId);
    if (!existingNode) {
      console.log(`🆕 [NodeStatusHandler] Node baru terdeteksi, auto-register: ${nodeId} (${nodeType})`);
    }

    await nodeRepo.upsertByNodeId(nodeId, {
      status,
      lastSeen: new Date(),
      ...(nodeType && validNodeTypes.includes(nodeType) && { nodeType }),
      ...(firmware && { firmware }),
      ...(ipAddress && { ipAddress }),
    });

    broadcast({
      type: 'node_status',
      payload: {
        nodeId,
        nodeType: nodeType || existingNode?.nodeType,
        status,
        lastSeen: new Date().toISOString(),
        isNewNode: !existingNode,
      },
    });

    console.log(`✅ [NodeStatusHandler] Node ${nodeId} (${nodeType}) is now ${status}`);
  } catch (err) {
    console.error(`❌ [NodeStatusHandler] Error updating status for ${nodeId}:`, err.message);
  }
};

module.exports = { handleNodeStatus };