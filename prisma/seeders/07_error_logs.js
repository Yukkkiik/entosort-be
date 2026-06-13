// prisma/seeders/07_error_logs.js
// Beberapa error sample untuk tiap unit -- campuran resolved dan unresolved.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const errorSamples = [
  {
    nodeType:  'esp32',
    errorCode: 'IR_TIMEOUT',
    errorType: 'sensor_error',
    message:   'IR sensor tidak merespons dalam 5000ms, periksa koneksi kabel',
    severity:  'medium',
    resolved:  true,
  },
  {
    nodeType:  'esp32',
    errorCode: 'MOTOR_OVERCURRENT',
    errorType: 'actuator_error',
    message:   'Arus motor melebihi batas 2A, motor dihentikan otomatis',
    severity:  'high',
    resolved:  true,
  },
  {
    nodeType:  'raspberry',
    errorCode: 'CAM_NOT_FOUND',
    errorType: 'hardware_error',
    message:   'Kamera tidak terdeteksi pada /dev/video0, pastikan kabel ribbon terpasang',
    severity:  'critical',
    resolved:  false,
  },
  {
    nodeType:  'raspberry',
    errorCode: 'MODEL_LOAD_FAIL',
    errorType: 'ai_error',
    message:   'Gagal memuat model BSF classifier: file model tidak ditemukan di /models/bsf_v2.pt',
    severity:  'critical',
    resolved:  false,
  },
  {
    nodeType:  'esp32',
    errorCode: 'MQTT_RECONNECT',
    errorType: 'network_error',
    message:   'Koneksi MQTT terputus, mencoba reconnect (attempt 3/5)',
    severity:  'low',
    resolved:  true,
  },
  {
    nodeType:  'raspberry',
    errorCode: 'INFERENCE_SLOW',
    errorType: 'performance_warning',
    message:   'Waktu inferensi AI melebihi 500ms (actual: 720ms), pertimbangkan optimasi model',
    severity:  'low',
    resolved:  true,
  },
  {
    nodeType:  'esp32',
    errorCode: 'SOLENOID_STUCK',
    errorType: 'actuator_error',
    message:   'Solenoid tidak merespons perintah close setelah 3 detik',
    severity:  'high',
    resolved:  false,
  },
];

async function seedErrorLogs(units) {
  console.log('  Seeding error logs...');

  const now = new Date();
  let total = 0;

  for (const unit of units) {
    // Tiap unit dapat 3-5 error sample acak
    const count = Math.floor(Math.random() * 3) + 3;
    const shuffled = [...errorSamples].sort(() => Math.random() - 0.5).slice(0, count);

    const errors = shuffled.map((e, i) => ({
      ...e,
      unitId: unit.unitId,
      occurredAt: new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 * Math.random() * 7),
    }));

    await prisma.errorLog.createMany({ data: errors });
    total += errors.length;
    console.log(`    ✓ ${errors.length} errors for ${unit.unitId}`);
  }

  console.log(`    total: ${total} error logs`);
}

module.exports = { seedErrorLogs };