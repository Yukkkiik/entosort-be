// src/utils/excelExporter.js
const ExcelJS = require('exceljs');
const { formatDate, formatTrigger, calcStats, periodLabel } = require('./exportHelpers');

// ─── Warna tema BSF ──────────────────────────────────────────────
const COLOR = {
  PRIMARY:    '1B6B3A', // hijau tua
  SECONDARY:  '2D9E5F', // hijau muda
  ACCENT:     'F0FFF4', // hijau sangat muda (row alt)
  HEADER_FG:  'FFFFFF',
  STAT_BG:    'E8F5E9',
  STAT_LABEL: '2E7D32',
  BORDER:     'BDBDBD',
  GRAY:       'F5F5F5',
  TEXT:       '212121',
};

const border = (style = 'thin') => ({
  top:    { style, color: { argb: COLOR.BORDER } },
  left:   { style, color: { argb: COLOR.BORDER } },
  bottom: { style, color: { argb: COLOR.BORDER } },
  right:  { style, color: { argb: COLOR.BORDER } },
});

const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });

const font = (bold = false, size = 10, color = COLOR.TEXT) => ({
  name: 'Calibri', size, bold, color: { argb: color },
});

/**
 * generateHarvestExcel(logs, filters, meta)
 * @param {Array}  logs    - array HarvestLog dari repository
 * @param {Object} filters - { from, to, unitId }
 * @param {Object} meta    - { exportedBy, role }
 * @returns {Buffer} - Excel file buffer
 */
const generateHarvestExcel = async (logs, filters = {}, meta = {}) => {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'BSF AutoSort-Vision';
  wb.created  = new Date();

  // ════════════════════════════════════════════════
  // SHEET 1 — Detail Panen
  // ════════════════════════════════════════════════
  const ws = wb.addWorksheet('Detail Panen', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });

  ws.columns = [
    { key: 'no',            width: 6  },
    { key: 'recordedAt',    width: 22 },
    { key: 'unitId',        width: 18 },
    { key: 'peternak',      width: 18 },
    { key: 'larvaCount',    width: 14 },
    { key: 'prepupaCount',  width: 14 },
    { key: 'rejectCount',   width: 12 },
    { key: 'totalCount',    width: 14 },
    { key: 'successRate',   width: 14 },
    { key: 'durationSec',   width: 14 },
    { key: 'triggerSource', width: 18 },
    { key: 'notes',         width: 28 },
  ];

  // ── Header judul ─────────────────────────────────
  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value     = 'LAPORAN DATA PANEN BSF AutoSort-Vision';
  titleCell.font      = font(true, 14, COLOR.HEADER_FG);
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill      = fill(COLOR.PRIMARY);
  ws.getRow(1).height = 32;

  // ── Sub-header info export ────────────────────────
  const infoRows = [
    ['Periode',      periodLabel(filters)],
    ['Unit',         filters.unitId || 'Semua unit'],
    ['Diekspor oleh', meta.exportedBy || '-'],
    ['Tanggal ekspor', formatDate(new Date())],
  ];

  infoRows.forEach(([label, value], i) => {
    const row = ws.getRow(i + 2);
    row.getCell(1).value = label;
    row.getCell(1).font  = font(true, 10);
    row.getCell(1).fill  = fill(COLOR.GRAY);
    ws.mergeCells(`B${i + 2}:L${i + 2}`);
    row.getCell(2).value = value;
    row.getCell(2).font  = font(false, 10);
    row.height = 18;
  });

  // ── Baris statistik ringkasan ─────────────────────
  const stats = calcStats(logs);
  const statRow = ws.getRow(7);
  const statLabels = [
    ['Total Sesi', stats.totalSessions],
    ['Total Larva', stats.totalLarva],
    ['Total Prepupa', stats.totalPrepupa],
    ['Total Reject', stats.totalReject],
    ['Total Panen', stats.totalHarvested],
    ['Success Rate', `${stats.successRate}%`],
  ];

  // Merge & isi stat cells (2 kolom per stat)
  statLabels.forEach(([label, val], i) => {
    const col  = i * 2 + 1; // A,C,E,G,I,K
    const col2 = col + 1;
    ws.mergeCells(7, col, 7, col2);
    const cell  = statRow.getCell(col);
    cell.value  = `${label}: ${val}`;
    cell.font   = font(true, 10, COLOR.STAT_LABEL);
    cell.fill   = fill(COLOR.STAT_BG);
    cell.border = border();
    cell.alignment = { horizontal: 'center' };
  });
  statRow.height = 22;

  // Baris kosong pemisah
  ws.getRow(8).height = 6;

  // ── Header kolom tabel ────────────────────────────
  const headers = [
    'No', 'Waktu Panen', 'Unit ID', 'Peternak',
    'Larva', 'Prepupa', 'Reject', 'Total',
    'Success Rate', 'Durasi (dtk)', 'Trigger', 'Catatan',
  ];
  const headerRow = ws.getRow(9);
  headers.forEach((h, i) => {
    const cell      = headerRow.getCell(i + 1);
    cell.value      = h;
    cell.font       = font(true, 10, COLOR.HEADER_FG);
    cell.fill       = fill(COLOR.SECONDARY);
    cell.border     = border();
    cell.alignment  = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  headerRow.height = 22;

  // ── Baris data ────────────────────────────────────
  logs.forEach((log, idx) => {
    const rowNum     = idx + 10;
    const row        = ws.getRow(rowNum);
    const isEven     = idx % 2 === 0;
    const rowFill    = fill(isEven ? 'FFFFFF' : COLOR.ACCENT);
    const rate       = log.totalCount > 0
      ? `${(((log.larvaCount + log.prepupaCount) / log.totalCount) * 100).toFixed(1)}%`
      : '0.0%';

    const values = [
      idx + 1,
      formatDate(log.recordedAt),
      log.unitId,
      log.user?.username || '-',
      log.larvaCount,
      log.prepupaCount,
      log.rejectCount,
      log.totalCount,
      rate,
      log.durationSec ?? '-',
      formatTrigger(log.triggerSource),
      log.notes || '-',
    ];

    values.forEach((val, col) => {
      const cell     = row.getCell(col + 1);
      cell.value     = val;
      cell.font      = font(false, 10);
      cell.fill      = rowFill;
      cell.border    = border();
      cell.alignment = {
        horizontal: typeof val === 'number' ? 'center' : 'left',
        vertical: 'middle',
      };
    });
    row.height = 18;
  });

  // Baris total di bawah
  if (logs.length > 0) {
    const totalRowNum = logs.length + 10;
    const totalRow    = ws.getRow(totalRowNum);
    ws.mergeCells(`A${totalRowNum}:D${totalRowNum}`);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(1).font  = font(true, 10, COLOR.HEADER_FG);
    totalRow.getCell(1).fill  = fill(COLOR.PRIMARY);
    totalRow.getCell(1).alignment = { horizontal: 'center' };

    [stats.totalLarva, stats.totalPrepupa, stats.totalReject, stats.totalHarvested].forEach((val, i) => {
      const cell   = totalRow.getCell(i + 5);
      cell.value   = val;
      cell.font    = font(true, 10, COLOR.HEADER_FG);
      cell.fill    = fill(COLOR.PRIMARY);
      cell.border  = border();
      cell.alignment = { horizontal: 'center' };
    });

    // Kolom sisa
    [9, 10, 11, 12].forEach((col) => {
      const cell  = totalRow.getCell(col);
      cell.value  = '-';
      cell.font   = font(true, 10, COLOR.HEADER_FG);
      cell.fill   = fill(COLOR.PRIMARY);
      cell.border = border();
      cell.alignment = { horizontal: 'center' };
    });
    totalRow.height = 20;
  }

  // Freeze panes: header kolom tetap terlihat saat scroll
  ws.views = [{ state: 'frozen', ySplit: 9 }];

  // ════════════════════════════════════════════════
  // SHEET 2 — Statistik per Unit
  // ════════════════════════════════════════════════
  const wsStats = wb.addWorksheet('Statistik per Unit');

  wsStats.columns = [
    { key: 'unitId',       width: 20 },
    { key: 'peternak',     width: 20 },
    { key: 'sessions',     width: 14 },
    { key: 'larva',        width: 14 },
    { key: 'prepupa',      width: 14 },
    { key: 'reject',       width: 12 },
    { key: 'total',        width: 14 },
    { key: 'successRate',  width: 16 },
  ];

  wsStats.mergeCells('A1:H1');
  const statTitle = wsStats.getCell('A1');
  statTitle.value     = 'STATISTIK PANEN PER UNIT';
  statTitle.font      = font(true, 13, COLOR.HEADER_FG);
  statTitle.fill      = fill(COLOR.PRIMARY);
  statTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsStats.getRow(1).height = 28;

  const statHeaders = ['Unit ID', 'Peternak', 'Total Sesi', 'Total Larva', 'Total Prepupa', 'Total Reject', 'Total Panen', 'Success Rate'];
  const statHeaderRow = wsStats.getRow(2);
  statHeaders.forEach((h, i) => {
    const cell     = statHeaderRow.getCell(i + 1);
    cell.value     = h;
    cell.font      = font(true, 10, COLOR.HEADER_FG);
    cell.fill      = fill(COLOR.SECONDARY);
    cell.border    = border();
    cell.alignment = { horizontal: 'center' };
  });
  statHeaderRow.height = 20;

  // Group by unitId
  const byUnit = logs.reduce((acc, log) => {
    if (!acc[log.unitId]) acc[log.unitId] = { logs: [], peternak: log.user?.username || '-' };
    acc[log.unitId].logs.push(log);
    return acc;
  }, {});

  Object.entries(byUnit).forEach(([unitId, { logs: uLogs, peternak }], idx) => {
    const s   = calcStats(uLogs);
    const row = wsStats.getRow(idx + 3);
    const isEven = idx % 2 === 0;

    [unitId, peternak, s.totalSessions, s.totalLarva, s.totalPrepupa, s.totalReject, s.totalHarvested, `${s.successRate}%`]
      .forEach((val, col) => {
        const cell     = row.getCell(col + 1);
        cell.value     = val;
        cell.font      = font(false, 10);
        cell.fill      = fill(isEven ? 'FFFFFF' : COLOR.ACCENT);
        cell.border    = border();
        cell.alignment = { horizontal: typeof val === 'number' ? 'center' : 'left', vertical: 'middle' };
      });
    row.height = 18;
  });

  wsStats.views = [{ state: 'frozen', ySplit: 2 }];

  return wb.xlsx.writeBuffer();
};

module.exports = { generateHarvestExcel };