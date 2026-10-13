/**
 * GMaps CRM Pro - Electron Main.
 *
 * Pola GMST: server.js dijalankan sebagai child process (ELECTRON_RUN_AS_NODE
 * agar 1 binary bisa menjalankannya), dibuka via HTTP + token acak agar
 * tidak pernah salah menempel ke dashboard dev lain.
 *
 * Keamanan (anti-jailbreak):
 * - Paket klien TIDAK membawa engine scraper (lib/scraper.js tidak dibundel);
 *   ENGINE_MODE=client dipaksa saat packaged -> pencarian hanya via VPS.
 * - Tripwire integritas: bila hash app.asar != hash resmi VPS, engine
 *   dimatikan (DISABLE_ENGINE=1). Fail-open tercatat bila URL hash belum diset.
 * - Lisensi + engine + payment terpusat di VPS (default gmst.dewa.ai.id).
 */

const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const http = require('http');

const PORT = process.env.PORT || (app.isPackaged ? 3219 : 3219);
const APP_TOKEN = crypto.randomBytes(16).toString('hex');
const SERVER_URL = `http://127.0.0.1:${PORT}`;
const ROOT_DIR = path.join(__dirname, '..');
const ICON_PNG = path.join(__dirname, 'assets', 'icon.png');
const VPS_BASE = (process.env.LICENSE_SERVER_URL || 'https://gmst.dewa.ai.id').replace(/\/+$/, '');

let mainWindow = null;
let serverProc = null;
let pendingProtocolUrl = null;

const { PROTOCOL, parseProtocolUrl } = require('./protocol.cjs');

/** gmaps-crm-pro://activate?serial=GMST-... -> teruskan ke renderer. */
function handleProtocolUrl(url) {
  const parsed = parseProtocolUrl(url);
  if (!parsed) {
    mainLog('protocol: URL/serial tidak valid.');
    return;
  }
  mainLog(`protocol: aktivasi ${parsed.serial.slice(0, 12)}...`);
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    mainWindow.webContents.send('gcrm:protocol-activate', { serial: parsed.serial });
  } else {
    pendingProtocolUrl = parsed.serial;
  }
}

function flushPendingProtocol() {
  if (pendingProtocolUrl && mainWindow && !mainWindow.isDestroyed()) {
    mainLog('protocol: teruskan antrean ke renderer.');
    mainWindow.webContents.send('gcrm:protocol-activate', { serial: pendingProtocolUrl });
    pendingProtocolUrl = null;
  }
}

// Renderer menarik serial deep-link saat boot (anti-race dengan push di atas).
ipcMain.handle('protocol-pending', () => {
  const s = pendingProtocolUrl;
  pendingProtocolUrl = null;
  return s;
});

// Lisensi & data user di folder userData (tidak ikut terhapus saat update,
// tidak bisa dibaca dari asar oleh user lain).
try {
  const userData = app.getPath('userData');
  process.env.LICENSE_FILE = path.join(userData, 'license.json');
  process.env.CRM_FILE = path.join(userData, 'crm-data.json');
} catch {
  // fallback: default di direktori aplikasi
}

function mainLog(msg) {
  try {
    fs.appendFileSync(path.join(app.getPath('userData'), 'main.log'), `[${new Date().toISOString()}] ${msg}\n`);
  } catch { /* abaikan */ }
}

function waitForServer(timeoutMs = 45000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`${SERVER_URL}/api/health`, { timeout: 2000 }, (res) => {
        let body = '';
        res.on('data', (d) => { body += d; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            // Tolak server asing di port sama: token harus cocok.
            if (res.statusCode === 200 && data && data.token === APP_TOKEN) return resolve(true);
          } catch { /* abaikan, coba lagi */ }
          retry();
        });
        res.resume();
      });
      req.on('error', retry);
      req.on('timeout', () => { req.destroy(); retry(); });
      function retry() {
        if (serverProc && serverProc.exitCode !== null) {
          return reject(new Error('Proses server berhenti mendadak.'));
        }
        if (Date.now() - start > timeoutMs) return reject(new Error('Server timeout.'));
        setTimeout(tick, 800);
      }
    };
    tick();
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverJs = path.join(ROOT_DIR, 'server.js');
    if (!fs.existsSync(serverJs)) return reject(new Error('server.js tidak ditemukan.'));
    let logStream = null;
    try {
      const logDir = app.getPath('userData');
      fs.mkdirSync(logDir, { recursive: true });
      logStream = fs.openSync(path.join(logDir, 'server.log'), 'a');
    } catch { /* fallback ignore */ }
    serverProc = spawn(process.execPath, [serverJs], {
      env: {
        ...process.env,
        PORT: String(PORT),
        GCRM_TOKEN: APP_TOKEN,
        ELECTRON_RUN_AS_NODE: '1',
        // Klien paket SELALU via VPS (jailbreak tak dapat engine lokal).
        ENGINE_MODE: app.isPackaged ? 'client' : (process.env.ENGINE_MODE || 'local'),
        ENGINE_URL: process.env.ENGINE_URL || `${VPS_BASE}/api/gcrm`,
        LICENSE_SERVER_URL: process.env.LICENSE_SERVER_URL || VPS_BASE,
        NODE_ENV: 'production'
      },
      stdio: logStream ? ['ignore', logStream, logStream] : 'ignore',
      windowsHide: true
    });
    serverProc.on('error', reject);
    waitForServer().then(resolve).catch(reject);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    frame: false, // titlebar kustom dari renderer (#appTitlebar)
    autoHideMenuBar: true,
    backgroundColor: '#0f1e33',
    title: 'GMaps CRM Pro',
    icon: fs.existsSync(ICON_PNG) ? ICON_PNG : undefined,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Link eksternal (checkout Singapay) dibuka di browser sistem.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(SERVER_URL);
  mainWindow.webContents.on('did-finish-load', flushPendingProtocol);
  mainWindow.on('closed', () => { mainWindow = null; });
}

// Kontrol window dari titlebar kustom (renderer -> main)
ipcMain.handle('window-control', (_evt, action) => {
  if (!mainWindow) return;
  if (action === 'minimize') mainWindow.minimize();
  else if (action === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  } else if (action === 'close') mainWindow.close();
});

// Buka link eksternal (pembayaran Singapay) di browser sistem default
ipcMain.handle('open-external', async (_evt, url) => {
  try {
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: 'URL tidak valid' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Single instance: fokuskan jendela bila dibuka 2x.
// Instans kedua bisa berupa klik deep-link gmaps-crm-pro://... (Windows
// meneruskan URL sebagai argumen baris perintah).
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_evt, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const proto = (argv || []).find((a) => String(a).toLowerCase().startsWith(`${PROTOCOL}://`));
    if (proto) handleProtocolUrl(proto);
  });
  // macOS: event open-url untuk custom protocol.
  app.on('open-url', (evt, url) => {
    evt.preventDefault();
    handleProtocolUrl(url);
  });
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);

  // Daftarkan custom protocol agar tombol "Aktifkan Otomatis di Aplikasi"
  // dari halaman klaim VPS membuka aplikasi ini (hanya versi packaged agar
  // dev tidak membajak skema di mesin vendor).
  if (app.isPackaged) {
    try {
      if (!app.isDefaultProtocolClient(PROTOCOL)) app.setAsDefaultProtocolClient(PROTOCOL);
    } catch (err) {
      mainLog(`protocol register gagal: ${err.message}`);
    }
    // Windows: peluncuran pertama via deep-link membawa URL di argv.
    const protoArg = process.argv.slice(1).find((a) => String(a).toLowerCase().startsWith(`${PROTOCOL}://`));
    if (protoArg) handleProtocolUrl(protoArg);
  }

  // Tripwire integritas (hanya versi packaged): asar yang dibedah/dimodifikasi
  // membuat engine dimatikan. Non-blocking: aplikasi tetap dibuka (user bisa
  // aktivasi / instal ulang). Hanya aktif bila INTEGRITY_URL diset
  // (default: hash resmi GCRM di VPS).
  const integrityUrl = process.env.INTEGRITY_URL || `${VPS_BASE}/gcrm-integrity.json`;
  if (app.isPackaged) {
    try {
      const { checkIntegrity } = require('./integrity-check.cjs');
      const asarPath = path.join(process.resourcesPath, 'app.asar');
      const res = await checkIntegrity({ asarPath, integrityUrl });
      if (res.checked && !res.ok) {
        process.env.DISABLE_ENGINE = '1';
        mainLog('integritas GAGAL (hash tak cocok) - engine dimatikan.');
      } else if (res.checked) {
        mainLog('integritas OK.');
      } else {
        mainLog(`integritas skipped (${res.reason}).`);
      }
    } catch (err) {
      try { mainLog(`integritas skipped (error: ${err.message}).`); } catch { /* abaikan */ }
    }
  }

  try {
    await startServer();
    mainLog(`server OK (${SERVER_URL})`);
  } catch (err) {
    mainLog(`server GAGAL: ${err.message}`);
    dialog.showErrorBox('GMaps CRM Pro gagal dijalankan', `Server lokal gagal start:\n${err.message}`);
    app.quit();
    return;
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProc && serverProc.exitCode === null) {
    try { serverProc.kill(); } catch { /* abaikan */ }
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProc && serverProc.exitCode === null) {
    try { serverProc.kill(); } catch { /* abaikan */ }
  }
});
