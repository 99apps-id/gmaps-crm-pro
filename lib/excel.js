/**
 * Excel Exporter - GMaps CRM Pro (penulis XLSX mandiri, nol dependensi).
 * Kolom disesuaikan global: Negara, Tahapan CRM, Skor, Tindak Lanjut.
 */

import fs from 'node:fs';
import { buildXlsx } from './xlsx.js';

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
  { header: 'Nama Calon Pembeli', key: 'name', width: 32 },
  { header: 'Telepon', key: 'phone', width: 20 },
  { header: 'Kota', key: 'city', width: 18 },
  { header: 'Negara', key: 'country', width: 12 },
  { header: 'Jenis Usaha', key: 'category', width: 24 },
  { header: 'Tahapan', key: 'stage', width: 18 },
  { header: 'Skor (1-5)', key: 'score', width: 12 },
  { header: 'Tindak Lanjut Berikutnya', key: 'nextFollowUp', width: 22 },
  { header: 'Penanggung Jawab', key: 'owner', width: 18 },
  { header: 'Catatan', key: 'notes', width: 45 },
  { header: 'Jml Tindak Lanjut', key: 'actCount', width: 16 },
  { header: 'Tindak Lanjut Terakhir', key: 'lastAct', width: 45 }
];

const SUMMARY_COLUMNS = [
  { header: 'No', key: 'no', width: 6 },
  { header: 'Kota', key: 'city', width: 22 },
  { header: 'Negara', key: 'country', width: 12 },
  { header: 'Total Usaha', key: 'total', width: 16 },
  { header: 'Ada Nomor Telepon', key: 'withPhone', width: 20 },
  { header: 'Rata-rata Rating', key: 'avgRating', width: 18 }
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

function toRows(columns, objects) {
  return objects.map((o) => columns.map((c) => {
    const v = o[c.key];
    return v === null || v === undefined ? '' : v;
  }));
}

function sortFinder(records) {
  return [...records].sort((a, b) =>
    (a.category || '').localeCompare(b.category || '') ||
    (a.country || '').localeCompare(b.country || '') ||
    (a.city || '').localeCompare(b.city || '') ||
    (a.name || '').localeCompare(b.name || ''));
}

function finderObjects(records) {
  return sortFinder(records).map((item, idx) => ({
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
  }));
}

export async function exportFinderToExcel(records, outputPath) {
  const sorted = sortFinder(records);
  const cities = [...new Set(sorted.map((r) => r.city).filter(Boolean))];
  const used = new Set(['Semua Data']);
  const sheets = [{
    name: 'Semua Data',
    columns: FINDER_COLUMNS,
    rows: toRows(FINDER_COLUMNS, finderObjects(sorted))
  }];
  for (const city of cities) {
    const safe = sanitizeSheetName(city, used);
    used.add(safe);
    sheets.push({
      name: safe,
      columns: FINDER_COLUMNS,
      rows: toRows(FINDER_COLUMNS, finderObjects(sorted.filter((r) => r.city === city)))
    });
  }
  sheets.push({
    name: 'Ringkasan',
    columns: SUMMARY_COLUMNS,
    rows: toRows(SUMMARY_COLUMNS, cities.map((city, i) => {
      const rows = sorted.filter((r) => r.city === city);
      const withPhone = rows.filter((r) => Boolean(r.phone)).length;
      const ratings = rows.map((r) => r.rating).filter((r) => typeof r === 'number' && r > 0);
      return {
        no: i + 1,
        city,
        country: rows[0]?.country || '',
        total: rows.length,
        withPhone,
        avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : '-'
      };
    }))
  });
  fs.writeFileSync(outputPath, buildXlsx(sheets));
  return { totalRecords: sorted.length, citiesCount: cities.length, outputPath };
}

export async function exportCrmToExcel(leads, outputPath, activities = []) {
  const lastActByLead = {};
  const countByLead = {};
  for (const a of activities || []) {
    countByLead[a.leadId] = (countByLead[a.leadId] || 0) + 1;
    if (!lastActByLead[a.leadId] || String(a.at) > String(lastActByLead[a.leadId].at)) {
      lastActByLead[a.leadId] = a;
    }
  }
  const sorted = [...leads].sort((a, b) => (b.score || 0) - (a.score || 0) || (a.name || '').localeCompare(b.name || ''));
  const rows = toRows([{ header: 'No', width: 6 }, ...CRM_COLUMNS], sorted.map((l, idx) => {
    const last = lastActByLead[l.id];
    return {
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
      lastAct: last ? `${String(last.at).slice(0, 16).replace('T', ' ')} - ${last.text || ''}`.slice(0, 120) : ''
    };
  }));
  const columns = [{ header: 'No', width: 6 }, ...CRM_COLUMNS];
  fs.writeFileSync(outputPath, buildXlsx([{ name: 'Leads CRM', columns, rows }]));
  return { totalRecords: sorted.length, outputPath };
}
