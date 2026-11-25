import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInThisContext } from 'node:vm'
import { Window } from 'happy-dom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

import { apply, ROUTE_SPEED } from '../lib/host.mjs'

// Use the built Web script with the same React and module-loader boundary as DSH.
test('built stats bundle renders the model-speed response', async (t) => {
  assert.equal(typeof apply, 'function')
  const window = new Window({ url: 'http://localhost/' })
  const host = window.document.createElement('div')
  window.document.body.appendChild(host)
  let plugin
  const globals = {
    window,
    document: window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
    __ModuleLoader__: { load: (module) => { plugin = module } },
    __DSH_STATS__: { url: '/samples.jsonl', summaryUrl: '/summary.json', configUrl: '/config', speedUrl: ROUTE_SPEED },
  }
  const saved = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  Object.assign(globalThis, globals)
  t.after(async () => {
    for (const [key, value] of saved) {
      if (value) Object.defineProperty(globalThis, key, value)
      else delete globalThis[key]
    }
    await window.happyDOM.close()
  })
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = new URL(input, window.location.href)
    if (url.pathname === ROUTE_SPEED) {
      assert.equal(url.searchParams.get('hours'), '24')
      return Response.json({ asOf: 100, rows: [{
        provider: 'fixture-provider', model: 'fixture-model', requests: 3, outputTokens: 300,
        ttftSamples: 3, generationSamples: 1, tpsSamples: 3, ttftMs: 1000, generationTps: 42, endToEndTps: 31,
      }] })
    }
    if (url.pathname === '/samples.jsonl') return new Response('')
    if (url.pathname === '/config') return Response.json({})
    return new Response(null, { status: 503 })
  })

  runInThisContext(readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'))
  assert.equal(plugin?.id, 'dsh-plugin-stats')
  let Panel
  plugin.factory((name) => name === 'react' ? React : undefined).apply({
    locale: { register() {}, bind: () => (key, params) => params ? `${key}:${params.n}` : key },
    slots: { inject: (_, callback) => callback(), register: (slot, component) => {
      if (slot.name === 'main' && slot.key === 'stats') Panel = component
    } },
  })
  assert.equal(typeof Panel, 'function')
  const root = createRoot(host)
  try {
    await act(async () => { root.render(React.createElement(Panel)) })
    const row = host.querySelector('.tps-speed-table tbody tr')
    assert.match(row?.textContent ?? '', /fixture-model/)
    assert.equal(row.children[2].textContent, '42.0 tok/sspeedSamples:1')
    assert.equal(row.children[3].textContent, '31.0 tok/sspeedSamples:3')
  } finally {
    await act(async () => root.unmount())
  }
})
