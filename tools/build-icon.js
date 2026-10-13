#!/usr/bin/env node
/**
 * Generate ikon GMaps CRM Pro (pin biru elegan + aksen CRM hijau).
 * Murni Node.js tanpa dependensi.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZE = 512;
const BLUE = [29, 78, 216];
const LIGHT = [14, 165, 233];

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function buildPixels() {
  const px = Buffer.alloc(SIZE * SIZE * 4);
  const cx = SIZE / 2;
  const headCy = 200;
  const headR = 152;
  const holeR = 60;
  const triTop = headCy + 92;
  const triTipY = 460;
  const triHalfTop = 108;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx;
      const dy = y - headCy;
      const distHead = Math.sqrt(dx * dx + dy * dy);
      let cover = 1 - smoothstep(headR - 1.2, headR + 1.2, distHead);

      if (y >= triTop && y <= triTipY) {
        const tt = (y - triTop) / (triTipY - triTop);
        const half = triHalfTop * (1 - tt) + 1.5;
        const triCover = 1 - smoothstep(half - 1.2, half + 1.2, Math.abs(dx));
        cover = Math.max(cover, triCover);
      }

      const distHole = Math.sqrt(dx * dx + dy * dy);
      const hole = 1 - smoothstep(holeR - 1.2, holeR + 1.2, distHole);

      // gradasi vertikal biru tua -> biru muda
      const g = Math.max(0, Math.min(1, y / SIZE));
      let r = Math.round(BLUE[0] + (LIGHT[0] - BLUE[0]) * g);
      let gg = Math.round(BLUE[1] + (LIGHT[1] - BLUE[1]) * g);
      let b = Math.round(BLUE[2] + (LIGHT[2] - BLUE[2]) * g);
      const a = Math.round(cover * 255);
      if (hole > 0.5 && cover > 0.5) { r = 255; gg = 255; b = 255; }
      const o = (y * SIZE + x) * 4;
      px[o] = r; px[o + 1] = gg; px[o + 2] = b; px[o + 3] = a;
    }
  }
  return px;
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(pixels, size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

function encodeICO(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 0;
  entry[1] = 0;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, png]);
}

const outDir = path.join(__dirname, '..', 'electron', 'assets');
fs.mkdirSync(outDir, { recursive: true });
const png = encodePNG(buildPixels(), SIZE);
fs.writeFileSync(path.join(outDir, 'icon.png'), png);
fs.writeFileSync(path.join(outDir, 'icon.ico'), encodeICO(png));
console.log(`Ikon dibuat: electron/assets/icon.png + icon.ico (${png.length} bytes PNG).`);
