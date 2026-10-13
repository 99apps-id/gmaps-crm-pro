import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PROTOCOL, parseProtocolUrl } = require('../electron/protocol.cjs');

describe('Deep-link aktivasi gmaps-crm-pro://', () => {
  it('skema protocol tetap', () => {
    assert.equal(PROTOCOL, 'gmaps-crm-pro');
  });
  it('URL valid (case-insensitive) diambil serialnya', () => {
    assert.deepEqual(parseProtocolUrl('gmaps-crm-pro://activate?serial=gmst-2610-v3uy4j'), { serial: 'GMST-2610-V3UY4J' });
  });
  it('serial palsu ditolak', () => {
    assert.equal(parseProtocolUrl('gmaps-crm-pro://activate?serial=XXX'), null);
    assert.equal(parseProtocolUrl('gmaps-crm-pro://activate'), null);
  });
  it('skema lain ditolak', () => {
    assert.equal(parseProtocolUrl('https://gmst.dewa.ai.id/api/payment/claim'), null);
    assert.equal(parseProtocolUrl(''), null);
    assert.equal(parseProtocolUrl(null), null);
  });
});
