/**
 * Scrape Runner - GMaps CRM Pro (reuse pola GMST, tanpa POI kampus).
 *
 * fetchGoogleMapsPage di-load lazy dari ./scraper.js agar paket klien
 * (ENGINE_MODE=client) bisa diedarkan TANPA file engine.
 */

import { cityMeta } from './catalog.js';

export const MAX_EXTRA_PAGES = 2;

let cachedFetchPage = null;
async function defaultFetchPage(query, offset) {
  if (!cachedFetchPage) {
    try {
      const mod = await import('./scraper.js');
      cachedFetchPage = mod.fetchGoogleMapsPage;
    } catch {
      throw Object.assign(
        new Error('Mesin pencari tidak tersedia di aplikasi ini. Gunakan versi resmi / koneksi server.'),
        { status: 503, code: 'ENGINE_MISSING' }
      );
    }
  }
  return cachedFetchPage(query, offset);
}

export function provinceForCity(city) {
  const meta = cityMeta(city);
  return meta ? meta.province : city;
}

export function countryForCity(city) {
  const meta = cityMeta(city);
  return meta ? meta.country : 'ID';
}

export async function executeScrapePlan(plan, ctx) {
  const { keyword, cityQueries, depth } = plan;
  const {
    fetchPage = defaultFetchPage,
    dataset,
    seen,
    onLog = () => {},
    onProgress = () => {},
    onBatch = () => {},
    shouldAbort = () => false,
    maxExtraPages = MAX_EXTRA_PAGES,
    baseDelayMs = 500 + Math.max(1, depth) * 120
  } = ctx;

  if (!Array.isArray(dataset) || !(seen instanceof Set)) {
    throw new Error('Runner butuh ctx.dataset (array) & ctx.seen (Set).');
  }

  let pagesDone = 0;
  let totalPagesPlanned = cityQueries.reduce((a, c) => a + c.queries.length * Math.max(1, depth), 0) || 1;
  const newRecords = [];

  onLog(`Memulai pencarian: "${keyword}" di ${cityQueries.length} wilayah, ${cityQueries.reduce((a, c) => a + c.queries.length, 0)} kata pencarian, kedalaman ${depth}.`);

  for (let cIdx = 0; cIdx < cityQueries.length; cIdx++) {
    if (shouldAbort()) {
      onLog('Pencarian dihentikan atas permintaan Anda.');
      break;
    }
    const city = cityQueries[cIdx].city;
    onLog(`Memproses wilayah [${cIdx + 1}/${cityQueries.length}]: ${city} (${cityQueries[cIdx].queries.length} kata pencarian)...`);
    const queries = cityQueries[cIdx].queries;
    const province = provinceForCity(city);
    const country = countryForCity(city);

    for (const query of queries) {
      if (shouldAbort()) break;
      const percent = Math.min(98, Math.round((pagesDone / totalPagesPlanned) * 100));
      onProgress(percent, `Mencari: "${query}"`, dataset.length);

      let page = 0;
      for (;;) {
        if (shouldAbort()) break;
        const isExtra = page >= depth;
        if (page >= depth + maxExtraPages) break;
        const offset = page * 20;

        const results = await fetchPage(query, offset);
        pagesDone++;

        if (!Array.isArray(results) || results.length === 0) break;

        const newBatch = [];
        for (const item of results) {
          const key = item.placeId || `${String(item.name || '').toLowerCase()}_${city.toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            const record = {
              ...item,
              category: item.category || keyword,
              city,
              province,
              country
            };
            newBatch.push(record);
            dataset.unshift(record);
            newRecords.push(record);
          }
        }

        if (newBatch.length > 0) onBatch(newBatch);

        if (results.length < 20) break;
        page++;
        if (page >= depth + maxExtraPages) break;
        if (page === depth) {
          totalPagesPlanned += 1;
          onLog(`  ... pendalaman untuk "${query}" (hasil masih penuh).`);
        } else if (isExtra) {
          totalPagesPlanned += 1;
        }
        await new Promise((r) => setTimeout(r, baseDelayMs + Math.floor(Math.random() * 400)));
      }
    }
  }

  return { newRecords, pagesDone, aborted: shouldAbort() };
}
