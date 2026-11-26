import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const KEY = 'Zx9Qm2rL7Tb4Wc8Yd1Fg6Hj3Kn5Pp0Ss';

/**
 * Minimal hook runtime: enough for one synchronous render pass and the click
 * handlers a test invokes, not a React substitute.
 * @returns the React stand-in handed to the bundle factory.
 */
function createReactStub() {
  let states = [];
  let index = 0;
  return {
    /** Start one render pass while keeping state across passes. */
    beginRender() {
      index = 0;
    },
    useState(initial) {
      const slot = index++;
      if (!(slot in states)) states[slot] = typeof initial === 'function' ? initial() : initial;
      return [states[slot], (next) => { states[slot] = next; }];
    },
    useEffect(effect) {
      effect();
    },
    useId() {
      return `field-${index++}`;
    },
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children: children.flat(Number.POSITIVE_INFINITY) };
    },
  };
}

let react = createReactStub();
const registrations = [];
globalThis.window = { __ModuleLoader__: { load: (registration) => registrations.push(registration) } };
globalThis.location = { origin: 'https://dsh.example' };
await import('../lib/client.js');

/**
 * Load the bundle's factory with the React stand-in.
 * @returns the bundle exports and every specifier the factory required.
 */
function materialize(stub = react) {
  assert.equal(registrations.length, 1);
  const [registration] = registrations;
  assert.equal(registration.id, 'dsh-pairing-entry');
  const required = [];
  const exports = registration.factory((specifier) => {
    required.push(specifier);
    if (specifier !== 'react') throw new Error(`unexpected require("${specifier}")`);
    return stub;
  });
  return { exports, required, registration };
}

/**
 * Render one component with the hook runtime.
 * @param component - component function.
 * @param props - props to render with.
 * @returns the element tree.
 */
function render(component, props) {
  react.beginRender();
  return component(props);
}

/**
 * Collect the text nodes of an element tree.
 * @param node - element tree node.
 * @returns every string child, depth first.
 */
function texts(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return [];
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap((child) => texts(child));
  return texts(node.children);
}

/**
 * Find the single button whose label contains one text.
 * @param tree - element tree.
 * @param label - text to look for.
 * @returns the matching element, or `undefined`.
 */
function button(tree, label) {
  const nodes = [];
  const visit = (node) => {
    if (node === null || node === undefined || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    nodes.push(node);
    node.children.forEach(visit);
  };
  visit(tree);
  return nodes.find((node) => node.type === 'button' && texts(node).includes(label));
}

/**
 * Find the single input of a rendered form.
 * @param tree - element tree.
 * @returns the input element, or `undefined`.
 */
function input(tree) {
  const nodes = [];
  const visit = (node) => {
    if (node === null || node === undefined || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    nodes.push(node);
    node.children.forEach(visit);
  };
  visit(tree);
  return nodes.find((node) => node.type === 'input');
}

/**
 * Build a form controller stand-in with one snapshot.
 * @param snapshot - the snapshot to report.
 * @returns the controller and the writes it received.
 */
function fakeForm(snapshot) {
  const writes = [];
  return {
    writes,
    state: snapshot,
    async mutate(ops, revision) {
      writes.push({ ops, revision });
      return true;
    },
  };
}

/**
 * Mount the client plugin over stand-in services.
 * @param extra - optional extra context members, such as `inject`.
 * @returns the recorded slot registration and locale dictionaries.
 */
function mountClient(extra = {}) {
  react = createReactStub();
  const { exports } = materialize();
  const localeNamespaces = [];
  const slots = [];
  const ctx = {
    effect(execute) {
      return execute();
    },
    locale: {
      register(ns, dictionaries) {
        localeNamespaces.push({ ns, dictionaries });
        return () => {};
      },
      bind(ns) {
        return (key, params) => (params === undefined ? `${ns}/${key}` : `${ns}/${key}(${Object.keys(params).join(',')})`);
      },
    },
    slots: {
      inject(_name, callback) {
        callback();
      },
      register(options, component) {
        slots.push({ options, component });
        return () => {};
      },
    },
    ...extra,
  };
  exports.apply(ctx);
  return { exports, localeNamespaces, slots };
}

const READY = {
  status: 'ready',
  value: { key: KEY },
  base: {},
  user: { key: KEY },
  revision: 0,
  writable: true,
};

describe('bundle shape', () => {
  it('registers one factory under the package id and requires only react', () => {
    const { exports, required, registration } = materialize();
    assert.equal(registration.id, 'dsh-pairing-entry');
    assert.deepEqual(required, ['react']);
    assert.deepEqual(exports.inject, ['slots', 'locale']);
    assert.equal(typeof exports.apply, 'function');
  });

  it('registers dictionaries whose key sets agree', () => {
    const { localeNamespaces } = mountClient();
    assert.equal(localeNamespaces.length, 1);
    const [{ ns, dictionaries }] = localeNamespaces;
    assert.equal(ns, 'pairing-entry');
    assert.deepEqual(Object.keys(dictionaries.zh).sort(), Object.keys(dictionaries.en).sort());
  });

  it('contributes one config to the Plugins page row', () => {
    const { slots } = mountClient();
    assert.equal(slots.length, 1);
    const [{ options, component }] = slots;
    assert.equal(options.name, 'plugins.row.config');
    assert.equal(options.key, 'dsh-pairing-entry#pairing-entry');
    assert.equal(options.locale, 'pairing-entry');
    assert.equal('inject' in options, false);
    assert.equal(typeof component, 'function');
  });
});

describe('card config', () => {
  it('registers a bundle config from the configForms controller', () => {
    const requested = [];
    const controller = { ...fakeForm(READY), getSnapshot: () => READY, subscribe: () => () => {} };
    const { slots } = mountClient({
      inject(_names, callback) {
        callback({ configForms: { get(id) { requested.push(id); return controller; } } });
      },
    });
    assert.deepEqual(requested, ['pairing-entry']);
    assert.equal(slots.length, 2);
    const bundle = slots[1];
    assert.equal(bundle.options.name, 'plugins.bundle.config');
    assert.equal(bundle.options.key, 'dsh-pairing-entry');
    assert.equal('inject' in bundle.options, false);
    const tree = render(bundle.component, { view: 'page', t: (key) => key });
    assert.equal(input(tree).props.value, KEY);
  });
});

describe('tab rendering', () => {
  it('returns the one-line summary in summary view and explains a missing form', () => {
    const { slots } = mountClient();
    assert.equal(render(slots[0].component, { view: 'summary', t: (key) => key }), 'summary');
    const tree = render(slots[0].component, { view: 'page', form: undefined, t: (key) => key });
    assert.deepEqual(texts(tree), ['unavailable']);
  });

  it('shows a loading line before the Host describes the namespace', () => {
    const form = fakeForm({ status: 'loading', writable: false });
    const { slots } = mountClient();
    const tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    assert.deepEqual(texts(tree), ['loading']);
  });

  it('explains an unavailable namespace', () => {
    const form = fakeForm({ status: 'unavailable', writable: false });
    const { slots } = mountClient();
    const tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    assert.deepEqual(texts(tree), ['unavailable']);
  });

  it('renders the stored key, the entry address, and the random button', () => {
    const form = fakeForm(READY);
    const { slots } = mountClient();
    const tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    assert.equal(input(tree).props.value, KEY);
    assert.equal(input(tree).props.disabled, false);
    assert.deepEqual(button(tree, 'generate') === undefined, false);
    assert.equal(texts(tree).includes(`https://dsh.example/entry/${KEY}`), true);
  });

  it('saves the key through the form controller', async () => {
    const form = fakeForm(READY);
    const { slots } = mountClient();
    let tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    button(tree, 'generate').props.onClick();
    tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    const generated = input(tree).props.value;
    assert.match(generated, /^[A-Za-z0-9_-]{32}$/u);
    button(tree, 'save').props.onClick();
    await Promise.resolve();
    assert.deepEqual(form.writes, [{
      ops: [{ op: 'set', path: ['key'], value: generated }],
      revision: READY.revision,
    }]);
  });

  it('reports a failed save when the Host rejects the mutation', async () => {
    const form = fakeForm(READY);
    form.mutate = async () => false;
    const { slots } = mountClient();
    let tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    button(tree, 'generate').props.onClick();
    tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    button(tree, 'save').props.onClick();
    await Promise.resolve();
    await Promise.resolve();
    tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    assert.equal(texts(tree).includes('saveFailed'), true);
  });

  it('clears the key and reports the empty state', async () => {
    const form = fakeForm(READY);
    const { slots } = mountClient();
    const tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    button(tree, 'clear').props.onClick();
    await Promise.resolve();
    assert.deepEqual(form.writes, [{
      ops: [{ op: 'unset', path: ['key'] }],
      revision: READY.revision,
    }]);
  });

  it('keeps the save button disabled while the draft is unusable', () => {
    const form = fakeForm(READY);
    const { slots } = mountClient();
    let tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    input(tree).props.onChange({ target: { value: 'too-short' } });
    tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    assert.equal(button(tree, 'save').props.disabled, true);
    assert.equal(texts(tree).some((text) => text.includes('problemShort')), true);
  });

  it('shows the empty-state hint when no key is stored', () => {
    const form = fakeForm({ status: 'ready', value: {}, base: {}, user: {}, revision: 0, writable: true });
    const { slots } = mountClient();
    const tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    assert.equal(input(tree).props.value, '');
    assert.equal(texts(tree).includes('noKey'), true);
    assert.equal(button(tree, 'clear').props.disabled, true);
  });

  it('marks the form read-only when the profile refuses writes', () => {
    const form = fakeForm({ ...READY, writable: false });
    const { slots } = mountClient();
    const tree = render(slots[0].component, { view: 'page', form, t: (key) => key });
    assert.equal(input(tree).props.disabled, true);
    assert.equal(texts(tree).includes('readOnly'), true);
  });
});
