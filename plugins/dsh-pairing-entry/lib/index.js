/**
 * dsh-pairing-entry — a bookmarked Web entry that trades its own key for the
 * current launch token.
 *
 * `dsh web` prints an address carrying a per-process launch token and mints a
 * signed cookie when a browser presents that token at `/`. The printed address
 * therefore changes on every restart. This plugin serves one extra exact route,
 * `/entry/<key>`, which redirects to `/` carrying the current launch token; the
 * browser then mints the cookie exactly as it would from the printed address.
 *
 * The key is ordinary plugin config. It is marked volatile so the Plugins page
 * (the pairing-entry row) can read and write it while the entry runs. A volatile-only change does not reload
 * the entry (the Loader commits the new reference into the running fiber), so the
 * route follows `loader/volatile-update` and re-registers under the new key.
 *
 * The launch token comes from a public address. Current DSH contributes that
 * address on `webserver/entry-url`; older releases still expose it as
 * `connection.authenticatedUrl()`. A request the trust fence rejects is
 * answered 403, via `requestRejection()` on older releases and
 * `connection.admit()` on current ones. The route is anonymous so a bookmark
 * can arrive before a cookie exists. A token this process cannot read is
 * logged and answered 503 per request: failing the entry would drop it from
 * the settings document, and the key form would disappear with it.
 *
 * @module dsh-pairing-entry
 */
import z from '@deepseek-ai/schemastery';

/** Stable Cordis plugin name. */
export const name = 'pairing-entry';

/**
 * The entry needs the Connection handle (token and trust fence) and the Web
 * server (the route itself). Cordis keeps this entry pending until both exist
 * and re-runs `apply` when either is replaced, so a Connection reload cannot
 * leave the route bound to a stale handle.
 */
export const inject = ['connection', 'webServer'];

/** Path prefix the entry page is served under. */
export const ENTRY_PATH_PREFIX = '/entry/';

/** Minimum accepted key length; the browser-side generator emits exactly this many characters. */
export const MIN_KEY_LENGTH = 32;

/**
 * Characters a key may use. The key is a path segment, so anything outside this
 * set would need escaping and could not be reproduced byte for byte in the
 * bookmarked address.
 */
const KEY_PATTERN = /^[A-Za-z0-9_-]+$/u;

/** Query parameter the launch token travels in. */
const TOKEN_QUERY = 'token';

/**
 * Config for the profile patch layer. The field is volatile, which is what makes
 * it visible to — and writable from — the Plugins page row config while this
 * entry is running. Schemastery accepts a missing field, so an unconfigured install loads
 * without serving a route instead of failing the entry.
 */
export const Config = z.object({
  key: z
    .string()
    .description('Long-lived key of the /entry page. At least 32 characters from A-Z, a-z, 0-9, "-" and "_". Set it on the Plugins page, on the pairing-entry row.')
    .volatile(),
});

/**
 * Read the configured key out of a resolved config.
 *
 * Volatile fields are resolved into a reference object with `get()`, so the raw
 * field is unwrapped before it is validated.
 * @param config - resolved plugin config, possibly without `key`.
 * @returns the trimmed key, or an empty string when none is configured.
 */
export function keyOf(config) {
  const raw = config?.key;
  const value = typeof raw?.get === 'function' ? raw.get() : raw;
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Report what is wrong with a key.
 * @param key - trimmed key from {@link keyOf}.
 * @returns a human-readable problem, or `undefined` when the key is usable.
 */
export function keyProblem(key) {
  if (key === '') return 'no key is configured';
  if (key.length < MIN_KEY_LENGTH) return `the key is ${String(key.length)} characters long; use at least ${String(MIN_KEY_LENGTH)}`;
  if (!KEY_PATTERN.test(key)) return 'the key must use only A-Z, a-z, 0-9, "-" and "_"';
  return undefined;
}

/**
 * Path the entry is served under for one key.
 * @param key - usable key.
 * @returns the exact route path.
 */
export function entryPath(key) {
  return `${ENTRY_PATH_PREFIX}${key}`;
}

/** Address used only to ask a contributor for the launch token. Its origin is never sent to a browser. */
const TOKEN_PROBE = 'http://dsh.invalid/';

/**
 * Read the single launch token carried by one contributed address.
 * @param printed - absolute URL a contributor built.
 * @returns the token.
 * @throws {TypeError} when the address cannot be parsed or does not carry exactly one non-empty token.
 */
export function tokenFromPrinted(printed) {
  let url;
  try {
    url = new URL(printed);
  } catch (cause) {
    throw new TypeError(`${name}: a launch address this plugin cannot parse`, { cause });
  }
  const tokens = url.searchParams.getAll(TOKEN_QUERY);
  if (tokens.length !== 1 || tokens[0] === '') {
    throw new TypeError(`${name}: a launch address did not report exactly one launch token; this DSH version changed how the token reaches the address`);
  }
  return tokens[0];
}

/**
 * Read the launch token from the older Connection face.
 * @param connection - value of `ctx.connection`.
 * @returns the token carried by the address `authenticatedUrl()` builds.
 * @throws {TypeError} when the handle is gone, the call fails, or the address
 * does not carry exactly one non-empty token.
 */
export function launchTokenOf(connection) {
  if (typeof connection?.authenticatedUrl !== 'function') {
    throw new TypeError(`${name}: connection.authenticatedUrl is not a function; this DSH version changed the Connection handle, so the entry cannot learn the launch token`);
  }
  let printed;
  try {
    printed = connection.authenticatedUrl(TOKEN_PROBE);
  } catch (cause) {
    throw new TypeError(`${name}: connection.authenticatedUrl() failed, so the entry cannot learn the launch token`, { cause });
  }
  return tokenFromPrinted(printed);
}

/**
 * Read the launch token from whichever public face this process still has.
 *
 * Current DSH collects startup URLs with `webserver/entry-url` and no longer
 * puts `authenticatedUrl` on Connection. The same probe address is used, so a
 * contributor that only appends the token still yields one.
 * @param ctx - plugin context.
 * @returns the token.
 * @throws {TypeError} when neither face contributes exactly one token.
 */
export function launchTokenFrom(ctx) {
  if (typeof ctx?.connection?.authenticatedUrl === 'function') return launchTokenOf(ctx.connection);
  const entries = [];
  if (typeof ctx?.emit === 'function') ctx.emit(ctx.webServer, 'webserver/entry-url', TOKEN_PROBE, entries);
  let cause;
  for (const entry of entries) {
    if (typeof entry?.url !== 'string') continue;
    try {
      return tokenFromPrinted(entry.url);
    } catch (error) {
      cause = error;
    }
  }
  throw new TypeError(`${name}: webserver/entry-url did not contribute a launch token, so the entry cannot learn it`, { cause });
}

/**
 * Status the trust fence assigns, or `undefined` when the request may continue.
 * Older releases answer through `requestRejection`; current ones answer through `admit`.
 * @param connection - Connection handle.
 * @param req - the incoming request.
 * @returns a rejection status, when one was decided.
 */
function rejectionStatus(connection, req) {
  if (typeof connection?.requestRejection === 'function') return connection.requestRejection(req);
  if (typeof connection?.admit !== 'function') return undefined;
  try {
    return connection.admit(req)?.rejection;
  } catch {
    return undefined;
  }
}

/**
 * Build the route handler.
 *
 * The first answer is always the trust fence: a request whose Host, Origin, or
 * fetch metadata the Connection rejects gets that refusal, so this route cannot
 * be used to reflect a token back to a DNS-rebinding page. Any request the fence
 * lets through — authenticated or not — receives the same relative redirect,
 * because the cookie minted by `/connect` (version 2) supersedes the index
 * cookie (version 1) and would otherwise make "already signed in" skip the token
 * exchange this page exists to perform.
 *
 * @param connection - Connection handle supplying the trust fence.
 * @param logger - logger for the one failure that can only happen at request time.
 * @param tokenOf - reads the current launch token; defaults to the older Connection face.
 * @returns an HTTP handler that owns its response.
 */
export function createHandler({ connection, logger, tokenOf }) {
  const readToken = tokenOf ?? (() => launchTokenOf(connection));
  return (req, res) => {
    if (rejectionStatus(connection, req) === 403) {
      res.writeHead(403, { 'cache-control': 'no-store' });
      res.end();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD', 'cache-control': 'no-store' });
      res.end();
      return;
    }
    let token;
    try {
      token = readToken();
    } catch (error) {
      logger.error(error);
      res.writeHead(503, { 'cache-control': 'no-store' });
      res.end();
      return;
    }
    res.writeHead(303, {
      'cache-control': 'no-store',
      location: `../?${TOKEN_QUERY}=${encodeURIComponent(token)}`,
      'referrer-policy': 'no-referrer',
    });
    res.end();
  };
}

/**
 * Serve the entry route while the configured key is usable.
 *
 * A missing or malformed key is a configuration state, not a load failure: the
 * entry stays alive and configurable (the Settings form is only offered for
 * running entries), it just serves no route. A launch token this process
 * cannot read is also not a load failure. The handler answers 503 until one
 * appears, and the key form stays available.
 *
 * `key` is volatile, and a volatile-only config change does not reload this
 * entry: the Loader commits the new reference into the running fiber instead of
 * re-running `apply`. The route therefore follows `loader/volatile-update` and
 * re-registers under the new path, which is what makes a save from the Settings
 * form take effect immediately.
 * @param ctx - plugin context carrying `connection` and `webServer`.
 * @param config - validated {@link Config}.
 */
export function apply(ctx, config) {
  try {
    launchTokenFrom(ctx);
  } catch (error) {
    ctx.logger.error(error);
  }

  let served;
  const stop = () => {
    served?.dispose();
    served = undefined;
  };
  const sync = () => {
    const key = keyOf(config);
    const problem = keyProblem(key);
    if (problem !== undefined) {
      stop();
      ctx.logger.warn(`${name}: ${problem}. No ${ENTRY_PATH_PREFIX}<key> page is served; set the key on the Plugins page, on the pairing-entry row.`);
      return;
    }
    const path = entryPath(key);
    if (served?.path === path) return;
    stop();
    served = {
      path,
      dispose: ctx.webServer.register({
        kind: 'exact',
        path,
        auth: 'anonymous',
        handler: createHandler({
          connection: ctx.connection,
          logger: ctx.logger,
          tokenOf: () => launchTokenFrom(ctx),
        }),
      }),
    };
  };

  ctx.effect(() => {
    sync();
    return stop;
  }, `${name}: entry route`);
  ctx.on('loader/volatile-update', () => {
    try {
      sync();
    } catch (error) {
      ctx.logger.error(error);
    }
  });
}
