/**
 * Minimal XLSX writer - GMaps CRM Pro (nol dependensi, hanya node:zlib builtin).
 *
 * Menggantikan exceljs agar paket Electron deterministik (tanpa pohon
 * node_modules rapuh) dan anti-jailbreak tetap terjaga. Mendukung yang
 * dipakai aplikasi: multi-sheet, header tebal + warna, border, zebra,
 * lebar kolom, freeze baris atas, autoFilter, tinggi baris.
 */

import zlib from 'node:zlib';

function escXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function colLetter(i) {
  let s = '';
  let n = i + 1;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// ---- CRC32 (untuk ZIP) ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function dosTime(date = new Date()) {
  const t = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xFFFF;
  const d = ((((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate())) & 0xFFFF;
  return { t, d };
}

/** Bangun buffer .zip (deflate) dari {namaFile: string|Buffer}. */
export function buildZip(files) {
  const names = Object.keys(files);
  const chunks = [];
  const central = [];
  let offset = 0;
  const { t, d } = dosTime();
  for (const name of names) {
    const raw = Buffer.isBuffer(files[name]) ? files[name] : Buffer.from(String(files[name]), 'utf8');
    const comp = zlib.deflateRawSync(raw, { level: 6 });
    const crc = crc32(raw);
    const nameBuf = Buffer.from(name, 'utf8');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034B50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(t, 10);
    local.writeUInt16LE(d, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, comp);
    central.push({ nameBuf, crc, compLen: comp.length, rawLen: raw.length, offset, t, d });
    offset += local.length + nameBuf.length + comp.length;
  }
  const centralStart = offset;
  let centralSize = 0;
  for (const c of central) {
    const h = Buffer.alloc(46);
    h.writeUInt32LE(0x02014B50, 0);
    h.writeUInt16LE(20, 4);
    h.writeUInt16LE(20, 6);
    h.writeUInt16LE(0x0800, 8);
    h.writeUInt16LE(8, 10);
    h.writeUInt16LE(c.t, 12);
    h.writeUInt16LE(c.d, 14);
    h.writeUInt32LE(c.crc, 16);
    h.writeUInt32LE(c.compLen, 20);
    h.writeUInt32LE(c.rawLen, 24);
    h.writeUInt16LE(c.nameBuf.length, 28);
    h.writeUInt16LE(0, 30);
    h.writeUInt16LE(0, 32);
    h.writeUInt16LE(0, 34);
    h.writeUInt16LE(0, 36);
    h.writeUInt32LE(0, 38);
    h.writeUInt32LE(c.offset, 42);
    chunks.push(h, c.nameBuf);
    centralSize += h.length + c.nameBuf.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054B50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(central.length, 8);
  end.writeUInt16LE(central.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralStart, 16);
  end.writeUInt16LE(0, 20);
  chunks.push(end);
  return Buffer.concat(chunks);
}

// ---- Shared strings ----
class SharedStrings {
  constructor() { this.map = new Map(); this.list = []; }
  indexOf(s) {
    const key = String(s ?? '');
    let i = this.map.get(key);
    if (i === undefined) { i = this.list.length; this.map.set(key, i); this.list.push(key); }
    return i;
  }
  xml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${this.list.length}" uniqueCount="${this.list.length}">` +
      this.list.map((s) => `<si><t xml:space="preserve">${escXml(s)}</t></si>`).join('') + `</sst>`;
  }
}

const THIN_BORDER = '<border><left style="thin"><color rgb="FFE2E8F0"/></left><right style="thin"><color rgb="FFE2E8F0"/></right><top style="thin"><color rgb="FFE2E8F0"/></top><bottom style="thin"><color rgb="FFE2E8F0"/></bottom><diagonal/></border>';

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<fonts count="2"><font><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><b/></font>` +
    `<font><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font></fonts>` +
    `<fills count="3"><fill><patternFill patternType="none"/></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="FF0F2A4A"/><bgColor indexed="64"/></patternFill></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5FE"/><bgColor indexed="64"/></patternFill></fill></fills>` +
    `<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${THIN_BORDER}</borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="4">` +
    `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
    `<xf numFmtId="0" fontId="0" fillId="1" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyFont="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>` +
    `<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `</cellXfs></styleSheet>`;
}

function sheetXml(name, columns, rows, sst) {
  const nCols = columns.length;
  const lastCol = colLetter(nCols - 1);
  const cols = `<cols>` + columns.map((c, i) =>
    `<col min="${i + 1}" max="${i + 1}" width="${Number(c.width) || 15}" customWidth="1"/>`).join('') + `</cols>`;
  let body = `<sheetData>`;
  // Header (style 1)
  body += `<row r="1" ht="28" customHeight="1">`;
  columns.forEach((c, i) => {
    body += `<c r="${colLetter(i)}1" s="1" t="s"><v>${sst.indexOf(c.header)}</v></c>`;
  });
  body += `</row>`;
  // Data: zebra genap (style 3), ganjil (style 2)
  rows.forEach((row, r) => {
    const s = (r % 2 === 1) ? 3 : 2;
    body += `<row r="${r + 2}" ht="22" customHeight="1">`;
    for (let i = 0; i < nCols; i++) {
      const v = row[i];
      if (v === null || v === undefined || v === '') {
        body += `<c r="${colLetter(i)}${r + 2}" s="${s}"/>`;
      } else if (typeof v === 'number' && Number.isFinite(v)) {
        body += `<c r="${colLetter(i)}${r + 2}" s="${s}"><v>${v}</v></c>`;
      } else {
        body += `<c r="${colLetter(i)}${r + 2}" s="${s}" t="s"><v>${sst.indexOf(v)}</v></c>`;
      }
    }
    body += `</row>`;
  });
  body += `</sheetData>`;
  const lastRow = rows.length + 1;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>` +
    `<dimension ref="A1:${lastCol}${lastRow}"/>` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>` +
    cols + body +
    `<autoFilter ref="A1:${lastCol}1"/>` +
    `</worksheet>`;
}

/**
 * @param sheets [{name, columns:[{header,width}], rows:[[cell,...]]}]
 * @returns Buffer .xlsx
 */
export function buildXlsx(sheets, creator = 'GMaps CRM Pro') {
  const sst = new SharedStrings();
  const clean = (sheets || []).map((sh, i) => ({
    name: String(sh.name || `Sheet${i + 1}`).slice(0, 31) || `Sheet${i + 1}`,
    columns: sh.columns || [],
    rows: sh.rows || []
  }));
  const files = {
    '[Content_Types].xml':
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
      `<Default Extension="xml" ContentType="application/xml"/>` +
      `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
      `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
      `<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>` +
      `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
      `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>` +
      clean.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
      `</Types>`,
    '_rels/.rels':
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
      `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
      `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>` +
      `</Relationships>`,
    'docProps/core.xml':
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
      `<dc:creator>${escXml(creator)}</dc:creator><cp:lastModifiedBy>${escXml(creator)}</cp:lastModifiedBy>` +
      `<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>` +
      `<dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified></cp:coreProperties>`,
    'docProps/app.xml':
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">` +
      `<Application>${escXml(creator)}</Application></Properties>`,
    'xl/workbook.xml':
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
      `<sheets>` + clean.map((sh, i) => `<sheet name="${escXml(sh.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + `</sheets></workbook>`,
    'xl/_rels/workbook.xml.rels':
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      clean.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
      `<Relationship Id="rId${clean.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
      `<Relationship Id="rId${clean.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>` +
      `</Relationships>`,
    'xl/styles.xml': stylesXml()
  };
  clean.forEach((sh, i) => {
    files[`xl/worksheets/sheet${i + 1}.xml`] = sheetXml(sh.name, sh.columns, sh.rows, sst);
  });
  files['xl/sharedStrings.xml'] = sst.xml();
  return buildZip(files);
}
