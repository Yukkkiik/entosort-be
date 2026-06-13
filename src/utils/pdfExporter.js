// src/utils/pdfExporter.js
const PDFDocument = require('pdfkit');
const { formatDate, formatTrigger, calcStats, periodLabel } = require('./exportHelpers');

// ─── Warna tema ───────────────────────────────────────────────────
const C = {
  primary:   '#1B6B3A',
  secondary: '#2D9E5F',
  accent:    '#F0FFF4',
  text:      '#212121',
  muted:     '#757575',
  white:     '#FFFFFF',
  border:    '#BDBDBD',
  statBg:    '#E8F5E9',
};

/**
 * generateHarvestPdf(logs, filters, meta)
 * @returns {Buffer}
 */
const generateHarvestPdf = (logs, filters = {}, meta = {}) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      bufferPages: true, // wajib agar switchToPage() bisa akses semua halaman untuk footer
      info: {
        Title:   'Laporan Panen BSF AutoSort-Vision',
        Author:  meta.exportedBy || 'System',
        Subject: 'Data Panen BSF',
      },
    });

    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W      = doc.page.width  - 80; // lebar efektif
    const LEFT   = 40;
    let   Y      = 40;

    // ── Helper functions ──────────────────────────────────────────
    const drawRect = (x, y, w, h, color, radius = 0) => {
      doc.roundedRect(x, y, w, h, radius).fill(color);
    };

    const text = (str, x, y, opts = {}) => {
      doc.fillColor(opts.color || C.text)
         .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(opts.size || 9)
         .text(str, x, y, { width: opts.width, align: opts.align || 'left', lineBreak: false, ...opts });
    };

    // ── Header utama ──────────────────────────────────────────────
    drawRect(LEFT, Y, W, 38, C.primary, 4);
    text('LAPORAN DATA PANEN BSF AutoSort-Vision', LEFT + 10, Y + 8, {
      bold: true, size: 14, color: C.white, width: W - 20, align: 'center',
    });
    text('Sistema Pemilahan Otomatis Black Soldier Fly', LEFT + 10, Y + 24, {
      size: 9, color: '#A5D6A7', width: W - 20, align: 'center',
    });
    Y += 48;

    // ── Info export (2 kolom) ─────────────────────────────────────
    const infoW = (W - 10) / 2;
    drawRect(LEFT, Y, infoW, 52, C.accent, 3);
    drawRect(LEFT + infoW + 10, Y, infoW, 52, C.accent, 3);

    const infoLeft = [
      ['Periode',  periodLabel(filters)],
      ['Unit',     filters.unitId || 'Semua unit'],
    ];
    const infoRight = [
      ['Diekspor oleh', meta.exportedBy || '-'],
      ['Tanggal ekspor', formatDate(new Date())],
    ];

    infoLeft.forEach(([label, val], i) => {
      text(`${label}:`, LEFT + 8, Y + 8 + i * 20, { bold: true, size: 8, color: C.primary });
      text(val, LEFT + 70, Y + 8 + i * 20, { size: 8, width: infoW - 78 });
    });
    infoRight.forEach(([label, val], i) => {
      text(`${label}:`, LEFT + infoW + 18, Y + 8 + i * 20, { bold: true, size: 8, color: C.primary });
      text(val, LEFT + infoW + 100, Y + 8 + i * 20, { size: 8, width: infoW - 108 });
    });
    Y += 62;

    // ── Statistik ringkasan ───────────────────────────────────────
    const stats   = calcStats(logs);
    const statItems = [
      ['Total Sesi',    stats.totalSessions],
      ['Total Larva',   stats.totalLarva],
      ['Total Prepupa', stats.totalPrepupa],
      ['Total Reject',  stats.totalReject],
      ['Total Panen',   stats.totalHarvested],
      ['Success Rate',  `${stats.successRate}%`],
    ];
    const statW = W / statItems.length;

    statItems.forEach(([label, val], i) => {
      const x = LEFT + i * statW;
      drawRect(x, Y, statW - 4, 42, C.statBg, 3);
      doc.rect(x, Y, statW - 4, 42).stroke(C.secondary);
      text(String(val), x + 4, Y + 6, {
        bold: true, size: 13, color: C.primary, width: statW - 12, align: 'center',
      });
      text(label, x + 4, Y + 26, {
        size: 7.5, color: C.muted, width: statW - 12, align: 'center',
      });
    });
    Y += 52;

    // ── Tabel header ──────────────────────────────────────────────
    const cols = [
      { label: 'No',         w: 28,  align: 'center', key: 'no'           },
      { label: 'Waktu Panen',w: 88,  align: 'left',   key: 'recordedAt'   },
      { label: 'Unit ID',    w: 72,  align: 'left',   key: 'unitId'       },
      { label: 'Peternak',   w: 65,  align: 'left',   key: 'peternak'     },
      { label: 'Larva',      w: 42,  align: 'center', key: 'larvaCount'   },
      { label: 'Prepupa',    w: 48,  align: 'center', key: 'prepupaCount' },
      { label: 'Reject',     w: 42,  align: 'center', key: 'rejectCount'  },
      { label: 'Total',      w: 42,  align: 'center', key: 'totalCount'   },
      { label: 'Rate',       w: 38,  align: 'center', key: 'rate'         },
      { label: 'Durasi(s)',  w: 48,  align: 'center', key: 'durationSec'  },
      { label: 'Trigger',    w: 70,  align: 'left',   key: 'triggerSource'},
    ];

    const ROW_H = 18;

    const drawTableHeader = (y) => {
      drawRect(LEFT, y, W, ROW_H, C.secondary, 0);
      let x = LEFT;
      cols.forEach((col) => {
        text(col.label, x + 3, y + 4, {
          bold: true, size: 7.5, color: C.white,
          width: col.w - 6, align: 'center',
        });
        x += col.w;
      });
      return y + ROW_H;
    };

    Y = drawTableHeader(Y);

    // ── Baris data ────────────────────────────────────────────────
    const drawRow = (log, idx, y) => {
      const isEven = idx % 2 === 0;
      drawRect(LEFT, y, W, ROW_H, isEven ? C.white : C.accent, 0);

      // Garis bawah row
      doc.moveTo(LEFT, y + ROW_H).lineTo(LEFT + W, y + ROW_H).stroke(C.border).lineWidth(0.3);

      const rate = log.totalCount > 0
        ? `${(((log.larvaCount + log.prepupaCount) / log.totalCount) * 100).toFixed(1)}%`
        : '0%';

      const values = {
        no:            idx + 1,
        recordedAt:    formatDate(log.recordedAt),
        unitId:        log.unitId,
        peternak:      log.user?.username || '-',
        larvaCount:    log.larvaCount,
        prepupaCount:  log.prepupaCount,
        rejectCount:   log.rejectCount,
        totalCount:    log.totalCount,
        rate,
        durationSec:   log.durationSec ?? '-',
        triggerSource: formatTrigger(log.triggerSource),
      };

      let x = LEFT;
      cols.forEach((col) => {
        const val = String(values[col.key] ?? '-');
        text(val, x + 3, y + 5, {
          size: 7.5, width: col.w - 6, align: col.align,
          color: col.key === 'rejectCount' && Number(values[col.key]) > 20
            ? '#C62828' // reject tinggi -> merah
            : C.text,
        });
        x += col.w;
      });

      return y + ROW_H;
    };

    logs.forEach((log, idx) => {
      // Buat halaman baru kalau mendekati batas bawah
      if (Y + ROW_H > doc.page.height - 50) {
        doc.addPage({ size: 'A4', layout: 'landscape', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
        Y = 40;
        Y = drawTableHeader(Y);
      }
      Y = drawRow(log, idx, Y);
    });

    // ── Baris total ───────────────────────────────────────────────
    if (Y + ROW_H > doc.page.height - 50) {
      doc.addPage({ size: 'A4', layout: 'landscape', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
      Y = 40;
    }
    drawRect(LEFT, Y, W, ROW_H, C.primary, 0);
    text('TOTAL', LEFT + 3, Y + 5, { bold: true, size: 8, color: C.white, width: 220 });

    let totalX = LEFT + cols[0].w + cols[1].w + cols[2].w + cols[3].w;
    [stats.totalLarva, stats.totalPrepupa, stats.totalReject, stats.totalHarvested].forEach((val, i) => {
      text(String(val), totalX + 3, Y + 5, {
        bold: true, size: 8, color: C.white,
        width: cols[4 + i].w - 6, align: 'center',
      });
      totalX += cols[4 + i].w;
    });
    Y += ROW_H + 16;

    // ── Statistik per Unit (tabel ringkasan) ──────────────────────
    const byUnit = logs.reduce((acc, log) => {
      if (!acc[log.unitId]) acc[log.unitId] = { logs: [], peternak: log.user?.username || '-' };
      acc[log.unitId].logs.push(log);
      return acc;
    }, {});

    if (Object.keys(byUnit).length > 1) {
      if (Y + 24 + Object.keys(byUnit).length * ROW_H > doc.page.height - 40) {
        doc.addPage({ size: 'A4', layout: 'landscape', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
        Y = 40;
      }

      text('STATISTIK PER UNIT', LEFT, Y, { bold: true, size: 10, color: C.primary });
      Y += 16;

      const sCols = [
        { label: 'Unit ID',      w: 110 },
        { label: 'Peternak',     w: 110 },
        { label: 'Total Sesi',   w: 70  },
        { label: 'Total Larva',  w: 70  },
        { label: 'Total Prepupa',w: 80  },
        { label: 'Total Reject', w: 70  },
        { label: 'Total Panen',  w: 70  },
        { label: 'Success Rate', w: 75  },
      ];

      drawRect(LEFT, Y, W, ROW_H, C.secondary, 0);
      let sx = LEFT;
      sCols.forEach((col) => {
        text(col.label, sx + 3, Y + 4, { bold: true, size: 7.5, color: C.white, width: col.w - 6, align: 'center' });
        sx += col.w;
      });
      Y += ROW_H;

      Object.entries(byUnit).forEach(([unitId, { logs: uLogs, peternak }], idx) => {
        const s      = calcStats(uLogs);
        const isEven = idx % 2 === 0;
        drawRect(LEFT, Y, W, ROW_H, isEven ? C.white : C.accent, 0);
        doc.moveTo(LEFT, Y + ROW_H).lineTo(LEFT + W, Y + ROW_H).stroke(C.border).lineWidth(0.3);

        const vals = [unitId, peternak, s.totalSessions, s.totalLarva, s.totalPrepupa, s.totalReject, s.totalHarvested, `${s.successRate}%`];
        let vx = LEFT;
        sCols.forEach((col, i) => {
          text(String(vals[i]), vx + 3, Y + 5, {
            size: 7.5, width: col.w - 6,
            align: i > 1 ? 'center' : 'left',
          });
          vx += col.w;
        });
        Y += ROW_H;
      });
    }

    // ── Footer ────────────────────────────────────────────────────
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      const footerY = doc.page.height - 30;
      doc.moveTo(LEFT, footerY - 4).lineTo(LEFT + W, footerY - 4).stroke(C.border).lineWidth(0.5);
      text('BSF AutoSort-Vision © 2026 — Dokumen ini digenerate otomatis oleh sistem', LEFT, footerY,
        { size: 7, color: C.muted, width: W - 60 });
      text(`Hal. ${i + 1} / ${pages.count}`, LEFT + W - 60, footerY,
        { size: 7, color: C.muted, width: 60, align: 'right' });
    }

    doc.end();
  });

module.exports = { generateHarvestPdf };