window.__ModuleLoader__.load({
  id: 'dsh-pairing-entry',
  factory: (require) => {
    const react = require('react');

    /** Locale namespace this plugin owns. */
    const NS = 'pairing-entry';

    /** Package name; also the key of the card-level (bundle) config slot. */
    const PACKAGE = 'dsh-pairing-entry';

    /** Loader entry id; also the `configForms` namespace. */
    const ENTRY_ID = 'pairing-entry';

    /** Row config slot key: `<package name>#<row id>`. */
    const ROW_KEY = PACKAGE + '#' + ENTRY_ID;

    /** Minimum key length, mirroring the Host's validation. */
    const MIN_KEY_LENGTH = 32;

    /** Characters a key may use, mirroring the Host's validation. */
    const KEY_PATTERN = /^[A-Za-z0-9_-]+$/u;

    /** 64 characters, so every byte of `crypto.getRandomValues` maps without bias. */
    const KEY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    const zh = {
      summary: '收藏一个固定入口地址，用来换取当前启动 token',
      tab: '入口密钥',
      intro: '收藏这个入口地址，它会把浏览器带到当前进程的启动 token 上。密钥保存后立即生效，修改后旧的收藏地址失效。',
      label: '入口密钥',
      placeholder: '至少 32 个字符，只用 A-Z、a-z、0-9、- 和 _',
      generate: '随机生成',
      save: '保存',
      clear: '清除',
      saved: '已保存，入口地址已更新',
      cleared: '已清除，入口页停止服务',
      saveFailed: '保存失败，配置可能已被其他窗口修改，请重试',
      problemMissing: '还没有设置密钥，入口页不会提供服务',
      problemShort: '密钥只有 {length} 个字符，至少需要 {min} 个',
      problemCharset: '密钥只能使用 A-Z、a-z、0-9、- 和 _',
      loading: '正在读取配置…',
      unavailable: '这个插件条目当前没有可编辑的配置，请确认它已加载且版本匹配',
      readOnly: '当前 profile 不接受配置写入',
      entryUrl: '入口地址',
      copy: '复制',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择地址',
      noKey: '设置密钥后会在这里显示可直接收藏的地址',
    };

    const en = {
      summary: 'Bookmark a fixed entry address that reaches the current launch token',
      tab: 'Entry key',
      intro: 'Bookmark this entry address: it takes the browser to the current process launch token. A saved key applies immediately; changing it invalidates the old bookmark.',
      label: 'Entry key',
      placeholder: 'At least 32 characters from A-Z, a-z, 0-9, - and _',
      generate: 'Generate',
      save: 'Save',
      clear: 'Clear',
      saved: 'Saved; the entry address is live',
      cleared: 'Cleared; the entry page is no longer served',
      saveFailed: 'Save failed. The configuration may have changed in another window; try again.',
      problemMissing: 'No key yet, so the entry page is not served',
      problemShort: 'The key is {length} characters long; use at least {min}',
      problemCharset: 'The key may use only A-Z, a-z, 0-9, - and _',
      loading: 'Reading configuration…',
      unavailable: 'This plugin entry has no editable configuration right now; check that it is loaded and version-matched',
      readOnly: 'This profile does not accept configuration writes',
      entryUrl: 'Entry address',
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Copy failed; select the address manually',
      noKey: 'Setting a key shows the address to bookmark here',
    };

    const STYLE_SECTION = {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '680px',
      color: 'var(--dsw-alias-label-primary)',
      fontSize: '13px',
      lineHeight: '20px',
    };
    const STYLE_HINT = {
      margin: 0,
      color: 'var(--dsw-alias-label-tertiary)',
      fontSize: '12px',
      lineHeight: '18px',
      textWrap: 'pretty',
    };
    const STYLE_ROW = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    };
    const STYLE_INPUT = {
      flex: '1 1 auto',
      minWidth: 0,
      height: '32px',
      padding: '0 10px',
      font: 'inherit',
      fontFamily: 'var(--ds-font-family-code, ui-monospace, monospace)',
      color: 'inherit',
      background: 'var(--dsw-alias-bg-layer-1, transparent)',
      border: '0.5px solid var(--dsw-alias-border-l4, rgba(128, 128, 128, 0.4))',
      borderRadius: 'var(--dsw-radius-md, 8px)',
    };
    const STYLE_BUTTON = {
      flex: 'none',
      height: '32px',
      padding: '0 12px',
      font: 'inherit',
      color: 'inherit',
      background: 'var(--dsw-alias-bg-module-platform, rgba(128, 128, 128, 0.12))',
      border: '0.5px solid var(--dsw-alias-border-l3, rgba(128, 128, 128, 0.3))',
      borderRadius: 'var(--dsw-radius-md, 8px)',
      cursor: 'pointer',
    };
    const STYLE_CODE = {
      fontFamily: 'var(--ds-font-family-code, ui-monospace, monospace)',
      fontSize: '12px',
      overflowWrap: 'anywhere',
    };

    /**
     * Report what is wrong with a candidate key.
     * @param value - current input value.
     * @returns the locale key naming the problem, or `undefined` when usable.
     */
    function problemKeyOf(value) {
      if (value === '') return 'problemMissing';
      if (value.length < MIN_KEY_LENGTH) return 'problemShort';
      if (!KEY_PATTERN.test(value)) return 'problemCharset';
      return undefined;
    }

    /**
     * Generate a key with the same alphabet and length the Host accepts.
     * @returns a random 32-character URL-safe key.
     */
    function randomKey() {
      const bytes = new Uint8Array(MIN_KEY_LENGTH);
      globalThis.crypto.getRandomValues(bytes);
      let key = '';
      for (const byte of bytes) key += KEY_ALPHABET[byte & 63];
      return key;
    }

    /**
     * Absolute address of the entry page for one key. The plugin route is
     * root-relative, so this is exact for a root-mounted GUI and needs the mount
     * prefix by hand otherwise.
     * @param key - stored key.
     * @returns the bookmarkable address.
     */
    function entryUrlOf(key) {
      if (key === '') return '';
      return `${globalThis.location.origin}/entry/${key}`;
    }

    /**
     * Track a form's snapshot. The first render already reads `form.state`;
     * a `subscribe` method keeps it current afterwards.
     * @param form - page form (`state`, `subscribe`, `mutate`), or `undefined`.
     * @returns the current snapshot, or `undefined` without a form.
     */
    function useFormSnapshot(form) {
      const [snapshot, setSnapshot] = react.useState(() => (form === undefined ? undefined : form.state));
      react.useEffect(() => {
        if (form === undefined) return undefined;
        setSnapshot(form.state);
        if (typeof form.subscribe !== 'function') return undefined;
        return form.subscribe(() => setSnapshot(form.state));
      }, [form]);
      return snapshot;
    }

    /**
     * The config form that edits the entry key, for the Plugins page row and card.
     * @param props - the page host's `view` and form, and the slot's locale translator.
     * @returns the summary or the config form.
     */
    function PairingEntrySettingsTab({ view, form, t }) {
      const snapshot = useFormSnapshot(form);
      const [draft, setDraft] = react.useState(null);
      const [busy, setBusy] = react.useState(false);
      const [notice, setNotice] = react.useState('');
      const [copied, setCopied] = react.useState(false);
      const inputId = react.useId();

      if (view === 'summary') return t('summary');
      if (form === undefined || snapshot === null || typeof snapshot !== 'object') {
        return react.createElement('p', { style: STYLE_HINT }, t('unavailable'));
      }
      if (snapshot.status === 'loading') return react.createElement('p', { style: STYLE_HINT }, t('loading'));
      if (snapshot.status === 'unavailable') return react.createElement('p', { style: STYLE_HINT }, t('unavailable'));

      const stored = typeof snapshot.value?.key === 'string' ? snapshot.value.key.trim() : '';
      const value = draft ?? stored;
      const candidate = value.trim();
      const problem = problemKeyOf(candidate);
      const disabled = !snapshot.writable || busy;
      const dirty = candidate !== stored;
      const entryUrl = entryUrlOf(stored);

      const save = async () => {
        if (disabled || dirty === false || problem !== undefined) return;
        setBusy(true);
        setNotice('');
        let saved = false;
        try {
          saved = (await form.mutate([{ op: 'set', path: ['key'], value: candidate }], snapshot.revision)) === true;
        } catch (_error) {
          saved = false;
        }
        setBusy(false);
        setDraft(candidate);
        setNotice(t(saved ? 'saved' : 'saveFailed'));
      };

      const clear = async () => {
        if (disabled || stored === '') return;
        setBusy(true);
        setNotice('');
        let cleared = false;
        try {
          cleared = (await form.mutate([{ op: 'unset', path: ['key'] }], snapshot.revision)) === true;
        } catch (_error) {
          cleared = false;
        }
        setBusy(false);
        setDraft(null);
        setCopied(false);
        setNotice(t(cleared ? 'cleared' : 'saveFailed'));
      };

      const generate = () => {
        setDraft(randomKey());
        setNotice('');
        setCopied(false);
      };

      const copy = async () => {
        try {
          await globalThis.navigator.clipboard.writeText(entryUrl);
          setCopied(true);
          setNotice('');
        } catch (_error) {
          setCopied(false);
          setNotice(t('copyFailed'));
        }
      };

      let status = null;
      if (problem !== undefined) status = t(problem, { length: candidate.length, min: MIN_KEY_LENGTH });
      if (stored === '' && problem === 'problemMissing') status = t('noKey');

      return react.createElement('div', { style: STYLE_SECTION },
        react.createElement('p', { style: STYLE_HINT }, t('intro')),
        !snapshot.writable ? react.createElement('p', { style: STYLE_HINT }, t('readOnly')) : null,
        react.createElement('label', { htmlFor: inputId, style: { fontWeight: 500 } }, t('label')),
        react.createElement('div', { style: STYLE_ROW },
          react.createElement('input', {
            id: inputId,
            type: 'text',
            value,
            disabled,
            spellCheck: false,
            autoComplete: 'off',
            placeholder: t('placeholder'),
            style: STYLE_INPUT,
            onChange: (event) => {
              setDraft(event.target.value);
              setNotice('');
              setCopied(false);
            },
          }),
          react.createElement('button', {
            type: 'button',
            style: STYLE_BUTTON,
            disabled,
            onClick: generate,
          }, t('generate')),
        ),
        status === null ? null : react.createElement('p', { style: STYLE_HINT }, status),
        notice === '' ? null : react.createElement('p', { style: STYLE_HINT }, notice),
        react.createElement('div', { style: STYLE_ROW },
          react.createElement('button', {
            type: 'button',
            style: STYLE_BUTTON,
            disabled: disabled || dirty === false || problem !== undefined,
            onClick: () => { void save(); },
          }, t('save')),
          react.createElement('button', {
            type: 'button',
            style: STYLE_BUTTON,
            disabled: disabled || stored === '',
            onClick: () => { void clear(); },
          }, t('clear')),
        ),
        entryUrl === '' ? null : react.createElement('div', { style: STYLE_ROW },
          react.createElement('span', { style: STYLE_HINT }, `${t('entryUrl')}: `),
          react.createElement('code', { style: STYLE_CODE }, entryUrl),
          react.createElement('button', {
            type: 'button',
            style: STYLE_BUTTON,
            onClick: () => { void copy(); },
          }, t(copied ? 'copied' : 'copy')),
        ),
      );
    }

    /**
     * Slot registration, locale copy, and the settings RPC. `configForms` stays
     * out of this list: a DSH that does not provide it leaves the client pending.
     * `remote.settings` is declared because reading it otherwise throws.
     */
    const inject = ['slots', 'locale', 'remote', 'remote.settings'];

    /**
     * Wrap a controller the way the Plugins page wraps one for a row slot.
     * @param controller - a controller with `getSnapshot` and `mutate`.
     * @returns a form with `state`, `subscribe` and `mutate`.
     */
    function wrap(controller) {
      return {
        get state() { return controller.getSnapshot(); },
        subscribe(listener) {
          return typeof controller.subscribe === 'function' ? controller.subscribe(listener) : () => {};
        },
        mutate(ops, revision) { return controller.mutate(ops, revision); },
      };
    }

    /**
     * Whether a settings-document schema describes the `/entry page` key.
     * @param schema - the namespace's serialized schema, or anything else.
     * @returns `true` when a node description mentions `/entry page`.
     */
    function schemaMentionsEntry(schema) {
      const refs = schema?.refs;
      if (refs === null || typeof refs !== 'object') return false;
      for (const node of Object.values(refs)) {
        const description = node?.meta?.description;
        if (typeof description === 'string' && description.includes('/entry page')) return true;
      }
      return false;
    }

    /**
     * Choose the `configForms` namespace that holds this plugin's key.
     * @param snapshot - the `configForms.describe()` snapshot, or anything else.
     * @returns `ENTRY_ID` when listed, else the namespace describing the key, else `ENTRY_ID`.
     */
    function pickNamespace(snapshot) {
      const namespaces = snapshot?.view?.namespaces ?? [];
      if (namespaces.some((item) => item.ns === ENTRY_ID)) return ENTRY_ID;
      const described = namespaces.find((item) => schemaMentionsEntry(item.schema));
      return described?.ns ?? ENTRY_ID;
    }

    /**
     * Read a service that is already provided. This does not wait, so a missing
     * service cannot leave the client pending.
     * @param ctx - the client plugin context.
     * @param name - service name.
     * @returns the service, or `undefined`.
     */
    function provided(ctx, name) {
      if (typeof ctx.get !== 'function') return undefined;
      try {
        return ctx.get(name, false);
      } catch (_error) {
        return undefined;
      }
    }

    /**
     * The settings RPC when the client already has `remote`. `describe()` returns
     * `{ ok, value }` and `value` is `{ namespaces, writable }`.
     * @param ctx - the client plugin context.
     * @returns the settings namespace, or `undefined`.
     */
    function remoteSettings(ctx) {
      try {
        const settings = ctx.remote?.settings ?? provided(ctx, 'remote')?.settings;
        if (typeof settings?.describe !== 'function' || typeof settings?.mutate !== 'function') return undefined;
        return settings;
      } catch (_error) {
        return undefined;
      }
    }

    /**
     * Unwrap a describe or mutate answer into the settings document.
     * @param response - an RPC result, a document, or anything else.
     * @returns the document, or `undefined`.
     */
    function documentOf(response) {
      if (response?.ok === true && response.value?.namespaces) return response.value;
      if (response?.namespaces) return response;
      return undefined;
    }

    /**
     * A page form backed by `remote.settings`, for a DSH that has no `configForms`.
     * @param settings - the settings RPC.
     * @returns a form with `state`, `subscribe` and `mutate`.
     */
    function remoteForm(settings) {
      let document;
      let snapshot = { status: 'loading', writable: false };
      const listeners = new Set();
      const publish = (next) => {
        snapshot = next;
        for (const listener of listeners) listener();
      };
      const applyDocument = (next) => {
        document = next;
        const ns = pickNamespace({ view: next });
        const row = next?.namespaces?.find((item) => item.ns === ns);
        if (!row) {
          publish({ status: 'unavailable', writable: next?.writable === true });
          return;
        }
        publish({
          status: 'ready',
          writable: next.writable === true,
          value: row.value,
          base: row.base,
          user: row.user,
          revision: row.revision,
        });
      };
      const load = async () => {
        try {
          const document = documentOf(await settings.describe());
          if (document) applyDocument(document);
          else publish({ status: 'unavailable', writable: false });
        } catch (_error) {
          publish({ status: 'unavailable', writable: false });
        }
      };
      void load();
      return {
        get state() { return snapshot; },
        subscribe(listener) {
          listeners.add(listener);
          return () => { listeners.delete(listener); };
        },
        async mutate(ops, revision) {
          const ns = pickNamespace({ view: document });
          try {
            const response = await settings.mutate(ns, ops, revision);
            if (response?.ok === false) {
              await load();
              return false;
            }
            const written = documentOf(response);
            if (written) applyDocument(written);
            else await load();
            return true;
          } catch (_error) {
            return false;
          }
        },
      };
    }

    /**
     * Register the settings section, the row config and the bundle config.
     * The page form wins when one is passed. Otherwise an already-provided
     * `configForms` is used, and failing that an already-provided `remote.settings`.
     * Neither service is waited on. The namespace is `pairing-entry` when the
     * settings document lists it, otherwise the namespace whose schema describes
     * the `/entry page` key.
     * @param ctx - the client plugin context.
     */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), `${NS}: dictionaries`);
      const t = ctx.locale.bind(NS);
      const forms = provided(ctx, 'configForms');
      let describe;
      try {
        describe = typeof forms?.describe === 'function' ? forms.describe() : undefined;
      } catch (_error) {
        describe = undefined;
      }
      const settings = forms ? undefined : remoteSettings(ctx);
      const fallback = settings ? remoteForm(settings) : undefined;

      const wrapped = new Map();
      function formFor(ns) {
        if (typeof forms?.get !== 'function') return fallback;
        if (wrapped.has(ns)) return wrapped.get(ns);
        let controller;
        try {
          controller = forms.get(ns);
        } catch (_error) {
          return fallback;
        }
        if (typeof controller?.getSnapshot !== 'function' || typeof controller?.mutate !== 'function') return fallback;
        const form = wrap(controller);
        wrapped.set(ns, form);
        return form;
      }

      function PairingEntryConfig(props) {
        const [ns, setNs] = react.useState(() => pickNamespace(describe?.getSnapshot?.()));
        react.useEffect(() => {
          if (typeof describe?.subscribe !== 'function') return undefined;
          return describe.subscribe(() => {
            const next = pickNamespace(describe.getSnapshot());
            setNs((current) => (current === next ? current : next));
          });
        }, [describe]);
        return PairingEntrySettingsTab({
          view: props.view ?? 'page',
          form: props.form ?? formFor(ns),
          t: props.t ?? t,
        });
      }

      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: ENTRY_ID,
        order: 80,
        label: () => t('tab'),
        locale: NS,
      }, PairingEntryConfig));
      ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
        name: 'plugins.row.config',
        key: ROW_KEY,
        locale: NS,
      }, PairingEntryConfig));
      ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
        name: 'plugins.bundle.config',
        key: PACKAGE,
        locale: NS,
      }, PairingEntryConfig));
    }

    return { inject, apply };
  },
});
