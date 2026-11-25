window.__ModuleLoader__.load({
  id: 'dsh-work-connector',
  factory: (require) => {
    const R = require('react'),
      h = R.createElement;
    const zh = {
      title: 'Work 连接器',
      intro: '仅供本人使用。请勿共享此 Tunnel 或 ChatGPT 连接器；能使用连接器的人都可以向选中的工作区派发任务。',
      connection: '连接设置',
      tunnelId: 'Tunnel ID',
      key: 'Tunnel 运行密钥',
      proxy: '出站代理',
      proxyHint:
        'Tunnel、订阅验证和签名回报共用此 HTTP(S) 代理；连接失败时不直连。',
      keyHint: '使用 Tunnel 运行密钥，不使用管理密钥。',
      stored: '已配置 · 留空保留原值',
      empty: '尚未配置',
      clear: '清除已存值',
      workspaces: '允许派发的工作区',
      noWorkspace: '还没有工作区，请先在 DSH 侧边栏添加。',
      status: '运行状态',
      tunnel: '隧道',
      disabled: '未启用',
      ready: '已就绪',
      not_ready: '未就绪',
      setup_error: '启动失败',
      credentials: '读取已保存凭据', configuration: '检查连接配置', runtime: '校验 Tunnel 程序', profile: '读取 Web 配置目录', 'model-selection': '检查 DSH 会话模型接口', storage: '打开本机状态库', listener: '打开本地 MCP 端口', launch: '启动运行时',
      pending: '待送',
      retrying: '重试中',
      halted: '已停止投递',
      save: '保存配置',
      enable: '启用连接',
      disable: '停用连接',
      refresh: '刷新状态',
      reload: '重新载入配置',
      dirty: '有未保存的修改',
      saved: '配置已保存，连接未启用。',
      started: '已启用，请查看隧道状态。',
      stopped: '连接已停用。',
      editHint: '运行期间不能编辑；停用连接不会中止已受理的 DSH 任务。',
      loading: '正在读取配置…',
      busy: '正在处理…',
      access: '仅已登录的面板所有者可操作。',
      stale: '配置已经变化，请重新载入后再保存。',
      incomplete: '无法启用：请核对 Tunnel ID、运行密钥、出站代理和工作区。',
      workspace: '请选择仍然存在的 DSH 工作区。',
      invalid: '字段格式无效或过长。',
      proxyError: '请输入有效的 HTTP(S) 代理地址。',
      saveFailed: '操作未确认，请重新载入配置核对。',
      failure: '无法读取，请检查网络或刷新页面。',
      discard: '重新载入将放弃未保存的修改，是否继续？',
    };
    const en = {
      title: 'Work connector',
      intro:
        'For personal use only. Do not share this tunnel or connector: anyone with access can dispatch tasks to the selected workspaces.',
      connection: 'Connection settings',
      tunnelId: 'Tunnel ID',
      key: 'Tunnel runtime key',
      proxy: 'Outbound proxy',
      proxyHint:
        'Tunnel, verification and signed events share this HTTP(S) proxy. No direct fallback.',
      keyHint: 'Use a runtime key, not an admin key.',
      stored: 'Configured · leave blank to keep',
      empty: 'Not configured',
      clear: 'Clear saved value',
      workspaces: 'Allowed workspaces',
      noWorkspace: 'Add a workspace in the sidebar first.',
      status: 'Runtime status',
      tunnel: 'Tunnel',
      disabled: 'Disabled',
      ready: 'Ready',
      not_ready: 'Not ready',
      setup_error: 'Startup failed',
      credentials: 'Read saved credentials', configuration: 'Check connection settings', runtime: 'Verify tunnel binary', profile: 'Locate the Web profile', 'model-selection': 'Check the DSH session model API', storage: 'Open local storage', listener: 'Open local MCP listener', launch: 'Start runtime',
      pending: 'Pending',
      retrying: 'Retrying',
      halted: 'Stopped',
      save: 'Save settings',
      enable: 'Enable connection',
      disable: 'Disable connection',
      refresh: 'Refresh status',
      reload: 'Reload settings',
      dirty: 'Unsaved changes',
      saved: 'Saved. The connection is still disabled.',
      started: 'Enabled. Check tunnel readiness below.',
      stopped: 'Connection disabled.',
      editHint: 'Disable to edit. Already admitted DSH tasks keep running.',
      loading: 'Loading settings…',
      busy: 'Working…',
      access: 'An authenticated owner session is required.',
      stale: 'Settings changed. Reload before saving.',
      incomplete:
        'Check tunnel ID, runtime key, proxy and workspaces before enabling.',
      workspace: 'Select an existing workspace.',
      invalid: 'Invalid or oversized field.',
      proxyError: 'Enter a valid HTTP(S) proxy.',
      saveFailed: 'Operation not confirmed. Reload to verify.',
      failure: 'Request failed. Check the connection or refresh the page.',
      discard: 'Discard unsaved changes and reload?',
    };
    const css = `.wc-settings{color:var(--dsw-alias-label-primary);max-width:48rem;display:grid;gap:1.15rem;padding-bottom:1rem}.wc-settings h3,.wc-settings h4,.wc-settings p{margin:0}.wc-settings h3{font-size:1.12rem}.wc-settings h4{font-size:.95rem}.wc-settings .muted,.wc-settings small{color:var(--dsw-alias-label-secondary);font-size:.85em}.wc-settings fieldset{margin:0;padding:0;border:0;min-width:0;display:grid;gap:.85rem}.wc-settings .field{display:grid;gap:.35rem;font-size:.92em}.wc-settings .box{box-sizing:border-box;width:100%;font:inherit;color:inherit;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:7px;padding:.45rem .6rem}.wc-settings .box:focus-visible,.wc-settings button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary)}.wc-settings .row{display:flex;gap:.65rem;align-items:center;flex-wrap:wrap}.wc-settings .block{border-top:1px solid var(--dsw-alias-border-l1);padding-top:.85rem;display:grid;gap:.65rem}.wc-settings button{font:inherit;cursor:pointer;border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:inherit;border:1px solid var(--dsw-alias-border-l2);padding:.38rem .8rem}.wc-settings button:disabled{opacity:.5;cursor:default}.wc-settings .primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}.wc-settings .error{color:var(--dsw-alias-state-error-primary)}.wc-settings input[type=checkbox]{accent-color:var(--dsw-alias-brand-primary)}.wc-settings label{overflow-wrap:anywhere}.wc-settings .badge{background:var(--dsw-alias-bg-layer-2);border-radius:12px;padding:.15rem .55rem}`;
    async function api(path, body, signal) {
      const r = await fetch('/work-connector/' + path, {
        cache: 'no-store',
        credentials: 'same-origin',
        signal,
        ...(body
          ? {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'x-work-settings': '1',
              },
              body: JSON.stringify(body),
            }
          : {}),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok)
        throw Error(
          j.error ??
            (r.status === 403 || r.status === 401 ? 'access' : 'failure'),
        );
      return j;
    }
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const ns = 'work-connector';
        ctx.effect(() => ctx.locale.register(ns, { zh, en }));
        const t = ctx.locale.bind(ns);
        function Page() {
          const [base, B] = R.useState(null),
            [form, F] = R.useState({}),
            [secret, S] = R.useState({}),
            [status, H] = R.useState(null),
            [note, N] = R.useState(''),
            [error, E] = R.useState(''),
            [busy, P] = R.useState(false);
          const lock = R.useRef(false),
            mounted = R.useRef(false),
            sig = R.useRef();
          const fail = (e) => {
            if (mounted.current)
              E(
                e.message === 'proxy'
                  ? 'proxyError'
                  : Object.hasOwn(zh, e.message)
                    ? e.message
                    : 'failure',
              );
          };
          async function load() {
            const b = await api('settings', null, sig.current);
            if (!mounted.current) return;
            B(b);
            F(b.values);
            S({});
          }
          async function health() {
            const s = await api('health', null, sig.current);
            if (mounted.current) H(s);
          }
          R.useEffect(() => {
            mounted.current = true;
            const c = new AbortController();
            sig.current = c.signal;
            Promise.all([load(), health()]).catch(fail);
            return () => {
              mounted.current = false;
              c.abort();
            };
          }, []);
          const dirty =
            !!base &&
            (JSON.stringify(form) !== JSON.stringify(base.values) ||
              Object.keys(secret).length > 0);
          function change(k, val) {
            F((f) => ({ ...f, [k]: val }));
            N('');
          }
          function changeSecret(k, val) {
            S((prev) => {
              const next = { ...prev };
              if (val === '') delete next[k];
              else next[k] = val;
              return next;
            });
            N('');
          }
          async function act(action) {
            if (lock.current) return;
            if (action === 'reload' && dirty && !window.confirm(t('discard')))
              return;
            lock.current = true;
            P(true);
            E('');
            N('');
            try {
              if (action === 'refresh') {
                await health();
                return;
              }
              if (action !== 'reload') {
                await api(
                  'settings',
                  {
                    version: base.version,
                    action,
                    ...(action === 'save' ? { values: form, ...secret } : {}),
                  },
                  sig.current,
                );
                if (mounted.current)
                  N(
                    { save: 'saved', enable: 'started', disable: 'stopped' }[
                      action
                    ],
                  );
              }
              await load();
              await health();
            } catch (e) {
              fail(e);
            } finally {
              lock.current = false;
              if (mounted.current) P(false);
            }
          }
          const button = (label, fn, disabled = false, primary = false) =>
            h(
              'button',
              {
                type: 'button',
                onClick: fn,
                disabled: busy || disabled,
                className: primary ? 'primary' : '',
              },
              t(label),
            );
          function field(key, hint, placeholder = '') {
            const props = {
              className: 'box',
              value: form[key] ?? '',
              placeholder,
              onChange: (e) => change(key, e.target.value),
              spellCheck: false,
            };
            return h(
              'label',
              { className: 'field' },
              h('strong', null, t(key)),
              h('input', props),
              hint && h('small', null, t(hint)),
            );
          }
          function privateField(k, has, hint) {
            return h(
              'div',
              { className: 'field' },
              h(
                'label',
                { className: 'field' },
                h('strong', null, t(k)),
                h('input', {
                  className: 'box',
                  type: 'password',
                  autoComplete: 'new-password',
                  spellCheck: false,
                  value: secret[k] ?? '',
                  disabled: secret[k] === null,
                  placeholder: t(has ? 'stored' : 'empty'),
                  onChange: (e) => changeSecret(k, e.target.value),
                }),
              ),
              h('small', null, t(hint)),
              has &&
                h(
                  'label',
                  null,
                  h('input', {
                    type: 'checkbox',
                    checked: secret[k] === null,
                    onChange: (e) =>
                      changeSecret(k, e.target.checked ? null : ''),
                  }),
                  ' ',
                  t('clear'),
                ),
            );
          }
          return h(
            'section',
            { className: 'wc-settings' },
            h('style', null, css),
            h(
              'header',
              null,
              h('h3', null, t('title')),
              h('p', { className: 'muted' }, t('intro')),
            ),
            !base && !error && h('p', null, t('loading')),
            base &&
              h(
                R.Fragment,
                null,
                h(
                  'div',
                  { className: 'row' },
                  h('b', null, t('tunnel')),
                  h(
                    'span',
                    { className: 'badge' },
                    t(
                      status?.tunnel ??
                        (base.enabled ? 'not_ready' : 'disabled'),
                    ),
                    status?.tunnel === 'setup_error' && status.stage && ` · ${t(status.stage)}`,
                  ),
                  button(
                    base.enabled ? 'disable' : 'enable',
                    () => act(base.enabled ? 'disable' : 'enable'),
                    dirty,
                  ),
                ),
                base.enabled && h('small', null, t('editHint')),
                h(
                  'fieldset',
                  { disabled: base.enabled || busy },
                  h(
                    'div',
                    { className: 'block' },
                    h('h4', null, t('connection')),
                    field('tunnelId', null, 'tunnel_…'),
                    privateField('key', base.hasKey, 'keyHint'),
                    privateField('proxy', base.hasProxy, 'proxyHint'),
                  ),
                  h(
                    'div',
                    { className: 'block' },
                    h('h4', null, t('workspaces')),
                    base.workspaces.length === 0 &&
                      h('small', null, t('noWorkspace')),
                    [
                      ...base.workspaces,
                      ...form.workspaceIds
                        .filter(
                          (id) => !base.workspaces.some((w) => w.id === id),
                        )
                        .map((id) => ({ id, title: id })),
                    ].map((w) =>
                      h(
                        'label',
                        { key: w.id },
                        h('input', {
                          type: 'checkbox',
                          checked: form.workspaceIds.includes(w.id),
                          onChange: (e) =>
                            change(
                              'workspaceIds',
                              e.target.checked
                                ? [...form.workspaceIds, w.id]
                                : form.workspaceIds.filter((id) => id !== w.id),
                            ),
                        }),
                        ' ',
                        w.title || w.id,
                        ' ',
                        h('small', null, w.path),
                      ),
                    ),
                  ),
                ),
                h(
                  'div',
                  { className: 'row' },
                  button(
                    'save',
                    () => act('save'),
                    !dirty || base.enabled,
                    true,
                  ),
                  button('reload', () => act('reload')),
                  dirty && h('small', null, t('dirty')),
                ),
              ),
            h(
              'div',
              { role: 'status', 'aria-live': 'polite' },
              busy
                ? t('busy')
                : error
                  ? h('span', { className: 'error' }, t(error))
                  : note
                    ? t(note)
                    : null,
            ),
            !base && error && button('reload', () => act('reload')),
            status &&
              h(
                'div',
                { className: 'block' },
                h('h4', null, t('status')),
                h(
                  'div',
                  { className: 'row' },
                  ...['pending', 'retrying', 'halted'].map((k) =>
                    h('span', { key: k }, `${t(k)} ${status[k]}`),
                  ),
                  button('refresh', () => act('refresh')),
                ),
              ),
          );
        }
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: 'work-connector',
              order: 32,
              label: () => t('title'),
            },
            Page,
          ),
        );
      },
    };
  },
});
