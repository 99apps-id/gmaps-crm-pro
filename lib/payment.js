/**
 * Payment gateway (Payment Link, money-in) -> penerbitan serial otomatis.
 *
 * Terhubung ke satu VPS resmi:
 * - Harga final: harian Rp15.000 (1 hari), mingguan Rp50.000 (7 hari).
 * - Webhook + penerbitan serial berjalan di VPS gmst.dewa.ai.id
 *   (ENGINE_MODE=engine). Klien Electron TIDAK menerima webhook;
 *   aktivasi otomatis via polling butir reff / halaman finish yang
 *   mem-proxy halaman klaim VPS (lihat fetchVpsOrderByReff).
 * - Trial: 1 hari (kebijakan produk GCRM).
 *
 * Env (klien):
 *   PAY_HARIAN_URL / PAY_MINGGUAN_URL  override link checkout (opsional;
 *                                      kosong = ikut URL dari VPS)
 * Env (VPS engine):
 *   SINGAPAY_CLIENT_SECRET  client secret dashboard (wajib)
 *   PAYMENT_STORE_FILE      licenses store (default ./licenses.json)
 *   PAYMENT_ORDERS_FILE     catatan order idempoten (default ./payments.json)
 */

import fs from 'fs';
import crypto from 'crypto';
import { generateSerial } from './license.js';
import { licenseSecret } from './license.js';

export const WEBHOOK_PATH = '/api/payment/singapay';
export const CLAIM_PATH = '/api/payment/claim';
/** Halaman finish lokal (target success_redirect agar aktivasi otomatis). */
export const FINISH_PATH = '/api/payment/finish';

/** Basis VPS resmi (lisensi + payment + klaim). */
export const DEFAULT_VPS_BASE = 'https://gmst.dewa.ai.id';

/** Link checkout bawaan = milik VPS resmi (satu pintu pembayaran). */
const DEFAULT_PAY_URLS = {
  harian: 'https://payment-link.singapay.id/b2b/PL202610111742326acb6818a083e',
  mingguan: 'https://payment-link.singapay.id/b2b/PL202610111745086acb68b4360e7'
};

export const PLANS = {
  harian: {
    amount: 15000, days: 1, label: 'Harian', shortLabel: '1 Hari',
    url: process.env.PAY_HARIAN_URL || DEFAULT_PAY_URLS.harian
  },
  mingguan: {
    amount: 50000, days: 7, label: 'Mingguan', shortLabel: '7 Hari',
    url: process.env.PAY_MINGGUAN_URL || DEFAULT_PAY_URLS.mingguan
  }
};

export function formatRupiah(value) {
  const n = Number(value) || 0;
  return 'Rp' + n.toLocaleString('id-ID');
}

export function paymentOptions() {
  return ['mingguan', 'harian'].map((id) => {
    const p = PLANS[id];
    return {
      id,
      label: p.label,
      shortLabel: p.shortLabel,
      amount: p.amount,
      amountLabel: formatRupiah(p.amount),
      days: p.days,
      url: p.url
    };
  });
}

export function paymentStoreFile() {
  return process.env.PAYMENT_STORE_FILE || 'licenses.json';
}

export function paymentOrdersFile() {
  return process.env.PAYMENT_ORDERS_FILE || 'payments.json';
}

function loadJson(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { /* korup -> fallback */ }
  return fallback;
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function sortRecursive(value) {
  if (Array.isArray(value)) return value.map(sortRecursive);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = sortRecursive(value[k]);
    return out;
  }
  return value;
}

function isoDate(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function verifySingapaySignature({ rawBody, headers, clientSecret, endpointPath }) {
  try {
    const h = {};
    for (const k of Object.keys(headers || {})) h[k.toLowerCase()] = headers[k];
    const received = String(h['x-signature'] || '');
    const timestamp = String(h['x-timestamp'] || '');
    const token = String(h['authorization'] || '').replace(/^Bearer\s+/i, '');
    if (!received || !timestamp || !token || !clientSecret) return false;

    const ts = parseInt(timestamp, 10);
    if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

    const parsed = JSON.parse(rawBody);
    const normalized = JSON.stringify(sortRecursive(parsed));
    const hashedBody = crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
    const stringToSign = `POST:${endpointPath}:${token}:${hashedBody}:${timestamp}`;
    const calc = crypto.createHmac('sha512', clientSecret).update(stringToSign, 'utf8').digest('hex');
    if (calc.length !== received.length) return false;
    return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(received));
  } catch {
    return false;
  }
}

export function planForAmount(value) {
  const n = Math.floor(parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0);
  for (const [id, p] of Object.entries(PLANS)) {
    if (p.amount === n) return { id, ...p };
  }
  return null;
}

export function fulfillPaymentLink(payload, now = new Date()) {
  const data = payload?.data || {};
  const trx = data.transaction || {};
  if (trx.status !== 'paid') {
    throw Object.assign(new Error(`Status transaksi bukan paid (${trx.status || '?'})`), { status: 422, code: 'NOT_PAID' });
  }
  const reffNo = String(trx.reff_no || '').trim();
  if (!reffNo) throw Object.assign(new Error('reff_no kosong'), { status: 422, code: 'NO_REFF' });

  const ordersFile = paymentOrdersFile();
  const orders = loadJson(ordersFile, { processed: {} });
  if (orders.processed[reffNo]) {
    return { ...orders.processed[reffNo], reused: true };
  }

  const plan = planForAmount(trx.amount?.value);
  if (!plan) {
    throw Object.assign(new Error(`Nominal ${trx.amount?.value} tidak cocok paket mana pun`), { status: 422, code: 'UNKNOWN_PLAN' });
  }

  const serial = generateSerial(licenseSecret());
  const record = {
    serial,
    plan: plan.id,
    days: plan.days,
    amount: plan.amount,
    email: data.customer?.email || null,
    name: data.customer?.name || null,
    phone: data.customer?.phone || null,
    reff_no: reffNo,
    created_at: now.toISOString()
  };

  const storeFile = paymentStoreFile();
  const store = loadJson(storeFile, { generated_at: null, licenses: [], revoked: [] });
  if (!Array.isArray(store.licenses)) store.licenses = [];
  upsertLicenseEntry(store, { serial, plan: plan.id, days: plan.days, source: 'payment', reff_no: reffNo });
  store.generated_at = now.toISOString();
  saveJson(storeFile, store);

  orders.processed[reffNo] = record;
  saveJson(ordersFile, orders);

  return { ...record, reused: false };
}

export function claimByReff(reffNo) {
  const orders = loadJson(paymentOrdersFile(), { processed: {} });
  const rec = orders.processed[String(reffNo || '').trim()];
  if (!rec) return null;
  return { serial: rec.serial, plan: rec.plan, days: rec.days };
}

export function findLatestOrderAfter(sinceIso) {
  const orders = loadJson(paymentOrdersFile(), { processed: {} });
  const sinceTime = sinceIso ? new Date(sinceIso).getTime() : 0;
  let latest = null;

  for (const rec of Object.values(orders.processed || {})) {
    if (!rec || !rec.created_at || !rec.serial) continue;
    const t = new Date(rec.created_at).getTime();
    if (t >= sinceTime) {
      if (!latest || t > new Date(latest.created_at).getTime()) {
        latest = rec;
      }
    }
  }
  return latest ? { serial: latest.serial, plan: latest.plan, days: latest.days, reff_no: latest.reff_no } : null;
}

export function normalizeLicenseEntries(store) {
  const out = [];
  for (const e of (store?.licenses || [])) {
    if (typeof e === 'string') {
      out.push({ serial: e.trim().toUpperCase(), plan: null, days: null });
    } else if (e && typeof e.serial === 'string') {
      out.push({
        serial: e.serial.trim().toUpperCase(),
        plan: e.plan || null,
        days: Number.isFinite(e.days) ? e.days : null
      });
    }
  }
  return out;
}

export function normalizeRevoked(store) {
  return new Set((store?.revoked || []).map((x) => String(x).trim().toUpperCase()));
}

export function upsertLicenseEntry(store, entry) {
  if (!Array.isArray(store.licenses)) store.licenses = [];
  const needle = String(entry.serial).trim().toUpperCase();
  const idx = store.licenses.findIndex((e) =>
    (typeof e === 'string' ? e : e.serial) &&
    String(typeof e === 'string' ? e : e.serial).trim().toUpperCase() === needle);
  const obj = { serial: needle, plan: entry.plan || null, days: entry.days ?? null, source: entry.source || 'manual', reff_no: entry.reff_no || null };
  if (idx >= 0) store.licenses[idx] = obj;
  else store.licenses.push(obj);
}

export function findPlanForSerial(serial, storeFiles = []) {
  const needle = String(serial || '').trim().toUpperCase();
  for (const f of storeFiles) {
    try {
      const store = loadJson(f, null);
      if (!store) continue;
      const hit = normalizeLicenseEntries(store).find((e) => e.serial === needle);
      if (hit && hit.days) return { plan: hit.plan, days: hit.days };
    } catch { /* abaikan */ }
  }
  return null;
}

/**
 * Ekstrak {serial, plan, days} dari HTML halaman klaim VPS
 * (/api/payment/claim?ref=...). Template VPS stabil:
 *   paket <b>harian</b>, 1 hari ... <div class="serial">GMST-...</div>
 * @returns {{serial:string, plan:string|null, days:number|null}|null}
 */
export function parseClaimHtml(html) {
  const src = String(html || '');
  const serialMatch = src.match(/<div class="serial">\s*([A-Z0-9-]+)\s*<\/div>/);
  if (!serialMatch) return null;
  const serial = serialMatch[1].trim().toUpperCase();
  if (!/^GMST-\d{4}-[A-Z2-9]{6}$/.test(serial)) return null;
  const planMatch = src.match(/paket\s*<b>\s*([a-z]+)\s*<\/b>\s*,\s*(\d+)\s*hari/);
  return {
    serial,
    plan: planMatch ? planMatch[1] : null,
    days: planMatch ? parseInt(planMatch[2], 10) : null
  };
}

function vpsBase(override = '') {
  const v = String(override || process.env.LICENSE_SERVER_URL || '').trim();
  if (/^(off|none|local)$/i.test(v)) return '';
  return (v || DEFAULT_VPS_BASE).replace(/\/+$/, '');
}

/**
 * Ambil order VPS berdasarkan nomor referensi (untuk aktivasi otomatis
 * di klien yang tidak menerima webhook). Hanya butir spesifik yang
 * diketahui user dari struk bayarnya - tidak ada enumerasi order.
 */
export async function fetchVpsOrderByReff(reff, baseOverride = '', timeoutMs = 12000) {
  const base = vpsBase(baseOverride);
  const ref = String(reff || '').trim();
  if (!base || !ref) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${base}${CLAIM_PATH}?ref=${encodeURIComponent(ref)}`;
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'text/html' } });
    if (!res.ok) return null;
    return parseClaimHtml(await res.text());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve payment-link ref -> transaction ref by querying Singapay histories.
 * Returns transaction ref if a paid history is found, otherwise null.
 */
export async function resolveTransactionRefByLinkRef(linkRef, timeoutMs = 12000) {
  const ref = String(linkRef || '').trim();
  const base = String(process.env.SINGAPAY_API_BASE || '').trim();
  const accountId = String(process.env.SINGAPAY_ACCOUNT_ID || '').trim();
  const partnerId = String(process.env.SINGAPAY_PARTNER_ID || '').trim();
  const clientId = String(process.env.SINGAPAY_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.SINGAPAY_CLIENT_SECRET || '').trim();
  if (!base || !accountId || !partnerId || !clientId || !clientSecret || !ref) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const wib = new Date(now.getTime() + (420 + now.getTimezoneOffset()) * 60 * 1000);
    const date = `${wib.getFullYear()}${pad(wib.getMonth() + 1)}${pad(wib.getDate())}`;
    const signaturePayload = `${clientId}_${clientSecret}_${date}`;
    const signature = crypto.createHmac('sha512', clientSecret).update(signaturePayload, 'utf8').digest('hex');

    const tokenRes = await fetch(`${base}/api/v1.1/access-token/b2b`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PARTNER-ID': partnerId,
        'X-CLIENT-ID': clientId,
        'X-Signature': signature
      },
      body: JSON.stringify({ grant_type: 'client_credentials' })
    });
    const tokenData = await tokenRes.json();
    const accessToken = String(tokenData?.data?.access_token || '').trim();
    if (!accessToken || tokenData?.success === false || tokenData?.status !== 200) return null;

    const histRes = await fetch(`${base}/api/v1.0/payment-link-histories/${encodeURIComponent(accountId)}?payment_link_reff_no=${encodeURIComponent(ref)}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-PARTNER-ID': partnerId,
        'X-CLIENT-ID': clientId
      }
    });
    if (!histRes.ok) return null;
    const histData = await histRes.json();
    const paid = (Array.isArray(histData?.data) ? histData.data : []).find((item) => String(item?.status || '').toLowerCase() === 'paid');
    return paid ? String(paid.reff_no || '').trim() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Daftar paket + URL checkout live dari VPS (agar rotasi link cukup
 * dilakukan sekali di VPS). Cache 1 jam. Gagal = null (pakai lokal).
 */
let cachedUpstreamPlans = null;
export async function fetchUpstreamPlans(baseOverride = '', timeoutMs = 10000) {
  const base = vpsBase(baseOverride);
  if (!base) return null;
  const now = Date.now();
  if (cachedUpstreamPlans && now - cachedUpstreamPlans.at < 3600 * 1000) {
    return cachedUpstreamPlans.plans;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}/api/payment/options`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data?.plans) || !data.plans.length) return null;
    cachedUpstreamPlans = { at: now, plans: data.plans };
    return data.plans;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Buat payment link dinamis Singapay untuk paket yang diminta.
 *
 * Alur:
 * 1) Validasi paket lokal.
 * 2) Siapkan env Singapay yang dibutuhkan:
 *    - base URL: SANDBOX jika SANDBOX_SINGAPAY=1, otherwise SANDBOX_SINGAPAY_API_BASE/SINGAPAY_API_BASE, otherwise LIVE_BASE
 *    - partner id: SANDBOX_SINGAPAY_PARTNER_ID / SINGAPAY_PARTNER_ID
 *    - client id: SANDBOX_SINGAPAY_CLIENT_ID / SINGAPAY_CLIENT_ID
 *    - client secret: SANDBOX_SINGAPAY_CLIENT_SECRET / SINGAPAY_CLIENT_SECRET
 *    - account id: SANDBOX_SINGAPAY_ACCOUNT_ID / SINGAPAY_ACCOUNT_ID
 * 3) Dapatkan bearer token dari /api/v1.1/access-token/b2b dengan X-Signature HMAC-SHA512.
 *    Signature format: lowercase hex HMAC-SHA512(clientSecret, "{client_id}_{client_secret}_{YYYYMMDD}"),
 *    signed with client_secret.
 * 4) Buat payment link v2 ke /api/v2.0/payment-link/{account_id} dengan body:
 *    - reff_no unik per paket
 *    - payment_link_type: total
 *    - total_amount sesuai paket
 *    - max_usage: 999 agar bisa dipakai berulang
 *    - expired_at: 1 tahun ke depan
 *    - required_customer_number/email: false agar tidak memaksa input data diri
 *      untuk link multi-pakai
 *    - whitelisted_payment_method: tidak dipaksa; dibiarkan kosong agar
 *      Singapay auto-select metode aktif yang eligible (VA, QRIS, kartu kredit,
 *      dll sesuai setting dashboard merchant)
 *    - success_redirect_url = halaman klaim publik VPS
 * 5) Return payment_url yang didapat dari API.
 * 6) Jika gagal di tahap manapun, fallback ke static URL dari PLANS.
 */
function paymentRedirectBase() {
  const host = String(process.env.PAYMENT_REDIRECT_HOST || process.env.HOST || '').trim();
  if (!host) return null;
  return host.replace(/\/+$/, '');
}

function paymentClaimUrl(reffNo) {
  const base = paymentRedirectBase();
  if (!base) return null;
  const path = `${CLAIM_PATH}?ref=${encodeURIComponent(reffNo)}`;
  if (/^https?:\/\//i.test(base)) return `${base}${path}`;
  return `https://${base}${path}`;
}

function jakartaDateYMD(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  // getTimezoneOffset(): UTC - lokal, dalam menit.
  // Untuk WIB (UTC+7), offset = -420. Kita ingin WIB = lokal + (420 + offset) menit.
  const wib = new Date(d.getTime() + (420 + d.getTimezoneOffset()) * 60 * 1000);
  return `${wib.getFullYear()}${pad(wib.getMonth() + 1)}${pad(wib.getDate())}`;
}

function toWibIso(date, offsetMinutes = 7 * 60) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + (d.getTimezoneOffset() + offsetMinutes));
  return d.toISOString().replace('Z', '+07:00');
}

export async function createPaymentLink({ planId, baseOverride = '' }) {
  const plan = PLANS[String(planId || '').trim().toLowerCase()];
  if (!plan) {
    return { url: null, dynamic: false, error: 'Paket tidak dikenali' };
  }

  const sandboxMode = process.env.SANDBOX_SINGAPAY === '1';
  const sandboxBase = String(process.env.SANDBOX_SINGAPAY_API_BASE || '').trim();
  const liveBase = String(process.env.SINGAPAY_API_BASE || '').trim();
  const base = (sandboxMode ? 'https://sandbox-payment-b2b.singapay.id' : (sandboxBase || liveBase || 'https://payment-b2b.singapay.id')).replace(/\/+$/, '');
  const partnerId = String(process.env.SANDBOX_SINGAPAY_PARTNER_ID || process.env.SINGAPAY_PARTNER_ID || '').trim();
  const clientId = String(process.env.SANDBOX_SINGAPAY_CLIENT_ID || process.env.SINGAPAY_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.SANDBOX_SINGAPAY_CLIENT_SECRET || process.env.SINGAPAY_CLIENT_SECRET || '').trim();
  const accountId = String(process.env.SANDBOX_SINGAPAY_ACCOUNT_ID || process.env.SINGAPAY_ACCOUNT_ID || '').trim();

  if (!partnerId || !clientId || !clientSecret || !accountId) {
    return { url: String(plan.url || ''), dynamic: false, error: 'Kredensial Singapay belum dikonfigurasi' };
  }

  const now = new Date();
  const reffNo = `${clientId.replace(/[^A-Z0-9]/gi, '').slice(0, 6)}-${planId}-${isoDate(now)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const successRedirect = paymentClaimUrl(reffNo);
  if (!successRedirect) {
    return { url: String(plan.url || ''), dynamic: false, error: 'PAYMENT_REDIRECT_HOST atau HOST belum diatur' };
  }

  try {
    const signaturePayload = `${clientId}_${clientSecret}_${jakartaDateYMD(now)}`;
    const signature = crypto.createHmac('sha512', clientSecret).update(signaturePayload, 'utf8').digest('hex');

    const tokenRes = await fetch(`${base}/api/v1.1/access-token/b2b`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PARTNER-ID': partnerId,
        'X-CLIENT-ID': clientId,
        'X-Signature': signature
      },
      body: JSON.stringify({ grant_type: 'client_credentials' })
    });

    const tokenData = await tokenRes.json();
    const accessToken = String(tokenData?.data?.access_token || '').trim();
    if (!accessToken || tokenData?.success === false || tokenData?.status !== 200) {
      throw new Error(String(tokenData?.error?.message || 'Gagal mendapatkan token Singapay'));
    }

    const paymentBody = {
      reff_no: reffNo,
      payment_link_type: 'total',
      description: `Paket ${plan.label} - GMaps CRM Pro`,
      max_usage: 999,
      expired_at: toWibIso(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      total_amount: plan.amount,
      required_customer_number: false,
      required_customer_email: false,
      whitelisted_payment_method: ['VA_BCA', 'VA_BRI', 'VA_MANDIRI', 'QRIS', 'NICEPAY_CARD'],
      success_redirect_url: successRedirect,
      expired_redirect_url: successRedirect
    };

    const paymentRes = await fetch(`${base}/api/v2.0/payment-link/${encodeURIComponent(accountId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-PARTNER-ID': partnerId,
        'X-CLIENT-ID': clientId
      },
      body: JSON.stringify(paymentBody)
    });

    const paymentData = await paymentRes.json();
    const paymentUrl = String(paymentData?.data?.payment_url || '').trim();
    if (!paymentUrl || paymentData?.success === false || paymentData?.status !== 200) {
      throw new Error(String(paymentData?.error?.message || 'Gagal membuat payment link dinamis'));
    }

    return { url: paymentUrl, dynamic: true, reffNo };
  } catch (err) {
    return { url: String(plan.url || ''), dynamic: false, error: err?.message || 'Gagal membuat payment link dinamis' };
  }
}
