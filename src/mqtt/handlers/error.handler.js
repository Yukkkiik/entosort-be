const errorLogService = require('../../services/errorLog.service');
const { broadcast } = require('../../utils/websocket');

/**
 * Handle error events from ESP32 or Raspberry Pi
 * Topic: device/error/{nodeId}
 * Payload: {
 *   errorCode?, errorType, message,
 *   severity: 'low'|'medium'|'high'|'critical'
 * }
 */
const handleDeviceError = async (nodeId, data) => {
  try {
    const {
      errorCode,
      errorType = 'UNKNOWN_ERROR',
      message = 'No message provided',
      severity = 'medium',
    } = data;

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const safeSeverity = validSeverities.includes(severity) ? severity : 'medium';

    const errorLog = await errorLogService.saveError({
      nodeId,
      errorCode: errorCode || null,
      errorType,
      message,
      severity: safeSeverity,
    });

    // broadcast is already called inside saveError, but log here for confirmation
    console.warn(`⚠️  [ErrorHandler] Error from node ${nodeId} [${safeSeverity}]: ${message}`);
  } catch (err) {
    console.error(`❌ [ErrorHandler] Failed to save error from ${nodeId}:`, err.message);
  }
};

module.exports = { handleDeviceError };