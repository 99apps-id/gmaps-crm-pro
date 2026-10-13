/**
 * Parser deep-link gmaps-crm-pro://activate?serial=GMST-... (murni, testable).
 */
'use strict';

const PROTOCOL = 'gmaps-crm-pro';
const SERIAL_RE = /^GMST-\d{4}-[A-Z2-9]{6}$/;

/** @returns {{serial:string}|null} */
function parseProtocolUrl(url) {
  try {
    const u = String(url || '');
    if (!u.toLowerCase().startsWith(`${PROTOCOL}://`)) return null;
    const rest = u.slice(PROTOCOL.length + 3);
    const q = rest.includes('?') ? rest.slice(rest.indexOf('?') + 1) : '';
    const params = new URLSearchParams(q);
    const serial = (params.get('serial') || '').trim().toUpperCase();
    if (!SERIAL_RE.test(serial)) return null;
    return { serial };
  } catch {
    return null;
  }
}

module.exports = { PROTOCOL, parseProtocolUrl };
