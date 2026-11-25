import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import { environment } from '../lib/index.js';
import {
  settingsController,
  settingsRoute,
  storedSecrets,
} from '../lib/settings.js';

function harness() {
  let config = { enabled: false },
    controller;
  const records = new Map();
  const entry = {};
  const ctx = {
    fiber: { entry },
    workspaceRegistry: {
      list: () => [{ id: 'w', title: 'Workspace', path: '/tmp/test' }],
      get: (id) => id === 'w',
    },
    credentials: {
      readRecord: async (k) => records.get(k),
      modifyRecord: async (k, fn) => records.set(k, await fn(records.get(k))),
      deleteRecord: async (k) => records.delete(k),
    },
    configEditor: {
      edit: async (e, change) => {
        assert.equal(e, entry);
        config = change(config);
        reload();
      },
    },
  };
  function reload() {
    controller = settingsController(ctx, config, environment);
  }
  reload();
  return {
    get api() {
      return controller;
    },
    ctx,
    records,
    get config() {
      return config;
    },
  };
}
test('配置可在未启用时保存，密钥与认证代理不出现在回读/配置；启停、轮换、清除与旧页冲突', async () => {
  const h = harness();
  let page = await h.api.view();
  const values = {
    ...page.values,
    tunnelId: 'tunnel_test',
    workspaceIds: ['w'],
  };
  await assert.rejects(
    h.api.write({ action: 'enable', version: page.version }),
  );
  await h.api.write({
    action: 'save',
    version: page.version,
    values,
    key: 'secret-for-test',
    proxy: 'http://user:proxy-secret@proxy.example:8080',
  });
  assert.equal(h.config.enabled, false);
  await assert.rejects(
    h.api.write({ action: 'enable', version: page.version }),
    /stale/,
  );
  page = await h.api.view();
  assert.ok(page.hasKey && page.hasProxy);
  assert.doesNotMatch(
    JSON.stringify([page, h.config]),
    /secret-for-test|proxy-secret/,
  );
  const s = await storedSecrets(h.ctx, h.config);
  assert.equal(environment(h.config, s, {}).key, 'secret-for-test');
  await h.api.write({ action: 'enable', version: page.version });
  assert.equal(h.config.enabled, true);
  page = await h.api.view();
  await assert.rejects(
    h.api.write({ action: 'save', version: page.version, values }),
    /disableFirst/,
  );
  await h.api.write({ action: 'disable', version: page.version });
  page = await h.api.view();
  await h.api.write({
    action: 'save',
    version: page.version,
    values,
    key: 'rotated',
  });
  assert.equal(h.records.size, 1);
  assert.equal((await storedSecrets(h.ctx, h.config)).proxy, s.proxy);
  page = await h.api.view();
  await h.api.write({
    action: 'save',
    version: page.version,
    values,
    key: null,
    proxy: null,
  });
  page = await h.api.view();
  assert.ok(!page.hasKey && !page.hasProxy);
});
test('无效代理和未注册工作区不会写入配置或凭据', async () => {
  const h = harness(),
    { version, values } = await h.api.view();
  for (const change of [
    { proxy: 'file:///tmp/p' },
    { values: { ...values, workspaceIds: ['missing'] } },
  ])
    await assert.rejects(
      h.api.write({
        action: 'save',
        version,
        values,
        key: 'not-saved',
        ...change,
      }),
    );
  assert.equal(h.records.size, 0);
  assert.deepEqual(h.config, { enabled: false });
});
test('真实 HTTP 配置入口拒绝未登录、非所有者与跨站写入；所有者能读写草稿', async (t) => {
  const h = harness();
  let handler;
  settingsRoute(
    {
      effect: (fn) => fn(),
      webServer: {
        register: (r) => {
          handler = r.handler;
        },
      },
      connection: {
        admit: (req) =>
          req.headers.cookie === 'owner-test'
            ? { peer: { principal: { kind: 'owner' } } }
            : req.headers.cookie
              ? { peer: { principal: { kind: 'guest' } } }
              : { rejection: 401 },
      },
    },
    { view: () => h.api.view(), write: (v) => h.api.write(v) },
  );
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/work-connector/settings`;
  assert.equal((await fetch(url)).status, 401);
  assert.equal(
    (await fetch(url, { headers: { cookie: 'guest' } })).status,
    403,
  );
  const page = await (
    await fetch(url, { headers: { cookie: 'owner-test' } })
  ).json();
  const headers = {
    cookie: 'owner-test',
    'content-type': 'application/json',
    'x-work-settings': '1',
  };
  const body = JSON.stringify({
    action: 'save',
    version: page.version,
    values: { ...page.values, tunnelId: 'draft' },
  });
  assert.equal(
    (
      await fetch(url, {
        method: 'POST',
        headers: { ...headers, 'x-work-settings': '' },
        body,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(url, {
        method: 'POST',
        headers: { ...headers, 'sec-fetch-site': 'cross-site' },
        body,
      })
    ).status,
    403,
  );
  assert.equal(
    (await fetch(url, { method: 'POST', headers, body })).status,
    200,
  );
  assert.equal(h.config.tunnelId, 'draft');
  assert.equal(h.config.enabled, false);
});
