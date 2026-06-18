// src/utils/pdfExporter.js
const PDFDocument = require('pdfkit');
const { formatDate, formatTrigger, calcStats, periodLabel } = require('./exportHelpers');

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

const generateHarvestPdf = (logs, filters = {}, meta = {}) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let pageNum  = 1;
    let inFooter = false; // guard: cegah recursive pageAdded

    const doc = new PDFDocument({
      size:    'A4',
      layout:  'landscape',
      margins: { top: 40, bottom: 55, left: 40, right: 40 },
      info: {
        Title:   'Laporan Panen BSF AutoSort-Vision',
        Author:  meta.exportedBy || 'System',
        Subject: 'Data Panen BSF',
      },
    });

    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W    = doc.page.width - 80;
    const LEFT = 40;

    // ── Footer ────────────────────────────────────────────────────
    // PENTING: jangan gunakan `width` parameter di doc.text() di sini.
    // width parameter menyebabkan pdfkit menambah halaman kosong saat
    // dipanggil dari dalam pageAdded event handler.
    const renderFooter = () => {
      if (inFooter) return;
      inFooter = true;

      const savedY = doc.y;
      const fY     = doc.page.height - 30;

      // Garis pemisah via raw PDF content (zero side-effect pada layout engine)
      doc.addContent(
        'q 0.4 w 0.741 0.741 0.741 RG ' +
        LEFT + ' ' + (fY - 5) + ' m ' +
        (LEFT + W) + ' ' + (fY - 5) + ' l S Q'
      );

      // Teks kiri -- TANPA width parameter
      doc.save()
         .font('Helvetica').fontSize(7).fillColor(C.muted)
         .text(
           'BSF AutoSort-Vision \u00A9 2026 \u2014 Dokumen ini digenerate otomatis oleh sistem',
           LEFT, fY,
           { lineBreak: false }
         )
         .restore();

      // Teks kanan (nomor halaman) -- TANPA width parameter
      doc.save()
         .font('Helvetica').fontSize(7).fillColor(C.muted)
         .text('Hal. ' + pageNum, doc.page.width - 90, fY, { lineBreak: false })
         .restore();

      doc.y     = savedY; // kembalikan cursor
      inFooter  = false;
    };

    // Render footer halaman pertama (sebelum pageAdded terdaftar)
    renderFooter();

    // Semua halaman berikutnya otomatis dapat footer
    doc.on('pageAdded', () => { pageNum++; renderFooter(); });

    let Y = 40;

    const drawRect = (x, y, w, h, color, radius = 0) => {
      doc.roundedRect(x, y, w, h, radius).fill(color);
    };

    // txt helper: gunakan width hanya di luar footer context
    const txt = (str, x, y, opts = {}) => {
      doc.fillColor(opts.color || C.text)
         .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(opts.size || 9)
         .text(String(str), x, y, {
           width:     opts.width,
           align:     opts.align || 'left',
           lineBreak: false,
           ...opts,
         });
    };

    // ── Header utama ──────────────────────────────────────────────
    drawRect(LEFT, Y, W, 38, C.primary, 4);
    txt('LAPORAN DATA PANEN BSF AutoSort-Vision', LEFT + 10, Y + 8,
      { bold: true, size: 14, color: C.white, width: W - 20, align: 'center' });
    txt('Sistem Pemilahan Otomatis Black Soldier Fly', LEFT + 10, Y + 24,
      { size: 9, color: '#A5D6A7', width: W - 20, align: 'center' });
    Y += 48;

    // ── Info export ───────────────────────────────────────────────
    const infoW = (W - 10) / 2;
    drawRect(LEFT, Y, infoW, 52, C.statBg, 3);
    drawRect(LEFT + infoW + 10, Y, infoW, 52, C.statBg, 3);

    [
      ['Periode', periodLabel(filters)],
      ['Unit',    filters.unitId || 'Semua unit'],
    ].forEach(([label, val], i) => {
      txt(label + ':', LEFT + 8, Y + 8 + i * 20, { bold: true, size: 8, color: C.primary });
      txt(val, LEFT + 70, Y + 8 + i * 20, { size: 8, width: infoW - 78 });
    });

    [
      ['Diekspor oleh', meta.exportedBy || '-'],
      ['Tanggal ekspor', formatDate(new Date())],
    ].forEach(([label, val], i) => {
      txt(label + ':', LEFT + infoW + 18, Y + 8 + i * 20, { bold: true, size: 8, color: C.primary });
      txt(val, LEFT + infoW + 110, Y + 8 + i * 20, { size: 8, width: infoW - 118 });
    });
    Y += 62;

    // ── Statistik ringkasan ───────────────────────────────────────
    const stats = calcStats(logs);
    const statItems = [
      ['Total Sesi',    stats.totalSessions],
      ['Total Larva',   stats.totalLarva],
      ['Total Prepupa', stats.totalPrepupa],
      ['Total Reject',  stats.totalReject],
      ['Total Panen',   stats.totalHarvested],
      ['Success Rate',  stats.successRate + '%'],
    ];
    const statW = W / statItems.length;

    statItems.forEach(([label, val], i) => {
      const x = LEFT + i * statW;
      drawRect(x, Y, statW - 4, 42, C.statBg, 3);
      doc.rect(x, Y, statW - 4, 42).stroke(C.secondary);
      txt(String(val), x + 4, Y + 6,
        { bold: true, size: 13, color: C.primary, width: statW - 12, align: 'center' });
      txt(label, x + 4, Y + 26,
        { size: 7.5, color: C.muted, width: statW - 12, align: 'center' });
    });
    Y += 52;

    // ── Tabel header ──────────────────────────────────────────────
    const cols = [
      { label: 'No',          w: 28,  align: 'center', key: 'no'           },
      { label: 'Waktu Panen', w: 88,  align: 'left',   key: 'recordedAt'   },
      { label: 'Unit ID',     w: 72,  align: 'left',   key: 'unitId'       },
      { label: 'Peternak',    w: 65,  align: 'left',   key: 'peternak'     },
      { label: 'Larva',       w: 42,  align: 'center', key: 'larvaCount'   },
      { label: 'Prepupa',     w: 48,  align: 'center', key: 'prepupaCount' },
      { label: 'Reject',      w: 42,  align: 'center', key: 'rejectCount'  },
      { label: 'Total',       w: 42,  align: 'center', key: 'totalCount'   },
      { label: 'Rate',        w: 38,  align: 'center', key: 'rate'         },
      { label: 'Durasi(s)',   w: 48,  align: 'center', key: 'durationSec'  },
      { label: 'Trigger',     w: 70,  align: 'left',   key: 'triggerSource'},
    ];
    const ROW_H = 18;

    const drawTableHeader = (y) => {
      drawRect(LEFT, y, W, ROW_H, C.secondary, 0);
      let x = LEFT;
      cols.forEach((col) => {
        txt(col.label, x + 3, y + 4,
          { bold: true, size: 7.5, color: C.white, width: col.w - 6, align: 'center' });
        x += col.w;
      });
      return y + ROW_H;
    };

    Y = drawTableHeader(Y);

    // ── Baris data ────────────────────────────────────────────────
    logs.forEach((log, idx) => {
      if (Y + ROW_H > doc.page.height - 60) {
        doc.addPage();
        Y = 40;
        Y = drawTableHeader(Y);
      }

      drawRect(LEFT, Y, W, ROW_H, idx % 2 === 0 ? C.white : C.accent, 0);

      doc.addContent(
        'q 0.3 w 0.741 0.741 0.741 RG ' +
        LEFT + ' ' + (Y + ROW_H) + ' m ' +
        (LEFT + W) + ' ' + (Y + ROW_H) + ' l S Q'
      );

      const rate = log.totalCount > 0
        ? (((log.larvaCount + log.prepupaCount) / log.totalCount) * 100).toFixed(1) + '%'
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
        txt(String(values[col.key] ?? '-'), x + 3, Y + 5, {
          size:  7.5,
          width: col.w - 6,
          align: col.align,
          color: col.key === 'rejectCount' && Number(values[col.key]) > 20
            ? '#C62828' : C.text,
        });
        x += col.w;
      });

      Y += ROW_H;
    });

    // ── Baris total ───────────────────────────────────────────────
    if (Y + ROW_H > doc.page.height - 60) { doc.addPage(); Y = 40; }

    drawRect(LEFT, Y, W, ROW_H, C.primary, 0);
    txt('TOTAL', LEFT + 3, Y + 5,
      { bold: true, size: 8, color: C.white, width: 220 });

    let totalX = LEFT + cols.slice(0, 4).reduce((s, c) => s + c.w, 0);
    [stats.totalLarva, stats.totalPrepupa, stats.totalReject, stats.totalHarvested]
      .forEach((val, i) => {
        txt(String(val), totalX + 3, Y + 5, {
          bold: true, size: 8, color: C.white,
          width: cols[4 + i].w - 6, align: 'center',
        });
        totalX += cols[4 + i].w;
      });
    Y += ROW_H + 16;

    // ── Statistik per Unit ────────────────────────────────────────
    const byUnit = logs.reduce((acc, log) => {
      if (!acc[log.unitId]) {
        acc[log.unitId] = { logs: [], peternak: log.user?.username || '-' };
      }
      acc[log.unitId].logs.push(log);
      return acc;
    }, {});

    if (Object.keys(byUnit).length > 1) {
      if (Y + 24 + Object.keys(byUnit).length * ROW_H > doc.page.height - 60) {
        doc.addPage();
        Y = 40;
      }

      txt('STATISTIK PER UNIT', LEFT, Y,
        { bold: true, size: 10, color: C.primary });
      Y += 16;

      const sCols = [
        { label: 'Unit ID',       w: 110 },
        { label: 'Peternak',      w: 110 },
        { label: 'Total Sesi',    w: 70  },
        { label: 'Total Larva',   w: 70  },
        { label: 'Total Prepupa', w: 80  },
        { label: 'Total Reject',  w: 70  },
        { label: 'Total Panen',   w: 70  },
        { label: 'Success Rate',  w: 75  },
      ];

      drawRect(LEFT, Y, W, ROW_H, C.secondary, 0);
      let sx = LEFT;
      sCols.forEach((col) => {
        txt(col.label, sx + 3, Y + 4,
          { bold: true, size: 7.5, color: C.white, width: col.w - 6, align: 'center' });
        sx += col.w;
      });
      Y += ROW_H;

      Object.entries(byUnit).forEach(([unitId, { logs: uLogs, peternak }], idx) => {
        const s = calcStats(uLogs);
        drawRect(LEFT, Y, W, ROW_H, idx % 2 === 0 ? C.white : C.accent, 0);
        doc.addContent(
          'q 0.3 w 0.741 0.741 0.741 RG ' +
          LEFT + ' ' + (Y + ROW_H) + ' m ' +
          (LEFT + W) + ' ' + (Y + ROW_H) + ' l S Q'
        );
        const vals = [
          unitId, peternak,
          s.totalSessions, s.totalLarva, s.totalPrepupa,
          s.totalReject, s.totalHarvested, s.successRate + '%',
        ];
        let vx = LEFT;
        sCols.forEach((col, i) => {
          txt(String(vals[i]), vx + 3, Y + 5, {
            size: 7.5, width: col.w - 6,
            align: i > 1 ? 'center' : 'left',
          });
          vx += col.w;
        });
        Y += ROW_H;
      });
    }

    doc.end();
  });

module.exports = { generateHarvestPdf };