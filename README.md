# GMaps CRM Pro

Pencari usaha global (11 negara) + pengelola pelanggan (CRM) dalam satu aplikasi desktop Electron.

- **Scraper Studio**: cari calon pembeli per negara, kategori usaha, dan wilayah. Bahasa Indonesia / English.
- **Hasil**: saring, kirim ke CRM, unduh Excel/CSV/JSON.
- **CRM**: alur Baru → Dihubungi → Tindak Lanjut → Negosiasi → Berhasil/Gagal, pengingat, pola pesan WA bilingual, export Excel CRM.
- **Grafik**: usaha per kota/jenis/negara, pelanggan per tahapan, kelengkapan kontak, sebaran rating.
- **Lisensi**: coba gratis 1 hari, paket harian Rp15.000 / mingguan Rp50.000 via Singapay.

## Arsitektur (anti-jailbreak)

Engine scraper **hanya ada di VPS** (`/opt/gcrm-engine`, `ENGINE_MODE=engine`,
wajib serial terdaftar — tanpa serial, engine menolak `403 ENGINE_AUTH`).
Paket klien Electron **tidak membawa** `lib/scraper.js` (tidak dibundel) dan
dipaksa `ENGINE_MODE=client`, sehingga membongkar aplikasi tidak memberi akses
engine. Lapisan pengaman:

1. Engine VPS wajib serial terdaftar di allowlist (`ENGINE_REQUIRE_SERIAL=1`,
   `ENGINE_STRICT=1`, allowlist = `/opt/gmst-engine/licenses.json` milik GMST).
2. Tripwire integritas: hash `app.asar` dibanding hash resmi
   `https://gmst.dewa.ai.id/gcrm-integrity.json`; tak cocok → engine dimatikan.
3. Lisensi, engine, dan payment terpusat mengikuti proyek GMST
   (`https://gmst.dewa.ai.id`, serial prefix `GMST-`, webhook Singapay di VPS).

## Jalankan dev

```sh
npm install
npm start
# buka http://localhost:3219
```

Env dev yang berguna:

```sh
# Mode klien (pakai engine VPS, tanpa scraping lokal)
ENGINE_MODE=client node server.js
# Mode luring total (tanpa verifikasi VPS; butuh LICENSE_SECRET VPS)
LICENSE_SERVER_URL=off LICENSE_SECRET="..." node server.js
```

## Test

```sh
npm test
```

## Lisensi & pembayaran (mengikuti GMST)

- Serial diterbitkan VPS (webhook Singapay otomatis, atau
  `LICENSE_SECRET="..." node tools/gen-license.js --count N` oleh vendor —
  hasilnya **wajib** digabung ke `/opt/gmst-engine/licenses.json` di VPS
  karena engine menolak serial tak terdaftar).
- Aktivasi aplikasi verifikasi ke VPS dulu (sumber kebenaran); fallback lokal
  hanya bila VPS tak terjangkau.
- Alur bayar → aktif otomatis (dashboard Singapay hanya menerima
  `success_redirect_url` statis, tanpa localhost/placeholder):
  1. Vendor isi `success_redirect_url` kedua payment link dengan URL statis:
     `https://gmst.dewa.ai.id/api/gcrm/api/payment/claim`
  2. Usai bayar, browser user membuka halaman klaim → isi nomor referensi
     dari struk → tampil kode + tombol **Aktifkan Otomatis di Aplikasi**.
  3. Satu klik tombol membuka aplikasi (`gmaps-crm-pro://activate?...`)
     dan lisensi aktif sendiri (verifikasi VPS). Tanpa klik pun bisa:
     tempel nomor referensi di kotak "Cek" modal lisensi, atau tempel kode
     manual — ketiganya mem-proxy ke VPS.
- Polling tiap 3 detik setelah klik Beli tetap jalan untuk kasus webhook
  lokal (dev/VPS).

## Build installer

```sh
npm run dist:win   # Windows .exe
npm run dist:mac   # macOS .dmg
npm run dist:linux # Linux AppImage + .deb
```

Setelah build Windows, publikasikan hash integritas ke VPS agar tripwire aktif:

```sh
node -e "const c=require('crypto'),f=require('fs'),h=c.createHash('sha256');h.update(f.readFileSync('release/win-unpacked/resources/app.asar'));console.log(JSON.stringify({sha256:h.digest('hex')}))" > integrity.json
scp -i ~/.ssh/Nara.pem -P 2233 integrity.json naracitrasolusindo@103.126.116.111:/opt/gcrm-static/gcrm-integrity.json
```

## Struktur

- `server.js` — API finder + CRM + lisensi + payment (+ endpoint engine saat `ENGINE_MODE=engine` di VPS)
- `lib/` — license, payment, catalog (global bilingual), crm, scrape-runner, excel
- `lib/scraper.js` — **engine dev-only, TIDAK dibundel ke paket publik** (paket klien memakai VPS via ENGINE_MODE=client)
- `public/` — UI elegan bilingual
- `electron/` — main, preload, integrity-check
- `tools/` — gen-license (vendor), build-icon
