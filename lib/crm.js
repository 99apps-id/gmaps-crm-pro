/**
 * CRM Leads Store - GMaps CRM Pro
 *
 * Penyimpanan file JSON lokal (tanpa database eksternal):
 * - leads: calon pembeli (dari Finder, import file, atau input manual)
 * - activities: riwayat tindak lanjut per lead
 * - templates: pola pesan siap pakai (bilingual)
 *
 * Dedup: placeId dulu, lalu nomor HP dinormalisasi + nama.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STAGES = [
  { id: 'baru', labelId: 'Baru', labelEn: 'New' },
  { id: 'dihubungi', labelId: 'Sudah Dihubungi', labelEn: 'Contacted' },
  { id: 'tindak_lanjut', labelId: 'Tindak Lanjut', labelEn: 'Follow-up' },
  { id: 'negosiasi', labelId: 'Negosiasi', labelEn: 'Negotiating' },
  { id: 'deal', labelId: 'Berhasil (Deal)', labelEn: 'Won' },
  { id: 'gagal', labelId: 'Gagal', labelEn: 'Lost' }
];

const CLOSED_STAGES = new Set(['deal', 'gagal']);

export function crmFilePath() {
  return process.env.CRM_FILE || path.join(__dirname, '..', 'crm-data.json');
}

function blankStore() {
  return { version: 1, leads: [], activities: [], templates: defaultTemplates() };
}

export function defaultTemplates() {
  return [
    {
      id: 'salam-kenal',
      nameId: 'Salam kenal',
      nameEn: 'Introduction',
      bodyId: 'Halo {nama}, saya {saya} dari {usaha}. Kami membantu {kategori} seperti {nama} mendapatkan lebih banyak pelanggan. Boleh saya kirim info singkatnya?',
      bodyEn: 'Hello {nama}, this is {saya} from {usaha}. We help businesses like {nama} get more customers. May I send you a short overview?'
    },
    {
      id: 'tindak-lanjut-1',
      nameId: 'Tindak lanjut 1',
      nameEn: 'Follow-up 1',
      bodyId: 'Halo {nama}, menindaklanjuti pesan saya sebelumnya. Apakah ada waktu 10 menit minggu ini untuk berdiskusi singkat?',
      bodyEn: 'Hello {nama}, following up on my previous message. Do you have 10 minutes this week for a short chat?'
    },
    {
      id: 'tindak-lanjut-2',
      nameId: 'Tindak lanjut 2',
      nameEn: 'Follow-up 2',
      bodyId: 'Halo {nama}, saya tutup file penawaran ini minggu depan. Masih berminat, atau saya hubungi lain waktu?',
      bodyEn: 'Hello {nama}, I will close this offer next week. Are you still interested, or should I reach out another time?'
    }
  ];
}

/** Normalisasi nomor HP: buang non-digit, 0 depan -> 62. */
export function normalizePhone(raw) {
  if (!raw) return '';
  let d = String(raw).replace(/[^0-9]/g, '');
  if (!d) return '';
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return d;
}

export function loadStore() {
  const file = crmFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (raw && Array.isArray(raw.leads)) {
        if (!Array.isArray(raw.activities)) raw.activities = [];
        if (!Array.isArray(raw.templates)) raw.templates = defaultTemplates();
        return raw;
      }
    }
  } catch { /* korup -> mulai baru */ }
  return blankStore();
}

export function saveStore(store) {
  fs.mkdirSync(path.dirname(crmFilePath()), { recursive: true });
  fs.writeFileSync(crmFilePath(), JSON.stringify(store, null, 2));
}

function leadKeys(lead) {
  const keys = [];
  if (lead.placeId) keys.push('pid:' + String(lead.placeId).toLowerCase());
  const phone = normalizePhone(lead.phone);
  const name = String(lead.name || '').trim().toLowerCase();
  if (phone && name) keys.push(`ph:${phone}|${name}`);
  // Nama saja (tanpa kontak) tetap didedup per kota agar import berulang
  // tidak menggandakan usaha yang sama.
  if (name) keys.push(`nm:${name}|${String(lead.city || '').trim().toLowerCase()}`);
  return keys;
}

/**
 * Masukkan hasil Finder ke CRM. Kembalikan {added, skipped}.
 * Hanya yang punya nama; tanpa kontak tetap diterima (stage Baru).
 */
export function importRecords(store, records, source = 'finder') {
  const seen = new Set();
  for (const l of store.leads) {
    for (const k of leadKeys(l)) seen.add(k);
  }
  let added = 0;
  let skipped = 0;
  const now = new Date().toISOString();
  for (const r of records || []) {
    if (!r || !r.name) { skipped++; continue; }
    const candidate = {
      placeId: r.placeId || '',
      phone: r.phone || '',
      name: String(r.name),
      city: r.city || ''
    };
    const keys = leadKeys(candidate);
    if (keys.length && keys.some((k) => seen.has(k))) { skipped++; continue; }
    const id = crypto.randomUUID();
    store.leads.push({
      id,
      name: String(r.name || ''),
      phone: r.phone || '',
      phoneNorm: normalizePhone(r.phone),
      address: r.address || '',
      city: r.city || '',
      country: r.country || 'ID',
      province: r.province || '',
      category: r.category || '',
      rating: typeof r.rating === 'number' ? r.rating : null,
      reviewsCount: Number(r.reviewsCount) || 0,
      mapsUrl: r.mapsUrl || '',
      website: r.website || '',
      lat: typeof r.lat === 'number' ? r.lat : null,
      lng: typeof r.lng === 'number' ? r.lng : null,
      placeId: r.placeId || '',
      source,
      stage: 'baru',
      tags: [],
      owner: '',
      score: Number(r.leadScore) || leadScoreFor(r),
      notes: '',
      nextFollowUp: null,
      createdAt: now,
      updatedAt: now
    });
    for (const k of keys) seen.add(k);
    added++;
  }
  return { added, skipped };
}

/** Skor prioritas 1-5: rating + ulasan + ada kontak. */
export function leadScoreFor(r) {
  let s = 2;
  if (typeof r?.rating === 'number' && r.rating >= 4.5) s += 1;
  if (Number(r?.reviewsCount) >= 50) s += 1;
  if (r?.phone) s += 1;
  return Math.max(1, Math.min(5, s));
}

export function getLead(store, id) {
  return store.leads.find((l) => l.id === id) || null;
}

export function updateLead(store, id, patch) {
  const lead = getLead(store, id);
  if (!lead) throw Object.assign(new Error('Lead tidak ditemukan'), { status: 404 });
  const allowed = ['name', 'phone', 'address', 'city', 'country', 'category', 'tags', 'owner', 'notes', 'nextFollowUp', 'score'];
  for (const k of allowed) {
    if (patch[k] !== undefined) lead[k] = patch[k];
  }
  if (patch.phone !== undefined) lead.phoneNorm = normalizePhone(patch.phone);
  lead.updatedAt = new Date().toISOString();
  return lead;
}

export function setStage(store, id, stageId, note = '') {
  const lead = getLead(store, id);
  if (!lead) throw Object.assign(new Error('Lead tidak ditemukan'), { status: 404 });
  if (!STAGES.some((s) => s.id === stageId)) {
    throw Object.assign(new Error('Tahapan tidak dikenal'), { status: 400 });
  }
  const from = lead.stage;
  lead.stage = stageId;
  if (CLOSED_STAGES.has(stageId)) lead.nextFollowUp = null;
  lead.updatedAt = new Date().toISOString();
  addActivity(store, id, 'stage', note || `Pindah dari ${from} ke ${stageId}`);
  return lead;
}

export function addActivity(store, leadId, type, text) {
  const lead = getLead(store, leadId);
  if (!lead) throw Object.assign(new Error('Lead tidak ditemukan'), { status: 404 });
  const act = {
    id: crypto.randomUUID(),
    leadId,
    type: String(type || 'note'),
    text: String(text || ''),
    at: new Date().toISOString()
  };
  store.activities.push(act);
  lead.updatedAt = act.at;
  return act;
}

export function activitiesFor(store, leadId) {
  return store.activities
    .filter((a) => a.leadId === leadId)
    .sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

/** Pengingat: ada jadwal tindak lanjut yang sudah lewat & belum closing. */
export function remindersDue(store, now = new Date()) {
  const t = now.getTime();
  return store.leads
    .filter((l) => l.nextFollowUp && !CLOSED_STAGES.has(l.stage) && new Date(l.nextFollowUp).getTime() <= t)
    .sort((a, b) => String(a.nextFollowUp).localeCompare(String(b.nextFollowUp)));
}

/** Pengingat 7 hari ke depan (termasuk yang lewat). */
export function remindersUpcoming(store, now = new Date(), days = 7) {
  const t = now.getTime();
  const end = t + days * 24 * 3600 * 1000;
  return store.leads
    .filter((l) => {
      if (!l.nextFollowUp || CLOSED_STAGES.has(l.stage)) return false;
      const ft = new Date(l.nextFollowUp).getTime();
      return ft <= end;
    })
    .sort((a, b) => String(a.nextFollowUp).localeCompare(String(b.nextFollowUp)));
}

export function funnelStats(store) {
  const counts = {};
  for (const s of STAGES) counts[s.id] = 0;
  for (const l of store.leads) {
    if (counts[l.stage] === undefined) counts[l.stage] = 0;
    counts[l.stage]++;
  }
  const total = store.leads.length;
  const won = counts.deal || 0;
  const contacted = total - (counts.baru || 0);
  return {
    total,
    byStage: counts,
    contacted,
    won,
    conversionPct: contacted > 0 ? Math.round((won / contacted) * 1000) / 10 : 0
  };
}

export function breakdown(store, field, top = 8) {
  const map = {};
  for (const l of store.leads) {
    const k = String(l[field] || 'Lainnya');
    map[k] = (map[k] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([name, count]) => ({ name, count }));
}

export function applyTemplate(tpl, vars, lang = 'id') {
  const body = lang === 'en' ? tpl.bodyEn : tpl.bodyId;
  return String(body || '').replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? ''));
}
