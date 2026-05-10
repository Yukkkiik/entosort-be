const harvestService = require('../../services/harvest.service');
const { broadcast } = require('../../utils/websocket');

/**
 * Handle CV classification result from Raspberry Pi
 * Topic: harvest/result
 * Payload: {
 *   nodeId, larvaCount, prepupaCount, rejectCount,
 *   durationSec?, confidence?, timestamp?
 * }
 */
const handleHarvestResult = async (data) => {
  try {
    const {
      nodeId,
      larvaCount = 0,
      prepupaCount = 0,
      rejectCount = 0,
      durationSec,
    } = data;

    if (!nodeId) {
      console.warn('⚠️  [HarvestHandler] Missing nodeId in harvest result:', data);
      return;
    }

    // Save harvest log and trigger sort command via mqttClient (inside service)
    const harvest = await harvestService.create({
      nodeId,
      userId: null,   // automated from Raspberry Pi, no user
      larvaCount: parseInt(larvaCount),
      prepupaCount: parseInt(prepupaCount),
      rejectCount: parseInt(rejectCount),
      durationSec: durationSec ? parseInt(durationSec) : null,
      notes: 'Auto-classified via Computer Vision',
    });

    // Broadcast harvest result to dashboard
    broadcast({
      type: 'harvest_update',
      payload: {
        nodeId,
        larvaCount: harvest.larvaCount,
        prepupaCount: harvest.prepupaCount,
        rejectCount: harvest.rejectCount,
        totalCount: harvest.totalCount,
        recordedAt: harvest.recordedAt,
      },
    });

    console.log(`✅ [HarvestHandler] Harvest result saved for node ${nodeId}:`, {
      larvaCount, prepupaCount, rejectCount,
    });
  } catch (err) {
    console.error('❌ [HarvestHandler] Error processing harvest result:', err.message);
  }
};

module.exports = { handleHarvestResult };