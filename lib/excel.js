/**
 * Excel Exporter - GMaps CRM Pro (reuse pola GMST).
 * Kolom disesuaikan global: Negara, Tahapan CRM, Skor, Tindak Lanjut.
 */

import ExcelJS from 'exceljs';

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF0F2A4A' }
};

const HEADER_FONT = {
  name: 'Calibri',
  size: 11,
  bold: true,
  color: { argb: 'FFFFFFFF' }
};

const BORDER_STYLE = {
  top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
};

const FINDER_COLUMNS = [
  { header: 'No', key: 'no', width: 6 },
  { header: 'Jenis Usaha', key: 'category', width: 24 },
  { header: 'Negara', key: 'country', width: 12 },
  { header: 'Wilayah', key: 'province', width: 20 },
  { header: 'Kota', key: 'city', width: 18 },
  { header: 'Nama Usaha', key: 'name', width: 36 },
  { header: 'Nomor Telepon', key: 'phone', width: 20 },
  { header: 'Alamat Lengkap', key: 'address', width: 55 },
  { header: 'Rating', key: 'rating', width: 10 },
  { header: 'Jumlah Ulasan', key: 'reviewsCount', width: 14 },
  { header: 'Website', key: 'website', width: 30 },
  { header: 'Link Google Maps', key: 'mapsUrl', width: 45 },
  { header: 'Koordinat', key: 'coordinates', width: 24 }
];

const CRM_COLUMNS = [
  { header: 'No', key: 'no', width: 6 },
  { header: 'Nama Calon Pembeli', key: 'name', width: 32 },
  { header: 'Telepon', key: 'phone', width: 20 },
  { header: 'Kota', key: 'city', width: 18 },
  { header: 'Negara', key: 'country', width: 12 },
  { header: 'Jenis Usaha', key: 'category', width: 24 },
  { header: 'Tahapan', key: 'stage', width: 18 },
  { header: 'Skor (1-5)', key: 'score', width: 12 },
  { header: 'Tindak Lanjut Berikutnya', key: 'nextFollowUp', width: 22 },
  { header: 'Penanggung Jawab', key: 'owner', width: 18 },
  { header: 'Catatan', key: 'notes', width: 45 }
];

function sanitizeSheetName(name, usedNames) {
  let safe = String(name || 'Lainnya').replace(/[:\\/?*[\]]/g, '-').trim().slice(0, 31) || 'Sheet';
  if (!usedNames.has(safe)) return safe;
  for (let i = 2; i < 100; i++) {
    const suffix = ` (${i})`;
    const candidate = (safe.slice(0, 31 - suffix.length) + suffix);
    if (!usedNames.has(candidate)) return candidate;
  }
  return safe;
}

function applyTableStyling(worksheet, rowCount, columns) {
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.border = BORDER_STYLE;
  });
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length }
  };
  for (let r = 2; r <= rowCount + 1; r++) {
    const row = worksheet.getRow(r);
    row.height = 22;
    if (r % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5FE' } };
      });
    }
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = BORDER_STYLE;
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  }
}

function fillFinderSheet(sheet, records) {
  const sorted = [...records].sort((a, b) =>
    (a.category || '').localeCompare(b.category || '') ||
    (a.country || '').localeCompare(b.country || '') ||
    (a.city || '').localeCompare(b.city || '') ||
    (a.name || '').localeCompare(b.name || ''));
  sorted.forEach((item, idx) => {
    sheet.addRow({
      no: idx + 1,
      category: item.category || '',
      country: item.country || '',
      province: item.province || '',
      city: item.city || '',
      name: item.name || '',
      phone: item.phone || '',
      address: item.address || '',
      rating: item.rating ?? '',
      reviewsCount: item.reviewsCount || 0,
      website: item.website || '',
      mapsUrl: item.mapsUrl || '',
      coordinates: item.lat && item.lng ? `${item.lat}, ${item.lng}` : ''
    });
  });
  applyTableStyling(sheet, sorted.length, FINDER_COLUMNS);
  return sorted;
}

export async function exportFinderToExcel(records, outputPath) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GMaps CRM Pro';
  workbook.created = new Date();

  const master = workbook.addWorksheet('Semua Data');
  master.columns = FINDER_COLUMNS;
  const sorted = fillFinderSheet(master, records);

  const cities = [...new Set(sorted.map((r) => r.city).filter(Boolean))];
  const used = new Set(['Semua Data']);
  for (const city of cities) {
    const safe = sanitizeSheetName(city, used);
    used.add(safe);
    const sh = workbook.addWorksheet(safe);
    sh.columns = FINDER_COLUMNS;
    fillFinderSheet(sh, sorted.filter((r) => r.city === city));
  }

  const summary = workbook.addWorksheet('Ringkasan');
  summary.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Kota', key: 'city', width: 22 },
    { header: 'Negara', key: 'country', width: 12 },
    { header: 'Total Usaha', key: 'total', width: 16 },
    { header: 'Ada Nomor Telepon', key: 'withPhone', width: 20 },
    { header: 'Rata-rata Rating', key: 'avgRating', width: 18 }
  ];
  cities.forEach((city, i) => {
    const rows = sorted.filter((r) => r.city === city);
    const withPhone = rows.filter((r) => Boolean(r.phone)).length;
    const ratings = rows.map((r) => r.rating).filter((r) => typeof r === 'number' && r > 0);
    summary.addRow({
      no: i + 1,
      city,
      country: rows[0]?.country || '',
      total: rows.length,
      withPhone,
      avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : '-'
    });
  });
  applyTableStyling(summary, cities.length, summary.columns);

  await workbook.xlsx.writeFile(outputPath);
  return { totalRecords: sorted.length, citiesCount: cities.length, outputPath };
}

export async function exportCrmToExcel(leads, outputPath, activities = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GMaps CRM Pro';
  workbook.created = new Date();

  const lastActByLead = {};
  const countByLead = {};
  for (const a of activities || []) {
    countByLead[a.leadId] = (countByLead[a.leadId] || 0) + 1;
    if (!lastActByLead[a.leadId] || String(a.at) > String(lastActByLead[a.leadId].at)) {
      lastActByLead[a.leadId] = a;
    }
  }

  const sheet = workbook.addWorksheet('Leads CRM');
  const cols = [...CRM_COLUMNS,
    { header: 'Jml Tindak Lanjut', key: 'actCount', width: 16 },
    { header: 'Tindak Lanjut Terakhir', key: 'lastAct', width: 45 }
  ];
  sheet.columns = cols;
  const sorted = [...leads].sort((a, b) => (b.score || 0) - (a.score || 0) || (a.name || '').localeCompare(b.name || ''));
  sorted.forEach((l, idx) => {
    const last = lastActByLead[l.id];
    sheet.addRow({
      no: idx + 1,
      name: l.name || '',
      phone: l.phone || '',
      city: l.city || '',
      country: l.country || '',
      category: l.category || '',
      stage: l.stage || 'baru',
      score: l.score ?? '',
      nextFollowUp: l.nextFollowUp || '',
      owner: l.owner || '',
      notes: l.notes || '',
      actCount: countByLead[l.id] || 0,
      lastAct: last ? `${last.at.slice(0, 16).replace('T', ' ')} - ${last.text || ''}`.slice(0, 120) : ''
    });
  });
  applyTableStyling(sheet, sorted.length, cols);
  await workbook.xlsx.writeFile(outputPath);
  return { totalRecords: sorted.length, outputPath };
}
