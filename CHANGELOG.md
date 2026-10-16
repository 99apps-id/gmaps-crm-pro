# Changelog — GMaps CRM Pro

## 2026-10-16
- **Resolusi wilayah** baru (`lib/region.js`): kecamatan/desa dipetakan ke kota + provinsi induk; provinsi/kota/kecamatan tiap hasil mengikuti **alamat Google Maps**; hasil lintas wilayah disaring (termasuk inferensi dari mayoritas alamat bila input tak dikenal).
- **Katalog Jabodetabek diperkaya**: kecamatan tambahan (Bojonggede, Dramaga, Tajur Halang, Cileungsi, Ciampea, Parung, Ciomas, Kemang, dst.) untuk Bogor/Bekasi/Depok/Tangerang/Jakarta.
- Endpoint **`GET /api/region/resolve`** (+ proxy ke VPS saat mode client) untuk pratinjau UI.
- UI: input **"Kota / kecamatan tambahan"** + pratinjau "Terbaca: …".
- Hardening engine: webhook `auto-activate` wajib `reff`, handler dibungkus try/catch + guard `decodeURIComponent`, handler `unhandledRejection`/`uncaughtException`, tulis JSON atomik (temp+rename+fsync), reuse-aktivasi memakai `activatedAt`.
- Versi desktop **0.1.6**.
