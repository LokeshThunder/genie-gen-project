/**
 * ExportService - Cross-platform PDF & Excel export
 * Web:     triggers browser download via Blob URL
 * Android: writes to Documents, then opens native Share dialog
 */

import { Capacitor } from '@capacitor/core';

const isWeb = Capacitor.getPlatform() === 'web';

// ────────────────────────────────────────────────
// Shared worker data (replace with real API later)
// ────────────────────────────────────────────────
export const getWorkerReportData = (adminId = 'DEV_ADMIN_001') => {
  const allData = [];

  return allData.filter(d => d.ownerId === adminId);
};

// ────────────────────────────────────────────────
// Helper: trigger file download on browser
// ────────────────────────────────────────────────
function triggerWebDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ────────────────────────────────────────────────
// Helper: share file natively on Android
// ────────────────────────────────────────────────
async function shareNative(base64Data, filename, mimeType) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');

  // Write to app documents directory
  await Filesystem.writeFile({
    path: filename,
    data: base64Data,
    directory: Directory.Documents,
  });

  const fileUri = await Filesystem.getUri({
    path: filename,
    directory: Directory.Documents,
  });

  await Share.share({
    title: `Job Genie Report — ${filename}`,
    text: 'Complete worker activity report from Job Genie.',
    url: fileUri.uri,
    dialogTitle: 'Save or Share Report',
  });
}

// ────────────────────────────────────────────────
// EXCEL EXPORT
// ────────────────────────────────────────────────
export const exportExcel = async (data, summaryMetrics = {}) => {
  const { utils, write } = await import('xlsx');

  const reportDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // 1. Summary Sheet
  const summaryRows = [
    ['JOB GENIE — EXECUTIVE WORKFORCE SUMMARY'],
    [`Generated: ${reportDate}`],
    [],
    ['KEY PERFORMANCE INDICATORS'],
    ['Total Deployment',      data.length + ' Gigs'],
    ['Attendance Rate',       summaryMetrics.attendanceRate || '100%'],
    ['Total Operational Hours', data.reduce((s, r) => s + (parseFloat(r.hoursWorked) || 0), 0).toFixed(1) + ' hrs'],
    ['Net Payout Amount',     '₹' + (summaryMetrics.totalPayout || data.reduce((s, r) => s + r.dailyPay, 0)).toLocaleString('en-IN')],
    ['Compliance Score',      summaryMetrics.complianceScore || '98.5%'],
    [],
    ['DEPARTMENT BREAKDOWN'],
    ['Operations',            data.length],
    ['Logistics',             0],
    ['Support',               0]
  ];

  // 2. Worker Activity Sheet
  const headers = [
    'REPORT ID', 
    'WORKER NAME', 
    'GIG TITLE', 
    'DEPARTMENT', 
    'LOCATION/SITE', 
    'SHIFT START', 
    'SHIFT END', 
    'ACTUAL HOURS', 
    'PAYOUT (₹)', 
    'STATUS', 
    'COMPLIANCE'
  ];
  const rows = data.map(r => [
    r.id, 
    r.name, 
    r.role, 
    r.dept, 
    r.site, 
    r.checkIn, 
    r.checkOut, 
    r.hoursWorked, 
    r.dailyPay, 
    r.status, 
    r.compliance
  ]);

  const wb = utils.book_new();

  // Summary ws
  const wsSummary = utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 25 }];
  utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

  // Detail ws
  const wsDetail = utils.aoa_to_sheet([headers, ...rows]);
  wsDetail['!cols'] = headers.map(() => ({ wch: 20 }));
  utils.book_append_sheet(wb, wsDetail, 'Worker Activity Logs');

  const filename = `JobGenie_Master_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

  if (isWeb) {
    const buf = write(wb, { bookType: 'xlsx', type: 'array' });
    triggerWebDownload(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
  } else {
    const base64 = write(wb, { bookType: 'xlsx', type: 'base64' });
    await shareNative(base64, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }
};

// ────────────────────────────────────────────────
// PDF EXPORT
// ────────────────────────────────────────────────
export const exportPDF = async (data) => {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const reportDate = new Date().toLocaleDateString('en-IN');
  const pageW = doc.internal.pageSize.getWidth();

  // ── Header ──────────────────────────────────────
  doc.setFillColor(70, 71, 211);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('JOB GENIE — WORKFORCE INTELLIGENCE REPORT', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${reportDate}  |  Total Workers: ${data.length}`, 14, 22);

  // ── Summary bar ─────────────────────────────────
  doc.setFillColor(240, 238, 255);
  doc.rect(0, 30, pageW, 20, 'F');
  doc.setTextColor(70, 71, 211);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  const totalHours = data.reduce((s, r) => s + (parseFloat(r.hoursWorked) || 0), 0).toFixed(1);
  const totalPay   = data.reduce((s, r) => s + r.dailyPay, 0).toLocaleString('en-IN');
  const verified   = data.filter(r => r.compliance === 'Verified').length;

  doc.text(`Total Hours: ${totalHours}h`, 14, 42);
  doc.text(`Total Payout: ₹${totalPay}`, 80, 42);
  doc.text(`Compliance Verified: ${verified}/${data.length}`, 160, 42);

  // ── Table ─────────────────────────────────────
  const headers = ['ID', 'Name', 'Role', 'Dept', 'Site', 'Check-In', 'Check-Out', 'Hours', 'Pay (₹)', 'Status', 'Compliance'];
  const colX    = [14, 28, 60, 90, 118, 150, 170, 190, 204, 220, 252];
  const colW    = [14, 32, 30, 28, 32, 20, 20, 14, 16, 32, 26];

  let y = 60;

  // Header row
  doc.setFillColor(70, 71, 211);
  doc.rect(0, y - 6, pageW, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  headers.forEach((h, i) => doc.text(h, colX[i], y));

  // Data rows
  y += 6;
  data.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? [250, 244, 255] : [255, 255, 255];
    doc.setFillColor(...bg);
    doc.rect(0, y - 4, pageW, 9, 'F');

    doc.setTextColor(48, 41, 80);
    doc.setFont('helvetica', 'normal');
    const rowData = [row.id, row.name, row.role, row.dept, row.site, row.checkIn, row.checkOut, `${row.hoursWorked}h`, `${row.dailyPay}`, row.status, row.compliance];
    rowData.forEach((val, ci) => {
      const txt = String(val).length > 14 ? String(val).slice(0, 13) + '…' : String(val);
      doc.text(txt, colX[ci], y + 2);
    });

    // Status badge color
    if (row.status === 'PAYMENT SETTLED') {
      doc.setTextColor(22, 101, 52);
      doc.text('●', colX[9] - 4, y + 2);
    } else {
      doc.setTextColor(194, 65, 12);
      doc.text('●', colX[9] - 4, y + 2);
    }
    doc.setTextColor(48, 41, 80);
    y += 10;
  });

  // ── Footer ────────────────────────────────────
  doc.setFillColor(70, 71, 211);
  doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Confidential — Job Genie Operations Platform', 14, doc.internal.pageSize.getHeight() - 3);
  doc.text(`Page 1 of 1`, pageW - 30, doc.internal.pageSize.getHeight() - 3);

  const filename = `JobGenie_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

  if (isWeb) {
    doc.save(filename);
  } else {
    const base64 = doc.output('datauristring').split(',')[1];
    await shareNative(base64, filename, 'application/pdf');
  }
};
