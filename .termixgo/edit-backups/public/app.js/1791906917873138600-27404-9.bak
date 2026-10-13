/**
 * GMaps CRM Pro - Frontend
 * Scraper Studio global + CRM leads + grafik + bilingual ID/EN.
 */

const I18N = {
  id: {
    tagline: 'Pencari usaha global + pengelola pelanggan', tabFinder: 'Scraper Studio', tabResults: 'Hasil', tabCrm: 'Pelanggan (CRM)', tabCharts: 'Grafik',
    menuLicense: 'Lisensi', menuLang: 'Bahasa / Language', menuAbout: 'Tentang', menuExit: 'Keluar',
    finderTitle: 'Cari calon pembeli', finderHint: 'Pilih negara, kategori usaha, lalu wilayah. Tinggal klik.',
    lblCountry: 'Negara', lblLang: 'Bahasa pencarian', lblCategory: 'Kategori usaha', lblRegion: 'Wilayah',
    lblKeyword: 'Kata kunci (opsional)', lblDepth: 'Kedalaman', lblProximity: 'Sertakan sekitar',
    btnStart: 'Mulai Mencari', btnStop: 'Hentikan', liveTitle: 'Proses berjalan', idleLine: 'Siaga — pilih kategori lalu mulai mencari',
    btnToCrm: 'Kirim semua ke CRM →', btnDownload: 'Unduh (.xlsx)',
    resultsTitle: 'Hasil pencarian', resultsCount: 'usaha ditemukan', allCountries: 'Semua negara', allCities: 'Semua kota', allCats: 'Semua jenis usaha', hasPhone: 'Ada telepon',
    colName: 'Nama usaha', colCat: 'Jenis usaha', colContact: 'Kontak', colAddr: 'Alamat', colRate: 'Rating', colAct: 'Aksi',
    crmRemind: 'Pengingat tindak lanjut', crmStats: 'Ringkasan', crmTitle: 'Alur pelanggan', btnAddLead: 'Tambah manual',
    chCities: 'Usaha per kota', chCats: 'Usaha per jenis', chCountries: 'Usaha per negara', chStages: 'Pelanggan per tahapan', chContact: 'Kelengkapan kontak', chRating: 'Sebaran rating',
    crmStage: 'Tahapan pelanggan', crmNext: 'Tindak lanjut berikutnya', crmOwner: 'Penanggung jawab', crmNote: 'Catatan', btnSave: 'Simpan', crmHistory: 'Riwayat', crmTemplate: 'Pola pesan',
    kpiTotal: 'Total usaha', kpiWa: 'No. WA valid', kpiRating: 'Rata-rata rating', kpiCities: 'Kota terjangkau',
    emptyResults: 'Belum ada data usaha yang ditemukan. Buka tab Scraper Studio untuk mulai mencari.',
    licCode: 'Kode aktivasi', licActivate: 'Aktifkan',
    phKeyword: 'cth: konsultan pajak, software house, cleaning service', phSearch: 'Cari nama bisnis, alamat, atau no. telepon…', phCrmSearch: 'Cari pelanggan…', phActivity: 'Tulis tindak lanjut…', phReff: 'Nomor referensi pembayaran'
  },
  en: {
    tagline: 'Global business finder + customer manager', tabFinder: 'Scraper Studio', tabResults: 'Results', tabCrm: 'Customers (CRM)', tabCharts: 'Charts',
    menuLicense: 'License', menuLang: 'Language / Bahasa', menuAbout: 'About', menuExit: 'Exit',
    finderTitle: 'Find prospects', finderHint: 'Pick a country, a business type, then areas. Just click.',
    lblCountry: 'Country', lblLang: 'Search language', lblCategory: 'Business type', lblRegion: 'Areas',
    lblKeyword: 'Keyword (optional)', lblDepth: 'Depth', lblProximity: 'Include nearby',
    btnStart: 'Start Search', btnStop: 'Stop', liveTitle: 'Live progress', idleLine: 'Ready — pick a category, then start',
    btnToCrm: 'Send all to CRM →', btnDownload: 'Download (.xlsx)',
    resultsTitle: 'Search results', resultsCount: 'businesses found', allCountries: 'All countries', allCities: 'All cities', allCats: 'All types', hasPhone: 'Has phone',
    colName: 'Business name', colCat: 'Type', colContact: 'Contact', colAddr: 'Address', colRate: 'Rating', colAct: 'Actions',
    crmRemind: 'Follow-up reminders', crmStats: 'Summary', crmTitle: 'Customer pipeline', btnAddLead: 'Add manually',
    chCities: 'Businesses by city', chCats: 'Businesses by type', chCountries: 'Businesses by country', chStages: 'Leads by stage', chContact: 'Contact completeness', chRating: 'Rating spread',
    crmStage: 'Lead stage', crmNext: 'Next follow-up', crmOwner: 'Owner', crmNote: 'Notes', btnSave: 'Save', crmHistory: 'History', crmTemplate: 'Message templates',
    kpiTotal: 'Total businesses', kpiWa: 'Valid WA numbers', kpiRating: 'Avg. rating', kpiCities: 'Cities covered',
    emptyResults: 'No businesses found yet. Go to Scraper Studio tab to start searching.',
    licCode: 'Activation code', licActivate: 'Activate',
    phKeyword: 'e.g. tax consultant, software house, cleaning service', phSearch: 'Search business name, address, or phone…', phCrmSearch: 'Search customers…', phActivity: 'Write a follow-up…', phReff: 'Payment reference number'
  }
};

const STAGE_LABEL = {
  id: { baru: 'Baru', dihubungi: 'Sudah Dihubungi', tindak_lanjut: 'Tindak Lanjut', negosiasi: 'Negosiasi', deal: 'Berhasil', gagal: 'Gagal' },
  en: { baru: 'New', dihubungi: 'Contacted', tindak_lanjut: 'Follow-up', negosiasi: 'Negotiating', deal: 'Won', gagal: 'Lost' }
};
const STAGE_IDS = ['baru', 'dihubungi', 'tindak_lanjut', 'negosiasi', 'deal', 'gagal'];

let uiLang = localStorage.getItem('gcrm-lang') || 'id';
let catalog = { sectors: [], countries: [] };
let allRecords = [];
let filteredRecords = [];
let currentPage = 1;
const pageSize = 40;
let eventSource = null;
let isScraping = false;
let selectedCountry = 'ID';
let selectedCatId = 'konsultan_pajak';
let selectedCities = new Set();
let searchLang = 'id';
let licenseState = null;
let licenseModalMode = 'onboard';
let cachedPlans = null;
let autoTimer = null;
let checkoutAt = null;
let crmLeads = [];
let crmStats = null;
let openLeadId = null;

const $ = (id) => document.getElementById(id);

function t(key) { return (I18N[uiLang] && I18N[uiLang][key]) || I18N.id[key] || key; }

function applyLang() {
  document.documentElement.lang = uiLang === 'en' ? 'en' : 'id';
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $('langId').classList.toggle('active', uiLang === 'id');
  $('langEn').classList.toggle('active', uiLang === 'en');
  renderSectors();
  renderRegions();
  applyFilters();
  renderKanban();
  renderCharts();
}

function toast(msg, kind = 'info') {
  const stack = $('toastStack');
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = msg;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3600);
  while (stack.children.length > 4) stack.firstChild.remove();
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function safeUrl(raw) {
  if (!raw) return '';
  try {
    const u = new URL(String(raw), location.origin);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
  } catch { /* invalid */ }
  return '';
}
function waLink(phone) {
  let d = String(phone || '').replace(/[^0-9]/g, '');
  if (!d) return '';
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return `https://wa.me/${d}`;
}

// ---------- Tabs ----------
function setupTabs() {
  document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      const panel = $(btn.dataset.tab);
      if (panel) panel.classList.add('active');
      if (btn.dataset.tab === 'tab-charts') renderCharts();
      if (btn.dataset.tab === 'tab-crm') { loadCrm(); }
    });
  });
}

// ---------- Catalog ----------
async function loadCatalog() {
  try {
    const res = await fetch('/api/catalog');
    if (!res.ok) return;
    catalog = await res.json();
    const sel = $('selCountry');
    sel.innerHTML = catalog.countries.map((c) => `<option value="${esc(c.id)}">${esc(uiLang === 'en' ? c.nameEn : c.nameId)}</option>`).join('');
    sel.value = selectedCountry;
    renderSectors();
    renderRegions();
    updateScopeHint();
  } catch (e) { console.warn('catalog', e); }
}

function sectorName(s) { return uiLang === 'en' ? s.nameEn : s.nameId; }
function catLabel(c) { return uiLang === 'en' ? c.labelEn : c.labelId; }

function renderSectors() {
  const box = $('sectorContainer');
  if (!box || !catalog.sectors) return;
  box.innerHTML = catalog.sectors.map((sec) => `
    <div><div class="sector-group-label">${esc(sectorName(sec))}</div>
    <div class="pill-container">${sec.categories.map((c) =>
      `<span class="category-pill ${c.id === selectedCatId ? 'selected' : ''}" data-cat="${esc(c.id)}">${esc(catLabel(c))}</span>`).join('')}
    </div></div>`).join('');
  box.querySelectorAll('.category-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      selectedCatId = pill.dataset.cat;
      box.querySelectorAll('.category-pill').forEach((p) => p.classList.toggle('selected', p === pill));
      const sec = catalog.sectors.flatMap((s) => s.categories).find((c) => c.id === selectedCatId);
      if (sec) {
        const kws = uiLang === 'en' ? sec.keywordsEn : sec.keywordsId;
        $('customKeywordInput').value = kws[0] || '';
      }
      updateScopeHint();
    });
  });
}

function countryCities() {
  const c = catalog.countries.find((x) => x.id === selectedCountry);
  if (!c) return [];
  return c.regions.flatMap((r) => r.cities.map((city) => ({ ...city, regionName: uiLang === 'en' ? r.nameEn : r.nameId })));
}

function renderRegions() {
  const box = $('regionContainer');
  if (!box) return;
  const cities = countryCities();
  const byRegion = {};
  cities.forEach((c) => { (byRegion[c.regionName] = byRegion[c.regionName] || []).push(c); });
  box.innerHTML = Object.entries(byRegion).map(([region, list]) => `
    <div><div class="sector-group-label">${esc(region)}</div>
    <div class="pill-container">${list.map((c) =>
      `<span class="city-pill ${selectedCities.has(c.name) ? 'selected' : ''}" data-city="${esc(c.name)}">${esc(c.name)}</span>`).join('')}
    </div></div>`).join('');
  box.querySelectorAll('.city-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const n = pill.dataset.city;
      if (selectedCities.has(n)) { selectedCities.delete(n); pill.classList.remove('selected'); }
      else { selectedCities.add(n); pill.classList.add('selected'); }
      updateScopeHint();
    });
  });
}

function currentKeyword() {
  const custom = ($('customKeywordInput').value || '').trim();
  if (custom.length >= 2) return custom;
  const cat = catalog.sectors.flatMap((s) => s.categories).find((c) => c.id === selectedCatId);
  if (!cat) return 'jasa';
  const kws = searchLang === 'en' ? cat.keywordsEn : cat.keywordsId;
  return kws[0] || cat.labelId;
}

function updateScopeHint() {
  const hint = $('scopeHint');
  if (!hint) return;
  const n = selectedCities.size;
  if (!n) { hint.textContent = uiLang === 'en' ? 'Pick at least 1 area.' : 'Pilih minimal 1 wilayah.'; return; }
  const depth = parseInt($('studioDepthSelect').value, 10) || 2;
  const est = n * 12 * depth * 20;
  const names = [...selectedCities].slice(0, 3).join(', ') + (n > 3 ? ` +${n - 3}` : '');
  hint.textContent = uiLang === 'en'
    ? `${names} — about ${est.toLocaleString('en-US')} listing slots before dedup.`
    : `${names} — perkiraan ±${est.toLocaleString('id-ID')} slot usaha sebelum disaring ganda.`;
}

// ---------- Finder run ----------
function setScraping(on) {
  isScraping = on;
  $('btnRunScrape').style.display = on ? 'none' : '';
  $('btnAbortScrape').style.display = on ? '' : 'none';
  $('scraperStateBadge').textContent = on ? (uiLang === 'en' ? 'Searching…' : 'Mencari…') : 'Idle';
  $('scraperStateBadge').className = on ? 'tag tag-amber' : 'tag tag-emerald';
  $('scrapeVisual').classList.toggle('scanning', on);
  const line = $('scrapeStatusLine');
  if (line) {
    line.textContent = on
      ? (uiLang === 'en' ? 'Searching Google Maps — live…' : 'Mencari di Google Maps — langsung…')
      : t('idleLine');
  }
  if (!on) {
    const pct = $('scrapePct');
    if (pct && $('liveProgressBar').style.width === '0%') {
      $('liveProgressWrap').setAttribute('aria-valuenow', '0');
    }
  }
}

/** Sinkronisasi status awal: bila server sedang mencari (mis. reload di tengah job), UI ikut mode berjalan. */
async function syncScrapingState() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return;
    const data = await res.json();
    if (data.scraping && !isScraping) {
      setScraping(true);
      logConsole(uiLang === 'en' ? 'Reconnected to a running search.' : 'Tersambung ke pencarian yang sedang berjalan.');
    }
  } catch { /* server belum siap, abaikan */ }
}

function logConsole(text) {
  const box = $('consoleLiveBox');
  const time = new Date().toLocaleTimeString(uiLang === 'en' ? 'en-US' : 'id-ID');
  box.textContent += `[${time}] ${text}\n`;
  box.scrollTop = box.scrollHeight;
}

function connectSSE() {
  if (eventSource) eventSource.close();
  eventSource = new EventSource('/api/scrape/stream');
  eventSource.onmessage = (ev) => {
    try { handleSSE(JSON.parse(ev.data)); } catch (e) { console.warn(e); }
  };
}

function handleSSE(msg) {
  if (msg.type === 'log') logConsole(msg.text);
  else if (msg.type === 'progress') {
    const pct = Math.max(0, Math.min(100, msg.percent || 0));
    $('liveProgressBar').style.width = pct + '%';
    $('liveProgressWrap').setAttribute('aria-valuenow', String(pct));
    $('scrapePct').textContent = pct + '%';
    $('liveProgressCounter').textContent = uiLang === 'en'
      ? `${Number(msg.totalRecords || 0).toLocaleString('en-US')} businesses`
      : `${Number(msg.totalRecords || 0).toLocaleString('id-ID')} usaha`;
  } else if (msg.type === 'new_batch' && Array.isArray(msg.items)) {
    allRecords.unshift(...msg.items);
    applyFilters();
  } else if (msg.type === 'status') {
    if (msg.running) setScraping(true);
    else {
      setScraping(false);
      if (msg.finished) { toast(uiLang === 'en' ? 'Search finished.' : 'Pencarian selesai.', 'success'); loadDataset(); }
      if (msg.error) toast(msg.error, 'error');
    }
  }
}

function licenseBlocked() {
  if (licenseState?.blocked) {
    toast(uiLang === 'en' ? 'Trial has ended — activate to continue.' : 'Masa coba habis — aktifkan untuk lanjut.', 'warn');
    openLicenseModal('expired');
    return true;
  }
  return false;
}

async function startSearch() {
  if (isScraping || licenseBlocked()) return;
  const cities = [...selectedCities];
  if (!cities.length) { toast(uiLang === 'en' ? 'Pick at least 1 area.' : 'Pilih minimal 1 wilayah.', 'warn'); return; }
  const keyword = currentKeyword();
  const depth = parseInt($('studioDepthSelect').value, 10) || 2;
  const cat = catalog.sectors.flatMap((s) => s.categories).find((c) => c.id === selectedCatId);
  const kws = cat ? (searchLang === 'en' ? cat.keywordsEn : cat.keywordsId).slice(1, 4) : [];
  setScraping(true);
  logConsole((uiLang === 'en' ? 'Searching' : 'Mencari') + ` "${keyword}" — ${cities.length} areas…`);
  try {
    const res = await fetch('/api/finder/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, keywordVariants: kws, cities, depth, lang: searchLang })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memulai');
    }
    const started = await res.json().catch(() => null);
    if (started?.scope) logConsole(`${started.scope.totalQueries} queries × ${started.scope.depth}`);
  } catch (e) {
    toast(e.message, 'error');
    setScraping(false);
  }
}

// ---------- Results ----------
async function loadDataset() {
  try {
    const res = await fetch('/api/finder/data');
    if (!res.ok) return;
    const data = await res.json();
    allRecords = data.records || [];
    populateFilters();
    applyFilters();
  } catch (e) { console.warn(e); }
}

function populateFilters() {
  const fC = $('filterCountry');
  const curC = fC.value;
  fC.innerHTML = `<option value="">${t('allCountries')}</option>` + catalog.countries.map((c) =>
    `<option value="${esc(c.id)}">${esc(uiLang === 'en' ? c.nameEn : c.nameId)}</option>`).join('');
  fC.value = curC;
  const cities = [...new Set(allRecords.map((r) => r.city).filter(Boolean))].sort();
  const fCity = $('filterCity');
  const curCity = fCity.value;
  fCity.innerHTML = `<option value="">${t('allCities')}</option>` + cities.map((c) => `<option>${esc(c)}</option>`).join('');
  fCity.value = curCity;
  const cats = [...new Set(allRecords.map((r) => r.category).filter(Boolean))].sort();
  const fCat = $('filterCategory');
  const curCat = fCat.value;
  fCat.innerHTML = `<option value="">${t('allCats')}</option>` + cats.map((c) => `<option>${esc(c)}</option>`).join('');
  fCat.value = curCat;
}

function applyFilters() {
  const q = ($('filterSearch').value || '').toLowerCase().trim();
  const fc = $('filterCountry').value;
  const fcity = $('filterCity').value;
  const fcat = $('filterCategory').value;
  const phoneOnly = $('filterPhoneOnly').checked;
  filteredRecords = allRecords.filter((r) => {
    if (fc && r.country !== fc) return false;
    if (fcity && r.city !== fcity) return false;
    if (fcat && r.category !== fcat) return false;
    if (phoneOnly && !r.phone) return false;
    if (q && !((r.name || '').toLowerCase().includes(q) || (r.address || '').toLowerCase().includes(q) || (r.phone || '').includes(q))) return false;
    return true;
  });
  currentPage = 1;
  $('filterMatchCount').textContent = filteredRecords.length.toLocaleString(uiLang === 'en' ? 'en-US' : 'id-ID');
  renderTable();
}

/** WA valid = nomor HP diawali 08/628 (ID) atau cukup digit internasional. */
function isWaValid(phone) {
  const d = String(phone || '').replace(/[^0-9]/g, '');
  if (d.length < 9 || d.length > 16) return false;
  if (/^(62|60|81|86|82|1|39|31|49|33)/.test(d)) return true;
  return d.startsWith('08') || d.startsWith('0');
}

/** Ringkasan di atas hasil: total, WA valid + %, rating, kota + daftar. */
function updateResultsKpi() {
  const rows = filteredRecords.length ? filteredRecords : [];
  const fmt = (n) => n.toLocaleString(uiLang === 'en' ? 'en-US' : 'id-ID');
  const en = uiLang === 'en';
  $('kpiTotal').textContent = fmt(rows.length);
  $('kpiTotalCap').textContent = en ? 'unique verified listings' : 'usaha unik terverifikasi';
  const waCount = rows.filter((r) => isWaValid(r.phone)).length;
  $('kpiWa').textContent = fmt(waCount);
  const pct = rows.length ? Math.round((waCount / rows.length) * 100) : 0;
  $('kpiWaPct').textContent = en ? `${pct}% have contact numbers` : `${pct}% memiliki nomor kontak`;
  const ratings = rows.map((r) => r.rating).filter((r) => typeof r === 'number' && r > 0);
  $('kpiRating').textContent = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '-';
  $('kpiRatingCap').textContent = en ? 'stars from Google reviews' : 'bintang dari ulasan Google';
  const cities = [...new Set(rows.map((r) => r.city).filter(Boolean))];
  $('kpiCities').textContent = fmt(cities.length);
  $('kpiCitiesList').textContent = cities.length
    ? cities.slice(0, 4).join(', ') + (cities.length > 4 ? ` +${cities.length - 4}` : '')
    : (en ? 'City and district areas' : 'Area kota dan kecamatan');
}

function renderTable() {
  const body = $('tableBody');
  const total = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  if (currentPage > total) currentPage = total;
  const start = (currentPage - 1) * pageSize;
  const items = filteredRecords.slice(start, start + pageSize);
  updateResultsKpi();
  body.innerHTML = items.map((r, i) => {
    const wa = (r.phone && waLink(r.phone)) ? `<a href="${waLink(r.phone)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="tag tag-ok" style="text-decoration:none">WA</a>` : '';
    const maps = safeUrl(r.mapsUrl) ? `<a href="${safeUrl(r.mapsUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="tag tag-blue" style="text-decoration:none">Maps</a>` : '-';
    const toCrm = `<button class="btn ghost" data-crm="${i}" style="padding:4px 10px;font-size:0.74rem">+ CRM</button>`;
    const ratingTxt = (typeof r.rating === 'number' && r.rating > 0)
      ? `<span class="tag tag-amber">★ ${r.rating}</span> <span class="hint">(${Number(r.reviewsCount) || 0})</span>` : '<span class="hint">-</span>';
    return `<tr data-idx="${start + i}">
      <td>${start + i + 1}</td>
      <td><span class="cell-name">${esc(r.name)}</span><br><span class="cell-sub">${esc(r.city || '')} · ${esc(r.country || '')}</span></td>
      <td class="cell-cat"><span class="tag cat-tag" title="${esc(r.category || '')}">${esc(r.category || '')}</span></td>
      <td class="cell-contact">${r.phone ? `<span class="phone-badge">${esc(r.phone)}</span>${wa ? `<br>${wa}` : ''}` : '<span class="hint">-</span>'}</td>
      <td style="max-width:260px">${esc(r.address || '-')}</td>
      <td class="cell-rating">${ratingTxt}</td>
      <td class="cell-actions">${maps} ${toCrm}</td></tr>`;
  }).join('') || `<tr><td colspan="7" class="table-empty">${esc(t('emptyResults'))}</td></tr>`;
  $('pageCurrent').textContent = currentPage;
  $('paginationInfo').textContent = `${filteredRecords.length} → ${start + 1}-${Math.min(start + pageSize, filteredRecords.length)}`;
  $('btnPrevPage').disabled = currentPage <= 1;
  $('btnNextPage').disabled = currentPage >= total;
  body.querySelectorAll('tr[data-idx]').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('a,button')) return;
      openLeadDrawer(filteredRecords[parseInt(row.dataset.idx, 10)], 'finder');
    });
  });
  body.querySelectorAll('[data-crm]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const rec = filteredRecords[start + parseInt(btn.dataset.crm, 10)];
      await sendToCrm([rec]);
    });
  });
}

async function sendToCrm(records) {
  if (licenseBlocked()) return;
  const list = (records || []).filter((r) => r && r.name);
  if (!list.length) {
    toast(uiLang === 'en' ? 'Nothing to send — no results yet.' : 'Belum ada hasil untuk dikirim ke CRM.', 'warn');
    return;
  }
  try {
    const res = await fetch('/api/crm/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, source: 'finder' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal');
    toast(uiLang === 'en' ? `${data.added} added to CRM.` : `${data.added} masuk CRM, ${data.skipped} sudah ada.`, 'success');
    loadCrm();
  } catch (e) { toast(e.message, 'error'); }
}

// ---------- CRM ----------
async function loadCrm() {
  try {
    const [leadsRes, statsRes, remRes] = await Promise.all([
      fetch('/api/crm/leads'), fetch('/api/crm/stats'), fetch('/api/crm/reminders')
    ]);
    const leads = await leadsRes.json();
    crmLeads = leads.leads || [];
    crmStats = await statsRes.json();
    const rem = await remRes.json();
    renderKanban();
    renderReminders([...(rem.due || []), ...(rem.upcoming || [])]);
    renderFunnel();
  } catch (e) { console.warn(e); }
}

function renderKanban() {
  const box = $('kanban');
  const q = ($('crmSearch').value || '').toLowerCase();
  const list = crmLeads.filter((l) =>
    !q || (l.name || '').toLowerCase().includes(q) || (l.city || '').toLowerCase().includes(q) || (l.phone || '').includes(q));
  box.innerHTML = STAGE_IDS.map((st) => {
    const items = list.filter((l) => l.stage === st);
    return `<div class="kanban-col" data-stage="${st}">
      <h4>${esc(STAGE_LABEL[uiLang][st])} <span>${items.length}</span></h4>
      ${items.map((l) => `<div class="lead-card" draggable="true" data-id="${l.id}">
        <span class="lc-score">${'★'.repeat(Math.min(5, l.score || 1))}</span>
        <div class="lc-name">${esc(l.name)}</div>
        <div class="lc-meta">${esc(l.city || '')} ${l.phone ? '· ' + esc(l.phone) : ''}</div>
      </div>`).join('')}
    </div>`;
  }).join('');
  box.querySelectorAll('.lead-card').forEach((card) => {
    card.addEventListener('click', () => {
      const lead = crmLeads.find((l) => l.id === card.dataset.id);
      if (lead) openLeadDrawer(lead, 'crm');
    });
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
  box.querySelectorAll('.kanban-col').forEach((col) => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('dragover'); });
    col.addEventListener('dragleave', () => col.classList.remove('dragover'));
    col.addEventListener('drop', async (e) => {
      e.preventDefault();
      col.classList.remove('dragover');
      const id = e.dataTransfer.getData('text/plain');
      await moveLeadStage(id, col.dataset.stage);
    });
  });
}

async function moveLeadStage(id, stage) {
  try {
    const res = await fetch(`/api/crm/leads/${encodeURIComponent(id)}/stage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal');
    await loadCrm();
  } catch (e) { toast(e.message, 'error'); }
}

function renderReminders(items) {
  const box = $('reminderList');
  const seen = new Set();
  const uniq = items.filter((l) => (seen.has(l.id) ? false : (seen.add(l.id), true))).slice(0, 12);
  box.innerHTML = uniq.map((l) => {
    const overdue = l.nextFollowUp && new Date(l.nextFollowUp) < new Date();
    const when = l.nextFollowUp ? new Date(l.nextFollowUp).toLocaleString(uiLang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
    return `<div class="reminder-card ${overdue ? 'overdue' : ''}" data-id="${l.id}"><strong>${esc(l.name)}</strong><br>${esc(when)} · ${esc(STAGE_LABEL[uiLang][l.stage] || l.stage)}</div>`;
  }).join('') || `<p class="hint">${uiLang === 'en' ? 'No reminders. Nice.' : 'Tidak ada pengingat. Bagus.'}</p>`;
  box.querySelectorAll('.reminder-card').forEach((c) => {
    c.addEventListener('click', () => {
      const lead = crmLeads.find((l) => l.id === c.dataset.id);
      if (lead) openLeadDrawer(lead, 'crm');
    });
  });
}

function renderFunnel() {
  const box = $('crmFunnel');
  if (!crmStats) return;
  box.innerHTML = STAGE_IDS.map((st) =>
    `<div class="funnel-row"><span>${esc(STAGE_LABEL[uiLang][st])}</span><strong>${crmStats.funnel.byStage[st] || 0}</strong></div>`
  ).join('') + `<div class="funnel-row"><span>${uiLang === 'en' ? 'Conversion' : 'Konversi'}</span><strong>${crmStats.funnel.conversionPct}%</strong></div>`;
}

// ---------- Drawer ----------
function openLeadDrawer(item, kind) {
  openLeadId = kind === 'crm' ? item.id : null;
  $('drawerCategory').textContent = item.category || '';
  $('drawerName').textContent = item.name || '';
  $('drawerCity').textContent = `${item.city || ''}${item.country ? ' · ' + item.country : ''}`;
  $('drawerPhone').textContent = item.phone || '-';
  const wa = $('btnOpenWA');
  if (item.phone && waLink(item.phone)) { wa.href = waLink(item.phone); wa.style.display = ''; } else wa.style.display = 'none';
  $('btnCopyPhone').onclick = () => navigator.clipboard?.writeText(item.phone || '').then(() => toast('Disalin'));
  $('drawerAddress').textContent = item.address || '-';
  if (item.rating) { $('drawerRating').textContent = `★ ${item.rating}`; $('drawerReviews').textContent = `${item.reviewsCount || 0} ulasan`; }
  else { $('drawerRating').textContent = ''; $('drawerReviews').textContent = '-'; }
  const maps = safeUrl(item.mapsUrl);
  $('drawerMapsLink').style.display = maps ? '' : 'none';
  if (maps) $('drawerMapsLink').href = maps;
  const web = safeUrl(item.website);
  $('drawerWebLink').style.display = web ? '' : 'none';
  if (web) $('drawerWebLink').href = web;
  renderDrawerStages(item.stage || 'baru', kind);
  $('drawerNext').value = item.nextFollowUp ? String(item.nextFollowUp).slice(0, 16) : '';
  $('drawerOwner').value = item.owner || '';
  $('drawerNote').value = item.notes || '';
  if (kind === 'crm') loadActivities(item.id);
  else { $('drawerActivities').innerHTML = `<p class="hint">${uiLang === 'en' ? 'Send to CRM to track follow-ups.' : 'Kirim ke CRM untuk mencatat tindak lanjut.'}</p>`; }
  loadTemplates(item);
  $('drawerBackdrop').classList.add('active');
  $('detailDrawer').classList.add('open');
}

function renderDrawerStages(stage, kind) {
  const box = $('drawerStages');
  box.innerHTML = STAGE_IDS.map((st) =>
    `<button data-st="${st}" class="${st === stage ? 'active' : ''}">${esc(STAGE_LABEL[uiLang][st])}</button>`).join('') +
    (kind === 'finder' ? `<button data-crm-add="1" class="active">+ CRM</button>` : '');
  box.querySelectorAll('[data-st]').forEach((b) => {
    b.addEventListener('click', async () => {
      if (kind === 'finder') { toast(uiLang === 'en' ? 'Send to CRM first.' : 'Kirim ke CRM dulu.', 'warn'); return; }
      await moveLeadStage(openLeadId, b.dataset.st);
      renderDrawerStages(b.dataset.st, kind);
    });
  });
  const add = box.querySelector('[data-crm-add]');
  if (add) add.addEventListener('click', async () => {
    const rec = allRecords.find((r) => r.name === $('drawerName').textContent);
    if (rec) { await sendToCrm([rec]); closeDrawer(); }
  });
}

async function loadActivities(id) {
  try {
    const res = await fetch(`/api/crm/leads/${encodeURIComponent(id)}`);
    const data = await res.json();
    $('drawerActivities').innerHTML = (data.activities || []).map((a) =>
      `<div class="activity-item"><strong>${esc(a.type)}</strong> · ${esc(new Date(a.at).toLocaleString())}<br>${esc(a.text)}</div>`
    ).join('') || `<p class="hint">-</p>`;
  } catch { /* abaikan */ }
}

async function loadTemplates(lead) {
  try {
    const res = await fetch(`/api/crm/templates?lang=${uiLang}`);
    const data = await res.json();
    const sel = $('selTemplate');
    sel.innerHTML = (data.templates || []).map((tpl) => `<option value="${esc(tpl.id)}">${esc(tpl.name)}</option>`).join('');
    const render = async () => {
      const tpl = (data.templates || []).find((x) => x.id === sel.value);
      if (!tpl) return;
      let text = tpl.body
        .replace(/\{nama\}/g, lead?.name || '')
        .replace(/\{kategori\}/g, lead?.category || '');
      $('templatePreview').textContent = text;
      const wa = waLink(lead?.phone);
      $('btnSendTemplateWA').href = wa ? `${wa}?text=${encodeURIComponent(text)}` : '#';
      $('btnSendTemplateWA').style.display = wa ? '' : 'none';
    };
    sel.onchange = render;
    await render();
    $('btnCopyTemplate').onclick = () => navigator.clipboard?.writeText($('templatePreview').textContent || '').then(() => toast('Disalin'));
  } catch { /* abaikan */ }
}

function closeDrawer() {
  $('drawerBackdrop').classList.remove('active');
  $('detailDrawer').classList.remove('open');
  openLeadId = null;
}

// ---------- Charts ----------
function barChart(el, rows, color) {
  if (!el) return;
  const max = Math.max(1, ...(rows.map((r) => r.count)));
  el.innerHTML = rows.map((r) => {
    const pct = ((r.count / max) * 100).toFixed(1);
    return `<div class="bar-row"><span class="bar-label" title="${esc(r.name)}">${esc(r.name)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;${color ? `background:${color};` : ''}"></div></div>
      <span class="bar-value">${r.count.toLocaleString()}</span></div>`;
  }).join('') || '<p class="hint">-</p>';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.querySelectorAll('.bar-fill').forEach((f) => { f.style.width = f.style.width; });
  }));
}

async function renderCharts() {
  const by = (arr, fn, top = 8) => {
    const m = {};
    arr.forEach((r) => { const k = fn(r) || (uiLang === 'en' ? 'Other' : 'Lainnya'); m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, top).map(([name, count]) => ({ name, count }));
  };
  barChart($('chartCities'), by(allRecords, (r) => r.city));
  barChart($('chartCategories'), by(allRecords, (r) => r.category), 8);
  const cats = $('chartCategories');
  if (cats) cats.querySelectorAll('.bar-fill').forEach((f) => f.style.background = 'linear-gradient(90deg,#0ea5e9,#1d4ed8)');
  barChart($('chartCountries'), by(allRecords, (r) => r.country));
  try {
    const res = await fetch('/api/crm/stats');
    const s = await res.json();
    barChart($('chartStages'), STAGE_IDS.map((st) => ({ name: STAGE_LABEL[uiLang][st], count: s.funnel.byStage[st] || 0 })));
  } catch { /* abaikan */ }
  const withPhone = allRecords.filter((r) => r.phone).length;
  barChart($('chartContacts'), [
    { name: uiLang === 'en' ? 'Has phone' : 'Ada telepon', count: withPhone },
    { name: uiLang === 'en' ? 'No phone' : 'Tanpa telepon', count: allRecords.length - withPhone }
  ]);
  let r5 = 0, r45 = 0, r40 = 0, low = 0, none = 0;
  allRecords.forEach((r) => {
    if (typeof r.rating !== 'number' || r.rating <= 0) none++;
    else if (r.rating >= 4.8) r5++;
    else if (r.rating >= 4.5) r45++;
    else if (r.rating >= 4.0) r40++;
    else low++;
  });
  barChart($('chartRatings'), [
    { name: '4.8–5.0', count: r5 }, { name: '4.5–4.7', count: r45 },
    { name: '4.0–4.4', count: r40 }, { name: '< 4.0', count: low }, { name: '-', count: none }
  ]);
}

// ---------- License ----------
async function fetchLicense() {
  try {
    const res = await fetch('/api/license/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    licenseState = await res.json();
  } catch (e) {
    licenseState = null;
    toast((uiLang === 'en' ? 'Cannot reach license server: ' : 'Tidak bisa menghubungi server lisensi: ') + e.message, 'error');
  }
  renderLicense();
}

function renderLicense() {
  const lic = licenseState;
  if (!lic) {
    $('licensePillText').textContent = uiLang === 'en' ? 'Offline' : 'Luring';
    $('licenseDot').className = 'license-dot bad';
    openLicenseModal('onboard');
    return;
  }
  $('licenseInstallId').textContent = lic.installId || '-';
  let label, cls;
  if (lic.activated) { label = uiLang === 'en' ? `Active ${lic.serialMasked || ''}` : `Aktif ${lic.serialMasked || ''}`; cls = 'ok'; }
  else if (lic.expired) { label = uiLang === 'en' ? 'Trial ended' : 'Trial habis'; cls = 'bad'; }
  else {
    label = lic.hoursLeft <= 48 && lic.daysLeft <= 1
      ? (uiLang === 'en' ? `Trial: ${lic.hoursLeft}h left` : `Trial: sisa ${lic.hoursLeft} jam`)
      : (uiLang === 'en' ? `Trial: ${lic.daysLeft} day` : `Trial: ${lic.daysLeft} hari`);
    cls = 'warn';
  }
  $('licensePillText').textContent = label;
  $('licenseDot').className = `license-dot ${cls}`;
  $('titlebarLicense').textContent = label;
  const blocked = lic.blocked;
  $('btnRunScrape').disabled = blocked;
  $('btnExportFinder').disabled = blocked;
  if (!lic.onboarded) openLicenseModal('onboard');
  else if (blocked) openLicenseModal('expired');
  else closeLicenseModal();
}

function openLicenseModal(mode) {
  licenseModalMode = mode;
  const modal = $('licenseModal');
  modal.hidden = false;
  $('licenseError').hidden = true;
  if (mode === 'expired') {
    $('licenseTitle').textContent = uiLang === 'en' ? 'Trial Has Ended' : 'Masa Coba Habis';
    $('licenseDesc').textContent = uiLang === 'en' ? 'Enter your activation code to unlock everything.' : 'Masukkan kode aktivasi untuk membuka semua fitur.';
    $('btnContinueTrial').style.display = 'none';
  } else if (mode === 'status') {
    $('licenseTitle').textContent = uiLang === 'en' ? 'License Status' : 'Status Lisensi';
    $('licenseDesc').textContent = licenseState?.activated
      ? `${$('licensePillText').textContent}` : (uiLang === 'en' ? 'Trial mode.' : 'Mode coba gratis.');
    $('btnContinueTrial').style.display = '';
    $('btnContinueTrialText').textContent = uiLang === 'en' ? 'Close' : 'Tutup';
  } else {
    $('licenseTitle').textContent = uiLang === 'en' ? 'Welcome' : 'Selamat Datang';
    $('licenseDesc').textContent = uiLang === 'en' ? 'Enter your code, or try free for 1 day.' : 'Masukkan kode aktivasi, atau coba gratis 1 hari.';
    $('btnContinueTrial').style.display = '';
    $('btnContinueTrialText').textContent = uiLang === 'en' ? 'Try free for 1 day' : 'Coba gratis 1 hari';
  }
  $('btnDeactivateLicense').hidden = !(mode === 'status' && licenseState?.activated);
  loadPlans();
}

function closeLicenseModal() {
  $('licenseModal').hidden = true;
  stopPolling();
}

async function loadPlans() {
  const box = $('licensePlansGrid');
  if (cachedPlans) { renderPlans(cachedPlans); return; }
  try {
    const res = await fetch('/api/payment/options');
    const data = await res.json();
    if (data.plans?.length) { cachedPlans = data.plans; renderPlans(cachedPlans); return; }
  } catch { /* fallback */ }
  renderPlans([
    { id: 'harian', shortLabel: '1 Hari', amountLabel: 'Rp15.000', days: 1, url: '' },
    { id: 'mingguan', shortLabel: '7 Hari', amountLabel: 'Rp50.000', days: 7, url: '' }
  ]);
}

function renderPlans(plans) {
  const box = $('licensePlansGrid');
  box.innerHTML = [...plans].sort((a, b) => a.days - b.days).map((p) => `
    <div class="license-plan-card" data-url="${esc(p.url)}" role="button" tabindex="0">
      ${p.days >= 7 ? '<span class="license-plan-badge">Hemat</span>' : ''}
      <div class="license-plan-name">${esc(p.shortLabel)}</div>
      <div class="license-plan-price">${esc(p.amountLabel)}</div>
      <div class="license-plan-cta"><span>${uiLang === 'en' ? 'Buy' : 'Beli Paket'}</span></div>
    </div>`).join('');
  box.querySelectorAll('.license-plan-card').forEach((card) => {
    const go = () => {
      if (!card.dataset.url) { toast(uiLang === 'en' ? 'Payment link not set yet.' : 'Link pembayaran belum diset.', 'warn'); return; }
      if (window.electronAPI?.openExternal) window.electronAPI.openExternal(card.dataset.url);
      else window.open(card.dataset.url, '_blank', 'noopener');
      startPolling();
    };
    card.addEventListener('click', go);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
}

function startPolling() {
  checkoutAt = new Date().toISOString();
  $('licenseAutoStatus').hidden = false;
  $('licenseAutoStatusText').textContent = uiLang === 'en' ? 'Waiting for payment… (auto-activates)' : 'Menunggu pembayaran… (otomatis aktif)';
  stopPolling();
  let n = 0;
  autoTimer = setInterval(async () => {
    if (++n > 100 || licenseState?.activated) { stopPolling(); return; }
    try {
      const res = await fetch('/api/payment/auto-activate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ since: checkoutAt })
      });
      const data = await res.json();
      if (data.found && data.status) {
        licenseState = data.status;
        renderLicense();
        stopPolling();
        toast(uiLang === 'en' ? 'Payment verified — active!' : 'Pembayaran terverifikasi — aktif!', 'success');
      }
    } catch { /* lanjut */ }
  }, 3000);
}

function stopPolling() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

async function handleActivate() {
  const serial = ($('licenseSerialInput').value || '').trim();
  if (!serial) { toast(uiLang === 'en' ? 'Enter the code first.' : 'Isi kode dulu.', 'warn'); return; }
  await activateSerial(serial);
  $('licenseSerialInput').value = '';
}

/** Aktivasi 1-klik dari deep-link gmaps-crm-pro://activate?serial=... */
async function activateSerial(serial) {
  $('btnActivateLicense').disabled = true;
  try {
    const res = await fetch('/api/license/activate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serial })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Gagal');
    licenseState = data.status;
    renderLicense();
    toast(uiLang === 'en' ? 'Active. All features open.' : 'Aktif. Semua fitur terbuka.', 'success');
    return true;
  } catch (e) {
    $('licenseError').textContent = e.message;
    $('licenseError').hidden = false;
    openLicenseModal(licenseState?.blocked ? 'expired' : 'status');
    return false;
  } finally {
    $('btnActivateLicense').disabled = false;
  }
}

let lastProtocolHandled = { serial: '', at: 0 };
function setupProtocolActivate() {
  const handle = async ({ serial } = {}) => {
    if (!serial) return;
    // Abaikan duplikat push+pull untuk serial yang sama (<10 detik).
    const now = Date.now();
    if (lastProtocolHandled.serial === serial && now - lastProtocolHandled.at < 10000) return;
    lastProtocolHandled = { serial, at: now };
    stopPolling();
    toast(uiLang === 'en' ? 'Payment link received — activating…' : 'Tautan pembayaran diterima — mengaktifkan…');
    await activateSerial(serial);
  };
  try {
    window.electronAPI?.onProtocolActivate?.(handle);
    // Tarik antrean deep-link (kasus aplikasi dingin dibuka via link).
    window.electronAPI?.protocolPending?.().then((serial) => {
      if (serial) handle({ serial });
    }).catch(() => {});
  } catch { /* browser biasa: abaikan */ }
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  applyLang();
  setScraping(false);
  loadCatalog();
  loadDataset();
  fetchLicense();
  loadPlans();
  connectSSE();
  syncScrapingState();
  setupProtocolActivate();

  $('langId').addEventListener('click', () => { uiLang = 'id'; localStorage.setItem('gcrm-lang', uiLang); applyLang(); setScraping(isScraping); });
  $('langEn').addEventListener('click', () => { uiLang = 'en'; localStorage.setItem('gcrm-lang', uiLang); applyLang(); setScraping(isScraping); });
  $('selCountry').addEventListener('change', (e) => { selectedCountry = e.target.value; selectedCities.clear(); renderRegions(); updateScopeHint(); });
  $('selSearchLang').addEventListener('change', (e) => { searchLang = e.target.value; });
  $('studioDepthSelect').addEventListener('change', updateScopeHint);
  $('btnRunScrape').addEventListener('click', startSearch);
  $('btnAbortScrape').addEventListener('click', () => fetch('/api/finder/stop', { method: 'POST' }));
  $('btnSendAllToCrm').addEventListener('click', () => sendToCrm(filteredRecords.length ? filteredRecords : allRecords));
  $('btnExportFinder').addEventListener('click', () => {
    if (licenseBlocked()) return;
    location.href = '/api/export?kind=finder&format=xlsx';
  });
  $('btnExportCrm').addEventListener('click', () => {
    if (licenseBlocked()) return;
    location.href = '/api/export?kind=crm&format=xlsx';
  });

  $('filterSearch').addEventListener('input', () => applyFilters());
  $('filterCountry').addEventListener('change', applyFilters);
  $('filterCity').addEventListener('change', applyFilters);
  $('filterCategory').addEventListener('change', applyFilters);
  $('filterPhoneOnly').addEventListener('change', applyFilters);
  $('btnPrevPage').addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
  $('btnNextPage').addEventListener('click', () => { currentPage++; renderTable(); });
  $('crmSearch').addEventListener('input', renderKanban);
  $('btnAddLead').addEventListener('click', async () => {
    const name = prompt(uiLang === 'en' ? 'Customer name:' : 'Nama pelanggan:');
    if (!name || !name.trim()) return;
    const phone = prompt(uiLang === 'en' ? 'Phone (optional):' : 'Telepon (boleh kosong):') || '';
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      if (!data.added) throw new Error(uiLang === 'en' ? 'Already exists.' : 'Sudah ada di CRM.');
      toast(uiLang === 'en' ? 'Added to CRM.' : 'Masuk CRM.', 'success');
      loadCrm();
    } catch (e) { toast(e.message, 'error'); }
  });

  $('btnDrawerClose').addEventListener('click', closeDrawer);
  $('drawerBackdrop').addEventListener('click', closeDrawer);
  $('btnSaveLead').addEventListener('click', async () => {
    if (!openLeadId) return;
    try {
      const res = await fetch(`/api/crm/leads/${encodeURIComponent(openLeadId)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextFollowUp: $('drawerNext').value || null, owner: $('drawerOwner').value, notes: $('drawerNote').value })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal');
      toast(uiLang === 'en' ? 'Saved.' : 'Tersimpan.', 'success');
      loadCrm();
    } catch (e) { toast(e.message, 'error'); }
  });
  $('btnAddActivity').addEventListener('click', async () => {
    if (!openLeadId || !$('activityText').value.trim()) return;
    try {
      await fetch(`/api/crm/leads/${encodeURIComponent(openLeadId)}/activities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'note', text: $('activityText').value.trim() })
      });
      $('activityText').value = '';
      loadActivities(openLeadId);
      loadCrm();
    } catch (e) { toast(e.message, 'error'); }
  });

  $('licensePill').addEventListener('click', () => {
    if (licenseState?.blocked) openLicenseModal('expired');
    else if (licenseState?.onboarded) openLicenseModal('status');
    else openLicenseModal('onboard');
  });
  $('btnActivateLicense').addEventListener('click', handleActivate);
  $('licenseSerialInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleActivate(); });
  $('btnContinueTrial').addEventListener('click', async () => {
    if (licenseModalMode === 'status') { closeLicenseModal(); return; }
    const btn = $('btnContinueTrial');
    btn.disabled = true;
    try {
      const res = await fetch('/api/license/onboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Server menjawab ${res.status}`);
      const data = await res.json();
      licenseState = data.status;
      if (!licenseState?.onboarded) throw new Error('Server tidak menyimpan status. Coba lagi.');
      renderLicense();
      toast(uiLang === 'en' ? 'Trial active — 1 day.' : 'Masa coba aktif — 1 hari.', 'success');
    } catch (e) {
      toast((uiLang === 'en' ? 'Failed: ' : 'Gagal: ') + e.message + (uiLang === 'en' ? ' Is the app server running?' : ' Pastikan server aplikasi berjalan.'), 'error');
    } finally {
      btn.disabled = false;
    }
  });
  $('btnDeactivateLicense').addEventListener('click', async () => {
    if (!confirm('Nonaktifkan lisensi di perangkat ini?')) return;
    const res = await fetch('/api/license/deactivate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    licenseState = (await res.json()).status;
    renderLicense();
  });
  $('btnCopyInstallId').addEventListener('click', () => navigator.clipboard?.writeText(licenseState?.installId || '').then(() => toast('Disalin')));
  $('btnVerifyQuickReff').addEventListener('click', async () => {
    const reff = ($('inputQuickReff').value || '').trim();
    if (!reff) return;
    try {
      const res = await fetch('/api/payment/auto-activate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reff })
      });
      const data = await res.json();
      if (!data.found) throw new Error(data.message || 'Belum ditemukan');
      licenseState = data.status;
      renderLicense();
      toast(uiLang === 'en' ? 'Active!' : 'Aktif!', 'success');
    } catch (e) { toast(e.message, 'error'); }
  });

  $('btnSettingsMenu').addEventListener('click', (e) => {
    e.stopPropagation();
    const m = $('settingsMenu');
    m.hidden = !m.hidden;
  });
  document.addEventListener('click', () => { $('settingsMenu').hidden = true; });
  $('menuLicense').addEventListener('click', () => $('licensePill').click());
  $('menuLang').addEventListener('click', () => { uiLang = uiLang === 'id' ? 'en' : 'id'; localStorage.setItem('gcrm-lang', uiLang); applyLang(); });
  $('menuAbout').addEventListener('click', () => {
    $('aboutInstallId').textContent = licenseState?.installId || '-';
    $('aboutLicenseState').textContent = licenseState?.activated ? 'Aktif' : 'Trial';
    $('aboutModal').hidden = false;
  });
  $('btnAboutClose').addEventListener('click', () => { $('aboutModal').hidden = true; });
  $('menuExit').addEventListener('click', () => {
    if (window.electronAPI) window.electronAPI.windowControl('close');
    else toast(uiLang === 'en' ? 'Just close this tab.' : 'Tutup tab ini saja.', 'info');
  });

  if (window.electronAPI) {
    document.body.classList.add('electron');
    $('appTitlebar').hidden = false;
    $('winMinimize').addEventListener('click', () => window.electronAPI.windowControl('minimize'));
    $('winMaximize').addEventListener('click', () => window.electronAPI.windowControl('maximize'));
    $('winClose').addEventListener('click', () => window.electronAPI.windowControl('close'));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeDrawer(); $('aboutModal').hidden = true; }
  });
});
