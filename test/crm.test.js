import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhone, importRecords, loadStore, setStage, addActivity,
  activitiesFor, remindersDue, funnelStats, leadScoreFor, applyTemplate,
  defaultTemplates
} from '../lib/crm.js';

function freshStore() {
  return { version: 1, leads: [], activities: [], templates: defaultTemplates() };
}

describe('CRM phone normalize', () => {
  it('08xx menjadi 62', () => {
    assert.equal(normalizePhone('0812-3456-789'), '628123456789');
  });
  it('kosong tetap kosong', () => {
    assert.equal(normalizePhone(''), '');
  });
});

describe('CRM import dedup', () => {
  it('duplikat placeId dilewati', () => {
    const store = freshStore();
    const recs = [
      { name: 'Klinik A', phone: '0811', placeId: 'p1', city: 'Jakarta' },
      { name: 'Klinik A', phone: '0811', placeId: 'p1', city: 'Jakarta' }
    ];
    const r = importRecords(store, recs);
    assert.equal(r.added, 1);
    assert.equal(r.skipped, 1);
  });
  it('nama+telepon sama walau placeId beda tetap dilewati', () => {
    const store = freshStore();
    importRecords(store, [{ name: 'Klinik A', phone: '0811', placeId: 'p1', city: 'Jakarta' }]);
    const r = importRecords(store, [{ name: 'klinik a', phone: '0811', placeId: 'p2', city: 'Jakarta' }]);
    assert.equal(r.added, 0);
    assert.equal(r.skipped, 1);
  });
  it('nama sama kota sama tanpa kontak dilewati', () => {
    const store = freshStore();
    importRecords(store, [{ name: 'Warung B', city: 'Bandung' }]);
    const r = importRecords(store, [{ name: 'Warung B', city: 'Bandung' }]);
    assert.equal(r.added, 0);
  });
  it('tanpa nama dilewati', () => {
    const store = freshStore();
    const r = importRecords(store, [{ phone: '0811' }]);
    assert.equal(r.added, 0);
  });
});

describe('CRM stages', () => {
  it('pindah stage mencatat aktivitas', () => {
    const store = freshStore();
    importRecords(store, [{ name: 'Toko B', phone: '0822' }]);
    const id = store.leads[0].id;
    setStage(store, id, 'dihubungi', 'Telepon pertama');
    assert.equal(store.leads[0].stage, 'dihubungi');
    assert.equal(activitiesFor(store, id).length, 1);
  });
  it('stage tak dikenal ditolak', () => {
    const store = freshStore();
    importRecords(store, [{ name: 'Toko C' }]);
    assert.throws(() => setStage(store, store.leads[0].id, 'ngawur'), /Tahapan/);
  });
  it('deal menghapus jadwal tindak lanjut', () => {
    const store = freshStore();
    importRecords(store, [{ name: 'PT D' }]);
    const lead = store.leads[0];
    lead.nextFollowUp = new Date(Date.now() + 3600000).toISOString();
    setStage(store, lead.id, 'deal');
    assert.equal(lead.nextFollowUp, null);
  });
});

describe('CRM reminders & funnel', () => {
  it('pengingat lewat terdeteksi', () => {
    const store = freshStore();
    importRecords(store, [{ name: 'Bengkel E' }]);
    store.leads[0].nextFollowUp = new Date(Date.now() - 3600000).toISOString();
    assert.equal(remindersDue(store).length, 1);
  });
  it('funnel menghitung konversi', () => {
    const store = freshStore();
    importRecords(store, [{ name: 'A' }, { name: 'B' }]);
    setStage(store, store.leads[0].id, 'dihubungi');
    setStage(store, store.leads[0].id, 'deal');
    const f = funnelStats(store);
    assert.equal(f.total, 2);
    assert.equal(f.won, 1);
  });
  it('skor prioritas masuk akal', () => {
    assert.equal(leadScoreFor({ rating: 4.8, reviewsCount: 100, phone: '081' }), 5);
    assert.equal(leadScoreFor({}), 2);
  });
});

describe('CRM templates', () => {
  it('render bilingual mengisi variabel', () => {
    const tpl = defaultTemplates()[0];
    const id = applyTemplate(tpl, { nama: 'Budi', saya: 'Sari', usaha: 'Maju', kategori: 'klinik' }, 'id');
    const en = applyTemplate(tpl, { nama: 'Budi', saya: 'Sari', usaha: 'Maju', kategori: 'clinic' }, 'en');
    assert.match(id, /Budi/);
    assert.match(en, /Hello Budi/);
  });
});
