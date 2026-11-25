import test from 'node:test';
import assert from 'node:assert/strict';
import { apply } from '../lib/index.js';

// HTTP resource handlers receive a Request only. The other entry point,
// webServer.readResource, supplies an already admitted peer as its second arg.
test('未启用的连接器：浏览器身份由 DSH 校验，只有所有者可以读取状态', async () => {
  let route;
  const owner = { principal: { kind: 'owner' } };
  const guest = { principal: { kind: 'guest' } };
  const url = 'http://localhost/work-connector/health';
  const browser = new Request(url, { headers: { cookie: 'fixture-only' } });
  const anonymous = new Request(url);
  const blocked = new Request(url, { headers: { origin: 'https://other.invalid' } });
  const admissions = new Map([[browser, { peer: owner }], [anonymous, { rejection: 401 }], [blocked, { rejection: 403 }]]);
  const ctx = {
    effect: register => register(),
    webServer: { register: r => { route = r; return () => {}; } },
    connection: { admit(request) { const result = admissions.get(request); assert.ok(result); return result; } },
  };
  await apply(ctx, { enabled: false });
  assert.equal(route.path, '/work-connector/health');
  const response = await route.resource(browser);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { tunnel: 'disabled', pending: 0, retrying: 0, halted: 0 });
  assert.equal((await route.resource(anonymous)).status, 401);
  assert.equal((await route.resource(blocked)).status, 403);
  // A delegated caller must not be upgraded by an unrelated owner cookie.
  assert.equal((await route.resource(browser, guest)).status, 403);
  assert.equal((await route.resource(anonymous, owner)).status, 200);
  admissions.set(browser, { peer: guest });
  assert.equal((await route.resource(browser)).status, 403);
});
