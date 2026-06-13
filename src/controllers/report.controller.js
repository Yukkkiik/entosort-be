// src/controllers/report.controller.js
const reportService = require('../services/report.service');
const { catchAsync } = require('../utils/catchAsync');

/**
 * GET /api/reports/daily
 * Query: ?unitId=UNIT-BSF-001&date=2026-06-13
 * date opsional — default hari ini
 */
const daily = catchAsync(async (req, res) => {
  const data = await reportService.getDailyReport(req.query, req.user);
  res.json({ success: true, data });
});

/**
 * GET /api/reports/export/pdf
 * Query: ?from=2026-01-01&to=2026-06-13&unitId=UNIT-BSF-001
 */
const exportPdf = catchAsync(async (req, res) => {
  const pdfBuffer = await reportService.exportPdf(req.query, req.user);
  const filename  = `bsf_harvest_report_${Date.now()}.pdf`;
  res.set({
    'Content-Type':        'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length':      pdfBuffer.length,
  });
  res.send(pdfBuffer);
});

/**
 * GET /api/reports/export/xlsx
 * Query: ?from=2026-01-01&to=2026-06-13&unitId=UNIT-BSF-001
 * (menggantikan exportCsv — Excel lebih informatif untuk laporan panen)
 */
const exportXlsx = catchAsync(async (req, res) => {
  const xlsxBuffer = await reportService.exportXlsx(req.query, req.user);
  const filename   = `bsf_harvest_report_${Date.now()}.xlsx`;
  res.set({
    'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length':      xlsxBuffer.length,
  });
  res.send(xlsxBuffer);
});

module.exports = { daily, exportPdf, exportXlsx };