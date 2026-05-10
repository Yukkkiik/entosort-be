const reportService = require('../services/report.service');
const { catchAsync } = require('../utils/catchAsync');

const daily = catchAsync(async (req, res) => {
  const data = await reportService.getDailyReport(req.query);
  res.json({ success: true, data });
});

const exportPdf = catchAsync(async (req, res) => {
  const pdfBuffer = await reportService.exportPdf(req.query);
  const filename = `bsf_harvest_report_${Date.now()}.pdf`;
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': pdfBuffer.length,
  });
  res.send(pdfBuffer);
});

const exportCsv = catchAsync(async (req, res) => {
  const csvData = await reportService.exportCsv(req.query);
  const filename = `bsf_harvest_report_${Date.now()}.csv`;
  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
  res.send(csvData);
});

module.exports = { daily, exportPdf, exportCsv };