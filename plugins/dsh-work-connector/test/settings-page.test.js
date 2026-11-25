import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';

test('Web 设置页离线渲染、编辑工作区、保存、启停及失败提示', async (t) => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: 'https://dsh.example/',
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(document.querySelector('#root'));
  t.after(async () => {
    await act(() => root.unmount());
    dom.window.close();
    delete global.window;
    delete global.document;
    delete global.IS_REACT_ACT_ENVIRONMENT;
  });
  let Page, dict;
  const calls = [];
  let data = {
    version: '1',
    enabled: false,
    values: {
      tunnelId: '',
      callbackHosts: [],
      workspaceIds: [],
    },
    workspaces: [{ id: 'work', title: '我的工作区', path: '/project' }],
    hasKey: true,
    hasProxy: false,
  };
  const fetch = async (path, opts) => {
    if (opts.body) {
      const p = JSON.parse(opts.body);
      calls.push(p);
      if (p.action === 'save') data = { ...data, values: p.values };
      else if (p.action === 'enable')
        return Response.json({ error: 'incomplete' }, { status: 400 });
    }
    return Response.json(
      path.endsWith('health')
        ? { tunnel: 'disabled', pending: 0, retrying: 0, halted: 0 }
        : data,
    );
  };
  const ctx = {
    effect: (f) => f(),
    locale: {
      register: (_ns, x) => {
        dict = x.zh;
      },
      bind: () => (k) => dict[k],
    },
    slots: {
      inject: (_key, f) => f(),
      register: (_slot, p) => {
        Page = p;
      },
    },
  };
  vm.runInNewContext(
    readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'),
    {
      window: {
        __ModuleLoader__: { load: (x) => x.factory(() => React).apply(ctx) },
      },
      fetch,
      AbortController,
    },
  );
  await act(() => root.render(React.createElement(Page)));
  const section = document.querySelector('section');
  assert.ok(section.textContent.includes('未启用'));
  assert.match(section.textContent, /允许的回调域名/);
  assert.doesNotMatch(section.textContent, /OAuth|JWKS|签发方/);
  assert.equal(section.querySelectorAll('input[type=password]').length, 2);
  assert.equal(section.querySelectorAll('input[type=password]')[0].value, '');
  const button = (text) =>
    [...section.querySelectorAll('button')].find(
      (el) => el.textContent === text,
    );
  const ws = [...section.querySelectorAll('label')].find((el) =>
    el.textContent.includes('我的工作区'),
  );
  await act(() => ws.querySelector('input').click());
  assert.equal(button('启用连接').disabled, true);
  await act(() => button('保存配置').click());
  assert.deepEqual(calls, [
    {
      version: '1',
      action: 'save',
      values: { ...data.values, workspaceIds: ['work'] },
    },
  ]);
  assert.ok(section.textContent.includes('配置已保存'));
  await act(() => button('启用连接').click());
  assert.ok(section.textContent.includes('无法启用'));
});
