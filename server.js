/**
 * GMaps CRM Pro - Server (finder global + CRM leads, tanpa framework).
 * Engine Google RPC di-load lazy via scrape-runner (tidak dibundel ke klien).
 */

import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportFinderToExcel, exportCrmToExcel } from './lib/excel.js';
import { CATEGORY_SECTORS, COUNTRIES, cityMeta, keywordsForCategory, labelForCategory } from './lib/catalog.js';
import { getLicenseStatus, markOnboarded, activateLicenseOnline, validateSerial, loadLicenseState, deactivateLicense } from './lib/license.js';
import { executeScrapePlan, provinceForCity, countryForCity } from './lib/scrape-runner.js';
import { loadStore, saveStore, importRecords, getLead, updateLead, setStage, addActivity, activitiesFor, remindersDue, remindersUpcoming, funnelStats, breakdown, normalizePhone, STAGES, applyTemplate } from './lib/crm.js';
import { WEBHOOK_PATH, CLAIM_PATH, FINISH_PATH, verifySingapaySignature, fulfillPaymentLink, claimByReff, findLatestOrderAfter, normalizeLicenseEntries, normalizeRevoked, findPlanForSerial, paymentOptions, fetchVpsOrderByReff, fetchUpstreamPlans } from './lib/payment.js';

const ENGINE_MODE = (process.env.ENGINE_MODE || 'local').toLowerCase();
/** Engine GCRM HANYA di VPS (anti-jailbreak: klien tak pernah bawa engine). */
const ENGINE_URL = (process.env.ENGINE_URL || 'https://gmst.dewa.ai.id/api/gcrm').replace(/\/+$/, '');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3219;
const PUBLIC_DIR = path.join(__dirname, 'public');

let activeDataset = [];
let seenPlaceIds = new Set();
let sseClients = [];
let currentScrapeJob = null;
let crmStore = loadStore();

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_EXPORT_RECORDS = 50000;

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function readJsonBody(req, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = '';
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('Data yang dikirim terlalu besar'), { status: 413 }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error('Format data tidak valid'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function cleanStr(v, max = 80) {
  return String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

function csvCell(v) {
  if (v === null || v === undefined) return '""';
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try { client.write(payload); } catch { /* putus */ }
  });
}

function broadcastLog(text) { broadcastSSE({ type: 'log', text }); }
function broadcastProgress(percent, statusText, totalRecords) {
  broadcastSSE({ type: 'progress', percent, statusText, totalRecords });
}

const MAX_QUERIES_PER_CITY = 60;
const DEEP_QUALIFIERS_ID = ['murah', 'terbaik', 'terdekat'];
const DEEP_QUALIFIERS_EN = ['cheap', 'best', 'near me'];

function generateQueriesForCity(city, keyword, lang = 'id', opts = {}) {
  const cleanCity = String(city || '').trim();
  const primaryKw = String(keyword || '').trim();
  if (!cleanCity || !primaryKw) return [];
  const variants = Array.isArray(opts.keywordVariants)
    ? [...new Set(opts.keywordVariants.map((v) => String(v || '').trim()).filter((v) => v.length >= 2 && v.toLowerCase() !== primaryKw.toLowerCase()))].slice(0, 8)
    : [];
  const qualifiers = lang === 'en' ? DEEP_QUALIFIERS_EN : DEEP_QUALIFIERS_ID;
  const nearWord = lang === 'en' ? 'near' : 'dekat';
  const meta = cityMeta(cleanCity);
  const subs = (meta?.subDistricts || []).filter(Boolean);

  const queries = [];
  const push = (...items) => {
    for (const q of items) {
      const s = String(q || '').replace(/\s+/g, ' ').trim();
      if (s.length >= 3) queries.push(s);
    }
  };

  push(`${primaryKw} ${cleanCity}`);
  if (lang === 'id') {
    push(`${primaryKw} ${cleanCity} pusat`, `${primaryKw} terbaik ${cleanCity}`);
  } else {
    push(`best ${primaryKw} in ${cleanCity}`, `${primaryKw} ${cleanCity} center`);
  }
  for (const sub of subs) {
    push(`${primaryKw} ${sub} ${cleanCity}`);
    push(`${primaryKw} ${sub}`);
  }
  for (const q of qualifiers) {
    push(lang === 'en' ? `${primaryKw} ${q} ${cleanCity}` : `${primaryKw} ${q} ${cleanCity}`);
  }
  for (const v of variants) {
    push(`${v} ${cleanCity}`);
    for (const sub of subs.slice(0, 3)) push(`${v} ${sub} ${cleanCity}`);
  }
  push(`${primaryKw} ${nearWord} ${cleanCity}`);
  push(`${primaryKw} ${nearWord} station ${cleanCity}`);

  return [...new Set(queries)].slice(0, MAX_QUERIES_PER_CITY);
}

function buildScrapePlan({ keyword, keywordVariants = [], cities, depth = 2, lang = 'id' }) {
  const cityQueries = cities.map((city) => ({
    city,
    queries: generateQueriesForCity(city, keyword, lang, { keywordVariants })
  }));
  const totalQueries = cityQueries.reduce((a, c) => a + c.queries.length, 0);
  return { cityQueries, totalQueries, estPages: totalQueries * Math.max(1, depth) };
}

function validateScrapePayload(payload) {
  const keyword = cleanStr(payload?.keyword, 80);
  if (keyword.length < 2) throw Object.assign(new Error('Kata kunci minimal 2 karakter'), { status: 400 });
  let cities = payload?.cities;
  if (typeof cities === 'string') cities = [cities];
  if (!Array.isArray(cities) || cities.length === 0) throw Object.assign(new Error('Pilih minimal 1 wilayah'), { status: 400 });
  cities = [...new Set(cities.map((c) => cleanStr(c, 60)).filter((c) => c.length >= 2))].slice(0, 20);
  if (!cities.length) throw Object.assign(new Error('Nama wilayah tidak valid'), { status: 400 });
  let depth = parseInt(payload?.depth, 10);
  if (!Number.isFinite(depth)) depth = 2;
  depth = Math.max(1, Math.min(5, depth));
  const lang = payload?.lang === 'en' ? 'en' : 'id';
  let keywordVariants = payload?.keywordVariants;
  if (typeof keywordVariants === 'string') keywordVariants = [keywordVariants];
  if (!Array.isArray(keywordVariants)) keywordVariants = [];
  keywordVariants = [...new Set(keywordVariants.map((v) => cleanStr(v, 40)).filter((v) => v.length >= 2))]
    .filter((v) => v.toLowerCase() !== keyword.toLowerCase()).slice(0, 8);
  return { keyword, keywordVariants, cities, depth, lang };
}

async function proxyScrapeToEngine({ serial, job, plan }) {
  if (!ENGINE_URL) throw Object.assign(new Error('Server pencari belum dikonfigurasi.'), { status: 503 });
  const controller = new AbortController();
  const watcher = setInterval(() => { if (currentScrapeJob?.abort) controller.abort(); }, 500);
  try {
    const upstream = await fetch(`${ENGINE_URL}/api/engine/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serial, job }),
      signal: controller.signal
    });
    if (!upstream.ok || !upstream.body) {
      let msg = `Server pencari menolak (${upstream.status})`;
      try {
        const data = JSON.parse(await upstream.text());
        if (data?.error) msg = data.error;
      } catch { /* default */ }
      throw Object.assign(new Error(msg), { status: 502 });
    }
    broadcastLog(`Terhubung ke server pencari - ${plan.totalQueries} pencarian diproses.`);
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const raw = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        for (const line of raw.split('\n')) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          try {
            const obj = JSON.parse(t.slice(5).trim());
            if (obj?.type === 'new_batch' && Array.isArray(obj.items)) {
              for (const item of obj.items) {
                const key = item.placeId || `${String(item.name || '').toLowerCase()}_${String(item.city || '').toLowerCase()}`;
                if (!seenPlaceIds.has(key)) {
                  seenPlaceIds.add(key);
                  activeDataset.unshift(item);
                }
              }
            }
            broadcastSSE(obj);
          } catch { /* abaikan */ }
        }
      }
    }
  } finally {
    clearInterval(watcher);
  }
}

async function startScrapeJob(job) {
  if (currentScrapeJob?.running) {
    throw Object.assign(new Error('Pencarian lain sedang berjalan.'), { status: 409 });
  }
  currentScrapeJob = { abort: false, running: true };
  broadcastSSE({ type: 'status', running: true });
  const plan = job.cityQueries ? job : buildScrapePlan(job);
  try {
    const { newRecords, aborted } = await executeScrapePlan(
      { keyword: plan.keyword || job.keyword, cityQueries: plan.cityQueries, depth: plan.depth || job.depth },
      {
        dataset: activeDataset,
        seen: seenPlaceIds,
        onLog: broadcastLog,
        onProgress: broadcastProgress,
        onBatch: (items) => broadcastSSE({ type: 'new_batch', items }),
        shouldAbort: () => currentScrapeJob.abort
      }
    );
    const wasAborted = aborted || currentScrapeJob.abort;
    broadcastProgress(100, 'Selesai!', activeDataset.length);
    broadcastLog(wasAborted
      ? `Dihentikan. Dapat ${newRecords.length} usaha baru sebelum berhenti.`
      : `Selesai. Dapat ${newRecords.length} usaha baru.`);
    broadcastSSE({ type: 'status', running: false, finished: true });
  } catch (err) {
    broadcastLog(`Kendala saat mencari: ${err.message}`);
    broadcastSSE({ type: 'status', running: false, error: err.message });
  } finally {
    if (currentScrapeJob) currentScrapeJob.running = false;
  }
}

function planDurationForSerial(serial) {
  const needle = String(serial || '').trim().toUpperCase();
  const files = [process.env.PAYMENT_STORE_FILE || null, path.join(__dirname, 'licenses.json')].filter(Boolean);
  const hit = findPlanForSerial(needle, files);
  if (hit?.days) return { plan: hit.plan, durationDays: hit.days };
  return null;
}

// ---------------------------------------------------------------------------
// VPS ENGINE (ENGINE_MODE=engine): eksekusi scraping di server vendor.
// Klien paket (ENGINE_MODE=client) mem-proxy ke sini; engine & secret
// tidak pernah dikirim ke aplikasi yang diedarkan.
// GCRM engine WAJIB serial terdaftar (ENGINE_REQUIRE_SERIAL=1): tanpa
// serial valid, jailbreak/bongkar aplikasi tetap tidak bisa memakai engine.
// ---------------------------------------------------------------------------

function readEngineAllowlist() {
  const candidates = [
    process.env.ENGINE_ALLOWLIST_FILE || null,
    path.join(__dirname, 'licenses.json'),
    process.env.LICENSE_ALLOWLIST || null,
    process.env.PAYMENT_STORE_FILE || null
  ].filter(Boolean);
  for (const f of candidates) {
    try {
      if (fs.existsSync(f)) {
        const data = JSON.parse(fs.readFileSync(f, 'utf8'));
        if (Array.isArray(data.licenses)) {
          const entries = normalizeLicenseEntries(data);
          return {
            licenses: new Set(entries.map((e) => e.serial)),
            revoked: normalizeRevoked(data),
            entries
          };
        }
      }
    } catch { /* abaikan, lanjut kandidat berikut */ }
  }
  return null;
}

function authorizeEngineSerial(serial) {
  const s = String(serial || '').trim();
  // Tanpa serial = trial dengan caps ketat + rate limit (anti-abuse).
  // Set ENGINE_REQUIRE_SERIAL=1 bila VPS hanya untuk pelanggan aktivasi.
  if (!s) {
    if (process.env.ENGINE_REQUIRE_SERIAL === '1') {
      throw Object.assign(new Error('Aktivasi diperlukan untuk memakai engine GCRM.'), { status: 403, code: 'ENGINE_AUTH' });
    }
    return { trial: true, listed: false };
  }
  const check = validateSerial(s);
  if (!check.ok) {
    throw Object.assign(new Error(`Serial ditolak (${check.reason})`), { status: 403, code: 'ENGINE_AUTH' });
  }
  const needle = s.toUpperCase();
  const list = readEngineAllowlist();
  if (list) {
    if (list.revoked.has(needle)) {
      throw Object.assign(new Error('Serial telah dicabut (revoked).'), { status: 403, code: 'ENGINE_REVOKED' });
    }
    const strict = process.env.ENGINE_STRICT === '1';
    if (strict && !list.licenses.has(needle)) {
      throw Object.assign(new Error('Serial tidak terdaftar di VPS.'), { status: 403, code: 'ENGINE_NOT_LISTED' });
    }
    return { trial: false, listed: list.licenses.has(needle) };
  }
  return { trial: false, listed: true };
}

// Rate limit per IP untuk job trial (anti-abuse VPS). Serial terdaftar bebas.
const engineTrialHits = new Map();
function checkEngineTrialLimit(ip) {
  const maxPerHour = Math.max(1, parseInt(process.env.ENGINE_TRIAL_PER_HOUR || '5', 10) || 5);
  const now = Date.now();
  const rec = engineTrialHits.get(ip);
  if (!rec || now > rec.resetAt) {
    engineTrialHits.set(ip, { count: 1, resetAt: now + 3600 * 1000 });
    return true;
  }
  rec.count++;
  if (rec.count > maxPerHour) return false;
  if (engineTrialHits.size > 5000 && Math.random() < 0.01) {
    for (const [k, v] of engineTrialHits) if (now > v.resetAt) engineTrialHits.delete(k);
  }
  return true;
}

function engineClientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (/^[0-9a-fA-F:.]{3,45}$/.test(fwd)) return fwd;
  return req.socket?.remoteAddress || 'unknown';
}

const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);
  let urlObj;
  try {
    urlObj = new URL(req.url, `http://${req.headers.host}`);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }
  const pathname = urlObj.pathname;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (pathname === '/api/health' && req.method === 'GET') {
    const lic = getLicenseStatus();
    return json(res, 200, {
      ok: true,
      app: 'gmaps-crm-pro',
      total: activeDataset.length,
      leads: crmStore.leads.length,
      scraping: Boolean(currentScrapeJob?.running),
      token: process.env.GCRM_TOKEN || null,
      license: { activated: lic.activated, expired: lic.expired, blocked: lic.blocked, daysLeft: lic.daysLeft, hoursLeft: lic.hoursLeft }
    });
  }

  if (pathname === '/api/scrape/stream') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('data: {"type":"connected"}\n\n');
    sseClients.push(res);
    const hb = setInterval(() => { try { res.write(': ping\n\n'); } catch { /* closed */ } }, 25000);
    req.on('close', () => { clearInterval(hb); sseClients = sseClients.filter((c) => c !== res); });
    return;
  }

  if (pathname === '/api/catalog' && req.method === 'GET') {
    return json(res, 200, { sectors: CATEGORY_SECTORS, countries: COUNTRIES });
  }

  if (pathname === '/api/finder/data' && req.method === 'GET') {
    return json(res, 200, { total: activeDataset.length, records: activeDataset });
  }

  if (pathname === '/api/license/status' && req.method === 'GET') {
    return json(res, 200, getLicenseStatus());
  }

  if (pathname === '/api/license/onboard' && req.method === 'POST') {
    try {
      await readJsonBody(req);
      return json(res, 200, { success: true, status: markOnboarded() });
    } catch (err) {
      return json(res, err.status || 400, { error: err.message });
    }
  }

  if (pathname === '/api/license/deactivate' && req.method === 'POST') {
    try {
      await readJsonBody(req);
      return json(res, 200, { success: true, status: deactivateLicense() });
    } catch (err) {
      return json(res, err.status || 400, { error: err.message });
    }
  }

  if (pathname === '/api/license/activate' && req.method === 'POST') {
    try {
      const payload = await readJsonBody(req);
      const serial = String(payload?.serial || '').trim();
      if (!serial) throw Object.assign(new Error('Kode aktivasi wajib diisi'), { status: 400 });
      const planOpts = planDurationForSerial(serial) || {};
      const result = await activateLicenseOnline(serial, new Date(), planOpts);
      return json(res, 200, result);
    } catch (err) {
      return json(res, err.status || 400, { error: err.message, code: err.code || 'ACTIVATE_FAILED' });
    }
  }

  if (pathname === '/api/payment/options' && req.method === 'GET') {
    const local = paymentOptions();
    // URL checkout live ikut VPS bila lokal kosong (rotasi cukup sekali di VPS).
    if (local.every((p) => !p.url)) {
      const upstream = await fetchUpstreamPlans().catch(() => null);
      if (upstream?.length) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' });
        res.end(JSON.stringify({ currency: 'IDR', claimUrl: CLAIM_PATH, plans: upstream }));
        return;
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' });
    res.end(JSON.stringify({ currency: 'IDR', claimUrl: CLAIM_PATH, plans: local }));
    return;
  }

  if (pathname === '/api/payment/auto-activate' && req.method === 'POST') {
    try {
      const payload = await readJsonBody(req);
      const reff = String(payload?.reff || '').trim();
      const since = String(payload?.since || '').trim();
      let order = null;
      if (reff) order = claimByReff(reff);
      else if (since) order = findLatestOrderAfter(since);
      // Klien tak menerima webhook: butir reff dicarikan ke VPS (klaim).
      if (!order?.serial && reff && ENGINE_MODE === 'client') {
        const remote = await fetchVpsOrderByReff(reff).catch(() => null);
        if (remote?.serial) order = remote;
      }
      if (!order?.serial) {
        return json(res, 200, { found: false, message: 'Pembayaran belum ditemukan atau masih diproses' });
      }
      const planOpts = { plan: order.plan || 'berbayar', durationDays: order.days || 1 };
      const activateRes = await activateLicenseOnline(order.serial, new Date(), planOpts);
      return json(res, 200, { found: true, serial: order.serial, plan: order.plan, days: order.days, status: activateRes.status });
    } catch (err) {
      return json(res, err.status || 500, { found: false, error: err.message });
    }
  }

  // Halaman finish lokal (cadangan bila dibuka manual di mesin yang sama).
  // Catatan: dashboard payment hanya menerima success_redirect_url statis
  // (menolak localhost & placeholder dinamis), jadi arsitektur resmi:
  // success_redirect = halaman klaim VPS (statis, di bawah) yang berisi
  // tombol deep-link gmaps-crm-pro://activate?serial=... (1 klik aktif).
  if (pathname === FINISH_PATH && req.method === 'GET') {
    const ref = String(urlObj.searchParams.get('ref') || urlObj.searchParams.get('reff_no') || '').trim();
    const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    let inner;
    if (!ref) {
      inner = `<p class="missing">Nomor referensi tidak terbawa. Tempel manual di aplikasi.</p>`;
    } else {
      let order = claimByReff(ref);
      if (!order?.serial) {
        const remote = await fetchVpsOrderByReff(ref).catch(() => null);
        if (remote?.serial) order = remote;
      }
      if (order?.serial) {
        try {
          const activateRes = await activateLicenseOnline(order.serial, new Date(), { plan: order.plan || 'berbayar', durationDays: order.days || 1 });
          inner = `<p>Pembayaran terkonfirmasi (paket <b>${esc(order.plan || 'berbayar')}</b>).</p>
            <p class="ok">Aplikasi sudah AKTIF otomatis. Silakan kembali ke GMaps CRM Pro.</p>
            <p>Kode aktivasi: <span class="serial">${esc(order.serial)}</span></p>`;
        } catch (err) {
          inner = `<p class="missing">Aktivasi gagal: ${esc(err.message)}</p>
            <p>Kode Anda: <span class="serial">${esc(order.serial)}</span> - tempel manual di aplikasi.</p>`;
        }
      } else {
        inner = `<p class="missing">Referensi ${esc(ref)} belum tercatat (webhook mungkin terlambat). Tunggu sebentar lalu muat ulang.</p>`;
      }
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pembayaran Berhasil</title><style>body{font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;display:flex;justify-content:center;padding:2rem 1rem}main{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.5rem;max-width:440px;width:100%}.serial{font-family:monospace;font-weight:800;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:.4rem .6rem}.ok{color:#047857;font-weight:700}.missing{color:#be123c}</style></head><body><main><h1>Pembayaran Berhasil</h1>${inner}</main></body></html>`);
    return;
  }

  if (pathname === WEBHOOK_PATH && req.method === 'POST') {
    const secret = process.env.SINGAPAY_CLIENT_SECRET || '';
    if (!secret) return json(res, 503, { status: 'error', message: 'Payment belum dikonfigurasi' });
    try {
      const rawBody = await new Promise((resolve, reject) => {
        let size = 0;
        let body = '';
        req.on('data', (chunk) => {
          size += chunk.length;
          if (size > MAX_BODY_BYTES) { reject(Object.assign(new Error('Payload terlalu besar'), { status: 413 })); req.destroy(); return; }
          body += chunk;
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
      });
      const headers = {};
      for (const [k, v] of Object.entries(req.headers)) headers[k.toLowerCase()] = v;
      if (!verifySingapaySignature({ rawBody, headers, clientSecret: secret, endpointPath: urlObj.pathname })) {
        return json(res, 401, { status: 'error', message: 'Invalid signature' });
      }
      let payload;
      try { payload = JSON.parse(rawBody); } catch {
        return json(res, 400, { status: 'error', message: 'Body JSON tidak valid' });
      }
      const result = fulfillPaymentLink(payload);
      console.log(`[Payment] ${result.plan} ${result.serial} (reff ${result.reff_no}${result.reused ? ', duplikat' : ''})`);
      return json(res, 200, { status: 'success', plan: result.plan, days: result.days });
    } catch (err) {
      return json(res, err.status === 422 ? 422 : 500, { status: 'error', message: err.message });
    }
  }

  // Halaman klaim kode aktivasi. Dipakai sebagai success_redirect_url
  // STATIS payment link (dashboard menolak localhost/placeholder):
  //   https://gmst.dewa.ai.id/api/gcrm/api/payment/claim
  // - Mode client (aplikasi user): redirect 302 ke halaman klaim VPS.
  // - Mode engine GCRM (GCRM_BRAND=1): render tombol deep-link 1-klik
  //   gmaps-crm-pro://activate?serial=... + salin manual sebagai cadangan.
  if (pathname === CLAIM_PATH && req.method === 'GET') {
    const VPS_CLAIM = 'https://gmst.dewa.ai.id/api/gcrm/api/payment/claim';
    if (ENGINE_MODE === 'client') {
      const ref = String(urlObj.searchParams.get('ref') || '').trim();
      res.writeHead(302, { Location: ref ? `${VPS_CLAIM}?ref=${encodeURIComponent(ref)}` : VPS_CLAIM });
      res.end();
      return;
    }
    const GCRM_BRAND = process.env.GCRM_BRAND === '1';
    const ref = String(urlObj.searchParams.get('ref') || '').trim();
    const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const css = `body{font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;display:flex;justify-content:center;padding:2rem 1rem}main{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.5rem;max-width:440px;width:100%}.serial{font-family:monospace;font-size:1.25rem;font-weight:800;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:.7rem;text-align:center}.btn{display:block;text-align:center;background:#0f2a4a;color:#fff;border-radius:8px;padding:.8rem;font-weight:800;text-decoration:none;margin:.8rem 0}.missing{color:#be123c}input{width:100%;padding:.55rem;border:1px solid #cbd5e1;border-radius:6px;font-size:.9rem;margin:.5rem 0;box-sizing:border-box}button{background:#0f2a4a;color:#fff;border:none;border-radius:6px;padding:.55rem 1rem;font-weight:700;cursor:pointer}`;
    const title = GCRM_BRAND ? 'Klaim Kode Aktivasi - GMaps CRM Pro' : 'Klaim Kode Aktivasi';
    let inner;
    if (!ref) {
      inner = `<p>Masukkan nomor referensi pembayaran dari struk pembayaran Anda:</p>
        <form method="GET" action="${CLAIM_PATH}">
          <input name="ref" placeholder="cth: 18917720251110094037705" autocomplete="off" />
          <button type="submit">Tampilkan Kode</button>
        </form>`;
    } else {
      const rec = claimByReff(ref);
      if (rec) {
        const deep = `gmaps-crm-pro://activate?serial=${encodeURIComponent(rec.serial)}`;
        inner = `<p>Pembayaran terkonfirmasi (paket <b>${esc(rec.plan)}</b>, ${rec.days} hari).</p>
           <p>Kode aktivasi Anda:</p><div class="serial">${esc(rec.serial)}</div>` +
          (GCRM_BRAND
            ? `<a class="btn" href="${esc(deep)}">Aktifkan Otomatis di Aplikasi</a>
               <p><small>Belum terinstal? <a href="https://github.com/99apps-id/gmaps-crm-pro/releases/latest">Unduh GMaps CRM Pro</a>, lalu tempel kode di menu Lisensi.</small></p>`
            : `<p>Salin kode ke aplikasi: Pengaturan - Lisensi - Aktivasi.</p>`);
      } else {
        inner = `<p class="missing">Referensi tidak ditemukan. Hubungi support@99apps.id.</p><p><a href="${CLAIM_PATH}">Coba lagi</a></p>`;
      }
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${css}</style></head><body><main><h1>${esc(title)}</h1>${inner}</main></body></html>`);
    return;
  }

  // VPS ENGINE: verifikasi serial tanpa membocorkan daftar (ya/tidak saja).
  // GET /api/license/verify?serial=GMST-... -> {valid, plan, days}
  if (pathname === '/api/license/verify' && req.method === 'GET' && ENGINE_MODE === 'engine') {
    const serial = String(urlObj.searchParams.get('serial') || '').trim();
    let valid = false;
    let plan = null;
    let days = null;
    try {
      if (serial) {
        authorizeEngineSerial(serial);
        valid = true;
        const pd = planDurationForSerial(serial);
        if (pd) { plan = pd.plan; days = pd.durationDays; }
      }
    } catch { valid = false; }
    return json(res, 200, { valid, plan, days });
  }

  // VPS ENGINE RUN (hanya ENGINE_MODE=engine) - eksekusi di server vendor.
  if (pathname === '/api/engine/run' && req.method === 'POST') {
    if (ENGINE_MODE !== 'engine') {
      return json(res, 404, { error: 'Engine tidak aktif di server ini.' });
    }
    try {
      const payload = await readJsonBody(req);
      const serial = String(payload?.serial || '').trim();
      const auth = authorizeEngineSerial(serial);
      const rawJob = payload?.job || {};
      const job = validateScrapePayload(rawJob);
      // Batas anti-abuse: trial (tanpa serial) & serial tak terdaftar.
      const list = readEngineAllowlist();
      const allowlistConfigured = Boolean(
        process.env.ENGINE_ALLOWLIST_FILE || process.env.LICENSE_ALLOWLIST || process.env.PAYMENT_STORE_FILE ||
        fs.existsSync(path.join(__dirname, 'licenses.json'))
      );
      if (!list && allowlistConfigured) {
        throw Object.assign(new Error('Daftar lisensi VPS tak tersedia, coba lagi.'), { status: 503, code: 'ENGINE_ALLOWLIST' });
      }
      const listed = auth.listed || (list ? list.licenses.has(serial.toUpperCase()) : true);
      if (!listed) {
        if (auth.trial) {
          const ip = engineClientIp(req);
          if (!checkEngineTrialLimit(ip)) {
            throw Object.assign(new Error('Batas trial VPS tercapai (maksimal 5 job/jam). Aktivasi untuk tanpa batas.'), { status: 429, code: 'ENGINE_RATE_LIMIT' });
          }
        }
        job.depth = Math.min(job.depth, 1);
        job.cities = job.cities.slice(0, 2);
        job.keywordVariants = [];
      }
      const plan = buildScrapePlan(job);
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      const send = (obj) => { try { res.write(`data: ${JSON.stringify(obj)}\n\n`); } catch { /* putus */ } };
      let aborted = false;
      req.on('close', () => { aborted = true; });
      const dataset = [];
      const seen = new Set();
      send({ type: 'status', running: true });
      try {
        await executeScrapePlan(
          { keyword: job.keyword, cityQueries: plan.cityQueries, depth: job.depth },
          {
            dataset,
            seen,
            onLog: (text) => send({ type: 'log', text }),
            onProgress: (percent, statusText, totalRecords) => send({ type: 'progress', percent, statusText, totalRecords }),
            onBatch: (items) => send({ type: 'new_batch', items }),
            shouldAbort: () => aborted
          }
        );
        send({ type: 'progress', percent: 100, statusText: 'Selesai', totalRecords: dataset.length });
        send({ type: 'status', running: false, finished: true });
      } catch (err) {
        send({ type: 'log', text: `Error engine: ${err.message}` });
        send({ type: 'status', running: false, error: err.message });
      }
      res.end();
    } catch (err) {
      if (!res.headersSent) return json(res, err.status || 400, { error: err.message, code: err.code || 'ENGINE_FAILED' });
      try { res.end(); } catch { /* abaikan */ }
    }
    return;
  }

  if (pathname === '/api/finder/start' && req.method === 'POST') {
    if (process.env.DISABLE_ENGINE === '1') {
      return json(res, 403, {
        error: 'Modul pencarian dinonaktifkan (integritas aplikasi tidak valid). Instal ulang dari sumber resmi.',
        code: 'ENGINE_DISABLED'
      });
    }
    const lic = getLicenseStatus();
    if (lic.blocked) {
      return json(res, 403, {
        error: 'Masa coba gratis 1 hari telah habis. Masukkan kode aktivasi untuk melanjutkan.',
        code: 'LICENSE_REQUIRED',
        license: { expired: lic.expired, daysLeft: lic.daysLeft, hoursLeft: lic.hoursLeft }
      });
    }
    try {
      const payload = await readJsonBody(req);
      const job = validateScrapePayload(payload);
      if (currentScrapeJob?.running) return json(res, 409, { error: 'Pencarian lain sedang berjalan.' });
      const plan = buildScrapePlan(job);
      json(res, 200, {
        success: true,
        scope: { keyword: job.keyword, cities: job.cities.length, totalQueries: plan.totalQueries, estPages: plan.estPages, depth: job.depth, lang: job.lang, engine: ENGINE_MODE === 'client' ? 'server' : 'lokal' }
      });
      if (ENGINE_MODE === 'client') {
        const licNow = getLicenseStatus();
        let licState = null;
        try { licState = loadLicenseState(); } catch { /* abaikan */ }
        currentScrapeJob = { abort: false, running: true };
        broadcastSSE({ type: 'status', running: true });
        const effJob = { ...job };
        if (!licNow.activated) {
          effJob.depth = 1;
          effJob.cities = effJob.cities.slice(0, 2);
          effJob.keywordVariants = [];
          broadcastLog('Mode coba gratis: dibatasi 2 wilayah, kedalaman 1. Aktivasi untuk hasil penuh.');
        }
        const effPlan = buildScrapePlan(effJob);
        proxyScrapeToEngine({ serial: licState?.activated?.serial || '', job: effJob, plan: effPlan })
          .catch((err) => {
            broadcastLog(`Kendala server pencari: ${err.message}`);
            broadcastSSE({ type: 'status', running: false, error: err.message });
          })
          .finally(() => { if (currentScrapeJob) currentScrapeJob.running = false; });
      } else {
        startScrapeJob({ ...job, cityQueries: plan.cityQueries }).catch((err) => broadcastLog(`Kendala: ${err.message}`));
      }
    } catch (err) {
      return json(res, err.status || 400, { error: err.message });
    }
    return;
  }

  if (pathname === '/api/finder/stop' && req.method === 'POST') {
    if (currentScrapeJob?.running) {
      currentScrapeJob.abort = true;
      return json(res, 200, { success: true });
    }
    return json(res, 200, { success: false, message: 'Tidak ada pencarian aktif' });
  }

  // ---- CRM API ----
  if (pathname === '/api/crm/import' && req.method === 'POST') {
    const lic = getLicenseStatus();
    if (lic.blocked) return json(res, 403, { error: 'Masa coba habis. Aktivasi untuk mengelola leads.', code: 'LICENSE_REQUIRED' });
    try {
      const payload = await readJsonBody(req);
      const result = importRecords(crmStore, payload?.records, payload?.source || 'finder');
      saveStore(crmStore);
      return json(res, 200, { success: true, ...result, total: crmStore.leads.length });
    } catch (err) {
      return json(res, err.status || 400, { error: err.message });
    }
  }

  if (pathname === '/api/crm/leads' && req.method === 'GET') {
    const stage = String(urlObj.searchParams.get('stage') || '');
    const q = String(urlObj.searchParams.get('q') || '').toLowerCase();
    let leads = crmStore.leads;
    if (stage) leads = leads.filter((l) => l.stage === stage);
    if (q) {
      leads = leads.filter((l) =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.category || '').toLowerCase().includes(q));
    }
    return json(res, 200, { total: leads.length, leads });
  }

  if (pathname === '/api/crm/leads' && req.method === 'POST') {
    const lic = getLicenseStatus();
    if (lic.blocked) return json(res, 403, { error: 'Masa coba habis. Aktivasi untuk menambah leads.', code: 'LICENSE_REQUIRED' });
    try {
      const payload = await readJsonBody(req);
      if (!payload?.name || !String(payload.name).trim()) {
        return json(res, 400, { error: 'Nama pelanggan wajib diisi' });
      }
      const result = importRecords(crmStore, [payload], 'manual');
      saveStore(crmStore);
      return json(res, 200, { success: true, ...result });
    } catch (err) {
      return json(res, err.status || 400, { error: err.message });
    }
  }

  const leadMatch = pathname.match(/^\/api\/crm\/leads\/([^/]+)(\/(stage|activities))?$/);
  if (leadMatch) {
    const leadId = decodeURIComponent(leadMatch[1]);
    const sub = leadMatch[3];
    if (req.method === 'GET' && !sub) {
      const lead = getLead(crmStore, leadId);
      if (!lead) return json(res, 404, { error: 'Lead tidak ditemukan' });
      return json(res, 200, { lead, activities: activitiesFor(crmStore, leadId) });
    }
    if ((req.method === 'PUT' || req.method === 'PATCH') && !sub) {
      const lic = getLicenseStatus();
      if (lic.blocked) return json(res, 403, { error: 'Masa coba habis.', code: 'LICENSE_REQUIRED' });
      try {
        const payload = await readJsonBody(req);
        const lead = updateLead(crmStore, leadId, payload);
        saveStore(crmStore);
        return json(res, 200, { success: true, lead });
      } catch (err) {
        return json(res, err.status || 400, { error: err.message });
      }
    }
    if (req.method === 'POST' && sub === 'stage') {
      const lic = getLicenseStatus();
      if (lic.blocked) return json(res, 403, { error: 'Masa coba habis.', code: 'LICENSE_REQUIRED' });
      try {
        const payload = await readJsonBody(req);
        const lead = setStage(crmStore, leadId, String(payload?.stage || ''), String(payload?.note || ''));
        saveStore(crmStore);
        return json(res, 200, { success: true, lead });
      } catch (err) {
        return json(res, err.status || 400, { error: err.message });
      }
    }
    if (req.method === 'POST' && sub === 'activities') {
      const lic = getLicenseStatus();
      if (lic.blocked) return json(res, 403, { error: 'Masa coba habis.', code: 'LICENSE_REQUIRED' });
      try {
        const payload = await readJsonBody(req);
        const act = addActivity(crmStore, leadId, payload?.type, payload?.text);
        saveStore(crmStore);
        return json(res, 200, { success: true, activity: act });
      } catch (err) {
        return json(res, err.status || 400, { error: err.message });
      }
    }
  }

  if (pathname === '/api/crm/reminders' && req.method === 'GET') {
    const days = Math.max(1, Math.min(30, parseInt(urlObj.searchParams.get('days') || '7', 10) || 7));
    return json(res, 200, {
      due: remindersDue(crmStore),
      upcoming: remindersUpcoming(crmStore, new Date(), days)
    });
  }

  if (pathname === '/api/crm/stats' && req.method === 'GET') {
    return json(res, 200, {
      funnel: funnelStats(crmStore),
      byCity: breakdown(crmStore, 'city'),
      byCategory: breakdown(crmStore, 'category'),
      stages: STAGES
    });
  }

  if (pathname === '/api/crm/templates' && req.method === 'GET') {
    const lang = urlObj.searchParams.get('lang') === 'en' ? 'en' : 'id';
    return json(res, 200, {
      templates: crmStore.templates.map((t) => ({
        id: t.id,
        name: lang === 'en' ? t.nameEn : t.nameId,
        body: lang === 'en' ? t.bodyEn : t.bodyId
      }))
    });
  }

  if (pathname === '/api/crm/render-template' && req.method === 'POST') {
    try {
      const payload = await readJsonBody(req);
      const tpl = crmStore.templates.find((t) => t.id === payload?.templateId);
      if (!tpl) return json(res, 404, { error: 'Pola pesan tidak ditemukan' });
      const lead = payload?.leadId ? getLead(crmStore, payload.leadId) : null;
      return json(res, 200, {
        text: applyTemplate(tpl, {
          nama: lead?.name || payload?.nama || '',
          saya: payload?.saya || '',
          usaha: payload?.usaha || '',
          kategori: lead?.category || payload?.kategori || labelForCategory(lead?.category || '', payload?.lang) || ''
        }, payload?.lang === 'en' ? 'en' : 'id')
      });
    } catch (err) {
      return json(res, err.status || 400, { error: err.message });
    }
  }

  if (pathname === '/api/export') {
    const lic = getLicenseStatus();
    if (lic.blocked) {
      return json(res, 403, { error: 'Masa coba 1 hari telah habis. Masukkan kode aktivasi untuk mengunduh.', code: 'LICENSE_REQUIRED' });
    }
    const kind = String(urlObj.searchParams.get('kind') || 'finder').toLowerCase();
    const format = String(urlObj.searchParams.get('format') || 'xlsx').toLowerCase();
    const source = kind === 'crm' ? crmStore.leads : activeDataset;
    if (source.length > MAX_EXPORT_RECORDS) {
      res.writeHead(413, { 'Content-Type': 'text/plain' });
      res.end('Data terlalu banyak. Gunakan filter.');
      return;
    }
    if (format === 'csv') {
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="GMapsCRM_${kind}.csv"` });
      res.write('﻿');
      if (kind === 'crm') {
        res.write('No,Nama,Telepon,Kota,Negara,Jenis Usaha,Tahapan,Skor,Tindak Lanjut,Penanggung Jawab,Jml Aktivitas\n');
        const countByLead = {};
        for (const a of crmStore.activities) countByLead[a.leadId] = (countByLead[a.leadId] || 0) + 1;
        source.forEach((l, i) => {
          res.write([i + 1, csvCell(l.name), csvCell(l.phone), csvCell(l.city), csvCell(l.country), csvCell(l.category), csvCell(l.stage), l.score ?? '', csvCell(l.nextFollowUp), csvCell(l.owner), countByLead[l.id] || 0].join(',') + '\n');
        });
      } else {
        res.write('No,Jenis Usaha,Negara,Wilayah,Kota,Nama,Telepon,Alamat,Rating,Ulasan,Website,Maps\n');
        source.forEach((r, i) => {
          res.write([i + 1, csvCell(r.category), csvCell(r.country), csvCell(r.province), csvCell(r.city), csvCell(r.name), csvCell(r.phone), csvCell(r.address), r.rating ?? '', r.reviewsCount || 0, csvCell(r.website), csvCell(r.mapsUrl)].join(',') + '\n');
        });
      }
      res.end();
      return;
    }
    if (format === 'json') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="GMapsCRM_${kind}.json"` });
      res.end(JSON.stringify({ total: source.length, exportedAt: new Date().toISOString(), records: source }, null, 2));
      return;
    }
    try {
      const tmp = path.join(os.tmpdir(), `gcrm-${kind}-${Date.now()}.xlsx`);
      if (kind === 'crm') await exportCrmToExcel(source, tmp, crmStore.activities);
      else await exportFinderToExcel(source, tmp);
      const stat = fs.statSync(tmp);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="GMapsCRM_${kind}.xlsx"`,
        'Content-Length': stat.size
      });
      const stream = fs.createReadStream(tmp);
      stream.on('close', () => fs.unlink(tmp, () => {}));
      req.on('close', () => { try { stream.destroy(); } catch { /* abaikan */ } fs.unlink(tmp, () => {}); });
      stream.pipe(res);
      return;
    } catch (err) {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Export gagal: ${err.message}`);
      return;
    }
  }

  // STATIC
  if (pathname === '/favicon.ico') {
    const fav = path.join(PUBLIC_DIR, 'favicon.svg');
    if (fs.existsSync(fav)) {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(fav).pipe(res);
      return;
    }
  }
  const decodedPath = decodeURIComponent(pathname);
  let filePath = path.normalize(path.join(PUBLIC_DIR, decodedPath === '/' ? 'index.html' : decodedPath));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  if (decodedPath.includes('..') || decodedPath.includes('\0')) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    // Aset UI tidak di-cache agresif: update aplikasi (asar baru) harus
    // langsung terasa di renderer tanpa cache basi.
    res.writeHead(200, { 'Content-Type': (mime[ext] || 'application/octet-stream') + (['.html', '.css', '.js'].includes(ext) ? '; charset=utf-8' : ''), 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('GMaps CRM Pro aktif di http://localhost:' + PORT);
  console.log(`Leads tersimpan: ${crmStore.leads.length}`);
  console.log('='.repeat(60));
});
