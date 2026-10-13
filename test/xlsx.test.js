import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { buildXlsx, buildZip } from '../lib/xlsx.js';
import { exportFinderToExcel, exportCrmToExcel } from '../lib/excel.js';

function unzipEntries(buf) {
  // Parse EOCD + central directory, kembalikan {nama: Buffer}
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4B, 0x05, 0x06]));
  assert.ok(eocd >= 0, 'EOCD tidak ketemu');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const out = {};
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(off), 0x02014B50, 'central header');
    const method = buf.readUInt16LE(off + 10);
    const compLen = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.slice(off + 46, off + 46 + nameLen).toString('utf8');
    const lhNameLen = buf.readUInt16LE(localOff + 26);
    const lhExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lhNameLen + lhExtraLen;
    const comp = buf.slice(dataStart, dataStart + compLen);
    out[name] = method === 8 ? zlib.inflateRawSync(comp) : comp;
    off += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

describe('XLSX mandiri (nol dependensi)', () => {
  it('zip valid berisi part wajib', () => {
    const buf = buildXlsx([{ name: 'S1', columns: [{ header: 'Nama', width: 20 }], rows: [['Budi']] }]);
    assert.ok(buf.slice(0, 2).toString() === 'PK');
    const z = unzipEntries(buf);
    for (const p of ['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/styles.xml', 'xl/sharedStrings.xml', 'xl/worksheets/sheet1.xml']) {
      assert.ok(z[p], 'hilang: ' + p);
    }
  });
  it('nilai + styling header/zebra tertulis', () => {
    const buf = buildXlsx([{ name: 'S1', columns: [{ header: 'Nama', width: 20 }, { header: 'Skor', width: 10 }], rows: [['Budi', 5], ['A&<Candra>', 3]] }]);
    const z = unzipEntries(buf);
    const sheet = z['xl/worksheets/sheet1.xml'].toString('utf8');
    const sst = z['xl/sharedStrings.xml'].toString('utf8');
    assert.match(sst, /Budi/);
    assert.match(sst, /A&amp;&lt;Candra&gt;/);
    assert.match(sheet, /s="1"/); // header
    assert.match(sheet, /s="3"/); // zebra baris genap
    assert.match(sheet, /<v>5<\/v>/); // angka inline
    assert.match(sheet, /autoFilter ref="A1:B1"/);
    assert.match(sheet, /ySplit="1"/); // freeze
  });
  it('export finder: multi-sheet + ringkasan', async () => {
    const tmp = path.join(os.tmpdir(), `gcrm-xlsx-test-${Date.now()}.xlsx`);
    const recs = [
      { name: 'Klinik A', category: 'Klinik', country: 'ID', province: 'Jatim', city: 'Blitar', phone: '0811', address: 'Jl A', rating: 4.8, reviewsCount: 10, website: '', mapsUrl: '', lat: -8.1, lng: 112.1 },
      { name: 'Klinik B', category: 'Klinik', country: 'ID', province: 'Jatim', city: 'Malang', phone: '', address: '', rating: null, reviewsCount: 0, website: '', mapsUrl: '' }
    ];
    const r = await exportFinderToExcel(recs, tmp);
    assert.equal(r.totalRecords, 2);
    assert.equal(r.citiesCount, 2);
    const z = unzipEntries(fs.readFileSync(tmp));
    const wb = z['xl/workbook.xml'].toString('utf8');
    assert.match(wb, /Semua Data/);
    assert.match(wb, /Ringkasan/);
    assert.match(wb, /Blitar/);
    fs.unlinkSync(tmp);
  });
  it('export crm: sheet leads', async () => {
    const tmp = path.join(os.tmpdir(), `gcrm-xlsx-crm-${Date.now()}.xlsx`);
    const r = await exportCrmToExcel([{ id: '1', name: 'Toko X', phone: '0822', city: 'Solo', country: 'ID', category: 'Toko', stage: 'baru', score: 4 }], tmp, []);
    assert.equal(r.totalRecords, 1);
    const z = unzipEntries(fs.readFileSync(tmp));
    assert.match(z['xl/sharedStrings.xml'].toString('utf8'), /Toko X/);
    fs.unlinkSync(tmp);
  });
  it('buildZip roundtrip biner', () => {
    const bin = Buffer.from([0, 1, 2, 250, 255]);
    const z = unzipEntries(buildZip({ 'a.bin': bin }));
    assert.deepEqual(z['a.bin'], bin);
  });
});
