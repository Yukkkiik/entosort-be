// src/mqtt/handlers/nodeStatus.handler.js
const nodeRepo = require('../../repositories/node.repository');
const { broadcast } = require('../../utils/websocket');

/**
 * Handle node online/offline status dari ESP32 / Raspberry Pi.
 *
 * Topic  : sensor/status/{nodeId}
 * Payload: {
 *   status:    'online' | 'offline',
 *   unitId:    string,               ← wajib, dikonfigurasi saat flash firmware
 *   nodeType:  'esp32' | 'raspberry',
 *   firmware?: string,
 *   ipAddress?: string,
 * }
 *
 * Contoh payload ESP32:
 *   { "status": "online", "unitId": "UNIT-BSF-001", "nodeType": "esp32", "firmware": "v1.0.0", "ipAddress": "192.168.1.50" }
 *
 * Contoh payload Raspberry Pi:
 *   { "status": "online", "unitId": "UNIT-BSF-001", "nodeType": "raspberry", "firmware": "v2.1.0", "ipAddress": "192.168.1.60" }
 */
const handleNodeStatus = async (nodeId, data) => {
  try {
    const { status, unitId, nodeType, firmware, ipAddress } = data;

    // ── Validasi field wajib ───────────────────────────────────────────────────

    if (!status || !['online', 'offline'].includes(status)) {
      console.warn(`⚠️  [NodeStatus] Invalid status dari ${nodeId}:`, status);
      return;
    }

    const validNodeTypes = ['esp32', 'raspberry'];

    // ── Cek apakah node sudah ada di DB ───────────────────────────────────────

    const existingNode = await nodeRepo.findByNodeId(nodeId);

    if (!existingNode) {
      // Node belum terdaftar — butuh unitId untuk auto-register
      if (!unitId) {
        console.warn(`⚠️  [NodeStatus] Node ${nodeId} belum terdaftar dan tidak ada unitId — skip`);
        return;
      }

      if (!nodeType || !validNodeTypes.includes(nodeType)) {
        console.warn(`⚠️  [NodeStatus] Node ${nodeId} tidak punya nodeType valid ('esp32'|'raspberry') — skip`);
        return;
      }

      console.log(`🆕 [NodeStatus] Auto-register node baru: ${nodeId} (${nodeType}) → unit ${unitId}`);
    }

    // ── Upsert node ───────────────────────────────────────────────────────────
    // Saat create (node baru): wajib unitId + nodeType
    // Saat update (node lama): hanya update status, lastSeen, firmware, ipAddress
    // unitId dan nodeType tidak boleh diubah setelah terdaftar

    await nodeRepo.upsertByNodeId(nodeId, {
      status,
      lastSeen: new Date(),
      // Hanya sertakan saat create baru (existingNode null)
      ...(!existingNode && unitId    && { unitId }),
      ...(!existingNode && nodeType  && validNodeTypes.includes(nodeType) && { nodeType }),
      // Firmware dan ipAddress boleh diupdate kapanpun
      ...(firmware  && { firmware }),
      ...(ipAddress && { ipAddress }),
    });

    // ── Broadcast ke dashboard via WebSocket ──────────────────────────────────

    broadcast({
      type: 'node_status',
      payload: {
        nodeId,
        unitId:    unitId ?? existingNode?.unitId,
        nodeType:  nodeType ?? existingNode?.nodeType,
        status,
        lastSeen:  new Date().toISOString(),
        isNewNode: !existingNode,
      },
    });

    console.log(`✅ [NodeStatus] ${nodeId} (${nodeType ?? existingNode?.nodeType}) → ${status}`);

  } catch (err) {
    console.error(`❌ [NodeStatus] Error update status ${nodeId}:`, err.message);
  }
};

module.exports = { handleNodeStatus };