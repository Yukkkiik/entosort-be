// src/utils/exportHelpers.js

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Makassar',
  });
};

const formatTrigger = (source) =>
  source === 'ir_sensor' ? 'Otomatis (IR)' : 'Manual';

/**
 * Hitung ringkasan statistik dari array harvest logs.
 */
const calcStats = (logs) => {
  const totalSessions  = logs.length;
  const totalLarva     = logs.reduce((s, l) => s + l.larvaCount,   0);
  const totalPrepupa   = logs.reduce((s, l) => s + l.prepupaCount, 0);
  const totalReject    = logs.reduce((s, l) => s + l.rejectCount,  0);
  const totalHarvested = logs.reduce((s, l) => s + l.totalCount,   0);
  const successRate    = totalHarvested > 0
    ? (((totalLarva + totalPrepupa) / totalHarvested) * 100).toFixed(1)
    : '0.0';

  return { totalSessions, totalLarva, totalPrepupa, totalReject, totalHarvested, successRate };
};

/**
 * Buat label periode dari filter.
 */
const periodLabel = ({ from, to }) => {
  if (!from && !to) return 'Semua waktu';
  if (from && to) return `${formatDate(from)} – ${formatDate(to)}`;
  if (from) return `Dari ${formatDate(from)}`;
  return `Sampai ${formatDate(to)}`;
};

module.exports = { formatDate, formatTrigger, calcStats, periodLabel };