import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateSerial, validateSerial, TRIAL_DAYS, getLicenseStatus, SERIAL_PREFIX } from '../lib/license.js';
import { planForAmount, paymentOptions, parseClaimHtml } from '../lib/payment.js';
import { CATEGORY_SECTORS, COUNTRIES, cityMeta, keywordsForCategory } from '../lib/catalog.js';

describe('Lisensi GCRM ikut skema GMST, trial 1 hari', () => {
  it('TRIAL_DAYS tepat 1', () => {
    assert.equal(TRIAL_DAYS, 1);
  });
  it('prefix mengikuti GMST (satu VPS)', () => {
    assert.equal(SERIAL_PREFIX, 'GMST');
  });
  it('serial GMST roundtrip valid, prefix lain ditolak', () => {
    const s = generateSerial('s3cret');
    assert.ok(s.startsWith('GMST-'));
    assert.equal(validateSerial(s, 's3cret').ok, true);
    assert.equal(validateSerial('GCRM-2610-ABCDEF', 's3cret').ok, false);
    assert.equal(validateSerial('XXXX-2610-ABCDEF', 's3cret').ok, false);
  });
  it('status baru belum diblokir', () => {
    process.env.LICENSE_FILE = (process.env.TEMP || '/tmp') + '/gcrm-test-license.json';
    try { fs.unlinkSync(process.env.LICENSE_FILE); } catch { /* belum ada */ }
    const st = getLicenseStatus(new Date());
    assert.equal(st.blocked, false);
    assert.equal(st.trialDays, 1);
  });
});

describe('Paket 15rb dan 50rb', () => {
  it('opsi dua paket', () => {
    const opts = paymentOptions();
    assert.equal(opts.length, 2);
  });
  it('15000 harian, 50000 mingguan', () => {
    assert.equal(planForAmount(15000).id, 'harian');
    assert.equal(planForAmount(50000).id, 'mingguan');
  });
  it('punya URL checkout bawaan (ikut VPS GMST)', () => {
    for (const p of paymentOptions()) {
      assert.match(p.url, /^https:\/\/payment-link\.singapay\.id\//);
    }
  });
  it('parse halaman klaim VPS mengambil serial+paket', () => {
    const html = `<p>Pembayaran terkonfirmasi (paket <b>mingguan</b>, 7 hari).</p>
      <div class="serial">GMST-2610-V3UY4J</div>`;
    const order = parseClaimHtml(html);
    assert.equal(order.serial, 'GMST-2610-V3UY4J');
    assert.equal(order.plan, 'mingguan');
    assert.equal(order.days, 7);
  });
  it('parse klaim tak dikenal mengembalikan null', () => {
    assert.equal(parseClaimHtml('<p>Referensi tidak ditemukan.</p>'), null);
    assert.equal(parseClaimHtml(''), null);
  });
});

describe('Katalog global bilingual', () => {
  it('kategori wajib CRM ada', () => {
    const all = new Set();
    CATEGORY_SECTORS.forEach((s) => s.categories.forEach((c) => all.add(c.id)));
    for (const id of ['konsultan_pajak', 'kantor_hukum', 'notaris', 'pabrik_makanan', 'warung', 'toko_kelontong']) {
      assert.ok(all.has(id), 'hilang: ' + id);
    }
  });
  it('11 negara tersedia', () => {
    assert.ok(COUNTRIES.length >= 11);
  });
  it('keyword bilingual untuk pajak', () => {
    assert.ok(keywordsForCategory('konsultan_pajak', 'id').length > 0);
    assert.ok(keywordsForCategory('konsultan_pajak', 'en').includes('tax consultant'));
  });
  it('kategori agro-marine + sekolah tersedia bilingual', () => {
    const all = new Set();
    CATEGORY_SECTORS.forEach((s) => s.categories.forEach((c) => all.add(c.id)));
    for (const id of ['budidaya_perikanan', 'kelautan', 'pertanian', 'perkebunan', 'pakan_hewan',
      'sekolah_umum', 'sdit', 'smpit', 'smait', 'smk', 'sekolah_sunnah', 'pesantren', 'homeschooling']) {
      assert.ok(all.has(id), 'hilang: ' + id);
      assert.ok(keywordsForCategory(id, 'id').length > 0, 'keyword id kosong: ' + id);
      assert.ok(keywordsForCategory(id, 'en').length > 0, 'keyword en kosong: ' + id);
    }
    assert.ok(keywordsForCategory('sdit', 'id').includes('sdit'));
    assert.ok(keywordsForCategory('pesantren', 'id').includes('pesantren'));
    assert.ok(keywordsForCategory('perkebunan', 'id').includes('perkebunan'));
  });
  it('kategori laris CRM: kesehatan, kuliner, otomotif, jasa rumah', () => {
    const all = new Set();
    CATEGORY_SECTORS.forEach((s) => s.categories.forEach((c) => all.add(c.id)));
    for (const id of ['optik', 'lab_medis', 'pijat_refleksi', 'rumah_makan_padang',
      'seafood', 'mie_bakso', 'depot_air_minum', 'mobil_bekas', 'derek_towing',
      'rental_mobil', 'cleaning_service', 'sedot_wc', 'pest_control']) {
      assert.ok(all.has(id), 'hilang: ' + id);
      assert.ok(keywordsForCategory(id, 'id').length > 0, 'keyword id kosong: ' + id);
      assert.ok(keywordsForCategory(id, 'en').length > 0, 'keyword en kosong: ' + id);
    }
  });
  it('batch properti, event, keuangan, energi', () => {
    const all = new Set();
    CATEGORY_SECTORS.forEach((s) => s.categories.forEach((c) => all.add(c.id)));
    for (const id of ['developer_perumahan', 'jasa_interior', 'wedding_organizer',
      'event_organizer', 'sewa_sound_lighting', 'dekorasi_event', 'leasing',
      'koperasi', 'panel_surya', 'pangkalan_gas']) {
      assert.ok(all.has(id), 'hilang: ' + id);
      assert.ok(keywordsForCategory(id, 'id').length > 0, 'keyword id kosong: ' + id);
      assert.ok(keywordsForCategory(id, 'en').length > 0, 'keyword en kosong: ' + id);
    }
  });
  it('batch fashion, hewan, jasa, kampus', () => {
    const all = new Set();
    CATEGORY_SECTORS.forEach((s) => s.categories.forEach((c) => all.add(c.id)));
    for (const id of ['toko_baju', 'toko_emas', 'tailor', 'petshop', 'toko_tani',
      'kursus_mengemudi', 'biro_jasa_pt', 'homecare', 'sumur_bor', 'universitas']) {
      assert.ok(all.has(id), 'hilang: ' + id);
      assert.ok(keywordsForCategory(id, 'id').length > 0, 'keyword id kosong: ' + id);
      assert.ok(keywordsForCategory(id, 'en').length > 0, 'keyword en kosong: ' + id);
    }
  });
  it('impor unik dari GMST (duplikat beda-nama dilewati)', () => {
    const all = new Set();
    CATEGORY_SECTORS.forEach((s) => s.categories.forEach((c) => all.add(c.id)));
    for (const id of ['barbershop', 'fisioterapi', 'body_repair', 'coworking',
      'toko_baja', 'distributor_stainless', 'toko_perkakas', 'supplier_atk',
      'supplier_daging', 'sparepart_handphone', 'bilyar', 'tempat_wisata',
      'toko_mainan', 'toko_perabotan']) {
      assert.ok(all.has(id), 'hilang: ' + id);
      assert.ok(keywordsForCategory(id, 'id').length > 0, 'keyword id kosong: ' + id);
      assert.ok(keywordsForCategory(id, 'en').length > 0, 'keyword en kosong: ' + id);
    }
  });
  it('cityMeta Tokyo ketemu', () => {
    assert.equal(cityMeta('Tokyo')?.country, 'JP');
  });
});
