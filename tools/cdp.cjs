const wsUrl = process.argv[2];
const mode = process.argv[3];
let arg1 = process.argv[4];
const arg2 = process.argv[5];
if (mode === 'evalFile') {
  arg1 = require('fs').readFileSync(arg1, 'utf8');
}
const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();
ws.onopen = async () => {
  if (mode === 'eval' || mode === 'evalFile') {
    const r = await send('Runtime.evaluate', { expression: arg1, returnByValue: true, awaitPromise: true });
    console.log(JSON.stringify(r?.result?.result ?? r, null, 1).slice(0, 3000));
  } else if (mode === 'shot') {
    await send('Page.enable', {});
    await send('Emulation.setDeviceMetricsOverride', { width: 1320, height: 860, deviceScaleFactor: 1, mobile: false });
    await new Promise((r) => setTimeout(r, 600));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    require('fs').writeFileSync(arg1, Buffer.from(shot.result.data, 'base64'));
    console.log('saved', arg1);
  }
  ws.close();
  process.exit(0);
};
ws.onmessage = (ev) => {
  try {
    const m = JSON.parse(String(ev.data));
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  } catch { /* abaikan */ }
};
ws.onerror = () => { console.error('WS-ERR'); process.exit(1); };
function send(method, params) {
  return new Promise((resolve) => {
    const myId = ++id;
    pending.set(myId, resolve);
    ws.send(JSON.stringify({ id: myId, method, params }));
  });
}
setTimeout(() => { console.error('TIMEOUT'); process.exit(1); }, 60000);
