// src/services/report.service.js
const reportRepo   = require('../repositories/report.repository');
const unitRepo     = require('../repositories/unit.repository');
const { generateHarvestExcel } = require('../utils/excelExporter');
const { generateHarvestPdf }   = require('../utils/pdfExporter');
const { calcStats }            = require('../utils/exportHelpers');
const { AppError } = require('../middleware/errorHandler');

// ─────────────────────────────────────────────────────────────
// Helper: pastikan role boleh export
// ─────────────────────────────────────────────────────────────
const checkExportAccess = (user) => {
  if (user.role === 'superadmin') {
    throw new AppError(
      'Superadmin tidak memiliki unit langsung. Gunakan akun admin atau peternak untuk export laporan.',
      403
    );
  }
};

// ─────────────────────────────────────────────────────────────
// Helper: validasi akses ke unitId spesifik
// ─────────────────────────────────────────────────────────────
const validateUnitAccess = async (unitId, user) => {
  if (!unitId) return; // tanpa unitId = ambil semua unit miliknya (sudah difilter di repo)

  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError(`Unit '${unitId}' not found`, 404);

  if (user.role === 'admin' && unit.adminId !== user.id) {
    throw new AppError('Akses ditolak: unit ini bukan milik admin Anda', 403);
  }
  if (user.role === 'peternak' && unit.peterId !== user.id) {
    throw new AppError('Akses ditolak: Anda hanya bisa ekspor data unit Anda sendiri', 403);
  }
};

// ─────────────────────────────────────────────────────────────
// getDailyReport
// ─────────────────────────────────────────────────────────────
const getDailyReport = async ({ unitId, date }, user) => {
  checkExportAccess(user);
  await validateUnitAccess(unitId, user);

  const target = date ? new Date(date) : new Date();
  if (isNaN(target.getTime())) throw new AppError('Format tanggal tidak valid', 400);

  const from = new Date(target); from.setHours(0,  0,  0,   0);
  const to   = new Date(target); to.setHours(23, 59, 59, 999);

  const logs = await reportRepo.findHarvestForDaily({
    from, to, unitId,
    userId: user.id,
    role:   user.role,
  });

  const stats = calcStats(logs);

  return {
    date:     from.toISOString().slice(0, 10),
    unitId:   unitId || 'semua unit milik Anda',
    stats,
    sessions: logs.map((l) => ({
      id:            l.id,
      unitId:        l.unitId,
      peternak:      l.user?.username || '-',
      larvaCount:    l.larvaCount,
      prepupaCount:  l.prepupaCount,
      rejectCount:   l.rejectCount,
      totalCount:    l.totalCount,
      durationSec:   l.durationSec,
      triggerSource: l.triggerSource,
      recordedAt:    l.recordedAt,
    })),
  };
};

// ─────────────────────────────────────────────────────────────
// exportPdf
// ─────────────────────────────────────────────────────────────
const exportPdf = async ({ from, to, unitId }, user) => {
  checkExportAccess(user);
  await validateUnitAccess(unitId, user);

  const logs = await reportRepo.findHarvestForExport({
    from, to, unitId,
    userId: user.id,
    role:   user.role,
  });

  if (logs.length === 0) {
    throw new AppError('Tidak ada data panen pada filter yang dipilih', 404);
  }

  return generateHarvestPdf(
    logs,
    { from, to, unitId },
    { exportedBy: user.username, role: user.role }
  );
};

// ─────────────────────────────────────────────────────────────
// exportXlsx
// ─────────────────────────────────────────────────────────────
const exportXlsx = async ({ from, to, unitId }, user) => {
  checkExportAccess(user);
  await validateUnitAccess(unitId, user);

  const logs = await reportRepo.findHarvestForExport({
    from, to, unitId,
    userId: user.id,
    role:   user.role,
  });

  if (logs.length === 0) {
    throw new AppError('Tidak ada data panen pada filter yang dipilih', 404);
  }

  return generateHarvestExcel(
    logs,
    { from, to, unitId },
    { exportedBy: user.username, role: user.role }
  );
};

module.exports = { getDailyReport, exportPdf, exportXlsx };