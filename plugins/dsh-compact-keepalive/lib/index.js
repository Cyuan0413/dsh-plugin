import { AsyncLocalStorage } from 'node:async_hooks';

export const name = 'compact-keepalive';
export const inject = ['commands', 'connection', 'webServer'];

// DSH 0.2.2-rc.5: the Gateway unwraps the same Cordis Service to check
// Typert metadata, then reads its method on an invocation-bound Service view.
const ORIGINAL = Symbol.for('cordis.original');
const COMPACT_DEFINITION = '@deepseek-ai/dsh-command-compact';
const RPC_PATH = '/api/commands/execute';

function isBareCompact(line) {
  // Match the upstream command boundary and the compact handler's empty-input rule.
  return /^\/compact(?=$|[\t\n\r ])/u.test(line) && line.slice('/compact'.length).trim() === '';
}

export function apply(ctx) {
  const service = ctx.commands[ORIGINAL];
  const prototype = service && Object.getPrototypeOf(service);
  const descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, 'execute');
  const original = descriptor?.value;
  const binding = service?.typertRemote;
  if (typeof original !== 'function' || original.length !== 4 || typeof service.find !== 'function'
    || binding?.service !== service || binding?.serviceKey !== 'commands' || binding?.namespace !== 'commands'
    || service.execute !== original || Object.hasOwn(service, 'execute') || !Object.isExtensible(service)) {
    throw new Error(`${name}: incompatible commands service; expected DSH 0.2.2-rc.5`);
  }

  const webRequest = new AsyncLocalStorage();
  const active = new Set();
  let accepting = false;

  function execute(agent, line, submittedAttachments, signal) {
    const invocation = this.ctx.invocation;
    if (!accepting || webRequest.getStore() !== true
      || invocation?.service !== 'commands' || invocation.request?.namespace !== 'commands'
      || invocation.request.method !== 'execute' || invocation.signal !== signal
      || signal.aborted || submittedAttachments.length !== 0 || !isBareCompact(line)
      || this.find(agent, 'compact')?.definitionId !== COMPACT_DEFINITION) {
      return original.call(this, agent, line, submittedAttachments, signal);
    }

    // No async work before the handoff: the original executor synchronously
    // admits this attachment-free command. Its outer wait and inner handler
    // both get the new signal. The compactor independently joins the Agent
    // maintenance signal, which still honours explicit cancel and disposal.
    const operation = original.call(this, agent, line, submittedAttachments, new AbortController().signal);
    active.add(operation);
    const release = () => { active.delete(operation); };
    void operation.then(release, release);
    return operation;
  }

  ctx.effect(function* () {
    Object.defineProperty(service, 'execute', { value: execute, configurable: true, writable: true });
    accepting = true;
    yield async () => {
      accepting = false;
      if (Object.getOwnPropertyDescriptor(service, 'execute')?.value === execute) {
        Reflect.deleteProperty(service, 'execute');
      }
      await Promise.allSettled(active);
    };
    // Mark the existing authenticated HTTP route without replacing it or
    // touching the response. Local calls and other carriers keep their signal.
    yield ctx.on('connection/request', (req, _res, next) => {
      const isCommand = req.method === 'POST' && req.url?.split('?', 1)[0] === RPC_PATH;
      return isCommand ? webRequest.run(true, next) : next();
    });
  }, `${name}: command lifetime`);
}
