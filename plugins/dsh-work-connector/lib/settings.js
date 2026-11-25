import { randomUUID, createPublicKey } from 'node:crypto';
import { proxyURL } from './network.js';

const prefix = 'work-connector/settings-'; // Each DSH credential-key segment must start with a letter.
const fields = [
  'tunnelId',
  'issuer',
  'resource',
  'jwksText',
  'subjects',
  'callbackHosts',
  'workspaceIds',
];
const invalid = (code) =>
  Object.assign(new Error(code), { publicCode: code, status: 400 });
function scalar(v, max = 2048) {
  if (
    typeof v !== 'string' ||
    v.length > max ||
    /[\x00-\x08\x0b-\x1f\x7f]/.test(v)
  )
    throw invalid('invalid');
  return v.trim();
}
function list(v) {
  if (!Array.isArray(v) || v.length > 256) throw invalid('invalid');
  return [...new Set(v.map((x) => scalar(x, 512)).filter(Boolean))];
}
function httpsURL(v) {
  if (v) {
    let u;
    try {
      u = new URL(v);
    } catch {
      throw invalid('https');
    }
    if (
      u.protocol !== 'https:' ||
      u.username ||
      u.password ||
      u.hash ||
      u.search
    )
      throw invalid('https');
  }
  return v;
}
export function publicKeys(s) {
  if (!s) return '';
  try {
    const j = JSON.parse(s);
    if (!Array.isArray(j.keys) || !j.keys.length || j.keys.length > 64)
      throw Error();
    const keys = j.keys.map((k) => {
      if (
        !['RSA', 'EC', 'OKP'].includes(k.kty) ||
        ['d', 'p', 'q', 'dp', 'dq', 'qi', 'oth', 'k'].some((n) =>
          Object.hasOwn(k, n),
        )
      )
        throw Error();
      const clean = Object.fromEntries(
        Object.entries(k).filter(([n]) =>
          [
            'kty',
            'kid',
            'alg',
            'use',
            'key_ops',
            'e',
            'n',
            'crv',
            'x',
            'y',
          ].includes(n),
        ),
      );
      createPublicKey({ key: clean, format: 'jwk' });
      return clean;
    });
    return JSON.stringify({ keys }, null, 2);
  } catch {
    throw invalid('jwks');
  }
}
export async function storedSecrets(ctx, config) {
  if (!config.credentialId) return {};
  if (!/^[a-f0-9-]{36}$/.test(config.credentialId)) throw invalid('credential');
  const record = await ctx.credentials.readRecord(prefix + config.credentialId);
  if (record?.kind !== 'grant' || !record.payload) throw invalid('credential');
  return record.payload;
}
export function effectiveSecrets(config, stored, env = process.env) {
  return {
    key: stored.key ?? env.DSH_WORK_TUNNEL_KEY ?? '',
    proxy:
      stored.proxy ??
      (config.proxy?.startsWith('env:')
        ? env[config.proxy.slice(4)]
        : config.proxy) ??
      '',
  };
}

export function settingsController(ctx, config, preflight) {
  let version = randomUUID(),
    busy = false;
  async function view() {
    const stored = await storedSecrets(ctx, config),
      sec = effectiveSecrets(config, stored);
    const values = Object.fromEntries(
      fields.map((k) => [
        k,
        config[k] ??
          (['subjects', 'workspaceIds', 'callbackHosts'].includes(k) ? [] : ''),
      ]),
    );
    values.jwksText = publicKeys(values.jwksText);
    return {
      version,
      enabled: !!config.enabled,
      values,
      hasKey: !!sec.key,
      hasProxy: !!sec.proxy,
      hasKeyFile: !!config.jwksFile,
      workspaces: ctx.workspaceRegistry
        .list()
        .map(({ id, title, path }) => ({ id, title, path })),
    };
  }
  async function write(data) {
    if (!data || data.version !== version || busy)
      throw Object.assign(invalid('stale'), { status: 409 });
    busy = true;
    try {
      const entry = ctx.fiber.entry;
      if (!entry) throw invalid('entry');
      if (data.action === 'disable' || data.action === 'enable') {
        if (data.action === 'enable') {
          if (
            !config.workspaceIds?.length ||
            config.workspaceIds.some((id) => !ctx.workspaceRegistry.get(id))
          )
            throw invalid('workspace');
          try {
            await preflight(config, await storedSecrets(ctx, config));
          } catch {
            throw invalid('incomplete');
          }
        }
        await ctx.configEditor.edit(entry, (c) => ({
          ...c,
          enabled: data.action === 'enable',
        }));
        return;
      }
      if (data.action !== 'save' || config.enabled)
        throw invalid('disableFirst');
      const v = data.values;
      if (!v || fields.some((k) => !Object.hasOwn(v, k)))
        throw invalid('invalid');
      const patch = {
        tunnelId: scalar(v.tunnelId),
        issuer: httpsURL(scalar(v.issuer)),
        resource: httpsURL(scalar(v.resource)),
        jwksText: publicKeys(scalar(v.jwksText, 65536)),
        subjects: list(v.subjects),
        workspaceIds: list(v.workspaceIds),
        callbackHosts: list(v.callbackHosts).map((s) => s.toLowerCase()),
      };
      if (patch.workspaceIds.some((id) => !ctx.workspaceRegistry.get(id)))
        throw invalid('workspace');
      if (
        patch.callbackHosts.some(
          (h) =>
            !h.includes('.') ||
            h
              .split('.')
              .some((l) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l)),
        )
      )
        throw invalid('hosts');
      const secrets = { ...(await storedSecrets(ctx, config)) };
      let rotate = false;
      for (const k of ['key', 'proxy'])
        if (Object.hasOwn(data, k)) {
          if (data[k] !== null && typeof data[k] !== 'string')
            throw invalid('invalid');
          const s = scalar(data[k] ?? '', 8192);
          if (k === 'proxy' && s) {
            try {
              proxyURL(s);
            } catch {
              throw invalid('proxy');
            }
          }
          secrets[k] = s;
          rotate = true;
        }
      if (rotate) {
        patch.credentialId = randomUUID();
        await ctx.credentials.modifyRecord(
          prefix + patch.credentialId,
          async () => ({ kind: 'grant', payload: secrets }),
        );
        if (Object.hasOwn(data, 'proxy')) patch.proxy = '';
      }
      // Publish the reference only after the new immutable record is durable.
      // A save failure cannot replace the credential used by the current config.
      if (patch.jwksText || data.clearKeyFile === true) patch.jwksFile = '';
      const credentials = ctx.credentials,
        oldId = config.credentialId;
      try {
        await ctx.configEditor.edit(entry, (c) => ({
          ...c,
          ...patch,
          enabled: false,
        }));
      } catch (err) {
        // ConfigEditor rejects before publication or after restoring the old patch.
        if (rotate) await credentials.deleteRecord(prefix + patch.credentialId);
        throw err;
      }
      version = randomUUID();
      if (rotate && oldId) await credentials.deleteRecord(prefix + oldId);
    } finally {
      busy = false;
    }
  }
  return { view, write };
}
export function settingsRoute(ctx, controller) {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/work-connector/settings',
        async handler(req, res) {
          const reply = (status, body) => {
            res.writeHead(status, {
              'content-type': 'application/json',
              'cache-control': 'no-store',
              'x-content-type-options': 'nosniff',
            });
            res.end(JSON.stringify(body));
          };
          try {
            const admission = ctx.connection.admit(req);
            if ('rejection' in admission)
              return reply(admission.rejection, { error: 'access' });
            if (admission.peer.principal.kind !== 'owner')
              return reply(403, { error: 'access' });
            if (req.method === 'GET')
              return reply(200, await controller.view());
            if (req.method !== 'POST') return reply(405, { error: 'method' });
            if (
              req.headers['x-work-settings'] !== '1' ||
              req.headers['sec-fetch-site'] === 'cross-site' ||
              req.headers['content-type']?.split(';')[0] !== 'application/json'
            )
              return reply(403, { error: 'access' });
            let size = 0;
            const chunks = [];
            for await (const chunk of req) {
              size += chunk.length;
              if (size > 131072) return reply(413, { error: 'invalid' });
              chunks.push(chunk);
            }
            let data;
            try {
              data = JSON.parse(Buffer.concat(chunks));
            } catch {
              throw invalid('invalid');
            }
            await controller.write(data);
            reply(200, { ok: true });
          } catch (e) {
            reply(e.publicCode ? e.status : 500, {
              error: e.publicCode ?? 'saveFailed',
            });
          }
        },
      }),
    'work connector settings',
  );
}
