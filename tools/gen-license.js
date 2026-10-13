#!/usr/bin/env node
/**
 * Generator kode aktivasi GCRM Pro - dijalankan VENDOR.
 *
 *   LICENSE_SECRET="rahasia-acak-min-16" node tools/gen-license.js --count 5 --out licenses.json
 */

import fs from 'fs';
import { generateSerial } from '../lib/license.js';

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const secret = process.env.LICENSE_SECRET || '';
if (!secret || secret.length < 16 || secret === 'gcrm-dev-secret-change-me') {
  console.error('ERROR: set LICENSE_SECRET (min 16 karakter, acak) sebelum generate.');
  process.exit(1);
}

const count = Math.max(1, Math.min(1000, parseInt(arg('--count', '1'), 10) || 1));
const yymm = arg('--yymm', null);
const outPath = arg('--out', 'licenses.json');

const codes = [];
for (let i = 0; i < count; i++) codes.push(generateSerial(secret, yymm));

let file = { generated_at: new Date().toISOString(), licenses: [] };
try {
  if (fs.existsSync(outPath)) {
    const prev = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    if (Array.isArray(prev.licenses)) file = prev;
  }
} catch {
  console.error(`WARN: ${outPath} korup, dibuat baru.`);
}
file.generated_at = new Date().toISOString();
for (const c of codes) if (!file.licenses.includes(c)) file.licenses.push(c);
fs.writeFileSync(outPath, JSON.stringify(file, null, 2));

console.log('Kode aktivasi baru:');
for (const c of codes) console.log(`  ${c}`);
console.log(`\nTotal tersimpan di ${outPath}: ${file.licenses.length} kode. Upload file ini ke VPS.`);
