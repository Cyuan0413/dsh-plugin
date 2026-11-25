import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import test from 'node:test';
import { apply } from '../lib/index.js';

// Load the shipped modules directly, with no live server, profile, or LLM.
const install = process.env.DSH_OFFLINE_INSTALL_DIR ?? process.env.DSH_INSTALL_DIR;
const cliPackage = install ? join(install, 'package.json') : import.meta.resolve('@deepseek-ai/dsh/package.json');
const requireDsh = createRequire(install ? cliPackage : new URL(cliPackage));
const load = spec => import(pathToFileURL(requireDsh.resolve(`@deepseek-ai/${spec}`)));
const [cordis, registry, access, gateway, commands, generated, compact, compaction] = await Promise.all([
  'cordis', 'dsh-typert-registry', 'dsh-api-remote-access', 'dsh-api-gateway',
  'dsh-commands', 'dsh-commands/typert', 'dsh-command-compact', 'dsh-compaction',
].map(load));

// Only omit the real HTTP carrier services: the tests drive the same event manually.
const patch = { apply, inject: ['commands'] };

async function fixture(t, { stock = true } = {}) {
  const root = new cordis.Context();
  const fibers = [];
  const compactionStarts = [];
  const cancel = new AbortController();
  const events = [];
  let lookup = () => agent;
  let running = false;
  const agent = { session: { append(type, data) { events.push({ type, data }); } } };
  const mount = async plugin => {
    const fiber = root.plugin(plugin);
    fibers.push(fiber);
    await fiber.await();
    return fiber;
  };
  t.after(async () => {
    cancel.abort();
    for (const fiber of fibers.reverse()) await fiber.dispose();
  });
  await mount(registry.TypertRegistry);
  await mount(access.RemoteAccessService);
  await mount(commands.CommandRuntime);
  await mount(gateway.TypertGatewayService);
  root.typert.register(generated.TYPERT);
  root.typert.lookups.register('agent', {
    parameter: 'agent', wire: 'agentId', hostTypeSymbol: '@deepseek-ai/dsh-agent/types#Agent',
    wireTypeSymbol: '@deepseek-ai/dsh-session/types#SessionId', resolve: () => lookup(),
  });
  root.provide('compaction', {
    async compactNow(_agent, request, commandId) {
      if (running) throw new compaction.ManualCompactionError('busy', 'already running');
      running = true;
      const complete = Promise.withResolvers();
      const onStop = () => complete.reject(new compaction.ManualCompactionError('cancelled', 'Agent cancelled'));
      const signal = AbortSignal.any([request, cancel.signal]);
      signal.addEventListener('abort', onStop, { once: true });
      compactionStarts.push({ complete, signal, commandId });
      try { return await complete.promise; }
      finally {
        running = false;
        signal.removeEventListener('abort', onStop);
      }
    },
  });
  if (stock) await mount(compact);
  const plugin = await mount(patch);
  const raw = root.commands[cordis.symbols.original];
  const peer = { principal: { kind: 'owner' }, signal: new AbortController().signal };
  const call = (signal, { line = '/compact', submittedAttachments = [], url = '/api/commands/execute', http = true } = {}) => {
    const next = () => root.typertGateway.invoke({
      namespace: 'commands', method: 'execute', args: { agentId: 'session-1', line, submittedAttachments }, peer, signal,
    });
    return http ? root.waterfall('connection/request', { method: 'POST', url }, {}, next) : next();
  };
  return { root, plugin, raw, events, call, cancel, compactionStarts, setLookup: resolve => { lookup = resolve; }, agent };
}

const success = { shadowedSeqs: [8, 9], shadowedTokenCount: 130, summarySeq: 42 };

// Separate the disconnect from handler settlement; no real clock delay is needed.
test('an admitted Web /compact keeps running through a disconnect and logs its original successful result', async t => {
  const f = await fixture(t);
  const http = new AbortController();
  const reply = f.call(http.signal, { line: '/compact \t' });
  await setImmediate();
  assert.equal(f.compactionStarts.length, 1);
  const [{ complete, signal, commandId }] = f.compactionStarts;
  assert.deepEqual(f.events.map(event => event.type), ['command/run']);
  http.abort();
  assert.equal(signal.aborted, false);
  assert.deepEqual(f.events.map(event => event.type), ['command/run']);
  complete.resolve(success);
  assert.deepEqual(await reply, {
    commandId, result: { kind: 'success', text: 'Compacted 2 history items (~130 tokens).', sourceEventSeq: 42 },
  });
  assert.deepEqual(f.events.map(event => [event.type, event.data.commandId]), [
    ['command/run', commandId], ['command/done', commandId],
  ]);
  assert.equal(f.events[1].data.sourceEventSeq, 42);
});

test('disconnect before Agent lookup finishes does not admit the command', async t => {
  const f = await fixture(t);
  const lookup = Promise.withResolvers();
  f.setLookup(() => lookup.promise);
  const http = new AbortController();
  const reply = f.call(http.signal);
  const rejected = assert.rejects(reply, { code: 'gateway/cancelled' });
  await setImmediate();
  http.abort();
  lookup.resolve(f.agent);
  await rejected;
  assert.deepEqual(f.events, []);
  assert.deepEqual(f.compactionStarts, []);
});

test('submitting again during compaction does not start a second compaction; Agent cancel still settles it', async t => {
  const f = await fixture(t);
  const http = new AbortController();
  const reply = f.call(http.signal);
  await setImmediate();
  http.abort();
  const retry = await f.call(new AbortController().signal);
  assert.equal(retry.result.kind, 'error');
  assert.match(retry.result.text, /active compaction/u);
  assert.equal(f.compactionStarts.length, 1);
  f.cancel.abort();
  const result = await reply;
  assert.deepEqual(result.result, { kind: 'error', text: 'Compaction cancelled.' });
  assert.equal(f.events.filter(event => event.type === 'command/done' && event.data.commandId === result.commandId).length, 1);
});

test('a Host summary failure after disconnect remains a failure of the original command', async t => {
  const f = await fixture(t);
  const http = new AbortController();
  const reply = f.call(http.signal);
  await setImmediate();
  http.abort();
  f.compactionStarts[0].complete.reject(new compaction.ManualCompactionError('summary', 'provider failure'));
  const result = await reply;
  assert.match(result.result.text, /could not produce a useful summary/u);
  assert.equal(f.events[1].data.kind, 'error');
  assert.equal(f.events[1].data.commandId, result.commandId);
});

test('non-Web calls and validation failures retain stock command semantics', async t => {
  const f = await fixture(t);
  const noArgs = await f.call(new AbortController().signal, { line: '/compact details' });
  assert.equal(noArgs.result.kind, 'error');
  const noFiles = await f.call(new AbortController().signal, {
    submittedAttachments: [{ type: 'file', receiptId: 'unused' }],
  });
  assert.equal(noFiles.result.kind, 'error');
  assert.equal(f.compactionStarts.length, 0);
  const local = new AbortController();
  const reply = f.call(local.signal, { http: false });
  const rejected = assert.rejects(reply, { code: 'gateway/cancelled' });
  await setImmediate();
  local.abort();
  await rejected;
  assert.equal(f.compactionStarts[0].signal.aborted, true);
});

test('an unrelated command and a different definition named compact remain request-owned', async t => {
  const f = await fixture(t, { stock: false });
  for (const name of ['compact', 'other']) {
    let received;
    const dispose = f.root.commands.register({
      name, description: 'test command', handler: ({ signal }) => {
        received = signal;
        return Promise.withResolvers().promise;
      },
    });
    try {
      const http = new AbortController();
      const reply = f.call(http.signal, { line: `/${name}` });
      const rejected = assert.rejects(reply, { code: 'gateway/cancelled' });
      await setImmediate();
      assert.equal(received, http.signal);
      http.abort();
      await rejected;
    } finally { await dispose(); }
  }
});

test('unload restores the original method while waiting for accepted work to finish', async t => {
  const f = await fixture(t);
  const http = new AbortController();
  const reply = f.call(http.signal);
  await setImmediate();
  assert.equal(Object.hasOwn(f.raw, 'execute'), true);
  let unloaded = false;
  const disposal = f.plugin.dispose().then(() => { unloaded = true; });
  await setImmediate();
  assert.equal(Object.hasOwn(f.raw, 'execute'), false);
  assert.equal(unloaded, false);
  http.abort();
  f.compactionStarts[0].complete.resolve(success);
  assert.equal((await reply).result.kind, 'success');
  await disposal;
  assert.equal(unloaded, true);
});

test('incompatible service layouts fail activation without replacing the method', async t => {
  const f = await fixture(t);
  const existing = f.raw.execute;
  const second = f.root.extend({}).plugin({ ...patch });
  t.after(() => second.dispose());
  await assert.rejects(second.await(), /incompatible commands service/u);
  assert.equal(f.raw.execute, existing);
});
