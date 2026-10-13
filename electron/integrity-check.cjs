/**
 * Integrity tripwire (CJS, tanpa dependensi) - GMaps CRM Pro.
 * Hash app.asar vs hash resmi VPS.
 */

const crypto = require('crypto');
const fs = require('fs');
let origFs = fs;
try { origFs = require('original-fs'); } catch { /* dev fallback */ }
const http = require('http');
const https = require('https');

function sha256File(file) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    const s = origFs.createReadStream(file);
    s.on('error', reject);
    s.on('data', (d) => h.update(d));
    s.on('end', () => resolve(h.digest('hex')));
  });
}

function fetchJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { reject(new Error('JSON tak valid')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
  });
}

async function checkIntegrity({ asarPath, integrityUrl }) {
  if (!integrityUrl) return { checked: false, reason: 'no-url' };
  if (!asarPath || !fs.existsSync(asarPath)) return { checked: false, reason: 'no-asar' };
  const [actual, expected] = await Promise.all([
    sha256File(asarPath),
    fetchJson(integrityUrl).catch((e) => ({ __error: e.message }))
  ]);
  if (expected && expected.__error) return { checked: false, reason: `vps-unreachable:${expected.__error}` };
  const want = String((expected && expected.sha256) || '').toLowerCase();
  if (!want) return { checked: false, reason: 'no-published-hash' };
  if (actual.toLowerCase() === want) return { checked: true, ok: true };
  return { checked: true, ok: false, actual: actual.slice(0, 16) + '…' };
}

module.exports = { checkIntegrity, sha256File };
