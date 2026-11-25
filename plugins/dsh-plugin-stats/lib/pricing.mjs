import { appendFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
	const numericValues = Object.values(entries).filter((v) => typeof v === "number");
	return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
}
function joinValues(array, separator = "|") {
	return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
	if (typeof value === "bigint") return value.toString();
	return value;
}
var Cached = class {
	constructor(getter) {
		this._getter = getter;
		this._value = void 0;
	}
	get value() {
		const getter = this._getter;
		if (getter !== void 0) {
			this._value = getter();
			this._getter = void 0;
		}
		return this._value;
	}
};
function cached(getter) {
	return new Cached(getter);
}
function nullish(input) {
	return input === null || input === void 0;
}
function cleanRegex(source) {
	const start = source.startsWith("^") ? 1 : 0;
	const end = source.endsWith("$") ? source.length - 1 : source.length;
	return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
	const ratio = val / step;
	const roundedRatio = Math.round(ratio);
	const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
	if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
	return ratio - roundedRatio;
}
function assignProp(target, prop, value) {
	Object.defineProperty(target, prop, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
/**
* Whichever object a def's `shape` currently answers from: the one the caller passed until the first read, the frozen copy after it.
*
* Its keys and descriptors read without invoking anything, which is what lets a discriminated union check its discriminator, and the cycle walk read a shape, without resolving a getter that references the schema being constructed. A def that answers `shape` from an accessor of its own has none.
*/
function rawShape(def) {
	const desc = Object.getOwnPropertyDescriptor(def, "shape");
	return desc?.get ? desc.get.raw : desc?.value;
}
function sourceShape(schema) {
	return rawShape(schema._zod.def) ?? schema._zod.def.shape;
}
function deferProp(target, key, getter) {
	Object.defineProperty(target, key, {
		get() {
			const value = getter();
			assignProp(this, key, value);
			return value;
		},
		enumerable: true,
		configurable: true
	});
}
function putProp(target, key, value) {
	if (key in target) assignProp(target, key, value);
	else target[key] = value;
}
/**
* Copies `keys` of `source`'s shape onto `target`, each value passed through `wrap`.
*
* A key the source has resolved is copied through now, so the derived shape states it outright and nothing has to resolve it to learn what it holds. A key the source still defers stays deferred, and reads back through the source's own `shape`, so it resolves once and both shapes get that one schema.
*/
function mirrorShape(target, source, keys, wrap) {
	const raw = sourceShape(source);
	for (const key of keys) {
		const desc = Object.getOwnPropertyDescriptor(raw, key);
		if (!desc.enumerable) continue;
		if (desc.get) deferProp(target, key, () => {
			const value = source._zod.def.shape[key];
			return wrap ? wrap(value, key) : value;
		});
		else putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
	}
}
function mirrorProps(target, source) {
	for (const key of Reflect.ownKeys(source)) {
		const desc = Object.getOwnPropertyDescriptor(source, key);
		if (!desc.enumerable) continue;
		if (desc.get) deferProp(target, key, () => source[key]);
		else putProp(target, key, desc.value);
	}
}
function mergeDefs(...defs) {
	const mergedDescriptors = {};
	for (const def of defs) {
		const descriptors = Object.getOwnPropertyDescriptors(def);
		Object.assign(mergedDescriptors, descriptors);
	}
	return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
	return JSON.stringify(str);
}
function slugify(input) {
	return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
	return typeof data === "object" && data !== null && !Array.isArray(data);
}
const allowsEval = /* @__PURE__*/ cached(() => {
	if (globalConfig.jitless) return false;
	if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
	try {
		new Function("");
		return true;
	} catch (_) {
		return false;
	}
});
function isPlainObject(o) {
	if (isObject(o) === false) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	if (typeof ctor !== "function") return true;
	const prot = ctor.prototype;
	if (isObject(prot) === false) return false;
	if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
	return true;
}
function shallowClone(o) {
	if (isPlainObject(o)) return { ...o };
	if (Array.isArray(o)) return [...o];
	if (o instanceof Map) return new Map(o);
	if (o instanceof Set) return new Set(o);
	return o;
}
const propertyKeyTypes = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
	const cl = new inst._zod.constr(def ?? inst._zod.def);
	if (!def || params?.parent) cl._zod.parent = inst;
	return cl;
}
function normalizeParams(_params) {
	const params = _params;
	if (!params) return {};
	if (typeof params === "string") return { error: () => params };
	if (params?.message !== void 0) {
		if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
		params.error = params.message;
	}
	delete params.message;
	if (typeof params.error === "string") return {
		...params,
		error: () => params.error
	};
	return params;
}
function stringifyPrimitive(value) {
	if (typeof value === "bigint") return value.toString() + "n";
	if (typeof value === "string") return `"${value}"`;
	return `${value}`;
}
function optionalKeys(shape) {
	return Object.keys(shape).filter((k) => {
		return shape[k]._zod.optin !== void 0 && shape[k]._zod.optout === "optional";
	});
}
const NUMBER_FORMAT_RANGES = /*@__PURE__*/ (() => ({
	safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}))();
const BIGINT_FORMAT_RANGES = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
	const newShape = {};
	mirrorShape(newShape, schema, maskedKeys(schema, mask));
	return clone(schema, mergeDefs(currDef, {
		shape: newShape,
		checks: []
	}));
}
function maskedKeys(schema, mask) {
	const raw = sourceShape(schema);
	const keys = [];
	for (const key of Reflect.ownKeys(mask)) {
		if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) throw new Error(`Unrecognized key: "${String(key)}"`);
		if (mask[key]) keys.push(key);
	}
	return keys;
}
function omit(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
	const omitted = new Set(maskedKeys(schema, mask));
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
	return clone(schema, mergeDefs(currDef, {
		shape: newShape,
		checks: []
	}));
}
function extend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) {
		const existingShape = sourceShape(schema);
		for (const key of Reflect.ownKeys(shape)) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function extended(schema, shape) {
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
	mirrorProps(newShape, shape);
	return newShape;
}
function safeExtend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
	return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function merge(a, b) {
	if (!b?._zod?.def) throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	const newShape = {};
	mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
	mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
	return clone(a, mergeDefs(a._zod.def, {
		shape: newShape,
		get catchall() {
			return b._zod.def.catchall;
		},
		checks: b._zod.def.checks ?? []
	}));
}
function partial(Class, schema, mask, name = "partial") {
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
	const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class && ((value, key) => selected && !selected.has(key) ? value : new Class({
		type: "optional",
		innerType: value
	})));
	return clone(schema, mergeDefs(schema._zod.def, {
		shape: newShape,
		checks: []
	}));
}
function required(Class, schema, mask) {
	const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) => selected && !selected.has(key) ? value : new Class({
		type: "nonoptional",
		innerType: value
	}));
	return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
}
function aborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
	return false;
}
function explicitlyAborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
	return false;
}
function prefixIssues(path, issues) {
	return issues.map((iss) => {
		var _a;
		(_a = iss).path ?? (_a.path = []);
		iss.path.unshift(path);
		return iss;
	});
}
function unwrapMessage(message) {
	return typeof message === "string" ? message : message?.message;
}
function attachSchema(issues, start, inst) {
	var _a;
	for (let i = start; i < issues.length; i++) (_a = issues[i]).schema ?? (_a.schema = inst);
}
function finalizeIssue(iss, ctx, config) {
	var _a;
	const traits = iss.inst?._zod?.traits;
	if (traits?.has("$ZodType")) {
		if (traits.has("$ZodCheck")) (_a = iss).schema ?? (_a.schema = iss.inst);
		else iss.schema = iss.inst;
	}
	const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : void 0;
	const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
	const full = {};
	for (const k of Object.keys(iss)) {
		if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__") continue;
		full[k] = iss[k];
	}
	full.path ?? (full.path = []);
	full.message = message;
	if (ctx?.reportInput) full.input = iss.input;
	return full;
}
const highSurrogate = /[\uD800-\uDBFF]/;
function codePointLength(str) {
	const units = str.length;
	if (!highSurrogate.test(str)) return units;
	let count = units;
	for (let i = 0; i < units - 1; i++) if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
		count--;
		i++;
	}
	return count;
}
function getLengthableOrigin(input) {
	if (Array.isArray(input)) return "array";
	if (typeof input === "string") return "string";
	return "unknown";
}
function parsedType(data) {
	const t = typeof data;
	switch (t) {
		case "number": return Number.isNaN(data) ? "nan" : "number";
		case "object": {
			if (data === null) return "null";
			if (Array.isArray(data)) return "array";
			const obj = data;
			if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) return obj.constructor.name;
		}
	}
	return t;
}
function issue(...args) {
	const [iss, input, inst] = args;
	if (typeof iss === "string") return {
		message: iss,
		code: "custom",
		input,
		inst
	};
	return { ...iss };
}
/**
* Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
*
* Call this from a `proto` initializer, which runs once per prototype — never per instance.
*/
function members(proto, table) {
	for (const key in table) {
		const desc = Object.getOwnPropertyDescriptor(table, key);
		if (desc.get) Object.defineProperty(proto, key, {
			...desc,
			enumerable: false
		});
		else defineBound(proto, key, desc.value);
	}
}
/** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
function own(inst, key, value, enumerable = true) {
	Object.defineProperty(inst, key, {
		configurable: true,
		writable: true,
		enumerable,
		value
	});
	return value;
}
/** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
function hide(inst, key, value) {
	return own(inst, key, value, false);
}
/** Adds members a table derives from the instance: each builds on first read and shadows as own data, and assignment shadows the same way, as when these were own properties. */
function derived(computes, table) {
	for (const key in computes) {
		const compute = computes[key];
		Object.defineProperty(table, key, {
			configurable: true,
			enumerable: true,
			get() {
				return own(this, key, compute(this));
			},
			set(value) {
				own(this, key, value);
			}
		});
	}
	return table;
}
function defineBound(proto, key, fn) {
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			return this == null ? fn : own(this, key, fn.bind(this));
		},
		set(value) {
			own(this, key, value);
		}
	});
}
/** Returns the prototype to install on, or `undefined` if this group is already installed on it. */
function claim(inst, sentinel) {
	const proto = Object.getPrototypeOf(inst);
	return sentinel in proto ? void 0 : proto;
}
let installing;
let broke = false;
const breaker = {
	configurable: true,
	get() {
		broke = true;
	}
};
/**
* Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
* constructor, computed from the internals object itself and cached there on
* first read. One accessor per constructor rather than one per instance.
*/
function defineLazyInternal(inst, key, compute) {
	const proto = Object.getPrototypeOf(inst._zod);
	if (key in proto && installing !== inst._zod) {
		installing = void 0;
		return;
	}
	installing = inst._zod;
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			Object.defineProperty(this, key, breaker);
			const outer = broke;
			broke = false;
			try {
				const value = compute(this);
				if (broke) delete this[key];
				else Object.defineProperty(this, key, {
					configurable: true,
					writable: true,
					value
				});
				broke = broke || outer;
				return value;
			} catch (err) {
				delete this[key];
				broke = broke || outer;
				throw err;
			}
		},
		set(value) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				value
			});
		}
	});
}
/**
* Installs `key` on `inst`'s prototype, computed by `make` on first read and cached there as an own
* data property. One accessor per constructor rather than one per instance, because an own accessor
* puts every instance after the first into v8 dictionary mode. The key doubles as the sentinel.
*/
function installLazyProp(inst, key, make, enumerable) {
	const proto = claim(inst, key);
	if (!proto) return;
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			const desc = {
				configurable: true,
				writable: true,
				enumerable,
				value: void 0
			};
			Object.defineProperty(this, key, desc);
			desc.value = make(this);
			Object.defineProperty(this, key, desc);
			return desc.value;
		},
		set(value) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				enumerable,
				value
			});
		}
	});
}
/** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
const CONSTANT_CATCH = "~constantCatch";
/** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
function constantCatch(value) {
	const fn = () => value;
	fn[CONSTANT_CATCH] = true;
	return fn;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/core.js
var _a$1;
const _zodDesc = {
	value: void 0,
	enumerable: false
};
let _E = "captureStackTrace" in Error ? Error : null;
function newError(Definition) {
	const E = _E;
	if (E) {
		const saved = E.stackTraceLimit;
		if (typeof saved === "number") {
			try {
				E.stackTraceLimit = 0;
			} catch {
				_E = null;
				return new Definition();
			}
			try {
				return new Definition();
			} finally {
				E.stackTraceLimit = saved;
			}
		}
	}
	return new Definition();
}
function $constructor(name, initializer, proto, params) {
	const zodProto = {};
	function Internals(def) {
		this.def = def;
		this.constr = _;
		this.traits = /* @__PURE__ */ new Set();
	}
	Internals.prototype = zodProto;
	const protoMembers = proto;
	const initialized = protoMembers && /* @__PURE__ */ new WeakSet();
	function init(inst, def) {
		if (!inst._zod) {
			_zodDesc.value = new Internals(def);
			try {
				Object.defineProperty(inst, "_zod", _zodDesc);
			} finally {
				_zodDesc.value = void 0;
			}
		} else if (inst._zod.traits.has(name)) return;
		inst._zod.traits.add(name);
		initializer(inst, def);
		if (initialized) {
			const own = Object.getPrototypeOf(inst);
			const ctorProto = inst._zod.constr.prototype;
			let up = own;
			while (up && up !== ctorProto) up = Object.getPrototypeOf(up);
			const target = up ?? own;
			if (!initialized.has(target)) {
				initialized.add(target);
				members(target, protoMembers);
			}
		}
		const proto = _.prototype;
		for (const k in proto) {
			if (!Object.prototype.hasOwnProperty.call(proto, k)) continue;
			if (!(k in inst)) inst[k] = proto[k].bind(inst);
		}
	}
	const Parent = params?.Parent ?? Object;
	class Definition extends Parent {}
	Object.defineProperty(Definition, "name", { value: name });
	function _(def) {
		const inst = params?.Parent ? newError(Definition) : this;
		init(inst, def);
		const deferred = inst._zod.deferred;
		if (deferred) {
			for (const fn of deferred) fn();
			inst._zod.deferred = void 0;
		}
		const pp = globalThis.__zod_globalConfig?.postProcessor;
		if (pp) pp(inst);
		return inst;
	}
	Object.defineProperty(_, "init", { value: init });
	Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
		if (params?.Parent && inst instanceof params.Parent) return true;
		return inst?._zod?.traits?.has(name);
	} });
	Object.defineProperty(_, "name", { value: name });
	return _;
}
var $ZodAsyncError = class extends Error {
	constructor() {
		super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
	}
};
var $ZodEncodeError = class extends Error {
	constructor(name) {
		super(`Encountered unidirectional transform during encode: ${name}`);
		this.name = "ZodEncodeError";
	}
};
(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
const globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
	if (newConfig) Object.assign(globalConfig, newConfig);
	return globalConfig;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/errors.js
function _getMessage() {
	const internals = this._zod;
	internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
	return internals.message;
}
function _setMessage(value) {
	this._zod.message = value;
}
const _messageDesc = {
	get: _getMessage,
	set: _setMessage,
	enumerable: true,
	configurable: true
};
const _issuesDesc = {
	value: void 0,
	enumerable: false
};
const _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
const initializer$1 = (inst, def) => {
	inst.name = "$ZodError";
	_issuesDesc.value = def;
	Object.defineProperty(inst, "issues", _issuesDesc);
	_issuesDesc.value = void 0;
	Object.defineProperty(inst, "message", _messageDesc);
	const proto = Object.getPrototypeOf(inst);
	if (!_installedToString.has(proto)) {
		_installedToString.add(proto);
		Object.defineProperty(proto, "toString", {
			configurable: true,
			enumerable: false,
			get() {
				const value = () => this.message;
				Object.defineProperty(this, "toString", {
					value,
					configurable: true,
					writable: true
				});
				return value;
			},
			set(value) {
				Object.defineProperty(this, "toString", {
					value,
					configurable: true,
					writable: true
				});
			}
		});
	}
};
const $ZodError = $constructor("$ZodError", initializer$1);
$constructor("$ZodError", initializer$1, void 0, { Parent: Error });
/** Get-or-create `obj[key]` as an own data property. A path segment naming an inherited member
* ("toString", "constructor") would otherwise read through to the prototype, and assigning
* "__proto__" would hit the setter instead of creating a key. */
function node(obj, key, make) {
	if (!Object.prototype.hasOwnProperty.call(obj, key)) {
		if (key === "__proto__") Object.defineProperty(obj, key, {
			value: make(),
			writable: true,
			enumerable: true,
			configurable: true
		});
		else obj[key] = make();
	}
	return obj[key];
}
function flattenError(error, mapper = (issue) => issue.message) {
	const fieldErrors = {};
	const formErrors = [];
	for (const sub of error.issues) if (sub.path.length > 0) node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
	else formErrors.push(mapper(sub));
	return {
		formErrors,
		fieldErrors
	};
}
function formatError(error, mapper = (issue) => issue.message) {
	const fieldErrors = { _errors: [] };
	const processError = (error, path = []) => {
		for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
		else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else {
			const fullpath = [...path, ...issue.path];
			if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
			else {
				let curr = fieldErrors;
				let i = 0;
				while (i < fullpath.length) {
					const el = fullpath[i];
					const terminal = i === fullpath.length - 1;
					if (el === "_errors") {
						if (terminal) curr._errors.push(mapper(issue));
						i++;
						continue;
					}
					if (!Object.prototype.hasOwnProperty.call(curr, el)) Object.defineProperty(curr, el, {
						value: { _errors: [] },
						enumerable: true,
						writable: true,
						configurable: true
					});
					const node = curr[el];
					if (terminal) node._errors.push(mapper(issue));
					curr = node;
					i++;
				}
			}
		}
	};
	processError(error);
	return fieldErrors;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/parse.js
function finalizeParams(callee, params) {
	return {
		callee: params?.callee ?? callee,
		Err: params?.Err
	};
}
const _parse = (_Err) => {
	const fn = (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: false
		} : { async: false };
		const result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) throw new $ZodAsyncError();
		if (result.issues.length) {
			const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, _params?.callee ?? fn);
			throw e;
		}
		return result.value;
	};
	return fn;
};
const _parseAsync = (_Err) => {
	const fn = async (schema, value, _ctx, params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: true
		} : { async: true };
		let result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) result = await result;
		if (result.issues.length) {
			const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, params?.callee ?? fn);
			throw e;
		}
		return result.value;
	};
	return fn;
};
const _safeParse = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length ? failure(_Err, result.issues, ctx) : {
		success: true,
		data: result.value
	};
};
function failure(Err, issues, ctx) {
	let error;
	return {
		success: false,
		get error() {
			if (!error) {
				error = new Err(issues.map((iss) => finalizeIssue(iss, ctx, config())));
				issues = void 0;
				ctx = void 0;
			}
			return error;
		},
		set error(e) {
			error = e;
			issues = void 0;
			ctx = void 0;
		}
	};
}
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true
	} : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length ? failure(_Err, result.issues, ctx) : {
		success: true,
		data: result.value
	};
};
const COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
const COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
const validate = ((schema, value, _ctx) => {
	const validator = schema._zod.bag.validator;
	if (validator !== void 0) {
		if (validator(value) !== COMPILE_INVALID) return true;
		if (validator.definite === true && _ctx === void 0) return false;
	}
	return validateFallback(schema, value, _ctx);
});
function validateFallback(schema, value, _ctx) {
	const ctx = _ctx ? {
		..._ctx,
		async: false,
		abortEarly: true
	} : {
		async: false,
		abortEarly: true
	};
	const fallbackRun = schema._zod.bag.fallbackRun;
	let result;
	if (fallbackRun) {
		ctx[COMPILE_FALLBACK] = true;
		result = fallbackRun({
			value,
			issues: []
		}, ctx);
	} else result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length === 0;
}
const validateAsync$1 = async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true,
		abortEarly: true
	} : {
		async: true,
		abortEarly: true
	};
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length === 0;
};
const _encode = (_Err) => {
	const parse = _parse(_Err);
	const fn = (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return parse(schema, value, ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _decode = (_Err) => {
	const parse = _parse(_Err);
	const fn = (schema, value, _ctx, _params) => {
		return parse(schema, value, _ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _encodeAsync = (_Err) => {
	const parseAsync = _parseAsync(_Err);
	const fn = async (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _decodeAsync = (_Err) => {
	const parseAsync = _parseAsync(_Err);
	const fn = async (schema, value, _ctx, _params) => {
		return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _safeEncode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParse(_Err)(schema, value, ctx);
};
const _safeDecode = (_Err) => (schema, value, _ctx) => {
	return _safeParse(_Err)(schema, value, _ctx);
};
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParseAsync(_Err)(schema, value, ctx);
};
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _safeParseAsync(_Err)(schema, value, _ctx);
};
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/regexes.js
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const cuid = /^[cC][0-9a-z]{6,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
function nanoidOfLength(length) {
	return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
}
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
*
* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
	if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
const email = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const _emoji$1 = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
function emoji() {
	return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
const httpProtocol = /^https?$/;
const e164 = /^\+[1-9]\d{6,14}$/;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
/** Anchors a pattern source. The interpolation lives here rather than at the call site because
* esbuild will not drop a `@__PURE__` call whose own argument interpolates a variable, but it
* will drop `anchor(dateSource)`. Keeping it inline pinned `date` into every bundle. */
function anchor(source) {
	return new RegExp(`^${source}$`);
}
const date = /*@__PURE__*/ anchor(dateSource);
function timeSource(args) {
	const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
	return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time(args) {
	return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
	const opts = ["Z"];
	if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
	const qualified = `${timeSource({
		precision: args.precision,
		seconds: true
	})}(?:${opts.join("|")})`;
	const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
	return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
const anyString = /^[\s\S]{0,}$/;
const integer = /^-?\d+$/;
const number$1 = /^-?\d+(?:\.\d+)?$/;
const boolean$1 = /^(?:true|false)$/i;
const lowercase = /^[^A-Z]*$/;
const uppercase = /^[^a-z]*$/;
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/checks.js
const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
	var _a;
	inst._zod ?? (inst._zod = {});
	inst._zod.def = def;
	(_a = inst._zod).onattach ?? (_a.onattach = []);
});
/** Default `when` for length-based checks: run only on non-nullish values with a `length`. */
const _whenHasLength = (payload) => {
	const val = payload.value;
	return !nullish(val) && val.length !== void 0;
};
const numericOriginMap = {
	number: "number",
	bigint: "bigint",
	object: "date"
};
const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
		payload.issues.push({
			origin: numericOriginMap[typeof payload.value] ?? origin,
			code: "too_big",
			maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
		payload.issues.push({
			origin: numericOriginMap[typeof payload.value] ?? origin,
			code: "too_small",
			minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
		if (typeof payload.value === "bigint" ? def.value !== BigInt(0) && payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
		payload.issues.push({
			origin: typeof payload.value,
			code: "not_multiple_of",
			divisor: def.value,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
	$ZodCheck.init(inst, def);
	def.format = def.format || "float64";
	const isInt = def.format?.includes("int");
	const origin = isInt ? "int" : "number";
	const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (isInt) {
			if (!Number.isInteger(input)) {
				payload.issues.push({
					expected: origin,
					format: def.format,
					code: "invalid_type",
					continue: false,
					input,
					inst
				});
				return;
			}
			if (!Number.isSafeInteger(input)) {
				if (input > 0) payload.issues.push({
					input,
					code: "too_big",
					maximum: Number.MAX_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				else payload.issues.push({
					input,
					code: "too_small",
					minimum: Number.MIN_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				return;
			}
		}
		if (input < minimum) payload.issues.push({
			origin: "number",
			input,
			code: "too_small",
			minimum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
		if (input > maximum) payload.issues.push({
			origin: "number",
			input,
			code: "too_big",
			maximum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		if ((typeof input === "string" && units > def.maximum ? codePointLength(input) : units) <= def.maximum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.maximum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		if ((typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units) >= def.minimum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.minimum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
		if (length === def.length) return;
		const origin = getLengthableOrigin(input);
		const tooBig = length > def.length;
		payload.issues.push({
			origin,
			...tooBig ? {
				code: "too_big",
				maximum: def.length
			} : {
				code: "too_small",
				minimum: def.length
			},
			inclusive: true,
			exact: true,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
	var _a, _b;
	$ZodCheck.init(inst, def);
	if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: def.format,
			input: payload.value,
			...def.pattern ? { pattern: def.pattern.toString() } : {},
			inst,
			continue: !def.abort
		});
	});
	else (_b = inst._zod).check ?? (_b.check = () => {});
});
const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: payload.value,
			pattern: def.pattern.toString(),
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
	def.pattern ?? (def.pattern = lowercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
	def.pattern ?? (def.pattern = uppercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
	$ZodCheck.init(inst, def);
	const escapedRegex = escapeRegex(def.includes);
	def.pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
	inst._zod.check = (payload) => {
		if (payload.value.includes(def.includes, def.position)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: def.includes,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.check = (payload) => {
		if (payload.value.startsWith(def.prefix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: def.prefix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.check = (payload) => {
		if (payload.value.endsWith(def.suffix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: def.suffix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		payload.value = def.tx(payload.value);
	};
});
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/doc.js
var Doc = class {
	constructor(args = [], closed = {}) {
		this.content = [];
		this.indent = 0;
		this.args = args;
		this.closed = closed;
	}
	indented(fn) {
		this.indent += 1;
		try {
			fn(this);
		} finally {
			this.indent -= 1;
		}
	}
	write(arg) {
		if (typeof arg === "function") {
			arg(this, { execution: "sync" });
			arg(this, { execution: "async" });
			return;
		}
		const lines = arg.split("\n").filter((x) => x);
		const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
		const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
		for (const line of dedented) this.content.push(line);
	}
	compile() {
		const F = Function;
		const content = this?.content ?? [``];
		return new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${content.join("\n")}\n};`)(...Object.values(this.closed));
	}
};
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/versions.js
const version$1 = {
	major: 4,
	minor: 6,
	patch: 5
};
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/schemas.js
const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
	var _a;
	inst ?? (inst = {});
	inst._zod.def = def;
	inst._zod.bag = inst._zod.bag || {};
	inst._zod.version = version$1;
	const defChecks = inst._zod.def.checks;
	const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
	for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
	if (checks.length === 0) {
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred?.push(() => {
			inst._zod.run = inst._zod.parse;
		});
	} else {
		const runChecks = (payload, checks, ctx) => {
			if (payload.memo) return payload;
			let isAborted = aborted(payload);
			let asyncResult;
			for (const ch of checks) {
				if (ch._zod.def.when) {
					if (explicitlyAborted(payload)) continue;
					if (!ch._zod.def.when(payload)) continue;
				} else if (isAborted) continue;
				const currLen = payload.issues.length;
				const _ = ch._zod.check(payload);
				if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
				if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
					await _;
					if (payload.issues.length === currLen) return;
					attachSchema(payload.issues, currLen, inst);
					if (!isAborted) isAborted = aborted(payload, currLen);
				});
				else {
					if (payload.issues.length === currLen) continue;
					attachSchema(payload.issues, currLen, inst);
					if (!isAborted) isAborted = aborted(payload, currLen);
				}
			}
			if (asyncResult) return asyncResult.then(() => {
				return payload;
			});
			return payload;
		};
		const handleCanaryResult = (canary, payload, ctx) => {
			if (aborted(canary)) {
				canary.aborted = true;
				return canary;
			}
			const checkResult = runChecks(payload, checks, ctx);
			if (checkResult instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
			}
			return inst._zod.parse(checkResult, ctx);
		};
		inst._zod.run = (payload, ctx) => {
			if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
			if (ctx.direction === "backward") {
				const canary = inst._zod.parse({
					value: payload.value,
					issues: []
				}, {
					...ctx,
					skipChecks: true
				});
				if (canary instanceof Promise) return canary.then((canary) => {
					return handleCanaryResult(canary, payload, ctx);
				});
				return handleCanaryResult(canary, payload, ctx);
			}
			const result = inst._zod.parse(payload, ctx);
			if (result instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return result.then((result) => runChecks(result, checks, ctx));
			}
			return runChecks(result, checks, ctx);
		};
	}
}, {
	get "~standard"() {
		return hide(this, "~standard", standardProps(this));
	},
	set "~standard"(value) {
		own(this, "~standard", value);
	}
});
/** The Standard Schema surface for `inst`. Shared so wrappers can extend it without forcing it. */
const toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => finalizeIssue(iss, ctx, config())) } : { value: r.value };
async function validateAsync(inst, value) {
	const ctx = { async: true };
	return toStandardResult(await inst._zod.run({
		value,
		issues: []
	}, ctx), ctx);
}
function standardProps(inst) {
	return {
		validate: (value) => {
			const ctx = { async: false };
			try {
				const r = inst._zod.run({
					value,
					issues: []
				}, ctx);
				if (!(r instanceof Promise)) return toStandardResult(r, ctx);
			} catch (_) {}
			return validateAsync(inst, value);
		},
		vendor: "zod",
		version: 1
	};
}
const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = def.pattern ?? anyString;
	inst._zod.parse = (payload, _) => {
		if (def.coerce) try {
			payload.value = String(payload.value);
		} catch (_) {}
		if (typeof payload.value === "string") return payload;
		payload.issues.push({
			expected: "string",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	$ZodString.init(inst, def);
});
const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
	def.pattern ?? (def.pattern = guid);
	$ZodStringFormat.init(inst, def);
});
const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
	if (def.version) {
		const v = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[def.version];
		if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
		def.pattern ?? (def.pattern = uuid(v));
	} else def.pattern ?? (def.pattern = uuid());
	$ZodStringFormat.init(inst, def);
});
const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
	def.pattern ?? (def.pattern = email);
	$ZodStringFormat.init(inst, def);
});
function canParseURL(input) {
	try {
		if (typeof URL !== "undefined" && typeof URL.canParse === "function") return URL.canParse(input);
		new URL(input);
		return true;
	} catch {
		return false;
	}
}
function validateURL(trimmed, def) {
	if (!("normalize" in def) && !("hostname" in def) && !("protocol" in def)) return canParseURL(trimmed) || 2;
	return parseURLObject(trimmed, def);
}
/** Parses a URL while preserving the non-normalizing HTTP guard. */
function parseURLObject(trimmed, def) {
	if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) return 1;
	try {
		if (typeof URL !== "undefined") {
			const URLStatic = URL;
			if (typeof URLStatic.parse === "function") return URLStatic.parse(trimmed) ?? 2;
		}
		return new URL(trimmed);
	} catch {
		return 2;
	}
}
const asciiTabOrNewline = /[\t\n\r]/g;
/** The URL parser deletes every ASCII tab, LF and CR from its input before it parses, so `new URL("https://exa\nmple.com")` reports on `example.com`. Applying the same deletion to the returned value closes the half of that divergence which can move the host; the parser's other rewrite, stripping C0 controls at the edges, cannot. */
function stripTabAndNewline(value) {
	return value.replace(asciiTabOrNewline, "");
}
function urlHostnameOk(url, hostname) {
	hostname.lastIndex = 0;
	return hostname.test(url.hostname);
}
function urlProtocolOk(url, protocol) {
	protocol.lastIndex = 0;
	return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
}
const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		try {
			const trimmed = payload.value.trim();
			const url = validateURL(trimmed, def);
			if (url === 1) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: payload.value,
					inst,
					continue: !def.abort
				});
				return;
			}
			if (url === 2) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
				return;
			}
			if (url === true) {
				payload.value = stripTabAndNewline(trimmed);
				return;
			}
			if (def.hostname && !urlHostnameOk(url, def.hostname)) payload.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: def.hostname.source,
				input: payload.value,
				inst,
				continue: !def.abort
			});
			if (def.protocol && !urlProtocolOk(url, def.protocol)) payload.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: def.protocol.source,
				input: payload.value,
				inst,
				continue: !def.abort
			});
			payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
			return;
		} catch (_) {
			payload.issues.push({
				code: "invalid_format",
				format: "url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
	def.pattern ?? (def.pattern = emoji());
	$ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
	if (def.length !== void 0 && (!Number.isInteger(def.length) || def.length < 1)) throw new Error(`Invalid nanoid length: ${def.length}`);
	def.pattern ?? (def.pattern = def.length === void 0 ? nanoid : nanoidOfLength(def.length));
	$ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
	def.pattern ?? (def.pattern = cuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
	def.pattern ?? (def.pattern = cuid2);
	$ZodStringFormat.init(inst, def);
});
const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
	def.pattern ?? (def.pattern = ulid);
	$ZodStringFormat.init(inst, def);
});
const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
	def.pattern ?? (def.pattern = xid);
	$ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
	def.pattern ?? (def.pattern = ksuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
	def.pattern ?? (def.pattern = datetime(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
	def.pattern ?? (def.pattern = date);
	$ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
	def.pattern ?? (def.pattern = time(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
	def.pattern ?? (def.pattern = duration$1);
	$ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
	def.pattern ?? (def.pattern = ipv4);
	$ZodStringFormat.init(inst, def);
});
/** An IPv6 address is written with hex digits, colons and dots, and nothing else. The guard is what makes the check below an IPv6 check: `new URL("http://[...]")` parses an authority, not an address, so `@` and `\` re-delimit it and `"::@1\\"` validates against the host `0.0.0.1`. The URL parser also deletes ASCII tab, LF and CR rather than failing, which is how `"::1\n"` validated as `::1`. */
const ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
function isValidIPv6(value) {
	if (!ipv6Alphabet.test(value)) return false;
	return canParseURL(`http://[${value}]`);
}
const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
	def.pattern ?? (def.pattern = ipv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (!isValidIPv6(payload.value)) payload.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv4);
	$ZodStringFormat.init(inst, def);
});
function isValidCIDRv6(value) {
	const parts = value.split("/");
	if (parts.length !== 2) return false;
	const [address, prefix] = parts;
	if (!prefix) return false;
	const prefixNum = Number(prefix);
	if (`${prefixNum}` !== prefix) return false;
	if (prefixNum < 0 || prefixNum > 128) return false;
	return isValidIPv6(address);
}
const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (!isValidCIDRv6(payload.value)) payload.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
function isValidBase64(data) {
	if (data === "") return true;
	if (/\s/.test(data)) return false;
	if (data.length % 4 !== 0) return false;
	try {
		atob(data);
		return true;
	} catch {
		return false;
	}
}
const base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
	def.pattern ?? (def.pattern = base64Charset);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidBase64(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const base64urlCharset = /^[A-Za-z0-9_-]*$/;
function isValidBase64URL(data) {
	if (!base64urlCharset.test(data)) return false;
	const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
	return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}
const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
	def.pattern ?? (def.pattern = base64urlCharset);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidBase64URL(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
	def.pattern ?? (def.pattern = e164);
	$ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
	try {
		const tokensParts = token.split(".");
		if (tokensParts.length !== 3) return false;
		const [header] = tokensParts;
		if (!header) return false;
		const parsedHeader = JSON.parse(atob(header));
		if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
		if (!parsedHeader.alg) return false;
		if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
		return true;
	} catch {
		return false;
	}
}
const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidJWT(payload.value, def.alg)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = number$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Number(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
		const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? String(input) : void 0 : void 0;
		payload.issues.push({
			expected: "number",
			code: "invalid_type",
			input,
			inst,
			...received ? { received } : {}
		});
		return payload;
	};
});
const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
	$ZodCheckNumberFormat.init(inst, def);
	$ZodNumber.init(inst, def);
});
const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = boolean$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Boolean(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "boolean") return payload;
		payload.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input,
			inst
		});
		return payload;
	};
});
const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.issues.push({
			expected: "never",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
function handleArrayResult(result, final, index) {
	if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
	final.value[index] = result.value;
}
const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
	$ZodType.init(inst, def);
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!Array.isArray(input)) {
			payload.issues.push({
				expected: "array",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
		const proms = [];
		const abortEarly = ctx?.abortEarly;
		for (let i = 0; i < input.length; i++) {
			const item = input[i];
			const result = def.element._zod.run({
				value: item,
				issues: []
			}, ctx);
			if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
			else {
				handleArrayResult(result, payload, i);
				if (abortEarly && result.issues.length !== 0 && aborted(result)) break;
			}
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
function handlePropertyResult(result, final, key, input, optin, optout) {
	const isPresent = key in input;
	const isOptionalOut = optout === "optional";
	if (!isPresent && isOptionalOut && optin === "optional") return;
	if (result.issues.length) {
		if (optin !== void 0 && isOptionalOut && !isPresent) return;
		final.issues.push(...prefixIssues(key, result.issues));
	}
	if (!isPresent && optin === void 0) {
		if (!result.issues.length) final.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [key]
		});
		return;
	}
	if (result.value === void 0) {
		if (isPresent || optin === "defaulted" && !isOptionalOut) final.value[key] = void 0;
	} else final.value[key] = result.value;
}
const NO_SYMBOL_KEYS = [];
function normalizeDef(def) {
	const keys = Object.keys(def.shape);
	const ownSymbols = Object.getOwnPropertySymbols(def.shape);
	const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
	const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
	for (const k of allKeys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
	const okeys = optionalKeys(def.shape);
	return {
		...def,
		allKeys,
		symbolKeys,
		keySet: new Set(keys),
		numKeys: keys.length,
		optionalKeys: new Set(okeys)
	};
}
function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
	const unrecognized = [];
	const keySet = def.keySet;
	const _catchall = def.catchall._zod;
	const t = _catchall.def.type;
	const optin = _catchall.optin;
	const optout = _catchall.optout;
	let seen = 0;
	for (const key in input) {
		if (abortEarly && payload.issues.length !== seen) {
			if (aborted(payload, seen)) break;
			seen = payload.issues.length;
		}
		if (keySet.has(key)) continue;
		if (key === "__proto__") {
			if (t === "never") unrecognized.push(key);
			continue;
		}
		if (t === "never") {
			unrecognized.push(key);
			continue;
		}
		const r = _catchall.run({
			value: input[key],
			issues: []
		}, ctx);
		if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
		else handlePropertyResult(r, payload, key, input, optin, optout);
	}
	if (unrecognized.length) payload.issues.push({
		code: "unrecognized_keys",
		keys: unrecognized,
		input,
		inst,
		continue: true
	});
	if (!proms.length) return payload;
	return Promise.all(proms).then(() => {
		return payload;
	});
}
const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
	$ZodType.init(inst, def);
	const desc = Object.getOwnPropertyDescriptor(def, "shape");
	const sh = desc?.get ? desc.get.raw : def.shape ?? {};
	if (sh) {
		const get = () => {
			const newSh = { ...sh };
			Object.defineProperty(def, "shape", { value: newSh });
			get.raw = newSh;
			return newSh;
		};
		get.raw = sh;
		Object.defineProperty(def, "shape", { get });
	}
	const _normalized = cached(() => normalizeDef(def));
	defineLazyInternal(inst, "propValues", (zod) => {
		const shape = zod.def.shape;
		const propValues = {};
		for (const key in shape) {
			const field = shape[key]._zod;
			if (field.values) {
				if (!Object.prototype.hasOwnProperty.call(propValues, key)) assignProp(propValues, key, /* @__PURE__ */ new Set());
				for (const v of field.values) propValues[key].add(v);
				if (field.optin !== void 0) propValues[key].add(void 0);
			}
		}
		return propValues;
	});
	const isObject$2 = isObject;
	const catchall = def.catchall;
	let value;
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$2(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
		const proms = [];
		const shape = value.shape;
		const abortEarly = ctx?.abortEarly;
		let seen = payload.issues.length;
		for (const key of value.allKeys) {
			if (abortEarly && payload.issues.length !== seen) {
				if (aborted(payload, seen)) break;
				seen = payload.issues.length;
			}
			if (key === "__proto__") continue;
			const el = shape[key];
			const optin = el._zod.optin;
			const optout = el._zod.optout;
			const r = el._zod.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
			else handlePropertyResult(r, payload, key, input, optin, optout);
		}
		if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
		return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
	};
});
const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
	$ZodObject.init(inst, def);
	const superParse = inst._zod.parse;
	const _normalized = cached(() => normalizeDef(def));
	const memo = globalConfig.memoizer;
	const generateFastpass = (shape) => {
		const normalized = _normalized.value;
		const syms = normalized.symbolKeys;
		const doc = new Doc(["payload", "ctx"], {
			shape,
			inst,
			memo,
			syms
		});
		const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
		const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
		doc.write(`const input = payload.value;`);
		const ids = Object.create(null);
		let counter = 0;
		for (const key of normalized.allKeys) ids[key] = `key_${counter++}`;
		doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
		for (const key of normalized.allKeys) {
			if (key === "__proto__") continue;
			const id = ids[key];
			const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
			const isPresent = `${k} in input`;
			const schema = shape[key];
			const optin = schema?._zod?.optin;
			const isOptionalIn = optin !== void 0;
			const isOptionalOut = schema?._zod?.optout === "optional";
			doc.write(`const ${id} = ${parseStr(k)};`);
			if (isOptionalIn && isOptionalOut) {
				const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
				doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
			} else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
			else {
				doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
				if (optin === "defaulted") doc.write(`newResult[${k}] = ${id}.value;`);
				else doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
			}
		}
		doc.write(`payload.value = newResult;`);
		doc.write(`return payload;`);
		return doc.compile();
	};
	let fastpass;
	const isObject$1 = isObject;
	const jit = !globalConfig.jitless;
	const fastEnabled = jit && allowsEval.value;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$1(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
			if (!fastpass) fastpass = generateFastpass(def.shape);
			payload = fastpass(payload, ctx);
			if (!catchall) return payload;
			return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
		}
		return superParse(payload, ctx);
	};
});
function handleUnionResults(results, final, inst, ctx) {
	for (const result of results) if (result.issues.length === 0) {
		final.value = result.value;
		return final;
	}
	const nonaborted = results.filter((r) => !aborted(r));
	if (nonaborted.length === 1) {
		final.value = nonaborted[0].value;
		return nonaborted[0];
	}
	final.issues.push({
		code: "invalid_union",
		input: final.value,
		inst,
		errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	});
	return final;
}
const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0);
	defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
	defineLazyInternal(inst, "values", (zod) => {
		if (zod.def.options.every((o) => o._zod.values)) return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
	});
	defineLazyInternal(inst, "pattern", (zod) => {
		if (zod.def.options.every((o) => o._zod.pattern)) {
			const patterns = zod.def.options.map((o) => o._zod.pattern);
			return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
		}
	});
	const first = def.options.length === 1 ? def.options[0]._zod.run : null;
	inst._zod.parse = (payload, ctx) => {
		if (first) return first(payload, ctx);
		let async = false;
		const results = [];
		for (const option of def.options) {
			const result = option._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) {
				results.push(result);
				async = true;
			} else {
				if (result.issues.length === 0) return result;
				results.push(result);
			}
		}
		if (!async) return handleUnionResults(results, payload, inst, ctx);
		return Promise.all(results).then((results) => {
			return handleUnionResults(results, payload, inst, ctx);
		});
	};
});
function discriminatorMap(def) {
	const map = /* @__PURE__ */ new Map();
	for (const option of def.options) {
		const values = option._zod.propValues?.[def.discriminator];
		if (!values || values.size === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
		for (const value of values) if (map.has(value)) {
			if (value !== void 0) throw new Error(`Duplicate discriminator value "${String(value)}"`);
			map.set(value, null);
		} else map.set(value, option);
	}
	return map;
}
const $ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
	def.inclusive = false;
	$ZodUnion.init(inst, def);
	const _super = inst._zod.parse;
	defineLazyInternal(inst, "propValues", (zod) => {
		const propValues = {};
		let undefinedCount = 0;
		for (const option of zod.def.options) {
			const pv = option._zod.propValues;
			if (!pv || Object.keys(pv).length === 0) throw new Error(`Invalid discriminated union option at index "${zod.def.options.indexOf(option)}"`);
			if (pv[zod.def.discriminator]?.has(void 0)) undefinedCount++;
			for (const [k, v] of Object.entries(pv)) {
				if (!Object.prototype.hasOwnProperty.call(propValues, k)) assignProp(propValues, k, /* @__PURE__ */ new Set());
				for (const val of v) propValues[k].add(val);
			}
		}
		if (!zod.def.unionFallback && undefinedCount > 1) propValues[zod.def.discriminator]?.delete(void 0);
		return propValues;
	});
	def.options.forEach((option, i) => {
		const propShape = rawShape(option._zod.def);
		if (propShape && !Object.prototype.hasOwnProperty.call(propShape, def.discriminator)) throw new Error(`Invalid discriminated union option at index "${i}"`);
	});
	const disc = cached(() => discriminatorMap(def));
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!isObject(input)) {
			payload.issues.push({
				code: "invalid_type",
				expected: "object",
				input,
				inst
			});
			return payload;
		}
		const value = input?.[def.discriminator];
		const opt = disc.value.get(value);
		if (opt && (value !== void 0 || ctx.direction !== "backward")) return opt._zod.run(payload, ctx);
		if (def.unionFallback || ctx.direction === "backward") return _super(payload, ctx);
		payload.issues.push({
			code: "invalid_union",
			errors: [],
			note: "No matching discriminator",
			discriminator: def.discriminator,
			options: Array.from(disc.value.keys()).filter((value) => disc.value.get(value) !== null),
			input,
			path: [def.discriminator],
			inst
		});
		return payload;
	};
});
const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		const left = def.left._zod.run({
			value: input,
			issues: []
		}, ctx);
		const right = def.right._zod.run({
			value: input,
			issues: []
		}, ctx);
		if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
			return handleIntersectionResults(payload, left, right);
		});
		return handleIntersectionResults(payload, left, right);
	};
});
function mergeValues(a, b) {
	if (a === b) return {
		valid: true,
		data: a
	};
	if (a instanceof Date && b instanceof Date && +a === +b) return {
		valid: true,
		data: a
	};
	if (isPlainObject(a) && isPlainObject(b)) {
		const bKeys = Object.keys(b);
		const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
		const newObj = {
			...a,
			...b
		};
		if (Object.prototype.hasOwnProperty.call(newObj, "__proto__")) delete newObj.__proto__;
		for (const key of sharedKeys) {
			if (key === "__proto__") continue;
			const sharedValue = mergeValues(a[key], b[key]);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
			};
			newObj[key] = sharedValue.data;
		}
		return {
			valid: true,
			data: newObj
		};
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return {
			valid: false,
			mergeErrorPath: []
		};
		const newArray = [];
		for (let index = 0; index < a.length; index++) {
			const itemA = a[index];
			const itemB = b[index];
			const sharedValue = mergeValues(itemA, itemB);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
			};
			newArray.push(sharedValue.data);
		}
		return {
			valid: true,
			data: newArray
		};
	}
	return {
		valid: false,
		mergeErrorPath: []
	};
}
function handleIntersectionResults(result, left, right) {
	const unrecKeys = /* @__PURE__ */ new Map();
	let unrecIssue;
	const keyIssues = /* @__PURE__ */ new Map();
	const collect = (iss, side) => {
		let keys;
		if (iss.code === "unrecognized_keys" && !iss.path?.length) {
			unrecIssue ?? (unrecIssue = iss);
			keys = iss.keys;
		} else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
			const k = String(iss.path[0]);
			if (!keyIssues.has(k)) keyIssues.set(k, iss);
			keys = [k];
		} else return false;
		for (const k of keys) {
			if (!unrecKeys.has(k)) unrecKeys.set(k, {});
			unrecKeys.get(k)[side] = true;
		}
		return true;
	};
	for (const iss of left.issues) if (!collect(iss, "l")) result.issues.push(iss);
	for (const iss of right.issues) if (!collect(iss, "r")) result.issues.push(iss);
	const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
	if (bothKeys.length) {
		const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
		if (aggregated.length) result.issues.push({
			...unrecIssue,
			keys: aggregated
		});
		for (const k of bothKeys) if (!aggregated.includes(k) && keyIssues.has(k)) result.issues.push(keyIssues.get(k));
	}
	const merged = mergeValues(left.value, right.value);
	if (!merged.valid) {
		if (aborted(result)) return result;
		throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
	}
	result.value = merged.data;
	return result;
}
const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
	$ZodType.init(inst, def);
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!isPlainObject(input)) {
			payload.issues.push({
				expected: "record",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		const proms = [];
		const values = def.keyType._zod.values;
		if (values && !def.partial) {
			payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
			const recordKeys = /* @__PURE__ */ new Set();
			for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
				recordKeys.add(typeof key === "number" ? key.toString() : key);
				if (key === "__proto__") continue;
				const keyResult = def.keyType._zod.run({
					value: key,
					issues: []
				}, ctx);
				if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
				if (keyResult.issues.length) {
					payload.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
						input: key,
						path: [key],
						inst
					});
					continue;
				}
				const outKey = keyResult.value;
				if (outKey === "__proto__") continue;
				const result = def.valueType._zod.run({
					value: input[key],
					issues: []
				}, ctx);
				if (result instanceof Promise) proms.push(result.then((result) => {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[outKey] = result.value;
				}));
				else {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[outKey] = result.value;
				}
			}
			let unrecognized;
			for (const key in input) if (!recordKeys.has(key)) {
				if (def.mode === "loose") {
					if (key === "__proto__") continue;
					payload.value[key] = input[key];
				} else {
					unrecognized = unrecognized ?? [];
					unrecognized.push(key);
				}
			}
			if (unrecognized && unrecognized.length > 0) payload.issues.push({
				code: "unrecognized_keys",
				input,
				inst,
				keys: unrecognized,
				continue: true
			});
		} else {
			payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
			let unrecognized;
			for (const key of Reflect.ownKeys(input)) {
				if (key === "__proto__") continue;
				if (!Object.prototype.propertyIsEnumerable.call(input, key)) continue;
				let keyResult = def.keyType._zod.run({
					value: key,
					issues: []
				}, ctx);
				if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
				if (typeof key === "string" && number$1.test(key) && keyResult.issues.length) {
					const retryResult = def.keyType._zod.run({
						value: Number(key),
						issues: []
					}, ctx);
					if (retryResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
					if (retryResult.issues.length === 0) keyResult = retryResult;
				}
				if (keyResult.issues.length) {
					if (def.mode === "loose") payload.value[key] = input[key];
					else if (values) {
						unrecognized = unrecognized ?? [];
						unrecognized.push(key);
					} else payload.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
						input: key,
						path: [key],
						inst
					});
					continue;
				}
				const outKey = keyResult.value;
				if (outKey === "__proto__") continue;
				const result = def.valueType._zod.run({
					value: input[key],
					issues: []
				}, ctx);
				if (result instanceof Promise) proms.push(result.then((result) => {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[outKey] = result.value;
				}));
				else {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[outKey] = result.value;
				}
			}
			if (unrecognized && unrecognized.length > 0) payload.issues.push({
				code: "unrecognized_keys",
				input,
				inst,
				keys: unrecognized,
				continue: true
			});
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
	$ZodType.init(inst, def);
	const values = getEnumValues(def.entries);
	const valuesSet = new Set(values);
	inst._zod.values = valuesSet;
	defineLazyInternal(inst, "pattern", (zod) => {
		const patternValues = getEnumValues(zod.def.entries).filter((k) => propertyKeyTypes.has(typeof k));
		return new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
	});
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (valuesSet.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values,
			input,
			inst
		});
		return payload;
	};
});
const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
	$ZodType.init(inst, def);
	const values = new Set(def.values);
	inst._zod.values = values;
	defineLazyInternal(inst, "pattern", (zod) => {
		const vals = zod.def.values;
		return new RegExp(vals.length ? `^(${vals.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$` : "^[^\\s\\S]$");
	});
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (values.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values: def.values,
			input,
			inst
		});
		return payload;
	};
});
const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	globalConfig.memoizer?.guard(inst);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		const _out = def.transform(payload.value, payload);
		if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
			payload.value = output;
			return payload;
		});
		if (_out instanceof Promise) throw new $ZodAsyncError();
		payload.value = _out;
		return payload;
	};
});
function handleOptionalResult(payload, result) {
	payload.value = result.issues.length ? void 0 : result.value;
	return payload;
}
const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
	inst._zod.optout = "optional";
	defineLazyInternal(inst, "values", (zod) => {
		const values = zod.def.innerType._zod.values;
		return values ? /* @__PURE__ */ new Set([...values, void 0]) : void 0;
	});
	defineLazyInternal(inst, "pattern", (zod) => {
		const pattern = zod.def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === void 0) {
			if (def.innerType._zod.optin !== "defaulted") return payload;
			const result = def.innerType._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) return result.then((result) => handleOptionalResult(payload, result));
			return handleOptionalResult(payload, result);
		}
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
	inst._zod.parse = (payload, ctx) => {
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
	defineLazyInternal(inst, "pattern", (zod) => {
		const pattern = zod.def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
	});
	defineLazyInternal(inst, "values", (zod) => {
		return zod.def.innerType._zod.values ? /* @__PURE__ */ new Set([...zod.def.innerType._zod.values, null]) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === null) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "defaulted";
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) {
			payload.value = def.defaultValue;
			/**
			* $ZodDefault returns the default value immediately in forward direction.
			* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
			return payload;
		}
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
		return handleDefaultResult(result, def);
	};
});
function handleDefaultResult(payload, def) {
	if (payload.value === void 0) payload.value = def.defaultValue;
	return payload;
}
const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "defaulted";
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) payload.value = def.defaultValue;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => {
		const v = zod.def.innerType._zod.values;
		return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
		return handleNonOptionalResult(result, inst);
	};
});
function handleNonOptionalResult(payload, inst) {
	if (!payload.issues.length && payload.value === void 0) payload.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: payload.value,
		inst
	});
	return payload;
}
function handleCatchResult(payload, result, def, ctx) {
	if (!result.issues.length) {
		payload.value = result.value;
		if (result.memo) payload.memo = true;
		return payload;
	}
	payload.value = def.catchValue({
		...result,
		value: payload.value,
		error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
		input: payload.value
	});
	return payload;
}
const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run({
			value: payload.value,
			issues: []
		}, ctx);
		if (result instanceof Promise) return result.then((result) => handleCatchResult(payload, result, def, ctx));
		return handleCatchResult(payload, result, def, ctx);
	};
});
const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
	defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
	defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") {
			const right = def.out._zod.run(payload, ctx);
			if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
			return handlePipeResult(right, def.in, ctx);
		}
		const left = def.in._zod.run(payload, ctx);
		if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
		return handlePipeResult(left, def.out, ctx);
	};
});
function handlePipeResult(left, next, ctx) {
	if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
		left.aborted = true;
		return left;
	}
	return next._zod.run({
		value: left.value,
		issues: left.issues
	}, ctx);
}
const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then(handleReadonlyResult);
		return handleReadonlyResult(result);
	};
});
function handleReadonlyResult(payload) {
	if (!payload.memo) payload.value = Object.freeze(payload.value);
	return payload;
}
const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
	$ZodCheck.init(inst, def);
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _) => {
		return payload;
	};
	inst._zod.check = (payload) => {
		const input = payload.value;
		const r = def.fn(input);
		if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
		handleRefineResult(r, payload, input, inst);
	};
});
function handleRefineResult(result, payload, input, inst) {
	if (!result) {
		const _iss = {
			code: "custom",
			input,
			inst,
			path: [...inst._zod.def.path ?? []],
			continue: !inst._zod.def.abort
		};
		if (inst._zod.def.params) _iss.params = inst._zod.def.params;
		payload.issues.push(issue(_iss));
	}
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/memoizer.js
var $ZodCyclicError = class extends Error {
	constructor() {
		super(`Cannot parse a reference cycle that closes through a transform`);
		this.name = "ZodCyclicError";
	}
};
/** Keyed off the context object every schema in one parse call already shares. */
const STATE = "~memo";
const NO_ISSUES = [];
function isRef(value) {
	return value !== null && typeof value === "object";
}
function cloneIssues(issues) {
	return issues.map((iss) => iss.path ? {
		...iss,
		path: iss.path.slice()
	} : { ...iss });
}
const recursive = /*@__PURE__*/ new WeakMap();
/** What the walk established, in order of certainty: ordered so the strongest answer among children wins. */
const NONE = 0;
const ASSUMED = 1;
const PROVEN = 2;
/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
function isRecursive(inst, stack, resolve) {
	const cached = recursive.get(inst);
	if (cached !== void 0) return cached ? PROVEN : NONE;
	if (stack.has(inst)) return PROVEN;
	stack.add(inst);
	let result = NONE;
	const check = (child) => {
		if (result !== PROVEN && child?._zod) {
			const answer = isRecursive(child, stack, resolve);
			if (answer > result) result = answer;
		}
	};
	const shape = (sh, spread) => {
		let answer = NONE;
		for (const key of Reflect.ownKeys(sh)) {
			const desc = Object.getOwnPropertyDescriptor(sh, key);
			if (spread && !desc.enumerable) continue;
			const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
			if (child > answer) answer = child;
		}
		return answer;
	};
	const merge = (answer) => {
		if (answer > result) result = answer;
	};
	const def = inst._zod.def;
	switch (def.type) {
		case "object": {
			const raw = rawShape(def);
			merge(raw ? shape(raw, true) : ASSUMED);
			check(def.catchall);
			break;
		}
		case "array":
			check(def.element);
			break;
		case "tuple":
			for (const el of def.items) check(el);
			check(def.rest);
			break;
		case "record":
		case "map":
			check(def.keyType);
			check(def.valueType);
			break;
		case "set":
			check(def.valueType);
			break;
		case "union":
			for (const el of def.options) check(el);
			break;
		case "intersection":
			check(def.left);
			check(def.right);
			break;
		case "optional":
		case "nullable":
		case "default":
		case "prefault":
		case "catch":
		case "readonly":
		case "nonoptional":
		case "promise":
		case "success":
			check(def.innerType);
			break;
		case "pipe":
			check(def.in);
			check(def.out);
			break;
		case "function":
			check(def.input);
			check(def.output);
			break;
		case "lazy": {
			const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : void 0);
			merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
			break;
		}
		case "template_literal":
		case "string":
		case "number":
		case "int":
		case "boolean":
		case "bigint":
		case "symbol":
		case "undefined":
		case "null":
		case "void":
		case "never":
		case "any":
		case "unknown":
		case "date":
		case "nan":
		case "enum":
		case "literal":
		case "file":
		case "transform":
		case "custom": break;
		default: for (const key in def) {
			const desc = Object.getOwnPropertyDescriptor(def, key);
			if (!desc || desc.get) continue;
			const value = desc.value;
			if (!value || typeof value !== "object") continue;
			if (value._zod) check(value);
			else if (Array.isArray(value)) for (const el of value) check(el);
		}
	}
	stack.delete(inst);
	return settle(inst, result);
}
/** An assumed answer must not outlive the resolution that settles it, so only a certain one is cached. */
function settle(inst, answer) {
	if (answer !== ASSUMED) recursive.set(inst, answer === PROVEN);
	return answer;
}
function bucketFor(state, inst) {
	let bucket = state.buckets.get(inst);
	if (!bucket) {
		bucket = /* @__PURE__ */ new WeakMap();
		state.buckets.set(inst, bucket);
	}
	return bucket;
}
let handoff;
const open = [];
const memo = {
	alloc(_inst, payload, empty) {
		const bucket = handoff;
		if (!bucket) return empty;
		handoff = void 0;
		const entry = {
			value: empty,
			issues: null
		};
		bucket.set(payload.value, entry);
		open.push(entry);
		return empty;
	},
	guard(inst) {
		var _a;
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred.push(() => {
			const base = inst._zod.parse;
			const wrapped = (payload, ctx) => {
				if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value)) throw new $ZodCyclicError();
				return base(payload, ctx);
			};
			inst._zod.parse = wrapped;
			if (inst._zod.run === base) inst._zod.run = wrapped;
		});
	},
	attach(inst) {
		var _a;
		let isRecursiveInst;
		let rechecked = false;
		let lastCtx;
		let lastBucket;
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred.push(() => {
			const base = inst._zod.parse;
			const wrapped = (payload, ctx) => {
				if (isRecursiveInst === void 0) {
					const walked = isRecursive(inst, /* @__PURE__ */ new Set(), false);
					if (walked === NONE) {
						inst._zod.parse = base;
						if (inst._zod.run === wrapped) inst._zod.run = base;
						return base(payload, ctx);
					}
					if (walked === PROVEN || rechecked) isRecursiveInst = true;
					else rechecked = true;
				}
				const input = payload.value;
				if (!isRef(input)) return base(payload, ctx);
				let state = ctx[STATE];
				if (!state) {
					state = {
						buckets: /* @__PURE__ */ new WeakMap(),
						backEdges: void 0
					};
					ctx[STATE] = state;
				}
				let bucket;
				if (lastCtx === ctx) bucket = lastBucket;
				else {
					bucket = bucketFor(state, inst);
					lastCtx = ctx;
					lastBucket = bucket;
				}
				const hit = bucket.get(input);
				if (hit) {
					payload.value = hit.value;
					if (hit.issues) {
						if (hit.issues.length) payload.issues.push(...cloneIssues(hit.issues));
					} else {
						payload.memo = true;
						state.backEdges ?? (state.backEdges = /* @__PURE__ */ new WeakSet());
						state.backEdges.add(hit.value);
					}
					return payload;
				}
				handoff = bucket;
				const depth = open.length;
				const result = base(payload, ctx);
				handoff = void 0;
				const entry = open.length > depth ? open.pop() : void 0;
				if (result instanceof Promise) return result.then((r) => {
					if (entry) entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
					return r;
				});
				if (entry) entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
				return result;
			};
			inst._zod.parse = wrapped;
			if (inst._zod.run === base) inst._zod.run = wrapped;
		});
	}
};
/** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
function memoizer() {
	return memo;
}
/** Whether this value is a node a back-edge resolved to before it finished. */
function isBackEdge(ctx, value) {
	const backEdges = ctx[STATE]?.backEdges;
	return backEdges !== void 0 && isRef(value) && backEdges.has(value);
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/locales/en.js
const error = () => {
	const Sizable = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		},
		map: {
			unit: "entries",
			verb: "to have"
		}
	};
	function getSizing(origin) {
		return Sizable[origin] ?? null;
	}
	const FormatDictionary = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		currency_code: "currency code",
		credit_card: "credit card number",
		iban: "IBAN",
		jwt: "JWT",
		template_literal: "input"
	};
	const TypeDictionary = { nan: "NaN" };
	function getTypeName(type, input) {
		if (type === "number" && typeof input === "number" && !Number.isFinite(input)) return String(input);
		return TypeDictionary[type] ?? type;
	}
	return (issue) => {
		switch (issue.code) {
			case "invalid_type": return `Invalid input: expected ${getTypeName(issue.expected)}, received ${getTypeName(parsedType(issue.input), issue.input)}`;
			case "invalid_value":
				if (issue.values.length === 1) return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
				return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
			case "too_big": {
				const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
				const sizing = getSizing(issue.origin);
				if (sizing) return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
				return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
			}
			case "too_small": {
				const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
				const sizing = getSizing(issue.origin);
				if (sizing) return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
				return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
			}
			case "invalid_format": {
				const _issue = issue;
				if (_issue.format === "starts_with") return `Invalid string: must start with "${_issue.prefix}"`;
				if (_issue.format === "ends_with") return `Invalid string: must end with "${_issue.suffix}"`;
				if (_issue.format === "includes") return `Invalid string: must include "${_issue.includes}"`;
				if (_issue.format === "regex") return `Invalid string: must match pattern ${_issue.pattern}`;
				return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${issue.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${issue.origin}`;
			case "invalid_union":
				if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) return `Invalid discriminator value. Expected ${issue.options.map((o) => `'${o}'`).join(" | ")}`;
				if (issue.inclusive === false) return "Invalid input: more than one option matched";
				return "Invalid input";
			case "invalid_element": return `Invalid value in ${issue.origin}`;
			default: return `Invalid input`;
		}
	};
};
function en_default() {
	return { localeError: error() };
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/registries.js
var _a;
var $ZodRegistry = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
	}
	add(schema, ..._meta) {
		const meta = _meta[0];
		this._map.set(schema, meta);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
		return this;
	}
	clear() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
		return this;
	}
	remove(schema) {
		const meta = this._map.get(schema);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
		this._map.delete(schema);
		return this;
	}
	get(schema) {
		const p = schema._zod.parent;
		if (p) {
			const pm = { ...this.get(p) ?? {} };
			delete pm.id;
			const f = {
				...pm,
				...this._map.get(schema)
			};
			return Object.keys(f).length ? f : void 0;
		}
		return this._map.get(schema);
	}
	has(schema) {
		return this._map.has(schema);
	}
};
function registry() {
	return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/api.js
function snapshotChecks(def) {
	if (def.checks) def.checks = [...def.checks];
	return def;
}
// @__NO_SIDE_EFFECTS__
function _string(Class, params) {
	return new Class(snapshotChecks({
		type: "string",
		...normalizeParams(params)
	}));
}
// @__NO_SIDE_EFFECTS__
function _email(Class, params) {
	return new Class({
		type: "string",
		format: "email",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _guid(Class, params) {
	return new Class({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v4",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v6",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v7",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _url(Class, params) {
	return new Class({
		type: "string",
		format: "url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _emoji(Class, params) {
	return new Class({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class, params) {
	return new Class({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link _cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
// @__NO_SIDE_EFFECTS__
function _cuid(Class, params) {
	return new Class({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class, params) {
	return new Class({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class, params) {
	return new Class({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _xid(Class, params) {
	return new Class({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class, params) {
	return new Class({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class, params) {
	return new Class({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class, params) {
	return new Class({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _base64(Class, params) {
	return new Class({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class, params) {
	return new Class({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _e164(Class, params) {
	return new Class({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class, params) {
	return new Class({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class, params) {
	return new Class({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: false,
		local: false,
		precision: null,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class, params) {
	return new Class({
		type: "string",
		format: "date",
		check: "string_format",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class, params) {
	return new Class({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class, params) {
	return new Class({
		type: "string",
		format: "duration",
		check: "string_format",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _number(Class, params) {
	return new Class(snapshotChecks({
		type: "number",
		checks: [],
		...normalizeParams(params)
	}));
}
// @__NO_SIDE_EFFECTS__
function _int(Class, params) {
	return new Class({
		type: "number",
		check: "number_format",
		abort: false,
		format: "safeint",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class, params) {
	return new Class({
		type: "boolean",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class) {
	return new Class({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function _never(Class, params) {
	return new Class({
		type: "never",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
	return new $ZodCheckMultipleOf({
		check: "multiple_of",
		...normalizeParams(params),
		value
	});
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
	return new $ZodCheckMaxLength({
		check: "max_length",
		...normalizeParams(params),
		maximum
	});
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
	return new $ZodCheckMinLength({
		check: "min_length",
		...normalizeParams(params),
		minimum
	});
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
	return new $ZodCheckLengthEquals({
		check: "length_equals",
		...normalizeParams(params),
		length
	});
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
	return new $ZodCheckRegex({
		check: "string_format",
		format: "regex",
		...normalizeParams(params),
		pattern
	});
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
	return new $ZodCheckLowerCase({
		check: "string_format",
		format: "lowercase",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
	return new $ZodCheckUpperCase({
		check: "string_format",
		format: "uppercase",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
	return new $ZodCheckIncludes({
		check: "string_format",
		format: "includes",
		...normalizeParams(params),
		includes
	});
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
	return new $ZodCheckStartsWith({
		check: "string_format",
		format: "starts_with",
		...normalizeParams(params),
		prefix
	});
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
	return new $ZodCheckEndsWith({
		check: "string_format",
		format: "ends_with",
		...normalizeParams(params),
		suffix
	});
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
	return new $ZodCheckOverwrite({
		check: "overwrite",
		tx
	});
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
	return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
	return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
	return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class, element, params) {
	return new Class({
		type: "array",
		element,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _refine(Class, fn, _params) {
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...normalizeParams(_params)
	});
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
	const ch = /* @__PURE__ */ _check((payload) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				if (!("input" in _issue)) _issue.input = payload.value;
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	}, params);
	return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
	const ch = new $ZodCheck({
		check: "custom",
		...normalizeParams(params)
	});
	ch._zod.check = fn;
	return ch;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function assignProps(target, ...sources) {
	for (const source of sources) for (const key of Reflect.ownKeys(source)) if (Object.prototype.propertyIsEnumerable.call(source, key)) assignProp(target, key, source[key]);
	return target;
}
function initializeContext(params) {
	let target = params?.target ?? "draft-2020-12";
	if (target === "draft-4") target = "draft-04";
	if (target === "draft-7") target = "draft-07";
	return {
		processors: params.processors ?? {},
		metadataRegistry: params?.metadata ?? globalRegistry,
		target,
		unrepresentable: params?.unrepresentable ?? "throw",
		override: params?.override ?? (() => {}),
		io: params?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		sharedDefsExtractedFor: void 0,
		sharedEmitDoneFor: void 0,
		cycles: params?.cycles ?? "ref",
		reused: params?.reused ?? "inline",
		intersections: [],
		deferred: [],
		external: params?.external ?? void 0
	};
}
/**
* Applies the `unrepresentable` setting at a site that has no JSON Schema equivalent. Throws
* `message` unless the setting (or the handler's return value) says otherwise. Returns `true` if a
* custom JSON Schema was written into `json`, in which case the caller must not write its own.
*/
function handleUnrepresentable(schema, ctx, json, params, message) {
	const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({
		zodSchema: schema,
		path: params.path,
		message
	}) : ctx.unrepresentable;
	if (result === "any") return false;
	if (result === void 0 || result === "throw") throw new Error(message);
	Object.assign(json, result);
	return true;
}
function processSchema(schema, ctx, _params = {
	path: [],
	schemaPath: []
}) {
	var _a;
	const def = schema._zod.def;
	const seen = ctx.seen.get(schema);
	if (seen) {
		seen.count++;
		if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
		return seen.schema;
	}
	const result = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: _params.path
	};
	ctx.seen.set(schema, result);
	ctx.sharedDefsExtractedFor = void 0;
	ctx.sharedEmitDoneFor = void 0;
	const overrideSchema = schema._zod.toJSONSchema?.();
	if (overrideSchema) result.schema = overrideSchema;
	else {
		const params = {
			..._params,
			schemaPath: [..._params.schemaPath, schema],
			path: _params.path
		};
		if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
		else {
			const _json = result.schema;
			const processor = ctx.processors[def.type];
			if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
			processor(schema, ctx, _json, params);
		}
		const parent = schema._zod.parent;
		if (parent) {
			if (!result.ref) result.ref = parent;
			processSchema(parent, ctx, params);
			ctx.seen.get(parent).isParent = true;
		}
	}
	const meta = ctx.metadataRegistry.get(schema);
	if (meta) assignProps(result.schema, meta);
	if (ctx.io === "input" && isTransforming(schema)) {
		delete result.schema.examples;
		delete result.schema.default;
	}
	if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
	delete result.schema._prefault;
	return ctx.seen.get(schema).schema;
}
function encodeJSONPointerSegment(segment) {
	return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function extractDefs(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external) return;
	const idToSchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.entries()) {
		const id = ctx.metadataRegistry.get(entry[0])?.id;
		if (id) {
			const existing = idToSchema.get(id);
			if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			idToSchema.set(id, entry[0]);
		}
	}
	const makeURI = (entry) => {
		const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
		if (ctx.external) {
			const externalId = ctx.external.registry.get(entry[0])?.id;
			const uriGenerator = ctx.external.uri ?? ((id) => id);
			if (externalId) return { ref: uriGenerator(externalId) };
			const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
			entry[1].defId = id;
			return {
				defId: id,
				ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}`
			};
		}
		const uriPrefix = `#`;
		const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
		if (entry[1] === root && !entry[1].schema.id) return { ref: uriPrefix };
		const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
		return {
			defId,
			ref: defUriPrefix + encodeJSONPointerSegment(defId)
		};
	};
	const extractToDef = (entry) => {
		if (entry[1].schema.$ref) return;
		const seen = entry[1];
		const { ref, defId } = makeURI(entry);
		seen.def = { ...seen.schema };
		if (defId) seen.defId = defId;
		const schema = seen.schema;
		for (const key in schema) delete schema[key];
		schema.$ref = ref;
	};
	if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (schema === entry[0]) {
			extractToDef(entry);
			continue;
		}
		if (ctx.external) {
			const ext = ctx.external.registry.get(entry[0])?.id;
			if (schema !== entry[0] && ext) {
				extractToDef(entry);
				continue;
			}
		}
		if (ctx.metadataRegistry.get(entry[0])?.id) {
			extractToDef(entry);
			continue;
		}
		if (seen.cycle) {
			extractToDef(entry);
			continue;
		}
		if (seen.count > 1) {
			if (ctx.reused === "ref") extractToDef(entry);
		}
	}
	if (ctx.external) ctx.sharedDefsExtractedFor = ctx.external;
}
/** Rewrites `anyOf: [{type: "a"}, {type: "b"}]` to `type: ["a", "b"]`, which every JSON Schema draft treats as equivalent and most consumers render far better for the nullable case. Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone. Runs after `flattenRef`, so a branch an override decorated or `$defs` extraction turned into a `$ref` is no longer bare and correctly stays in `anyOf`. `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there. OpenAPI 3.0 is excluded: its `type` must be a single string. */
function compactTypeUnion(schema) {
	const options = schema.anyOf;
	if (!Array.isArray(options) || options.length === 0 || schema.type !== void 0) return;
	const types = [];
	for (const option of options) {
		if (!option || typeof option !== "object") return;
		compactTypeUnion(option);
		const keys = Object.keys(option);
		if (keys.length !== 1 || keys[0] !== "type") return;
		const type = option.type;
		for (const member of Array.isArray(type) ? type : [type]) {
			if (typeof member !== "string") return;
			if (!types.includes(member)) types.push(member);
		}
	}
	delete schema.anyOf;
	schema.type = types.length === 1 ? types[0] : types;
}
/** Keywords `foldIntersection` knows how to combine. Anything else — `$ref`, `patternProperties`,
* an annotation like `description` — makes a member unfoldable, so a constraint this does not
* understand leaves the `allOf` alone instead of being silently dropped or misattributed. */
const FOLDABLE_KEYS = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]);
const UNION_KEYS = ["oneOf", "anyOf"];
/** A member's constraint on a key it does not declare itself. A `catchall` states one; `false`, an absent `additionalProperties`, and the empty schema a loose object emits state nothing. */
function undeclaredConstraint(member) {
	const extra = member.additionalProperties;
	if (extra === void 0 || extra === false || typeof extra !== "object" || extra === null) return null;
	return Object.keys(extra).length ? extra : null;
}
/** Combines object members into the single object they describe together, or returns `null` if any of them carries a keyword outside {@link FOLDABLE_KEYS}. */
function foldObjects(members) {
	const objects = [];
	for (const member of members) {
		if (typeof member !== "object" || member.type !== "object") return null;
		for (const key in member) if (!FOLDABLE_KEYS.has(key)) return null;
		objects.push(member);
	}
	const properties = {};
	const required = /* @__PURE__ */ new Set();
	for (const object of objects) {
		for (const key in object.properties) {
			if (Object.prototype.hasOwnProperty.call(properties, key)) continue;
			const parts = [];
			for (const other of objects) {
				const part = other.properties?.[key] ?? undeclaredConstraint(other);
				if (part === null || part === void 0) continue;
				if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part))) parts.push(part);
			}
			assignProp(properties, key, parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts });
		}
		for (const key of object.required ?? []) required.add(key);
	}
	const folded = {
		type: "object",
		properties
	};
	if (required.size) folded.required = [...required];
	if (objects.every((object) => object.additionalProperties === false)) folded.additionalProperties = false;
	else {
		const constraints = [];
		for (const object of objects) {
			const constraint = undeclaredConstraint(object);
			if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint))) constraints.push(constraint);
		}
		if (constraints.length === 1) folded.additionalProperties = constraints[0];
		else if (constraints.length > 1) folded.additionalProperties = { allOf: constraints };
	}
	return folded;
}
/** `additionalProperties` in an `allOf` member sees only that member's own `properties`, so two
* closed object members reject each other's keys and the schema validates nothing. Zod's parser
* pools the key sets instead — `handleIntersectionResults` reports a key as unrecognized only when
* *every* side rejects it — so the emitted schema has to pool them too, and folding the members
* into one object is the encoding that says so on every target.
*
* This runs from `finalize`, after `extractDefs`, which is what keeps it clear of the `$ref`
* machinery: a member extracted into `$defs` is already a `$ref` by now and declines to fold, so it
* keeps its reference and its own closedness rather than being inlined as a stale copy. */
function foldIntersection(json) {
	const allOf = json.allOf;
	if (!Array.isArray(allOf) || allOf.length < 2) return;
	for (const key of FOLDABLE_KEYS) if (key in json) return;
	const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
	let folded = null;
	if (!unions.length) folded = foldObjects(allOf);
	else {
		const union = unions[0];
		const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
		if (Object.keys(union).length !== 1) return;
		const rest = allOf.filter((m) => m !== union);
		const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
		if (branches.some((b) => !b)) return;
		folded = { [keyword]: branches };
	}
	if (!folded) return;
	delete json.allOf;
	assignProps(json, folded);
}
function finalize(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const flattenRef = (zodSchema) => {
		const seen = ctx.seen.get(zodSchema);
		if (seen.ref === null) return;
		const schema = seen.def ?? seen.schema;
		const _cached = { ...schema };
		const ref = seen.ref;
		seen.ref = null;
		if (ref) {
			flattenRef(ref);
			const refSeen = ctx.seen.get(ref);
			const refSchema = refSeen.schema;
			if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
				schema.allOf = schema.allOf ?? [];
				schema.allOf.push(refSchema);
			} else assignProps(schema, refSchema);
			assignProps(schema, _cached);
			if (zodSchema._zod.parent === ref) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (!(key in _cached)) delete schema[key];
			}
			if (refSchema.$ref && refSeen.def) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
			}
		}
		const parent = zodSchema._zod.parent;
		if (parent && parent !== ref) {
			flattenRef(parent);
			const parentSeen = ctx.seen.get(parent);
			if (parentSeen?.schema.$ref) {
				schema.$ref = parentSeen.schema.$ref;
				if (parentSeen.def) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
				}
			}
		}
		ctx.override({
			zodSchema,
			jsonSchema: schema,
			path: seen.path ?? []
		});
	};
	if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
		for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
		if (ctx.target !== "openapi-3.0") for (const entry of ctx.seen.entries()) compactTypeUnion(entry[1].def ?? entry[1].schema);
		for (const rewrite of ctx.deferred) rewrite();
		if (ctx.intersections.length) {
			const carriers = /* @__PURE__ */ new Map();
			for (const seen of ctx.seen.values()) for (const json of [seen.schema, seen.def]) {
				const allOf = json?.allOf;
				if (!Array.isArray(allOf)) continue;
				const existing = carriers.get(allOf);
				if (existing) existing.push(json);
				else carriers.set(allOf, [json]);
			}
			for (const allOf of ctx.intersections) for (const json of carriers.get(allOf) ?? []) foldIntersection(json);
		}
	}
	const result = {};
	if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
	else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
	else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
	else if (ctx.target === "openapi-3.0") {}
	if (ctx.external?.uri) {
		const id = ctx.external.registry.get(schema)?.id;
		if (!id) throw new Error("Schema is missing an `id` property");
		result.$id = ctx.external.uri(id);
	}
	assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
	const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
	if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
	const defs = ctx.external?.defs ?? {};
	if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.def && seen.defId) {
			if (seen.def.id === seen.defId) delete seen.def.id;
			assignProp(defs, seen.defId, seen.def);
		}
	}
	if (ctx.external) ctx.sharedEmitDoneFor = ctx.external;
	if (ctx.external) {} else if (Object.keys(defs).length > 0) {
		if (ctx.target === "draft-2020-12") result.$defs = defs;
		else result.definitions = defs;
	}
	try {
		const finalized = JSON.parse(JSON.stringify(result));
		Object.defineProperty(finalized, "~standard", {
			value: {
				...schema["~standard"],
				jsonSchema: {
					input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
					output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
				}
			},
			enumerable: false,
			writable: false
		});
		return finalized;
	} catch (_err) {
		throw new Error("Error converting schema to JSON.");
	}
}
function isTransforming(_schema, _ctx) {
	const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
	if (ctx.seen.has(_schema)) return false;
	ctx.seen.add(_schema);
	const def = _schema._zod.def;
	if (def.type === "transform") return true;
	if (def.type === "array") return isTransforming(def.element, ctx);
	if (def.type === "set") return isTransforming(def.valueType, ctx);
	if (def.type === "lazy") return isTransforming(def.getter(), ctx);
	if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") return isTransforming(def.innerType, ctx);
	if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
	if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
	if (def.type === "pipe") {
		if (_schema._zod.traits.has("$ZodCodec")) return true;
		return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
	}
	if (def.type === "object") {
		for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
		return false;
	}
	if (def.type === "union") {
		for (const option of def.options) if (isTransforming(option, ctx)) return true;
		return false;
	}
	if (def.type === "tuple") {
		for (const item of def.items) if (isTransforming(item, ctx)) return true;
		if (def.rest && isTransforming(def.rest, ctx)) return true;
		return false;
	}
	return false;
}
/**
* Creates a toJSONSchema method for a schema instance.
* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
*/
const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
	const ctx = initializeContext({
		...params,
		processors
	});
	processSchema(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
	const { libraryOptions, target } = params ?? {};
	const ctx = initializeContext({
		...libraryOptions ?? {},
		target,
		io,
		processors
	});
	processSchema(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/json-schema-processors.js
const narrowMin = (agg, key, value) => {
	if (agg[key] === void 0 || value > agg[key]) agg[key] = value;
};
const narrowMax = (agg, key, value) => {
	if (agg[key] === void 0 || value < agg[key]) agg[key] = value;
};
const narrowBoth = (agg, value) => {
	narrowMin(agg, "minimum", value);
	narrowMax(agg, "maximum", value);
};
const addDivisor = (agg, value) => {
	agg.multipleOf ?? (agg.multipleOf = []);
	if (!agg.multipleOf.includes(value)) agg.multipleOf.push(value);
};
const addPattern = (agg, pattern) => {
	agg.patterns ?? (agg.patterns = /* @__PURE__ */ new Set());
	agg.patterns.add(pattern);
};
const intersectMime = (agg, mime) => {
	agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
};
const setFormat = (agg, format) => {
	agg.format = format;
	if (format.includes("int")) agg.isInt = true;
};
const minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
const maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
const formatContributor = (ranges) => (agg, def) => {
	setFormat(agg, def.format);
	const [minimum, maximum] = ranges[def.format];
	narrowMin(agg, "minimum", minimum);
	narrowMax(agg, "maximum", maximum);
};
const contributors = {
	greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
	less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
	multiple_of: (agg, def) => addDivisor(agg, def.value),
	number_format: formatContributor(NUMBER_FORMAT_RANGES),
	bigint_format: formatContributor(BIGINT_FORMAT_RANGES),
	min_length: minContributor,
	max_length: maxContributor,
	length_equals: (agg, def) => narrowBoth(agg, def.length),
	min_size: minContributor,
	max_size: maxContributor,
	size_equals: (agg, def) => narrowBoth(agg, def.size),
	string_format: (agg, def) => {
		setFormat(agg, def.format);
		if (def.pattern) addPattern(agg, def.pattern);
		if (def.format === "base64" || def.format === "base64url") agg.contentEncoding = def.format;
		if (def.local || def.precision === -1) agg.laxFormat = true;
	},
	mime_type: (agg, def) => intersectMime(agg, def.mime)
};
function aggregateChecks(schema) {
	const agg = {};
	const def = schema._zod.def;
	const list = schema._zod.traits.has("$ZodCheck") ? [schema, ...def.checks ?? []] : def.checks ?? [];
	for (const ch of list) contributors[ch._zod.def.check]?.(agg, ch._zod.def);
	const bag = schema._zod.bag;
	if (bag.minimum !== void 0) narrowMin(agg, "minimum", bag.minimum);
	if (bag.exclusiveMinimum !== void 0) narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
	if (bag.maximum !== void 0) narrowMax(agg, "maximum", bag.maximum);
	if (bag.exclusiveMaximum !== void 0) narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
	if (bag.multipleOf !== void 0) addDivisor(agg, bag.multipleOf);
	if (bag.format !== void 0) {
		agg.format ?? (agg.format = bag.format);
		if (bag.format.includes("int")) agg.isInt = true;
	}
	if (bag.mime) intersectMime(agg, bag.mime);
	for (const pattern of bag.patterns ?? []) addPattern(agg, pattern);
	return agg;
}
const formatMap = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
};
const exactPatterns = /* @__PURE__ */ new Map([[base64Charset, base64], [base64urlCharset, base64url]]);
const exactPattern = (p) => exactPatterns.get(p) ?? p;
const stringProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	json.type = "string";
	const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
	if (typeof minimum === "number") json.minLength = minimum;
	if (typeof maximum === "number") json.maxLength = maximum;
	if (format) {
		json.format = formatMap[format] ?? format;
		if (json.format === "") delete json.format;
		if (format === "time" || laxFormat) delete json.format;
	}
	if (contentEncoding) json.contentEncoding = contentEncoding;
	if (patterns && patterns.size > 0) {
		const patternList = [...patterns].map(exactPattern);
		if (patternList.length === 1) json.pattern = patternList[0].source;
		else if (patternList.length > 1) json.allOf = [...patternList.map((regex) => ({
			...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: regex.source
		}))];
	}
};
const numberProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
	json.type = isInt ? "integer" : "number";
	const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
	const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
	const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
	if (exMin) {
		if (legacy) {
			json.minimum = exclusiveMinimum;
			json.exclusiveMinimum = true;
		} else json.exclusiveMinimum = exclusiveMinimum;
	} else if (typeof minimum === "number") json.minimum = minimum;
	if (exMax) {
		if (legacy) {
			json.maximum = exclusiveMaximum;
			json.exclusiveMaximum = true;
		} else json.exclusiveMaximum = exclusiveMaximum;
	} else if (typeof maximum === "number") json.maximum = maximum;
	if (multipleOf) {
		const divisors = /* @__PURE__ */ new Set();
		for (const divisor of multipleOf) if (Number.isFinite(divisor) && divisor !== 0) divisors.add(Math.abs(divisor));
		else handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
		const [first, ...rest] = divisors;
		if (first !== void 0) json.multipleOf = first;
		if (rest.length) json.allOf = [...json.allOf ?? [], ...rest.map((m) => ({ multipleOf: m }))];
	}
};
const booleanProcessor = (_schema, _ctx, json, _params) => {
	json.type = "boolean";
};
const neverProcessor = (_schema, _ctx, json, _params) => {
	json.not = {};
};
const enumProcessor = (schema, _ctx, json, _params) => {
	const def = schema._zod.def;
	const values = getEnumValues(def.entries);
	if (values.length === 0) {
		json.not = {};
		return;
	}
	if (values.every((v) => typeof v === "number")) json.type = "number";
	if (values.every((v) => typeof v === "string")) json.type = "string";
	json.enum = values;
};
const literalProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	if (def.values.length === 0) {
		json.not = {};
		return;
	}
	const vals = [];
	for (const val of def.values) if (val === void 0) {
		if (handleUnrepresentable(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof val === "bigint") {
		if (handleUnrepresentable(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema")) return;
		vals.push(Number(val));
	} else vals.push(val);
	if (vals.length === 0) {} else if (vals.length === 1) {
		const val = vals[0];
		json.type = val === null ? "null" : typeof val;
		if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
		else json.const = val;
	} else {
		if (vals.every((v) => typeof v === "number")) json.type = "number";
		if (vals.every((v) => typeof v === "string")) json.type = "string";
		if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
		if (vals.every((v) => v === null)) json.type = "null";
		json.enum = vals;
	}
};
const customProcessor = (schema, ctx, json, params) => {
	handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};
const transformProcessor = (schema, ctx, json, params) => {
	handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};
const arrayProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const { minimum, maximum } = aggregateChecks(schema);
	if (typeof minimum === "number") json.minItems = minimum;
	if (typeof maximum === "number") json.maxItems = maximum;
	json.type = "array";
	json.items = processSchema(def.element, ctx, {
		...params,
		path: [...params.path, "items"]
	});
};
function inputOptin(schema) {
	const def = schema._zod.def;
	if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) return inputOptin(def.out);
	if (def.type === "catch") return inputOptin(def.innerType);
	return schema._zod.optin;
}
const objectProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const shape = def.shape;
	if (Object.getOwnPropertySymbols(shape).length && handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) return;
	json.type = "object";
	json.properties = {};
	for (const key in shape) assignProp(json.properties, key, processSchema(shape[key], ctx, {
		...params,
		path: [
			...params.path,
			"properties",
			key
		]
	}));
	const requiredKeys = [];
	for (const key of Object.keys(shape)) {
		const field = def.shape[key];
		if (ctx.io === "input" ? inputOptin(field) === void 0 : field._zod.optout === void 0) requiredKeys.push(key);
	}
	if (requiredKeys.length > 0) json.required = requiredKeys;
	if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
	else if (!def.catchall) {
		if (ctx.io === "output") json.additionalProperties = false;
	} else if (def.catchall) json.additionalProperties = processSchema(def.catchall, ctx, {
		...params,
		path: [...params.path, "additionalProperties"]
	});
};
const unionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const isExclusive = def.inclusive === false;
	const options = def.options.map((x, i) => processSchema(x, ctx, {
		...params,
		path: [
			...params.path,
			isExclusive ? "oneOf" : "anyOf",
			i
		]
	}));
	if (isExclusive) json.oneOf = options;
	else json.anyOf = options;
};
const intersectionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const a = processSchema(def.left, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			0
		]
	});
	const b = processSchema(def.right, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			1
		]
	});
	const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
	const allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
	json.allOf = allOf;
	ctx.intersections.push(allOf);
};
/** JSON object keys are always strings, so a numeric record key schema is re-expressed over the
* numeric-string form the record parser matches. Deferred to `finalize`, after the flatten: a key
* behind a wrapper only carries its own `type` before then, and a union key only has its branches.
*
* A numeric bound cannot apply to a property name, so `minimum` and its siblings are dropped rather
* than carried over: keeping them beside `type: "string"` reproduces the match-nothing schema this
* exists to fix. A key that carries one therefore emits wider than the record parses — `z.record(z.number().min(5), V)`
* accepts `"3"` — which is the deliberate trade, since throwing on it would reject an ordinary schema
* outright. */
function stringifyKeyNames(bySchema, json, visited) {
	if (json.$ref) {
		if (visited.has(json)) return json;
		visited.add(json);
		const def = bySchema.get(json)?.def;
		if (!def) return json;
		const inlined = stringifyKeyNames(bySchema, def, visited);
		return inlined === def ? json : inlined;
	}
	for (const keyword of ["anyOf", "oneOf"]) {
		const branches = json[keyword];
		if (!Array.isArray(branches)) continue;
		const mapped = branches.map((branch) => stringifyKeyNames(bySchema, branch, visited));
		if (mapped.some((branch, i) => branch !== branches[i])) json = {
			...json,
			[keyword]: mapped
		};
	}
	const types = Array.isArray(json.type) ? json.type : [json.type];
	const numericType = !types.includes("string") && types.some((t) => t === "number" || t === "integer");
	const values = json.enum ?? (json.const !== void 0 ? [json.const] : void 0);
	if (!numericType && !values?.some((v) => typeof v === "number")) return json;
	const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, format, id, ...rest } = json;
	if (rest.enum) rest.enum = rest.enum.map((v) => typeof v === "number" ? String(v) : v);
	else if (typeof rest.const === "number") rest.const = String(rest.const);
	if (!numericType) return rest;
	rest.type = "string";
	if (!values) rest.pattern = (types.includes("number") ? number$1 : integer).source;
	return rest;
}
/** Every record of one conversion, so the carriers are found in a single pass rather than once per record. */
const pendingRecords = /* @__PURE__ */ new WeakMap();
function rewriteKeyNames(ctx) {
	const bySchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.values()) if (entry.def && !bySchema.has(entry.schema)) bySchema.set(entry.schema, entry);
	const rewrites = /* @__PURE__ */ new Map();
	for (const record of pendingRecords.get(ctx) ?? []) {
		const seen = ctx.seen.get(record);
		const names = (seen?.def ?? seen?.schema)?.propertyNames;
		if (!names || names === true || rewrites.has(names)) continue;
		const rewritten = stringifyKeyNames(bySchema, names, /* @__PURE__ */ new Set());
		if (rewritten !== names) rewrites.set(names, rewritten);
	}
	if (!rewrites.size) return;
	for (const entry of ctx.seen.values()) for (const carrier of [entry.schema, entry.def]) {
		const rewritten = carrier && rewrites.get(carrier.propertyNames);
		if (rewritten) carrier.propertyNames = rewritten;
	}
}
const recordProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	json.type = "object";
	const keyType = def.keyType;
	const patterns = aggregateChecks(keyType).patterns;
	if (def.mode === "loose" && patterns && patterns.size > 0) {
		const valueSchema = processSchema(def.valueType, ctx, {
			...params,
			path: [
				...params.path,
				"patternProperties",
				"*"
			]
		});
		json.patternProperties = {};
		for (const pattern of patterns) assignProp(json.patternProperties, exactPattern(pattern).source, valueSchema);
	} else {
		if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
			json.propertyNames = processSchema(def.keyType, ctx, {
				...params,
				path: [...params.path, "propertyNames"]
			});
			let pending = pendingRecords.get(ctx);
			if (!pending) {
				pending = [];
				pendingRecords.set(ctx, pending);
				ctx.deferred.push(() => rewriteKeyNames(ctx));
			}
			pending.push(schema);
		}
		json.additionalProperties = processSchema(def.valueType, ctx, {
			...params,
			path: [...params.path, "additionalProperties"]
		});
	}
	const keyValues = keyType._zod.values;
	const omittableOnInput = ctx.io === "input" && inputOptin(def.valueType) !== void 0;
	if (keyValues && !def.partial && !omittableOnInput) {
		const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
		if (validKeyValues.length > 0) json.required = validKeyValues.map(String);
	}
};
const nullableProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const inner = processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	if (ctx.target === "openapi-3.0") {
		seen.ref = def.innerType;
		json.nullable = true;
	} else json.anyOf = [inner, { type: "null" }];
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
/** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
* A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
* unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
const UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(value, schema, ctx, json, params) {
	let unrepresentable = false;
	const serialized = JSON.stringify(value, (_, val) => {
		if (typeof val !== "bigint") return val;
		unrepresentable = true;
		return null;
	});
	if (!unrepresentable) return JSON.parse(serialized);
	handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
	return UNREPRESENTABLE_DEFAULT;
}
const defaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
	if (value !== UNREPRESENTABLE_DEFAULT) json.default = value;
};
const prefaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	if (ctx.io !== "input") return;
	const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
	if (value !== UNREPRESENTABLE_DEFAULT) json._prefault = value;
};
const catchProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	let catchValue;
	try {
		catchValue = def.catchValue(void 0);
	} catch {
		handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	const inIsTransform = def.in._zod.traits.has("$ZodTransform");
	const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
	processSchema(innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.readOnly = true;
};
const optionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/errors.js
const _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function _lazyMethod(proto, key, make) {
	Object.defineProperty(proto, key, {
		configurable: true,
		enumerable: false,
		get() {
			const value = make(this);
			Object.defineProperty(this, key, {
				value,
				configurable: true,
				writable: true
			});
			return value;
		},
		set(value) {
			Object.defineProperty(this, key, {
				value,
				configurable: true,
				writable: true
			});
		}
	});
}
const initializer = (inst, issues) => {
	$ZodError.init(inst, issues);
	inst.name = "ZodError";
	const proto = Object.getPrototypeOf(inst);
	if (_installedErrorProtos.has(proto)) return;
	_installedErrorProtos.add(proto);
	_lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
	_lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
	_lazyMethod(proto, "addIssue", (self) => (issue) => {
		self.issues.push(issue);
		self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
	});
	_lazyMethod(proto, "addIssues", (self) => (issues) => {
		self.issues.push(...issues);
		self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
	});
	Object.defineProperty(proto, "isEmpty", {
		configurable: true,
		enumerable: false,
		get() {
			return this.issues.length === 0;
		}
	});
};
const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, void 0, { Parent: Error });
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/parse.js
const parse = /* @__PURE__ */ _parse(ZodRealError);
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
const encode = /* @__PURE__ */ _encode(ZodRealError);
const decode = /* @__PURE__ */ _decode(ZodRealError);
const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function _ensureDefaultLocale() {
	if (!globalConfig.localeError) config(en_default());
}
function _ensureDefaultMemoizer() {
	if (!globalConfig.memoizer) config({ memoizer: memoizer() });
}
const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
	_ensureDefaultLocale();
	$ZodType.init(inst, def);
	inst.def = def;
	inst.type = def.type;
	return inst;
}, {
	check(...chks) {
		const def = this.def;
		return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
			check: ch,
			def: { check: "custom" },
			onattach: []
		} } : ch)] }), { parent: true });
	},
	with(...chks) {
		return this.check(...chks);
	},
	clone(def, params) {
		return clone(this, def, params);
	},
	brand() {
		return this;
	},
	register(reg, meta) {
		reg.add(this, meta);
		return this;
	},
	refine(check, params) {
		return this.check(refine(check, params));
	},
	superRefine(refinement, params) {
		return this.check(superRefine(refinement, params));
	},
	overwrite(fn) {
		return this.check(/* @__PURE__ */ _overwrite(fn));
	},
	optional() {
		return optional(this);
	},
	exactOptional() {
		return exactOptional(this);
	},
	nullable() {
		return nullable(this);
	},
	nullish() {
		return optional(nullable(this));
	},
	nonoptional(params) {
		return nonoptional(this, params);
	},
	array() {
		return array(this);
	},
	or(arg) {
		return union([this, arg]);
	},
	and(arg) {
		return intersection(this, arg);
	},
	transform(tx) {
		return pipe(this, transform(tx));
	},
	default(d) {
		return _default(this, d);
	},
	prefault(d) {
		return prefault(this, d);
	},
	catch(params) {
		return _catch(this, params);
	},
	pipe(target) {
		return pipe(this, target);
	},
	readonly() {
		return readonly(this);
	},
	describe(description) {
		const cl = this.clone();
		globalRegistry.add(cl, { description });
		return cl;
	},
	meta(...args) {
		if (args.length === 0) return globalRegistry.get(this);
		const cl = this.clone();
		globalRegistry.add(cl, args[0]);
		return cl;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(fn, ...args) {
		return args.length === 0 ? fn(this) : fn(this, ...args);
	},
	get "~standard"() {
		return hide(this, "~standard", {
			...standardProps(this),
			jsonSchema: {
				input: createStandardJSONSchemaMethod(this, "input"),
				output: createStandardJSONSchemaMethod(this, "output")
			}
		});
	},
	set "~standard"(value) {
		own(this, "~standard", value);
	},
	parse: function _parse(data, params) {
		return parse(this, data, params, { callee: _parse });
	},
	parseAsync: async function _parseAsync(data, params) {
		return await parseAsync(this, data, params, { callee: _parseAsync });
	},
	safeParse(data, params) {
		return safeParse(this, data, params);
	},
	async safeParseAsync(data, params) {
		return safeParseAsync(this, data, params);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(value) {
		own(this, "spa", value);
	},
	validate(data, params) {
		return validate(this, data, params);
	},
	validateAsync(data, params) {
		return validateAsync$1(this, data, params);
	},
	encode: function _encode(data, params) {
		return encode(this, data, params, { callee: _encode });
	},
	decode: function _decode(data, params) {
		return decode(this, data, params, { callee: _decode });
	},
	encodeAsync: async function _encodeAsync(data, params) {
		return await encodeAsync(this, data, params, { callee: _encodeAsync });
	},
	decodeAsync: async function _decodeAsync(data, params) {
		return await decodeAsync(this, data, params, { callee: _decodeAsync });
	},
	safeEncode(data, params) {
		return safeEncode(this, data, params);
	},
	safeDecode(data, params) {
		return safeDecode(this, data, params);
	},
	async safeEncodeAsync(data, params) {
		return safeEncodeAsync(this, data, params);
	},
	async safeDecodeAsync(data, params) {
		return safeDecodeAsync(this, data, params);
	},
	toJSONSchema(params) {
		return createToJSONSchemaMethod(this, {})(params);
	},
	get description() {
		return globalRegistry.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
});
/** @internal */
const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
}, /*@__PURE__*/ derived({
	format: (inst) => aggregateChecks(inst).format ?? null,
	minLength: (inst) => aggregateChecks(inst).minimum ?? null,
	maxLength: (inst) => aggregateChecks(inst).maximum ?? null
}, {
	regex(...args) {
		return this.check(/* @__PURE__ */ _regex(...args));
	},
	includes(...args) {
		return this.check(/* @__PURE__ */ _includes(...args));
	},
	startsWith(...args) {
		return this.check(/* @__PURE__ */ _startsWith(...args));
	},
	endsWith(...args) {
		return this.check(/* @__PURE__ */ _endsWith(...args));
	},
	min(...args) {
		return this.check(/* @__PURE__ */ _minLength(...args));
	},
	max(...args) {
		return this.check(/* @__PURE__ */ _maxLength(...args));
	},
	length(...args) {
		return this.check(/* @__PURE__ */ _length(...args));
	},
	nonempty(...args) {
		return this.check(/* @__PURE__ */ _minLength(1, ...args));
	},
	lowercase(params) {
		return this.check(/* @__PURE__ */ _lowercase(params));
	},
	uppercase(params) {
		return this.check(/* @__PURE__ */ _uppercase(params));
	},
	trim() {
		return this.check(/* @__PURE__ */ _trim());
	},
	normalize(...args) {
		return this.check(/* @__PURE__ */ _normalize(...args));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ _toLowerCase());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ _toUpperCase());
	},
	slugify() {
		return this.check(/* @__PURE__ */ _slugify());
	}
}));
const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
}, {
	email(params) {
		return this.check(/* @__PURE__ */ _email(ZodEmail, params));
	},
	url(params) {
		return this.check(/* @__PURE__ */ _url(ZodURL, params));
	},
	jwt(params) {
		return this.check(/* @__PURE__ */ _jwt(ZodJWT, params));
	},
	emoji(params) {
		return this.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
	},
	guid(params) {
		return this.check(/* @__PURE__ */ _guid(ZodGUID, params));
	},
	uuid(params) {
		return this.check(/* @__PURE__ */ _uuid(ZodUUID, params));
	},
	uuidv4(params) {
		return this.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
	},
	uuidv6(params) {
		return this.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
	},
	uuidv7(params) {
		return this.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
	},
	nanoid(params) {
		return this.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
	},
	cuid(params) {
		return this.check(/* @__PURE__ */ _cuid(ZodCUID, params));
	},
	cuid2(params) {
		return this.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
	},
	ulid(params) {
		return this.check(/* @__PURE__ */ _ulid(ZodULID, params));
	},
	base64(params) {
		return this.check(/* @__PURE__ */ _base64(ZodBase64, params));
	},
	base64url(params) {
		return this.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
	},
	xid(params) {
		return this.check(/* @__PURE__ */ _xid(ZodXID, params));
	},
	ksuid(params) {
		return this.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
	},
	ipv4(params) {
		return this.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
	},
	ipv6(params) {
		return this.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
	},
	cidrv4(params) {
		return this.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
	},
	cidrv6(params) {
		return this.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
	},
	e164(params) {
		return this.check(/* @__PURE__ */ _e164(ZodE164, params));
	},
	datetime(params) {
		return this.check(/* @__PURE__ */ _isoDateTime(ZodISODateTime, params));
	},
	date(params) {
		return this.check(/* @__PURE__ */ _isoDate(ZodISODate, params));
	},
	time(params) {
		return this.check(/* @__PURE__ */ _isoTime(ZodISOTime, params));
	},
	duration(params) {
		return this.check(/* @__PURE__ */ _isoDuration(ZodISODuration, params));
	}
});
function string(params) {
	return /* @__PURE__ */ _string(ZodString, params);
}
const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
	$ZodNumber.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
	inst.isFinite = true;
}, /*@__PURE__*/ derived({
	minValue: (inst) => {
		const { minimum, exclusiveMinimum } = aggregateChecks(inst);
		return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
	},
	maxValue: (inst) => {
		const { maximum, exclusiveMaximum } = aggregateChecks(inst);
		return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
	},
	isInt: (inst) => {
		const { isInt, multipleOf } = aggregateChecks(inst);
		return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
	},
	format: (inst) => aggregateChecks(inst).format ?? null
}, {
	gt(value, params) {
		return this.check(/* @__PURE__ */ _gt(value, params));
	},
	gte(value, params) {
		return this.check(/* @__PURE__ */ _gte(value, params));
	},
	min(value, params) {
		return this.check(/* @__PURE__ */ _gte(value, params));
	},
	lt(value, params) {
		return this.check(/* @__PURE__ */ _lt(value, params));
	},
	lte(value, params) {
		return this.check(/* @__PURE__ */ _lte(value, params));
	},
	max(value, params) {
		return this.check(/* @__PURE__ */ _lte(value, params));
	},
	int(params) {
		return this.check(int(params));
	},
	safe(params) {
		return this.check(int(params));
	},
	positive(params) {
		return this.check(/* @__PURE__ */ _gt(0, params));
	},
	nonnegative(params) {
		return this.check(/* @__PURE__ */ _gte(0, params));
	},
	negative(params) {
		return this.check(/* @__PURE__ */ _lt(0, params));
	},
	nonpositive(params) {
		return this.check(/* @__PURE__ */ _lte(0, params));
	},
	multipleOf(value, params) {
		return this.check(/* @__PURE__ */ _multipleOf(value, params));
	},
	step(value, params) {
		return this.check(/* @__PURE__ */ _multipleOf(value, params));
	},
	finite() {
		return this;
	}
}));
function number(params) {
	return /* @__PURE__ */ _number(ZodNumber, params);
}
const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
	$ZodNumberFormat.init(inst, def);
	ZodNumber.init(inst, def);
});
function int(params) {
	return /* @__PURE__ */ _int(ZodNumberFormat, params);
}
const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
	$ZodBoolean.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean(params) {
	return /* @__PURE__ */ _boolean(ZodBoolean, params);
}
const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => void 0;
});
function unknown() {
	return /* @__PURE__ */ _unknown(ZodUnknown);
}
const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
	return /* @__PURE__ */ _never(ZodNever, params);
}
const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
	inst.element = def.element;
}, {
	min(n, params) {
		return this.check(/* @__PURE__ */ _minLength(n, params));
	},
	nonempty(params) {
		return this.check(/* @__PURE__ */ _minLength(1, params));
	},
	max(n, params) {
		return this.check(/* @__PURE__ */ _maxLength(n, params));
	},
	length(n, params) {
		return this.check(/* @__PURE__ */ _length(n, params));
	},
	unwrap() {
		return this.element;
	}
});
function array(element, params) {
	return /* @__PURE__ */ _array(ZodArray, element, params);
}
const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodObjectJIT.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
	installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
}, {
	keyof() {
		return _enum(Object.keys(this._zod.def.shape));
	},
	catchall(catchall) {
		return this.clone(mergeDefs(this._zod.def, { catchall }));
	},
	passthrough() {
		return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
	},
	loose() {
		return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
	},
	strict() {
		return this.clone(mergeDefs(this._zod.def, { catchall: never() }));
	},
	strip() {
		return this.clone(mergeDefs(this._zod.def, { catchall: void 0 }));
	},
	extend(incoming) {
		return extend(this, incoming);
	},
	safeExtend(incoming) {
		return safeExtend(this, incoming);
	},
	merge(other) {
		return merge(this, other);
	},
	pick(mask) {
		return pick(this, mask);
	},
	omit(mask) {
		return omit(this, mask);
	},
	partial(...args) {
		return partial(ZodOptional, this, args[0]);
	},
	exactPartial(...args) {
		return partial(ZodExactOptional, this, args[0], "exactPartial");
	},
	required(...args) {
		return required(ZodNonOptional, this, args[0]);
	}
});
function object(shape, params) {
	const def = {
		type: "object",
		shape: shape ?? {},
		...normalizeParams(params)
	};
	return new ZodObject(def);
}
function looseObject(shape, params) {
	return new ZodObject({
		type: "object",
		shape,
		catchall: unknown(),
		...normalizeParams(params)
	});
}
const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
const ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("ZodDiscriminatedUnion", (inst, def) => {
	ZodUnion.init(inst, def);
	$ZodDiscriminatedUnion.init(inst, def);
});
function discriminatedUnion(discriminator, options, params) {
	return new ZodDiscriminatedUnion({
		type: "union",
		options,
		discriminator,
		...normalizeParams(params)
	});
}
const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodRecord.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
	inst.keyType = def.keyType;
	inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
	if (!valueType || !valueType._zod) return new ZodRecord({
		type: "record",
		keyType: string(),
		valueType: keyType,
		...normalizeParams(valueType)
	});
	return new ZodRecord({
		type: "record",
		keyType,
		valueType,
		...normalizeParams(params)
	});
}
const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
	inst.enum = def.entries;
	inst.options = [...inst._zod.values];
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
	return new ZodEnum({
		type: "enum",
		entries,
		...normalizeParams(params)
	});
}
const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
	$ZodLiteral.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
	inst.values = new Set(def.values);
	Object.defineProperty(inst, "value", { get() {
		if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return def.values[0];
	} });
});
function literal(value, params) {
	return new ZodLiteral({
		type: "literal",
		values: Array.isArray(value) ? value : [value],
		...normalizeParams(params)
	});
}
const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
	inst._zod.parse = (payload, _ctx) => {
		if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				if (!("input" in _issue)) _issue.input = payload.value;
				_issue.inst ?? (_issue.inst = inst);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			return payload;
		});
		payload.value = output;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
	$ZodExactOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
	return new ZodExactOptional({
		type: "optional",
		innerType
	});
}
const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : constantCatch(catchValue)
	});
}
const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
	return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
	return /* @__PURE__ */ _superRefine(fn, params);
}
//#endregion
//#region src/core/schemas.ts
/**
* @dsh-stats/core — zod schemas and their inferred types.
*
* Every sample persisted to `samples.jsonl` is a member of the
* {@link Sample} discriminated union (`kind` field). Raw event payloads from
* the Harness are validated at the boundary with `safeParse` — nothing
* unvalidated ever reaches the sampling math. Zero `any` by policy.
*/
/** Non-negative integer token / character counts. */
const count$1 = number().int().min(0);
/** Milliseconds; negative durations are clamped to 0 downstream, never stored. */
const millis = number().min(0);
/**
* Compact text/reasoning chunk run: first delta absolute time in `time0`,
* per-delta gaps in `dt`, payload in `texts`. Raw `chunk` records carry
* `time` directly. `passthrough` keeps forward-compat with new record kinds
* the Harness may add: unknown records are ignored by the math, not dropped.
*/
const StreamRecordSchema = union([
	looseObject({
		type: literal("text-chunks"),
		time0: number(),
		dt: array(number()).default([]),
		texts: array(string()).default([])
	}),
	looseObject({
		type: literal("reasoning-chunks"),
		time0: number(),
		dt: array(number()).default([]),
		texts: array(string()).default([])
	}),
	looseObject({
		type: literal("chunk"),
		time: number(),
		chunk: looseObject({
			type: string(),
			text: string().optional()
		}).optional()
	}),
	looseObject({ type: string() })
]);
/**
* Strict per-kind schemas for the sampling math. The boundary
* {@link StreamRecordSchema} must accept unknown future record kinds (so
* parsing never breaks), which pollutes the union for narrowing; these
* strict schemas are applied via `safeParse` as combined runtime
* validation + type guards, so the math only ever sees exact shapes.
*/
const TextChunksSchema = object({
	type: literal("text-chunks"),
	time0: number(),
	dt: array(unknown()).default([]),
	texts: array(string()).default([])
});
const ReasoningChunksSchema = object({
	type: literal("reasoning-chunks"),
	time0: number(),
	dt: array(unknown()).default([]),
	texts: array(string()).default([])
});
const RawChunkSchema = object({
	type: literal("chunk"),
	time: number(),
	chunk: object({
		type: string(),
		text: string().optional()
	}).optional()
});
/** Provider-reported token usage block on an assistant message. */
const UsageSchema = looseObject({
	inputTokens: count$1.optional(),
	outputTokens: count$1.optional(),
	reasoningTokens: count$1.optional(),
	cacheReadTokens: count$1.optional(),
	cacheWriteTokens: count$1.optional()
});
/** `source` block identifying a model-authored message. */
const MessageSourceSchema = looseObject({
	kind: string(),
	provider: string().nullable().optional(),
	model: string().nullable().optional()
});
/** Any persisted row. */
const SampleSchema = discriminatedUnion("kind", [
	looseObject({
		kind: literal("step"),
		time: number(),
		provider: string().nullable(),
		model: string().nullable(),
		turn: number().nullable(),
		step: number().nullable(),
		ttftMs: number().nullable(),
		decodeMs: millis,
		outputTokens: count$1.nullable(),
		inputTokens: count$1.nullable(),
		reasoningTokens: count$1.nullable(),
		textChars: count$1,
		reasoningChars: count$1,
		tps: number().nullable(),
		unmeasurable: literal(true).optional(),
		costUsd: number().nullable(),
		costSource: string().nullable(),
		interrupted: boolean(),
		sessionId: string().optional()
	}),
	looseObject({
		kind: literal("tool"),
		time: number(),
		tool: string(),
		durationMs: millis,
		ok: boolean(),
		errorKind: string().nullable(),
		sessionId: string().optional()
	}),
	looseObject({
		kind: union([literal("session-join"), literal("session-leave")]),
		time: number(),
		sessionId: string()
	})
]);
/** Parse one JSONL line; `null` means "skip this row" (caller counts it). */
function parseSampleLine(line) {
	let parsed;
	try {
		parsed = JSON.parse(line);
	} catch {
		return null;
	}
	const result = SampleSchema.safeParse(parsed);
	return result.success ? result.data : null;
}
/** Validated plugin settings. Every field optional at the boundary. */
const ConfigSchema = object({
	/** File size cap in bytes; oldest lines rotate out. 0 disables. */
	maxFileBytes: number().int().min(0).default(5242880),
	/** Sample age cap in days; older lines are swept periodically. 0 disables. */
	maxAgeDays: number().min(0).default(30),
	/** Minimum ms between recorded step samples; 0 records every step. */
	sampleMinIntervalMs: number().int().min(0).default(0),
	/** How often the age sweep runs, in minutes. */
	sweepIntervalMinutes: number().int().min(1).default(60),
	/** Ceiling on a credible decode rate; faster readings are `unmeasurable`. */
	maxPlausibleTps: number().int().min(1).default(500),
	/** Write sessionId into each sample; disable on shared data directories. */
	includeSessionIds: boolean().default(true),
	/** Directory for samples.jsonl; empty uses `<dsh home>/stats`. Reload to change. */
	dataDir: string().default(""),
	/** Custom model pricing overrides, keyed by model id (case-insensitive). */
	customPricing: record(string(), number().min(0)).default({}),
	/** Currency display only; costs are always computed in USD. */
	currency: string().default("USD")
});
/** Summary payload served at `/dsh-stats/summary.json` and drawn by the panel. */
const ModelSummarySchema = object({
	model: string(),
	provider: string().nullable(),
	steps: number().int().min(0),
	inputTokens: number().int().min(0),
	outputTokens: number().int().min(0),
	reasoningTokens: number().int().min(0),
	costUsd: number().nullable(),
	unpricedSteps: number().int().min(0),
	busyMs: millis,
	tpsN: number().int().min(0),
	tpsMean: number().nullable(),
	tpsMedian: number().nullable(),
	tpsQ1: number().nullable(),
	tpsQ3: number().nullable(),
	tpsMin: number().nullable(),
	tpsMax: number().nullable(),
	tpsP10: number().nullable(),
	tpsP90: number().nullable(),
	medOutputTokens: number().nullable(),
	medThinkShare: number().nullable(),
	thinkShareEstimated: boolean(),
	medOutIn: number().nullable()
});
const ToolSummarySchema = object({
	tool: string(),
	calls: number().int().min(0),
	ok: number().int().min(0),
	err: number().int().min(0),
	errRate: number().nullable(),
	meanMs: number().nullable(),
	p50Ms: number().nullable()
});
object({
	samples: number().int().min(0),
	skippedLines: number().int().min(0),
	measurable: number().int().min(0),
	unmeasurable: number().int().min(0),
	oldest: number().nullable(),
	newest: number().nullable(),
	fileBytes: number().int().min(0),
	retention: object({
		maxFileBytes: number().int().min(0),
		maxAgeDays: number().min(0),
		sampleMinIntervalMs: number().int().min(0),
		maxPlausibleTps: number().int().min(1)
	}),
	pricing: object({
		source: string(),
		version: string(),
		updatedAt: string(),
		unknownModels: array(string())
	}),
	models: array(ModelSummarySchema),
	tools: array(ToolSummarySchema),
	activity: object({
		sessions: number().int().min(0),
		steps: number().int().min(0),
		toolCalls: number().int().min(0),
		byHour: array(number().int().min(0)).length(24)
	})
});
/**
* Fold one compact attempt stream into its first- and last-chunk times.
* Run records (`text-chunks` and kin) store the first delta's absolute time
* in `time0` and per-delta gaps in `dt`; raw `chunk` records carry `time`.
* Each record is validated with a strict schema first: the boundary union
* accepts unknown future kinds, and `safeParse` doubles as the type guard
* that gives the math exact shapes. Returns `null` for an empty stream.
*/
function streamWindow(stream) {
	let firstTime;
	let lastTime;
	for (const record of stream) {
		const text = TextChunksSchema.safeParse(record);
		if (text.success) {
			const start = text.data.time0;
			if (!Number.isFinite(start)) continue;
			let end = start;
			for (const gap of text.data.dt) if (typeof gap === "number" && Number.isFinite(gap)) end += gap;
			firstTime = firstTime === void 0 ? start : Math.min(firstTime, start);
			lastTime = lastTime === void 0 ? end : Math.max(lastTime, end);
			continue;
		}
		const reasoning = ReasoningChunksSchema.safeParse(record);
		if (reasoning.success) {
			const start = reasoning.data.time0;
			if (!Number.isFinite(start)) continue;
			let end = start;
			for (const gap of reasoning.data.dt) if (typeof gap === "number" && Number.isFinite(gap)) end += gap;
			firstTime = firstTime === void 0 ? start : Math.min(firstTime, start);
			lastTime = lastTime === void 0 ? end : Math.max(lastTime, end);
			continue;
		}
		const raw = RawChunkSchema.safeParse(record);
		if (raw.success) {
			const start = raw.data.time;
			if (!Number.isFinite(start)) continue;
			firstTime = firstTime === void 0 ? start : Math.min(firstTime, start);
			lastTime = lastTime === void 0 ? start : Math.max(lastTime, start);
		}
	}
	if (firstTime === void 0 || lastTime === void 0) return null;
	return {
		firstTime,
		lastTime
	};
}
/**
* Total visible-answer and thinking characters over the compact stream.
* Providers that never report `reasoningTokens` still stream
* `reasoning-chunks`, so character counts are the portable fallback for the
* verbosity view; `text-chunks` covers the reply the user actually reads.
*/
function streamTextShares(stream) {
	let textChars = 0;
	let reasoningChars = 0;
	for (const record of stream) {
		const text = TextChunksSchema.safeParse(record);
		if (text.success) {
			for (const piece of text.data.texts) textChars += piece.length;
			continue;
		}
		const reasoning = ReasoningChunksSchema.safeParse(record);
		if (reasoning.success) {
			for (const piece of reasoning.data.texts) reasoningChars += piece.length;
			continue;
		}
		const raw = RawChunkSchema.safeParse(record);
		if (raw.success) {
			const chunk = raw.data.chunk;
			if (chunk?.type === "text-delta" && typeof chunk.text === "string") textChars += chunk.text.length;
			else if (chunk?.type === "reasoning-delta" && typeof chunk.text === "string") reasoningChars += chunk.text.length;
		}
	}
	return {
		textChars,
		reasoningChars
	};
}
/**
* Re-derive one reading's reportable rate under the measurability rule:
* a window shorter than `minDecodeMs` reflects delivery granularity, and a
* rate above `maxPlausibleTps` means the provider delivered the completion in
* one burst rather than a stream. Returns `null` when unmeasurable.
*/
function measuredTps(outputTokens, decodeMs, options) {
	if (outputTokens === null || decodeMs <= 0) return null;
	const rate = outputTokens / (decodeMs / 1e3);
	if (decodeMs < (options.minDecodeMs ?? 250) || rate > options.maxPlausibleTps) return null;
	return Number(rate.toFixed(2));
}
/**
* Derive one step sample from an assistant/message event.
* Only model-sourced messages sample (`null` otherwise); steps without
* usage still record their timing with a `null` tps so the data distinguishes
* "no usage" from "never streamed".
*/
function sampleOf(input) {
	const { source, stream, usage } = input;
	if (source?.kind !== "model") return null;
	const window = streamWindow(stream);
	if (window === null) return null;
	const outputTokens = usage?.outputTokens ?? null;
	const decodeMs = Math.max(0, window.lastTime - window.firstTime);
	const tps = outputTokens === null ? null : measuredTps(outputTokens, decodeMs, { maxPlausibleTps: input.config.maxPlausibleTps });
	const measurable = tps !== null;
	const rate = outputTokens !== null && decodeMs > 0 ? outputTokens / (decodeMs / 1e3) : null;
	const shares = streamTextShares(stream);
	const sample = {
		kind: "step",
		time: input.eventTime,
		provider: source.provider ?? null,
		model: source.model ?? null,
		turn: input.turn,
		step: input.step,
		ttftMs: input.stepStartTime === void 0 ? null : Math.max(0, window.firstTime - input.stepStartTime),
		decodeMs,
		outputTokens,
		inputTokens: usage?.inputTokens ?? null,
		reasoningTokens: usage?.reasoningTokens ?? null,
		textChars: shares.textChars,
		reasoningChars: shares.reasoningChars,
		tps,
		costUsd: null,
		costSource: null,
		interrupted: input.interrupted
	};
	if (rate !== null && !measurable) sample.unmeasurable = true;
	if (input.config.includeSessionIds) sample.sessionId = input.sessionId;
	return sample;
}
//#endregion
//#region src/core/store.ts
/**
* @dsh-stats/core — serialized JSONL file store.
*
* Appends, rotations, and sweeps are chained through a promise queue so
* concurrent async batches cannot interleave reads and writes. Retention is
* bounded two ways, whichever hits first: file size (oldest lines dropped
* down to 75% of the cap) and sample age (periodic sweep).
*/
/** After a size rotation, trim to this fraction of the cap so rewrites stay rare. */
const ROTATE_TARGET_FRACTION = .75;
async function parseBody(body) {
	return { lines: body.split("\n").filter((line) => line.trim() !== "") };
}
function ageCutoff(maxAgeDays) {
	if (maxAgeDays <= 0) return null;
	return Date.now() - maxAgeDays * 864e5;
}
function keepIfFresh(lines, cutoff, parseLine) {
	if (cutoff === null) return lines;
	return lines.filter((line) => {
		const sample = parseLine(line);
		if (sample === null) return true;
		return sample.time >= cutoff;
	});
}
function createFileStore(file) {
	return createJsonlStore(file, parseSampleLine);
}
function createJsonlStore(file, parseLine) {
	let tail = Promise.resolve();
	let currentBytes = 0;
	const enqueue = (operation) => {
		const next = tail.then(operation, operation);
		tail = next.catch(() => void 0);
		return next;
	};
	/** Rewrite the file keeping only `lines`, atomically, refreshing the counter. */
	const rewrite = async (lines) => {
		const body = lines.length > 0 ? `${lines.join("\n")}\n` : "";
		const temp = `${file}.tmp`;
		await writeFile(temp, body, "utf8");
		await rename(temp, file);
		currentBytes = Buffer.byteLength(body);
	};
	/** Load the file (if any) and drop samples older than the age cap. */
	const initialize = async (options) => {
		let body = "";
		try {
			body = await readFile(file, "utf8");
		} catch {
			currentBytes = 0;
			return;
		}
		const { lines } = await parseBody(body);
		const kept = keepIfFresh(lines, ageCutoff(options.maxAgeDays), parseLine);
		if (kept.length === lines.length) {
			currentBytes = Buffer.byteLength(body);
			return;
		}
		await rewrite(kept);
	};
	/** Append one sample, rotating first when the size cap demands it. */
	const append = async (sample, options) => {
		const line = `${JSON.stringify(sample)}\n`;
		const lineBytes = Buffer.byteLength(line);
		if (options.maxFileBytes > 0 && currentBytes + lineBytes > options.maxFileBytes) {
			const { lines } = await parseBody(await readFile(file, "utf8").catch(() => ""));
			const target = Math.max(0, Math.floor(options.maxFileBytes * ROTATE_TARGET_FRACTION));
			const kept = [];
			let keptBytes = 0;
			for (let index = lines.length - 1; index >= 0; index -= 1) {
				const candidate = lines[index];
				if (candidate === void 0) continue;
				const size = Buffer.byteLength(candidate) + 1;
				if (keptBytes + size > target) break;
				kept.unshift(candidate);
				keptBytes += size;
			}
			await rewrite([...kept, line.trimEnd()]);
			return;
		}
		try {
			await appendFile(file, line, "utf8");
		} catch (error) {
			if (error?.code !== "ENOENT") throw error;
			await mkdir(dirname(file), { recursive: true });
			await appendFile(file, line, "utf8");
		}
		currentBytes += lineBytes;
	};
	/** Sweep samples older than the age cap, then enforce the size cap. */
	const sweep = async (options) => {
		let body = "";
		try {
			body = await readFile(file, "utf8");
		} catch {
			return;
		}
		const { lines } = await parseBody(body);
		const before = lines.length;
		let kept = keepIfFresh(lines, ageCutoff(options.maxAgeDays), parseLine);
		if (options.maxFileBytes > 0) {
			let total = kept.reduce((acc, line) => acc + Buffer.byteLength(line) + 1, 0);
			const target = Math.floor(options.maxFileBytes * ROTATE_TARGET_FRACTION);
			while (total > target && kept.length > 0) {
				const dropped = kept.shift();
				if (dropped !== void 0) total -= Buffer.byteLength(dropped) + 1;
			}
		}
		const expectedBytes = kept.reduce((acc, line) => acc + Buffer.byteLength(line) + 1, 0);
		if (kept.length !== before || Buffer.byteLength(body) !== expectedBytes) await rewrite(kept);
	};
	const readAll = async () => readFile(file, "utf8").catch(() => "");
	const readParsed = async () => {
		const { lines } = await parseBody(await readAll());
		const samples = [];
		let skippedLines = 0;
		for (const line of lines) {
			const sample = parseLine(line);
			if (sample === null) skippedLines += 1;
			else samples.push(sample);
		}
		return {
			samples,
			skippedLines
		};
	};
	const fileSize = async () => {
		try {
			return (await stat(file)).size;
		} catch {
			return 0;
		}
	};
	return {
		enqueue,
		initialize,
		append,
		sweep,
		readAll,
		readParsed,
		fileSize
	};
}
//#endregion
//#region src/core/csv.ts
const CSV_HEADER = "time_iso,kind,model,provider,turn,step,ttft_ms,decode_ms,output_tokens,input_tokens,reasoning_tokens,text_chars,reasoning_chars,tps,cost_usd,interrupted,session_id";
function cell(value) {
	return value.includes(",") || value.includes("\"") || value.includes("\n") ? `"${value.replaceAll("\"", "\"\"")}"` : value;
}
function toCsvRow(sample) {
	return [
		new Date(sample.time).toISOString(),
		"step",
		sample.model ?? "",
		sample.provider ?? "",
		sample.turn === null ? "" : String(sample.turn),
		sample.step === null ? "" : String(sample.step),
		sample.ttftMs === null ? "" : String(Math.round(sample.ttftMs)),
		String(Math.round(sample.decodeMs)),
		sample.outputTokens === null ? "" : String(sample.outputTokens),
		sample.inputTokens === null ? "" : String(sample.inputTokens),
		sample.reasoningTokens === null ? "" : String(sample.reasoningTokens),
		String(sample.textChars),
		String(sample.reasoningChars),
		sample.tps === null ? "" : sample.tps.toFixed(2),
		sample.costUsd === null ? "" : String(sample.costUsd),
		sample.interrupted ? "true" : "false",
		sample.sessionId ?? ""
	].map(cell).join(",");
}
//#endregion
//#region src/core/request-speed.ts
const SPEED_WINDOWS = [
	1,
	12,
	24
];
const count = number().int().nonnegative();
const duration = number().nonnegative().nullable();
const RequestSpeedSampleSchema = object({
	time: number(),
	provider: string(),
	model: string(),
	ttftMs: duration,
	generationMs: duration,
	outputTokens: count.nullable()
});
function parseRequestSpeedLine(line) {
	try {
		const parsed = RequestSpeedSampleSchema.safeParse(JSON.parse(line));
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}
const SpeedRowSchema = object({
	provider: string(),
	model: string(),
	requests: count,
	outputTokens: count.nullable(),
	ttftSamples: count,
	tpsSamples: count,
	ttftMs: duration,
	generationTps: duration,
	endToEndTps: duration
});
object({
	asOf: number(),
	rows: array(SpeedRowSchema)
});
/** Same sampling and ratio-of-sums convention as xingleirouter's model table. */
function summarizeSpeed(samples, hours, asOf) {
	const from = asOf - hours * 36e5;
	const buckets = /* @__PURE__ */ new Map();
	for (const { time, provider, model, ttftMs, generationMs, outputTokens } of samples) {
		if (time < from || time > asOf) continue;
		const key = JSON.stringify([provider, model]);
		let bucket = buckets.get(key);
		if (bucket === void 0) {
			bucket = {
				row: {
					provider,
					model,
					requests: 0,
					outputTokens: null,
					ttftSamples: 0,
					tpsSamples: 0,
					ttftMs: null,
					generationTps: null,
					endToEndTps: null
				},
				ttftMs: 0,
				generationMs: 0,
				endToEndMs: 0,
				timedOutputTokens: 0
			};
			buckets.set(key, bucket);
		}
		const { row } = bucket;
		row.requests++;
		if (outputTokens !== null) row.outputTokens = (row.outputTokens ?? 0) + outputTokens;
		if (ttftMs !== null) {
			row.ttftSamples++;
			bucket.ttftMs += ttftMs;
		}
		if (ttftMs !== null && generationMs !== null && generationMs > 0 && outputTokens !== null) {
			row.tpsSamples++;
			bucket.timedOutputTokens += outputTokens;
			bucket.generationMs += generationMs;
			bucket.endToEndMs += ttftMs + generationMs;
		}
	}
	return {
		asOf,
		rows: [...buckets.values()].map(({ row, ttftMs, timedOutputTokens, generationMs, endToEndMs }) => ({
			...row,
			ttftMs: row.ttftSamples === 0 ? null : ttftMs / row.ttftSamples,
			generationTps: row.tpsSamples === 0 ? null : timedOutputTokens * 1e3 / generationMs,
			endToEndTps: row.tpsSamples === 0 ? null : timedOutputTokens * 1e3 / endToEndMs
		}))
	};
}
//#endregion
//#region src/pricing/data/pricing.json
var pricing_default = {
	source: "models.dev",
	version: "api-2026-10-03",
	updatedAt: "2026-10-03T05:33:04.101Z",
	providers: {
		"deepinfra": {
			"tencent/Hy3": {
				"input": .13,
				"output": .53,
				"cacheRead": .033
			},
			"tencent/Hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"meta-llama/Llama-3.3-70B-Instruct-Turbo": {
				"input": .1,
				"output": .32
			},
			"meta-llama/Llama-4-Scout-17B-16E-Instruct": {
				"input": .1,
				"output": .3
			},
			"meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8": {
				"input": .2,
				"output": .8
			},
			"XiaomiMiMo/MiMo-V2.6-Pro": {
				"input": .43,
				"output": .87,
				"cacheRead": .0036
			},
			"XiaomiMiMo/MiMo-V2.5-Pro": {
				"input": 1,
				"output": 3,
				"cacheRead": .2
			},
			"XiaomiMiMo/MiMo-V2.6-Flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"XiaomiMiMo/MiMo-V2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"thinkingmachines/Inkling-Small": {
				"input": .45,
				"output": 1.2,
				"cacheRead": .1
			},
			"thinkingmachines/Inkling": {
				"input": .95,
				"output": 4.05,
				"cacheRead": .16
			},
			"google/gemma-3-27b-it": {
				"input": .08,
				"output": .16
			},
			"google/gemma-3-12b-it": {
				"input": .05,
				"output": .15
			},
			"google/gemma-3-4b-it": {
				"input": .05,
				"output": .1
			},
			"google/gemma-4-31B-it": {
				"input": .15,
				"output": .4
			},
			"google/gemma-4-26B-A4B-it": {
				"input": .07,
				"output": .34
			},
			"google/gemma-4-E4B-it": {
				"input": .02,
				"output": .1
			},
			"Qwen/Qwen3-VL-235B-A22B-Instruct": {
				"input": .2,
				"output": .88,
				"cacheRead": .11
			},
			"Qwen/Qwen3.8-27B": {
				"input": .2,
				"output": 2.5,
				"cacheRead": .05
			},
			"Qwen/Qwen3-Next-80B-A3B-Instruct": {
				"input": .09,
				"output": 1.1
			},
			"Qwen/Qwen3.7-Max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5
			},
			"Qwen/Qwen3.8-Max": {
				"input": 1.65,
				"output": 4.951,
				"cacheRead": .206
			},
			"Qwen/Qwen3.5-27B": {
				"input": .26,
				"output": 2.6
			},
			"Qwen/Qwen3.6-35B-A3B": {
				"input": .1,
				"output": .95,
				"cacheRead": .1
			},
			"Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo": {
				"input": .3,
				"output": 1,
				"cacheRead": .1
			},
			"Qwen/Qwen3-Max": {
				"input": 1.2,
				"output": 6,
				"cacheRead": .24
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": .09,
				"output": .55
			},
			"Qwen/Qwen3.8-Flash": {
				"input": .113,
				"output": .382,
				"cacheRead": .0141
			},
			"Qwen/Qwen3-32B": {
				"input": .08,
				"output": .28
			},
			"Qwen/Qwen3.5-35B-A3B": {
				"input": .14,
				"output": 1,
				"cacheRead": .05
			},
			"Qwen/Qwen3.5-122B-A10B": {
				"input": .29,
				"output": 2.4
			},
			"Qwen/Qwen3.5-9B": {
				"input": .1,
				"output": .15
			},
			"Qwen/Qwen3.5-397B-A17B": {
				"input": .45,
				"output": 3,
				"cacheRead": .22
			},
			"Qwen/Qwen3.8-2.4T-A95B": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"Qwen/Qwen3-30B-A3B": {
				"input": .12,
				"output": .5
			},
			"Qwen/Qwen3.6-27B": {
				"input": .32,
				"output": 3.2
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .25,
				"output": .95,
				"cacheRead": .13
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .06,
				"output": .18,
				"cacheRead": .015
			},
			"deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.3,
				"output": 2.6,
				"cacheRead": .1
			},
			"deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .2,
				"output": .6,
				"cacheRead": .006
			},
			"deepseek-ai/DeepSeek-V4-Flash": {
				"input": .09,
				"output": .18,
				"cacheRead": .018
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": 1.3,
				"output": 2.6,
				"cacheRead": .1
			},
			"deepseek-ai/DeepSeek-V3.2": {
				"input": .26,
				"output": .38,
				"cacheRead": .13
			},
			"deepseek-ai/DeepSeek-R1-0528": {
				"input": .5,
				"output": 2.15,
				"cacheRead": .35
			},
			"deepseek-ai/DeepSeek-V3": {
				"input": .32,
				"output": .89
			},
			"deepseek-ai/DeepSeek-V3-0324": {
				"input": .24,
				"output": .9,
				"cacheRead": .135
			},
			"deepseek-ai/DeepSeek-V4-Flash-Vision-Exp": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .014
			},
			"stepfun-ai/Step-3.7-Flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .28,
				"output": 1.1,
				"cacheRead": .056
			},
			"MiniMaxAI/MiniMax-M2.5": {
				"input": .15,
				"output": 1.15,
				"cacheRead": .03
			},
			"MiniMaxAI/MiniMax-M2.7": {
				"input": .25,
				"output": 1,
				"cacheRead": .05
			},
			"moonshotai/Kimi-K2.6": {
				"input": .75,
				"output": 3.5,
				"cacheRead": .15
			},
			"moonshotai/Kimi-K3": {
				"input": 2.85,
				"output": 14.25,
				"cacheRead": .285
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .68,
				"output": 3.4,
				"cacheRead": .136
			},
			"moonshotai/Kimi-K2.5": {
				"input": .45,
				"output": 2.25,
				"cacheRead": .07
			},
			"zai-org/GLM-5.1": {
				"input": 1.05,
				"output": 3.5,
				"cacheRead": .205
			},
			"zai-org/GLM-5.2": {
				"input": .75,
				"output": 2.4,
				"cacheRead": .14
			},
			"zai-org/GLM-4.7": {
				"input": .4,
				"output": 1.75,
				"cacheRead": .08
			},
			"zai-org/GLM-5": {
				"input": .6,
				"output": 2.08,
				"cacheRead": .12
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"zai-org/GLM-4.6": {
				"input": .5,
				"output": 2,
				"cacheRead": .1
			},
			"zai-org/GLM-4.7-Flash": {
				"input": .06,
				"output": .4,
				"cacheRead": .01
			},
			"zai-org/GLM-5.3": {
				"input": .9,
				"output": 4,
				"cacheRead": .2
			},
			"nvidia/Nemotron-3-Nano-30B-A3B": {
				"input": .05,
				"output": .2,
				"cacheRead": .025
			},
			"nvidia/Llama-3.3-Nemotron-Super-49B-v1.5": {
				"input": .4,
				"output": .4
			},
			"nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning": {
				"input": .2,
				"output": .8
			},
			"ByteDance/Seed-2.0-code": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"ByteDance/Seed-2.0-pro": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"ByteDance/Seed-2.0-mini": {
				"input": .1,
				"output": .4,
				"cacheRead": .02
			},
			"openai/gpt-oss-20b": {
				"input": .03,
				"output": .14
			},
			"openai/gpt-oss-120b": {
				"input": .037,
				"output": .17
			}
		},
		"perplexity-agent": {
			"anthropic/claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1
			},
			"anthropic/claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"deepseek/deepseek-v4-flash-0731": {
				"input": .13,
				"output": .26,
				"cacheRead": .028
			},
			"perplexity/sonar": {
				"input": .25,
				"output": 2.5,
				"cacheRead": .0625
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"xai/grok-4-1-fast-non-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"xai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"nvidia/nemotron-3-super-120b-a12b": {
				"input": .25,
				"output": 2.5
			},
			"moonshot-ai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshot-ai/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			}
		},
		"bailing": {
			"Ring-1T": {
				"input": .57,
				"output": 2.29
			},
			"Ling-1T": {
				"input": .57,
				"output": 2.29
			}
		},
		"poe": {
			"cerebras/llama-3.1-8b-cs": {
				"input": .1,
				"output": .1
			},
			"cerebras/gpt-oss-120b-cs": {
				"input": .35,
				"output": .75
			},
			"empiriolabs/deepseek-v4-pro-el": {
				"input": 1.67,
				"output": 3.33
			},
			"empiriolabs/deepseek-v4-flash-el": {
				"input": .14,
				"output": .28
			},
			"anthropic/claude-haiku-3.5": {
				"input": .68,
				"output": 3.4,
				"cacheRead": .068,
				"cacheWrite": .85
			},
			"anthropic/claude-opus-4.1": {
				"input": 13,
				"output": 64,
				"cacheRead": 1.3,
				"cacheWrite": 16
			},
			"anthropic/claude-opus-4.5": {
				"input": 4.3,
				"output": 21,
				"cacheRead": .43,
				"cacheWrite": 5.3
			},
			"anthropic/claude-opus-4.6": {
				"input": 4.3,
				"output": 21,
				"cacheRead": .43,
				"cacheWrite": 5.3
			},
			"anthropic/claude-sonnet-3.5-june": {
				"input": 2.6,
				"output": 13,
				"cacheRead": .26,
				"cacheWrite": 3.2
			},
			"anthropic/claude-opus-4.7": {
				"input": 4.3,
				"output": 21,
				"cacheRead": .43,
				"cacheWrite": 5.4
			},
			"anthropic/claude-haiku-3": {
				"input": .21,
				"output": 1.1,
				"cacheRead": .021,
				"cacheWrite": .26
			},
			"anthropic/claude-opus-4.8": {
				"input": 4.2929,
				"output": 21.4646
			},
			"anthropic/claude-sonnet-3.7": {
				"input": 2.6,
				"output": 13,
				"cacheRead": .26,
				"cacheWrite": 3.2
			},
			"anthropic/claude-haiku-4.5": {
				"input": .85,
				"output": 4.3,
				"cacheRead": .085,
				"cacheWrite": 1.1
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 2.6,
				"output": 13,
				"cacheRead": .26,
				"cacheWrite": 3.2
			},
			"anthropic/claude-sonnet-4": {
				"input": 2.6,
				"output": 13,
				"cacheRead": .26,
				"cacheWrite": 3.2
			},
			"anthropic/claude-sonnet-3.5": {
				"input": 2.6,
				"output": 13,
				"cacheRead": .26,
				"cacheWrite": 3.2
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 2.6,
				"output": 13,
				"cacheRead": .26,
				"cacheWrite": 3.2
			},
			"anthropic/claude-opus-4": {
				"input": 13,
				"output": 64,
				"cacheRead": 1.3,
				"cacheWrite": 16
			},
			"novita/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"novita/kimi-k2.6": {
				"input": .96,
				"output": 4.04,
				"cacheRead": .16
			},
			"novita/kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"novita/deepseek-v3.2": {
				"input": .27,
				"output": .4,
				"cacheRead": .13
			},
			"google/gemini-deep-research": {
				"input": 1.6,
				"output": 9.6
			},
			"google/nano-banana": {
				"input": .21,
				"output": 1.8,
				"cacheRead": .021
			},
			"google/gemini-2.0-flash": {
				"input": .1,
				"output": .42
			},
			"google/nano-banana-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-2.0-flash-lite": {
				"input": .052,
				"output": .21
			},
			"google/gemini-3-flash": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .04
			},
			"google/gemini-3.5-flash": {
				"input": 1.5152,
				"output": 9.0909,
				"cacheRead": .1515
			},
			"google/gemini-2.5-pro": {
				"input": .87,
				"output": 7,
				"cacheRead": .087
			},
			"google/gemini-2.5-flash": {
				"input": .21,
				"output": 1.8,
				"cacheRead": .021
			},
			"google/gemini-3-pro": {
				"input": 1.6,
				"output": 9.6,
				"cacheRead": .16
			},
			"google/gemma-4-31b": {
				"input": 0,
				"output": 0
			},
			"google/gemini-2.5-flash-lite": {
				"input": .07,
				"output": .28
			},
			"google/gemini-3.1-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5
			},
			"xai/grok-3": {
				"input": 3,
				"output": 15,
				"cacheRead": .75
			},
			"xai/grok-4.20-multi-agent": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"xai/grok-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .75
			},
			"xai/grok-4-fast-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"xai/grok-4-fast-non-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"xai/grok-3-mini": {
				"input": .3,
				"output": .5,
				"cacheRead": .075
			},
			"xai/grok-code-fast-1": {
				"input": .2,
				"output": 1.5,
				"cacheRead": .02
			},
			"fireworks-ai/kimi-k2.5-fw": {
				"input": 0,
				"output": 0
			},
			"openai/gpt-5.4": {
				"input": 2.2,
				"output": 14,
				"cacheRead": .22
			},
			"openai/gpt-5.4-pro": {
				"input": 27,
				"output": 160
			},
			"openai/gpt-3.5-turbo": {
				"input": .45,
				"output": 1.4
			},
			"openai/gpt-5.5-pro": {
				"input": 27.2727,
				"output": 163.6364
			},
			"openai/gpt-5.4-nano": {
				"input": .18,
				"output": 1.1,
				"cacheRead": .018
			},
			"openai/gpt-5.2-codex": {
				"input": 1.6,
				"output": 13,
				"cacheRead": .16
			},
			"openai/gpt-5.1-codex": {
				"input": 1.1,
				"output": 9,
				"cacheRead": .11
			},
			"openai/gpt-4o-search": {
				"input": 2.2,
				"output": 9
			},
			"openai/gpt-5-codex": {
				"input": 1.1,
				"output": 9
			},
			"openai/gpt-5-mini": {
				"input": .22,
				"output": 1.8,
				"cacheRead": .022
			},
			"openai/gpt-image-2": {
				"input": 5.0505,
				"output": 32.3232,
				"cacheRead": 1.2626
			},
			"openai/gpt-5.2-pro": {
				"input": 19,
				"output": 150
			},
			"openai/o4-mini": {
				"input": .99,
				"output": 4,
				"cacheRead": .25
			},
			"openai/o3-mini": {
				"input": .99,
				"output": 4
			},
			"openai/gpt-5.3-codex": {
				"input": 1.6,
				"output": 13,
				"cacheRead": .16
			},
			"openai/gpt-4.1-nano": {
				"input": .09,
				"output": .36,
				"cacheRead": .022
			},
			"openai/o3-deep-research": {
				"input": 9,
				"output": 36,
				"cacheRead": 2.2
			},
			"openai/gpt-5-nano": {
				"input": .045,
				"output": .36,
				"cacheRead": .0045
			},
			"openai/gpt-5.2-instant": {
				"input": 1.6,
				"output": 13,
				"cacheRead": .16
			},
			"openai/o1": {
				"input": 14,
				"output": 54
			},
			"openai/chatgpt-4o-latest": {
				"input": 4.5,
				"output": 14
			},
			"openai/gpt-5-pro": {
				"input": 14,
				"output": 110
			},
			"openai/gpt-3.5-turbo-instruct": {
				"input": 1.4,
				"output": 1.8
			},
			"openai/gpt-5.3-codex-spark": {
				"input": 0,
				"output": 0
			},
			"openai/gpt-5.1": {
				"input": 1.1,
				"output": 9,
				"cacheRead": .11
			},
			"openai/gpt-5-chat": {
				"input": 1.1,
				"output": 9,
				"cacheRead": .11
			},
			"openai/gpt-4o-mini": {
				"input": .14,
				"output": .54,
				"cacheRead": .068
			},
			"openai/o3-pro": {
				"input": 18,
				"output": 72
			},
			"openai/gpt-5.3-instant": {
				"input": 1.6,
				"output": 13,
				"cacheRead": .16
			},
			"openai/gpt-4o-aug": {
				"input": 2.2,
				"output": 9,
				"cacheRead": 1.1
			},
			"openai/o3-mini-high": {
				"input": .99,
				"output": 4
			},
			"openai/gpt-5.1-instant": {
				"input": 1.1,
				"output": 9,
				"cacheRead": .11
			},
			"openai/gpt-5.4-mini": {
				"input": .68,
				"output": 4,
				"cacheRead": .068
			},
			"openai/gpt-5.1-codex-max": {
				"input": 1.1,
				"output": 9,
				"cacheRead": .11
			},
			"openai/gpt-5.2": {
				"input": 1.6,
				"output": 13,
				"cacheRead": .16
			},
			"openai/gpt-5.5": {
				"input": 4.5455,
				"output": 27.2727,
				"cacheRead": .4545
			},
			"openai/o4-mini-deep-research": {
				"input": 1.8,
				"output": 7.2,
				"cacheRead": .45
			},
			"openai/gpt-4.1": {
				"input": 1.8,
				"output": 7.2,
				"cacheRead": .45
			},
			"openai/gpt-4-classic-0314": {
				"input": 27,
				"output": 54
			},
			"openai/gpt-4-classic": {
				"input": 27,
				"output": 54
			},
			"openai/gpt-4o-mini-search": {
				"input": .14,
				"output": .54
			},
			"openai/gpt-3.5-turbo-raw": {
				"input": .45,
				"output": 1.4
			},
			"openai/gpt-4.1-mini": {
				"input": .36,
				"output": 1.4,
				"cacheRead": .09
			},
			"openai/gpt-4-turbo": {
				"input": 9,
				"output": 27
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .22,
				"output": 1.8,
				"cacheRead": .022
			},
			"openai/o3": {
				"input": 1.8,
				"output": 7.2,
				"cacheRead": .45
			},
			"openai/gpt-5": {
				"input": 1.1,
				"output": 9,
				"cacheRead": .11
			},
			"openai/o1-pro": {
				"input": 140,
				"output": 540
			}
		},
		"cerebras": {
			"qwen-3.8-27b": {
				"input": .99,
				"output": 1.49,
				"cacheRead": .99
			},
			"gpt-oss-120b": {
				"input": .35,
				"output": .75
			}
		},
		"groq": {
			"llama-3.3-70b-versatile": {
				"input": .59,
				"output": .79
			},
			"allam-2-7b": {
				"input": 0,
				"output": 0
			},
			"llama-3.1-8b-instant": {
				"input": .05,
				"output": .08
			},
			"meta-llama/llama-prompt-guard-2-86m": {
				"input": .04,
				"output": .04
			},
			"meta-llama/llama-prompt-guard-2-22m": {
				"input": .03,
				"output": .03
			},
			"qwen/qwen3.8-27b": {
				"input": .8,
				"output": 4
			},
			"qwen/qwen3.6-27b": {
				"input": .6,
				"output": 3,
				"cacheRead": .3
			},
			"openai/gpt-oss-20b": {
				"input": .075,
				"output": .3,
				"cacheRead": .0375
			},
			"openai/gpt-oss-safeguard-20b": {
				"input": .075,
				"output": .3
			},
			"openai/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			}
		},
		"zai": {
			"glm-4.6v": {
				"input": .3,
				"output": .9
			},
			"glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24,
				"cacheWrite": 0
			},
			"glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": 0
			},
			"glm-4.6v-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.5v": {
				"input": .6,
				"output": 1.8
			},
			"glm-5.3-flashx": {
				"input": .37,
				"output": 1.25,
				"cacheRead": .075,
				"cacheWrite": 0
			},
			"glm-4.7-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"glm-4.5-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"glm-4.7-flashx": {
				"input": .07,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": 0
			},
			"glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24,
				"cacheWrite": 0
			},
			"glm-4.5-air": {
				"input": .2,
				"output": 1.1,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			}
		},
		"empiriolabs": {
			"qwen3-8-max-0902": {
				"input": 2,
				"output": 6,
				"cacheRead": 2
			},
			"qwen3-6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .5
			},
			"qwen3-6-27b": {
				"input": .412564,
				"output": 2.475384,
				"cacheRead": .412564
			},
			"glm-5-3-flash": {
				"input": .075,
				"output": .25,
				"cacheRead": .075
			},
			"kimi-k2-7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .95
			},
			"seed-2-0-lite": {
				"input": .31,
				"output": 2.5,
				"cacheRead": .31
			},
			"deepseek-v4-flash-0731": {
				"input": .424,
				"output": 1.272,
				"cacheRead": .424
			},
			"mimo-v2-5": {
				"input": .7,
				"output": 1.4,
				"cacheRead": .014
			},
			"seed-2-0-mini": {
				"input": .12,
				"output": .5,
				"cacheRead": .12
			},
			"muse-glimmer-30b": {
				"input": .2,
				"output": .8,
				"cacheRead": .05
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": 3
			},
			"glm-4-7-flash": {
				"input": 0,
				"output": 0
			},
			"mimo-v2-6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .435
			},
			"qwen3-7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": 2.5
			},
			"step-3-5-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"qwen3-8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": 2
			},
			"deepseek-v3-2": {
				"input": .57,
				"output": 1.71,
				"cacheRead": .57
			},
			"minimax-m2-7-highspeed": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"mimo-v2-5-pro": {
				"input": 2.175,
				"output": 4.35,
				"cacheRead": .018
			},
			"qwen3-max": {
				"input": 1.08,
				"output": 5.52,
				"cacheRead": 1.08
			},
			"seed-2-0-pro": {
				"input": .63,
				"output": 3.79,
				"cacheRead": .63
			},
			"qwen3-5-4b": {
				"input": .04,
				"output": .07,
				"cacheRead": .02
			},
			"step-5-preview": {
				"input": 1,
				"output": 2.7,
				"cacheRead": .05
			},
			"qwen3-5-27b": {
				"input": .086,
				"output": .688,
				"cacheRead": .086
			},
			"seed-2-1-turbo": {
				"input": .63,
				"output": 3.13,
				"cacheRead": .63
			},
			"fugu-ultra-v1-0": {
				"input": 7.5,
				"output": 45,
				"cacheRead": 1.5
			},
			"qwen3-5-122b-a10b": {
				"input": .115,
				"output": .917,
				"cacheRead": .115
			},
			"qwen3-5-flash": {
				"input": .09,
				"output": .368,
				"cacheRead": .09
			},
			"mimo-v2-6-pro-ultraspeed": {
				"input": 4.35,
				"output": 8.7,
				"cacheRead": 4.35
			},
			"glm-5-2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": 1.4
			},
			"mimo-v2-6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .14
			},
			"muse-spark-1-2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": 1
			},
			"qwen3-7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .006
			},
			"minimax-m2-7": {
				"input": .15,
				"output": .6,
				"cacheRead": .03
			},
			"qwen3-6-35b-a3b": {
				"input": .07,
				"output": .42,
				"cacheRead": .035
			},
			"qwen3-5-9b": {
				"input": .09,
				"output": .13,
				"cacheRead": .045
			},
			"step-3-5-flash-2603": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"qwen3-5-35b-a3b": {
				"input": .057,
				"output": .459,
				"cacheRead": .057
			},
			"deepseek-v4-pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": 1.32
			},
			"kimi-k2-6": {
				"input": .8939,
				"output": 3.7131,
				"cacheRead": .1788
			},
			"minimax-m3": {
				"input": .225,
				"output": .9,
				"cacheRead": .045
			},
			"glm-5-3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": 1.4
			},
			"fugu-ultra-v1-1": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"kimi-k2-7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": 1.9
			},
			"deepseek-v4-1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .3
			},
			"qwen3-7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .4
			},
			"glm-5-1": {
				"input": .825,
				"output": 3.301,
				"cacheRead": .165
			},
			"glm-4-6v-flash": {
				"input": 0,
				"output": 0
			},
			"fugu-ultra-v2-0": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"mistral-small-4": {
				"input": .15,
				"output": .6,
				"cacheRead": .15
			},
			"qwen3-8-omni-flash": {
				"input": .3,
				"output": .94,
				"cacheRead": .3
			},
			"qwen3-5-plus": {
				"input": .36,
				"output": 2.21,
				"cacheRead": .36
			},
			"muse-spark-1-3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": 1
			},
			"deepseek-v4-pro": {
				"input": 1.65,
				"output": 3.3,
				"cacheRead": 1.65
			},
			"qwen3-8-flash": {
				"input": .16,
				"output": .47,
				"cacheRead": .16
			},
			"gemma-3-27b": {
				"input": 0,
				"output": 0
			},
			"qwen3-6-flash": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .25
			},
			"seed-2-0-code": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .4
			},
			"qwen3-8-27b": {
				"input": .17,
				"output": .5,
				"cacheRead": .08
			},
			"muse-spark-1-1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": 1
			},
			"qwen3-6-max-preview": {
				"input": 1.31,
				"output": 7.88,
				"cacheRead": 1.31
			},
			"step-3-7-flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"qwen3-5-397b-a17b": {
				"input": .172,
				"output": 1.032,
				"cacheRead": .172
			},
			"glm-4-5-flash": {
				"input": 0,
				"output": 0
			},
			"gemma-4-26b-a4b": {
				"input": .05,
				"output": .29,
				"cacheRead": .025
			},
			"deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .14
			}
		},
		"sensenova": {
			"kimi-k3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"sensenova-6.8-flash-lite": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"glm-5.2": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"deepseek-v4-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"deepseek-v4-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			}
		},
		"alibaba-token-plan": {
			"happyhorse-1.1-r2v": {
				"input": 0,
				"output": 0
			},
			"qwen3.7-max": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4-flash-0731": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.8-max": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"happyhorse-1.1-t2v": {
				"input": 0,
				"output": 0
			},
			"qwen-image-2.0": {
				"input": 0,
				"output": 0
			},
			"glm-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4.1-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.8-max-preview": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen-image-2.0-pro": {
				"input": 0,
				"output": 0
			},
			"kimi-k2.6": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"wan2.7-image": {
				"input": 0,
				"output": 0
			},
			"wan2.7-image-pro": {
				"input": 0,
				"output": 0
			},
			"kimi-k2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"happyhorse-1.1-i2v": {
				"input": 0,
				"output": 0
			},
			"qwen3.6-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4-pro-0813": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.8-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.2": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.6-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v3.2": {
				"input": 0,
				"output": 0
			},
			"glm-5.3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"kimi-k2.7-code": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.7-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"cloudflare-workers-ai": {
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast": {
				"input": .293,
				"output": 2.253
			},
			"@cf/meta/llama-guard-3-8b": {
				"input": .484,
				"output": .03
			},
			"@cf/meta/llama-3.1-8b-instruct-fp8": {
				"input": .152,
				"output": .287
			},
			"@cf/meta/llama-3.2-11b-vision-instruct": {
				"input": .0485,
				"output": .676
			},
			"@cf/meta/llama-3.2-1b-instruct": {
				"input": .027,
				"output": .201
			},
			"@cf/meta/llama-4-scout-17b-16e-instruct": {
				"input": .27,
				"output": .85
			},
			"@cf/meta/llama-3.2-3b-instruct": {
				"input": .0509,
				"output": .335
			},
			"@cf/google/gemma-4-26b-a4b-it": {
				"input": .1,
				"output": .3,
				"cacheRead": .05
			},
			"@cf/aisingapore/gemma-sea-lion-v4-27b-it": {
				"input": .351,
				"output": .555
			},
			"@cf/ibm-granite/granite-4.0-h-micro": {
				"input": .017,
				"output": .112
			},
			"@cf/deepseek-ai/deepseek-v4-flash-0731": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .014
			},
			"@cf/deepseek-ai/deepseek-v4-pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"@cf/deepseek-ai/deepseek-r1-distill-qwen-32b": {
				"input": .497,
				"output": 4.881
			},
			"@cf/mistralai/mistral-small-3.1-24b-instruct": {
				"input": .351,
				"output": .555
			},
			"@cf/moonshotai/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"@cf/moonshotai/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"@cf/zai-org/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"@cf/zai-org/glm-4.7-flash": {
				"input": .0605,
				"output": .4
			},
			"@cf/zai-org/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"@cf/zai-org/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"@cf/nvidia/nemotron-3-120b-a12b": {
				"input": .5,
				"output": 1.5
			},
			"@cf/qwen/qwen3.8-27b": {
				"input": .45,
				"output": 3.2,
				"cacheRead": .05
			},
			"@cf/qwen/qwq-32b": {
				"input": .66,
				"output": 1
			},
			"@cf/qwen/qwen3-30b-a3b-fp8": {
				"input": .0509,
				"output": .335
			},
			"@cf/qwen/qwen2.5-coder-32b-instruct": {
				"input": .66,
				"output": 1
			},
			"@cf/openai/gpt-oss-20b": {
				"input": .2,
				"output": .3
			},
			"@cf/openai/gpt-oss-120b": {
				"input": .35,
				"output": .75
			}
		},
		"engy": {
			"qwen3.8-27b": {
				"input": .045,
				"output": .32,
				"cacheRead": .015
			},
			"glm-5.3-flash": {
				"input": .135,
				"output": .45,
				"cacheRead": .027
			},
			"deepseek-v4-flash-0731": {
				"input": .045,
				"output": .09,
				"cacheRead": .009
			},
			"kimi-k3": {
				"input": 1.95,
				"output": 9.75,
				"cacheRead": .195
			},
			"deepseek-v4.1-flash": {
				"input": .04,
				"output": .08,
				"cacheRead": .008
			},
			"qwen3.6-35b-a3b": {
				"input": .045,
				"output": .3,
				"cacheRead": .015
			},
			"glm-5.2": {
				"input": .68,
				"output": 1.5,
				"cacheRead": .18
			},
			"glm-5.3": {
				"input": .98,
				"output": 3.08,
				"cacheRead": .18
			}
		},
		"poolside": {
			"poolside/laguna-s-2.1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"poolside/laguna-xs-2.1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"poolside/laguna-m.1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"nano-gpt": {
			"deepseek-reasoner-cheaper": {
				"input": .4,
				"output": 1.7,
				"cacheRead": .2
			},
			"nano-gpt-help": {
				"input": 0,
				"output": 0
			},
			"doubao-seed-2-0-lite-260215": {
				"input": .1462,
				"output": .8738,
				"cacheRead": .0731
			},
			"doubao-seed-2-0-mini-260215": {
				"input": .0493,
				"output": .4845,
				"cacheRead": .02465
			},
			"fastgpt": {
				"input": 7.5,
				"output": 7.5
			},
			"doubao-seed-2-0-pro-260215": {
				"input": .782,
				"output": 3.876,
				"cacheRead": .391
			},
			"ernie-5.0-thinking-preview": {
				"input": 1,
				"output": 3.5,
				"cacheRead": .5
			},
			"gemini-2.5-flash-lite-preview-09-2025-thinking": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"gemma-4-12b-it-station-keeper": {
				"input": .05,
				"output": .25,
				"cacheRead": .025
			},
			"glm-4-air-0111": {
				"input": .1394,
				"output": .1394,
				"cacheRead": .0697
			},
			"glm-4.1v-thinking-flashx": {
				"input": .3,
				"output": .3,
				"cacheRead": .15
			},
			"deepseek-v3-0324": {
				"input": .2,
				"output": .77,
				"cacheRead": .135
			},
			"venice-uncensored": {
				"input": .4,
				"output": 1.8,
				"cacheRead": .4
			},
			"Gemma-4-31B-MeroMero-v2:thinking": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"gemini-2.0-pro-reasoner": {
				"input": 1.292,
				"output": 4.998,
				"cacheRead": .323
			},
			"Meta-Llama-3-1-8B-Instruct-FP8": {
				"input": .02,
				"output": .03,
				"cacheRead": .01
			},
			"glm-4-plus-0111": {
				"input": 9.996,
				"output": 9.996,
				"cacheRead": 4.998
			},
			"holo3-35b-a3b:thinking": {
				"input": .25,
				"output": 1.8,
				"cacheRead": .125
			},
			"gemma-4-26b-a4b-it-moonlight": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"phi-4-mini-instruct": {
				"input": .17,
				"output": .68,
				"cacheRead": .085
			},
			"auto-model-premium": {
				"input": 9.996,
				"output": 19.992,
				"cacheRead": 4.998
			},
			"gemma-4-31b-it-darkidol": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"gemini-2.5-flash-lite-preview-06-17": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"gemini-2.5-flash-preview-09-2025": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gemma-4-26b-a4b-it-opusdistill": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"auto-model-standard": {
				"input": 9.996,
				"output": 19.992,
				"cacheRead": 4.998
			},
			"longcat-2.0": {
				"input": .75,
				"output": 3,
				"cacheRead": .015
			},
			"gemini-2.5-pro-preview-03-25": {
				"input": 2.5,
				"output": 10,
				"cacheRead": .25
			},
			"agnes-3.0-flash": {
				"input": .05,
				"output": .15,
				"cacheRead": .005
			},
			"Gemma-4-31B-Queen": {
				"input": .306,
				"output": .306,
				"cacheRead": .153
			},
			"auto-model": {
				"input": 0,
				"output": 0
			},
			"qvq-max": {
				"input": 1.2,
				"output": 4.8,
				"cacheRead": .6
			},
			"asi1-mini": {
				"input": 1,
				"output": 1,
				"cacheRead": .5
			},
			"gemini-2.5-pro-exp-03-25": {
				"input": 2.5,
				"output": 10,
				"cacheRead": .25
			},
			"gemma-4-31b-it-isometry": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"celeris-1": {
				"input": 2,
				"output": 6,
				"cacheRead": 1
			},
			"gemini-3-pro-image-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gemma-4-26b-a4b-it-darksoul": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"glm-4.1v-thinking-flash": {
				"input": .3,
				"output": .3,
				"cacheRead": .15
			},
			"Gemma-4-31B-GarnetV2": {
				"input": .306,
				"output": .306,
				"cacheRead": .153
			},
			"gemini-2.5-flash-nothinking": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"Gemma-4-31B-MeroMero-v2": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"holo3-35b-a3b": {
				"input": .25,
				"output": 1.8,
				"cacheRead": .125
			},
			"claw-medium": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"gemma-4-26b-a4b-it-shadowsiren": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"gemini-2.0-pro-exp-02-05": {
				"input": 1.989,
				"output": 7.956,
				"cacheRead": .49725
			},
			"claw-high": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"deepseek-chat": {
				"input": .1,
				"output": .425,
				"cacheRead": .05
			},
			"Gemma-4-26B-A4B-MeroMero:thinking": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"claw-low": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": .08333
			},
			"doubao-1.5-pro-32k": {
				"input": .1343,
				"output": .3349,
				"cacheRead": .06715
			},
			"doubao-seed-2-0-code-preview-260215": {
				"input": .782,
				"output": 3.893,
				"cacheRead": .391
			},
			"hermes-low": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": .08333
			},
			"gemma-4-31b-it-gemsicle": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"mercury-coder-small": {
				"input": .25,
				"output": 1,
				"cacheRead": .125
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125,
				"cacheWrite": .375
			},
			"ernie-x1.1-preview": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"hermes-high": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"gemini-2.5-flash-preview-05-20": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"glm-4-long": {
				"input": .2006,
				"output": .2006,
				"cacheRead": .1003
			},
			"pokee-isaac": {
				"input": .15,
				"output": 1,
				"cacheRead": .075
			},
			"MiniMax-M1": {
				"input": .1394,
				"output": 1.3328,
				"cacheRead": .0697
			},
			"Gemma-4-31B-Claude-4.6-Opus-Reasoning-Distilled": {
				"input": .306,
				"output": .306,
				"cacheRead": .0306
			},
			"Qwen3.5-27B-BlueStar-v3-Derestricted": {
				"input": .306,
				"output": .306,
				"cacheRead": .153
			},
			"gemma-4-31b-it-novelist": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"ernie-5.1:thinking": {
				"input": .75,
				"output": 3,
				"cacheRead": .75
			},
			"gemma-4-12b-it-semancer": {
				"input": .05,
				"output": .25,
				"cacheRead": .025
			},
			"mistral-code-latest": {
				"input": .3,
				"output": .9,
				"cacheRead": .15
			},
			"Qwen3.5-27B-Queen-Derestricted": {
				"input": .306,
				"output": .306,
				"cacheRead": .153
			},
			"gemma-4-31b-it-fabled": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"Gemma-4-26B-A4B-MeroMero": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"Gemma-4-31B-Cognitive-Unshackled": {
				"input": .306,
				"output": .306,
				"cacheRead": .153
			},
			"universal-summarizer": {
				"input": 30,
				"output": 30
			},
			"gemma-4-12b-it": {
				"input": .05,
				"output": .25,
				"cacheRead": .025
			},
			"gemini-exp-1206": {
				"input": 1.258,
				"output": 4.998,
				"cacheRead": .629
			},
			"gemini-2.5-flash-preview-09-2025-thinking": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"doubao-1.5-pro-256k": {
				"input": .799,
				"output": 1.445,
				"cacheRead": .3995
			},
			"gemma-4-31b-it-garnet": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"gemini-2.5-pro-preview-05-06": {
				"input": 2.5,
				"output": 10,
				"cacheRead": .25
			},
			"mercury-2": {
				"input": .25,
				"output": .75,
				"cacheRead": .025
			},
			"command-a-reasoning-08-2025": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"longcat-2.0:thinking": {
				"input": .75,
				"output": 3,
				"cacheRead": .015
			},
			"deepseek-r1-sambanova": {
				"input": 4.998,
				"output": 6.987,
				"cacheRead": 2.499
			},
			"gemini-2.5-flash-preview-04-17": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"deepseek-reasoner": {
				"input": .4,
				"output": 1.7,
				"cacheRead": .2
			},
			"gemini-2.5-flash-lite-preview-09-2025": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"gemini-2.5-flash-preview-04-17:thinking": {
				"input": .15,
				"output": 3.5,
				"cacheRead": .015
			},
			"deepseek-r1": {
				"input": .4,
				"output": 1.7,
				"cacheRead": .2
			},
			"gemini-2.5-pro-preview-06-05": {
				"input": 2.5,
				"output": 10,
				"cacheRead": .25
			},
			"gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"deepseek-chat-cheaper": {
				"input": .1,
				"output": .425,
				"cacheRead": .05
			},
			"GLM-4.6-Derestricted-v5": {
				"input": .4,
				"output": 1.5,
				"cacheRead": .2
			},
			"longcat-2.5-preview": {
				"input": .75,
				"output": 2.95,
				"cacheRead": .015
			},
			"doubao-1.5-vision-pro-32k": {
				"input": .459,
				"output": 1.377,
				"cacheRead": .2295
			},
			"glm-z1-airx": {
				"input": .7,
				"output": .7,
				"cacheRead": .35
			},
			"auto-model-basic": {
				"input": 9.996,
				"output": 19.992,
				"cacheRead": 4.998
			},
			"qwen3-vl-235b-a22b-instruct-original": {
				"input": .3,
				"output": 1.9,
				"cacheRead": .15
			},
			"gemma-4-26b-a4b-it-luminous": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"sarvam-105b": {
				"input": .054,
				"output": .2124,
				"cacheRead": .0336
			},
			"gemma-4-31b-it-gembrain": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"phi-4-multimodal-instruct": {
				"input": .07,
				"output": .11,
				"cacheRead": .035
			},
			"gemini-2.5-flash-preview-05-20:thinking": {
				"input": .15,
				"output": 3.5,
				"cacheRead": .015
			},
			"gemma-4-26b-a4b-it-musica": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"gemma-4-26b-a4b-it-chimerax": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"hermes-medium": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"doubao-seed-1-6-250615": {
				"input": .204,
				"output": .51,
				"cacheRead": .102
			},
			"Gemma-4-31B-DarkIdol": {
				"input": .306,
				"output": .306,
				"cacheRead": .153
			},
			"ernie-5.1": {
				"input": .75,
				"output": 3,
				"cacheRead": .75
			},
			"doubao-seed-1-6-flash-250615": {
				"input": .0374,
				"output": .374,
				"cacheRead": .0187
			},
			"mistral-code-agent-latest": {
				"input": .4,
				"output": 2,
				"cacheRead": .2
			},
			"kimi-k2-instruct-fast": {
				"input": .4,
				"output": 1.8,
				"cacheRead": .2
			},
			"featherless-ai/Qwerky-72B": {
				"input": .5,
				"output": .5,
				"cacheRead": .25
			},
			"stealth/space-bunny-alpha": {
				"input": .05,
				"output": .15
			},
			"unsloth/gemma-3-27b-it": {
				"input": .2992,
				"output": .2992,
				"cacheRead": .1496
			},
			"unsloth/gemma-3-12b-it": {
				"input": .272,
				"output": .272,
				"cacheRead": .136
			},
			"unsloth/gemma-3-4b-it": {
				"input": .2006,
				"output": .2006,
				"cacheRead": .1003
			},
			"bytedance-seed/seed-2.0-lite": {
				"input": .25,
				"output": 2,
				"cacheRead": .125
			},
			"bytedance-seed/seed-2-1-turbo": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .25
			},
			"bytedance-seed/seed-2.0-code": {
				"input": .5,
				"output": 3,
				"cacheRead": .25
			},
			"poolside/laguna-s-2.1:thinking": {
				"input": .1,
				"output": .2,
				"cacheRead": .01
			},
			"poolside/laguna-s-2.1": {
				"input": .1,
				"output": .2,
				"cacheRead": .01
			},
			"abliteration-ai/abliterated-model-large-v2": {
				"input": 3,
				"output": 5,
				"cacheRead": .3
			},
			"abliteration-ai/abliterated-model": {
				"input": 1,
				"output": 3,
				"cacheRead": .1
			},
			"abliteration-ai/abliterated-model-large": {
				"input": 3,
				"output": 5,
				"cacheRead": .3
			},
			"prism-ml/ternary-bonsai-2-27b": {
				"input": .075,
				"output": .5,
				"cacheRead": .0375
			},
			"anthropic/claude-opus-4.5:thinking": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-4.5:thinking": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-4.6:thinking:low": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-opus-4.1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5
			},
			"anthropic/claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-4:thinking:64000": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-latest": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-opus-4.1:thinking:1024": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5
			},
			"anthropic/claude-haiku-latest": {
				"input": 1,
				"output": 5,
				"cacheRead": .1
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-5.5:thinking": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4:thinking:8192": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-sonnet-4:thinking:1024": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-4.6:thinking": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4.6:thinking:medium": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-fable-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-5.5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4:thinking:32768": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-4.1:thinking:8192": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5
			},
			"anthropic/claude-haiku-4.5:thinking": {
				"input": 1,
				"output": 5,
				"cacheRead": .1
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4.8:thinking": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4.6:thinking": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-4.6:thinking:max": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-5:thinking": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-4.7:thinking": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-opus-4.1:thinking": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5
			},
			"anthropic/claude-sonnet-4:thinking": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic/claude-opus-4.1:thinking:32768": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5
			},
			"cohere/command-r-plus-08-2024": {
				"input": 2.856,
				"output": 14.246,
				"cacheRead": 1.428
			},
			"deepseek/deepseek-v4-flash:thinking": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"deepseek/deepseek-v4-flash-0731": {
				"input": .05,
				"output": .16,
				"cacheRead": .013
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .13,
				"output": .52,
				"cacheRead": .006
			},
			"deepseek/deepseek-v4.1-flash:thinking": {
				"input": .13,
				"output": .52,
				"cacheRead": .006
			},
			"deepseek/deepseek-v4-flash-vision-exp": {
				"input": .22,
				"output": .66,
				"cacheRead": .007
			},
			"deepseek/deepseek-v3.2:thinking": {
				"input": .28,
				"output": .42,
				"cacheRead": .14
			},
			"deepseek/deepseek-latest": {
				"input": 1.1,
				"output": 2.5,
				"cacheRead": .04
			},
			"deepseek/deepseek-v4-pro:thinking": {
				"input": 1.1,
				"output": 2.2,
				"cacheRead": .11
			},
			"deepseek/deepseek-v4-pro-0813:thinking": {
				"input": 1.1,
				"output": 2.5,
				"cacheRead": .04
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": 1.1,
				"output": 2.5,
				"cacheRead": .04
			},
			"deepseek/deepseek-v4-flash-0731:thinking": {
				"input": .05,
				"output": .16,
				"cacheRead": .013
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.1,
				"output": 2.2,
				"cacheRead": .11
			},
			"deepseek/deepseek-v4-flash-latest": {
				"input": .05,
				"output": .16,
				"cacheRead": .013
			},
			"deepseek/deepseek-v3.2": {
				"input": .28,
				"output": .42,
				"cacheRead": .14
			},
			"deepseek/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"baseten/Kimi-K2-Instruct-FP4": {
				"input": .4,
				"output": 1.8,
				"cacheRead": .2
			},
			"unbiased/pareto-26.10-preview": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .03
			},
			"unbiased/pareto": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .25
			},
			"lightonai/LightOnOCR-2-1B": {
				"input": .1785,
				"output": .3465
			},
			"abacusai/Dracarys-72B-Instruct": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"shisa-ai/shisa-v2.1-llama3.3-70b": {
				"input": .5,
				"output": .5,
				"cacheRead": .25
			},
			"shisa-ai/shisa-v2-llama3.3-70b": {
				"input": .5,
				"output": .5,
				"cacheRead": .25
			},
			"Steelskull/L3.3-MS-Nevoria-70b": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"Steelskull/L3.3-Cu-Mai-R1-70b": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"Steelskull/L3.3-Nevoria-R1-70b": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"Steelskull/L3.3-Electra-R1-70b": {
				"input": .69989,
				"output": .69989,
				"cacheRead": .349945
			},
			"tencent/hy3": {
				"input": .066,
				"output": .26,
				"cacheRead": .029
			},
			"tencent/hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"anthracite-org/magnum-v4-72b": {
				"input": 2.006,
				"output": 2.992,
				"cacheRead": 1.003
			},
			"anthracite-org/magnum-v2-72b": {
				"input": 2.006,
				"output": 2.992,
				"cacheRead": 1.003
			},
			"meta-llama/llama-4-scout": {
				"input": .085,
				"output": .46,
				"cacheRead": .0425
			},
			"meta-llama/llama-4-maverick": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"meta-llama/llama-3.3-70b-instruct": {
				"input": .05,
				"output": .23,
				"cacheRead": .025
			},
			"meta-llama/llama-3.1-8b-instruct": {
				"input": .0544,
				"output": .085,
				"cacheRead": .0272
			},
			"meta-llama/llama-3.2-3b-instruct": {
				"input": .0306,
				"output": .0493,
				"cacheRead": .0153
			},
			"LLM360/K2-Think": {
				"input": .17,
				"output": .68,
				"cacheRead": .085
			},
			"deepcogito/cogito-v1-preview-qwen-32B": {
				"input": 1.8,
				"output": 1.8,
				"cacheRead": .9
			},
			"GalrionSoftworks/MN-LooseCannon-12B-v1": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"meganova-ai/manta-mini-1.0": {
				"input": .02,
				"output": .16,
				"cacheRead": .01
			},
			"meganova-ai/manta-flash-1.0": {
				"input": .02,
				"output": .16,
				"cacheRead": .01
			},
			"meganova-ai/manta-pro-1.0": {
				"input": .06,
				"output": .5,
				"cacheRead": .03
			},
			"perceptron/perceptron-mk1": {
				"input": .15,
				"output": 1.5,
				"cacheRead": .075
			},
			"perceptron/perceptron-mk1.5": {
				"input": .15,
				"output": 1.5
			},
			"z-ai/glm-4.6v": {
				"input": .3,
				"output": .9,
				"cacheRead": .15
			},
			"z-ai/glm-4.6-original": {
				"input": .35,
				"output": 1.4,
				"cacheRead": .175
			},
			"z-ai/glm-4.5": {
				"input": .3,
				"output": 1.3,
				"cacheRead": .15
			},
			"z-ai/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/glm-5.3-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .025
			},
			"z-ai/glm-5.3-flash-uncensored": {
				"input": .2,
				"output": .8,
				"cacheRead": .07
			},
			"z-ai/glm-4.6": {
				"input": .35,
				"output": 1.4,
				"cacheRead": .175
			},
			"z-ai/glm-4.7-flash:thinking": {
				"input": .07,
				"output": .4,
				"cacheRead": .035
			},
			"z-ai/glm-5-original:thinking": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"z-ai/glm-5.3:thinking": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"z-ai/glm-5": {
				"input": .5,
				"output": 2.55,
				"cacheRead": .13
			},
			"z-ai/GLM-4.5-Air": {
				"input": .12,
				"output": .8,
				"cacheRead": .06
			},
			"z-ai/glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .3
			},
			"z-ai/GLM-4.6-turbo:thinking": {
				"input": 1,
				"output": 3,
				"cacheRead": .5
			},
			"z-ai/glm-4.7:thinking": {
				"input": .4004,
				"output": 1.9292,
				"cacheRead": .08008
			},
			"z-ai/glm-5.1:thinking": {
				"input": .75,
				"output": 2.6,
				"cacheRead": .15
			},
			"z-ai/glm-4.6v-original": {
				"input": .6,
				"output": .9,
				"cacheRead": .3
			},
			"z-ai/glm-5v-turbo:thinking": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/GLM-4.6-turbo": {
				"input": 1,
				"output": 3,
				"cacheRead": .5
			},
			"z-ai/GLM-4.5-Air:thinking": {
				"input": .12,
				"output": .8,
				"cacheRead": .06
			},
			"z-ai/glm-5.2:thinking": {
				"input": .42,
				"output": 1.32,
				"cacheRead": .078
			},
			"z-ai/glm-4.7-flash": {
				"input": .07,
				"output": .4,
				"cacheRead": .035
			},
			"z-ai/glm-4.7": {
				"input": .4004,
				"output": 1.9292,
				"cacheRead": .08008
			},
			"z-ai/glm-5.3-uncensored": {
				"input": 1.25,
				"output": 2.25,
				"cacheRead": .3
			},
			"z-ai/glm-5:thinking": {
				"input": .5,
				"output": 2.55,
				"cacheRead": .13
			},
			"z-ai/glm-5.2": {
				"input": .42,
				"output": 1.32,
				"cacheRead": .078
			},
			"z-ai/GLM-4.5:thinking": {
				"input": .3,
				"output": 1.3,
				"cacheRead": .15
			},
			"z-ai/glm-5.1": {
				"input": .75,
				"output": 2.6,
				"cacheRead": .15
			},
			"z-ai/glm-4.6:thinking": {
				"input": .35,
				"output": 1.4,
				"cacheRead": .175
			},
			"z-ai/glm-4.5v:thinking": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .3
			},
			"z-ai/glm-4.7-original": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"z-ai/glm-5-original": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"z-ai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/glm-4.7-original:thinking": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"z-ai/glm-5.3": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"z-ai/glm-5.3-flash-cybersecurity": {
				"input": .15,
				"output": .5,
				"cacheRead": .075
			},
			"z-ai/glm-latest": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"inference-net/schematron-v2-small": {
				"input": .05,
				"output": .23,
				"cacheRead": .025
			},
			"inference-net/schematron-v2-turbo": {
				"input": .03,
				"output": .15,
				"cacheRead": .015
			},
			"thinkingmachines/inkling:thinking": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"thinkingmachines/Inkling-Small": {
				"input": .5,
				"output": 1.2,
				"cacheRead": .1
			},
			"thinkingmachines/inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"thinkingmachines/Inkling-Small:thinking": {
				"input": .5,
				"output": 1.2,
				"cacheRead": .1
			},
			"meta/muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-glimmer-30b": {
				"input": .35,
				"output": 1.5,
				"cacheRead": .04
			},
			"meta/muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"meta/muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"mlabonne/NeuralDaredevil-8B-abliterated": {
				"input": .44,
				"output": .44,
				"cacheRead": .22
			},
			"NeverSleep/Lumimaid-v0.2-70B": {
				"input": 1,
				"output": 1.5,
				"cacheRead": .5
			},
			"nanogpt/coding-router:low": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"nanogpt/coding-router:medium": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"nanogpt/coding-router": {
				"input": 1.1,
				"output": 2.2,
				"cacheRead": .11
			},
			"nanogpt/coding-router:max": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"nanogpt/coding-router:high": {
				"input": 1.1,
				"output": 2.2,
				"cacheRead": .11
			},
			"LatitudeGames/Wayfarer-Large-70B-Llama-3.3": {
				"input": .7,
				"output": .7,
				"cacheRead": .35
			},
			"VongolaChouko/Starcannon-Unleashed-12B-v1.0": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"arcee-ai/trinity-large-thinking": {
				"input": .25,
				"output": .9,
				"cacheRead": .125
			},
			"x-ai/grok-4.20-multi-agent": {
				"input": 2,
				"output": 6,
				"cacheRead": 1
			},
			"x-ai/grok-latest": {
				"input": 1.6,
				"output": 4.8,
				"cacheRead": .4
			},
			"x-ai/grok-4.7": {
				"input": 1.6,
				"output": 4.8,
				"cacheRead": .4
			},
			"x-ai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"x-ai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"x-ai/grok-4.20": {
				"input": 2,
				"output": 6,
				"cacheRead": 1
			},
			"x-ai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"Envoid/Llama-3.05-Nemotron-Tenyxchat-Storybreaker-70B": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"Envoid/Llama-3.05-NT-Storybreaker-Ministral-70B": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"heabsy/cyberheabsy": {
				"input": 1.5,
				"output": 4.5,
				"cacheRead": .275
			},
			"upstage/solar-pro-3": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"upstage/solar-pro4": {
				"input": .03,
				"output": .12,
				"cacheRead": .006
			},
			"upstage/solar-mini4:thinking": {
				"input": .05,
				"output": .2,
				"cacheRead": .005
			},
			"upstage/solar-pro4:thinking": {
				"input": .03,
				"output": .12,
				"cacheRead": .006
			},
			"upstage/solar-mini4": {
				"input": .05,
				"output": .2,
				"cacheRead": .005
			},
			"bytedance/doubao-seed-2.1-turbo": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .25
			},
			"bytedance/doubao-seed-2.1-pro": {
				"input": 1,
				"output": 5,
				"cacheRead": .5
			},
			"bytedance/doubao-seed-character": {
				"input": .1179,
				"output": .2947,
				"cacheRead": .0236,
				"cacheWrite": .0025
			},
			"liquid/lfm-2.5-2.6b": {
				"input": .1,
				"output": .2,
				"cacheRead": .05
			},
			"google/gemini-flash-latest": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemma-4-31b-it": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"google/gemini-3.1-pro-preview-low": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3.5-flash-thinking": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": .083333
			},
			"google/gemma-4-26b-a4b-it:thinking": {
				"input": .13,
				"output": .4,
				"cacheRead": .065
			},
			"google/gemini-flash-lite-latest": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .08333
			},
			"google/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/diffusiongemma": {
				"input": .05,
				"output": .15,
				"cacheRead": .025
			},
			"google/gemma-4-26b-a4b-it": {
				"input": .12,
				"output": .38,
				"cacheRead": .06
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .08333
			},
			"google/gemma-4-31b-it:thinking": {
				"input": .1,
				"output": .35,
				"cacheRead": .05
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3.1-pro-preview-high": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemma4-31b-splituntied": {
				"input": .1,
				"output": .3,
				"cacheRead": .05
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": .083333
			},
			"google/gemma-4-26b-a4b-it-cybersecurity": {
				"input": .1056,
				"output": .3344,
				"cacheRead": .0528
			},
			"google/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google/gemini-pro-latest": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-3-flash-preview-thinking": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .08333
			},
			"TEE/gemma-4-31b-it": {
				"input": .15,
				"output": .46,
				"cacheRead": .075
			},
			"TEE/qwen3.8-27b": {
				"input": .4,
				"output": 3,
				"cacheRead": .15
			},
			"TEE/nemotron-3.5-lightning": {
				"input": .08,
				"output": .2,
				"cacheRead": .04
			},
			"TEE/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"TEE/qwen3.5-27b": {
				"input": .3,
				"output": 2.4,
				"cacheRead": .15
			},
			"TEE/muse-glimmer-30b": {
				"input": .35,
				"output": 1.5,
				"cacheRead": .04
			},
			"TEE/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": 1.5
			},
			"TEE/deepseek-v4.1-flash": {
				"input": .65,
				"output": 1.45,
				"cacheRead": .13
			},
			"TEE/llama3-3-70b": {
				"input": 1.75,
				"output": 2.75,
				"cacheRead": 1.75
			},
			"TEE/kimi-k2.6": {
				"input": 1.5,
				"output": 5.25,
				"cacheRead": .375
			},
			"TEE/gemma-4-26b-a4b-uncensored": {
				"input": .15,
				"output": .7,
				"cacheRead": .075
			},
			"TEE/gemma4-31b:thinking": {
				"input": .4,
				"output": 1,
				"cacheRead": .4
			},
			"TEE/gemma4-31b": {
				"input": .4,
				"output": 1,
				"cacheRead": .4
			},
			"TEE/qwen3.6-35b-a3b": {
				"input": .2,
				"output": 1.27,
				"cacheRead": .1
			},
			"TEE/glm-5.2:thinking": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .7
			},
			"TEE/qwen3.5-397b-a17b": {
				"input": .55,
				"output": 3.5,
				"cacheRead": .275
			},
			"TEE/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .7
			},
			"TEE/glm-5.1-thinking": {
				"input": 1.5,
				"output": 5.25,
				"cacheRead": .3
			},
			"TEE/glm-5.1": {
				"input": 1.5,
				"output": 5.25,
				"cacheRead": .3
			},
			"TEE/qwen2.5-vl-72b-instruct": {
				"input": .7,
				"output": .7,
				"cacheRead": .35
			},
			"TEE/qwen3.6-27b": {
				"input": .32,
				"output": 2.7,
				"cacheRead": .16
			},
			"TEE/deepseek-v3.2": {
				"input": .5,
				"output": 1,
				"cacheRead": .25
			},
			"TEE/gpt-oss-120b": {
				"input": 2,
				"output": 2,
				"cacheRead": 2
			},
			"TEE/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"TEE/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"EVA-UNIT-01/EVA-Qwen2.5-72B-v0.2": {
				"input": .799,
				"output": .799,
				"cacheRead": .3995
			},
			"EVA-UNIT-01/EVA-LLaMA-3.33-70B-v0.0": {
				"input": 2.006,
				"output": 2.006,
				"cacheRead": 1.003
			},
			"EVA-UNIT-01/EVA-Qwen2.5-32B-v0.2": {
				"input": .799,
				"output": .799,
				"cacheRead": .3995
			},
			"EVA-UNIT-01/EVA-LLaMA-3.33-70B-v0.1": {
				"input": 2.006,
				"output": 2.006,
				"cacheRead": 1.003
			},
			"nothingiisreal/L3.1-70B-Celeste-V0.1-BF16": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"MarinaraSpaghetti/NemoMix-Unleashed-12B": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"pamanseau/OpenReasoning-Nemotron-32B": {
				"input": .1,
				"output": .4,
				"cacheRead": .05
			},
			"huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated": {
				"input": 1.4,
				"output": 1.4,
				"cacheRead": .7
			},
			"huihui-ai/Qwen2.5-32B-Instruct-abliterated": {
				"input": .7,
				"output": .7,
				"cacheRead": .35
			},
			"huihui-ai/Llama-3.3-70B-Instruct-abliterated": {
				"input": .7,
				"output": .7,
				"cacheRead": .35
			},
			"huihui-ai/DeepSeek-R1-Distill-Llama-70B-abliterated": {
				"input": .7,
				"output": .7,
				"cacheRead": .35
			},
			"Gryphe/MythoMax-L2-13b": {
				"input": .1003,
				"output": .1003,
				"cacheRead": .05015
			},
			"ibm-granite/granite-4.2-8b": {
				"input": .1,
				"output": .15,
				"cacheRead": .05
			},
			"TheDrummer/skyfall-36b-v2": {
				"input": .55,
				"output": .8,
				"cacheRead": .25
			},
			"TheDrummer/Artemis-v1.1": {
				"input": .1,
				"output": .45,
				"cacheRead": .05
			},
			"TheDrummer/Anubis-70B-v1": {
				"input": .31,
				"output": .31,
				"cacheRead": .155
			},
			"TheDrummer/Anubis-70B-v1.1": {
				"input": .31,
				"output": .31,
				"cacheRead": .155
			},
			"TheDrummer/Cydonia-24B-v4.3": {
				"input": .12,
				"output": .15,
				"cacheRead": .06
			},
			"TheDrummer/Magidonia-24B-v4.3": {
				"input": .1003,
				"output": .1207,
				"cacheRead": .05015
			},
			"TheDrummer/Cydonia-24B-v4.1": {
				"input": .35,
				"output": .55,
				"cacheRead": .16
			},
			"TheDrummer/UnslopNemo-12B-v4.1": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"TheDrummer/Cydonia-24B-v2": {
				"input": .1003,
				"output": .1207,
				"cacheRead": .05015
			},
			"TheDrummer/Rocinante-12B-v1.1": {
				"input": .408,
				"output": .595,
				"cacheRead": .204
			},
			"TheDrummer/Cydonia-24B-v4": {
				"input": .2006,
				"output": .2414,
				"cacheRead": .1003
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .2,
				"output": .7,
				"cacheRead": .1
			},
			"deepseek-ai/deepseek-v3.2-exp-thinking": {
				"input": .28,
				"output": .42,
				"cacheRead": .14
			},
			"deepseek-ai/DeepSeek-R1-0528": {
				"input": .4,
				"output": 1.7,
				"cacheRead": .2
			},
			"deepseek-ai/DeepSeek-V3.1-Terminus": {
				"input": .25,
				"output": .7,
				"cacheRead": .125
			},
			"deepseek-ai/deepseek-v3.2-exp": {
				"input": .28,
				"output": .42,
				"cacheRead": .14
			},
			"deepseek-ai/DeepSeek-V3.1:thinking": {
				"input": .2,
				"output": .7,
				"cacheRead": .1
			},
			"deepseek-ai/DeepSeek-V3.1-Terminus:thinking": {
				"input": .25,
				"output": .7,
				"cacheRead": .125
			},
			"stepfun-ai/step-3.5-flash-2603": {
				"input": .1,
				"output": .3,
				"cacheRead": .05
			},
			"stepfun-ai/step-3.5-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .05
			},
			"MiniMaxAI/MiniMax-M1-80k": {
				"input": .6052,
				"output": 2.4225,
				"cacheRead": .3026
			},
			"mistralai/ministral-8b-2512": {
				"input": .15,
				"output": .15,
				"cacheRead": .075
			},
			"mistralai/mistral-small-4-119b-2603:thinking": {
				"input": .4,
				"output": 1.4,
				"cacheRead": .2
			},
			"mistralai/mistral-medium-3.5": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .75
			},
			"mistralai/mistral-small-24b-instruct-2501": {
				"input": .1155,
				"output": .3465
			},
			"mistralai/mixtral-8x22b-instruct-v0.1": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"mistralai/mistral-saba": {
				"input": .1989,
				"output": .595,
				"cacheRead": .09945
			},
			"mistralai/mistral-medium-3.1": {
				"input": .4,
				"output": 2,
				"cacheRead": .2
			},
			"mistralai/mistral-small-3.2-24b-instruct": {
				"input": .2,
				"output": .4,
				"cacheRead": .1
			},
			"mistralai/mistral-small-4-119b-2603": {
				"input": .4,
				"output": 1.4,
				"cacheRead": .2
			},
			"mistralai/mistral-large": {
				"input": 2.006,
				"output": 6.001,
				"cacheRead": .2
			},
			"mistralai/mistral-medium-3.5:thinking": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .75
			},
			"mistralai/devstral-small-2505": {
				"input": .06,
				"output": .06,
				"cacheRead": .03
			},
			"mistralai/devstral-2-123b-instruct-2512": {
				"input": .4,
				"output": 1.4,
				"cacheRead": .2
			},
			"mistralai/mistral-medium-3": {
				"input": .4,
				"output": 2,
				"cacheRead": .2
			},
			"mistralai/ministral-14b-instruct-2512": {
				"input": .1,
				"output": .4,
				"cacheRead": .05
			},
			"mistralai/ministral-14b-2512": {
				"input": .2,
				"output": .2,
				"cacheRead": .1
			},
			"mistralai/mistral-small-3.1-24b-instruct": {
				"input": .1,
				"output": .3,
				"cacheRead": .05
			},
			"mistralai/ministral-3b-2512": {
				"input": .1,
				"output": .1,
				"cacheRead": .05
			},
			"mistralai/mistral-nemo-instruct-2407": {
				"input": .1003,
				"output": .1207,
				"cacheRead": .05015
			},
			"mistralai/codestral-2508": {
				"input": .3,
				"output": .9,
				"cacheRead": .15
			},
			"sakana/fugu-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"sakana/fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana/fugu-ultra-v1.1": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"inclusionai/ling-3.0-flash": {
				"input": .075,
				"output": .22,
				"cacheRead": .015
			},
			"inclusionai/ling-3.1-flash": {
				"input": .075,
				"output": .22,
				"cacheRead": .015
			},
			"inclusionai/ling-3.0-flash-vl": {
				"input": .06,
				"output": .18,
				"cacheRead": .012
			},
			"inclusionai/ling-3.0-flash:thinking": {
				"input": .075,
				"output": .22,
				"cacheRead": .015
			},
			"moonshotai/kimi-k3": {
				"input": 2,
				"output": 10,
				"cacheRead": .2
			},
			"moonshotai/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .32
			},
			"moonshotai/kimi-k2.6": {
				"input": .5,
				"output": 2.6,
				"cacheRead": .125
			},
			"moonshotai/kimi-k2.5:thinking": {
				"input": .3,
				"output": 1.9,
				"cacheRead": .15
			},
			"moonshotai/kimi-k2-thinking": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .15
			},
			"moonshotai/kimi-k2.5": {
				"input": .3,
				"output": 1.9,
				"cacheRead": .15
			},
			"moonshotai/kimi-k2-instruct": {
				"input": .4,
				"output": 1.8,
				"cacheRead": .2
			},
			"moonshotai/kimi-k2.6:thinking": {
				"input": .5,
				"output": 2.6,
				"cacheRead": .125
			},
			"moonshotai/kimi-k2-instruct-0711": {
				"input": .4,
				"output": 1.8,
				"cacheRead": .2
			},
			"moonshotai/kimi-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .2
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"moonshotai/Kimi-K2-Instruct-0905": {
				"input": .4,
				"output": 1.8,
				"cacheRead": .2
			},
			"THUDM/GLM-Z1-9B-0414": {
				"input": .2,
				"output": .2,
				"cacheRead": .1
			},
			"THUDM/GLM-4-9B-0414": {
				"input": .2,
				"output": .2,
				"cacheRead": .1
			},
			"THUDM/GLM-4-32B-0414": {
				"input": .2,
				"output": .2,
				"cacheRead": .1
			},
			"nvidia/nemotron-3-nano-30b-a3b": {
				"input": .17,
				"output": .68,
				"cacheRead": .085
			},
			"nvidia/nemotron-3.5-lightning": {
				"input": .05,
				"output": .2,
				"cacheRead": .01
			},
			"nvidia/Llama-3.3-Nemotron-Super-49B-v1": {
				"input": .15,
				"output": .15,
				"cacheRead": .075
			},
			"nvidia/nemotron-3-super-120b-a12b": {
				"input": .05,
				"output": .25,
				"cacheRead": .025
			},
			"nvidia/nemotron-3-ultra-550b-a55b": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .25
			},
			"nvidia/nemotron-3-super-120b-a12b:thinking": {
				"input": .05,
				"output": .25,
				"cacheRead": .025
			},
			"nvidia/nemotron-3-ultra-550b-a55b:thinking": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .25
			},
			"nvidia/nemotron-3.5-content-safety": {
				"input": .05,
				"output": .15,
				"cacheRead": .025
			},
			"nvidia/Llama-3.1-Nemotron-70B-Instruct-HF": {
				"input": .357,
				"output": .408,
				"cacheRead": .1785
			},
			"nvidia/nemotron-3.5-lightning:thinking": {
				"input": .05,
				"output": .2,
				"cacheRead": .01
			},
			"xiaomi/mimo-v2.5-pro:thinking": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036,
				"cacheWrite": 0
			},
			"xiaomi/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036,
				"cacheWrite": 0
			},
			"xiaomi/mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028,
				"cacheWrite": 0
			},
			"xiaomi/mimo-v2.6-flash-uncensored:thinking": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .1995
			},
			"xiaomi/mimo-v2.6-pro-ultraspeed": {
				"input": 4.35,
				"output": 8.7,
				"cacheRead": .036,
				"cacheWrite": 0
			},
			"xiaomi/mimo-v2.5:thinking": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028,
				"cacheWrite": 0
			},
			"xiaomi/mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036,
				"cacheWrite": 0
			},
			"xiaomi/mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028,
				"cacheWrite": 0
			},
			"xiaomi/mimo-v2.6-flash-abliterated": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .275
			},
			"xiaomi/mimo-v2.6-flash-uncensored": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .1995
			},
			"undi95/remm-slerp-l2-13b": {
				"input": .799,
				"output": 1.207,
				"cacheRead": .3995
			},
			"Salesforce/Llama-xLAM-2-70b-fc-r": {
				"input": 2.5,
				"output": 2.5,
				"cacheRead": 1.25
			},
			"minimax/minimax-latest": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .15
			},
			"minimax/minimax-m2.7-turbo": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .3
			},
			"minimax/minimax-01": {
				"input": .1394,
				"output": 1.122,
				"cacheRead": .0697
			},
			"minimax/minimax-m2-her": {
				"input": .302,
				"output": 1.207,
				"cacheRead": .151
			},
			"minimax/minimax-m2.7": {
				"input": .315,
				"output": 1.26,
				"cacheRead": .1575
			},
			"minimax/minimax-m3:thinking": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m2.1": {
				"input": .33,
				"output": 1.32,
				"cacheRead": .165
			},
			"minimax/minimax-m2": {
				"input": .17,
				"output": 1.53,
				"cacheRead": .085
			},
			"inflatebot/MN-12B-Mag-Mell-R1": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"kitani/clover-1-150b": {
				"input": .15,
				"output": .8
			},
			"soob3123/GrayLine-Qwen3-8B": {
				"input": .3,
				"output": .3,
				"cacheRead": .15
			},
			"soob3123/Veiled-Calla-12B": {
				"input": .3,
				"output": .3,
				"cacheRead": .15
			},
			"soob3123/amoral-gemma3-27B-v2": {
				"input": .3,
				"output": .3,
				"cacheRead": .15
			},
			"stepfun/step-5-preview": {
				"input": 1,
				"output": 2.7,
				"cacheRead": .05
			},
			"stepfun/step-3.7-flash:thinking": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"Sao10K/L3.1-70B-Hanami-x1": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"Sao10K/L3.1-70B-Euryale-v2.2": {
				"input": .306,
				"output": .357,
				"cacheRead": .153
			},
			"Sao10K/L3.3-70B-Euryale-v2.3": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"Sao10K/L3-8B-Stheno-v3.2": {
				"input": .2006,
				"output": .2006,
				"cacheRead": .1003
			},
			"inception/mercury-2.5-preview": {
				"input": .04,
				"output": .15,
				"cacheRead": .004
			},
			"ornith-ai/ornith-1.5-35b-a3b": {
				"input": .1,
				"output": .4,
				"cacheRead": .05
			},
			"ornith-ai/ornith-1.5-35b-a3b:thinking": {
				"input": .1,
				"output": .4,
				"cacheRead": .05
			},
			"amazon/nova-lite-v1": {
				"input": .0595,
				"output": .238,
				"cacheRead": .02975
			},
			"amazon/nova-2-lite-v1": {
				"input": .51,
				"output": 4.25,
				"cacheRead": .255
			},
			"amazon/nova-pro-v1": {
				"input": .799,
				"output": 3.196,
				"cacheRead": .3995
			},
			"Doctor-Shotgun/MS3.2-24B-Magnum-Diamond": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"aion-labs/aion-2.0": {
				"input": .8,
				"output": 1.6,
				"cacheRead": .2
			},
			"aion-labs/aion-rp-llama-3.1-8b": {
				"input": .8,
				"output": 1.6,
				"cacheRead": .4
			},
			"aion-labs/aion-3.0": {
				"input": 3,
				"output": 6,
				"cacheRead": .75
			},
			"aion-labs/aion-3.5": {
				"input": 3,
				"output": 6,
				"cacheRead": .75
			},
			"aion-labs/aion-3.5-mini": {
				"input": .7,
				"output": 1.4,
				"cacheRead": .18
			},
			"aion-labs/aion-3.0-mini": {
				"input": .7,
				"output": 1.4,
				"cacheRead": .18
			},
			"qwen/qwen3.5-flash": {
				"input": .1,
				"output": .4,
				"cacheRead": .05
			},
			"qwen/qwen3.8-max:thinking": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"qwen/qwen3-vl-235b-a22b-instruct": {
				"input": .3,
				"output": 1.9,
				"cacheRead": .15
			},
			"qwen/qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"qwen/qwen3.8-27b": {
				"input": .15,
				"output": .7,
				"cacheRead": .04
			},
			"qwen/qwen3-vl-235b-a22b-thinking": {
				"input": .5,
				"output": 6,
				"cacheRead": .25
			},
			"qwen/qwen3.5-27b": {
				"input": .27,
				"output": 2.16,
				"cacheRead": .135
			},
			"qwen/qwen3.7-flash:thinking": {
				"input": .03,
				"output": .13,
				"cacheRead": .006,
				"cacheWrite": .038
			},
			"qwen/qwen3-235b-a22b-instruct-2507": {
				"input": .13,
				"output": .5,
				"cacheRead": .065
			},
			"qwen/qwen-max": {
				"input": 1.5997,
				"output": 6.392,
				"cacheRead": .79985
			},
			"qwen/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": .65,
				"cacheRead": .075
			},
			"qwen/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"qwen/qwen3-coder-next": {
				"input": .2,
				"output": 1.5,
				"cacheRead": .1
			},
			"qwen/qwen3-coder": {
				"input": .13,
				"output": .5,
				"cacheRead": .065
			},
			"qwen/qwen3.5-35b-a3b:thinking": {
				"input": .225,
				"output": 1.8,
				"cacheRead": .1125
			},
			"qwen/qwen3.5-plus": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .04
			},
			"qwen/qwen3-32b": {
				"input": .1,
				"output": .3,
				"cacheRead": .05
			},
			"qwen/qwen-plus": {
				"input": .3995,
				"output": 1.2002,
				"cacheRead": .19975
			},
			"qwen/qwen3.7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .006,
				"cacheWrite": .038
			},
			"qwen/qwen3-max": {
				"input": 1.2002,
				"output": 6.001,
				"cacheRead": .6001
			},
			"qwen/qwen3.8-27b-obliterated:thinking": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .2
			},
			"qwen/qwen-turbo": {
				"input": .04998,
				"output": .2006,
				"cacheRead": .02499
			},
			"qwen/qwen3-coder-30b-a3b-instruct": {
				"input": .1,
				"output": .4,
				"cacheRead": .05
			},
			"qwen/qwen3.8-27b:thinking": {
				"input": .15,
				"output": .7,
				"cacheRead": .04
			},
			"qwen/qwen3.8-27b-obliterated": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .2
			},
			"qwen/qwen3.8-omni-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"qwen/qwen3.8-27b-uncensored": {
				"input": .15,
				"output": 1.2,
				"cacheRead": .125
			},
			"qwen/qwen3.7-max:thinking": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"qwen/qwen3-235b-a22b": {
				"input": .3,
				"output": .5,
				"cacheRead": .15
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .437,
				"output": 3.496,
				"cacheRead": .103788
			},
			"qwen/qwen3.8-27b-uncensored:thinking": {
				"input": .15,
				"output": 1.2,
				"cacheRead": .125
			},
			"qwen/qwen3.6-35b-a3b": {
				"input": .112,
				"output": .8,
				"cacheRead": .056
			},
			"qwen/qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": .65,
				"cacheRead": .075
			},
			"qwen/qwen3-max-2026-01-23": {
				"input": 1.2002,
				"output": 6.001,
				"cacheRead": .6001
			},
			"qwen/qwen3.8-27b-fable": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .125
			},
			"qwen/qwen3.8-27b-hemmingway": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .125
			},
			"qwen/qwen3.6-flash": {
				"input": .19,
				"output": 1.16,
				"cacheRead": .02,
				"cacheWrite": .24
			},
			"qwen/qwen3-coder-flash": {
				"input": .3,
				"output": 1.5,
				"cacheRead": .15
			},
			"qwen/qwen3.5-plus:thinking": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .04
			},
			"qwen/qwen3-coder-plus": {
				"input": 1,
				"output": 5,
				"cacheRead": .5
			},
			"qwen/qwen3.5-9b": {
				"input": .05,
				"output": .15,
				"cacheRead": .025
			},
			"qwen/qwen3.5-122b-a10b:thinking": {
				"input": .437,
				"output": 3.496,
				"cacheRead": .103788
			},
			"qwen/qwen3.5-397b-a17b:thinking": {
				"input": .6,
				"output": 3.6,
				"cacheRead": .3
			},
			"qwen/qwen3.8-max-prime": {
				"input": 4,
				"output": 12,
				"cacheRead": .5
			},
			"qwen/qwen3.8-flash": {
				"input": .14,
				"output": .42,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"qwen/qwen3.8-27b-cybersecurity": {
				"input": .1,
				"output": .6,
				"cacheRead": .05
			},
			"qwen/qwen-long": {
				"input": .1003,
				"output": .408,
				"cacheRead": .05015
			},
			"qwen/qwen3.5-35b-a3b": {
				"input": .225,
				"output": 1.8,
				"cacheRead": .1125
			},
			"qwen/qwen3.6-max-preview": {
				"input": 1.04,
				"output": 6.24,
				"cacheRead": .52
			},
			"qwen/qwen3-30b-a3b": {
				"input": .1,
				"output": .3,
				"cacheRead": .05
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .6,
				"output": 3.6,
				"cacheRead": .3
			},
			"qwen/qwen3-8b": {
				"input": .47,
				"output": .47,
				"cacheRead": .235
			},
			"qwen/qwen3.5-27b:thinking": {
				"input": .27,
				"output": 2.16,
				"cacheRead": .135
			},
			"qwen/qwen3.8-27b-queen": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .125
			},
			"qwen/qwen3-30b-a3b-instruct-2507": {
				"input": .2,
				"output": .5,
				"cacheRead": .1
			},
			"qwen/qwen2.5-coder-32b-instruct": {
				"input": .2006,
				"output": .2006,
				"cacheRead": .1003
			},
			"qwen/qwen3.7-plus:thinking": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"qwen/qwen-2.5-72b-instruct": {
				"input": .357,
				"output": .408,
				"cacheRead": .1785
			},
			"qwen/qwen3.6-35b-a3b:thinking": {
				"input": .112,
				"output": .8,
				"cacheRead": .056
			},
			"qwen/qwen3.6-27b": {
				"input": .203,
				"output": 2.24,
				"cacheRead": .1015
			},
			"qwen/qwen3.6-plus": {
				"input": .325,
				"output": 1.95,
				"cacheRead": .0325,
				"cacheWrite": .40625
			},
			"qwen/qwen3.6-27b:thinking": {
				"input": .203,
				"output": 2.24,
				"cacheRead": .1015
			},
			"qwen/qwen3-14b": {
				"input": .08,
				"output": .24,
				"cacheRead": .04
			},
			"qwen/qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"qwen/qwen3.5-flash:thinking": {
				"input": .1,
				"output": .4,
				"cacheRead": .05
			},
			"qwen/qwen3.8-max-0902": {
				"input": 2,
				"output": 6,
				"cacheRead": .17,
				"cacheWrite": 2.5
			},
			"failspy/Meta-Llama-3-70B-Instruct-abliterated-v3.5": {
				"input": .7,
				"output": .7,
				"cacheRead": .35
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5
			},
			"openai/gpt-terra-latest": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-astra-pro": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/o3-pro-2025-06-10": {
				"input": 22,
				"output": 88,
				"cacheRead": 11
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-chat-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-5.6-sol-pro": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"openai/gpt-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5-pro": {
				"input": 15,
				"output": 120,
				"cacheRead": 1.5
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-4o-2024-08-06": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-luna-latest": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-5.6-luna-pro": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/gpt-oss-20b": {
				"input": .2,
				"output": .3
			},
			"openai/gpt-oss-safeguard-20b": {
				"input": .075,
				"output": .3
			},
			"openai/o3-mini-high": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-sol-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-sol-pro": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-astra-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.1-codex-max": {
				"input": 2.5,
				"output": 20,
				"cacheRead": .25
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4o-2024-11-20": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/o3-mini-low": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-5.6-terra-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-6.1-sol-pro": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/o4-mini-high": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-6-luna-pro": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/gpt-oss-120b": {
				"input": .35,
				"output": .75
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": 1
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-5.1-2025-11-13": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/o1-pro": {
				"input": 150,
				"output": 600,
				"cacheRead": 75
			},
			"microsoft/wizardlm-2-8x22b": {
				"input": .493,
				"output": .493,
				"cacheRead": .2465
			},
			"NousResearch/hermes-3-llama-3.1-70b": {
				"input": .408,
				"output": .408,
				"cacheRead": .204
			},
			"NousResearch/hermes-4-405b": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .15
			},
			"NousResearch/hermes-4-405b:thinking": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .15
			},
			"ReadyArt/MS3.2-The-Omega-Directive-24B-Unslop-v2.0": {
				"input": .5,
				"output": .5,
				"cacheRead": .25
			}
		},
		"abliteration-ai": {
			"abliterated-model-large-v2": {
				"input": 5,
				"output": 5,
				"cacheRead": .5
			},
			"abliterated-model": {
				"input": 3,
				"output": 3,
				"cacheRead": .3
			},
			"abliterated-model-large": {
				"input": 5,
				"output": 5,
				"cacheRead": .5
			}
		},
		"crof": {
			"gemma-4-31b-it": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"qwen3.8-27b": {
				"input": .2,
				"output": 1.5,
				"cacheRead": .03
			},
			"kimi-k3-eco": {
				"input": 1,
				"output": 4,
				"cacheRead": .1
			},
			"glm-5.3-flash": {
				"input": .07,
				"output": .22,
				"cacheRead": .01
			},
			"deepseek-v4-flash-0731": {
				"input": .08,
				"output": .1,
				"cacheRead": .003
			},
			"kimi-k3": {
				"input": 2,
				"output": 8,
				"cacheRead": .25
			},
			"deepseek-v4-flash-vision-exp": {
				"input": .08,
				"output": .2,
				"cacheRead": .007
			},
			"kimi-k2.6": {
				"input": .5,
				"output": 1.99,
				"cacheRead": .05
			},
			"greg-2-super": {
				"input": 1.5,
				"output": 5,
				"cacheRead": .25
			},
			"deepseek-v4-pro-0813": {
				"input": .35,
				"output": .8,
				"cacheRead": .01
			},
			"mimo-v2.5-pro": {
				"input": .4,
				"output": .8,
				"cacheRead": .003
			},
			"greg-rp": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"qwen3.5-9b": {
				"input": .04,
				"output": .15,
				"cacheRead": .008
			},
			"qwen3.5-397b-a17b": {
				"input": .35,
				"output": 1.75,
				"cacheRead": .07
			},
			"glm-5.2": {
				"input": .3,
				"output": 1.05,
				"cacheRead": .05
			},
			"glm-5.1": {
				"input": .45,
				"output": 2.15,
				"cacheRead": .08,
				"cacheWrite": 0
			},
			"deepseek-v4-pro": {
				"input": .35,
				"output": .8,
				"cacheRead": .003
			},
			"qwen3.6-27b": {
				"input": .2,
				"output": 1.5,
				"cacheRead": .04
			},
			"greg-2-ultra": {
				"input": 3,
				"output": 10,
				"cacheRead": .5
			},
			"deepseek-v3.2": {
				"input": .18,
				"output": .35,
				"cacheRead": .04
			},
			"glm-5.3": {
				"input": .4,
				"output": 1.4,
				"cacheRead": .06
			},
			"kimi-k2.7-code": {
				"input": .55,
				"output": 2.25,
				"cacheRead": .05
			},
			"greg-1-mini": {
				"input": .07,
				"output": .15,
				"cacheRead": .01
			},
			"deepseek-v4-flash": {
				"input": .12,
				"output": .21,
				"cacheRead": .003
			}
		},
		"standardcompute": { "standardcompute": {
			"input": 0,
			"output": 0
		} },
		"cloudferro-sherlock": {
			"meta-llama/Llama-3.3-70B-Instruct": {
				"input": 2.92,
				"output": 2.92
			},
			"MiniMaxAI/MiniMax-M2.5": {
				"input": .3,
				"output": 1.2
			},
			"openai/gpt-oss-120b": {
				"input": 2.92,
				"output": 2.92
			},
			"speakleash/Bielik-11B-v2.6-Instruct": {
				"input": .67,
				"output": .67
			},
			"speakleash/Bielik-11B-v3.0-Instruct": {
				"input": .67,
				"output": .67
			}
		},
		"anthropic": {
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			}
		},
		"tinfoil": {
			"gpt-oss-safeguard-120b": {
				"input": .15,
				"output": .6
			},
			"glm-5-3-flash": {
				"input": .4,
				"output": 1.25,
				"cacheRead": .1
			},
			"kimi-k3": {
				"input": 4,
				"output": 20,
				"cacheRead": .8
			},
			"llama3-3-70b": {
				"input": 1.75,
				"output": 2.75
			},
			"gemma4-31b": {
				"input": .4,
				"output": 1
			},
			"glm-5-3": {
				"input": 1.8,
				"output": 5.75,
				"cacheRead": .45
			},
			"deepseek-v4-1-flash": {
				"input": .65,
				"output": 1.45,
				"cacheRead": .13
			},
			"nomic-embed-text": {
				"input": .05,
				"output": 0
			},
			"gpt-oss-120b": {
				"input": .15,
				"output": .6
			}
		},
		"llama": {
			"llama-4-maverick-17b-128e-instruct-fp8": {
				"input": 0,
				"output": 0
			},
			"groq-llama-4-maverick-17b-128e-instruct": {
				"input": 0,
				"output": 0
			},
			"llama-4-scout-17b-16e-instruct-fp8": {
				"input": 0,
				"output": 0
			},
			"cerebras-llama-4-maverick-17b-128e-instruct": {
				"input": 0,
				"output": 0
			},
			"llama-3.3-70b-instruct": {
				"input": 0,
				"output": 0
			},
			"llama-3.3-8b-instruct": {
				"input": 0,
				"output": 0
			},
			"cerebras-llama-4-scout-17b-16e-instruct": {
				"input": 0,
				"output": 0
			}
		},
		"cohere": {
			"command-r-08-2024": {
				"input": .15,
				"output": .6
			},
			"north-mini-code-1-0": {
				"input": 0,
				"output": 0
			},
			"command-a-translate-08-2025": {
				"input": 2.5,
				"output": 10
			},
			"command-r7b-arabic-02-2025": {
				"input": .0375,
				"output": .15
			},
			"command-a-plus-05-2026": {
				"input": 2.5,
				"output": 10
			},
			"command-a-03-2025": {
				"input": 2.5,
				"output": 10
			},
			"north-small-translate-09-2026": {
				"input": 0,
				"output": 0
			},
			"command-r7b-12-2024": {
				"input": .0375,
				"output": .15
			},
			"command-r-plus-08-2024": {
				"input": 2.5,
				"output": 10
			},
			"command-a-vision-07-2025": {
				"input": 2.5,
				"output": 10
			},
			"command-a-reasoning-08-2025": {
				"input": 2.5,
				"output": 10
			}
		},
		"deepseek": {
			"deepseek-v4-flash-vision-exp": {
				"input": .15,
				"output": .6,
				"reasoning": .6,
				"cacheRead": .003
			},
			"deepseek-flash": {
				"input": .15,
				"output": .6,
				"reasoning": .6,
				"cacheRead": .003
			},
			"deepseek-v4-pro": {
				"input": .66,
				"output": 1.98,
				"reasoning": 1.98,
				"cacheRead": .022
			},
			"deepseek-v4-flash": {
				"input": .15,
				"output": .6,
				"reasoning": .6,
				"cacheRead": .003
			}
		},
		"baseten": {
			"thinkingmachines/inkling-small": {
				"input": .5,
				"output": 1.2,
				"cacheRead": .1
			},
			"thinkingmachines/inkling": {
				"input": 1,
				"output": 4.05
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .5,
				"output": 1.5
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .13,
				"output": .26,
				"cacheRead": .028
			},
			"deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.32,
				"output": 3.96
			},
			"deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"deepseek-ai/DeepSeek-V4.1-Flash-Fast": {
				"input": .6,
				"output": 2.4
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .145
			},
			"MiniMaxAI/MiniMax-M2.5": {
				"input": .3,
				"output": 1.2
			},
			"moonshotai/Kimi-K2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshotai/Kimi-K2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .12
			},
			"zai-org/GLM-5.1": {
				"input": 1.3,
				"output": 4.3,
				"cacheRead": .26
			},
			"zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .3
			},
			"zai-org/GLM-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .12
			},
			"zai-org/GLM-5.2-Fast": {
				"input": 2.1,
				"output": 6.6,
				"cacheRead": .21
			},
			"zai-org/GLM-5.3-Fast": {
				"input": 2.1,
				"output": 6.6
			},
			"zai-org/GLM-5": {
				"input": .95,
				"output": 3.15,
				"cacheRead": .2
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5
			},
			"zai-org/GLM-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"nvidia/Nemotron-120B-A12B": {
				"input": .3,
				"output": .75,
				"cacheRead": .06
			},
			"nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"openai/gpt-oss-120b": {
				"input": .1,
				"output": .5
			}
		},
		"nan": {
			"qwen-image-2.1": {
				"input": 0,
				"output": 0
			},
			"glm5.3-flash": {
				"input": 0,
				"output": 0
			},
			"gemma4": {
				"input": 0,
				"output": 0
			},
			"qwen3.6": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.6-flash": {
				"input": 0,
				"output": 0
			},
			"qwen3.8-flash": {
				"input": 0,
				"output": 0
			},
			"glm5.3": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-flash": {
				"input": 0,
				"output": 0
			}
		},
		"nearai": {
			"anthropic/claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"black-forest-labs/FLUX.2-klein-4B": {
				"input": 1,
				"output": 1
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"Qwen/Qwen3-Reranker-0.6B": {
				"input": .01,
				"output": .01
			},
			"Qwen/Qwen3-VL-30B-A3B-Instruct": {
				"input": .15,
				"output": .55
			},
			"Qwen/Qwen3-Embedding-0.6B": {
				"input": .01,
				"output": .01
			},
			"Qwen/Qwen3.6-35B-A3B-FP8": {
				"input": .17,
				"output": 1.1,
				"cacheRead": .056
			},
			"zai-org/GLM-5.1-FP8": {
				"input": 1.4,
				"output": 4.4
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/whisper-large-v3": {
				"input": .01,
				"output": .01
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			}
		},
		"wandb": {
			"JetBrains/Mellum2-12B-A2.5B-Instruct": {
				"input": .05,
				"output": .1,
				"cacheRead": .05
			},
			"meta-llama/Llama-3.1-70B-Instruct": {
				"input": .8,
				"output": .8,
				"cacheRead": .8
			},
			"meta-llama/Llama-3.1-8B-Instruct": {
				"input": .22,
				"output": .22,
				"cacheRead": .22
			},
			"meta-llama/Llama-3.3-70B-Instruct": {
				"input": .71,
				"output": .71,
				"cacheRead": .71
			},
			"google/gemma-4-31B-it": {
				"input": .1,
				"output": .34,
				"cacheRead": .1
			},
			"google/gemma-4-26B-A4B-it": {
				"input": .1,
				"output": .3,
				"cacheRead": .05
			},
			"Qwen/Qwen3.8-27B": {
				"input": .4,
				"output": 3,
				"cacheRead": .15
			},
			"Qwen/Qwen3-30B-A3B-Instruct-2507": {
				"input": .1,
				"output": .3,
				"cacheRead": .1
			},
			"Qwen/Qwen3.6-35B-A3B": {
				"input": .25,
				"output": 1.25,
				"cacheRead": .25
			},
			"Qwen/Qwen3.5-35B-A3B": {
				"input": .25,
				"output": 1.25,
				"cacheRead": .25
			},
			"Qwen/Qwen3.6-27B": {
				"input": .6,
				"output": 3.6,
				"cacheRead": .12
			},
			"ibm-granite/granite-4.2-8b": {
				"input": .1,
				"output": .15,
				"cacheRead": .05
			},
			"ibm-granite/granite-4.1-8b": {
				"input": .05,
				"output": .1,
				"cacheRead": .05
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .55,
				"output": 1.65,
				"cacheRead": .55
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .13,
				"output": .28,
				"cacheRead": .07
			},
			"deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.31,
				"output": 3.96,
				"cacheRead": .044
			},
			"deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .2,
				"output": .65,
				"cacheRead": .03
			},
			"deepseek-ai/DeepSeek-V4-Flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .07
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": 1.15,
				"output": 2.55,
				"cacheRead": .2
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .23,
				"output": .96,
				"cacheRead": .05
			},
			"moonshotai/Kimi-K2.6": {
				"input": .65,
				"output": 3.41,
				"cacheRead": .15
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .71,
				"output": 3.5,
				"cacheRead": .15
			},
			"zai-org/GLM-5.2": {
				"input": .76,
				"output": 2.42,
				"cacheRead": .14
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .05
			},
			"nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B": {
				"input": .07,
				"output": .2,
				"cacheRead": .04
			},
			"nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B": {
				"input": .5,
				"output": 2.15,
				"cacheRead": .1
			},
			"openai/gpt-oss-20b": {
				"input": .03,
				"output": .13,
				"cacheRead": .03
			},
			"openai/gpt-oss-120b": {
				"input": .03,
				"output": .17,
				"cacheRead": .03
			},
			"OpenPipe/Qwen3-14B-Instruct": {
				"input": .05,
				"output": .22,
				"cacheRead": .05
			}
		},
		"subconscious": {
			"subconscious/tim-qwen3.6-27b": {
				"input": .3,
				"output": 3,
				"cacheRead": .15
			},
			"subconscious/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			}
		},
		"zeldoc": { "zdev": {
			"input": 0,
			"output": 0
		} },
		"databricks": {
			"databricks-claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"databricks-gpt-5-6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"databricks-kimi-k2-7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"databricks-glm-5-2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"databricks-gemini-3-1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"databricks-gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"databricks-gemini-3-flash": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"databricks-claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"databricks-gpt-oss-20b": {
				"input": .05,
				"output": .2
			},
			"databricks-gpt-5-4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"databricks-gemini-3-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"databricks-gpt-5-2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"databricks-claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"databricks-gemini-3-1-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"databricks-claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"databricks-gpt-5-6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"databricks-claude-opus-4-1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"databricks-gpt-oss-120b": {
				"input": .072,
				"output": .28
			},
			"databricks-gemini-2-5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"databricks-gemini-2-5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"databricks-claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"databricks-gpt-5-4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"databricks-gpt-5-4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"databricks-claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"databricks-gpt-5-6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1
			},
			"databricks-claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"databricks-gpt-5-1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"databricks-gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"databricks-gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"databricks-gpt-5-5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			}
		},
		"umans-ai-coding-plan": {
			"umans-deepseek-v4.1-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"umans-glm-5.3-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"umans-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"umans-deepseek-v4-flash-0731": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"umans-kimi-k3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"umans-qwen3.6-35b-a3b": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"umans-coder": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"kuae-cloud-coding-plan": { "GLM-4.7": {
			"input": 0,
			"output": 0,
			"cacheRead": 0,
			"cacheWrite": 0
		} },
		"umans-ai": {
			"umans-deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .028
			},
			"umans-glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"umans-flash": {
				"input": .15,
				"output": 1,
				"cacheRead": .05
			},
			"umans-deepseek-v4-flash-0731": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"umans-kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"umans-coder": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			}
		},
		"siliconflow": {
			"ByteDance-Seed/Seed-OSS-36B-Instruct": {
				"input": .21,
				"output": .57
			},
			"nex-agi/Nex-N2-Pro": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .25
			},
			"tencent/Hunyuan-A13B-Instruct": {
				"input": .14,
				"output": .57
			},
			"tencent/Hy3": {
				"input": .132,
				"output": .528,
				"cacheRead": .033
			},
			"meituan-longcat/LongCat-2.0": {
				"input": .75,
				"output": 2.95,
				"cacheRead": .015
			},
			"google/gemma-4-12B-it": {
				"input": .1,
				"output": .3
			},
			"google/gemma-4-31B-it": {
				"input": .13,
				"output": .4
			},
			"google/gemma-4-26B-A4B-it": {
				"input": .12,
				"output": .4
			},
			"Qwen/Qwen3-VL-30B-A3B-Instruct": {
				"input": .29,
				"output": 1
			},
			"Qwen/Qwen3-VL-8B-Instruct": {
				"input": .18,
				"output": .68
			},
			"Qwen/Qwen3-VL-32B-Thinking": {
				"input": .2,
				"output": 1.5
			},
			"Qwen/Qwen3-30B-A3B-Instruct-2507": {
				"input": .09,
				"output": .3
			},
			"Qwen/Qwen3.5-27B": {
				"input": .25,
				"output": 2
			},
			"Qwen/Qwen3.6-35B-A3B": {
				"input": .2,
				"output": 1.6
			},
			"Qwen/Qwen3-14B": {
				"input": .07,
				"output": .28
			},
			"Qwen/Qwen3-VL-30B-A3B-Thinking": {
				"input": .29,
				"output": 1
			},
			"Qwen/Qwen3-8B": {
				"input": .06,
				"output": .06
			},
			"Qwen/Qwen2.5-72B-Instruct": {
				"input": .59,
				"output": .59
			},
			"Qwen/Qwen3-32B": {
				"input": .14,
				"output": .57
			},
			"Qwen/Qwen3-Coder-30B-A3B-Instruct": {
				"input": .07,
				"output": .28
			},
			"Qwen/Qwen2.5-7B-Instruct": {
				"input": .05,
				"output": .05
			},
			"Qwen/Qwen3.5-35B-A3B": {
				"input": .24,
				"output": 1.8
			},
			"Qwen/Qwen3.5-122B-A10B": {
				"input": .26,
				"output": 2.08
			},
			"Qwen/Qwen3.5-9B": {
				"input": .1,
				"output": .15
			},
			"Qwen/Qwen3.5-397B-A17B": {
				"input": .39,
				"output": 2.34
			},
			"Qwen/Qwen3.8-2.4T-A95B": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"Qwen/Qwen3-VL-32B-Instruct": {
				"input": .2,
				"output": .6
			},
			"Qwen/Qwen3-Coder-480B-A35B-Instruct": {
				"input": .25,
				"output": 1
			},
			"Qwen/Qwen3.6-27B": {
				"input": .3,
				"output": 3.2
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .27,
				"output": 1
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .22,
				"output": .66,
				"cacheRead": .014
			},
			"deepseek-ai/DeepSeek-R1": {
				"input": .5,
				"output": 2.18
			},
			"deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"deepseek-ai/DeepSeek-V4-Flash": {
				"input": .13,
				"output": .28,
				"cacheRead": .028
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": 1.50162,
				"output": 3.135,
				"cacheRead": .135
			},
			"deepseek-ai/DeepSeek-V3.2": {
				"input": .27,
				"output": .42,
				"cacheRead": .135
			},
			"deepseek-ai/DeepSeek-V3": {
				"input": .25,
				"output": 1
			},
			"deepseek-ai/DeepSeek-V3.1-Terminus": {
				"input": .27,
				"output": 1
			},
			"deepseek-ai/DeepSeek-V3.2-Exp": {
				"input": .27,
				"output": .41
			},
			"deepseek-ai/DeepSeek-V4-Flash-Vision-Exp": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .028
			},
			"stepfun-ai/Step-3.5-Flash": {
				"input": .1,
				"output": .3
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"MiniMaxAI/MiniMax-M2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"inclusionAI/Ling-flash-2.0": {
				"input": .14,
				"output": .57
			},
			"moonshotai/Kimi-K2.6": {
				"input": .77,
				"output": 3.4,
				"cacheRead": .14
			},
			"moonshotai/Kimi-K3": {
				"input": 2.7,
				"output": 13.5,
				"cacheRead": .27
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .85916,
				"output": 3.8,
				"cacheRead": .17993
			},
			"moonshotai/Kimi-K2.5": {
				"input": .45,
				"output": 2.25,
				"cacheRead": .07
			},
			"zai-org/GLM-5.1": {
				"input": 1.19,
				"output": 3.74,
				"cacheRead": .6,
				"cacheWrite": 0
			},
			"zai-org/GLM-5.2": {
				"input": 1.302,
				"output": 4.092,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"zai-org/GLM-4.5-Air": {
				"input": .14,
				"output": .86
			},
			"zai-org/GLM-5": {
				"input": .95,
				"output": 2.55,
				"cacheRead": .2
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"zai-org/GLM-5V-Turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24,
				"cacheWrite": 0
			},
			"zai-org/GLM-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"openai/gpt-oss-20b": {
				"input": .04,
				"output": .18
			},
			"openai/gpt-oss-120b": {
				"input": .05,
				"output": .45
			}
		},
		"minimax-coding-plan": {
			"MiniMax-M3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M3.1-Flash-Preview": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.7": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.7-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2": {
				"input": 0,
				"output": 0
			},
			"MiniMax-M2.5-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"alibaba-coding-plan": {
			"qwen3-coder-next": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.5-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"kimi-k2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3-max-2026-01-23": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3-coder-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.7": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.6-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.7-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"lilac": {
			"google/gemma-4-31b-it": {
				"input": .11,
				"output": .35
			},
			"minimaxai/minimax-m3": {
				"input": .28,
				"output": 1.1,
				"cacheRead": .05
			},
			"moonshotai/kimi-k2.6": {
				"input": .7,
				"output": 3.5,
				"cacheRead": .2
			},
			"zai-org/glm-5.2": {
				"input": .9,
				"output": 3,
				"cacheRead": .27
			}
		},
		"moonshotai-cn": {
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			}
		},
		"bothub": {
			"gemma-4-31b-it:free": {
				"input": 0,
				"output": 0
			},
			"glm-5.3-flash": {
				"input": .12,
				"output": .44
			},
			"deepseek-v4-flash-0731": {
				"input": .1,
				"output": .28
			},
			"nemotron-3-ultra-550b-a55b:free": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-pro-0813": {
				"input": 1.61,
				"output": 4.84
			},
			"gpt-5.6-luna": {
				"input": .06,
				"output": .37
			},
			"muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2
			},
			"glm-5.3": {
				"input": 1.72,
				"output": 5.41
			}
		},
		"xiaomi-token-plan-cn": {
			"mimo-v2.6-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.5-tts-voicedesign": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5-tts": {
				"input": 0,
				"output": 0
			},
			"mimo-v2-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2-tts": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.6-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.5-tts-voiceclone": {
				"input": 0,
				"output": 0
			}
		},
		"privatemode-ai": {
			"glm-flash-latest": {
				"input": .2311,
				"output": .7511,
				"cacheRead": .0578
			},
			"glm-5.3-flash": {
				"input": .2311,
				"output": .7511,
				"cacheRead": .0578
			},
			"whisper-large-v3": {
				"input": .01618,
				"output": 0
			},
			"kimi-k2.6": {
				"input": 1.791,
				"output": 8.9436,
				"cacheRead": .1733
			},
			"deepseek-ocr-2": {
				"input": .8897,
				"output": 1.4675,
				"cacheRead": .0924
			},
			"qwen3-embedding-4b": {
				"input": .1502,
				"output": 0
			},
			"voxtral-mini-3b": {
				"input": .00462,
				"output": 0
			},
			"kimi-latest": {
				"input": 1.791,
				"output": 8.9436,
				"cacheRead": .1733
			},
			"gpt-oss-120b": {
				"input": .2311,
				"output": .7511,
				"cacheRead": .0462
			},
			"glm-5.3": {
				"input": 1.791,
				"output": 6.6326,
				"cacheRead": .1733
			},
			"glm-latest": {
				"input": 1.791,
				"output": 6.6326,
				"cacheRead": .1733
			}
		},
		"llmgateway-providers": {
			"consensusprotocol/gemma-4-31b-it": {
				"input": .1,
				"output": .25,
				"cacheRead": .01
			},
			"consensusprotocol/Qwen3.8-27B": {
				"input": .08,
				"output": .35,
				"cacheRead": .05
			},
			"consensusprotocol/glm-5.3-flash": {
				"input": .1,
				"output": .25,
				"cacheRead": .02
			},
			"consensusprotocol/deepseek-v4.1-flash": {
				"input": .15,
				"output": .55,
				"cacheRead": .005
			},
			"consensusprotocol/gpt-oss-20b": {
				"input": .04,
				"output": .19,
				"cacheRead": .01
			},
			"consensusprotocol/deepseek-v4-flash": {
				"input": .1,
				"output": .2,
				"cacheRead": .005
			},
			"deepinfra/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"deepinfra/gemma-4-31b-it": {
				"input": .15,
				"output": .4
			},
			"deepinfra/qwen3-vl-235b-a22b-instruct": {
				"input": .2,
				"output": .88,
				"cacheRead": .11
			},
			"deepinfra/qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"deepinfra/muse-glimmer-30b": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .04
			},
			"deepinfra/deepseek-v4.1-flash": {
				"input": .2,
				"output": .6,
				"cacheRead": .006
			},
			"deepinfra/ling-3.0-flash": {
				"input": .06,
				"output": .18,
				"cacheRead": .012
			},
			"deepinfra/qwen3-vl-30b-a3b-instruct": {
				"input": .15,
				"output": .6
			},
			"deepinfra/gemma-4-26b-a4b-it": {
				"input": .07,
				"output": .34
			},
			"deepinfra/ling-3.0-flash-vl": {
				"input": .06,
				"output": .18,
				"cacheRead": .012
			},
			"deepinfra/granite-4.2-8b": {
				"input": .06,
				"output": .25,
				"cacheRead": .015
			},
			"deepinfra/nemotron-3-ultra-550b": {
				"input": .5,
				"output": 2.2,
				"cacheRead": .1
			},
			"deepinfra/qwen3.5-9b": {
				"input": .1,
				"output": .15
			},
			"deepinfra/inkling": {
				"input": .95,
				"output": 4.05,
				"cacheRead": .16
			},
			"deepinfra/mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"deepinfra/hy3": {
				"input": .14,
				"output": .58,
				"cacheRead": .035
			},
			"deepinfra/deepseek-v4-pro": {
				"input": 1.3,
				"output": 2.6,
				"cacheRead": .1
			},
			"deepinfra/deepseek-v3.2": {
				"input": .26,
				"output": .38,
				"cacheRead": .13
			},
			"deepinfra/deepseek-v4-flash": {
				"input": .08,
				"output": .18,
				"cacheRead": .016
			},
			"cerebras/gemma-4-31b-it": {
				"input": .99,
				"output": 1.49
			},
			"cerebras/qwen3-235b-a22b-instruct-2507": {
				"input": .6,
				"output": 1.2
			},
			"cerebras/llama-3.3-70b-instruct": {
				"input": .85,
				"output": 1.2
			},
			"cerebras/glm-4.7": {
				"input": 2.25,
				"output": 2.75
			},
			"cerebras/gpt-oss-120b": {
				"input": .35,
				"output": .75
			},
			"groq/gpt-oss-20b": {
				"input": .1,
				"output": .5
			},
			"groq/gpt-oss-120b": {
				"input": .15,
				"output": .75
			},
			"scx-ai-gp/glm-5.3-flash": {
				"input": .088,
				"output": .25,
				"cacheRead": .025
			},
			"scx-ai-gp/glm-5.2-fast": {
				"input": 2.2,
				"output": 6.5,
				"cacheRead": .45
			},
			"scx-ai-gp/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"scx-ai-gp/kimi-k3": {
				"input": 3.5,
				"output": 18,
				"cacheRead": .35
			},
			"scx-ai-gp/deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .01
			},
			"scx-ai-gp/glm-5.2": {
				"input": .88,
				"output": 2.55,
				"cacheRead": .16
			},
			"scx-ai-gp/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"scx-ai-gp/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"zai/glm-4.6v": {
				"input": .3,
				"output": .9,
				"cacheRead": .05
			},
			"zai/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"zai/glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-4.5-x": {
				"input": 2.2,
				"output": 8.9,
				"cacheRead": .45
			},
			"zai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"zai/glm-4.5-airx": {
				"input": 1.1,
				"output": 4.5,
				"cacheRead": .22
			},
			"zai/glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .11
			},
			"zai/glm-4-32b-0414-128k": {
				"input": .1,
				"output": .1
			},
			"zai/glm-4.6v-flashx": {
				"input": .04,
				"output": .4,
				"cacheRead": .004
			},
			"zai/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai/glm-4.7-flashx": {
				"input": .07,
				"output": .4,
				"cacheRead": .01
			},
			"zai/glm-4.5-air": {
				"input": .2,
				"output": 1.1,
				"cacheRead": .03
			},
			"zai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"aws-bedrock/claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"aws-bedrock/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"aws-bedrock/llama-4-maverick-17b-instruct": {
				"input": .24,
				"output": .97
			},
			"aws-bedrock/claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"aws-bedrock/claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"aws-bedrock/claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"aws-bedrock/llama-4-scout-17b-instruct": {
				"input": .17,
				"output": .66
			},
			"aws-bedrock/claude-opus-4-1-20250805": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"aws-bedrock/claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"aws-bedrock/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"aws-bedrock/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"aws-bedrock/claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"aws-bedrock/claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"aws-bedrock/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"aws-bedrock/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"aws-bedrock/grok-4-3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"aws-bedrock/claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"aws-bedrock/grok-4-6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"aws-bedrock/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"aws-bedrock/claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"aws-bedrock/grok-4-7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"aws-bedrock/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"aws-bedrock/llama-3.1-70b-instruct": {
				"input": .72,
				"output": .72
			},
			"google-ai-studio/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"google-ai-studio/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .08333
			},
			"google-ai-studio/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google-ai-studio/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": .08333
			},
			"google-ai-studio/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"google-ai-studio/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google-ai-studio/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"google-ai-studio/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google-ai-studio/gemini-pro-latest": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google-ai-studio/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"google-ai-studio/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"google-ai-studio/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .08333
			},
			"anthropic/claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"deepseek/deepseek-v4-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"runpod/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"runware/gemma-4-31b-it": {
				"input": .102,
				"output": .297,
				"cacheRead": .012
			},
			"runware/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"runware/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"runware/deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .01
			},
			"runware/kimi-k2.6": {
				"input": .6,
				"output": 3.05,
				"cacheRead": .13
			},
			"runware/glm-5.2": {
				"input": .8,
				"output": 2.55,
				"cacheRead": .16
			},
			"runware/deepseek-v4-pro": {
				"input": .961,
				"output": 1.922,
				"cacheRead": .079
			},
			"runware/gpt-oss-120b": {
				"input": .032,
				"output": .14,
				"cacheRead": .032
			},
			"runware/glm-5.3": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .2
			},
			"runware/deepseek-v4-flash": {
				"input": .076,
				"output": .153,
				"cacheRead": .014
			},
			"tencent/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"tencent/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"tencent/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"tencent/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"tencent/kimi-k2.6": {
				"input": .858,
				"output": 3.566,
				"cacheRead": .145
			},
			"tencent/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"tencent/mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"tencent/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"tencent/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"tencent/hy3": {
				"input": .132,
				"output": .528,
				"cacheRead": .033
			},
			"tencent/hy-mt2-plus": {
				"input": .074,
				"output": .295
			},
			"tencent/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"tencent/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"tencent/deepseek-v4-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .00363
			},
			"tencent/hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"tencent/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"tencent/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"meta-contributor/muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"meta-contributor/muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"novita/glm-4.6v": {
				"input": .3,
				"output": .9,
				"cacheRead": .055
			},
			"novita/gemma-4-31b-it": {
				"input": .14,
				"output": .4
			},
			"novita/qwen3-vl-235b-a22b-instruct": {
				"input": .3,
				"output": 1.5
			},
			"novita/qwen3.7-max": {
				"input": 1.25,
				"output": 3.75,
				"cacheRead": .25
			},
			"novita/mimo-v2.5": {
				"input": .168,
				"output": .336,
				"cacheRead": .0034
			},
			"novita/qwen3.8-27b": {
				"input": .42,
				"output": 3,
				"cacheRead": .085
			},
			"novita/qwen3-vl-235b-a22b-thinking": {
				"input": .98,
				"output": 3.95
			},
			"novita/qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"novita/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"novita/glm-4.6": {
				"input": .55,
				"output": 2.2,
				"cacheRead": .11
			},
			"novita/qwen3-235b-a22b-instruct-2507": {
				"input": .09,
				"output": .58
			},
			"novita/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"novita/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"novita/llama-4-maverick-17b-instruct": {
				"input": .27,
				"output": .85
			},
			"novita/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"novita/deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"novita/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"novita/kimi-k2.6": {
				"input": .8,
				"output": 3.4,
				"cacheRead": .16
			},
			"novita/qwen3-max": {
				"input": .845,
				"output": 3.38
			},
			"novita/glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .11
			},
			"novita/llama-4-scout-17b-instruct": {
				"input": .18,
				"output": .59
			},
			"novita/qwen3-235b-a22b-fp8": {
				"input": .2,
				"output": .8
			},
			"novita/qwen3-coder-480b-a35b-instruct": {
				"input": .38,
				"output": 1.55
			},
			"novita/qwen3-coder-30b-a3b-instruct": {
				"input": .07,
				"output": .27
			},
			"novita/ling-3.0-flash": {
				"input": .06,
				"output": .18,
				"cacheRead": .012
			},
			"novita/qwen3-vl-30b-a3b-instruct": {
				"input": .2,
				"output": .7
			},
			"novita/gemma-4-26b-a4b-it": {
				"input": .13,
				"output": .4
			},
			"novita/llama-3-70b-instruct": {
				"input": .51,
				"output": .74
			},
			"novita/qwen3-235b-a22b-thinking-2507": {
				"input": .3,
				"output": 3
			},
			"novita/qwen3.5-122b-a10b": {
				"input": .4,
				"output": 3.2
			},
			"novita/llama-3.3-70b-instruct": {
				"input": .135,
				"output": .4
			},
			"novita/qwen3.6-35b-a3b": {
				"input": .248,
				"output": 1.485
			},
			"novita/qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": 1.5
			},
			"novita/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"novita/mimo-v2.5-pro": {
				"input": .522,
				"output": 1.044,
				"cacheRead": .0043
			},
			"novita/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"novita/qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"novita/qwen35-397b-a17b": {
				"input": .6,
				"output": 3.6
			},
			"novita/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"novita/ernie-4.5-vl-424b-a47b": {
				"input": .42,
				"output": 1.25
			},
			"novita/hy3": {
				"input": .14,
				"output": .58,
				"cacheRead": .035
			},
			"novita/kimi-k2": {
				"input": .57,
				"output": 2.3
			},
			"novita/glm-5.1": {
				"input": 1.38,
				"output": 4.4,
				"cacheRead": .26
			},
			"novita/step-3.7-flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"novita/llama-3.2-3b-instruct": {
				"input": .03,
				"output": .05
			},
			"novita/deepseek-v3.2": {
				"input": .269,
				"output": .4,
				"cacheRead": .1345
			},
			"novita/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"novita/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"novita/minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"novita/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"embercloud/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"embercloud/qwen3-coder-next": {
				"input": .108,
				"output": .675,
				"cacheRead": .06
			},
			"embercloud/glm-5": {
				"input": .72,
				"output": 2.3,
				"cacheRead": .144
			},
			"embercloud/kimi-k2.5": {
				"input": .405,
				"output": 1.98,
				"cacheRead": .225
			},
			"embercloud/glm-4.7-flash": {
				"input": .06,
				"output": .4,
				"cacheRead": .01
			},
			"embercloud/glm-4.7": {
				"input": .38,
				"output": 1.98,
				"cacheRead": .19
			},
			"embercloud/glm-5.2": {
				"input": 1.26,
				"output": 3.96,
				"cacheRead": .234
			},
			"embercloud/glm-5.1": {
				"input": .931,
				"output": 2.93,
				"cacheRead": .173
			},
			"embercloud/glm-4.5-air": {
				"input": .13,
				"output": .85,
				"cacheRead": .025
			},
			"perplexity/sonar": {
				"input": .25,
				"output": 2.5,
				"cacheWrite": .25
			},
			"azure-ai-foundry/grok-4-1-fast-reasoning": {
				"input": .2,
				"output": .5
			},
			"azure-ai-foundry/grok-4-1-fast-non-reasoning": {
				"input": .2,
				"output": .5
			},
			"azure-ai-foundry/grok-4-3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"meta/muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"azure/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"azure/gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"azure/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"azure/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"azure/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10
			},
			"azure/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"azure/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"azure/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"azure/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"azure/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"azure/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"azure/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"azure/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"azure/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"azure/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"azure/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"azure/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"azure/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"azure/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"azure/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"azure/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"azure/gpt-oss-120b": {
				"input": .15,
				"output": .6
			},
			"azure/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"azure/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"azure/gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"azure/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"alibaba/qwen-flash": {
				"input": .05,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": .0625
			},
			"alibaba/qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"alibaba/qwen-coder-plus": {
				"input": .502,
				"output": 1.004
			},
			"alibaba/qwen3-vl-plus": {
				"input": .2,
				"output": 1.6,
				"cacheRead": .04,
				"cacheWrite": .25
			},
			"alibaba/qwen3.5-27b": {
				"input": .3,
				"output": 2.4
			},
			"alibaba/qwen-max": {
				"input": 1.6,
				"output": 6.4
			},
			"alibaba/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"alibaba/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"alibaba/glm-5": {
				"input": .573,
				"output": 2.58
			},
			"alibaba/deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"alibaba/qwen-plus": {
				"input": .4,
				"output": 1.2,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"alibaba/qwen3.7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .006,
				"cacheWrite": .0375
			},
			"alibaba/qwen3-max": {
				"input": 1.2,
				"output": 6,
				"cacheRead": .24,
				"cacheWrite": 1.5
			},
			"alibaba/qwen3-vl-flash": {
				"input": .05,
				"output": .4,
				"cacheRead": .01
			},
			"alibaba/qwen3.5-122b-a10b": {
				"input": .4,
				"output": 3.2
			},
			"alibaba/kimi-k2.5": {
				"input": .574,
				"output": 3.011
			},
			"alibaba/qwen3.6-35b-a3b": {
				"input": .375,
				"output": 2.25
			},
			"alibaba/qwen3.6-flash": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .05,
				"cacheWrite": .3125
			},
			"alibaba/qwen3-coder-flash": {
				"input": .3,
				"output": 1.5,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"alibaba/qwen3-coder-plus": {
				"input": 1,
				"output": 5,
				"cacheRead": .2,
				"cacheWrite": 1.25
			},
			"alibaba/qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"alibaba/qwen35-397b-a17b": {
				"input": .6,
				"output": 3.6
			},
			"alibaba/qwen3.5-35b-a3b": {
				"input": .25,
				"output": 2
			},
			"alibaba/qwen3.6-max-preview": {
				"input": 1.3,
				"output": 7.8,
				"cacheRead": .13
			},
			"alibaba/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .28
			},
			"alibaba/qwen-omni-turbo": {
				"input": .2,
				"output": .8
			},
			"alibaba/deepseek-v4-pro": {
				"input": 2.4,
				"output": 4.8,
				"cacheRead": .2
			},
			"alibaba/qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"alibaba/qwen-plus-latest": {
				"input": .4,
				"output": 1.2,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"alibaba/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .28
			},
			"alibaba/qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"alibaba/deepseek-v4-flash": {
				"input": .2,
				"output": .4,
				"cacheRead": .04
			},
			"baidu/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"baidu/deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"baidu/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"baidu/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"baidu/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"baidu/deepseek-v4-pro": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .042
			},
			"baidu/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"baidu/deepseek-v4-flash": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .014
			},
			"gonka24/glm-5.3-flash": {
				"input": .15,
				"output": .3,
				"cacheRead": .035
			},
			"gonka24/minimax-m2.7": {
				"input": .08,
				"output": .32,
				"cacheRead": .017
			},
			"gonka24/deepseek-v4-flash": {
				"input": .065,
				"output": .116,
				"cacheRead": .012
			},
			"bytedance/seed-1-6-flash-250715": {
				"input": .07,
				"output": .3,
				"cacheRead": .015
			},
			"bytedance/seed-2-0-code-preview-260328": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"bytedance/seed-1-6-250915": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"bytedance/seed-2-0-mini-260428": {
				"input": .1,
				"output": .4,
				"cacheRead": .02
			},
			"bytedance/seed-2-0-pro-260328": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"bytedance/seed-1-8-251228": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"bytedance/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"bytedance/seed-1-6-250615": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"bytedance/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"bytedance/seed-2-0-lite-260428": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"bytedance/deepseek-v4-pro": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"bytedance/deepseek-v3.2": {
				"input": .28,
				"output": .42,
				"cacheRead": .056
			},
			"bytedance/gpt-oss-120b": {
				"input": .1,
				"output": .5,
				"cacheRead": .02
			},
			"bytedance/deepseek-v4-flash": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .014
			},
			"xai/grok-4-5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"xai/grok-build-0-1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"xai/grok-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .75
			},
			"xai/grok-4-20-beta-0309-non-reasoning": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"xai/grok-4-3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4-20-beta-0309-reasoning": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"xai/grok-4-6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"xai/grok-4-7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"ranoai/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"canopywave/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"canopywave/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"canopywave/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"canopywave/deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .01
			},
			"canopywave/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .03
			},
			"fireworks/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"fireworks/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"fireworks/deepseek-v4.1-flash": {
				"input": .22,
				"output": .66,
				"cacheRead": .007
			},
			"fireworks/kimi-k3-fast": {
				"input": 4.5,
				"output": 22.5,
				"cacheRead": .45
			},
			"fireworks/deepseek-v4-pro": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"fireworks/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"fireworks/deepseek-v4-flash": {
				"input": .22,
				"output": .66,
				"cacheRead": .007
			},
			"sakana/fugu-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"sakana/fugu-ultra-v2.0": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana/fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"scx-ai/gemma-4-31b-it": {
				"input": .3,
				"output": .91
			},
			"scx-ai/llama-4-maverick-17b-instruct": {
				"input": .53,
				"output": 1.62
			},
			"scx-ai/qwen3-32b": {
				"input": .36,
				"output": .87
			},
			"scx-ai/minimax-m2.7": {
				"input": .48,
				"output": 1.79,
				"cacheRead": .05
			},
			"scx-ai/gpt-oss-120b": {
				"input": .17,
				"output": .55
			},
			"together-ai/qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"together-ai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"together-ai/muse-glimmer-30b": {
				"input": .35,
				"output": 1.5,
				"cacheRead": .04
			},
			"together-ai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"together-ai/deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"together-ai/glm-4.7": {
				"input": .45,
				"output": 2
			},
			"together-ai/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"together-ai/deepseek-v4-pro": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .13
			},
			"together-ai/gpt-oss-120b": {
				"input": .15,
				"output": .6
			},
			"together-ai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"together-ai/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .03
			},
			"xiaomi/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"xiaomi/mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"xiaomi/mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"xiaomi/mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"quartz/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/minimax-m2.1-lightning": {
				"input": .12,
				"output": .48
			},
			"minimax/minimax-text-01": {
				"input": .2,
				"output": 1.1
			},
			"minimax/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m3": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"minimax/minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06
			},
			"minimax/minimax-m2.5-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .03
			},
			"minimax/minimax-m2.1": {
				"input": .27,
				"output": 1.1
			},
			"minimax/minimax-m2": {
				"input": .2,
				"output": 1,
				"cacheRead": .03
			},
			"inference.net/glm-5.3-flash": {
				"input": .09,
				"output": .28,
				"cacheRead": .02
			},
			"inference.net/llama-3.2-11b-instruct": {
				"input": .07,
				"output": .33
			},
			"inference.net/glm-5.3": {
				"input": .9,
				"output": 3,
				"cacheRead": .15
			},
			"azure-anthropic/claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"azure-anthropic/claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"azure-anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"azure-anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"azure-anthropic/claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"azure-anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"azure-anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"azure-anthropic/claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"azure-anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"atria/atria-dawn-preview": {
				"input": 0,
				"output": 0
			},
			"mistral/mistral-large-latest": {
				"input": 4,
				"output": 12
			},
			"mistral/ministral-8b-2512": {
				"input": .15,
				"output": .15
			},
			"mistral/devstral-2512": {
				"input": .4,
				"output": 2
			},
			"mistral/mistral-medium-3-5": {
				"input": 1.5,
				"output": 7.5
			},
			"mistral/mistral-small-2603": {
				"input": .15,
				"output": .6
			},
			"mistral/mistral-large-2512": {
				"input": .5,
				"output": 1.5
			},
			"mistral/ministral-14b-2512": {
				"input": .2,
				"output": .2
			},
			"mistral/mistral-small-2506": {
				"input": .1,
				"output": .3
			},
			"mistral/ministral-3b-2512": {
				"input": .1,
				"output": .1
			},
			"mistral/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"mistral/codestral-2508": {
				"input": .3,
				"output": .9
			},
			"vertex-anthropic/claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1
			},
			"vertex-anthropic/claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"vertex-anthropic/claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"vertex-anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"vertex-anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"vertex-anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"vertex-anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"vertex-openai/qwen3-235b-a22b-instruct-2507": {
				"input": .22,
				"output": .88
			},
			"vertex-openai/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.2
			},
			"vertex-openai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .1
			},
			"vertex-openai/qwen3-coder-480b-a35b-instruct": {
				"input": .22,
				"output": 1.8,
				"cacheRead": .022
			},
			"vertex-openai/kimi-k2-thinking": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .06
			},
			"vertex-openai/qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": 1.2
			},
			"vertex-openai/glm-4.7": {
				"input": .6,
				"output": 2.2
			},
			"vertex-openai/grok-4-20-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"vertex-openai/grok-4-6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"vertex-openai/grok-4-20-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"vertex-openai/deepseek-v3.2": {
				"input": .56,
				"output": 1.68,
				"cacheRead": .056
			},
			"google-vertex/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"google-vertex/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .08333
			},
			"google-vertex/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google-vertex/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": .08333
			},
			"google-vertex/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"google-vertex/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google-vertex/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"google-vertex/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google-vertex/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"google-vertex/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"google-vertex/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .08333
			},
			"aws-mantle/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"aws-mantle/gpt-5.6-luna": {
				"input": .22,
				"output": 1.32,
				"cacheRead": .022,
				"cacheWrite": .275
			},
			"aws-mantle/gpt-5.6-terra": {
				"input": 2.2,
				"output": 13.2,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"aws-mantle/gpt-5.6-sol": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .44,
				"cacheWrite": 5.5
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5
			},
			"openai/gpt-4o-transcribe": {
				"input": 2.5,
				"output": 10
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-4": {
				"input": 30,
				"output": 60
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"openai/gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-4o-mini-transcribe": {
				"input": 1.25,
				"output": 5
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"moonshot/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshot/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"moonshot/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshot/kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"moonshot/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			}
		},
		"above": {
			"mimo-v2.6-pro": {
				"input": .5077,
				"output": 1.0154,
				"cacheRead": .0042
			},
			"glm-5.3-flash": {
				"input": .165,
				"output": .55,
				"cacheRead": .0319
			},
			"glm-5.2-fast": {
				"input": 2.31,
				"output": 7.26,
				"cacheRead": .231
			},
			"qwen3.8-max": {
				"input": 2.2,
				"output": 6.6,
				"cacheRead": .275
			},
			"deepseek-v4.1-flash": {
				"input": .165,
				"output": .66,
				"reasoning": .66,
				"cacheRead": .0033
			},
			"mimo-v2.6-pro-ultraspeed": {
				"input": 5.0769,
				"output": 10.1538,
				"cacheRead": .0423
			},
			"mimo-v2.6-flash": {
				"input": .1692,
				"output": .3385,
				"cacheRead": .0034
			},
			"glm-5.2": {
				"input": 1.54,
				"output": 4.84,
				"cacheRead": .154
			},
			"deepseek-v4-pro": {
				"input": .726,
				"output": 2.178,
				"reasoning": 2.178,
				"cacheRead": .0242
			},
			"deepseek-v4-flash": {
				"input": .165,
				"output": .66,
				"reasoning": .66,
				"cacheRead": .0033
			}
		},
		"kilo": {
			"sao10k/l3-lunaris-8b": {
				"input": .04,
				"output": .05
			},
			"sao10k/l3.3-euryale-70b": {
				"input": .65,
				"output": .75
			},
			"sao10k/l3.1-euryale-70b": {
				"input": .85,
				"output": .85
			},
			"kwaipilot/kat-coder-pro-v2.5": {
				"input": .74,
				"output": 2.96,
				"cacheRead": .15
			},
			"stealth/claude-opus-4.6": {
				"input": 4,
				"output": 20,
				"reasoning": 0,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"stealth/claude-opus-4.7": {
				"input": 4,
				"output": 20,
				"reasoning": 0,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"stealth/claude-opus-4.8": {
				"input": 4,
				"output": 20,
				"reasoning": 0,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"stealth/space-bunny-alpha": {
				"input": 0,
				"output": 0
			},
			"stealth/claude-sonnet-4.6": {
				"input": 2.4,
				"output": 12,
				"reasoning": 0,
				"cacheRead": .24,
				"cacheWrite": 3
			},
			"stealth/qwen3.6-plus": {
				"input": .25,
				"output": 1.5,
				"reasoning": 0,
				"cacheRead": .025,
				"cacheWrite": .3125
			},
			"bytedance-seed/seed-1.6-flash": {
				"input": .075,
				"output": .3
			},
			"bytedance-seed/seed-2.0-lite": {
				"input": .25,
				"output": 2
			},
			"bytedance-seed/seed-2-1-turbo": {
				"input": .5,
				"output": 2.5
			},
			"bytedance-seed/seed-2.0-mini": {
				"input": .1,
				"output": .4
			},
			"bytedance-seed/seed-2.0-code": {
				"input": .5,
				"output": 3
			},
			"bytedance-seed/seed-1.6": {
				"input": .25,
				"output": 2
			},
			"~moonshotai/kimi-latest": {
				"input": .615,
				"output": 13,
				"cacheRead": .45
			},
			"poolside/laguna-s-2.1:free": {
				"input": 0,
				"output": 0
			},
			"poolside/laguna-s-2.1": {
				"input": .1,
				"output": .2,
				"cacheRead": .01
			},
			"poolside/laguna-xs-2.1:free": {
				"input": 0,
				"output": 0
			},
			"poolside/laguna-xs-2.1": {
				"input": .1,
				"output": .2,
				"cacheRead": .05
			},
			"prism-ml/ternary-bonsai-2-27b": {
				"input": .075,
				"output": .5,
				"cacheRead": .0375
			},
			"anthropic/claude-opus-4.1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic/claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-5.5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"nex-agi/nex-n2.5-mini": {
				"input": .025,
				"output": .1,
				"cacheRead": .0025
			},
			"nex-agi/nex-n2.5-pro": {
				"input": .075,
				"output": .25,
				"cacheRead": .015
			},
			"cohere/command-r-08-2024": {
				"input": .15,
				"output": .6
			},
			"cohere/command-a-plus": {
				"input": .3,
				"output": 1.5,
				"cacheRead": .15
			},
			"cohere/command-a": {
				"input": 2.5,
				"output": 10
			},
			"cohere/north-mini-code:free": {
				"input": 0,
				"output": 0
			},
			"cohere/command-r7b-12-2024": {
				"input": .0375,
				"output": .15
			},
			"cohere/command-r-plus-08-2024": {
				"input": 2.5,
				"output": 10
			},
			"deepseek/deepseek-chat-v3.1": {
				"input": .25,
				"output": .95,
				"cacheRead": .13
			},
			"deepseek/deepseek-v4-flash-0731": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .028
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"deepseek/deepseek-v4-flash-vision-exp": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .028
			},
			"deepseek/deepseek-v3.1-terminus": {
				"input": .27,
				"output": 1
			},
			"deepseek/deepseek-chat": {
				"input": .2574,
				"output": 1.0287
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"deepseek/deepseek-v3.2-exp": {
				"input": .27,
				"output": .41
			},
			"deepseek/deepseek-chat-v3-0324": {
				"input": .29,
				"output": 1.14,
				"cacheRead": .11
			},
			"deepseek/deepseek-r1": {
				"input": .7,
				"output": 2.5
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.6,
				"output": 3.2,
				"cacheRead": .135
			},
			"deepseek/deepseek-r1-0528": {
				"input": .7,
				"output": 2.5,
				"cacheRead": .35
			},
			"deepseek/deepseek-v3.2": {
				"input": .28,
				"output": .42,
				"cacheRead": .028
			},
			"deepseek/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"unbiased/pareto-26.10-preview": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .03
			},
			"unbiased/pareto": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .25
			},
			"tencent/hy3-preview": {
				"input": .18,
				"output": .6,
				"cacheRead": .06
			},
			"tencent/hunyuan-a13b-instruct": {
				"input": .14,
				"output": .57
			},
			"tencent/hy-mt2-30b-a3b": {
				"input": .074,
				"output": .295
			},
			"tencent/hy-mt2-1.8b": {
				"input": .044,
				"output": .177
			},
			"tencent/hy3": {
				"input": .13,
				"output": .53,
				"cacheRead": .033
			},
			"tencent/hy-mt2-7b": {
				"input": .074,
				"output": .295
			},
			"tencent/hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"anthracite-org/magnum-v4-72b": {
				"input": 2.5,
				"output": 5
			},
			"meta-llama/llama-4-scout": {
				"input": .1,
				"output": .3
			},
			"meta-llama/llama-guard-4-12b": {
				"input": .18,
				"output": .18
			},
			"meta-llama/llama-4-maverick": {
				"input": .1875,
				"output": .6525
			},
			"meta-llama/llama-3.3-70b-instruct": {
				"input": .1,
				"output": .32
			},
			"meta-llama/llama-3.1-8b-instruct": {
				"input": .02,
				"output": .04
			},
			"meta-llama/llama-3.2-1b-instruct": {
				"input": .027,
				"output": .201
			},
			"meta-llama/llama-3.2-3b-instruct": {
				"input": .05,
				"output": .33
			},
			"meta-llama/llama-3.1-70b-instruct": {
				"input": .4,
				"output": .4
			},
			"~google/gemini-flash-latest": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"~google/gemini-pro-latest": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"perceptron/perceptron-mk1": {
				"input": .15,
				"output": 1.5
			},
			"perceptron/perceptron-mk1.5": {
				"input": .15,
				"output": 1.5
			},
			"z-ai/glm-4.6v": {
				"input": .3,
				"output": .9,
				"cacheRead": .05
			},
			"z-ai/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"z-ai/glm-5.3-prime": {
				"input": 2.8,
				"output": 8.8,
				"cacheRead": .56
			},
			"z-ai/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"z-ai/glm-4.6": {
				"input": .43,
				"output": 1.75,
				"cacheRead": .08
			},
			"z-ai/glm-5": {
				"input": .6,
				"output": 1.92,
				"cacheRead": .12
			},
			"z-ai/glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .11
			},
			"z-ai/glm-5.3-flashx": {
				"input": .37,
				"output": 1.25,
				"cacheRead": .09
			},
			"z-ai/glm-4.7-flash": {
				"input": .0605,
				"output": .4
			},
			"z-ai/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"z-ai/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"z-ai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"z-ai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/glm-4.5-air": {
				"input": .13,
				"output": .85,
				"cacheRead": .025
			},
			"z-ai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"inference-net/schematron-v2-small": {
				"input": .05,
				"output": .23,
				"cacheRead": .05
			},
			"inference-net/schematron-v2-turbo": {
				"input": .03,
				"output": .15,
				"cacheRead": .03
			},
			"thinkingmachines/inkling-small:free": {
				"input": 0,
				"output": 0
			},
			"thinkingmachines/inkling-small": {
				"input": .45,
				"output": 1.2,
				"cacheRead": .1
			},
			"thinkingmachines/inkling": {
				"input": .95,
				"output": 4.05,
				"cacheRead": .16
			},
			"meituan/longcat-2.0": {
				"input": .75,
				"output": 3,
				"cacheRead": .015
			},
			"openrouter/bodybuilder": {
				"input": 0,
				"output": 0
			},
			"openrouter/free": {
				"input": 0,
				"output": 0
			},
			"openrouter/pareto-code": {
				"input": 0,
				"output": 0
			},
			"openrouter/auto": {
				"input": 0,
				"output": 0
			},
			"perplexity/sonar-pro": {
				"input": 3,
				"output": 15
			},
			"perplexity/sonar-deep-research": {
				"input": 2,
				"output": 8,
				"reasoning": 3
			},
			"perplexity/sonar": {
				"input": 1,
				"output": 1
			},
			"perplexity/sonar-reasoning-pro": {
				"input": 2,
				"output": 8
			},
			"perplexity/sonar-pro-search": {
				"input": 3,
				"output": 15
			},
			"meta/muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-glimmer-30b": {
				"input": .3,
				"output": 1.1,
				"cacheRead": .04
			},
			"meta/muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"meta/muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"nousresearch/hermes-3-llama-3.1-70b": {
				"input": .7,
				"output": .7
			},
			"nousresearch/hermes-3-llama-3.1-405b": {
				"input": 1,
				"output": 1
			},
			"nousresearch/hermes-4-405b": {
				"input": 1,
				"output": 3
			},
			"~z-ai/glm-flash-latest": {
				"input": .02625,
				"output": .928749,
				"cacheRead": .015
			},
			"~z-ai/glm-latest": {
				"input": .12,
				"output": 4,
				"cacheRead": .08
			},
			"arcee-ai/trinity-large-thinking": {
				"input": .25,
				"output": .8,
				"cacheRead": .06
			},
			"~openai/gpt-terra-latest": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"~openai/gpt-luna-latest": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"~openai/gpt-sol-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"~openai/gpt-astra-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"~openai/gpt-mini-latest": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"cognitivecomputations/dolphin-mistral-24b-venice-edition": {
				"input": .2,
				"output": .9
			},
			"thedrummer/skyfall-36b-v2": {
				"input": .55,
				"output": .8,
				"cacheRead": .25
			},
			"thedrummer/unslopnemo-12b": {
				"input": .4,
				"output": .4
			},
			"thedrummer/cydonia-24b-v4.1": {
				"input": .3,
				"output": .5,
				"cacheRead": .15
			},
			"baidu/ernie-4.5-vl-424b-a47b": {
				"input": .42,
				"output": 1.25
			},
			"x-ai/grok-4.20-multi-agent": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"x-ai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"x-ai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"x-ai/grok-4.20": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"~anthropic/claude-opus-latest": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"~anthropic/claude-haiku-latest": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"~anthropic/claude-sonnet-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"~anthropic/claude-fable-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"upstage/solar-pro-3": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"upstage/solar-pro4": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"upstage/solar-mini4": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"~deepseek/deepseek-flash-latest": {
				"input": .015,
				"output": .676999,
				"cacheRead": .005
			},
			"~deepseek/deepseek-pro-latest": {
				"input": .11,
				"output": 2.7,
				"cacheRead": .099
			},
			"~deepseek/deepseek-v4-flash-latest": {
				"input": .0171,
				"output": 1.28,
				"cacheRead": .0154
			},
			"~x-ai/grok-latest": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"bytedance/ui-tars-1.5-7b": {
				"input": .1,
				"output": .2,
				"cacheRead": .1
			},
			"liquid/lfm-2.5-2.6b:free": {
				"input": 0,
				"output": 0
			},
			"google/gemma-4-31b-it": {
				"input": .09,
				"output": .34,
				"cacheRead": .05
			},
			"google/gemini-3.1-flash-image-preview": {
				"input": .5,
				"output": 3
			},
			"google/lyria-3-pro-preview": {
				"input": 0,
				"output": 0
			},
			"google/gemma-3-27b-it": {
				"input": .08,
				"output": .16
			},
			"google/gemini-2.5-flash-image": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"google/gemma-2-27b-it": {
				"input": .65,
				"output": .65
			},
			"google/gemini-3.6-flash": {
				"input": .375,
				"output": 1.875,
				"reasoning": 1.875,
				"cacheRead": .0375,
				"cacheWrite": .020833
			},
			"google/gemma-4-26b-a4b-it": {
				"input": .042,
				"output": .22,
				"cacheRead": .021
			},
			"google/gemini-3-pro-image-preview": {
				"input": 1,
				"output": 6,
				"reasoning": 6,
				"cacheRead": .1,
				"cacheWrite": .1875
			},
			"google/gemini-3.5-flash-lite": {
				"input": .15,
				"output": 1.25,
				"reasoning": 1.25,
				"cacheRead": .015,
				"cacheWrite": .041667
			},
			"google/gemini-3.1-flash-image": {
				"input": .5,
				"output": 3
			},
			"google/lyria-3-clip-preview": {
				"input": 0,
				"output": 0
			},
			"google/gemini-3.1-pro-preview": {
				"input": 1,
				"output": 6,
				"reasoning": 6,
				"cacheRead": .1,
				"cacheWrite": .1875
			},
			"google/gemma-3-12b-it": {
				"input": .05,
				"output": .15
			},
			"google/gemini-3.5-flash": {
				"input": .75,
				"output": 4.5,
				"reasoning": 4.5,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"reasoning": 10,
				"cacheRead": .125,
				"cacheWrite": .375
			},
			"google/gemini-3-pro-image": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"google/gemini-3.1-flash-lite-image": {
				"input": .25,
				"output": 1.5
			},
			"google/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3-flash-preview": {
				"input": .25,
				"output": 1.5,
				"reasoning": 1.5,
				"cacheRead": .025,
				"cacheWrite": .041667
			},
			"google/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemma-3-4b-it": {
				"input": .05,
				"output": .1
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"reasoning": .4,
				"cacheRead": .01,
				"cacheWrite": .083333
			},
			"google/gemini-2.5-pro-preview": {
				"input": 1.25,
				"output": 10,
				"reasoning": 10,
				"cacheRead": .125,
				"cacheWrite": .375
			},
			"google/gemini-3.1-flash-lite-preview": {
				"input": .125,
				"output": .75,
				"reasoning": .75,
				"cacheRead": .0125,
				"cacheWrite": .041667
			},
			"google/gemini-3.1-flash-lite": {
				"input": .125,
				"output": .75,
				"reasoning": .75,
				"cacheRead": .0125,
				"cacheWrite": .041667
			},
			"writer/palmyra-x5": {
				"input": .6,
				"output": 6
			},
			"ibm-granite/granite-4.0-h-micro": {
				"input": .017,
				"output": .112
			},
			"ibm-granite/granite-4.2-8b": {
				"input": .06,
				"output": .25,
				"cacheRead": .015
			},
			"fireworks/ember-1": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"mistralai/mistral-nemo": {
				"input": .15,
				"output": .15,
				"cacheRead": .015
			},
			"mistralai/ministral-8b-2512": {
				"input": .15,
				"output": .15,
				"cacheRead": .015
			},
			"mistralai/mistral-small-24b-instruct-2501": {
				"input": .05,
				"output": .08
			},
			"mistralai/devstral-2512": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistralai/mistral-saba": {
				"input": .2,
				"output": .6,
				"cacheRead": .02
			},
			"mistralai/mistral-medium-3-5": {
				"input": 1.5,
				"output": 7.5
			},
			"mistralai/mistral-medium-3.1": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistralai/mistral-small-3.2-24b-instruct": {
				"input": .1,
				"output": .3,
				"cacheRead": .01
			},
			"mistralai/mistral-large": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"mistralai/mistral-small-2603": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"mistralai/mistral-medium-3": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistralai/voxtral-small-24b-2507": {
				"input": .1,
				"output": .3,
				"cacheRead": .01
			},
			"mistralai/mistral-large-2512": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"mistralai/mistral-large-2407": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"mistralai/ministral-14b-2512": {
				"input": .2,
				"output": .2,
				"cacheRead": .02
			},
			"mistralai/mistral-small-3.1-24b-instruct": {
				"input": .351,
				"output": .555
			},
			"mistralai/ministral-3b-2512": {
				"input": .1,
				"output": .1,
				"cacheRead": .01
			},
			"mistralai/mixtral-8x22b-instruct": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"mistralai/codestral-2508": {
				"input": .3,
				"output": .9,
				"cacheRead": .03
			},
			"sakana/fugu-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"sakana/fugu-ultra-v2": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana/fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana/sakana-namazu": {
				"input": .95,
				"output": 4,
				"cacheRead": .15
			},
			"inclusionai/ling-3.0-flash-sante:free": {
				"input": 0,
				"output": 0
			},
			"inclusionai/ling-3.0-flash": {
				"input": .06,
				"output": .18,
				"cacheRead": .012
			},
			"inclusionai/ling-3.1-flash": {
				"input": 0,
				"output": 0
			},
			"inclusionai/ling-3.0-flash-vl": {
				"input": .075,
				"output": .22,
				"cacheRead": .015
			},
			"inclusionai/ling-3.0-flash-fin": {
				"input": .075,
				"output": .22,
				"cacheRead": .015
			},
			"moonshotai/kimi-k3": {
				"input": 2.7,
				"output": 13.5,
				"cacheRead": .27
			},
			"moonshotai/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshotai/kimi-k2-thinking": {
				"input": .6,
				"output": 2.5
			},
			"moonshotai/kimi-k2.5": {
				"input": .6,
				"output": 3
			},
			"moonshotai/kimi-k2-0905": {
				"input": .6,
				"output": 2.5
			},
			"moonshotai/kimi-k2": {
				"input": .57,
				"output": 2.3
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .6712,
				"output": 3.35,
				"cacheRead": .18
			},
			"kilo-auto/small": {
				"input": .05,
				"output": .4,
				"reasoning": 0,
				"cacheRead": .005
			},
			"kilo-auto/efficient": {
				"input": .325,
				"output": 1.95,
				"reasoning": 0,
				"cacheRead": .0325,
				"cacheWrite": .40625
			},
			"kilo-auto/free": {
				"input": 0,
				"output": 0,
				"reasoning": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"kilo-auto/frontier": {
				"input": 5,
				"output": 25,
				"reasoning": 0,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kilo-auto/balanced": {
				"input": .325,
				"output": 1.95,
				"reasoning": 0,
				"cacheRead": .0325,
				"cacheWrite": .40625
			},
			"rekaai/reka-flash-3": {
				"input": .1,
				"output": .2
			},
			"rekaai/reka-edge": {
				"input": .1,
				"output": .1
			},
			"apodex/apodex-1.1-mini:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-nano-30b-a3b": {
				"input": .05,
				"output": .2,
				"cacheRead": .03
			},
			"nvidia/nemotron-3.5-content-safety:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3.5-lightning": {
				"input": .039,
				"output": .18,
				"cacheRead": .0195
			},
			"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-super-120b-a12b": {
				"input": .08,
				"output": .45
			},
			"nvidia/nemotron-3-ultra-550b-a55b:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-ultra-550b-a55b": {
				"input": .5,
				"output": 2.2,
				"cacheRead": .1
			},
			"nvidia/nemotron-3-super-120b-a12b:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3.5-content-safety": {
				"input": .2,
				"output": .2
			},
			"nvidia/nemotron-3.5-lightning:free": {
				"input": 0,
				"output": 0
			},
			"xiaomi/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .004
			},
			"xiaomi/mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .003
			},
			"xiaomi/mimo-v2.6-pro-ultraspeed": {
				"input": 4.35,
				"output": 8.7,
				"cacheRead": .036
			},
			"xiaomi/mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .004
			},
			"xiaomi/mimo-v2.6-flash": {
				"input": .12,
				"output": .28,
				"cacheRead": .01
			},
			"undi95/remm-slerp-l2-13b": {
				"input": .35,
				"output": .65
			},
			"gryphe/mythomax-l2-13b": {
				"input": .08,
				"output": .11
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/minimax-01": {
				"input": .2,
				"output": 1.1
			},
			"minimax/minimax-m2-her": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m1": {
				"input": .4,
				"output": 2.2
			},
			"minimax/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/minimax-m2": {
				"input": .3,
				"output": 1.2
			},
			"mancer/weaver": {
				"input": .4,
				"output": .75
			},
			"stepfun/step-3.7-flash:free": {
				"input": 0,
				"output": 0,
				"reasoning": 0,
				"cacheRead": 0
			},
			"stepfun/step-3.5-flash": {
				"input": .1,
				"output": .3
			},
			"stepfun/step-3.7-flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"dots-studio/dots-3-note-preview:free": {
				"input": 0,
				"output": 0
			},
			"inception/mercury-2.5": {
				"input": .2,
				"output": .75,
				"cacheRead": .02
			},
			"inception/mercury-2": {
				"input": .25,
				"output": .75,
				"cacheRead": .025
			},
			"amazon/nova-lite-v1": {
				"input": .06,
				"output": .24
			},
			"amazon/nova-2-lite-v1": {
				"input": .3,
				"output": 2.5
			},
			"amazon/nova-pro-v1": {
				"input": .8,
				"output": 3.2
			},
			"amazon/nova-premier-v1": {
				"input": 2.5,
				"output": 12.5,
				"cacheRead": .625
			},
			"amazon/nova-micro-v1": {
				"input": .035,
				"output": .14
			},
			"relace/relace-search": {
				"input": 1,
				"output": 3
			},
			"relace/relace-apply-3": {
				"input": .85,
				"output": 1.25
			},
			"aion-labs/aion-2.0": {
				"input": .8,
				"output": 1.6,
				"cacheRead": .2
			},
			"aion-labs/aion-rp-llama-3.1-8b": {
				"input": .8,
				"output": 1.6
			},
			"aion-labs/aion-3.0": {
				"input": 3,
				"output": 6,
				"cacheRead": .75
			},
			"aion-labs/aion-3.5": {
				"input": 3,
				"output": 6,
				"cacheRead": .75
			},
			"aion-labs/aion-3.5-mini": {
				"input": .7,
				"output": 1.4,
				"cacheRead": .18
			},
			"aion-labs/aion-3.0-mini": {
				"input": .7,
				"output": 1.4,
				"cacheRead": .18
			},
			"qwen/qwen3-235b-a22b-2507": {
				"input": .1495,
				"output": .598
			},
			"qwen/qwen3-vl-235b-a22b-instruct": {
				"input": .26,
				"output": 1.04
			},
			"qwen/qwen3.7-max": {
				"input": 1.475,
				"output": 4.425,
				"cacheRead": .295,
				"cacheWrite": 1.84375
			},
			"qwen/qwen3.8-27b": {
				"input": .425,
				"output": 2.55,
				"cacheRead": .085,
				"cacheWrite": .53125
			},
			"qwen/qwen3-vl-235b-a22b-thinking": {
				"input": .4,
				"output": 4
			},
			"qwen/qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"qwen/qwen3.5-27b": {
				"input": .195,
				"output": 1.56
			},
			"qwen/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.2
			},
			"qwen/qwen3-coder-next": {
				"input": .3,
				"output": 1.5
			},
			"qwen/qwen3-coder": {
				"input": .975,
				"output": 4.875
			},
			"qwen/qwen3-32b": {
				"input": .08,
				"output": .28
			},
			"qwen/qwen-plus": {
				"input": .26,
				"output": .78,
				"cacheRead": .052,
				"cacheWrite": .325
			},
			"qwen/qwen3.7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .006,
				"cacheWrite": .038
			},
			"qwen/qwen3-max": {
				"input": .78,
				"output": 3.9,
				"cacheRead": .156,
				"cacheWrite": .975
			},
			"qwen/qwen3-coder-30b-a3b-instruct": {
				"input": .2925,
				"output": 1.4625
			},
			"qwen/qwen3.8-omni-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"qwen/qwen3-vl-30b-a3b-instruct": {
				"input": .13,
				"output": .52
			},
			"qwen/qwen3-235b-a22b-thinking-2507": {
				"input": .23,
				"output": 2.3
			},
			"qwen/qwen3-235b-a22b": {
				"input": .455,
				"output": 1.82
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .26,
				"output": 2.08
			},
			"qwen/qwen-plus-2025-07-28": {
				"input": .26,
				"output": .78
			},
			"qwen/qwen3.6-35b-a3b": {
				"input": .15,
				"output": 1,
				"cacheRead": .05
			},
			"qwen/qwen3-next-80b-a3b-instruct": {
				"input": .0975,
				"output": .78
			},
			"qwen/qwen3-vl-30b-a3b-thinking": {
				"input": .2,
				"output": 2.4
			},
			"qwen/qwen3.6-flash": {
				"input": .1875,
				"output": 1.125,
				"cacheWrite": .234375
			},
			"qwen/qwen3-coder-flash": {
				"input": .195,
				"output": .975,
				"cacheRead": .039,
				"cacheWrite": .24375
			},
			"qwen/qwen-2.5-coder-32b-instruct": {
				"input": .66,
				"output": 1
			},
			"qwen/qwen3.5-flash-02-23": {
				"input": .065,
				"output": .26
			},
			"qwen/qwen3-max-thinking": {
				"input": .78,
				"output": 3.9
			},
			"qwen/qwen3-coder-plus": {
				"input": .65,
				"output": 3.25,
				"cacheRead": .13,
				"cacheWrite": .8125
			},
			"qwen/qwen3.5-9b": {
				"input": .1,
				"output": .15
			},
			"qwen/qwen3.8-max-prime": {
				"input": 4,
				"output": 12,
				"cacheRead": .5
			},
			"qwen/qwen3.5-plus-20260420": {
				"input": .3,
				"output": 1.8,
				"cacheWrite": .375
			},
			"qwen/qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"qwen/qwen3.5-35b-a3b": {
				"input": .1625,
				"output": 1.3
			},
			"qwen/qwen3.6-max-preview": {
				"input": 1.027,
				"output": 6.162,
				"cacheWrite": 1.28375
			},
			"qwen/qwen3-30b-a3b": {
				"input": .13,
				"output": .52
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .39,
				"output": 2.34
			},
			"qwen/qwen3-8b": {
				"input": .117,
				"output": .455
			},
			"qwen/qwen3-vl-32b-instruct": {
				"input": .104,
				"output": .416
			},
			"qwen/qwen3-vl-8b-instruct": {
				"input": .117,
				"output": .455
			},
			"qwen/qwen3-30b-a3b-instruct-2507": {
				"input": .13,
				"output": .52
			},
			"qwen/qwen2.5-vl-72b-instruct": {
				"input": .8,
				"output": 1,
				"cacheRead": .4
			},
			"qwen/qwen-2.5-7b-instruct": {
				"input": .1,
				"output": .2
			},
			"qwen/qwen3.5-plus-02-15": {
				"input": .26,
				"output": 1.56
			},
			"qwen/qwen-2.5-72b-instruct": {
				"input": .36,
				"output": .4
			},
			"qwen/qwen3-30b-a3b-thinking-2507": {
				"input": .2,
				"output": 2.4
			},
			"qwen/qwen3.6-27b": {
				"input": .45,
				"output": 2.7
			},
			"qwen/qwen3.6-plus": {
				"input": .325,
				"output": 1.95,
				"cacheWrite": .40625
			},
			"qwen/qwen3-14b": {
				"input": .2275,
				"output": .91
			},
			"qwen/qwen3-vl-8b-thinking": {
				"input": .18,
				"output": 2.1
			},
			"qwen/qwen3.7-plus": {
				"input": .32,
				"output": 1.28,
				"cacheRead": .064,
				"cacheWrite": .4
			},
			"qwen/qwen3.8-27b:free": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen3.8-max-0902": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"morph/morph-v3-large": {
				"input": .9,
				"output": 1.9
			},
			"morph/morph-v3-fast": {
				"input": .8,
				"output": 1.2
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-image-2": {
				"input": 8,
				"output": 15,
				"cacheRead": 2
			},
			"openai/gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-audio": {
				"input": 2.5,
				"output": 10
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5
			},
			"openai/gpt-6-astra-pro": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-4o-2024-05-13": {
				"input": 5,
				"output": 15
			},
			"openai/gpt-4o-mini-2024-07-18": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-chat-latest": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-audio-mini": {
				"input": .6,
				"output": 2.4
			},
			"openai/gpt-5.6-sol-pro": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-4": {
				"input": 30,
				"output": 60
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"openai/gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"openai/gpt-3.5-turbo-instruct": {
				"input": 1.5,
				"output": 2
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-4o-2024-08-06": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.6-luna-pro": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5-image-mini": {
				"input": 2.5,
				"output": 2,
				"cacheRead": .25
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/o3-pro": {
				"input": 20,
				"output": 80
			},
			"openai/gpt-oss-20b": {
				"input": .018,
				"output": .09,
				"cacheRead": .009
			},
			"openai/gpt-oss-safeguard-20b": {
				"input": .075,
				"output": .3,
				"cacheRead": .0375
			},
			"openai/o3-mini-high": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-3.5-turbo-16k": {
				"input": 3,
				"output": 4
			},
			"openai/gpt-5.2-chat": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-6-sol-pro": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-5-image": {
				"input": 10,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4o-2024-11-20": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-3.5-turbo-0613": {
				"input": 1,
				"output": 2
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-5.6-terra-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-6.1-sol-pro": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/o4-mini-high": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/gpt-6-luna-pro": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/gpt-oss-120b": {
				"input": .03,
				"output": .17,
				"cacheRead": .03
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .03
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/o1-pro": {
				"input": 150,
				"output": 600
			},
			"microsoft/phi-4": {
				"input": .07,
				"output": .14
			},
			"microsoft/wizardlm-2-8x22b": {
				"input": .62,
				"output": .62
			}
		},
		"venice": {
			"qwen-3-8-2-4t-a95b": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .3125
			},
			"openai-gpt-56-luna": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .3125
			},
			"grok-4-5": {
				"input": 2.27,
				"output": 6.8,
				"cacheRead": .34
			},
			"aion-labs-aion-3-5": {
				"input": 3.75,
				"output": 7.5,
				"cacheRead": .9375
			},
			"kimi-k3-fast-api": {
				"input": 4.5,
				"output": 22.5,
				"cacheRead": .45
			},
			"qwen3-6-27b": {
				"input": .325,
				"output": 3.25
			},
			"hermes-3-llama-3.1-405b": {
				"input": 1.1,
				"output": 3
			},
			"claude-opus-5-5-fast": {
				"input": 9.6,
				"output": 48,
				"cacheRead": .48,
				"cacheWrite": 12
			},
			"kimi-k2-7-code": {
				"input": .75,
				"output": 3.5,
				"cacheRead": .16
			},
			"google-gemma-3-27b-it": {
				"input": .12,
				"output": .2
			},
			"qwen-3-7-max": {
				"input": 2.7,
				"output": 8.05,
				"cacheRead": .27,
				"cacheWrite": 3.35
			},
			"qwen-3-8-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .3125,
				"cacheWrite": 3.125
			},
			"deepseek-v4-flash-0731": {
				"input": .175,
				"output": .35,
				"cacheRead": .035
			},
			"venice-uncensored-role-play": {
				"input": .5,
				"output": 2
			},
			"grok-build-0-1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"qwen3-235b-a22b-instruct-2507": {
				"input": .15,
				"output": .75
			},
			"openai-gpt-6-luna": {
				"input": .125,
				"output": .625,
				"cacheRead": .0125,
				"cacheWrite": .15625
			},
			"kimi-k3": {
				"input": 3.75,
				"output": 18.75,
				"cacheRead": .375
			},
			"openai-gpt-54-mini": {
				"input": .9375,
				"output": 5.625,
				"cacheRead": .09375
			},
			"qwen-3-8-flash": {
				"input": .14,
				"output": .49,
				"cacheRead": .014
			},
			"olafangensan-glm-4.7-flash-heretic": {
				"input": .07,
				"output": .4,
				"cacheRead": .035
			},
			"xiaomi-mimo-v2-6-flash": {
				"input": .175,
				"output": .35,
				"cacheRead": .00375
			},
			"deepseek-v4-flash-0731-fast": {
				"input": .35,
				"output": .7,
				"cacheRead": .0875
			},
			"claude-opus-4-5": {
				"input": 6,
				"output": 30,
				"cacheRead": .6,
				"cacheWrite": 7.5
			},
			"zai-org-glm-5-2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"claude-opus-4-8-fast": {
				"input": 12,
				"output": 60,
				"cacheRead": 1.2,
				"cacheWrite": 15
			},
			"z-ai-glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"zai-org-glm-4.6": {
				"input": .43,
				"output": 1.75,
				"cacheRead": .08
			},
			"openai-gpt-54-pro": {
				"input": 37.5,
				"output": 225
			},
			"aion-labs-aion-3-0": {
				"input": 3.75,
				"output": 7.5,
				"cacheRead": .9375
			},
			"claude-sonnet-4-5": {
				"input": 3.75,
				"output": 18.75,
				"cacheRead": .375,
				"cacheWrite": 4.69
			},
			"claude-opus-5-5": {
				"input": 4.8,
				"output": 24,
				"cacheRead": .24,
				"cacheWrite": 6
			},
			"kimi-k2-5": {
				"input": .56,
				"output": 3.5,
				"cacheRead": .22
			},
			"claude-fable-5-1": {
				"input": 12,
				"output": 60,
				"cacheRead": .3,
				"cacheWrite": 15
			},
			"gemini-3-7-flash": {
				"input": .9375,
				"output": 4.6875,
				"cacheRead": .09375
			},
			"grok-4-20": {
				"input": 1.42,
				"output": 2.83,
				"cacheRead": .23
			},
			"openai-gpt-56-sol-pro": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"seed-2-1-turbo": {
				"input": .625,
				"output": 3.125,
				"cacheRead": .125
			},
			"z-ai-glm-5v-turbo": {
				"input": 1.5,
				"output": 5,
				"cacheRead": .3
			},
			"openai-gpt-55-pro": {
				"input": 37.5,
				"output": 225
			},
			"qwen-3-7-plus": {
				"input": .5,
				"output": 2,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"qwen3-235b-a22b-thinking-2507": {
				"input": .45,
				"output": 3.5
			},
			"openai-gpt-61-sol": {
				"input": 2.5,
				"output": 12.5,
				"cacheRead": .125,
				"cacheWrite": 3.125
			},
			"zai-org-glm-4.7-flash": {
				"input": .06,
				"output": .4,
				"cacheRead": .01
			},
			"claude-opus-5": {
				"input": 6,
				"output": 30,
				"cacheRead": .6,
				"cacheWrite": 7.5
			},
			"openai-gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"minimax-m27": {
				"input": .375,
				"output": 1.5,
				"cacheRead": .06875
			},
			"mercury-2-5": {
				"input": .25,
				"output": .9375,
				"cacheRead": .025
			},
			"qwen3-next-80b": {
				"input": .35,
				"output": 1.9
			},
			"minimax-m25": {
				"input": .27,
				"output": .95,
				"cacheRead": .03
			},
			"qwen3-6-35b-a3b": {
				"input": .1,
				"output": 1
			},
			"grok-4-20-multi-agent": {
				"input": 1.42,
				"output": 2.83,
				"cacheRead": .23
			},
			"zai-org-glm-4.7": {
				"input": .55,
				"output": 2.65,
				"cacheRead": .11
			},
			"qwen3-5-9b": {
				"input": .1,
				"output": .15
			},
			"qwen3-vl-235b-a22b": {
				"input": .21,
				"output": 1.9,
				"cacheRead": .1
			},
			"claude-fable-5": {
				"input": 12,
				"output": 60,
				"cacheRead": 1.2,
				"cacheWrite": 15
			},
			"qwen3-5-35b-a3b": {
				"input": .3125,
				"output": 1.25,
				"cacheRead": .15625
			},
			"deepseek-v4-pro-0813": {
				"input": 1.65,
				"output": 4.95,
				"cacheRead": .165
			},
			"openai-gpt-56-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"llama-3.3-70b": {
				"input": .7,
				"output": 2.8
			},
			"openai-gpt-4o-mini-2024-07-18": {
				"input": .1875,
				"output": .75,
				"cacheRead": .09375
			},
			"mistral-small-3-2-24b-instruct": {
				"input": .09375,
				"output": .25
			},
			"inkling": {
				"input": 1.25,
				"output": 5.0625,
				"cacheRead": .2125
			},
			"z-ai-glm-5-3": {
				"input": 1.75,
				"output": 5.5,
				"cacheRead": .325
			},
			"google-gemma-4-26b-a4b-it": {
				"input": .13,
				"output": .4,
				"cacheRead": .05
			},
			"kimi-k2-6": {
				"input": .75,
				"output": 3.5,
				"cacheRead": .16
			},
			"openai-gpt-6-astra-pro": {
				"input": 12.5,
				"output": 62.5,
				"cacheRead": 1.25,
				"cacheWrite": 15.625
			},
			"openai-gpt-54": {
				"input": 3.13,
				"output": 18.8,
				"cacheRead": .313
			},
			"gemma-4-uncensored": {
				"input": .1625,
				"output": .5
			},
			"claude-opus-4-8": {
				"input": 6,
				"output": 30,
				"cacheRead": .6,
				"cacheWrite": 7.5
			},
			"abliteration-abliterated-model-large-v2": {
				"input": 3,
				"output": 5,
				"cacheRead": .3
			},
			"minimax-m3-preview": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"openai-gpt-oss-120b": {
				"input": .07,
				"output": .3
			},
			"claude-sonnet-5": {
				"input": 2.5,
				"output": 12.5,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"deepseek-v4-1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .0075
			},
			"gemini-3-8-flash": {
				"input": .9375,
				"output": 4.6875,
				"cacheRead": .09375
			},
			"qwen-3-6-plus": {
				"input": .625,
				"output": 3.75,
				"cacheRead": .0625,
				"cacheWrite": .78
			},
			"claude-opus-4-6": {
				"input": 6,
				"output": 30,
				"cacheRead": .6,
				"cacheWrite": 7.5
			},
			"openai-gpt-6-sol": {
				"input": 2.5,
				"output": 12.5,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"qwen-3-8-27b": {
				"input": .45,
				"output": 3.2
			},
			"openai-gpt-53-codex": {
				"input": 2.19,
				"output": 17.5,
				"cacheRead": .219
			},
			"aion-labs-aion-3-0-mini": {
				"input": .875,
				"output": 1.75,
				"cacheRead": .225
			},
			"grok-4-3": {
				"input": 1.42,
				"output": 2.83,
				"cacheRead": .23
			},
			"aion-labs-aion-3-5-mini": {
				"input": .875,
				"output": 1.75,
				"cacheRead": .225
			},
			"openai-gpt-56-terra-pro": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"gemini-3-flash-preview": {
				"input": .7,
				"output": 3.75,
				"cacheRead": .07
			},
			"mercury-2": {
				"input": .3125,
				"output": .9375,
				"cacheRead": .03125
			},
			"grok-4-6": {
				"input": 2.27,
				"output": 6.8,
				"cacheRead": .57
			},
			"zai-org-glm-5-1": {
				"input": 1.54,
				"output": 4.84,
				"cacheRead": .286
			},
			"xiaomi-mimo-v2-5": {
				"input": .4,
				"output": 2,
				"cacheRead": .08
			},
			"openai-gpt-4o-2024-11-20": {
				"input": 3.125,
				"output": 12.5
			},
			"openai-gpt-52": {
				"input": 2.19,
				"output": 17.5,
				"cacheRead": .219
			},
			"gemini-3-6-flash": {
				"input": .9375,
				"output": 4.6875,
				"cacheRead": .09375
			},
			"gemini-3-1-pro-preview": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .5,
				"cacheWrite": .5
			},
			"deepseek-v4-pro": {
				"input": 1.65,
				"output": 3.301,
				"cacheRead": .33
			},
			"claude-sonnet-4-6": {
				"input": 3.6,
				"output": 18,
				"cacheRead": .36,
				"cacheWrite": 4.5
			},
			"claude-opus-5-fast": {
				"input": 12,
				"output": 60,
				"cacheRead": 1.2,
				"cacheWrite": 15
			},
			"openai-gpt-55": {
				"input": 6.25,
				"output": 37.5,
				"cacheRead": .625
			},
			"openai-gpt-56-sol": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"qwen3-coder-480b-a35b-instruct-turbo": {
				"input": .35,
				"output": 1.5,
				"cacheRead": .04
			},
			"z-ai-glm-5-3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"claude-sonnet-5-5": {
				"input": 2.5,
				"output": 12.5,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"zai-org-glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"grok-4-7": {
				"input": 2.27,
				"output": 6.8,
				"cacheRead": .57
			},
			"deepseek-v3.2": {
				"input": .33,
				"output": .48,
				"cacheRead": .16
			},
			"gemini-3-5-flash-lite": {
				"input": .375,
				"output": 3.125,
				"cacheRead": .0375
			},
			"gemini-3-5-flash": {
				"input": 1.55,
				"output": 9.45,
				"cacheRead": .155,
				"cacheWrite": .086
			},
			"google-gemma-4-31b-it": {
				"input": .12,
				"output": .36,
				"cacheRead": .09
			},
			"claude-opus-4-7": {
				"input": 6,
				"output": 30,
				"cacheRead": .6,
				"cacheWrite": 7.5
			},
			"venice-uncensored-1-2": {
				"input": .2,
				"output": .9
			},
			"qwen3-5-397b-a17b": {
				"input": .75,
				"output": 4.5
			},
			"llama-3.2-3b": {
				"input": .15,
				"output": .6
			},
			"openai-gpt-56-luna-pro": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .3125
			},
			"nvidia-nemotron-3-ultra-550b-a55b": {
				"input": .625,
				"output": 3.125,
				"cacheRead": .1875
			},
			"deepseek-v4-flash": {
				"input": .138,
				"output": .275,
				"cacheRead": .028
			},
			"nvidia-nemotron-3-nano-30b-a3b": {
				"input": .075,
				"output": .3
			}
		},
		"alibaba-token-plan-cn": {
			"happyhorse-1.1-r2v": {
				"input": 0,
				"output": 0
			},
			"qwen3.7-max": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4-flash-0731": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.8-max": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"happyhorse-1.1-t2v": {
				"input": 0,
				"output": 0
			},
			"qwen-image-2.0": {
				"input": 0,
				"output": 0
			},
			"glm-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4.1-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.8-max-preview": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen-image-2.0-pro": {
				"input": 0,
				"output": 0
			},
			"kimi-k2.6": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"wan2.7-image": {
				"input": 0,
				"output": 0
			},
			"wan2.7-image-pro": {
				"input": 0,
				"output": 0
			},
			"kimi-k2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"happyhorse-1.1-i2v": {
				"input": 0,
				"output": 0
			},
			"qwen3.6-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4-pro-0813": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.8-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.2": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.6-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v3.2": {
				"input": 0,
				"output": 0
			},
			"glm-5.3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"kimi-k2.7-code": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.7-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"deepseek-v4-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"ai21": {
			"jamba-large": {
				"input": 2,
				"output": 8
			},
			"jamba-mini": {
				"input": .2,
				"output": .4
			}
		},
		"inference": {
			"meta/llama-3.1-8b-instruct": {
				"input": .025,
				"output": .025
			},
			"meta/llama-3.2-11b-vision-instruct": {
				"input": .055,
				"output": .055
			},
			"meta/llama-3.2-1b-instruct": {
				"input": .01,
				"output": .01
			},
			"meta/llama-3.2-3b-instruct": {
				"input": .02,
				"output": .02
			},
			"google/gemma-3": {
				"input": .15,
				"output": .3
			},
			"osmosis/osmosis-structure-0.6b": {
				"input": .1,
				"output": .5
			},
			"mistral/mistral-nemo-12b-instruct": {
				"input": .038,
				"output": .1
			},
			"qwen/qwen3-embedding-4b": {
				"input": .01,
				"output": 0
			},
			"qwen/qwen-2.5-7b-vision-instruct": {
				"input": .2,
				"output": .2
			}
		},
		"iflowcn": {
			"qwen3-vl-plus": {
				"input": 0,
				"output": 0
			},
			"glm-4.6": {
				"input": 0,
				"output": 0
			},
			"qwen3-32b": {
				"input": 0,
				"output": 0
			},
			"qwen3-max": {
				"input": 0,
				"output": 0
			},
			"deepseek-v3": {
				"input": 0,
				"output": 0
			},
			"qwen3-235b-a22b-thinking-2507": {
				"input": 0,
				"output": 0
			},
			"qwen3-max-preview": {
				"input": 0,
				"output": 0
			},
			"qwen3-coder-plus": {
				"input": 0,
				"output": 0
			},
			"qwen3-235b-a22b-instruct": {
				"input": 0,
				"output": 0
			},
			"kimi-k2-0905": {
				"input": 0,
				"output": 0
			},
			"kimi-k2": {
				"input": 0,
				"output": 0
			},
			"qwen3-235b": {
				"input": 0,
				"output": 0
			},
			"deepseek-r1": {
				"input": 0,
				"output": 0
			},
			"deepseek-v3.2": {
				"input": 0,
				"output": 0
			}
		},
		"minimax-cn-coding-plan": {
			"MiniMax-M3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M3.1-Flash-Preview": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.7": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.7-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2": {
				"input": 0,
				"output": 0
			},
			"MiniMax-M2.5-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"thinkingmachines": {
			"thinkingmachines/Inkling:peft:262144": {
				"input": 3.74,
				"output": 9.36,
				"cacheRead": .748
			},
			"thinkingmachines/Inkling": {
				"input": 1.87,
				"output": 4.68,
				"cacheRead": .374
			}
		},
		"melious": {
			"glm-5.3-flash": {
				"input": .11592,
				"output": .46368,
				"cacheRead": .023184
			},
			"deepseek-v4-flash-0731": {
				"input": .11592,
				"output": .2898,
				"cacheRead": .023184
			},
			"kimi-k3": {
				"input": 3.1878,
				"output": 15.939,
				"cacheRead": .788256
			},
			"glm-5": {
				"input": 1.10124,
				"output": 3.36168,
				"cacheRead": .266616
			},
			"deepseek-v4.1-flash": {
				"input": .23184,
				"output": 1.1592,
				"cacheRead": .011592
			},
			"kimi-k2.6": {
				"input": .81144,
				"output": 4.0572,
				"cacheRead": .266616
			},
			"kimi-k2.5": {
				"input": .5796,
				"output": 2.95596,
				"cacheRead": .139104
			},
			"glm-5.1": {
				"input": 1.50696,
				"output": 4.6368,
				"cacheRead": .370944
			},
			"deepseek-r1-0528": {
				"input": .69552,
				"output": 2.78208,
				"cacheRead": .185472
			},
			"deepseek-v3.2": {
				"input": .34776,
				"output": .5796,
				"cacheRead": .092736
			},
			"glm-5.3": {
				"input": 1.1592,
				"output": 3.4776,
				"cacheRead": .23184
			},
			"kimi-k2.7-code": {
				"input": .81144,
				"output": 3.4776,
				"cacheRead": .220248
			}
		},
		"berget": {
			"google/gemma-4-31B-it": {
				"input": .275,
				"output": .55
			},
			"Qwen/Qwen3.8-27B-FP8": {
				"input": .46,
				"output": 3.48
			},
			"mistralai/Mistral-Small-3.2-24B-Instruct-2506": {
				"input": .33,
				"output": .33
			},
			"moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15
			},
			"zai-org/GLM-5.2": {
				"input": 1.54,
				"output": 4.84
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .29,
				"output": .58
			}
		},
		"nova": {
			"nova-2-pro-v1": {
				"input": 0,
				"output": 0,
				"reasoning": 0
			},
			"nova-2-lite-v1": {
				"input": 0,
				"output": 0,
				"reasoning": 0
			}
		},
		"abacus": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"grok-4-1-fast-non-reasoning": {
				"input": .2,
				"output": .5
			},
			"qwen3.7-max": {
				"input": 2.5,
				"output": 7.5
			},
			"gemini-3.1-flash-image-preview": {
				"input": .5,
				"output": 3
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gemini-2.5-flash-image": {
				"input": .3,
				"output": 30
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6
			},
			"gpt-5-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"claude-3-7-sonnet-20250219": {
				"input": 3,
				"output": 15
			},
			"qwen-2.5-coder-32b": {
				"input": .79,
				"output": .79
			},
			"o4-mini": {
				"input": 1.1,
				"output": 4.4
			},
			"o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .18
			},
			"gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"gpt-5.2-chat-latest": {
				"input": 1.75,
				"output": 14
			},
			"gpt-5.1-chat-latest": {
				"input": 1.25,
				"output": 10
			},
			"qwen3-max": {
				"input": 1.2,
				"output": 6
			},
			"claude-opus-4-20250514": {
				"input": 15,
				"output": 75
			},
			"gemini-3.6-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"kimi-k2-turbo-preview": {
				"input": .15,
				"output": 8
			},
			"grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"grok-4-fast-non-reasoning": {
				"input": .2,
				"output": .5
			},
			"claude-opus-4-1-20250805": {
				"input": 15,
				"output": 75
			},
			"claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25
			},
			"gemini-3-pro-image-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gemini-3.1-flash-image": {
				"input": .5,
				"output": 3
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"grok-4.5": {
				"input": 2,
				"output": 6
			},
			"kimi-k2.5": {
				"input": .6,
				"output": 3
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"llama-3.3-70b-versatile": {
				"input": .59,
				"output": .79
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25
			},
			"mimo-v2-pro": {
				"input": 1,
				"output": 3,
				"cacheRead": .2
			},
			"gpt-4o-mini": {
				"input": .15,
				"output": .6
			},
			"o3-pro": {
				"input": 20,
				"output": 40
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gemini-3-pro-image": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50
			},
			"muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"gpt-5.6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1
			},
			"gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10
			},
			"gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25
			},
			"grok-code-fast-1": {
				"input": .2,
				"output": 1.5
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"claude-sonnet-5": {
				"input": 3,
				"output": 15
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gpt-5.3-codex-xhigh": {
				"input": 1.75,
				"output": 14
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"gpt-4o-2024-11-20": {
				"input": 2.5,
				"output": 10
			},
			"claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5
			},
			"gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15
			},
			"gpt-5.3-chat-latest": {
				"input": 1.75,
				"output": 14
			},
			"claude-sonnet-4-20250514": {
				"input": 3,
				"output": 15
			},
			"gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": 1
			},
			"route-llm": {
				"input": 3,
				"output": 15
			},
			"grok-4-0709": {
				"input": 3,
				"output": 15
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"deepseek/deepseek-v3.1": {
				"input": .55,
				"output": 1.66
			},
			"meta-llama/Meta-Llama-3.3-70B-Instruct": {
				"input": .59,
				"output": .79
			},
			"meta-llama/Meta-Llama-3.1-8B-Instruct": {
				"input": .02,
				"output": .05
			},
			"meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo": {
				"input": 3.5,
				"output": 3.5
			},
			"meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8": {
				"input": .14,
				"output": .59
			},
			"thinkingmachines/Inkling": {
				"input": 3.74,
				"output": 9.36,
				"cacheRead": .748
			},
			"google/gemma-4-31b-it": {
				"input": .14,
				"output": .4
			},
			"Qwen/QwQ-32B": {
				"input": .4,
				"output": .4
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": .13,
				"output": .6
			},
			"Qwen/Qwen2.5-72B-Instruct": {
				"input": .11,
				"output": .38
			},
			"Qwen/Qwen3-32B": {
				"input": .09,
				"output": .29
			},
			"Qwen/Qwen3-Coder-480B-A35B-Instruct": {
				"input": .29,
				"output": 1.2
			},
			"Qwen/Qwen3.6-27B": {
				"input": .32,
				"output": 3.2
			},
			"deepseek-ai/DeepSeek-R1": {
				"input": 3,
				"output": 7
			},
			"deepseek-ai/DeepSeek-V4-Flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .03
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .15
			},
			"deepseek-ai/DeepSeek-V3.2": {
				"input": .27,
				"output": .4
			},
			"deepseek-ai/DeepSeek-V3.1-Terminus": {
				"input": .27,
				"output": 1
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .3,
				"output": 1.2
			},
			"MiniMaxAI/MiniMax-M2.7": {
				"input": .3,
				"output": 1.2
			},
			"moonshotai/Kimi-K2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"zai-org/GLM-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/GLM-4.7": {
				"input": .6,
				"output": 2.2
			},
			"zai-org/GLM-5": {
				"input": 1,
				"output": 3.2
			},
			"zai-org/GLM-4.6": {
				"input": .6,
				"output": 2.2
			},
			"zai-org/GLM-4.5": {
				"input": .6,
				"output": 2.2
			},
			"openai/gpt-oss-120b": {
				"input": .08,
				"output": .44
			}
		},
		"novita-ai": {
			"kwaipilot/kat-coder-pro": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"deepseek/deepseek-prover-v2-671b": {
				"input": .7,
				"output": 2.5
			},
			"deepseek/deepseek-r1-distill-qwen-14b": {
				"input": .15,
				"output": .15
			},
			"deepseek/deepseek-v3-0324": {
				"input": .27,
				"output": 1.12,
				"cacheRead": .135
			},
			"deepseek/deepseek-r1-distill-llama-70b": {
				"input": .8,
				"output": .8
			},
			"deepseek/deepseek-v3-turbo": {
				"input": .4,
				"output": 1.3
			},
			"deepseek/deepseek-r1-0528-qwen3-8b": {
				"input": .06,
				"output": .09
			},
			"deepseek/deepseek-v3.1-terminus": {
				"input": .27,
				"output": 1,
				"cacheRead": .135
			},
			"deepseek/deepseek-ocr-2": {
				"input": .03,
				"output": .03
			},
			"deepseek/deepseek-ocr": {
				"input": .03,
				"output": .03
			},
			"deepseek/deepseek-r1-turbo": {
				"input": .7,
				"output": 2.5
			},
			"deepseek/deepseek-v3.2-exp": {
				"input": .27,
				"output": .41
			},
			"deepseek/deepseek-r1-distill-qwen-32b": {
				"input": .3,
				"output": .3
			},
			"deepseek/deepseek-v3.1": {
				"input": .27,
				"output": 1,
				"cacheRead": .135
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.6,
				"output": 3.2,
				"cacheRead": .135
			},
			"deepseek/deepseek-r1-0528": {
				"input": .7,
				"output": 2.5,
				"cacheRead": .35
			},
			"deepseek/deepseek-v3.2": {
				"input": .269,
				"output": .4,
				"cacheRead": .1345
			},
			"deepseek/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"meta-llama/llama-4-maverick-17b-128e-instruct-fp8": {
				"input": .27,
				"output": .85
			},
			"meta-llama/llama-3-70b-instruct": {
				"input": .51,
				"output": .74
			},
			"meta-llama/llama-3.3-70b-instruct": {
				"input": .135,
				"output": .4
			},
			"meta-llama/llama-3.1-8b-instruct": {
				"input": .02,
				"output": .05
			},
			"meta-llama/llama-4-scout-17b-16e-instruct": {
				"input": .18,
				"output": .59
			},
			"meta-llama/llama-3.2-3b-instruct": {
				"input": .03,
				"output": .05
			},
			"meta-llama/llama-3-8b-instruct": {
				"input": .04,
				"output": .04
			},
			"nousresearch/hermes-2-pro-llama-3-8b": {
				"input": .14,
				"output": .14
			},
			"xiaomimimo/mimo-v2-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .3
			},
			"xiaomimimo/mimo-v2-pro": {
				"input": 2,
				"output": 6,
				"cacheRead": .4
			},
			"xiaomimimo/mimo-v2.5-pro": {
				"input": .522,
				"output": 1.044,
				"cacheRead": .0043
			},
			"baidu/ernie-4.5-vl-28b-a3b": {
				"input": .14,
				"output": .56
			},
			"baidu/ernie-4.5-vl-28b-a3b-thinking": {
				"input": .39,
				"output": .39
			},
			"baidu/ernie-4.5-21B-a3b-thinking": {
				"input": .07,
				"output": .28
			},
			"baidu/ernie-4.5-21B-a3b": {
				"input": .07,
				"output": .28
			},
			"baidu/ernie-4.5-vl-424b-a47b": {
				"input": .42,
				"output": 1.25
			},
			"baidu/ernie-4.5-300b-a47b-paddle": {
				"input": .28,
				"output": 1.1
			},
			"google/gemma-4-31b-it": {
				"input": .14,
				"output": .4
			},
			"google/gemma-3-27b-it": {
				"input": .119,
				"output": .2
			},
			"google/gemma-4-26b-a4b-it": {
				"input": .13,
				"output": .4
			},
			"google/gemma-3-12b-it": {
				"input": .05,
				"output": .1
			},
			"minimaxai/minimax-m1-80k": {
				"input": .55,
				"output": 2.2
			},
			"mistralai/mistral-nemo": {
				"input": .04,
				"output": .17
			},
			"inclusionai/ring-2.6-1t": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .06
			},
			"inclusionai/ling-2.6-1t": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .06
			},
			"inclusionai/ling-2.6-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshotai/kimi-k2.6": {
				"input": .8,
				"output": 3.4,
				"cacheRead": .16
			},
			"moonshotai/kimi-k2-thinking": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .15
			},
			"moonshotai/kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"moonshotai/kimi-k2-instruct": {
				"input": .57,
				"output": 2.3
			},
			"moonshotai/kimi-k2-0905": {
				"input": .6,
				"output": 2.5
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"zai-org/glm-4.6v": {
				"input": .3,
				"output": .9,
				"cacheRead": .055
			},
			"zai-org/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai-org/glm-4.6": {
				"input": .55,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai-org/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"zai-org/glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .11
			},
			"zai-org/glm-4.7-flash": {
				"input": .07,
				"output": .4,
				"cacheRead": .01
			},
			"zai-org/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai-org/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/glm-5.1": {
				"input": 1.38,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/autoglm-phone-9b-multilingual": {
				"input": .035,
				"output": .138
			},
			"zai-org/glm-4.5-air": {
				"input": .13,
				"output": .85,
				"cacheRead": .025
			},
			"gryphe/mythomax-l2-13b": {
				"input": .09,
				"output": .09
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.5-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .03
			},
			"minimax/minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/minimax-m2": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"paddlepaddle/paddleocr-vl": {
				"input": .02,
				"output": .02
			},
			"qwen/qwen3-vl-235b-a22b-instruct": {
				"input": .3,
				"output": 1.5
			},
			"qwen/qwen3.7-max": {
				"input": 1.25,
				"output": 3.75,
				"cacheRead": .25,
				"cacheWrite": 1.5625
			},
			"qwen/qwen3-vl-235b-a22b-thinking": {
				"input": .98,
				"output": 3.95
			},
			"qwen/qwen3.5-27b": {
				"input": .3,
				"output": 2.4
			},
			"qwen/qwen3-235b-a22b-instruct-2507": {
				"input": .09,
				"output": .58
			},
			"qwen/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.5
			},
			"qwen/qwen3-coder-next": {
				"input": .2,
				"output": 1.5
			},
			"qwen/qwen3-omni-30b-a3b-instruct": {
				"input": .25,
				"output": .97
			},
			"qwen/qwen3-omni-30b-a3b-thinking": {
				"input": .25,
				"output": .97
			},
			"qwen/qwen3-max": {
				"input": 2.11,
				"output": 8.45
			},
			"qwen/qwen3-235b-a22b-fp8": {
				"input": .2,
				"output": .8
			},
			"qwen/qwen3-coder-480b-a35b-instruct": {
				"input": .38,
				"output": 1.55
			},
			"qwen/qwen3-coder-30b-a3b-instruct": {
				"input": .07,
				"output": .27
			},
			"qwen/qwen3-vl-30b-a3b-instruct": {
				"input": .2,
				"output": .7
			},
			"qwen/qwen3-235b-a22b-thinking-2507": {
				"input": .3,
				"output": 3
			},
			"qwen/qwen2.5-7b-instruct": {
				"input": .07,
				"output": .07
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .4,
				"output": 3.2
			},
			"qwen/qwen3-30b-a3b-fp8": {
				"input": .09,
				"output": .45
			},
			"qwen/qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": 1.5
			},
			"qwen/qwen3-vl-30b-a3b-thinking": {
				"input": .2,
				"output": 1
			},
			"qwen/qwen-mt-plus": {
				"input": .25,
				"output": .75
			},
			"qwen/qwen3-32b-fp8": {
				"input": .1,
				"output": .45
			},
			"qwen/qwen3-8b-fp8": {
				"input": .035,
				"output": .138
			},
			"qwen/qwen3.5-35b-a3b": {
				"input": .25,
				"output": 2
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .6,
				"output": 3.6
			},
			"qwen/qwen3-vl-8b-instruct": {
				"input": .08,
				"output": .5
			},
			"qwen/qwen2.5-vl-72b-instruct": {
				"input": .8,
				"output": .8
			},
			"qwen/qwen-2.5-72b-instruct": {
				"input": .38,
				"output": .4
			},
			"qwen/qwen3-4b-fp8": {
				"input": .03,
				"output": .03
			},
			"baichuan/baichuan-m2-32b": {
				"input": .07,
				"output": .07
			},
			"openai/gpt-oss-20b": {
				"input": .04,
				"output": .15
			},
			"openai/gpt-oss-120b": {
				"input": .05,
				"output": .25
			},
			"microsoft/wizardlm-2-8x22b": {
				"input": .62,
				"output": .62
			},
			"sao10K/l3-70b-euryale-v2.1": {
				"input": 1.48,
				"output": 1.48
			},
			"sao10K/L3-8B-stheno-v3.2": {
				"input": .05,
				"output": .05
			},
			"sao10K/l3-8b-lunaris": {
				"input": .05,
				"output": .05
			},
			"sao10K/l31-70b-euryale-v2.2": {
				"input": 1.48,
				"output": 1.48
			}
		},
		"302ai": {
			"grok-4-1-fast-reasoning": {
				"input": .2,
				"output": .5
			},
			"glm-4.6v": {
				"input": .145,
				"output": .43
			},
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 0
			},
			"glm-4.5": {
				"input": .286,
				"output": 1.142
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5
			},
			"qwen3.7-max": {
				"input": 1.8,
				"output": 5.3
			},
			"gemini-3.1-flash-image-preview": {
				"input": .5,
				"output": 60
			},
			"grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5,
				"cacheWrite": .5
			},
			"MiniMax-M3": {
				"input": .72,
				"output": 2.88
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25
			},
			"gemini-3.5-flash-thinking": {
				"input": 1.5,
				"output": 9
			},
			"gemini-3-pro-preview": {
				"input": 2,
				"output": 12
			},
			"glm-5v-turbo": {
				"input": .72,
				"output": 3.2
			},
			"gemini-2.5-flash-image": {
				"input": .3,
				"output": 30
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10
			},
			"glm-5.3-flash": {
				"input": .075,
				"output": .25
			},
			"glm-4.6": {
				"input": .286,
				"output": 1.142
			},
			"qwen3-235b-a22b-instruct-2507": {
				"input": .29,
				"output": 1.143
			},
			"qwen3.8-max": {
				"input": 2.16,
				"output": 6.36
			},
			"kimi-k3": {
				"input": 3,
				"output": 15
			},
			"gpt-5.6-sol-pro": {
				"input": 5,
				"output": 30
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2
			},
			"qwen3.5-plus": {
				"input": .12,
				"output": .69
			},
			"claude-sonnet-4-6-thinking": {
				"input": 3,
				"output": 15
			},
			"glm-5": {
				"input": .6,
				"output": 2.6
			},
			"gpt-4.1-nano": {
				"input": .1,
				"output": .4
			},
			"grok-4-fast-reasoning": {
				"input": .2,
				"output": .5
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4
			},
			"gpt-5.2-chat-latest": {
				"input": 1.75,
				"output": 14
			},
			"gpt-5.1-chat-latest": {
				"input": 1.25,
				"output": 10
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"MiniMax-M2.1": {
				"input": .3,
				"output": 1.2
			},
			"gemini-2.5-flash-preview-09-2025": {
				"input": .3,
				"output": 2.5
			},
			"glm-4.5v": {
				"input": .29,
				"output": .86
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50
			},
			"gemini-3.6-flash": {
				"input": 1.5,
				"output": 7.5
			},
			"claude-opus-5-thinking": {
				"input": 5,
				"output": 25
			},
			"qwen3-coder-480b-a35b-instruct": {
				"input": .86,
				"output": 3.43
			},
			"doubao-seed-1-6-vision-250815": {
				"input": .114,
				"output": 1.143
			},
			"claude-sonnet-4-5-20250929-thinking": {
				"input": 3,
				"output": 15
			},
			"grok-4.3": {
				"input": 1.25,
				"output": 2.5
			},
			"kimi-k2-thinking": {
				"input": .575,
				"output": 2.3
			},
			"grok-4-fast-non-reasoning": {
				"input": .2,
				"output": .5
			},
			"grok-4.20-beta-0309-reasoning": {
				"input": 2,
				"output": 6
			},
			"claude-opus-4-1-20250805": {
				"input": 15,
				"output": 75
			},
			"gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25
			},
			"gemini-3-pro-image-preview": {
				"input": 2,
				"output": 120
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5
			},
			"gemini-2.0-flash-lite": {
				"input": .075,
				"output": .3
			},
			"qwen3-235b-a22b": {
				"input": .29,
				"output": 2.86
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12
			},
			"grok-4.5": {
				"input": 2,
				"output": 6
			},
			"gpt-5.6-luna-pro": {
				"input": .2,
				"output": 1.2
			},
			"kimi-k2.5": {
				"input": .66,
				"output": 3.3
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25
			},
			"qwen3.7-max-2026-06-08": {
				"input": 1.8,
				"output": 5.3
			},
			"qwen3.6-35b-a3b": {
				"input": .283,
				"output": 1.705
			},
			"kimi-k2-0905-preview": {
				"input": .632,
				"output": 2.53
			},
			"deepseek-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10
			},
			"qwen3.6-flash": {
				"input": .188,
				"output": 1.133
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50
			},
			"doubao-seed-1-6-thinking-250715": {
				"input": .121,
				"output": 1.21
			},
			"gpt-5-thinking": {
				"input": 1.25,
				"output": 10
			},
			"MiniMax-M1": {
				"input": .132,
				"output": 1.254
			},
			"MiniMax-M2.5": {
				"input": .3,
				"output": 1.2
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5
			},
			"glm-4.7": {
				"input": .286,
				"output": 1.142
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2
			},
			"MiniMax-M2.7": {
				"input": .3,
				"output": 1.2
			},
			"qwen3.8-flash": {
				"input": .18,
				"output": .564
			},
			"gpt-5.2": {
				"input": 1.75,
				"output": 14
			},
			"deepseek-v3.2-thinking": {
				"input": .29,
				"output": .43
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30
			},
			"claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10
			},
			"qwen3.5-35b-a3b": {
				"input": .06,
				"output": .46
			},
			"qwen3-30b-a3b": {
				"input": .11,
				"output": 1.08
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75
			},
			"glm-5.2": {
				"input": 1.4,
				"output": 4.4
			},
			"gemini-2.5-flash-nothink": {
				"input": .3,
				"output": 2.5
			},
			"doubao-seed-1-8-251215": {
				"input": .114,
				"output": .286
			},
			"claude-opus-4-1-20250805-thinking": {
				"input": 15,
				"output": 75
			},
			"glm-5.1": {
				"input": 1.4,
				"output": 4.4
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3
			},
			"claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5
			},
			"mistral-large-2512": {
				"input": 1.1,
				"output": 3.3
			},
			"MiniMax-M2": {
				"input": .33,
				"output": 1.32
			},
			"gemini-2.5-flash-lite-preview-09-2025": {
				"input": .1,
				"output": .4
			},
			"gpt-4.1-mini": {
				"input": .4,
				"output": 1.6
			},
			"gpt-5.6-terra-pro": {
				"input": 2,
				"output": 12
			},
			"gemini-3.8-flash": {
				"input": .75,
				"output": 3.75
			},
			"ministral-14b-2512": {
				"input": .33,
				"output": .33
			},
			"glm-5-turbo": {
				"input": .72,
				"output": 3.2
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"grok-4.1": {
				"input": 2,
				"output": 10
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15
			},
			"gpt-5.3-chat-latest": {
				"input": 1.75,
				"output": 14
			},
			"claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"qwen3.6-plus": {
				"input": .3,
				"output": 1.8
			},
			"gpt-5.6-terra": {
				"input": 2,
				"output": 12
			},
			"deepseek-v3.2": {
				"input": .29,
				"output": .43
			},
			"claude-opus-4-7-thinking": {
				"input": 5,
				"output": 25
			},
			"o3": {
				"input": 2,
				"output": 8
			},
			"glm-5.3": {
				"input": 1.4,
				"output": 4.4
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10
			},
			"grok-4.6": {
				"input": 2,
				"output": 6
			},
			"gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5
			},
			"qwen3-max-2025-09-23": {
				"input": .86,
				"output": 3.43
			},
			"qwen3.7-plus": {
				"input": .285,
				"output": 1.15
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5
			}
		},
		"openrouter": {
			"sao10k/l3-lunaris-8b": {
				"input": .04,
				"output": .05
			},
			"sao10k/l3.3-euryale-70b": {
				"input": .65,
				"output": .75
			},
			"sao10k/l3.1-euryale-70b": {
				"input": .85,
				"output": .85
			},
			"kwaipilot/kat-coder-pro-v2.5": {
				"input": .74,
				"output": 2.96,
				"cacheRead": .15
			},
			"stealth/space-bunny-alpha": {
				"input": 0,
				"output": 0
			},
			"bytedance-seed/seed-1.6-flash": {
				"input": .075,
				"output": .3
			},
			"bytedance-seed/seed-2.0-lite": {
				"input": .25,
				"output": 2
			},
			"bytedance-seed/seed-2-1-turbo": {
				"input": .5,
				"output": 2.5
			},
			"bytedance-seed/seed-2.0-mini": {
				"input": .1,
				"output": .4
			},
			"bytedance-seed/seed-2.0-code": {
				"input": .5,
				"output": 3
			},
			"bytedance-seed/seed-1.6": {
				"input": .25,
				"output": 2
			},
			"~moonshotai/kimi-latest": {
				"input": .615,
				"output": 13,
				"cacheRead": .45
			},
			"poolside/laguna-s-2.1:free": {
				"input": 0,
				"output": 0
			},
			"poolside/laguna-s-2.1": {
				"input": .09,
				"output": .18,
				"cacheRead": .009
			},
			"poolside/laguna-xs-2.1:free": {
				"input": 0,
				"output": 0
			},
			"poolside/laguna-xs-2.1": {
				"input": .06,
				"output": .12,
				"cacheRead": .03
			},
			"prism-ml/ternary-bonsai-2-27b": {
				"input": .075,
				"output": .5,
				"cacheRead": .0375
			},
			"anthropic/claude-opus-4.1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic/claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-5.5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"nex-agi/nex-n2.5-mini": {
				"input": .025,
				"output": .1,
				"cacheRead": .0025
			},
			"nex-agi/nex-n2.5-pro": {
				"input": .075,
				"output": .25,
				"cacheRead": .015
			},
			"cohere/command-r-08-2024": {
				"input": .15,
				"output": .6
			},
			"cohere/command-a-plus": {
				"input": .3,
				"output": 1.5,
				"cacheRead": .15
			},
			"cohere/command-a": {
				"input": 2.5,
				"output": 10
			},
			"cohere/north-mini-code:free": {
				"input": 0,
				"output": 0
			},
			"cohere/command-r7b-12-2024": {
				"input": .0375,
				"output": .15
			},
			"cohere/command-r-plus-08-2024": {
				"input": 2.5,
				"output": 10
			},
			"deepseek/deepseek-chat-v3.1": {
				"input": .25,
				"output": .95,
				"cacheRead": .13
			},
			"deepseek/deepseek-v4-flash-0731": {
				"input": .0171,
				"output": 1.28,
				"cacheRead": .0154
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"deepseek/deepseek-v4-flash-vision-exp": {
				"input": .2156,
				"output": .6468,
				"cacheRead": .00686
			},
			"deepseek/deepseek-v3.1-terminus": {
				"input": .27,
				"output": 1
			},
			"deepseek/deepseek-chat": {
				"input": .2574,
				"output": 1.0287
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .022
			},
			"deepseek/deepseek-v3.2-exp": {
				"input": .27,
				"output": .41
			},
			"deepseek/deepseek-chat-v3-0324": {
				"input": .29,
				"output": 1.14,
				"cacheRead": .11
			},
			"deepseek/deepseek-r1": {
				"input": .7,
				"output": 2.5
			},
			"deepseek/deepseek-v4-pro": {
				"input": .2088,
				"output": .4176,
				"cacheRead": .0174
			},
			"deepseek/deepseek-r1-0528": {
				"input": .5,
				"output": 2.15,
				"cacheRead": .35
			},
			"deepseek/deepseek-v3.2": {
				"input": .28,
				"output": .42,
				"cacheRead": .028
			},
			"deepseek/deepseek-v4-flash": {
				"input": .028,
				"output": .056,
				"cacheRead": .0056
			},
			"unbiased/pareto-26.10-preview": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .03
			},
			"unbiased/pareto": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .25
			},
			"tencent/hy3-preview": {
				"input": .18,
				"output": .6,
				"cacheRead": .06
			},
			"tencent/hunyuan-a13b-instruct": {
				"input": .14,
				"output": .57
			},
			"tencent/hy-mt2-30b-a3b": {
				"input": .074,
				"output": .295
			},
			"tencent/hy-mt2-1.8b": {
				"input": .044,
				"output": .177
			},
			"tencent/hy3": {
				"input": .132,
				"output": .528,
				"cacheRead": .033
			},
			"tencent/hy-mt2-7b": {
				"input": .074,
				"output": .295
			},
			"tencent/hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"anthracite-org/magnum-v4-72b": {
				"input": 2.5,
				"output": 5
			},
			"meta-llama/llama-4-scout": {
				"input": .1,
				"output": .3
			},
			"meta-llama/llama-guard-4-12b": {
				"input": .18,
				"output": .18
			},
			"meta-llama/llama-4-maverick": {
				"input": .1875,
				"output": .6525
			},
			"meta-llama/llama-3.3-70b-instruct": {
				"input": .1,
				"output": .32
			},
			"meta-llama/llama-3.1-8b-instruct": {
				"input": .05,
				"output": .08,
				"cacheRead": .025
			},
			"meta-llama/llama-3.2-1b-instruct": {
				"input": .027,
				"output": .201
			},
			"meta-llama/llama-3.2-3b-instruct": {
				"input": .05,
				"output": .33
			},
			"meta-llama/llama-3.1-70b-instruct": {
				"input": .4,
				"output": .4
			},
			"~google/gemini-flash-latest": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"~google/gemini-pro-latest": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"perceptron/perceptron-mk1": {
				"input": .15,
				"output": 1.5
			},
			"perceptron/perceptron-mk1.5": {
				"input": .15,
				"output": 1.5
			},
			"z-ai/glm-4.6v": {
				"input": .3,
				"output": .9,
				"cacheRead": .05
			},
			"z-ai/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"z-ai/glm-5.3-prime": {
				"input": 2.8,
				"output": 8.8,
				"cacheRead": .56
			},
			"z-ai/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"z-ai/glm-4.6": {
				"input": .43,
				"output": 1.75,
				"cacheRead": .08
			},
			"z-ai/glm-5": {
				"input": .6,
				"output": 1.92,
				"cacheRead": .12
			},
			"z-ai/glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .11
			},
			"z-ai/glm-5.3-flashx": {
				"input": .37,
				"output": 1.25,
				"cacheRead": .09
			},
			"z-ai/glm-4.7-flash": {
				"input": .0605,
				"output": .4
			},
			"z-ai/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"z-ai/glm-5.2": {
				"input": .41,
				"output": 3.99,
				"cacheRead": .26
			},
			"z-ai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"z-ai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/glm-4.5-air": {
				"input": .13,
				"output": .85,
				"cacheRead": .025
			},
			"z-ai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"inference-net/schematron-v2-small": {
				"input": .05,
				"output": .23,
				"cacheRead": .05
			},
			"inference-net/schematron-v2-turbo": {
				"input": .03,
				"output": .15,
				"cacheRead": .03
			},
			"thinkingmachines/inkling-small:free": {
				"input": 0,
				"output": 0
			},
			"thinkingmachines/inkling-small": {
				"input": .45,
				"output": 1.2,
				"cacheRead": .1
			},
			"thinkingmachines/inkling:free": {
				"input": 0,
				"output": 0
			},
			"thinkingmachines/inkling": {
				"input": .95,
				"output": 4.05,
				"cacheRead": .16
			},
			"meituan/longcat-2.0": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"openrouter/free": {
				"input": 0,
				"output": 0
			},
			"perplexity/sonar-pro": {
				"input": 3,
				"output": 15
			},
			"perplexity/sonar-deep-research": {
				"input": 2,
				"output": 8,
				"reasoning": 3
			},
			"perplexity/sonar": {
				"input": 1,
				"output": 1
			},
			"perplexity/sonar-reasoning-pro": {
				"input": 2,
				"output": 8
			},
			"perplexity/sonar-pro-search": {
				"input": 3,
				"output": 15
			},
			"meta/muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-glimmer-30b": {
				"input": .35,
				"output": 1.5,
				"cacheRead": .04
			},
			"meta/muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"meta/muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"nousresearch/hermes-3-llama-3.1-70b": {
				"input": .7,
				"output": .7
			},
			"nousresearch/hermes-3-llama-3.1-405b": {
				"input": 1,
				"output": 1
			},
			"nousresearch/hermes-4-405b": {
				"input": 1,
				"output": 3
			},
			"~z-ai/glm-flash-latest": {
				"input": .02625,
				"output": .928749,
				"cacheRead": .015
			},
			"~z-ai/glm-latest": {
				"input": .12,
				"output": 4,
				"cacheRead": .08
			},
			"arcee-ai/trinity-large-thinking": {
				"input": .25,
				"output": .8,
				"cacheRead": .06
			},
			"~openai/gpt-terra-latest": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"~openai/gpt-luna-latest": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"~openai/gpt-sol-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"~openai/gpt-astra-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"~openai/gpt-mini-latest": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"cognitivecomputations/dolphin-mistral-24b-venice-edition": {
				"input": .2,
				"output": .9
			},
			"thedrummer/skyfall-36b-v2": {
				"input": .55,
				"output": .8,
				"cacheRead": .25
			},
			"thedrummer/unslopnemo-12b": {
				"input": .4,
				"output": .4
			},
			"thedrummer/cydonia-24b-v4.1": {
				"input": .3,
				"output": .5,
				"cacheRead": .15
			},
			"baidu/ernie-4.5-vl-424b-a47b": {
				"input": .42,
				"output": 1.25
			},
			"x-ai/grok-4.20-multi-agent": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"x-ai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"x-ai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"x-ai/grok-4.20": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"~anthropic/claude-opus-latest": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"~anthropic/claude-haiku-latest": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"~anthropic/claude-sonnet-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"~anthropic/claude-fable-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"upstage/solar-pro-3": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"upstage/solar-pro4": {
				"input": .09,
				"output": .36,
				"cacheRead": .018
			},
			"upstage/solar-mini4": {
				"input": .05,
				"output": .2,
				"cacheRead": .005
			},
			"~deepseek/deepseek-flash-latest": {
				"input": .015,
				"output": .676999,
				"cacheRead": .005
			},
			"~deepseek/deepseek-pro-latest": {
				"input": .11,
				"output": 2.7,
				"cacheRead": .099
			},
			"~deepseek/deepseek-v4-flash-latest": {
				"input": .0171,
				"output": 1.28,
				"cacheRead": .0154
			},
			"~x-ai/grok-latest": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"bytedance/ui-tars-1.5-7b": {
				"input": .1,
				"output": .2,
				"cacheRead": .1
			},
			"liquid/lfm-2.5-2.6b:free": {
				"input": 0,
				"output": 0
			},
			"google/gemma-4-31b-it": {
				"input": .09,
				"output": .34,
				"cacheRead": .05
			},
			"google/gemini-3.1-flash-image-preview": {
				"input": .5,
				"output": 3
			},
			"google/lyria-3-pro-preview": {
				"input": 0,
				"output": 0
			},
			"google/gemma-3-27b-it": {
				"input": .08,
				"output": .45,
				"cacheRead": .04
			},
			"google/gemma-4-31b-it:free": {
				"input": 0,
				"output": 0
			},
			"google/gemini-2.5-flash-image": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"google/gemma-4-26b-a4b-it:free": {
				"input": 0,
				"output": 0
			},
			"google/gemma-2-27b-it": {
				"input": .65,
				"output": .65
			},
			"google/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemma-4-26b-a4b-it": {
				"input": .0675,
				"output": .225,
				"cacheRead": .0375
			},
			"google/gemini-3-pro-image-preview": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"google/gemini-3.1-flash-image": {
				"input": .5,
				"output": 3
			},
			"google/lyria-3-clip-preview": {
				"input": 0,
				"output": 0
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemma-3-12b-it": {
				"input": .05,
				"output": .15
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"reasoning": 9,
				"cacheRead": .15,
				"cacheWrite": .083333
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"reasoning": 10,
				"cacheRead": .125,
				"cacheWrite": .375
			},
			"google/gemini-3-pro-image": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"google/gemini-3.1-flash-lite-image": {
				"input": .25,
				"output": 1.5
			},
			"google/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"reasoning": 3,
				"cacheRead": .05,
				"cacheWrite": .083333
			},
			"google/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemma-3-4b-it": {
				"input": .05,
				"output": .1
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"reasoning": .4,
				"cacheRead": .01,
				"cacheWrite": .083333
			},
			"google/gemini-2.5-pro-preview": {
				"input": 1.25,
				"output": 10,
				"reasoning": 10,
				"cacheRead": .125,
				"cacheWrite": .375
			},
			"google/gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5,
				"reasoning": 1.5,
				"cacheRead": .025,
				"cacheWrite": .083333
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"reasoning": 1.5,
				"cacheRead": .025,
				"cacheWrite": .083333
			},
			"writer/palmyra-x5": {
				"input": .6,
				"output": 6
			},
			"ibm-granite/granite-4.0-h-micro": {
				"input": .017,
				"output": .112
			},
			"ibm-granite/granite-4.2-8b": {
				"input": .06,
				"output": .25,
				"cacheRead": .015
			},
			"fireworks/ember-1": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"mistralai/mistral-nemo": {
				"input": .019,
				"output": .03
			},
			"mistralai/ministral-8b-2512": {
				"input": .15,
				"output": .15,
				"cacheRead": .015
			},
			"mistralai/mistral-small-24b-instruct-2501": {
				"input": .05,
				"output": .08
			},
			"mistralai/devstral-2512": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistralai/mistral-saba": {
				"input": .2,
				"output": .6,
				"cacheRead": .02
			},
			"mistralai/mistral-medium-3-5": {
				"input": 1.5,
				"output": 7.5
			},
			"mistralai/mistral-medium-3.1": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistralai/mistral-small-3.2-24b-instruct": {
				"input": .09375,
				"output": .25
			},
			"mistralai/mistral-large": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"mistralai/mistral-small-2603": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"mistralai/mistral-medium-3": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistralai/voxtral-small-24b-2507": {
				"input": .1,
				"output": .3,
				"cacheRead": .01
			},
			"mistralai/mistral-large-2512": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"mistralai/mistral-large-2407": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"mistralai/ministral-14b-2512": {
				"input": .2,
				"output": .2,
				"cacheRead": .02
			},
			"mistralai/mistral-small-3.1-24b-instruct": {
				"input": .351,
				"output": .555
			},
			"mistralai/ministral-3b-2512": {
				"input": .1,
				"output": .1,
				"cacheRead": .01
			},
			"mistralai/mixtral-8x22b-instruct": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"mistralai/codestral-2508": {
				"input": .3,
				"output": .9,
				"cacheRead": .03
			},
			"sakana/fugu-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"sakana/fugu-ultra-v2": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana/fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana/sakana-namazu": {
				"input": .95,
				"output": 4,
				"cacheRead": .15
			},
			"inclusionai/ling-3.0-flash-sante:free": {
				"input": 0,
				"output": 0
			},
			"inclusionai/ling-3.0-flash": {
				"input": .021,
				"output": .063,
				"cacheRead": .0042
			},
			"inclusionai/ling-3.1-flash": {
				"input": 0,
				"output": 0
			},
			"inclusionai/ling-3.0-flash-vl": {
				"input": .021,
				"output": .0616,
				"cacheRead": .0042
			},
			"inclusionai/ling-3.0-flash-fin": {
				"input": .042,
				"output": .1232,
				"cacheRead": .0084
			},
			"moonshotai/kimi-k3": {
				"input": 2.7,
				"output": 13.5,
				"cacheRead": .27
			},
			"moonshotai/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshotai/kimi-k2-thinking": {
				"input": .6,
				"output": 2.5
			},
			"moonshotai/kimi-k2.5": {
				"input": .45,
				"output": 2.25,
				"cacheRead": .07
			},
			"moonshotai/kimi-k2-0905": {
				"input": .6,
				"output": 2.5
			},
			"moonshotai/kimi-k2": {
				"input": .57,
				"output": 2.3
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .6712,
				"output": 3.35,
				"cacheRead": .18
			},
			"rekaai/reka-flash-3": {
				"input": .1,
				"output": .2
			},
			"rekaai/reka-edge": {
				"input": .1,
				"output": .1
			},
			"apodex/apodex-1.1-mini:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-nano-30b-a3b": {
				"input": .05,
				"output": .2,
				"cacheRead": .03
			},
			"nvidia/nemotron-3.5-content-safety:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3.5-lightning": {
				"input": .0595,
				"output": .17,
				"cacheRead": .02975
			},
			"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-super-120b-a12b": {
				"input": .08,
				"output": .45
			},
			"nvidia/nemotron-3-ultra-550b-a55b:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-ultra-550b-a55b": {
				"input": .5,
				"output": 2.2,
				"cacheRead": .1
			},
			"nvidia/nemotron-3-super-120b-a12b:free": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3.5-content-safety": {
				"input": .2,
				"output": .2
			},
			"nvidia/nemotron-3.5-lightning:free": {
				"input": 0,
				"output": 0
			},
			"xiaomi/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"xiaomi/mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"xiaomi/mimo-v2.6-pro-ultraspeed": {
				"input": 4.35,
				"output": 8.7,
				"cacheRead": .036
			},
			"xiaomi/mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"xiaomi/mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"undi95/remm-slerp-l2-13b": {
				"input": .35,
				"output": .65
			},
			"gryphe/mythomax-l2-13b": {
				"input": .08,
				"output": .11
			},
			"minimax/minimax-m2.5": {
				"input": .27,
				"output": 1.08,
				"cacheRead": .027
			},
			"minimax/minimax-01": {
				"input": .2,
				"output": 1.1
			},
			"minimax/minimax-m2-her": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/minimax-m2.7": {
				"input": .21,
				"output": .84,
				"cacheRead": .042
			},
			"minimax/minimax-m1": {
				"input": .55,
				"output": 2.2
			},
			"minimax/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/minimax-m2": {
				"input": .3,
				"output": 1.2
			},
			"mancer/weaver": {
				"input": .4,
				"output": .75
			},
			"stepfun/step-3.5-flash": {
				"input": .1,
				"output": .3
			},
			"stepfun/step-3.7-flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"dots-studio/dots-3-note-preview:free": {
				"input": 0,
				"output": 0
			},
			"inception/mercury-2.5": {
				"input": .04,
				"output": .15,
				"cacheRead": .004
			},
			"inception/mercury-2": {
				"input": .25,
				"output": .75,
				"cacheRead": .025
			},
			"amazon/nova-lite-v1": {
				"input": .06,
				"output": .24
			},
			"amazon/nova-2-lite-v1": {
				"input": .3,
				"output": 2.5
			},
			"amazon/nova-pro-v1": {
				"input": .8,
				"output": 3.2
			},
			"amazon/nova-premier-v1": {
				"input": 2.5,
				"output": 12.5,
				"cacheRead": .625
			},
			"amazon/nova-micro-v1": {
				"input": .035,
				"output": .14
			},
			"relace/relace-search": {
				"input": 1,
				"output": 3
			},
			"relace/relace-apply-3": {
				"input": .85,
				"output": 1.25
			},
			"aion-labs/aion-2.0": {
				"input": .8,
				"output": 1.6,
				"cacheRead": .2
			},
			"aion-labs/aion-rp-llama-3.1-8b": {
				"input": .8,
				"output": 1.6
			},
			"aion-labs/aion-3.0": {
				"input": 3,
				"output": 6,
				"cacheRead": .75
			},
			"aion-labs/aion-3.5": {
				"input": 3,
				"output": 6,
				"cacheRead": .75
			},
			"aion-labs/aion-3.5-mini": {
				"input": .7,
				"output": 1.4,
				"cacheRead": .18
			},
			"aion-labs/aion-3.0-mini": {
				"input": .7,
				"output": 1.4,
				"cacheRead": .18
			},
			"qwen/qwen3-235b-a22b-2507": {
				"input": .0875,
				"output": .35,
				"cacheRead": .0175
			},
			"qwen/qwen3-vl-235b-a22b-instruct": {
				"input": .21,
				"output": 1.9,
				"cacheRead": .1
			},
			"qwen/qwen3.7-max": {
				"input": 1.475,
				"output": 4.425,
				"cacheRead": .295,
				"cacheWrite": 1.84375
			},
			"qwen/qwen3.8-27b": {
				"input": .42,
				"output": 3,
				"cacheRead": .085
			},
			"qwen/qwen3-vl-235b-a22b-thinking": {
				"input": .4,
				"output": 4
			},
			"qwen/qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"qwen/qwen3.5-27b": {
				"input": .195,
				"output": 1.56
			},
			"qwen/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.2
			},
			"qwen/qwen3-coder-next": {
				"input": .12,
				"output": .8,
				"cacheRead": .07
			},
			"qwen/qwen3-coder": {
				"input": .3,
				"output": 1,
				"cacheRead": .1
			},
			"qwen/qwen3-32b": {
				"input": .08,
				"output": .28
			},
			"qwen/qwen-plus": {
				"input": .26,
				"output": .78,
				"cacheRead": .052,
				"cacheWrite": .325
			},
			"qwen/qwen3.7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .006,
				"cacheWrite": .038
			},
			"qwen/qwen3-max": {
				"input": .78,
				"output": 3.9,
				"cacheRead": .156,
				"cacheWrite": .975
			},
			"qwen/qwen3-coder-30b-a3b-instruct": {
				"input": .07,
				"output": .28
			},
			"qwen/qwen3.8-omni-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"qwen/qwen3-vl-30b-a3b-instruct": {
				"input": .15,
				"output": .6
			},
			"qwen/qwen3-235b-a22b-thinking-2507": {
				"input": .23,
				"output": 2.3
			},
			"qwen/qwen3-235b-a22b": {
				"input": .455,
				"output": 1.82
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .26,
				"output": 2.08
			},
			"qwen/qwen-plus-2025-07-28": {
				"input": .26,
				"output": .78
			},
			"qwen/qwen3.6-35b-a3b": {
				"input": .15,
				"output": 1,
				"cacheRead": .05
			},
			"qwen/qwen3-next-80b-a3b-instruct": {
				"input": .1,
				"output": 1.1,
				"cacheRead": .07
			},
			"qwen/qwen3-vl-30b-a3b-thinking": {
				"input": .2,
				"output": 2.4
			},
			"qwen/qwen3.6-flash": {
				"input": .1875,
				"output": 1.125,
				"cacheWrite": .234375
			},
			"qwen/qwen3-coder-flash": {
				"input": .195,
				"output": .975,
				"cacheRead": .039,
				"cacheWrite": .24375
			},
			"qwen/qwen-2.5-coder-32b-instruct": {
				"input": .66,
				"output": 1
			},
			"qwen/qwen3.5-flash-02-23": {
				"input": .065,
				"output": .26
			},
			"qwen/qwen3-max-thinking": {
				"input": .78,
				"output": 3.9
			},
			"qwen/qwen3-coder-plus": {
				"input": .65,
				"output": 3.25,
				"cacheRead": .13,
				"cacheWrite": .8125
			},
			"qwen/qwen3.5-9b": {
				"input": .1,
				"output": .15
			},
			"qwen/qwen3.8-max-prime": {
				"input": 4,
				"output": 12,
				"cacheRead": .5
			},
			"qwen/qwen3.5-plus-20260420": {
				"input": .3,
				"output": 1.8,
				"cacheWrite": .375
			},
			"qwen/qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"qwen/qwen3.5-35b-a3b": {
				"input": .15,
				"output": 1,
				"cacheRead": .05
			},
			"qwen/qwen3.6-max-preview": {
				"input": 1.027,
				"output": 6.162,
				"cacheWrite": 1.28375
			},
			"qwen/qwen3-30b-a3b": {
				"input": .12,
				"output": .5
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .55,
				"output": 3.5,
				"cacheRead": .225
			},
			"qwen/qwen3-8b": {
				"input": .117,
				"output": .455
			},
			"qwen/qwen3-vl-32b-instruct": {
				"input": .104,
				"output": .416
			},
			"qwen/qwen3-vl-8b-instruct": {
				"input": .117,
				"output": .455
			},
			"qwen/qwen3-30b-a3b-instruct-2507": {
				"input": .04815,
				"output": .19305
			},
			"qwen/qwen2.5-vl-72b-instruct": {
				"input": .8,
				"output": 1,
				"cacheRead": .4
			},
			"qwen/qwen-2.5-7b-instruct": {
				"input": .1,
				"output": .2
			},
			"qwen/qwen3.5-plus-02-15": {
				"input": .26,
				"output": 1.56
			},
			"qwen/qwen-2.5-72b-instruct": {
				"input": .36,
				"output": .4
			},
			"qwen/qwen3-30b-a3b-thinking-2507": {
				"input": .2,
				"output": 2.4
			},
			"qwen/qwen3.6-27b": {
				"input": .32,
				"output": 3.2
			},
			"qwen/qwen3.6-plus": {
				"input": .325,
				"output": 1.95,
				"cacheWrite": .40625
			},
			"qwen/qwen3-14b": {
				"input": .12,
				"output": .24
			},
			"qwen/qwen3-vl-8b-thinking": {
				"input": .18,
				"output": 2.1
			},
			"qwen/qwen3.7-plus": {
				"input": .32,
				"output": 1.28,
				"cacheRead": .064,
				"cacheWrite": .4
			},
			"qwen/qwen3.8-27b:free": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen3.8-max-0902": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"morph/morph-v3-large": {
				"input": .9,
				"output": 1.9
			},
			"morph/morph-v3-fast": {
				"input": .8,
				"output": 1.2
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-image-2": {
				"input": 8,
				"output": 15,
				"cacheRead": 2
			},
			"openai/gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-audio": {
				"input": 2.5,
				"output": 10
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5
			},
			"openai/gpt-6-astra-pro": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-4o-2024-05-13": {
				"input": 5,
				"output": 15
			},
			"openai/gpt-4o-mini-2024-07-18": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-chat-latest": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-audio-mini": {
				"input": .6,
				"output": 2.4
			},
			"openai/gpt-5.6-sol-pro": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-4": {
				"input": 30,
				"output": 60
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"openai/gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"openai/gpt-3.5-turbo-instruct": {
				"input": 1.5,
				"output": 2
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-4o-2024-08-06": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.6-luna-pro": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5-image-mini": {
				"input": 2.5,
				"output": 2,
				"cacheRead": .25
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/o3-pro": {
				"input": 20,
				"output": 80
			},
			"openai/gpt-oss-20b": {
				"input": .018,
				"output": .09,
				"cacheRead": .009
			},
			"openai/gpt-oss-safeguard-20b": {
				"input": .075,
				"output": .3,
				"cacheRead": .0375
			},
			"openai/o3-mini-high": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-3.5-turbo-16k": {
				"input": 3,
				"output": 4
			},
			"openai/gpt-5.2-chat": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-6-sol-pro": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-5-image": {
				"input": 10,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4o-2024-11-20": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-3.5-turbo-0613": {
				"input": 1,
				"output": 2
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-5.6-terra-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-6.1-sol-pro": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/o4-mini-high": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/gpt-6-luna-pro": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/gpt-oss-120b": {
				"input": .037,
				"output": .17
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .03
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/o1-pro": {
				"input": 150,
				"output": 600
			},
			"microsoft/phi-4": {
				"input": .07,
				"output": .14
			},
			"microsoft/wizardlm-2-8x22b": {
				"input": .62,
				"output": .62
			}
		},
		"perplexity": {
			"sonar-pro": {
				"input": 3,
				"output": 15
			},
			"sonar-deep-research": {
				"input": 2,
				"output": 8,
				"reasoning": 3
			},
			"sonar": {
				"input": 1,
				"output": 1
			},
			"sonar-reasoning-pro": {
				"input": 2,
				"output": 8
			}
		},
		"iteracompute": {
			"deepseek/deepseek-v4-flash-0731": {
				"input": .34,
				"output": 1.05,
				"cacheRead": .035
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": 1.1,
				"output": 3.3,
				"cacheRead": .11
			},
			"z-ai/glm-5.3-flash": {
				"input": .14,
				"output": .49,
				"cacheRead": .03
			},
			"z-ai/glm-5.3": {
				"input": 1.2,
				"output": 3.5,
				"cacheRead": .26
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 14.9,
				"cacheRead": .29
			},
			"minimax/minimax-m3": {
				"input": .29,
				"output": 1.2,
				"cacheRead": .08
			},
			"ornith-ai/ornith-1.5-35b-a3b": {
				"input": .3,
				"output": 3,
				"cacheRead": .03
			},
			"qwen/qwen3.8-27b": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"qwen/qwen3.8-2.4t-a95b": {
				"input": 1.95,
				"output": 5.95,
				"cacheRead": .2
			}
		},
		"meta": {
			"muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			}
		},
		"cline-pass": {
			"cline-pass/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"cline-pass/qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"cline-pass/mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"cline-pass/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"cline-pass/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"cline-pass/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"cline-pass/deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"cline-pass/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"cline-pass/mimo-v2.5-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .0145
			},
			"cline-pass/mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"cline-pass/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"cline-pass/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"cline-pass/deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .0145
			},
			"cline-pass/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"cline-pass/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"cline-pass/qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .04,
				"cacheWrite": .5
			},
			"cline-pass/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			}
		},
		"modal": {
			"thinkingmachines/Inkling-NVFP4": {
				"input": 1.2,
				"output": 5,
				"cacheRead": .27
			},
			"Qwen/Qwen3.8-2.4T-A95B": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15,
				"reasoning": 15,
				"cacheRead": .3
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .45,
				"output": 1.5,
				"cacheRead": .09
			}
		},
		"coralbricks": {
			"glm-5.3-fp4": {
				"input": 1.12,
				"output": 4.4,
				"cacheRead": 0,
				"cacheWrite": 1.68
			},
			"glm-5.3-flash-fp4": {
				"input": .15,
				"output": .5,
				"cacheRead": 0,
				"cacheWrite": .23
			},
			"deepseek-v4.1-flash-fast-fp4": {
				"input": .3,
				"output": 1.2,
				"cacheRead": 0,
				"cacheWrite": .09
			}
		},
		"routing-run": {
			"nemotron-3-ultra": {
				"input": .1,
				"output": .1
			},
			"kimi-k2.6": {
				"input": .275,
				"output": 1.1
			},
			"qwen3.5-9b": {
				"input": .16,
				"output": .48
			},
			"gpt-5.6-luna": {
				"input": .7,
				"output": 4.2
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25
			},
			"glm-5.2-nitro": {
				"input": .8,
				"output": 2.4
			},
			"glm-5.2": {
				"input": .8,
				"output": 2.4
			},
			"kimi-k2.6-nitro": {
				"input": .275,
				"output": 1.1
			},
			"deepseek-v4-pro": {
				"input": .348,
				"output": .696
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15
			},
			"kimi-k2.7-code-nitro": {
				"input": .275,
				"output": 1.1
			},
			"gpt-5.6-terra": {
				"input": 1.5,
				"output": 9
			},
			"kimi-k2.7-code": {
				"input": .275,
				"output": 1.1
			},
			"gpt-5.6-sol": {
				"input": 2.5,
				"output": 15
			},
			"deepseek-v4-flash": {
				"input": .112,
				"output": .224
			}
		},
		"echo": { "echo": {
			"input": 10,
			"output": 50
		} },
		"neuralwatt": {
			"glm-5.2-short-fast": {
				"input": 1.45,
				"output": 4.5,
				"cacheRead": .145
			},
			"kimi-k3-flex": {
				"input": 1.95,
				"output": 9.75,
				"cacheRead": .195
			},
			"deepseek-v4-flash-flex": {
				"input": .091,
				"output": .182,
				"cacheRead": .0182
			},
			"glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"glm-5.2-short-flex": {
				"input": .9425,
				"output": 2.925,
				"cacheRead": .09425
			},
			"qwen3.6-35b": {
				"input": .29,
				"output": 1.15,
				"cacheRead": .029
			},
			"glm-5.2-fast": {
				"input": 1.45,
				"output": 4.5,
				"cacheRead": .145
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"kimi-k3-fast": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"qwen3.6-35b-flex": {
				"input": .1885,
				"output": .7475,
				"cacheRead": .01885
			},
			"qwen-3.8-27b": {
				"input": .45,
				"output": 3.2,
				"cacheRead": .25
			},
			"glm-5.2-short": {
				"input": 1.45,
				"output": 4.5,
				"cacheRead": .145
			},
			"glm-5.3-flash-flex": {
				"input": .0975,
				"output": .325,
				"cacheRead": .0195
			},
			"qwen3.6-35b-fast": {
				"input": .29,
				"output": 1.15,
				"cacheRead": .029
			},
			"glm-5.2-flex": {
				"input": .9425,
				"output": 2.925,
				"cacheRead": .09425
			},
			"deepseek-v4-flash-speed": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"glm-5.2": {
				"input": 1.45,
				"output": 4.5,
				"cacheRead": .145
			},
			"glm-5.2-short-fast-flex": {
				"input": .9425,
				"output": 2.925,
				"cacheRead": .09425
			},
			"kimi-k2.7-code-fast": {
				"input": .95,
				"output": 4,
				"cacheRead": .095
			},
			"gemma-4-31b": {
				"input": .144,
				"output": .42,
				"cacheRead": .0144
			},
			"glm-5.3-flex": {
				"input": .9425,
				"output": 2.925,
				"cacheRead": .09425
			},
			"deepseek-v4-pro": {
				"input": 1,
				"output": 3,
				"cacheRead": .1
			},
			"qwen-3.8-27b-flex": {
				"input": .2925,
				"output": 2.08,
				"cacheRead": .1625
			},
			"kimi-k2.7-code-flex": {
				"input": .6175,
				"output": 2.6,
				"cacheRead": .06175
			},
			"glm-5.3": {
				"input": 1.45,
				"output": 4.5,
				"cacheRead": .145
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .095
			},
			"deepseek-v4.1-flash-flex": {
				"input": .0975,
				"output": .39,
				"cacheRead": .00975
			},
			"deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			}
		},
		"gitlab": {
			"duo-chat-gpt-5-4-nano": {
				"input": 0,
				"output": 0
			},
			"duo-chat-opus-5-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-6-1-sol": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-sonnet-5-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-6-astra": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-opus-4-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-mini": {
				"input": 0,
				"output": 0
			},
			"duo-chat-gpt-6-luna": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-sonnet-4-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-6-sol": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-sonnet-4-6": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-4-mini": {
				"input": 0,
				"output": 0
			},
			"duo-chat-haiku-4-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-fable-5-1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-5": {
				"input": 0,
				"output": 0
			},
			"duo-chat-fable-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-3-codex": {
				"input": 0,
				"output": 0
			},
			"duo-chat-gpt-5-1": {
				"input": 0,
				"output": 0
			},
			"duo-chat-gpt-6-sol": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-opus-4-7": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-2": {
				"input": 0,
				"output": 0
			},
			"duo-chat-opus-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-opus-4-6": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-6-luna": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-codex": {
				"input": 0,
				"output": 0
			},
			"duo-chat-sonnet-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-opus-4-8": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"duo-chat-gpt-5-2-codex": {
				"input": 0,
				"output": 0
			},
			"duo-chat-gpt-5-4": {
				"input": 0,
				"output": 0
			},
			"duo-chat-gpt-5-6-terra": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"infer": {
			"infer/gpt-6-astra:official": {
				"input": 12.5,
				"output": 62.5,
				"cacheRead": 1.25,
				"cacheWrite": 15.625
			},
			"infer/gpt-5.6-sol:official": {
				"input": 2.5,
				"output": 12.5,
				"cacheRead": .25,
				"cacheWrite": 3.125
			}
		},
		"azure": {
			"grok-4-1-fast-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"deepseek-v3.2-speciale": {
				"input": .58,
				"output": 1.68
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"grok-4-1-fast-non-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"phi-4-reasoning": {
				"input": .125,
				"output": .5
			},
			"text-embedding-3-small": {
				"input": .02,
				"output": 0
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"ministral-3b": {
				"input": .04,
				"output": .04
			},
			"gpt-chat-latest": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"gpt-5-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .03
			},
			"gpt-image-2": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"llama-4-maverick-17b-128e-instruct-fp8": {
				"input": .25,
				"output": 1
			},
			"o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"text-embedding-ada-002": {
				"input": .1,
				"output": 0
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .01
			},
			"phi-4-multimodal": {
				"input": .08,
				"output": .32
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4
			},
			"claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"gpt-image-2.5-flare": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"mistral-medium-2505": {
				"input": .4,
				"output": 2
			},
			"cohere-embed-v3-multilingual": {
				"input": .1,
				"output": 0
			},
			"o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"codex-mini": {
				"input": 1.5,
				"output": 6,
				"cacheRead": .375
			},
			"phi-4-reasoning-plus": {
				"input": .125,
				"output": .5
			},
			"claude-mythos-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"gpt-3.5-turbo-instruct": {
				"input": 1.5,
				"output": 2
			},
			"gpt-3.5-turbo-0125": {
				"input": .5,
				"output": 1.5
			},
			"gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"text-embedding-3-large": {
				"input": .13,
				"output": 0
			},
			"claude-opus-4-1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"cohere-embed-v-4-0": {
				"input": .12,
				"output": 0
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"codestral-2501": {
				"input": .3,
				"output": .9
			},
			"kimi-k2.5": {
				"input": .6,
				"output": 3
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"llama-3.3-70b-instruct": {
				"input": .71,
				"output": .71
			},
			"gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"cohere-command-a": {
				"input": 2.5,
				"output": 10
			},
			"cohere-embed-v3-english": {
				"input": .1,
				"output": 0
			},
			"model-router": {
				"input": .14,
				"output": 0
			},
			"gpt-image-2.5-sunburst": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gpt-image-1": {
				"input": 5,
				"output": 40,
				"cacheRead": 1.25
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .125
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"phi-4": {
				"input": .125,
				"output": .5
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"mistral-small-2503": {
				"input": .1,
				"output": .3
			},
			"phi-4-mini-reasoning": {
				"input": .075,
				"output": .3
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-4-turbo-vision": {
				"input": 10,
				"output": 30
			},
			"grok-4-20-non-reasoning": {
				"input": 2,
				"output": 6
			},
			"gpt-3.5-turbo-1106": {
				"input": 1,
				"output": 2
			},
			"gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"deepseek-r1": {
				"input": 1.35,
				"output": 5.4
			},
			"deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"llama-4-scout-17b-16e-instruct": {
				"input": .2,
				"output": .78
			},
			"claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gpt-image-1.5": {
				"input": 5,
				"output": 32,
				"cacheRead": 1.25
			},
			"grok-4-20-reasoning": {
				"input": 2,
				"output": 6
			},
			"gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"deepseek-v3.2": {
				"input": .58,
				"output": 1.68
			},
			"gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"phi-4-mini": {
				"input": .075,
				"output": .3
			},
			"deepseek-v4-flash": {
				"input": .19,
				"output": .51
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			}
		},
		"freemodel": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175,
				"cacheWrite": 1.75
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075,
				"cacheWrite": .75
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 5
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			}
		},
		"azure-cognitive-services": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"gpt-chat-latest": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4
			},
			"claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"claude-mythos-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"claude-opus-4-1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"kimi-k2.5": {
				"input": .6,
				"output": 3
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"gpt-5.6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"phi-4-mini": {
				"input": .075,
				"output": .3
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"deepseek-v3.2": {
				"input": .58,
				"output": 1.68
			},
			"gpt-image-1.5": {
				"input": 5,
				"output": 32,
				"cacheRead": 1.25
			},
			"llama-4-scout-17b-16e-instruct": {
				"input": .2,
				"output": .78
			},
			"deepseek-r1": {
				"input": 1.35,
				"output": 5.4
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"gpt-3.5-turbo-1106": {
				"input": 1,
				"output": 2
			},
			"gpt-4-turbo-vision": {
				"input": 10,
				"output": 30
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"phi-4-mini-reasoning": {
				"input": .075,
				"output": .3
			},
			"mistral-small-2503": {
				"input": .1,
				"output": .3
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"phi-4": {
				"input": .125,
				"output": .5
			},
			"gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .125
			},
			"gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-image-1": {
				"input": 5,
				"output": 40,
				"cacheRead": 1.25
			},
			"gpt-image-2.5-sunburst": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"model-router": {
				"input": .14,
				"output": 0
			},
			"cohere-embed-v3-english": {
				"input": .1,
				"output": 0
			},
			"cohere-command-a": {
				"input": 2.5,
				"output": 10
			},
			"gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"llama-3.3-70b-instruct": {
				"input": .71,
				"output": .71
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"codestral-2501": {
				"input": .3,
				"output": .9
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"cohere-embed-v-4-0": {
				"input": .12,
				"output": 0
			},
			"text-embedding-3-large": {
				"input": .13,
				"output": 0
			},
			"gpt-3.5-turbo-0125": {
				"input": .5,
				"output": 1.5
			},
			"gpt-3.5-turbo-instruct": {
				"input": 1.5,
				"output": 2
			},
			"gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"phi-4-reasoning-plus": {
				"input": .125,
				"output": .5
			},
			"codex-mini": {
				"input": 1.5,
				"output": 6,
				"cacheRead": .375
			},
			"o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"cohere-embed-v3-multilingual": {
				"input": .1,
				"output": 0
			},
			"mistral-medium-2505": {
				"input": .4,
				"output": 2
			},
			"gpt-image-2.5-flare": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"phi-4-multimodal": {
				"input": .08,
				"output": .32
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .01
			},
			"gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"text-embedding-ada-002": {
				"input": .1,
				"output": 0
			},
			"o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"llama-4-maverick-17b-128e-instruct-fp8": {
				"input": .25,
				"output": 1
			},
			"o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"gpt-image-2": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .03
			},
			"gpt-5-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"ministral-3b": {
				"input": .04,
				"output": .04
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"text-embedding-3-small": {
				"input": .02,
				"output": 0
			},
			"phi-4-reasoning": {
				"input": .125,
				"output": .5
			},
			"deepseek-v3.2-speciale": {
				"input": .58,
				"output": 1.68
			}
		},
		"pendra": {
			"llama3.3:70b": {
				"input": 0,
				"output": 0
			},
			"qwen3-coder:30b": {
				"input": 0,
				"output": 0
			},
			"gpt-oss:120b": {
				"input": 0,
				"output": 0
			},
			"qwen3.6:27b": {
				"input": 0,
				"output": 0
			},
			"glm-4.7-flash": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-flash": {
				"input": 0,
				"output": 0
			}
		},
		"moark": {
			"GLM-4.7": {
				"input": 3.5,
				"output": 14
			},
			"MiniMax-M2.1": {
				"input": 2.1,
				"output": 8.4,
				"cacheRead": 2.1,
				"cacheWrite": 8.4
			}
		},
		"atomic-chat": {
			"gemma-4-E4B-it-MLX-4bit": {
				"input": 0,
				"output": 0
			},
			"Meta-Llama-3_1-8B-Instruct-GGUF": {
				"input": 0,
				"output": 0
			},
			"Qwen3_5-9B-Q4_K_M": {
				"input": 0,
				"output": 0
			},
			"gemma-4-E4B-it-IQ4_XS": {
				"input": 0,
				"output": 0
			},
			"Qwen3_5-9B-MLX-4bit": {
				"input": 0,
				"output": 0
			}
		},
		"qihang-ai": {
			"gpt-5.2-codex": {
				"input": .14,
				"output": 1.14
			},
			"gemini-3-pro-preview": {
				"input": .57,
				"output": 3.43
			},
			"gpt-5-mini": {
				"input": .04,
				"output": .29
			},
			"claude-opus-4-5-20251101": {
				"input": .71,
				"output": 3.57
			},
			"gemini-2.5-flash": {
				"input": .09,
				"output": .71
			},
			"gpt-5.2": {
				"input": .25,
				"output": 2
			},
			"claude-sonnet-4-5-20250929": {
				"input": .43,
				"output": 2.14
			},
			"gemini-3-flash-preview": {
				"input": .07,
				"output": .43
			},
			"claude-haiku-4-5-20251001": {
				"input": .14,
				"output": .71
			}
		},
		"ai-router": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"gpt-5.6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 6.25
			}
		},
		"llmtr": {
			"muse-glimmer-30b-tr": {
				"input": 2,
				"output": 5,
				"cacheRead": .5
			},
			"magibu-11b-v8": {
				"input": .1,
				"output": .5
			},
			"gemma-4": {
				"input": 2,
				"output": 5,
				"cacheRead": .5
			},
			"trendyol-asure-12b": {
				"input": .1,
				"output": .5,
				"cacheRead": .025
			},
			"medgemma-4b": {
				"input": 3,
				"output": 5
			},
			"qwen3-6-35b": {
				"input": 5,
				"output": 10
			},
			"poolside/laguna-xs-2.1": {
				"input": 0,
				"output": 0
			},
			"publicai/apertus-70b-instruct": {
				"input": .82,
				"output": 2.92
			},
			"publicai/apertus-8b-instruct": {
				"input": .1,
				"output": .2
			},
			"thinkingmachines/inkling-small": {
				"input": .58,
				"output": 1.44
			},
			"thinkingmachines/inkling": {
				"input": 1.87,
				"output": 4.68
			},
			"perplexity/sonar-deep-research": {
				"input": 2,
				"output": 8,
				"reasoning": 3
			},
			"meta/muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2
			},
			"upstage/solar-pro4": {
				"input": .03,
				"output": .12
			},
			"upstage/solar-pro3": {
				"input": .15,
				"output": .6
			},
			"upstage/solar-pro2": {
				"input": .15,
				"output": .6
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .1
			},
			"mimo/mimo-v2.5": {
				"input": .14,
				"output": .28
			},
			"mimo/mimo-v2.5-pro": {
				"input": .435,
				"output": .87
			},
			"sakana/fugu-ultra": {
				"input": 5,
				"output": 30
			},
			"mistral/voxtral-small-latest": {
				"input": .1,
				"output": .3
			},
			"qwen/qwen-flash": {
				"input": .05,
				"output": .4
			},
			"qwen/qwen3-vl-plus": {
				"input": .2,
				"output": 1.6
			},
			"qwen/qwen3.5-plus": {
				"input": .4,
				"output": 2.4
			},
			"qwen/qwen-plus": {
				"input": .4,
				"output": 1.2
			},
			"qwen/qwen3-max": {
				"input": 1.2,
				"output": 6
			},
			"qwen/qwen3.6-flash": {
				"input": .25,
				"output": 1.5
			},
			"qwen/qwen3-coder-flash": {
				"input": .3,
				"output": 1.5
			},
			"qwen/qwen3-coder-plus": {
				"input": 1,
				"output": 5
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .6,
				"output": 3.6
			},
			"qwen/qwen3.6-plus": {
				"input": .5,
				"output": 3
			},
			"qwen/qwen3.7-plus": {
				"input": .4,
				"output": 1.6
			}
		},
		"alibaba": {
			"qwen-flash": {
				"input": .05,
				"output": .4
			},
			"qwen3.5-flash": {
				"input": .1,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"qwen2-5-32b-instruct": {
				"input": .7,
				"output": 2.8
			},
			"qwq-plus": {
				"input": .8,
				"output": 2.4
			},
			"qwen2-5-vl-72b-instruct": {
				"input": 2.8,
				"output": 8.4
			},
			"qwen3-vl-plus": {
				"input": .2,
				"output": 1.6,
				"reasoning": 4.8
			},
			"qwen3.5-27b": {
				"input": .3,
				"output": 2.4
			},
			"deepseek-v4-flash-0731": {
				"input": .2,
				"output": .4,
				"cacheRead": .04
			},
			"qwen-max": {
				"input": 1.6,
				"output": 6.4
			},
			"qwen3-next-80b-a3b-thinking": {
				"input": .5,
				"output": 6
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"qwen-plus-character-ja": {
				"input": .5,
				"output": 1.4
			},
			"qwen3.5-plus": {
				"input": .4,
				"output": 2.4,
				"reasoning": 2.4
			},
			"qwen3-livetranslate-flash-realtime": {
				"input": 10,
				"output": 10
			},
			"qwen2-5-72b-instruct": {
				"input": 1.4,
				"output": 5.6
			},
			"qwen3-32b": {
				"input": .7,
				"output": 2.8,
				"reasoning": 8.4
			},
			"qwen-plus": {
				"input": .4,
				"output": 1.2,
				"reasoning": 4
			},
			"qwen3.7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .003,
				"cacheWrite": .0375
			},
			"qwen3-max": {
				"input": 1.2,
				"output": 6
			},
			"qwen-omni-turbo-realtime": {
				"input": .27,
				"output": 1.07
			},
			"qwen3-coder-480b-a35b-instruct": {
				"input": 1.5,
				"output": 7.5
			},
			"qwen-turbo": {
				"input": .05,
				"output": .2,
				"reasoning": .5
			},
			"qwen3-coder-30b-a3b-instruct": {
				"input": .45,
				"output": 2.25
			},
			"qwen3.8-omni-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"qvq-max": {
				"input": 1.2,
				"output": 4.8
			},
			"qwen2-5-7b-instruct": {
				"input": .175,
				"output": .7
			},
			"qwen3-omni-flash": {
				"input": .43,
				"output": 1.66
			},
			"qwen-vl-max": {
				"input": .8,
				"output": 3.2
			},
			"qwen3-235b-a22b": {
				"input": .7,
				"output": 2.8,
				"reasoning": 8.4
			},
			"qwen3-vl-30b-a3b": {
				"input": .2,
				"output": .8,
				"reasoning": 2.4
			},
			"qwen3.5-122b-a10b": {
				"input": .4,
				"output": 3.2
			},
			"qwen3.6-35b-a3b": {
				"input": .248,
				"output": 1.485
			},
			"qwen3-next-80b-a3b-instruct": {
				"input": .5,
				"output": 2
			},
			"qwen-vl-plus": {
				"input": .21,
				"output": .63
			},
			"qwen3.6-flash": {
				"input": .1875,
				"output": 1.125,
				"cacheWrite": .234375
			},
			"qwen3-coder-flash": {
				"input": .3,
				"output": 1.5
			},
			"qwen2-5-omni-7b": {
				"input": .1,
				"output": .4
			},
			"qwen-mt-plus": {
				"input": 2.46,
				"output": 7.37
			},
			"qwen3-vl-235b-a22b": {
				"input": .7,
				"output": 2.8,
				"reasoning": 8.4
			},
			"qwen3-coder-plus": {
				"input": 1,
				"output": 5
			},
			"qwen2-5-14b-instruct": {
				"input": .35,
				"output": 1.4
			},
			"qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"qwen2-5-vl-7b-instruct": {
				"input": .35,
				"output": 1.05
			},
			"qwen3.5-35b-a3b": {
				"input": .25,
				"output": 2
			},
			"qwen3.6-max-preview": {
				"input": 1.3,
				"output": 7.8,
				"cacheRead": .13,
				"cacheWrite": 1.625
			},
			"qwen-mt-turbo": {
				"input": .16,
				"output": .49
			},
			"qwen3.5-397b-a17b": {
				"input": .6,
				"output": 3.6
			},
			"qwen3-8b": {
				"input": .18,
				"output": .7,
				"reasoning": 2.1
			},
			"glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .28,
				"cacheWrite": 0
			},
			"qwen-omni-turbo": {
				"input": .07,
				"output": .27
			},
			"qwen3-omni-flash-realtime": {
				"input": .52,
				"output": 1.99
			},
			"qwen3-asr-flash": {
				"input": .035,
				"output": .035
			},
			"qwen3.6-27b": {
				"input": .6,
				"output": 3.6
			},
			"qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"qwen3-14b": {
				"input": .35,
				"output": 1.4,
				"reasoning": 4.2
			},
			"qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .04,
				"cacheWrite": .5
			},
			"qwen-vl-ocr": {
				"input": .72,
				"output": .72
			}
		},
		"auriko": {
			"qwen-3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"minimax-m2-7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheWrite": .375
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"kimi-k2.5": {
				"input": .5,
				"output": 2.8
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"minimax-m2-7": {
				"input": .3,
				"output": 1.2,
				"cacheWrite": .375
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"deepseek-v4-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			}
		},
		"zenmux": {
			"anthropic/claude-opus-4.1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic/claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-3.5-haiku": {
				"input": .8,
				"output": 4,
				"cacheRead": .08,
				"cacheWrite": 1
			},
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-5-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"anthropic/claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-3.7-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 4
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-opus-4": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"deepseek/deepseek-chat": {
				"input": .28,
				"output": .42,
				"cacheRead": .03
			},
			"deepseek/deepseek-v3.2-exp": {
				"input": .22,
				"output": .33
			},
			"deepseek/deepseek-v4-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"deepseek/deepseek-v3.2": {
				"input": .28,
				"output": .43
			},
			"deepseek/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"tencent/hy3-preview": {
				"input": .172,
				"output": .572,
				"cacheRead": .058,
				"cacheWrite": 0
			},
			"z-ai/glm-4.6v": {
				"input": .1456,
				"output": .4367,
				"cacheRead": .0291
			},
			"z-ai/glm-4.5": {
				"input": .2911,
				"output": 1.1645,
				"cacheRead": .0582
			},
			"z-ai/glm-5v-turbo": {
				"input": .726,
				"output": 3.1946,
				"cacheRead": .1743
			},
			"z-ai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"z-ai/glm-4.6": {
				"input": .2911,
				"output": 1.1645,
				"cacheRead": .0582
			},
			"z-ai/glm-5": {
				"input": .58,
				"output": 2.6,
				"cacheRead": .14
			},
			"z-ai/glm-4.6v-flash": {
				"input": .0218,
				"output": .2184,
				"cacheRead": .0044
			},
			"z-ai/glm-5.3-flashx": {
				"input": .375,
				"output": 1.25,
				"cacheRead": .075
			},
			"z-ai/glm-4.7": {
				"input": .2911,
				"output": 1.1645,
				"cacheRead": .0582
			},
			"z-ai/glm-4.7-flash-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"z-ai/glm-5.2": {
				"input": .98,
				"output": 3.08,
				"cacheRead": .182
			},
			"z-ai/glm-5.1": {
				"input": .8781,
				"output": 3.5126,
				"cacheRead": .1903
			},
			"z-ai/glm-4.7-flashx": {
				"input": .0728,
				"output": .4367,
				"cacheRead": .0146
			},
			"z-ai/glm-5-turbo": {
				"input": .73,
				"output": 3.19,
				"cacheRead": .174
			},
			"z-ai/glm-4.6v-flash-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"z-ai/glm-4.5-air": {
				"input": .1165,
				"output": .2911,
				"cacheRead": .0233
			},
			"z-ai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"kuaishou/kat-coder-pro-v2": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"baidu/ernie-5.0-thinking-preview": {
				"input": .84,
				"output": 3.37
			},
			"x-ai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"x-ai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"x-ai/grok-4.2-fast": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"x-ai/grok-4.2-fast-non-reasoning": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"x-ai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"volcengine/doubao-seed-2.0-mini": {
				"input": .03,
				"output": .28,
				"cacheRead": .01,
				"cacheWrite": .0024
			},
			"volcengine/doubao-seed-2.0-lite": {
				"input": .09,
				"output": .51,
				"cacheRead": .02,
				"cacheWrite": .0024
			},
			"volcengine/doubao-seed-code": {
				"input": .17,
				"output": 1.12,
				"cacheRead": .03
			},
			"volcengine/doubao-seed-2.0-pro": {
				"input": .45,
				"output": 2.24,
				"cacheRead": .09,
				"cacheWrite": .0024
			},
			"volcengine/doubao-seed-1.8": {
				"input": .11,
				"output": .28,
				"cacheRead": .02,
				"cacheWrite": .0024
			},
			"volcengine/doubao-seed-2.0-code": {
				"input": .9,
				"output": 4.48
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 4.5
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .31,
				"cacheWrite": 4.5
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .07,
				"cacheWrite": 1
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": 1
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .03,
				"cacheWrite": 1
			},
			"google/gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"sapiens-ai/agnes-1.5-lite": {
				"input": .12,
				"output": .6
			},
			"sapiens-ai/agnes-1.5-pro": {
				"input": .16,
				"output": .8
			},
			"inclusionai/ring-2.6-1t": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .06
			},
			"inclusionai/ring-1t": {
				"input": .56,
				"output": 2.24,
				"cacheRead": .11
			},
			"inclusionai/ling-1t": {
				"input": .56,
				"output": 2.24,
				"cacheRead": .11
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshotai/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"moonshotai/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshotai/kimi-k2-thinking": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .15
			},
			"moonshotai/kimi-k2.5": {
				"input": .58,
				"output": 3.02,
				"cacheRead": .1
			},
			"moonshotai/kimi-k3-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"moonshotai/kimi-k2-0905": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .15
			},
			"moonshotai/kimi-k2.7-code-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"moonshotai/kimi-k2-thinking-turbo": {
				"input": 1.15,
				"output": 8,
				"cacheRead": .15
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"xiaomi/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"xiaomi/mimo-v2-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .01
			},
			"xiaomi/mimo-v2.5": {
				"input": .4,
				"output": 2,
				"cacheRead": .08
			},
			"xiaomi/mimo-v2-omni": {
				"input": .4,
				"output": 2,
				"cacheRead": .08
			},
			"xiaomi/mimo-v2-pro": {
				"input": 1,
				"output": 3,
				"cacheRead": .2
			},
			"xiaomi/mimo-v2.5-pro": {
				"input": 1,
				"output": 3,
				"cacheRead": .2
			},
			"minimax/minimax-m2.5-lightning": {
				"input": .6,
				"output": 4.8,
				"cacheRead": .06,
				"cacheWrite": .75
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.7": {
				"input": .3055,
				"output": 1.2219
			},
			"minimax/minimax-m3": {
				"input": .6,
				"output": 2.4
			},
			"minimax/minimax-m2.7-highspeed": {
				"input": .611,
				"output": 2.4439
			},
			"minimax/minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .38
			},
			"minimax/minimax-m2": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .38
			},
			"stepfun/step-3": {
				"input": .21,
				"output": .57
			},
			"stepfun/step-3.5-flash": {
				"input": .1,
				"output": .3
			},
			"stepfun/step-3.7-flash": {
				"input": .2,
				"output": 1.15
			},
			"stepfun/step-3.7-flash-free": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen3.5-flash": {
				"input": .1,
				"output": .4
			},
			"qwen/qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"qwen/qwen3.5-plus": {
				"input": .8,
				"output": 4.8
			},
			"qwen/qwen3-max": {
				"input": 1.2,
				"output": 6
			},
			"qwen/qwen3-coder-plus": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"qwen/qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"qwen/qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"openai/gpt-5.4": {
				"input": 3.75,
				"output": 18.75
			},
			"openai/gpt-5.4-pro": {
				"input": 45,
				"output": 225
			},
			"openai/gpt-5.3-chat": {
				"input": 1.75,
				"output": 14
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25
			},
			"openai/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .17
			},
			"openai/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12
			},
			"openai/gpt-5-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12
			},
			"openai/gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14
			},
			"openai/gpt-5.5-instant": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5
			},
			"openai/gpt-5.6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .17
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-5.1-chat": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12
			},
			"openai/gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .03
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12
			},
			"openai/gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			}
		},
		"unorouter": {
			"gpt-5.5:free": {
				"input": 0,
				"output": 0
			},
			"gpt-5.4": {
				"input": 1.8,
				"output": 10.8
			},
			"glm-4.5-flash:free": {
				"input": 0,
				"output": 0
			},
			"gemma-4-31b-it:free": {
				"input": 0,
				"output": 0
			},
			"kimi-k2.6": {
				"input": 1.2675,
				"output": 5.3368
			},
			"nemotron-3-ultra-550b-a55b:free": {
				"input": 0,
				"output": 0
			},
			"gpt-5.4:free": {
				"input": 0,
				"output": 0
			},
			"minimax-m2.7": {
				"input": .819,
				"output": 3.276
			},
			"gemini-3.5-flash": {
				"input": .1857,
				"output": 1.1142
			},
			"gpt-5.2": {
				"input": 1.05,
				"output": 8.4
			},
			"claude-opus-4-8": {
				"input": .425,
				"output": 2.125
			},
			"gpt-5.5": {
				"input": .1875,
				"output": 1.125
			},
			"claude-sonnet-5": {
				"input": 1.44,
				"output": 7.2
			},
			"glm-5.2": {
				"input": 1.6001,
				"output": 5.0288
			},
			"step-3.7-flash:free": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-flash:free": {
				"input": 0,
				"output": 0
			},
			"claude-haiku-4-5-20251001": {
				"input": 1.2,
				"output": 6
			},
			"deepseek-v4-pro:free": {
				"input": 0,
				"output": 0
			},
			"glm-5.2:free": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-pro": {
				"input": .8999,
				"output": 1.7999
			},
			"qwen3.5-397b-a17b:free": {
				"input": 0,
				"output": 0
			},
			"minimax-m2.7:free": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-flash": {
				"input": .0625,
				"output": .125
			}
		},
		"salad-cloud": { "qwen3.6-35b-a3b": {
			"input": .09,
			"output": .6
		} },
		"vispark": {
			"vispark/vision-large": {
				"input": 7.37,
				"output": 22.11
			},
			"vispark/vision-small": {
				"input": 1.05,
				"output": 3.16
			},
			"vispark/vision-medium": {
				"input": 4.21,
				"output": 12.63
			}
		},
		"siliconflow-cn": {
			"ByteDance-Seed/Seed-OSS-36B-Instruct": {
				"input": .21,
				"output": .57
			},
			"tencent/Hunyuan-A13B-Instruct": {
				"input": .14,
				"output": .57
			},
			"Qwen/Qwen3.5-4B": {
				"input": 0,
				"output": 0
			},
			"Qwen/Qwen3.5-27B": {
				"input": .26,
				"output": 2.09
			},
			"Qwen/Qwen3.6-35B-A3B": {
				"input": .23,
				"output": 1.86
			},
			"Qwen/Qwen3-235B-A22B-Thinking-2507": {
				"input": .13,
				"output": .6
			},
			"Qwen/Qwen3-14B": {
				"input": .07,
				"output": .28
			},
			"Qwen/Qwen3-8B": {
				"input": .06,
				"output": .06
			},
			"Qwen/Qwen3-32B": {
				"input": .14,
				"output": .57
			},
			"Qwen/Qwen3.5-35B-A3B": {
				"input": .23,
				"output": 1.86
			},
			"Qwen/Qwen3.5-122B-A10B": {
				"input": .29,
				"output": 2.32
			},
			"Qwen/Qwen3.5-9B": {
				"input": .22,
				"output": 1.74
			},
			"Qwen/Qwen3.5-397B-A17B": {
				"input": .29,
				"output": 1.74
			},
			"Qwen/Qwen3-Coder-480B-A35B-Instruct": {
				"input": .25,
				"output": 1
			},
			"Qwen/Qwen3-VL-32B-Instruct": {
				"input": .2,
				"output": .6
			},
			"Qwen/Qwen2.5-7B-Instruct": {
				"input": .05,
				"output": .05
			},
			"Qwen/Qwen3-Coder-30B-A3B-Instruct": {
				"input": .07,
				"output": .28
			},
			"Qwen/Qwen2.5-72B-Instruct": {
				"input": .59,
				"output": .59
			},
			"Qwen/Qwen3-VL-30B-A3B-Thinking": {
				"input": .29,
				"output": 1
			},
			"Qwen/Qwen3-30B-A3B-Instruct-2507": {
				"input": .09,
				"output": .3
			},
			"Qwen/Qwen3-VL-32B-Thinking": {
				"input": .2,
				"output": 1.5
			},
			"Qwen/Qwen3-VL-8B-Instruct": {
				"input": .18,
				"output": .68
			},
			"Qwen/Qwen3-VL-30B-A3B-Instruct": {
				"input": .29,
				"output": 1
			},
			"deepseek-ai/DeepSeek-R1": {
				"input": .5,
				"output": 2.18
			},
			"deepseek-ai/DeepSeek-V4-Flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .003
			},
			"deepseek-ai/DeepSeek-OCR": {
				"input": 0,
				"output": 0
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .145
			},
			"deepseek-ai/DeepSeek-V3.2": {
				"input": .27,
				"output": .42
			},
			"deepseek-ai/DeepSeek-V3.1-Terminus": {
				"input": .27,
				"output": 1
			},
			"deepseek-ai/DeepSeek-V3": {
				"input": .25,
				"output": 1
			},
			"stepfun-ai/Step-3.5-Flash": {
				"input": .1,
				"output": .3
			},
			"inclusionAI/Ling-flash-2.0": {
				"input": .14,
				"output": .57
			},
			"zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"zai-org/GLM-4.5-Air": {
				"input": .14,
				"output": .86
			},
			"Pro/deepseek-ai/DeepSeek-R1": {
				"input": .5,
				"output": 2.18
			},
			"Pro/deepseek-ai/DeepSeek-V3.2": {
				"input": .27,
				"output": .42
			},
			"Pro/deepseek-ai/DeepSeek-V3": {
				"input": .25,
				"output": 1
			},
			"Pro/deepseek-ai/DeepSeek-V3.1-Terminus": {
				"input": .27,
				"output": 1
			},
			"Pro/MiniMaxAI/MiniMax-M2.5": {
				"input": .3,
				"output": 1.22
			},
			"Pro/moonshotai/Kimi-K2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"Pro/moonshotai/Kimi-K2.5": {
				"input": .45,
				"output": 2.25,
				"cacheRead": .07
			},
			"Pro/zai-org/GLM-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"Pro/zai-org/GLM-5": {
				"input": 1,
				"output": 3.2
			},
			"PaddlePaddle/PaddleOCR-VL-1.5": {
				"input": 0,
				"output": 0
			}
		},
		"regolo-ai": {
			"qwen3.8-27b": {
				"input": .58,
				"output": 2.42
			},
			"brick-v1-beta": {
				"input": 0,
				"output": 0
			},
			"qwen3.5-122b": {
				"input": .9,
				"output": 3.6
			},
			"qwen3-coder-next": {
				"input": .3,
				"output": 1.2
			},
			"apertus-70b": {
				"input": .46,
				"output": 2.42
			},
			"glm5.2": {
				"input": 2.31,
				"output": 6
			},
			"qwen3-reranker-4b": {
				"input": .12,
				"output": .12
			},
			"deepseek-ocr-2": {
				"input": 0,
				"output": 0
			},
			"llama-3.3-70b-instruct": {
				"input": .6,
				"output": 2.7
			},
			"gemma4-31b": {
				"input": .46,
				"output": 2.42
			},
			"brick-complexity-pro": {
				"input": .12,
				"output": .46
			},
			"gpt-oss-20b": {
				"input": .4,
				"output": 1.8
			},
			"qwen3.5-9b": {
				"input": .15,
				"output": .6
			},
			"qwen3-embedding-8b": {
				"input": .1,
				"output": .1
			},
			"mistral-small-4-119b": {
				"input": .75,
				"output": 3
			},
			"qwen-image": {
				"input": .5,
				"output": 2
			},
			"gpt-oss-120b": {
				"input": 1,
				"output": 4.2
			},
			"faster-whisper-large-v3": {
				"input": 0,
				"output": 0
			}
		},
		"xiaomi-token-plan-ams": {
			"mimo-v2.6-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.6-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.5-tts-voiceclone": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2-tts": {
				"input": 0,
				"output": 0
			},
			"mimo-v2-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.5-tts": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5-tts-voicedesign": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			}
		},
		"inceptron": {
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .13,
				"output": .28,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"moonshotai/Kimi-K2.6": {
				"input": .53,
				"output": 3.39,
				"cacheRead": .17,
				"cacheWrite": 0
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .66,
				"output": 3.4,
				"cacheRead": .18,
				"cacheWrite": 0
			},
			"zai-org/GLM-5.2": {
				"input": .71,
				"output": 2.35,
				"cacheRead": .12,
				"cacheWrite": 0
			}
		},
		"upstage": {
			"solar-pro4": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"solar-pro3": {
				"input": .25,
				"output": .25
			},
			"solar-mini": {
				"input": .15,
				"output": .15
			},
			"solar-pro2": {
				"input": .25,
				"output": .25
			}
		},
		"vultr": {
			"mimo-v2.6-pro-rl": {
				"input": .4,
				"output": .8
			},
			"qwen3.8-27b": {
				"input": .15,
				"output": 1
			},
			"glm-5.3-flash": {
				"input": .1,
				"output": .35
			},
			"deepseek-v4-flash-0731": {
				"input": .1,
				"output": .25
			},
			"muse-glimmer-30b": {
				"input": .25,
				"output": 1
			},
			"deepseek-v4.1-flash": {
				"input": .15,
				"output": .6
			},
			"laguna-s-2.1": {
				"input": .09,
				"output": .18
			},
			"glm-5.x-menthol": {
				"input": .4,
				"output": 1.75
			},
			"nemotron-3-nano-omni-30b-a3b-reasoning": {
				"input": .1,
				"output": .25
			},
			"mimo-v2.6-flash-rl": {
				"input": .1,
				"output": .25
			},
			"minimax-m3": {
				"input": .2,
				"output": .9
			},
			"qwen3.8-flash-next": {
				"input": .1,
				"output": .2
			},
			"glm-5.2": {
				"input": .75,
				"output": 3
			},
			"nemotron-3.5-content-safety": {
				"input": .05,
				"output": .15
			},
			"glm-5.3": {
				"input": .75,
				"output": 3
			}
		},
		"huggingface": {
			"tencent/Hy3": {
				"input": .14,
				"output": .58
			},
			"tencent/Hy4-preview": {
				"input": .834,
				"output": 2.501
			},
			"meta-llama/Llama-3.1-8B-Instruct": {
				"input": .06,
				"output": .06
			},
			"meta-llama/Llama-3.3-70B-Instruct": {
				"input": .59,
				"output": .79
			},
			"XiaomiMiMo/MiMo-V2-Flash": {
				"input": .1,
				"output": .3
			},
			"XiaomiMiMo/MiMo-V2.5-Pro": {
				"input": 1,
				"output": 3
			},
			"XiaomiMiMo/MiMo-V2.5": {
				"input": .4,
				"output": 2
			},
			"thinkingmachines/Inkling-Small": {
				"input": .5,
				"output": 1.2
			},
			"thinkingmachines/Inkling": {
				"input": 1,
				"output": 4.05
			},
			"google/gemma-3-27b-it": {
				"input": .08,
				"output": .16
			},
			"google/gemma-3-12b-it": {
				"input": .05,
				"output": .15
			},
			"google/gemma-3-4b-it": {
				"input": .05,
				"output": .1
			},
			"google/gemma-4-31B-it": {
				"input": .14,
				"output": .4
			},
			"google/gemma-4-26B-A4B-it": {
				"input": .13,
				"output": .4
			},
			"Qwen/Qwen3-VL-235B-A22B-Instruct": {
				"input": .3,
				"output": 1.5
			},
			"Qwen/Qwen3.8-27B": {
				"input": .4,
				"output": 3
			},
			"Qwen/Qwen3-Next-80B-A3B-Instruct": {
				"input": .25,
				"output": 1
			},
			"Qwen/Qwen2.5-Coder-32B-Instruct": {
				"input": .06,
				"output": .2
			},
			"Qwen/Qwen3-Coder-Next": {
				"input": .2,
				"output": 1.5
			},
			"Qwen/Qwen3-VL-235B-A22B-Thinking": {
				"input": .98,
				"output": 3.95
			},
			"Qwen/Qwen3.5-27B": {
				"input": .3,
				"output": 2.4
			},
			"Qwen/Qwen3-Next-80B-A3B-Thinking": {
				"input": .3,
				"output": 2
			},
			"Qwen/Qwen3.6-35B-A3B": {
				"input": .15,
				"output": .95
			},
			"Qwen/Qwen3-235B-A22B-Thinking-2507": {
				"input": .3,
				"output": 3
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": .855,
				"output": 2.565
			},
			"Qwen/Qwen3-235B-A22B": {
				"input": .2,
				"output": .8
			},
			"Qwen/Qwen3-32B": {
				"input": .29,
				"output": .59
			},
			"Qwen/Qwen3-Coder-30B-A3B-Instruct": {
				"input": .07,
				"output": .26
			},
			"Qwen/Qwen3-Embedding-8B": {
				"input": .01,
				"output": 0
			},
			"Qwen/Qwen3.5-35B-A3B": {
				"input": .25,
				"output": 2
			},
			"Qwen/Qwen3.5-122B-A10B": {
				"input": .4,
				"output": 3.2
			},
			"Qwen/Qwen3.5-9B": {
				"input": .17,
				"output": .25
			},
			"Qwen/Qwen3.5-397B-A17B": {
				"input": .6,
				"output": 3.6
			},
			"Qwen/Qwen3-Embedding-4B": {
				"input": .01,
				"output": 0
			},
			"Qwen/Qwen3.8-2.4T-A95B": {
				"input": 2.5,
				"output": 6.25
			},
			"Qwen/Qwen3-30B-A3B": {
				"input": .12,
				"output": .5
			},
			"Qwen/Qwen3-Coder-480B-A35B-Instruct": {
				"input": 2,
				"output": 2
			},
			"Qwen/Qwen3.6-27B": {
				"input": .47,
				"output": 3.19
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .27,
				"output": 1
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .14,
				"output": .28
			},
			"deepseek-ai/DeepSeek-R1": {
				"input": .7,
				"output": 2.5
			},
			"deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.32,
				"output": 3.96
			},
			"deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .3,
				"output": 1.2
			},
			"deepseek-ai/DeepSeek-V4-Flash": {
				"input": .14,
				"output": .28
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"deepseek-ai/DeepSeek-V3.2": {
				"input": .28,
				"output": .4
			},
			"deepseek-ai/DeepSeek-R1-0528": {
				"input": 3,
				"output": 5
			},
			"deepseek-ai/DeepSeek-V3": {
				"input": .4,
				"output": 1.3
			},
			"deepseek-ai/DeepSeek-V3-0324": {
				"input": .27,
				"output": 1.12
			},
			"deepseek-ai/DeepSeek-V4-Flash-Vision-Exp": {
				"input": .44,
				"output": 1.32
			},
			"stepfun-ai/Step-3.7-Flash": {
				"input": .2,
				"output": 1.15
			},
			"stepfun-ai/Step-3.5-Flash": {
				"input": .1,
				"output": .3
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .3,
				"output": 1.2
			},
			"MiniMaxAI/MiniMax-M2.1": {
				"input": .3,
				"output": 1.2
			},
			"MiniMaxAI/MiniMax-M2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"MiniMaxAI/MiniMax-M2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"MiniMaxAI/MiniMax-M2": {
				"input": .3,
				"output": 1.2
			},
			"moonshotai/Kimi-K2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15
			},
			"moonshotai/Kimi-K2-Instruct": {
				"input": 1,
				"output": 3
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .95,
				"output": 4
			},
			"moonshotai/Kimi-K2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"moonshotai/Kimi-K2-Thinking": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .15
			},
			"moonshotai/Kimi-K2-Instruct-0905": {
				"input": 1,
				"output": 3
			},
			"zai-org/GLM-4.6V-Flash": {
				"input": .3,
				"output": .9
			},
			"zai-org/GLM-5.1": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4
			},
			"zai-org/GLM-4.5-Air": {
				"input": .13,
				"output": .85
			},
			"zai-org/GLM-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai-org/GLM-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5
			},
			"zai-org/GLM-4.5V": {
				"input": .6,
				"output": 1.8
			},
			"zai-org/GLM-4.6": {
				"input": .55,
				"output": 2.2
			},
			"zai-org/GLM-4.7-Flash": {
				"input": 0,
				"output": 0
			},
			"zai-org/GLM-5.3": {
				"input": 1.4,
				"output": 4.4
			},
			"zai-org/GLM-4.5": {
				"input": .6,
				"output": 2.2
			},
			"openai/gpt-oss-20b": {
				"input": .1,
				"output": .5
			},
			"openai/gpt-oss-120b": {
				"input": .25,
				"output": .69
			}
		},
		"volcengine": {
			"glm-5-3-flash-260828": {
				"input": .11875,
				"output": .41563,
				"cacheRead": .03414
			},
			"doubao-seed-1-6-251015": {
				"input": .11875,
				"output": 1.18747,
				"cacheRead": .02375
			},
			"doubao-seed-2-0-pro-260215": {
				"input": .47499,
				"output": 2.37494,
				"cacheRead": .095
			},
			"doubao-seed-2-0-lite-260428": {
				"input": .08906,
				"output": .53436,
				"cacheRead": .01781
			},
			"doubao-seed-2-1-pro-260628": {
				"input": .8906,
				"output": 4.45301,
				"cacheRead": .17812
			},
			"doubao-seed-1-6-vision-250815": {
				"input": .11875,
				"output": 1.18747,
				"cacheRead": .02375
			},
			"doubao-seed-2-0-mini-260428": {
				"input": .02969,
				"output": .29687,
				"cacheRead": .00594
			},
			"doubao-seed-2-0-code-preview-260215": {
				"input": .47499,
				"output": 2.37494,
				"cacheRead": .095
			},
			"doubao-seed-2-1-turbo-260628": {
				"input": .4453,
				"output": 2.22651,
				"cacheRead": .08906
			},
			"glm-5-2-260617": {
				"input": 1.18747,
				"output": 4.15615,
				"cacheRead": .29687
			},
			"doubao-seed-1-8-251228": {
				"input": .11875,
				"output": 1.18747,
				"cacheRead": .02375
			},
			"doubao-seed-evolving": {
				"input": .8906,
				"output": 4.45301,
				"cacheRead": .17812
			},
			"doubao-seed-1-6-flash-250828": {
				"input": .02227,
				"output": .22265,
				"cacheRead": .00445
			},
			"doubao-seed-character-260628": {
				"input": .11875,
				"output": .29687,
				"cacheRead": .02375
			},
			"deepseek-v4-pro-ga-260813": {
				"input": 1.3359,
				"output": 4.00771,
				"cacheRead": .04453
			},
			"deepseek-v4-flash-ga-260731": {
				"input": .4453,
				"output": 1.3359,
				"cacheRead": .01484
			}
		},
		"impossibl": {
			"cerebras/gpt-oss-120b": {
				"input": .35,
				"output": .75
			},
			"groq/gpt-oss-20b": {
				"input": .075,
				"output": .3,
				"cacheRead": .0375
			},
			"groq/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"zai/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"zai/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"zai/glm-4.5-air": {
				"input": .2,
				"output": 1.1,
				"cacheRead": .03
			},
			"anthropic/claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .145
			},
			"deepseek/deepseek-v4-flash": {
				"input": .19,
				"output": .51,
				"cacheRead": .028
			},
			"thinkingmachines/inkling": {
				"input": 1.87,
				"output": 4.68,
				"cacheRead": .374
			},
			"google/gemini-3.6-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"xai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.20-0309-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"xai/grok-4.20-0309-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"fireworks/gpt-oss-20b": {
				"input": .07,
				"output": .3,
				"cacheRead": .035
			},
			"fireworks/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"fireworks/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"xiaomi/mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .003
			},
			"qwen/qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5
			},
			"qwen/qwen3.8-max-preview": {
				"input": 2.5,
				"output": 7.5
			},
			"qwen/qwen3.6-flash": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .05
			},
			"qwen/qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-pro": {
				"input": 30,
				"output": 180,
				"cacheRead": 3
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180,
				"cacheRead": 3
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-5-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"openai/gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 6.25
			}
		},
		"xpersona": {
			"gpt-5.4": {
				"input": .75,
				"output": 6,
				"reasoning": 6,
				"cacheRead": .075
			},
			"claude-haiku-4-5": {
				"input": .6,
				"output": 3.7,
				"reasoning": 3.7,
				"cacheRead": .06
			},
			"xpersona-frieren-coder": {
				"input": 1.5,
				"output": 6,
				"reasoning": 6,
				"cacheRead": .15
			},
			"gpt-5.6": {
				"input": 1.5,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .15
			},
			"xpersona-gpt-5.5": {
				"input": 3,
				"output": 18,
				"reasoning": 18,
				"cacheRead": .3
			},
			"gemini-3.5-flash": {
				"input": 1.55,
				"output": 12.2,
				"reasoning": 12.2,
				"cacheRead": .155
			},
			"claude-fable-5": {
				"input": 3,
				"output": 18.5,
				"reasoning": 18.5,
				"cacheRead": .3
			},
			"gpt-5.4-mini": {
				"input": .375,
				"output": 4,
				"reasoning": 4,
				"cacheRead": .0375
			},
			"claude-opus-4-8": {
				"input": 1.5,
				"output": 9.25,
				"reasoning": 9.25,
				"cacheRead": .15
			},
			"gpt-5.5": {
				"input": 1.5,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .15
			},
			"claude-sonnet-4-6": {
				"input": .9,
				"output": 5.55,
				"reasoning": 5.55,
				"cacheRead": .09
			},
			"gpt-5.6-terra": {
				"input": 1.5,
				"output": 2,
				"reasoning": 2,
				"cacheRead": .15
			},
			"gpt-5.6-sol": {
				"input": 1.5,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .15
			}
		},
		"qiniu-ai": {
			"mimo-v2-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .01
			},
			"xiaomi/mimo-v2-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .01
			}
		},
		"modelscope": {
			"ZhipuAI/GLM-4.6": {
				"input": 0,
				"output": 0
			},
			"ZhipuAI/GLM-4.5": {
				"input": 0,
				"output": 0
			},
			"Qwen/Qwen3-30B-A3B-Instruct-2507": {
				"input": 0,
				"output": 0
			},
			"Qwen/Qwen3-235B-A22B-Thinking-2507": {
				"input": 0,
				"output": 0
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": 0,
				"output": 0
			},
			"Qwen/Qwen3-30B-A3B-Thinking-2507": {
				"input": 0,
				"output": 0
			},
			"Qwen/Qwen3-Coder-30B-A3B-Instruct": {
				"input": 0,
				"output": 0
			}
		},
		"google": {
			"gemini-flash-latest": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gemini-omni-flash-preview": {
				"input": 1.5,
				"output": 17.5
			},
			"gemini-3.1-flash-image-preview": {
				"input": .5,
				"output": 60
			},
			"lyria-3-pro-preview": {
				"input": 0,
				"output": 0
			},
			"gemini-3.1-flash-tts-preview": {
				"input": 1,
				"output": 20
			},
			"gemini-2.5-flash-image": {
				"input": .3,
				"output": 30,
				"cacheRead": .075
			},
			"gemini-flash-lite-latest": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gemini-embedding-2": {
				"input": .2,
				"output": 0
			},
			"gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gemini-3-pro-image-preview": {
				"input": 2,
				"output": 120
			},
			"gemini-2.5-pro-preview-tts": {
				"input": 1,
				"output": 20
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gemini-3.1-flash-image": {
				"input": .5,
				"output": 60
			},
			"lyria-3-clip-preview": {
				"input": 0,
				"output": 0
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gemini-2.5-computer-use-preview-10-2025": {
				"input": 1.25,
				"output": 10
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gemini-3-pro-image": {
				"input": 2,
				"output": 120
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gemini-2.5-flash-preview-tts": {
				"input": .5,
				"output": 10
			},
			"gemini-3.1-flash-lite-image": {
				"input": .25,
				"output": 30
			},
			"deep-research-preview-04-2026": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"deep-research-max-preview-04-2026": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gemini-3.5-live-translate-preview": {
				"input": 3.5,
				"output": 21
			},
			"gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"gemini-embedding-001": {
				"input": .15,
				"output": 0
			},
			"gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"gemini-3.1-flash-live-preview": {
				"input": .75,
				"output": 4.5
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			}
		},
		"vancine": {
			"MiniMax-M3": {
				"input": .24,
				"output": .96,
				"cacheRead": .048
			},
			"glm-5.3-flash": {
				"input": .12,
				"output": .4,
				"cacheRead": .024
			},
			"qwen3.8-max": {
				"input": 1.6,
				"output": 4.8,
				"cacheRead": .2
			},
			"kimi-k3": {
				"input": 2.4,
				"output": 12,
				"cacheRead": .24
			},
			"deepseek-v4.1-flash": {
				"input": .24,
				"output": .96,
				"cacheRead": .0048
			},
			"qwen3.8-flash": {
				"input": .12,
				"output": .38,
				"cacheRead": .013
			},
			"hy4-preview": {
				"input": .67,
				"output": 2,
				"cacheRead": .034
			},
			"glm-5.3": {
				"input": 1.12,
				"output": 3.52,
				"cacheRead": .208
			}
		},
		"zhipuai-coding-plan": {
			"glm-5.3-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.3-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.6v": {
				"input": .3,
				"output": .9
			}
		},
		"lucidquery": {
			"lucidquery-agi-01-frontier": {
				"input": 4.5,
				"output": 22
			},
			"lucidquery-nexus-coder": {
				"input": 2,
				"output": 5
			},
			"lucidnova-rf1-100b": {
				"input": 2,
				"output": 5
			},
			"lucidquery-agi-01-swift": {
				"input": 2.5,
				"output": 15
			}
		},
		"gmicloud": {
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-opus-4.7": {
				"input": 4.5,
				"output": 22.5,
				"cacheRead": .45
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"Qwen/Qwen3.7-Max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"Qwen/Qwen3.8-Max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"Qwen/Qwen3.8-Flash": {
				"input": .16,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"deepseek-ai/DeepSeek-V4-Flash": {
				"input": .112,
				"output": .224,
				"cacheRead": .022
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": 1.392,
				"output": 2.784,
				"cacheRead": .116
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"MiniMaxAI/MiniMax-M2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"moonshotai/Kimi-K2.6": {
				"input": .855,
				"output": 3.6,
				"cacheRead": .144
			},
			"moonshotai/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"zai-org/GLM-5.2-FP8": {
				"input": .979,
				"output": 3.08,
				"cacheRead": .182
			},
			"zai-org/GLM-5-FP8": {
				"input": .6,
				"output": 1.92,
				"cacheRead": .12
			},
			"zai-org/GLM-5.1-FP8": {
				"input": .98,
				"output": 3.08,
				"cacheRead": .182
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			}
		},
		"oci": {
			"xai.grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai.grok-4.20-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"meta.llama-3.3-70b-instruct": {
				"input": .72,
				"output": .72
			},
			"meta.llama-4-scout-17b-16e-instruct": {
				"input": .72,
				"output": .72
			},
			"xai.grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"meta.llama-4-maverick-17b-128e-instruct-fp8": {
				"input": .72,
				"output": .72
			},
			"openai.gpt-oss-120b": {
				"input": .15,
				"output": .6
			},
			"openai.gpt-oss-20b": {
				"input": .07,
				"output": .3
			},
			"xai.grok-4.20-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			}
		},
		"cloudflare-ai-gateway": {
			"anthropic/claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .145
			},
			"unbiased/pareto": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .25
			},
			"alibaba/qwen3.7-max": {
				"input": 1.25,
				"output": 3.75,
				"cacheRead": .25
			},
			"alibaba/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"alibaba/qwen3-max": {
				"input": 1.2,
				"output": 6
			},
			"alibaba/qwen3.5-397b-a17b": {
				"input": .6,
				"output": 3.6
			},
			"alibaba/qwen3.7-plus": {
				"input": .32,
				"output": 1.28,
				"cacheRead": .064
			},
			"xai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"xai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.20-0309-reasoning": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"xai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"xai/grok-4.20-0309-non-reasoning": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"xai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-4o": {
				"input": 1.25,
				"output": 5,
				"cacheRead": .625
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-mini": {
				"input": .075,
				"output": .3,
				"cacheRead": .0375
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			}
		},
		"clarifai": {
			"minimaxai/chat-completion/models/MiniMax-M2_5-high-throughput": {
				"input": .3,
				"output": 1.2
			},
			"clarifai/main/models/mm-poly-8b": {
				"input": .658,
				"output": 1.11
			},
			"deepseek-ai/deepseek-ocr/models/DeepSeek-OCR": {
				"input": .2,
				"output": .7
			},
			"mistralai/completion/models/Ministral-3-3B-Reasoning-2512": {
				"input": 1.039,
				"output": .54825
			},
			"mistralai/completion/models/Ministral-3-14B-Reasoning-2512": {
				"input": 2.5,
				"output": 1.7
			},
			"moonshotai/chat-completion/models/Kimi-K2_6": {
				"input": .95,
				"output": 4
			},
			"arcee_ai/AFM/models/trinity-mini": {
				"input": .045,
				"output": .15
			},
			"qwen/qwenCoder/models/Qwen3-Coder-30B-A3B-Instruct": {
				"input": .11458,
				"output": .74812
			},
			"qwen/qwenLM/models/Qwen3-30B-A3B-Instruct-2507": {
				"input": .3,
				"output": .5
			},
			"qwen/qwenLM/models/Qwen3-30B-A3B-Thinking-2507": {
				"input": .36,
				"output": 1.3
			},
			"openai/chat-completion/models/gpt-oss-120b-high-throughput": {
				"input": .09,
				"output": .36
			},
			"openai/chat-completion/models/gpt-oss-20b": {
				"input": .045,
				"output": .18
			}
		},
		"aiand": {
			"motif-technologies/motif-3": {
				"input": .5,
				"output": 2,
				"cacheRead": .2
			},
			"google/gemma-4-31b-it": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"deepseek-ai/deepseek-v4.1-flash": {
				"input": .3,
				"output": .6,
				"cacheRead": .02
			},
			"deepseek-ai/deepseek-v4-pro": {
				"input": 1,
				"output": 2.5,
				"cacheRead": .25
			},
			"deepseek-ai/deepseek-v4-flash": {
				"input": .15,
				"output": .25,
				"cacheRead": .08
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 12.5,
				"cacheRead": .5
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .75,
				"output": 3.5,
				"cacheRead": .2
			},
			"zai-org/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"zai-org/glm-5.2": {
				"input": 1,
				"output": 4,
				"cacheRead": .3
			},
			"zai-org/glm-5.3": {
				"input": 1,
				"output": 4,
				"cacheRead": .3
			},
			"qwen/qwen3.8-27b": {
				"input": .4,
				"output": 3,
				"cacheRead": .2
			},
			"qwen/qwen3.6-27b": {
				"input": .32,
				"output": 3.2,
				"cacheRead": .2
			},
			"openai/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .08
			}
		},
		"frogbot": {
			"grok-4-1-fast-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"gpt-5-4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"grok-4-1-fast-non-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"minimax-m2-5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"gpt-5-4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"gpt-oss-20b": {
				"input": .07,
				"output": .2
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .31
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .075
			},
			"minimax-m2-7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"kimi-k2-6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"grok-code-fast-1": {
				"input": .2,
				"output": 1.5,
				"cacheRead": .02
			},
			"qwen-3-6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"grok-4-3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"gpt-5-5": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"gemini-3-1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .14
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gpt-5-3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-oss-120b": {
				"input": .15,
				"output": .6
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"zai-glm-5-1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			}
		},
		"stackit": {
			"google/gemma-3-27b-it": {
				"input": .53,
				"output": .76
			},
			"intfloat/e5-mistral-7b-instruct": {
				"input": .02,
				"output": .02
			},
			"Qwen/Qwen3-VL-235B-A22B-Instruct-FP8": {
				"input": 1.76,
				"output": 2.05
			},
			"Qwen/Qwen3-VL-Embedding-8B": {
				"input": .09,
				"output": .09
			},
			"Qwen/Qwen3.6-27B": {
				"input": .53,
				"output": .76
			},
			"cortecs/Llama-3.3-70B-Instruct-FP8-Dynamic": {
				"input": .53,
				"output": .76
			},
			"openai/gpt-oss-20b": {
				"input": .18,
				"output": .29
			},
			"openai/gpt-oss-120b": {
				"input": .53,
				"output": .76
			}
		},
		"crusoe": {
			"zai/GLM-5.1": {
				"input": 1.2,
				"output": 4.4,
				"cacheRead": .25
			},
			"zai/GLM-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"meta-llama/Llama-3.3-70B-Instruct": {
				"input": .25,
				"output": .75,
				"cacheRead": .13
			},
			"google/gemma-4-31b-it": {
				"input": .14,
				"output": .4,
				"cacheRead": .14
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": .22,
				"output": .8,
				"cacheRead": .11
			},
			"deepseek-ai/DeepSeek-V3-0324": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .25
			},
			"moonshotai/Kimi-K2.6": {
				"input": .7,
				"output": 3.5,
				"cacheRead": .35
			},
			"nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B": {
				"input": .05,
				"output": .2,
				"cacheRead": .03
			},
			"nvidia/Nemotron-3-Nano-Omni-Reasoning-30B-A3B": {
				"input": .3,
				"output": 1.83,
				"cacheRead": .3
			},
			"nvidia/NVIDIA-Nemotron-3-Super-120B-A12B": {
				"input": .3,
				"output": 2.4,
				"cacheRead": .15
			},
			"openai/gpt-oss-120b": {
				"input": .05,
				"output": .2,
				"cacheRead": .05
			}
		},
		"volcengine-coding-plan": {
			"doubao-seed-2.0-lite": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"glm-5.3-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"kimi-k3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"doubao-seed-2.1-turbo": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"minimax-m3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"doubao-seed-evolving": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"deepseek-v4-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"glm-5.3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"kimi-k2.7-code": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"deepseek-v4-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			}
		},
		"jiekou": {
			"grok-4-1-fast-reasoning": {
				"input": .18,
				"output": .45
			},
			"grok-4-1-fast-non-reasoning": {
				"input": .18,
				"output": .45
			},
			"gpt-5.2-codex": {
				"input": 1.75,
				"output": 14
			},
			"gpt-5.1-codex": {
				"input": 1.125,
				"output": 9
			},
			"gemini-3-pro-preview": {
				"input": 1.8,
				"output": 10.8
			},
			"gpt-5-codex": {
				"input": 1.125,
				"output": 9
			},
			"gpt-5-mini": {
				"input": .225,
				"output": 1.8
			},
			"gpt-5.2-pro": {
				"input": 18.9,
				"output": 151.2
			},
			"o4-mini": {
				"input": 1.1,
				"output": 4.4
			},
			"o3-mini": {
				"input": 1.1,
				"output": 4.4
			},
			"grok-4-fast-reasoning": {
				"input": .18,
				"output": .45
			},
			"gpt-5-nano": {
				"input": .045,
				"output": .36
			},
			"gemini-2.5-flash-lite-preview-06-17": {
				"input": .09,
				"output": .36
			},
			"claude-opus-4-20250514": {
				"input": 13.5,
				"output": 67.5
			},
			"grok-4-fast-non-reasoning": {
				"input": .18,
				"output": .45
			},
			"claude-opus-4-1-20250805": {
				"input": 13.5,
				"output": 67.5
			},
			"gpt-5-pro": {
				"input": 13.5,
				"output": 108
			},
			"gpt-5-chat-latest": {
				"input": 1.125,
				"output": 9
			},
			"claude-opus-4-5-20251101": {
				"input": 4.5,
				"output": 22.5
			},
			"gpt-5.1": {
				"input": 1.125,
				"output": 9
			},
			"gemini-2.5-pro": {
				"input": 1.125,
				"output": 9
			},
			"gemini-2.5-flash": {
				"input": .27,
				"output": 2.25
			},
			"gemini-2.5-flash-preview-05-20": {
				"input": .135,
				"output": 3.15
			},
			"gpt-5.1-codex-max": {
				"input": 1.125,
				"output": 9
			},
			"gpt-5.2": {
				"input": 1.575,
				"output": 12.6
			},
			"grok-code-fast-1": {
				"input": .18,
				"output": 1.35
			},
			"claude-sonnet-4-5-20250929": {
				"input": 2.7,
				"output": 13.5
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3
			},
			"claude-haiku-4-5-20251001": {
				"input": .9,
				"output": 4.5
			},
			"gemini-2.5-flash-lite-preview-09-2025": {
				"input": .09,
				"output": .36
			},
			"gemini-2.5-pro-preview-06-05": {
				"input": 1.125,
				"output": 9
			},
			"gemini-2.5-flash-lite": {
				"input": .09,
				"output": .36
			},
			"claude-sonnet-4-20250514": {
				"input": 2.7,
				"output": 13.5
			},
			"gpt-5.1-codex-mini": {
				"input": .225,
				"output": 1.8
			},
			"o3": {
				"input": 10,
				"output": 40
			},
			"grok-4-0709": {
				"input": 2.7,
				"output": 13.5
			},
			"deepseek/deepseek-v3-0324": {
				"input": .28,
				"output": 1.14
			},
			"deepseek/deepseek-v3.1": {
				"input": .27,
				"output": 1
			},
			"deepseek/deepseek-r1-0528": {
				"input": .7,
				"output": 2.5
			},
			"xiaomimimo/mimo-v2-flash": {
				"input": 0,
				"output": 0
			},
			"baidu/ernie-4.5-vl-424b-a47b": {
				"input": .42,
				"output": 1.25
			},
			"baidu/ernie-4.5-300b-a47b-paddle": {
				"input": .28,
				"output": 1.1
			},
			"minimaxai/minimax-m1-80k": {
				"input": .55,
				"output": 2.2
			},
			"moonshotai/kimi-k2.5": {
				"input": .6,
				"output": 3
			},
			"moonshotai/kimi-k2-instruct": {
				"input": .57,
				"output": 2.3
			},
			"moonshotai/kimi-k2-0905": {
				"input": .6,
				"output": 2.5
			},
			"zai-org/glm-4.5": {
				"input": .6,
				"output": 2.2
			},
			"zai-org/glm-4.5v": {
				"input": .6,
				"output": 1.8
			},
			"zai-org/glm-4.7-flash": {
				"input": .07,
				"output": .4
			},
			"zai-org/glm-4.7": {
				"input": .6,
				"output": 2.2
			},
			"minimax/minimax-m2.1": {
				"input": .3,
				"output": 1.2
			},
			"qwen/qwen3-235b-a22b-instruct-2507": {
				"input": .15,
				"output": .8
			},
			"qwen/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.5
			},
			"qwen/qwen3-coder-next": {
				"input": .2,
				"output": 1.5
			},
			"qwen/qwen3-235b-a22b-fp8": {
				"input": .2,
				"output": .8
			},
			"qwen/qwen3-coder-480b-a35b-instruct": {
				"input": .29,
				"output": 1.2
			},
			"qwen/qwen3-235b-a22b-thinking-2507": {
				"input": .3,
				"output": 3
			},
			"qwen/qwen3-30b-a3b-fp8": {
				"input": .09,
				"output": .45
			},
			"qwen/qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": 1.5
			},
			"qwen/qwen3-32b-fp8": {
				"input": .1,
				"output": .45
			}
		},
		"ollama-cloud": {
			"glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"nemotron-3-ultra": {
				"input": .1,
				"output": 3,
				"cacheRead": .1
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"qwen3.5:397b": {
				"input": .6,
				"output": 3.6
			},
			"gpt-oss:20b": {
				"input": .07,
				"output": .3,
				"cacheRead": .035
			},
			"gpt-oss:120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .014
			},
			"nemotron-3-nano:30b": {
				"input": .06,
				"output": .24
			},
			"mistral-large-3:675b": {
				"input": .5,
				"output": 1.5
			},
			"minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"deepseek-v4-pro:0813": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .022
			},
			"minimax-m3": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"deepseek-v4-flash:0731": {
				"input": .22,
				"output": .66,
				"cacheRead": .007
			},
			"gemma4:31b": {
				"input": .14,
				"output": .4,
				"cacheRead": .05
			},
			"glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"glm-5.1": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"deepseek-v4-pro": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .022
			},
			"glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"nemotron-3-super": {
				"input": .015,
				"output": .6,
				"cacheRead": .015
			},
			"deepseek-v4-flash": {
				"input": .22,
				"output": .66,
				"cacheRead": .007
			}
		},
		"tencent-tokenhub": {
			"hy3-preview": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"hy3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			}
		},
		"watsonx": {
			"meta-llama/llama-4-maverick-17b-128e-instruct-fp8": {
				"input": .371,
				"output": 1.484
			},
			"meta-llama/llama-3-3-70b-instruct": {
				"input": .7526,
				"output": .7526
			},
			"ibm/granite-4-h-small": {
				"input": .0636,
				"output": .265
			},
			"mistralai/mistral-small-3-1-24b-instruct-2503": {
				"input": .106,
				"output": .318
			},
			"openai/gpt-oss-120b": {
				"input": .159,
				"output": .636
			}
		},
		"ambient": {
			"deepseek/deepseek-v4-flash-0731": {
				"input": .08,
				"output": .18,
				"cacheRead": .016,
				"cacheWrite": 0
			},
			"deepseek/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028,
				"cacheWrite": 0
			},
			"z-ai/glm-5.2": {
				"input": .6,
				"output": 2,
				"cacheRead": .15,
				"cacheWrite": 0
			},
			"ambient/large": {
				"input": .6,
				"output": 2,
				"cacheRead": .15,
				"cacheWrite": 0
			},
			"moonshotai/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .2,
				"cacheWrite": 0
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .69,
				"output": 3.49,
				"cacheRead": .14,
				"cacheWrite": 0
			},
			"zai-org/GLM-5.2-FP8": {
				"input": 1.2,
				"output": 4.2,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"zai-org/GLM-5.1-FP8": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"xiaomi/mimo-v2.5": {
				"input": .4,
				"output": 2,
				"cacheRead": .08,
				"cacheWrite": 0
			},
			"stepfun/step-3.7-flash": {
				"input": .19,
				"output": 1.14,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"qwen/qwen3.8-27b": {
				"input": .32,
				"output": 3.2,
				"cacheRead": .16,
				"cacheWrite": 0
			},
			"qwen/qwen3.6-27b": {
				"input": .32,
				"output": 3.2,
				"cacheRead": .16,
				"cacheWrite": 0
			}
		},
		"xai": {
			"grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"grok-4.20-0309-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"grok-4.20-0309-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"grok-4.20-multi-agent-0309": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			}
		},
		"nebius": {
			"google/gemma-3-27b-it": {
				"input": .1,
				"output": .3,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"Qwen/Qwen3.8-27B": {
				"input": .45,
				"output": 3,
				"cacheRead": .45
			},
			"Qwen/Qwen3-30B-A3B-Instruct-2507": {
				"input": .1,
				"output": .3,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": .2,
				"output": .6
			},
			"Qwen/Qwen3-Embedding-8B": {
				"input": .01,
				"output": 0
			},
			"Qwen/Qwen3.5-397B-A17B": {
				"input": .6,
				"output": 3.6,
				"cacheRead": .06,
				"cacheWrite": .75
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .14,
				"output": .28,
				"cacheRead": .14
			},
			"deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": 1.32
			},
			"deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .3
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": 1.75,
				"output": 3.5,
				"cacheRead": .15
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .3,
				"output": 1.2
			},
			"moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15,
				"cacheRead": 3
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .95,
				"output": 4
			},
			"zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .15
			},
			"zai-org/GLM-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": 1.4
			},
			"nvidia/nemotron-3-super-120b-a12b": {
				"input": .3,
				"output": .9
			},
			"nvidia/Nemotron-3_5-Lightning": {
				"input": .06,
				"output": .24,
				"cacheRead": .06
			},
			"nvidia/Nemotron-3-Ultra-550b-a55b": {
				"input": 1,
				"output": 3,
				"cacheRead": 1
			},
			"openai/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"reasoning": .6,
				"cacheRead": .015,
				"cacheWrite": .18
			},
			"NousResearch/Hermes-4-405B": {
				"input": 1,
				"output": 3,
				"reasoning": 3,
				"cacheRead": .1,
				"cacheWrite": 1.25
			}
		},
		"minimax-cn": {
			"MiniMax-M3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"MiniMax-M2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"MiniMax-M2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"MiniMax-M2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"MiniMax-M2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"MiniMax-M2": {
				"input": .3,
				"output": 1.2
			},
			"MiniMax-M2.5-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			}
		},
		"scaleway": {
			"qwen3.8-27b": {
				"input": .684,
				"output": 3.762,
				"reasoning": 3.762,
				"cacheRead": .137
			},
			"deepseek-v4-flash-0731": {
				"input": .468,
				"output": .936,
				"reasoning": .936,
				"cacheRead": .0936
			},
			"qwen3-235b-a22b-instruct-2507": {
				"input": .75,
				"output": 2.25,
				"reasoning": 8.4
			},
			"whisper-large-v3": {
				"input": .003,
				"output": 0
			},
			"bge-multilingual-gemma2": {
				"input": .1,
				"output": 0
			},
			"qwen3-coder-30b-a3b-instruct": {
				"input": .2,
				"output": .8
			},
			"gemma-4-26b-a4b-it": {
				"input": .25,
				"output": .5
			},
			"llama-3.3-70b-instruct": {
				"input": .9,
				"output": .9
			},
			"qwen3.6-35b-a3b": {
				"input": .25,
				"output": 1.5
			},
			"pixtral-12b-2409": {
				"input": .2,
				"output": .2
			},
			"qwen3-embedding-8b": {
				"input": .1,
				"output": 0
			},
			"mistral-medium-3.5-128b": {
				"input": 1.5,
				"output": 7.5
			},
			"qwen3.5-397b-a17b": {
				"input": .6,
				"output": 3.6
			},
			"glm-5.2": {
				"input": 1.8,
				"output": 5.5
			},
			"mistral-small-3.2-24b-instruct-2506": {
				"input": .15,
				"output": .35
			},
			"gpt-oss-120b": {
				"input": .15,
				"output": .6
			}
		},
		"vercel": {
			"interfaze/interfaze-beta": {
				"input": 1.5,
				"output": 3.5
			},
			"zai/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"zai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"zai/glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-5.2-fast": {
				"input": 2.8,
				"output": 8.8,
				"cacheRead": .56
			},
			"zai/glm-5": {
				"input": 1,
				"output": 3.2
			},
			"zai/glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .11
			},
			"zai/glm-5.3-flashx": {
				"input": .37,
				"output": 1.25,
				"cacheRead": .075
			},
			"zai/glm-4.7-flash": {
				"input": .07,
				"output": .4
			},
			"zai/glm-4.7": {
				"input": .6,
				"output": 2.2
			},
			"zai/glm-5.2": {
				"input": .8,
				"output": 2.55,
				"cacheRead": .16
			},
			"zai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai/glm-4.7-flashx": {
				"input": .06,
				"output": .4,
				"cacheRead": .01
			},
			"zai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"zai/glm-4.5-air": {
				"input": .2,
				"output": 1.1,
				"cacheRead": .03
			},
			"zai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"zai/glm-5.3-fast": {
				"input": 2.1,
				"output": 6.6,
				"cacheRead": .21
			},
			"spacexai/grok-4.20-multi-agent": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"spacexai/grok-4.20-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"spacexai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"spacexai/grok-4.20-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"spacexai/grok-4.1-fast-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"spacexai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"spacexai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"spacexai/grok-4.20-multi-agent-beta": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"spacexai/grok-4.20-non-reasoning-beta": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .4
			},
			"spacexai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"spacexai/grok-4.1-fast-non-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"spacexai/grok-4.20-reasoning-beta": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"spacexai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"poolside/laguna-s-2.1-free": {
				"input": 0,
				"output": 0
			},
			"poolside/laguna-s-2.1": {
				"input": .1,
				"output": .2,
				"cacheRead": .01
			},
			"anthropic/claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-3-haiku": {
				"input": .25,
				"output": 1.25,
				"cacheRead": .03,
				"cacheWrite": .3
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-5.5-fast": {
				"input": 8,
				"output": 40,
				"cacheRead": .4,
				"cacheWrite": 10
			},
			"anthropic/claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-5.5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4.8-fast": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-opus-5-fast": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"cohere/command-a": {
				"input": 2.5,
				"output": 10
			},
			"deepseek/deepseek-v4-flash-0731": {
				"input": .076,
				"output": .153,
				"cacheRead": .014
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .007
			},
			"deepseek/deepseek-v4-flash-vision-exp": {
				"input": .2156,
				"output": .6468,
				"cacheRead": .0068
			},
			"deepseek/deepseek-v3.1-terminus": {
				"input": .27,
				"output": 1,
				"cacheRead": .135
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .066
			},
			"deepseek/deepseek-v3.2-thinking": {
				"input": .62,
				"output": 1.85
			},
			"deepseek/deepseek-v3.1": {
				"input": .25,
				"output": .95,
				"cacheRead": .13
			},
			"deepseek/deepseek-v4-pro": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .022
			},
			"deepseek/deepseek-v3.2": {
				"input": .62,
				"output": 1.85
			},
			"deepseek/deepseek-v4-flash": {
				"input": .13,
				"output": .26,
				"cacheRead": .028
			},
			"deepseek/deepseek-r1": {
				"input": 1.35,
				"output": 5.4
			},
			"quiverai/arrow-2": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"quiverai/arrow-2-telos": {
				"input": 6,
				"output": 30,
				"cacheRead": .6,
				"cacheWrite": 7.5
			},
			"tencent/hy-mt2-lite": {
				"input": .044,
				"output": .177
			},
			"tencent/hy3": {
				"input": .14,
				"output": .58,
				"cacheRead": .035
			},
			"tencent/hy-mt2-plus": {
				"input": .074,
				"output": .295
			},
			"tencent/hy-mt2-pro": {
				"input": .074,
				"output": .295
			},
			"tencent/hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"inference-net/schematron-v2-small": {
				"input": .05,
				"output": .23,
				"cacheRead": .05
			},
			"inference-net/schematron-v2-turbo": {
				"input": .03,
				"output": .15,
				"cacheRead": .03
			},
			"thinkingmachines/inkling-small": {
				"input": .45,
				"output": 1.2,
				"cacheRead": .1
			},
			"thinkingmachines/inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"meituan/longcat-2.5-preview": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"perplexity/sonar": {
				"input": .25,
				"output": 2.5,
				"cacheWrite": .0625
			},
			"meta/muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-glimmer-30b": {
				"input": .35,
				"output": 1.5,
				"cacheRead": .04
			},
			"meta/muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/llama-3.1-8b": {
				"input": .22,
				"output": .22
			},
			"meta/llama-3.1-70b": {
				"input": .72,
				"output": .72
			},
			"meta/muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"meta/muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"meta/llama-3.3-70b": {
				"input": 0,
				"output": 0
			},
			"meta/llama-4-maverick": {
				"input": 0,
				"output": 0
			},
			"meta/llama-4-scout": {
				"input": 0,
				"output": 0
			},
			"arcee-ai/trinity-large-thinking": {
				"input": .25,
				"output": .9
			},
			"alibaba/qwen3.5-flash": {
				"input": .1,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"alibaba/qwen-3-32b": {
				"input": .16,
				"output": .64
			},
			"alibaba/qwen3-vl-235b-a22b-instruct": {
				"input": .4,
				"output": 1.6
			},
			"alibaba/qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"alibaba/qwen3.8-27b": {
				"input": .5,
				"output": 3,
				"cacheRead": .1,
				"cacheWrite": .625
			},
			"alibaba/qwen3-vl-thinking": {
				"input": .4,
				"output": 4
			},
			"alibaba/qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"alibaba/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.2
			},
			"alibaba/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"alibaba/qwen3-coder-next": {
				"input": .5,
				"output": 1.2
			},
			"alibaba/qwen3-vl-instruct": {
				"input": .4,
				"output": 1.6
			},
			"alibaba/qwen3-coder": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .3
			},
			"alibaba/qwen3.5-plus": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .04,
				"cacheWrite": .5
			},
			"alibaba/qwen-3.6-max-preview": {
				"input": 1.3,
				"output": 7.8,
				"cacheRead": .13,
				"cacheWrite": 1.625
			},
			"alibaba/qwen-3-14b": {
				"input": .12,
				"output": .24
			},
			"alibaba/qwen3.7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .006,
				"cacheWrite": .038
			},
			"alibaba/qwen3-max": {
				"input": 1.2,
				"output": 6,
				"cacheRead": .24
			},
			"alibaba/qwen-3-30b": {
				"input": .12,
				"output": .5
			},
			"alibaba/qwen3.8-omni-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"alibaba/qwen3-coder-30b-a3b": {
				"input": .15,
				"output": .6
			},
			"alibaba/qwen3-max-preview": {
				"input": 1.2,
				"output": 6,
				"cacheRead": .24
			},
			"alibaba/qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": 1.2
			},
			"alibaba/qwen3-max-thinking": {
				"input": 1.2,
				"output": 6,
				"cacheRead": .24
			},
			"alibaba/qwen3-coder-plus": {
				"input": 1,
				"output": 5,
				"cacheRead": .2
			},
			"alibaba/qwen3.8-max-prime": {
				"input": 4,
				"output": 12,
				"cacheRead": .5,
				"cacheWrite": 5
			},
			"alibaba/qwen3-235b-a22b-thinking": {
				"input": .4,
				"output": 4
			},
			"alibaba/qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"alibaba/qwen3.6-27b": {
				"input": .6,
				"output": 3.6
			},
			"alibaba/qwen-3-235b": {
				"input": .22,
				"output": .88
			},
			"alibaba/qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"alibaba/qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"alibaba/qwen3.8-max-0902": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"mixedbread/toast-1": {
				"input": .3,
				"output": .72,
				"cacheRead": .036
			},
			"bytedance/seed-1.8": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"bytedance/seed-2.1-turbo": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .1
			},
			"bytedance/seed-1.6": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"google/gemma-4-31b-it": {
				"input": .14,
				"output": .4
			},
			"google/gemini-omni-flash-preview": {
				"input": 1.5,
				"output": 9
			},
			"google/gemini-3.1-flash-image-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google/gemini-2.5-flash-image": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3.8-flash-lite-tts": {
				"input": .5,
				"output": 6
			},
			"google/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemma-4-26b-a4b-it": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3.1-flash-image": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3-flash": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"google/gemini-3-pro-image": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3.8-live": {
				"input": .75,
				"output": 4.5
			},
			"google/gemini-3.1-flash-lite-image": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .03
			},
			"google/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemini-3.5-transcribe": {
				"input": 2,
				"output": 12
			},
			"google/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"google/gemini-3.8-flash-tts": {
				"input": .5,
				"output": 9
			},
			"google/gemini-3.8-live-extended-thinking": {
				"input": .75,
				"output": 4.5
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .03
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"fireworks/ember-1": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"sakana/fugu-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"sakana/fugu-ultra-v2": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana/namazu": {
				"input": .95,
				"output": 4,
				"cacheRead": .15
			},
			"sakana/fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"inclusionai/ling-3.1-flash-free": {
				"input": 0,
				"output": 0
			},
			"inclusionai/ling-3.0-flash": {
				"input": .021,
				"output": .063,
				"cacheRead": .0042
			},
			"inclusionai/ling-3.1-flash": {
				"input": 0,
				"output": 0
			},
			"inclusionai/ling-3.0-flash-sante": {
				"input": 0,
				"output": 0
			},
			"inclusionai/ling-3.0-flash-vl": {
				"input": .075,
				"output": .22,
				"cacheRead": .015
			},
			"inclusionai/ling-3.0-flash-fin": {
				"input": .075,
				"output": .22,
				"cacheRead": .015
			},
			"inclusionai/ling-3.0-flash-sante-free": {
				"input": 0,
				"output": 0
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshotai/kimi-k3-fast": {
				"input": 4.5,
				"output": 22.5,
				"cacheRead": .45
			},
			"moonshotai/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"moonshotai/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshotai/kimi-k2-thinking": {
				"input": .47,
				"output": 2,
				"cacheRead": .141
			},
			"moonshotai/kimi-k2.5": {
				"input": .6,
				"output": 3
			},
			"moonshotai/kimi-k2": {
				"input": .57,
				"output": 2.3
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"nvidia/nemotron-3-nano-30b-a3b": {
				"input": .05,
				"output": .2,
				"cacheRead": .025
			},
			"nvidia/nemotron-3.5-lightning": {
				"input": .05,
				"output": .2,
				"cacheRead": .01
			},
			"nvidia/nemotron-nano-9b-v2": {
				"input": .06,
				"output": .23
			},
			"nvidia/nemotron-3-super-120b-a12b": {
				"input": .15,
				"output": .65
			},
			"nvidia/nemotron-3-ultra-550b-a55b": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"nvidia/nemotron-nano-12b-v2-vl": {
				"input": .2,
				"output": .6
			},
			"xiaomi/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"xiaomi/mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"xiaomi/mimo-v2.6-pro-ultraspeed": {
				"input": 4.35,
				"output": 8.7,
				"cacheRead": .036
			},
			"xiaomi/mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"xiaomi/mimo-v2.6-flash": {
				"input": .04,
				"output": 1.28,
				"cacheRead": .04
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.1-lightning": {
				"input": .3,
				"output": 2.4,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.5-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"stepfun/step-5-preview": {
				"input": 1,
				"output": 2.7,
				"cacheRead": .05
			},
			"stepfun/step-3.5-flash": {
				"input": .09,
				"output": .3,
				"cacheRead": .02
			},
			"stepfun/step-3.7-flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"inception/mercury-coder-small": {
				"input": .25,
				"output": 1
			},
			"inception/mercury-2.5": {
				"input": .04,
				"output": .15,
				"cacheRead": .004
			},
			"inception/mercury-2": {
				"input": .25,
				"output": .75,
				"cacheRead": .024999999999999998
			},
			"amazon/nova-2-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .075
			},
			"amazon/nova-lite": {
				"input": .06,
				"output": .24,
				"cacheRead": .015,
				"cacheWrite": .06
			},
			"amazon/nova-pro": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": .8
			},
			"amazon/nova-micro": {
				"input": .035,
				"output": .14,
				"cacheRead": .00875,
				"cacheWrite": .035
			},
			"mistral/mistral-nemo": {
				"input": .04,
				"output": .17
			},
			"mistral/mistral-medium-3.5": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"mistral/mistral-small": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"mistral/mistral-large-3": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"mistral/ministral-14b": {
				"input": .2,
				"output": .2,
				"cacheRead": .02
			},
			"mistral/codestral": {
				"input": .3,
				"output": .9,
				"cacheRead": .03
			},
			"mistral/ministral-8b": {
				"input": .1,
				"output": .1
			},
			"mistral/ministral-3b": {
				"input": .04,
				"output": .04
			},
			"morph/morph-v3-fast": {
				"input": .8,
				"output": 1.2
			},
			"morph/morph-v3-large": {
				"input": .9,
				"output": 1.9
			},
			"openai/gpt-4.1-mini-fast": {
				"input": .7,
				"output": 2.8,
				"cacheRead": .175
			},
			"openai/o3-fast": {
				"input": 3.5,
				"output": 14,
				"cacheRead": .875
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-oss-safeguard-120b": {
				"input": .15,
				"output": .6
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5
			},
			"openai/gpt-5.2-fast": {
				"input": 3.5,
				"output": 28,
				"cacheRead": .35
			},
			"openai/gpt-4o-transcribe": {
				"input": 2.5,
				"output": 10
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-realtime-2.1": {
				"input": 4,
				"output": 24,
				"cacheRead": .4
			},
			"openai/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-4o-fast": {
				"input": 4.25,
				"output": 17,
				"cacheRead": 2.125
			},
			"openai/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"openai/gpt-6.1-sol-fast": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"openai/gpt-realtime-1.5": {
				"input": 4,
				"output": 16,
				"cacheRead": .4
			},
			"openai/gpt-4.1-nano-fast": {
				"input": .2,
				"output": .8,
				"cacheRead": .05
			},
			"openai/gpt-5-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"openai/gpt-image-2": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"openai/gpt-5.6-luna-fast": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .04,
				"cacheWrite": .5
			},
			"openai/gpt-6-astra-fast": {
				"input": 20,
				"output": 100,
				"cacheRead": 2,
				"cacheWrite": 25
			},
			"openai/gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"openai/gpt-5.1-thinking-fast": {
				"input": 2.5,
				"output": 20,
				"cacheRead": .25
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.3-codex-fast": {
				"input": 3.5,
				"output": 28,
				"cacheRead": .35
			},
			"openai/gpt-5.5-fast": {
				"input": 12.5,
				"output": 75,
				"cacheRead": 1.25
			},
			"openai/gpt-image-2.5-flare": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"openai/gpt-5.4-fast": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-5.6-sol-fast": {
				"input": 8,
				"output": 40,
				"cacheRead": .8,
				"cacheWrite": 10
			},
			"openai/o4-mini-fast": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-5.1-thinking": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.4-mini-fast": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"openai/gpt-realtime-mini": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06
			},
			"openai/gpt-5-mini-fast": {
				"input": .45,
				"output": 3.6,
				"cacheRead": .045
			},
			"openai/o3-pro": {
				"input": 20,
				"output": 80
			},
			"openai/gpt-oss-20b": {
				"input": .03,
				"output": .14
			},
			"openai/gpt-oss-safeguard-20b": {
				"input": .07,
				"output": .2
			},
			"openai/gpt-image-2.5-sunburst": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"openai/gpt-5.6-terra-fast": {
				"input": 4,
				"output": 24,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-image-1": {
				"input": 5,
				"output": 40,
				"cacheRead": 1.25
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-6-sol-fast": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-6-luna-fast": {
				"input": .2,
				"output": 1,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5-fast": {
				"input": 2.5,
				"output": 20,
				"cacheRead": .25
			},
			"openai/gpt-realtime-2": {
				"input": 4,
				"output": 24,
				"cacheRead": .4
			},
			"openai/gpt-4.1-fast": {
				"input": 3.5,
				"output": 14,
				"cacheRead": .875
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-image-1-mini": {
				"input": 2,
				"output": 8,
				"cacheRead": .2
			},
			"openai/gpt-4o-mini-transcribe": {
				"input": 1.25,
				"output": 5
			},
			"openai/gpt-image-1.5": {
				"input": 5,
				"output": 32,
				"cacheRead": 1.25
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-oss-120b": {
				"input": .1,
				"output": .5,
				"cacheRead": .1
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .03
			},
			"openai/gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-4o-mini-fast": {
				"input": .25,
				"output": 1,
				"cacheRead": .125
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			}
		},
		"zai-coding-plan": {
			"glm-5.3-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.3-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.2-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.7": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.2": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5-turbo": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5.3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"ebcloud": {
			"Kimi-K2.6": {
				"input": .9286,
				"output": 3.8571
			},
			"GLM-5.1": {
				"input": .8571,
				"output": 3.4286
			},
			"DeepSeek-V4-Flash": {
				"input": .143,
				"output": .2857
			},
			"DeepSeek-V4-Pro": {
				"input": .4286,
				"output": .8571
			}
		},
		"greenpt": {
			"glm-5.2-honey-ultra": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"glm-5.2-ponytail-lite": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"gemma-3-27b-it": {
				"input": .342,
				"output": .684
			},
			"glm-5.3-flash": {
				"input": .127754,
				"output": .511016,
				"cacheRead": .0255508
			},
			"deepseek-v4-flash-0731": {
				"input": .1596,
				"output": .399,
				"cacheRead": .0456
			},
			"qwen3-235b-a22b-instruct-2507": {
				"input": 1.026,
				"output": 3.078
			},
			"kimi-k3": {
				"input": 3.762,
				"output": 18.81,
				"cacheRead": .9405
			},
			"deepseek-v4.1-flash": {
				"input": .255552,
				"output": 1.27776,
				"cacheRead": .0127776
			},
			"minimax-m2.5": {
				"input": .1938,
				"output": 1.129,
				"cacheRead": .0627
			},
			"kimi-k2.6": {
				"input": .7524,
				"output": 4.275,
				"cacheRead": .2508
			},
			"green-s": {
				"input": .00437,
				"output": 0
			},
			"green-l": {
				"input": .285,
				"output": .912
			},
			"qwen3-coder-30b-a3b-instruct": {
				"input": .285,
				"output": 1.083
			},
			"llama-3.3-70b-instruct": {
				"input": 1.254,
				"output": 1.254
			},
			"gemma4": {
				"input": .57,
				"output": 1.71
			},
			"qwen3.6-35b-a3b": {
				"input": .342,
				"output": 2.052
			},
			"pixtral-12b-2409": {
				"input": .285,
				"output": .285
			},
			"glm-5.2-honey": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"holo2-30b-a3b": {
				"input": .399,
				"output": .969
			},
			"green-r-raw": {
				"input": .399,
				"output": 1.083
			},
			"green-s-pro": {
				"input": .00437,
				"output": 0
			},
			"devstral-2-123b-instruct-2512": {
				"input": .57,
				"output": 2.736
			},
			"mistral-medium-3.5-128b": {
				"input": 2.052,
				"output": 10.26
			},
			"qwen3.5-397b-a17b": {
				"input": .798,
				"output": 4.959
			},
			"glm-5.2": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"voxtral-small-24b-2507": {
				"input": .228,
				"output": .513
			},
			"green-l-raw": {
				"input": .285,
				"output": .912
			},
			"glm-5.2-ponytail-ultra": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"green-r": {
				"input": .399,
				"output": 1.083
			},
			"glm-5.1": {
				"input": 1.756,
				"output": 5.518
			},
			"mistral-small-3.2-24b-instruct-2506": {
				"input": .228,
				"output": .456
			},
			"glm-5.2-caveman": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"kimi-k2.6-fast": {
				"input": 1.655,
				"output": 8.778
			},
			"gpt-oss-120b": {
				"input": .228,
				"output": .798
			},
			"glm-5.3": {
				"input": 1.27754,
				"output": 5.11016,
				"cacheRead": .319385
			},
			"glm-5.2-caveman-ultra": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"kimi-k2.7-code": {
				"input": .9006,
				"output": 4.389,
				"cacheRead": .1881
			},
			"glm-5.2-ponytail": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"glm-5.2-honey-lite": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			},
			"glm-5.2-caveman-lite": {
				"input": 1.254,
				"output": 5.016,
				"cacheRead": .3135
			}
		},
		"mixlayer": {
			"qwen/qwen3.5-27b": {
				"input": .3,
				"output": 2.4
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .4,
				"output": 3.2
			},
			"qwen/qwen3.5-9b": {
				"input": .1,
				"output": .4
			},
			"qwen/qwen3.5-35b-a3b": {
				"input": .25,
				"output": 1.3
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .6,
				"output": 3.6
			}
		},
		"hyper": {
			"qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5
			},
			"qwen3.8-27b": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"glm-5.3-flash": {
				"input": .16332,
				"output": .5444,
				"cacheRead": .031575
			},
			"deepseek-v4-flash-0731": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .044
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"kimi-k3": {
				"input": 3.2664,
				"output": 16.332,
				"cacheRead": .32664
			},
			"deepseek-v4.1-flash": {
				"input": .33,
				"output": 1.31,
				"cacheRead": .03
			},
			"qwen3.7-flash": {
				"input": .2,
				"output": .8,
				"cacheRead": .04
			},
			"kimi-k2-thinking": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .3
			},
			"gemma-4-26b-a4b-it": {
				"input": .098,
				"output": .334,
				"cacheRead": .049
			},
			"minimax-m2.7": {
				"input": .484,
				"output": 1.852,
				"cacheRead": .242
			},
			"deepseek-v4-pro-0813": {
				"input": 1.437216,
				"output": 4.311648,
				"cacheRead": .047907
			},
			"inkling": {
				"input": 1.0888,
				"output": 4.40964,
				"cacheRead": .185096
			},
			"minimax-m3": {
				"input": .32664,
				"output": 1.30656,
				"cacheRead": .064239
			},
			"qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"glm-5.2": {
				"input": 1.52432,
				"output": 4.79072,
				"cacheRead": .152432
			},
			"deepseek-v4-pro": {
				"input": 2.4,
				"output": 4.8,
				"cacheRead": .2
			},
			"gpt-oss-120b": {
				"input": .178,
				"output": .68,
				"cacheRead": .089
			},
			"glm-5.3": {
				"input": 1.52432,
				"output": 4.79072,
				"cacheRead": .283088
			},
			"kimi-k2.7-code": {
				"input": 1.03436,
				"output": 4.3552,
				"cacheRead": .206872
			},
			"qwen3.7-plus": {
				"input": 1.2,
				"output": 4.8,
				"cacheRead": .24
			},
			"deepseek-v4-flash": {
				"input": .2,
				"output": .4,
				"cacheRead": .04
			}
		},
		"jalapeno": {
			"Qwen3-VL-235B-A22B-Instruct": {
				"input": .3,
				"output": 1.5
			},
			"MiniMax-M3": {
				"input": .3,
				"output": 1.2
			},
			"Qwen3-Next-80B-A3B-Instruct": {
				"input": .15,
				"output": 1.5
			},
			"GLM-5.1": {
				"input": 1.38,
				"output": 4.4
			},
			"Hy3": {
				"input": .14,
				"output": .58
			},
			"GLM-5.2": {
				"input": 1.4,
				"output": 4.4
			},
			"Qwen3-VL-235B-A22B-Thinking": {
				"input": .98,
				"output": 3.95
			},
			"Qwen3.5-27B": {
				"input": .3,
				"output": 2.4
			},
			"Kimi-K3": {
				"input": 3,
				"output": 15
			},
			"Qwen3-Next-80B-A3B-Thinking": {
				"input": .15,
				"output": 1.5
			},
			"DeepSeek-V4-Flash": {
				"input": .14,
				"output": .28
			},
			"DeepSeek-V4-Pro": {
				"input": 1.6,
				"output": 3.38
			},
			"Qwen3.5-35B-A3B": {
				"input": .25,
				"output": 2
			},
			"Qwen3.5-122B-A10B": {
				"input": .4,
				"output": 3.2
			},
			"Qwen3.5-397B-A17B": {
				"input": .6,
				"output": 3.6
			},
			"Kimi-K2.7-Code": {
				"input": .95,
				"output": 4
			},
			"Kimi-K2.5": {
				"input": .6,
				"output": 3
			}
		},
		"dinference": {
			"glm-5": {
				"input": .75,
				"output": 2.4
			},
			"minimax-m2.5": {
				"input": .22,
				"output": .88
			},
			"glm-4.7": {
				"input": .45,
				"output": 1.65
			},
			"glm-5.2": {
				"input": 1.25,
				"output": 3.89
			},
			"glm-5.1": {
				"input": 1.25,
				"output": 3.89
			},
			"gpt-oss-120b": {
				"input": .0675,
				"output": .27
			}
		},
		"neosmith": {
			"neosmith.neolite": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .08,
				"cacheWrite": 0
			},
			"neosmith.intelligent-maestro": {
				"input": 2.4,
				"output": 12,
				"cacheRead": .35,
				"cacheWrite": 0
			},
			"neosmith.intelligent-pro": {
				"input": 1.81,
				"output": 8.39,
				"cacheRead": .3,
				"cacheWrite": 0
			},
			"neosmith.intelligent-basic": {
				"input": 1.17,
				"output": 4.37,
				"cacheRead": .22,
				"cacheWrite": 0
			}
		},
		"fireworks-ai": {
			"accounts/fireworks/models/nemotron-3-ultra-nvfp4": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"accounts/fireworks/models/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"accounts/fireworks/models/qwen3p8-2p4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"accounts/fireworks/models/ember-1": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"accounts/fireworks/models/deepseek-v4p1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"accounts/fireworks/models/glm-5p3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"accounts/fireworks/models/nemotron-lightning-3p5-30b-a3b": {
				"input": .05,
				"output": .2,
				"cacheRead": .01
			},
			"accounts/fireworks/models/inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"accounts/fireworks/models/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"accounts/fireworks/models/glm-5p3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"accounts/fireworks/models/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"accounts/fireworks/models/qwen3p8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"accounts/fireworks/routers/minimax-latest": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"accounts/fireworks/routers/glm-flash-latest": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"accounts/fireworks/routers/glm-fast-latest": {
				"input": 2.1,
				"output": 6.6,
				"cacheRead": .39
			},
			"accounts/fireworks/routers/kimi-k3-fast": {
				"input": 4.5,
				"output": 22.5,
				"cacheRead": .45
			},
			"accounts/fireworks/routers/glm-5p3-fast": {
				"input": 2.1,
				"output": 6.6,
				"cacheRead": .39
			},
			"accounts/fireworks/routers/kimi-fast-latest": {
				"input": 4.5,
				"output": 22.5,
				"cacheRead": .45
			},
			"accounts/fireworks/routers/qwen-max-latest": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"accounts/fireworks/routers/kimi-latest": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"accounts/fireworks/routers/deepseek-flash-latest": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"accounts/fireworks/routers/glm-latest": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			}
		},
		"stepfun-ai": {
			"step-5-preview": {
				"input": 1,
				"output": 2.7,
				"cacheRead": .05
			},
			"step-3.7-flash": {
				"input": .185,
				"output": 1.11,
				"cacheRead": .037
			},
			"step-3.5-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"step-2-16k": {
				"input": 5.21,
				"output": 16.44,
				"cacheRead": 1.04
			},
			"step-3.5-flash-2603": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"step-1-32k": {
				"input": 2.05,
				"output": 9.59,
				"cacheRead": .41
			}
		},
		"fastrouter": {
			"anthropic/claude-opus-4.1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25
			},
			"anthropic/claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48
			},
			"z-ai/glm-5": {
				"input": .95,
				"output": 3.15
			},
			"z-ai/glm-5.1": {
				"input": 1.05,
				"output": 3.5
			},
			"sarvam/sarvam-30b": {
				"input": .02,
				"output": .1
			},
			"sarvam/sarvam-105b": {
				"input": .04,
				"output": .16
			},
			"x-ai/grok-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .75,
				"cacheWrite": 15
			},
			"x-ai/grok-4.3": {
				"input": 1.25,
				"output": 2.5
			},
			"x-ai/grok-build-0.1": {
				"input": 1,
				"output": 2
			},
			"google/gemma-4-31b-it": {
				"input": .13,
				"output": .38
			},
			"google/gemini-3.1-flash-image-preview": {
				"input": .5,
				"output": 3
			},
			"google/gemini-3-pro-image-preview": {
				"input": 2,
				"output": 12
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .31
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .0375
			},
			"deepseek-ai/deepseek-r1-distill-llama-70b": {
				"input": .03,
				"output": .14
			},
			"moonshotai/kimi-k2.6": {
				"input": .75,
				"output": 3.5
			},
			"moonshotai/kimi-k2": {
				"input": .55,
				"output": 2.2
			},
			"minimax/minimax-m2.7": {
				"input": .3,
				"output": 1.2
			},
			"minimax/minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4
			},
			"qwen/qwen3-coder": {
				"input": .3,
				"output": 1.2
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25
			},
			"openai/gpt-realtime-1.5": {
				"input": 4,
				"output": 16
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/gpt-oss-20b": {
				"input": .05,
				"output": .2
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-oss-120b": {
				"input": .15,
				"output": .6
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			}
		},
		"orcarouter": {
			"grok/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"grok/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"grok/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"anthropic/claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 10
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"deepseek/deepseek-v4-flash-0731": {
				"input": .147,
				"output": .295,
				"cacheRead": .02
			},
			"deepseek/deepseek-v4-flash-vision-exp": {
				"input": .147,
				"output": .295,
				"cacheRead": .02
			},
			"deepseek/deepseek-chat": {
				"input": .147,
				"output": .295,
				"cacheRead": .02
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": .442,
				"output": .884,
				"cacheRead": .06
			},
			"deepseek/deepseek-v4-flash-free": {
				"input": 0,
				"output": 0
			},
			"deepseek/deepseek-reasoner": {
				"input": .147,
				"output": .295,
				"cacheRead": .028
			},
			"deepseek/deepseek-v4-pro": {
				"input": .442,
				"output": .884,
				"cacheRead": .06
			},
			"deepseek/deepseek-v4-flash": {
				"input": .147,
				"output": .295,
				"cacheRead": .02
			},
			"tencent/hy3-free": {
				"input": 0,
				"output": 0
			},
			"tencent/hy3": {
				"input": .18,
				"output": .59,
				"cacheRead": .059
			},
			"z-ai/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"z-ai/glm-5.3-flash": {
				"input": .075,
				"output": .25
			},
			"z-ai/glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"z-ai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"z-ai/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"z-ai/glm-5.3-flash-free": {
				"input": 0,
				"output": 0
			},
			"z-ai/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"z-ai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"z-ai/glm-4.5-air": {
				"input": .2,
				"output": 1.1,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"z-ai/glm-5.3": {
				"input": 1.26,
				"output": 3.96,
				"cacheRead": .234
			},
			"meta/muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"google/gemini-flash-latest": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"google/gemma-4-31b-it": {
				"input": .13,
				"output": .38,
				"cacheRead": .02
			},
			"google/gemini-flash-lite-latest": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"google/gemini-3.6-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"google/gemini-robotics-er-1.6-preview": {
				"input": 1,
				"output": 5
			},
			"google/gemma-4-26b-a4b-it": {
				"input": .06,
				"output": .33,
				"cacheRead": .0075
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": .08333
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"google/gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"kimi/kimi-k3": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33
			},
			"kimi/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"kimi/kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1,
				"cacheWrite": 0
			},
			"kimi/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"orcarouter/free": {
				"input": 0,
				"output": 0
			},
			"orcarouter/auto": {
				"input": 0,
				"output": 0
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.5-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"qwen/qwen3.5-flash": {
				"input": .1,
				"output": .4
			},
			"qwen/qwen3-vl-235b-a22b-instruct": {
				"input": .4,
				"output": 1.6
			},
			"qwen/qwen3.7-max": {
				"input": 1.25,
				"output": 3.75,
				"cacheRead": .25,
				"cacheWrite": 1.563
			},
			"qwen/qwen3.8-27b": {
				"input": .33,
				"output": 2.4
			},
			"qwen/qwen3-vl-235b-a22b-thinking": {
				"input": .4,
				"output": 4
			},
			"qwen/qwen3.5-27b": {
				"input": .086,
				"output": .688
			},
			"qwen/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"qwen/qwen3.5-plus": {
				"input": .115,
				"output": .688,
				"reasoning": 2.4
			},
			"qwen/qwen3.7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .006,
				"cacheWrite": .038
			},
			"qwen/qwen3-max": {
				"input": .359,
				"output": 1.434
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .115,
				"output": .917
			},
			"qwen/qwen3.6-35b-a3b": {
				"input": .248,
				"output": 1.485
			},
			"qwen/qwen3.6-flash": {
				"input": .25,
				"output": 1.5
			},
			"qwen/qwen3.5-35b-a3b": {
				"input": .057,
				"output": .459
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .172,
				"output": 1.032
			},
			"qwen/qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"qwen/qwen3.7-plus": {
				"input": .35,
				"output": 1.42,
				"cacheRead": .071
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5,
				"cacheRead": 0
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-4o-2024-05-13": {
				"input": 5,
				"output": 15
			},
			"openai/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"openai/gpt-4": {
				"input": 30,
				"output": 60
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/gpt-5.2-chat-latest": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.1-chat-latest": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"openai/gpt-5-chat-latest": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-2024-08-06": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4o-2024-11-20": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/gpt-oss-120b": {
				"input": .03,
				"output": .17
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			}
		},
		"friendli": {
			"google/gemma-4-31B-it": {
				"input": .14,
				"output": .4
			},
			"deepseek-ai/DeepSeek-V3.2": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .25
			},
			"MiniMaxAI/MiniMax-M2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"zai-org/GLM-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"zai-org/GLM-5.3": {
				"input": 1.26,
				"output": 3.96,
				"cacheRead": .234
			}
		},
		"kimi-code-plan-cn": {
			"kimi-for-coding-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"kimi-for-coding": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"k3-256k": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"k3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"inco": {
			"kimi-k3:fast": {
				"input": 6,
				"output": 30
			},
			"glm-5.3:fast": {
				"input": 2.8,
				"output": 8.8
			},
			"glm-5.3-flash:fast": {
				"input": .15,
				"output": .5
			},
			"minimax-m3": {
				"input": .3,
				"output": 1.2
			},
			"deepseek-v4.1-flash:fast": {
				"input": .6,
				"output": 2.4
			},
			"minimax-m3:fast": {
				"input": .6,
				"output": 2.4
			},
			"glm-5.3": {
				"input": 1.4,
				"output": 4.4
			}
		},
		"sakana": {
			"fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"fugu-ultra-20260615": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana-namazu": {
				"input": .95,
				"output": 4,
				"cacheRead": .15
			}
		},
		"scx-ai": {
			"GLM-5.2": {
				"input": .55,
				"output": 1.784,
				"cacheRead": .111
			},
			"Qwen3.8-Max": {
				"input": 1.815,
				"output": 5.4461,
				"cacheRead": .17,
				"cacheWrite": 2.5
			},
			"MiniMax-M2.7": {
				"input": .48,
				"output": 1.79,
				"cacheRead": .05
			},
			"gpt-oss-120b": {
				"input": .17,
				"output": .55
			}
		},
		"zenifra": { "alibaba/qwen3.6-35b-a3b": {
			"input": .19,
			"output": .48
		} },
		"tokenrouter": { "z-ai/glm-5.3-free": {
			"input": 0,
			"output": 0
		} },
		"google-vertex-anthropic": {
			"claude-opus-4-8@default": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-4-5@20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-opus-4-6@default": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-opus-4@20250514": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"claude-sonnet-5-5@default": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"claude-opus-5-5@default": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"claude-opus-5@default": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-4-6@default": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-haiku-4-5@20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"claude-opus-4-1@20250805": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"claude-opus-4-5@20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-opus-4-7@default": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-fable-5-1@default": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"claude-fable-5@default": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"claude-sonnet-4@20250514": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-sonnet-5@default": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			}
		},
		"moonshotai": {
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			}
		},
		"ainetcafe": { "Kimi-K3": {
			"input": 2.1,
			"output": 10.5,
			"cacheRead": .3
		} },
		"wallaby": { "moonshotai/kimi-k3": {
			"input": 2.7,
			"output": 13.5,
			"cacheRead": .27
		} },
		"bee": {
			"bee-buzz": {
				"input": 2.5,
				"output": 10,
				"cacheRead": .25,
				"cacheWrite": 3
			},
			"bee-swarm": {
				"input": 25,
				"output": 150,
				"cacheRead": 2.5,
				"cacheWrite": 30
			},
			"bee-comb": {
				"input": 1.25,
				"output": 5,
				"cacheRead": .125,
				"cacheWrite": 1.5
			},
			"bee-hive": {
				"input": 5,
				"output": 20,
				"cacheRead": .5,
				"cacheWrite": 6
			},
			"bee-brood": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .72
			},
			"bee-cell": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .36
			}
		},
		"scnet-token-plan": {
			"DeepSeek-V4-Flash-0731": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"Kimi-K2.6": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"MiniMax-M3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"GLM-5.1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"GLM-5.2": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"Qwen3.8-Max": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"Kimi-K3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"DeepSeek-V4-Pro-0813": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"DeepSeek-V4.1-Flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"DeepSeek-V4-Flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"GLM-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"GLM-5.3-Flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"DeepSeek-V4-Pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"Qwen3.8-Flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"MiniMax-M2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"MiniMax-M2.7": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"GLM-5.3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"Kimi-K2.7-Code": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"Kimi-K2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			}
		},
		"ofox": {
			"bailian/qwen-flash": {
				"input": .022,
				"output": .22,
				"cacheRead": .0043,
				"cacheWrite": .027
			},
			"bailian/qwen3.5-flash": {
				"input": .1,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"bailian/qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"bailian/qwen3.8-27b": {
				"input": .45,
				"output": 3.2,
				"cacheRead": .05,
				"cacheWrite": .5625
			},
			"bailian/qwen3.5-27b": {
				"input": .29,
				"output": 2.05,
				"cacheRead": .29
			},
			"bailian/qwen-max": {
				"input": .35,
				"output": 1.38,
				"cacheRead": .069
			},
			"bailian/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"bailian/qwen3-coder-next": {
				"input": .2,
				"output": 1.5
			},
			"bailian/qwen3.5-plus": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .04,
				"cacheWrite": .4
			},
			"bailian/qwen-plus": {
				"input": .12,
				"output": .29,
				"cacheRead": .023
			},
			"bailian/qwen3-max": {
				"input": .36,
				"output": 1.43,
				"cacheRead": .072
			},
			"bailian/qwen-turbo": {
				"input": .05,
				"output": .09,
				"cacheRead": .0086
			},
			"bailian/qwen-vl-max": {
				"input": .23,
				"output": .58,
				"cacheRead": .046
			},
			"bailian/qwen3.5-122b-a10b": {
				"input": .29,
				"output": 2.29,
				"cacheRead": .29
			},
			"bailian/qwen3.6-flash": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .31
			},
			"bailian/qwen3-coder-flash": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .06,
				"cacheWrite": .27
			},
			"bailian/qwen3-coder-plus": {
				"input": 1.8,
				"output": 9,
				"cacheRead": .2,
				"cacheWrite": 1
			},
			"bailian/qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"bailian/qwen3.5-35b-a3b": {
				"input": .29,
				"output": 1.83,
				"cacheRead": .29
			},
			"bailian/qwen3.6-max-preview": {
				"input": 2.15,
				"output": 12.86,
				"cacheRead": .2,
				"cacheWrite": 1.17
			},
			"bailian/qwen3.5-397b-a17b": {
				"input": .55,
				"output": 3.5,
				"cacheRead": .55
			},
			"bailian/qwen3.6-27b": {
				"input": .6,
				"output": 3.6
			},
			"bailian/qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"bailian/qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"bailian/qwen3.8-max-0902": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-5.5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-4.5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"deepseek/deepseek-v4-flash-0731": {
				"input": .308,
				"output": .924,
				"cacheRead": .0098
			},
			"deepseek/deepseek-v4-flash-0423": {
				"input": .19,
				"output": .51,
				"cacheRead": .028
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .21,
				"output": .84,
				"cacheRead": .0042
			},
			"deepseek/deepseek-v4-flash-vision-exp": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .014
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": .924,
				"output": 2.772,
				"cacheRead": .0308
			},
			"deepseek/deepseek-v4-pro-0423": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .15
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"deepseek/deepseek-v3.2": {
				"input": .29,
				"output": .43,
				"cacheRead": .06
			},
			"deepseek/deepseek-v4-flash": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .014
			},
			"z-ai/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"z-ai/glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"z-ai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"z-ai/glm-5.3-flashx": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"z-ai/glm-4.7": {
				"input": .4,
				"output": 2.2,
				"cacheRead": .11
			},
			"z-ai/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"z-ai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"z-ai/glm-4.7-flashx": {
				"input": .072,
				"output": .4,
				"cacheRead": .01
			},
			"z-ai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"z-ai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"x-ai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"x-ai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"x-ai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"x-ai/grok-4.20": {
				"input": 4,
				"output": 12,
				"cacheRead": .4
			},
			"x-ai/grok-4.1-fast": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"x-ai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"volcengine/doubao-seed-2.0-mini": {
				"input": .06,
				"output": .56,
				"cacheRead": .02,
				"cacheWrite": .0024
			},
			"volcengine/doubao-seed-1-6-flash": {
				"input": .03,
				"output": .22,
				"cacheRead": .0043
			},
			"volcengine/doubao-seed-2.0-lite": {
				"input": .13,
				"output": .76,
				"cacheRead": .03,
				"cacheWrite": .0024
			},
			"volcengine/doubao-seed-1-8": {
				"input": .12,
				"output": .29,
				"cacheRead": .023
			},
			"volcengine/doubao-seed-1-6": {
				"input": .12,
				"output": .29,
				"cacheRead": .023
			},
			"volcengine/doubao-seed-2.0-pro": {
				"input": .67,
				"output": 3.36,
				"cacheRead": .14,
				"cacheWrite": .0024
			},
			"volcengine/doubao-seed-1-6-vision": {
				"input": .12,
				"output": 1.15,
				"cacheRead": .023
			},
			"volcengine/doubao-seed-2.1-turbo": {
				"input": .3536,
				"output": 1.7696,
				"cacheRead": .068,
				"cacheWrite": .0019
			},
			"volcengine/doubao-seed-2.1-pro": {
				"input": .7072,
				"output": 3.536,
				"cacheRead": .1416,
				"cacheWrite": .002
			},
			"volcengine/doubao-seed-character": {
				"input": .177,
				"output": .884,
				"cacheRead": .024,
				"cacheWrite": .0025
			},
			"volcengine/doubao-seed-evolving": {
				"input": .884,
				"output": 4.42,
				"cacheRead": .177,
				"cacheWrite": .0025
			},
			"volcengine/doubao-seed-2.0-code": {
				"input": .67,
				"output": 3.36,
				"cacheRead": .14,
				"cacheWrite": .0024
			},
			"google/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .0415
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 4.5
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": .083
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125,
				"cacheWrite": 4.5
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": 1
			},
			"google/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .0415
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": 1
			},
			"google/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .0415
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": 1
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": 1
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshotai/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"moonshotai/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshotai/kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"minimax/minimax-m2.5-lightning": {
				"input": .3,
				"output": 2.4,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.1-lightning": {
				"input": .3,
				"output": 2.4,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m3": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"minimax/minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/m2-her": {
				"input": .3,
				"output": 1.2
			},
			"minimax/minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"qwen/qwen-flash": {
				"input": .022,
				"output": .22,
				"cacheRead": .0043,
				"cacheWrite": .027
			},
			"qwen/qwen3.5-flash": {
				"input": .1,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"qwen/qwen3.7-max": {
				"input": 1.71,
				"output": 5.14,
				"cacheRead": .17,
				"cacheWrite": 2.14
			},
			"qwen/qwen3.8-27b": {
				"input": .5,
				"output": 1.71,
				"cacheRead": .043,
				"cacheWrite": .63
			},
			"qwen/qwen3.5-27b": {
				"input": .29,
				"output": 2.05,
				"cacheRead": .29
			},
			"qwen/qwen-max": {
				"input": .35,
				"output": 1.38,
				"cacheRead": .069
			},
			"qwen/qwen3.8-max": {
				"input": 1.71,
				"output": 5.14,
				"cacheRead": .17,
				"cacheWrite": 2.14
			},
			"qwen/qwen3-coder-next": {
				"input": .2,
				"output": 1.5
			},
			"qwen/qwen3.5-plus": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .04,
				"cacheWrite": .4
			},
			"qwen/qwen-plus": {
				"input": .12,
				"output": .29,
				"cacheRead": .023
			},
			"qwen/qwen3-max": {
				"input": .36,
				"output": 1.43,
				"cacheRead": .072
			},
			"qwen/qwen-turbo": {
				"input": .043,
				"output": .09,
				"cacheRead": .0086
			},
			"qwen/qwen-vl-max": {
				"input": .23,
				"output": .58,
				"cacheRead": .023
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .29,
				"output": 2.29,
				"cacheRead": .29
			},
			"qwen/qwen3.6-flash": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .31
			},
			"qwen/qwen3-coder-flash": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .06,
				"cacheWrite": .27
			},
			"qwen/qwen3-coder-plus": {
				"input": 1.8,
				"output": 9,
				"cacheRead": .2,
				"cacheWrite": 1
			},
			"qwen/qwen3.8-flash": {
				"input": .11,
				"output": .39,
				"cacheRead": .011,
				"cacheWrite": .14
			},
			"qwen/qwen3.5-35b-a3b": {
				"input": .29,
				"output": 1.83,
				"cacheRead": .29
			},
			"qwen/qwen3.6-max-preview": {
				"input": 2.15,
				"output": 12.86,
				"cacheRead": .2,
				"cacheWrite": 1.17
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .55,
				"output": 3.5,
				"cacheRead": .55
			},
			"qwen/qwen3.6-27b": {
				"input": .43,
				"output": 2.57
			},
			"qwen/qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"qwen/qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"qwen/qwen3.8-max-0902": {
				"input": 1.71,
				"output": 5.14,
				"cacheRead": .17,
				"cacheWrite": 2.14
			},
			"openai/gpt-5.4": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"openai/gpt-5.4-pro": {
				"input": 24,
				"output": 144
			},
			"openai/gpt-5.4-nano": {
				"input": .16,
				"output": 1,
				"cacheRead": .016
			},
			"openai/gpt-5.2-codex": {
				"input": 1.4,
				"output": 11.2,
				"cacheRead": .144
			},
			"openai/gpt-4o": {
				"input": 2,
				"output": 8,
				"cacheRead": 1
			},
			"openai/gpt-5-mini": {
				"input": .2,
				"output": 1.6,
				"cacheRead": .024
			},
			"openai/gpt-5.3-codex": {
				"input": 1.4,
				"output": 11.2,
				"cacheRead": .144
			},
			"openai/gpt-5-nano": {
				"input": .04,
				"output": .32,
				"cacheRead": .008
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-astra": {
				"input": 8,
				"output": 40,
				"cacheRead": .8,
				"cacheWrite": 10
			},
			"openai/gpt-5.1": {
				"input": 1,
				"output": 8,
				"cacheRead": .104
			},
			"openai/gpt-4o-mini": {
				"input": .12,
				"output": .48,
				"cacheRead": .06
			},
			"openai/gpt-5.4-mini": {
				"input": .6,
				"output": 3.6,
				"cacheRead": .06
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.1-codex-max": {
				"input": 1,
				"output": 8,
				"cacheRead": .104
			},
			"openai/gpt-5.2": {
				"input": 1.4,
				"output": 11.2,
				"cacheRead": .144
			},
			"openai/gpt-5.5": {
				"input": 4,
				"output": 24,
				"cacheRead": .4
			},
			"openai/gpt-4.1": {
				"input": 1.6,
				"output": 6.4,
				"cacheRead": .4
			},
			"openai/gpt-4.1-mini": {
				"input": .32,
				"output": 1.28,
				"cacheRead": .08
			},
			"openai/gpt-6-luna": {
				"input": .08,
				"output": .4,
				"cacheRead": .008,
				"cacheWrite": .1
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-5.1-codex-mini": {
				"input": .2,
				"output": 1.6,
				"cacheRead": .024
			},
			"openai/gpt-5": {
				"input": 1,
				"output": 8,
				"cacheRead": .104
			},
			"openai/gpt-5.6-sol": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"openai/gpt-6-sol": {
				"input": 1.6,
				"output": 8,
				"cacheRead": .16,
				"cacheWrite": 2
			}
		},
		"neon": {
			"gpt-5-4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-5-6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"glm-5-3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"gpt-5-6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"llama-4-maverick": {
				"input": .5,
				"output": 1.5
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"gpt-5-4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"gpt-5-6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-opus-4-1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"gpt-5-5-pro": {
				"input": 30,
				"output": 180
			},
			"gemini-3-1-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"glm-5-2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": 1.2
			},
			"gemini-3-flash": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"gpt-oss-20b": {
				"input": .07,
				"output": .3
			},
			"gpt-5-4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3-1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"gpt-5-5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"grok-4-6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"qwen35-122b-a10b": {
				"input": .22,
				"output": 2.2
			},
			"gemini-3-6-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"meta-llama-3-3-70b-instruct": {
				"input": .5,
				"output": 1.5
			},
			"gpt-5-2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gpt-5-3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gemma-3-12b": {
				"input": .15,
				"output": .5
			},
			"gemini-3-5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gemini-3-5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"gpt-5-1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-oss-120b": {
				"input": .15,
				"output": .6
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"meta-llama-3-1-8b-instruct": {
				"input": .15,
				"output": .45
			}
		},
		"aihubmix": {
			"glm-4.6v": {
				"input": .137,
				"output": .411,
				"cacheRead": .0274
			},
			"qwen3.5-flash": {
				"input": .0282,
				"output": .282,
				"cacheRead": .00282,
				"cacheWrite": .03525
			},
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"claude-haiku-4-5": {
				"input": 1.1,
				"output": 5.5,
				"cacheRead": .11,
				"cacheWrite": 1.375
			},
			"mimo-v2.6-pro": {
				"input": .48,
				"output": .96,
				"cacheRead": .00384
			},
			"coding-minimax-m2.7-free": {
				"input": 0,
				"output": 0
			},
			"qwen3.7-max": {
				"input": 1.69,
				"output": 5.07,
				"cacheRead": .169,
				"cacheWrite": 2.1125
			},
			"muse-spark-1.3": {
				"input": 1.375,
				"output": 4.675,
				"cacheRead": .165
			},
			"deep-deepseek-v4-pro": {
				"input": .478,
				"output": .956,
				"cacheRead": .004302
			},
			"mimo-v2.5": {
				"input": .155,
				"output": .31,
				"cacheRead": .0031
			},
			"gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"grok-4.7": {
				"input": 2.2,
				"output": 6.6,
				"cacheRead": .55
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"glm-5v-turbo": {
				"input": .7042,
				"output": 3.09848,
				"cacheRead": .169008
			},
			"gemini-2.5-flash-image": {
				"input": .3,
				"output": 30,
				"cacheRead": .03
			},
			"qwen3-vl-plus": {
				"input": .137,
				"output": 1.37,
				"cacheRead": 0
			},
			"glm-5.3-flash": {
				"input": .11268,
				"output": .39438,
				"cacheRead": .02817
			},
			"qwen3.5-27b": {
				"input": .0846,
				"output": .6768
			},
			"glm-4.6": {
				"input": .273974,
				"output": 1.095896,
				"cacheRead": .0547948
			},
			"deepseek-v4-flash-0731": {
				"input": .142,
				"output": .284,
				"cacheRead": .0284
			},
			"qwen3.8-max": {
				"input": 1.69,
				"output": 5.07,
				"cacheRead": .169,
				"cacheWrite": 2.1125
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"doubao-seed-2-0-lite-260428": {
				"input": .08,
				"output": .51,
				"cacheRead": .01692
			},
			"claude-sonnet-4-6-think": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gpt-image-2": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"qwen3.5-plus": {
				"input": .1096,
				"output": .6576,
				"cacheRead": .01096,
				"cacheWrite": .137
			},
			"o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"deepseek-v4-flash-0731-fast": {
				"input": .28,
				"output": 1.4,
				"cacheRead": .07
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"hy3-preview": {
				"input": .17,
				"output": .566661,
				"cacheRead": .051
			},
			"alicloud-deepseek-v4-pro": {
				"input": 1.69,
				"output": 3.38,
				"cacheRead": .13
			},
			"zai-glm-5.1": {
				"input": .845,
				"output": 3.38,
				"cacheRead": .183112
			},
			"deepseek-v4.1-flash": {
				"input": .155,
				"output": .62,
				"cacheRead": .0031
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"qwen3.8-max-preview": {
				"input": .338,
				"output": 1.014,
				"cacheRead": .0676,
				"cacheWrite": .4225
			},
			"coding-minimax-m2.7-highspeed": {
				"input": .2,
				"output": .2
			},
			"muse-spark-1.1": {
				"input": 1.375,
				"output": 4.675
			},
			"deepseek-v4-flash-vision-exp": {
				"input": .155,
				"output": .62,
				"cacheRead": .0031
			},
			"kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 7.999,
				"cacheRead": .32167
			},
			"qwen3.7-flash": {
				"input": .0282,
				"output": .1128,
				"cacheRead": .00564,
				"cacheWrite": .03525
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"claude-sonnet-4-5": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"qwen3-max": {
				"input": .4508,
				"output": 2.7048,
				"cacheRead": .09016,
				"cacheWrite": .5635
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"gpt-image-2.5-flare": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"claude-opus-4-8-think": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"doubao-seed-2-0-pro": {
				"input": .48,
				"output": 2.41,
				"cacheRead": .09644
			},
			"xiaomi-mimo-v2.5": {
				"input": .44,
				"output": 2.2,
				"cacheRead": .088
			},
			"glm-4.5v": {
				"input": .274,
				"output": 1.096
			},
			"claude-fable-5-1": {
				"input": 11,
				"output": 55,
				"cacheRead": .275,
				"cacheWrite": 13.75
			},
			"gemini-3.6-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"step-5-preview": {
				"input": 1.08,
				"output": 3.0888,
				"cacheRead": .054
			},
			"longcat-2.0": {
				"input": .7746,
				"output": 3.0984,
				"cacheRead": .015492
			},
			"mimo-v2.6-pro-ultraspeed": {
				"input": 4.8,
				"output": 9.6,
				"cacheRead": .0384
			},
			"doubao-seed-2-0-code-preview": {
				"input": .48,
				"output": 2.41,
				"cacheRead": .09644
			},
			"grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"qwen3.8-omni-flash": {
				"input": .1126,
				"output": .380025,
				"cacheRead": .014075,
				"cacheWrite": .175937
			},
			"doubao-seed-2-0-mini-260428": {
				"input": .03,
				"output": .28,
				"cacheRead": .00564
			},
			"xiaomi-mimo-v2.5-pro-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.499999,
				"cacheRead": .03
			},
			"gemini-3.1-flash-image": {
				"input": .5,
				"output": 3
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"qwen3.5-122b-a10b": {
				"input": .1126,
				"output": .9008
			},
			"kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .13
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"coding-minimax-m2.7": {
				"input": .2,
				"output": .2
			},
			"qwen3.6-35b-a3b": {
				"input": .254,
				"output": 1.524
			},
			"minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": 1.5
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"deep-deepseek-v4-flash": {
				"input": .154,
				"output": .308,
				"cacheRead": .0308
			},
			"qwen3.6-flash": {
				"input": .17,
				"output": 1.01,
				"cacheRead": .0169,
				"cacheWrite": .21125
			},
			"gemini-3-pro-image": {
				"input": 2,
				"output": 120
			},
			"coding-glm-5.1": {
				"input": .06,
				"output": .22,
				"cacheRead": .013
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gpt-image-2.5-sunburst": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"xiaomi-mimo-v2.5-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"claude-fable-5": {
				"input": 11,
				"output": 55,
				"cacheRead": 1.1,
				"cacheWrite": 13.75
			},
			"deepseek-v4-pro-0813": {
				"input": .6918,
				"output": 2.0754,
				"cacheRead": .023058
			},
			"mimo-v2.5-pro": {
				"input": .48,
				"output": .96,
				"cacheRead": .00384
			},
			"muse-spark-1.2": {
				"input": 1.375,
				"output": 4.675
			},
			"gemini-3.1-flash-lite-image": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"mimo-v2.6-flash": {
				"input": .155,
				"output": .31,
				"cacheRead": .0031
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"glm-4.7": {
				"input": .273974,
				"output": 1.095896,
				"cacheRead": .0547948
			},
			"minimax-m3": {
				"input": .288,
				"output": 1.152
			},
			"gpt-5.6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"qwen3.8-flash": {
				"input": .1126,
				"output": .380025,
				"cacheRead": .014075,
				"cacheWrite": .175937
			},
			"claude-opus-4-6-think": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"coding-xiaomi-mimo-v2.5": {
				"input": .08,
				"output": .4,
				"cacheRead": .016
			},
			"gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"ox-alpha": {
				"input": 0,
				"output": 0
			},
			"qwen3.5-35b-a3b": {
				"input": .0564,
				"output": .4512
			},
			"qwen3.6-max-preview": {
				"input": 1.27,
				"output": 7.61,
				"cacheRead": .1268,
				"cacheWrite": 1.585
			},
			"qwen3.5-397b-a17b": {
				"input": .1644,
				"output": .9864
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"glm-5.2": {
				"input": 1.1268,
				"output": 3.9438,
				"cacheRead": .2817
			},
			"hy3": {
				"input": .1562,
				"output": .6248,
				"cacheRead": .03905
			},
			"gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"claude-opus-4-7-think": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"alicloud-deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"coding-xiaomi-mimo-v2.5-pro": {
				"input": .2,
				"output": .6,
				"cacheRead": .04
			},
			"gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"step-3.7-flash": {
				"input": .22,
				"output": 1.32,
				"cacheRead": .044
			},
			"alicloud-glm-5.1": {
				"input": .84,
				"output": 3.38,
				"cacheRead": .169,
				"cacheWrite": 1.05625
			},
			"gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"coding-glm-5.1-free": {
				"input": 0,
				"output": 0
			},
			"gpt-image-1.5": {
				"input": 5,
				"output": 32
			},
			"qwen3.6-plus": {
				"input": .28,
				"output": 1.69,
				"cacheRead": .0282,
				"cacheWrite": .3525
			},
			"gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"hy4-preview": {
				"input": .845,
				"output": 2.535,
				"cacheRead": .04225
			},
			"gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"glm-5.3": {
				"input": 1.1268,
				"output": 3.9438,
				"cacheRead": .2817
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 3.9995,
				"cacheRead": .160835
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"xiaomi-mimo-v2.5-pro": {
				"input": 1.1,
				"output": 3.3,
				"cacheRead": .22
			},
			"qwen3.7-plus": {
				"input": .282,
				"output": 1.128,
				"cacheRead": .0564,
				"cacheWrite": .3525
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": 1
			}
		},
		"merge-gateway": {
			"zai/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"zai/glm-5.3-flash": {
				"input": .075,
				"output": .25,
				"cacheRead": .015
			},
			"zai/glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"zai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": 0
			},
			"zai/glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"zai/glm-4.7-flash": {
				"input": .07,
				"output": .4
			},
			"zai/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"zai/glm-5.2": {
				"input": 1.05,
				"output": 3.3,
				"cacheRead": .195
			},
			"zai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"zai/glm-4.7-flashx": {
				"input": .07,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": 0
			},
			"zai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24,
				"cacheWrite": 0
			},
			"zai/glm-4.5-air": {
				"input": .2,
				"output": 1.1,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"zai/glm-5.3": {
				"input": .7,
				"output": 2.2,
				"cacheRead": .13
			},
			"anthropic/claude-3-7-sonnet-20250219": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-opus-4-20250514": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic/claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-1-20250805": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic/claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-4-20250514": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"cohere/command-r-08-2024": {
				"input": .15,
				"output": .6
			},
			"cohere/command-a-03-2025": {
				"input": 2.5,
				"output": 10
			},
			"cohere/command-r7b-12-2024": {
				"input": .0375,
				"output": .15
			},
			"cohere/command-r-plus-08-2024": {
				"input": 2.5,
				"output": 10
			},
			"deepseek/deepseek-v4-flash-0731": {
				"input": .035,
				"output": .07,
				"cacheRead": .007
			},
			"deepseek/deepseek-v4-flash-0423": {
				"input": .139,
				"output": .278
			},
			"deepseek/deepseek-v4-flash-0731-fast": {
				"input": .28,
				"output": .56,
				"cacheRead": .07
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"deepseek/deepseek-v3": {
				"input": .27,
				"output": 1.1
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .003625
			},
			"deepseek/deepseek-v4-pro-0423": {
				"input": 1.65,
				"output": 3.3
			},
			"deepseek/deepseek-v3.1": {
				"input": .5,
				"output": 1.5
			},
			"deepseek/deepseek-r1": {
				"input": 1.35,
				"output": 5.4
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .145
			},
			"deepseek/deepseek-v3.2": {
				"input": .28,
				"output": .4,
				"cacheRead": .13
			},
			"deepseek/deepseek-v4-flash": {
				"input": .035,
				"output": .07,
				"cacheRead": .007
			},
			"thinkingmachines/inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"meta/muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/llama-3.3-70b-instruct": {
				"input": .22,
				"output": .5,
				"cacheRead": .11
			},
			"meta/muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"meta/llama-3.1-8b-instruct": {
				"input": .22,
				"output": .22
			},
			"meta/llama-3.1-70b-instruct": {
				"input": .99,
				"output": .99
			},
			"bytedance/dola-seed-2.0-code-preview": {
				"input": .5,
				"output": 3
			},
			"bytedance/dola-seed-2.0-code": {
				"input": .4,
				"output": 2.4
			},
			"bytedance/dola-seed-2.0-mini": {
				"input": .1,
				"output": .4
			},
			"bytedance/dola-seed-2.0-lite": {
				"input": .25,
				"output": 2
			},
			"bytedance/dola-seed-2.0-pro": {
				"input": .5,
				"output": 3
			},
			"google/gemini-flash-latest": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"google/gemma-4-31b-it": {
				"input": .14,
				"output": .4
			},
			"google/gemma-3-27b-it": {
				"input": .08,
				"output": .45,
				"cacheRead": .04
			},
			"google/gemini-3-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-2.5-flash-image": {
				"input": .3,
				"output": 2.5
			},
			"google/gemini-flash-lite-latest": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"google/gemini-3.6-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"google/gemma-4-26b-a4b-it": {
				"input": .13,
				"output": .4
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3.1-flash-image": {
				"input": .5,
				"output": 3
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemma-3-12b-it": {
				"input": .09,
				"output": .29
			},
			"google/gemini-2.5-computer-use-preview-10-2025": {
				"input": 1.25,
				"output": 10
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"google/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"google/gemini-3-pro-image": {
				"input": 2,
				"output": 12
			},
			"google/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemma-3-4b-it": {
				"input": .04,
				"output": .08
			},
			"google/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"google/gemini-embedding-001": {
				"input": .15,
				"output": 0
			},
			"google/gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"writer/palmyra-x4": {
				"input": 2.5,
				"output": 10
			},
			"writer/palmyra-x5": {
				"input": .6,
				"output": 6
			},
			"xai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"xai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.20-0309-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"xai/grok-4.20-0309-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"xai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"sakana/fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"sakana/sakana-namazu": {
				"input": .95,
				"output": 4,
				"cacheRead": .15
			},
			"moonshotai/kimi-k2-thinking": {
				"input": .6,
				"output": 2.5
			},
			"nvidia/nemotron-3-nano-30b-a3b": {
				"input": .05,
				"output": .2
			},
			"nvidia/nemotron-3.5-lightning-30b-a3b": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-nano-9b-v2": {
				"input": .06,
				"output": .23
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.5-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"minimax/minimax-m2": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"mistral/codestral-latest": {
				"input": .3,
				"output": .9
			},
			"mistral/mistral-large-2411": {
				"input": 2,
				"output": 6
			},
			"mistral/mistral-large-latest": {
				"input": .5,
				"output": 1.5
			},
			"mistral/mistral-small-latest": {
				"input": .15,
				"output": .6
			},
			"mistral/devstral-medium-latest": {
				"input": .4,
				"output": 2
			},
			"mistral/devstral-2512": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistral/mistral-medium-2505": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistral/magistral-medium-latest": {
				"input": 2,
				"output": 5
			},
			"mistral/devstral-medium-2507": {
				"input": .4,
				"output": 2
			},
			"mistral/mistral-large-2512": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"mistral/devstral-small-2507": {
				"input": .1,
				"output": .3
			},
			"mistral/pixtral-large-latest": {
				"input": 2,
				"output": 6
			},
			"mistral/mistral-medium-latest": {
				"input": .4,
				"output": 2
			},
			"qwen/qwen-flash": {
				"input": .022,
				"output": .216,
				"cacheRead": .0044
			},
			"qwen/qwen3.5-flash": {
				"input": .029,
				"output": .287,
				"cacheRead": .0058
			},
			"qwen/qwen3-vl-235b-a22b-instruct": {
				"input": .287,
				"output": 1.147,
				"cacheRead": .15785
			},
			"qwen/qwen3.7-max": {
				"input": .825,
				"output": 2.4755,
				"cacheRead": .165
			},
			"qwen/qwen3-vl-235b-a22b-thinking": {
				"input": .287,
				"output": 2.867,
				"cacheRead": .0574
			},
			"qwen/qwen3.8-2.4t-a95b": {
				"input": 2.5,
				"output": 6.25,
				"cacheRead": .5
			},
			"qwen/qwen3-vl-plus": {
				"input": .143,
				"output": 1.434,
				"cacheRead": .0286
			},
			"qwen/qwen3.5-27b": {
				"input": .086,
				"output": .688,
				"cacheRead": .0172
			},
			"qwen/qwen3-235b-a22b-instruct-2507": {
				"input": .1,
				"output": .6,
				"cacheRead": .0574
			},
			"qwen/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.2
			},
			"qwen/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"qwen/qwen3-coder-next": {
				"input": .15,
				"output": .8,
				"cacheRead": .075
			},
			"qwen/qwen3.5-plus": {
				"input": .115,
				"output": .688,
				"cacheRead": .023
			},
			"qwen/qwen3-32b": {
				"input": .15,
				"output": .6
			},
			"qwen/qwen-plus": {
				"input": .115,
				"output": .287,
				"cacheRead": .023
			},
			"qwen/qwen3-max": {
				"input": .359,
				"output": 1.434,
				"cacheRead": .0718
			},
			"qwen/qwen3-coder-480b-a35b-instruct": {
				"input": .22,
				"output": 1.8
			},
			"qwen/qwen3-235b-a22b": {
				"input": .287,
				"output": 1.147,
				"cacheRead": .0574
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .115,
				"output": .917,
				"cacheRead": .023
			},
			"qwen/qwen3.6-35b-a3b": {
				"input": .248,
				"output": 1.485,
				"cacheRead": .0496
			},
			"qwen/qwen3-next-80b-a3b-instruct": {
				"input": .144,
				"output": .574,
				"cacheRead": .0288
			},
			"qwen/qwen3.6-flash": {
				"input": .165,
				"output": .99,
				"cacheRead": .033
			},
			"qwen/qwen3-coder-flash": {
				"input": .144,
				"output": .574,
				"cacheRead": .0288
			},
			"qwen/qwen3-coder-plus": {
				"input": .574,
				"output": 2.294,
				"cacheRead": .1148
			},
			"qwen/qwen3.5-9b": {
				"input": .09,
				"output": .13
			},
			"qwen/qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"qwen/qwen3.5-35b-a3b": {
				"input": .057,
				"output": .459,
				"cacheRead": .020357
			},
			"qwen/qwen3.6-max-preview": {
				"input": 1.31,
				"output": 7.88
			},
			"qwen/qwen3-30b-a3b": {
				"input": .108,
				"output": 1.076,
				"cacheRead": .0216
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .172,
				"output": 1.032,
				"cacheRead": .0344
			},
			"qwen/qwen3.6-27b": {
				"input": .289,
				"output": 2.4
			},
			"qwen/qwen3.6-plus": {
				"input": .276,
				"output": 1.651,
				"cacheRead": .0552
			},
			"qwen/qwen3.7-plus": {
				"input": .4,
				"output": 1.6
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-oss-safeguard-120b": {
				"input": .15,
				"output": .6
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-4o-2024-05-13": {
				"input": 5,
				"output": 15
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-4": {
				"input": 30,
				"output": 60
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/gpt-5.2-chat-latest": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.1-chat-latest": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-5-chat-latest": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-2024-08-06": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/gpt-oss-20b": {
				"input": .04,
				"output": .15,
				"cacheRead": .02
			},
			"openai/gpt-oss-safeguard-20b": {
				"input": .07,
				"output": .2,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4o-2024-11-20": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-5.3-chat-latest": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/gpt-oss-120b": {
				"input": .05,
				"output": .25
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 5
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"moonshot/kimi-k3": {
				"input": 2.9,
				"output": 14,
				"cacheRead": .3
			},
			"moonshot/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"moonshot/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshot/kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"moonshot/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			}
		},
		"opper": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"claude-haiku-4-5": {
				"input": 1.1,
				"output": 5.5,
				"cacheRead": .11,
				"cacheWrite": 1.375
			},
			"gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"gemma-4-31b-it": {
				"input": .46488,
				"output": 2.44062
			},
			"muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"qwen3.8-27b": {
				"input": .5811,
				"output": 3
			},
			"gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"qwen3.8-2.4t-a95b": {
				"input": 2.5,
				"output": 6,
				"cacheRead": .63
			},
			"glm-5.3-flash": {
				"input": .2,
				"output": .5,
				"cacheRead": .07
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"kimi-k3": {
				"input": 3,
				"output": 15
			},
			"qwen3-coder-next": {
				"input": .5811,
				"output": 2.3244
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"claude-sonnet-4-5": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"devstral-2512": {
				"input": .4,
				"output": 2
			},
			"sonar-pro": {
				"input": 3,
				"output": 15
			},
			"grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"claude-opus-5": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"qwen3.6-35b-a3b": {
				"input": .248,
				"output": 1.485
			},
			"gpt-oss-20b": {
				"input": .11622,
				"output": .488124
			},
			"minimax-m2.7": {
				"input": .69732,
				"output": 2.78928
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"minimax-m3": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"mistral-small-2603": {
				"input": .5811,
				"output": 2.44062
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"claude-sonnet-5": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"glm-5.2": {
				"input": 1.62708,
				"output": 5.811
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"sonar": {
				"input": 1,
				"output": 1
			},
			"mistral-large-2512": {
				"input": .5,
				"output": 1.5
			},
			"gemini-3.8-flash": {
				"input": .825,
				"output": 4.125,
				"cacheRead": .0825
			},
			"deepseek-v4-pro": {
				"input": 1.78812,
				"output": 3.57624
			},
			"claude-sonnet-4-6": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"gpt-5.3-chat-latest": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"sonar-reasoning-pro": {
				"input": 2,
				"output": 8
			},
			"gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gpt-oss-120b": {
				"input": 1.1622,
				"output": 4.88124
			},
			"glm-5.3": {
				"input": 1.75,
				"output": 4.6488,
				"cacheRead": .44
			},
			"claude-opus-4-7": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"deepseek-v4-flash": {
				"input": .25,
				"output": .66
			}
		},
		"nvidia": {
			"baai/bge-m3": {
				"input": 0,
				"output": 0
			},
			"poolside/laguna-xs-2.1": {
				"input": 0,
				"output": 0
			},
			"abacusai/dracarys-llama-3.1-70b-instruct": {
				"input": 0,
				"output": 0
			},
			"z-ai/glm-5.3-flash": {
				"input": 0,
				"output": 0
			},
			"z-ai/glm-5.2": {
				"input": 0,
				"output": 0
			},
			"z-ai/glm-5.3": {
				"input": 0,
				"output": 0
			},
			"thinkingmachines/inkling": {
				"input": 0,
				"output": 0
			},
			"black-forest-labs/flux_1-schnell": {
				"input": 0,
				"output": 0
			},
			"black-forest-labs/flux.1-dev": {
				"input": 0,
				"output": 0
			},
			"black-forest-labs/flux_1-kontext-dev": {
				"input": 0,
				"output": 0
			},
			"black-forest-labs/flux_2-klein-4b": {
				"input": 0,
				"output": 0
			},
			"meta/llama-guard-4-12b": {
				"input": 0,
				"output": 0
			},
			"meta/muse-glimmer-30b": {
				"input": 0,
				"output": 0
			},
			"meta/esmfold": {
				"input": 0,
				"output": 0
			},
			"meta/llama-3.3-70b-instruct": {
				"input": 0,
				"output": 0
			},
			"meta/llama-3.2-90b-vision-instruct": {
				"input": 0,
				"output": 0
			},
			"meta/llama-4-maverick-17b-128e-instruct": {
				"input": 0,
				"output": 0
			},
			"meta/llama-3.1-8b-instruct": {
				"input": 0,
				"output": 0
			},
			"meta/llama-3.2-11b-vision-instruct": {
				"input": 0,
				"output": 0
			},
			"meta/llama-3.2-1b-instruct": {
				"input": 0,
				"output": 0
			},
			"meta/llama-3.2-3b-instruct": {
				"input": 0,
				"output": 0
			},
			"meta/llama-3.1-70b-instruct": {
				"input": 0,
				"output": 0
			},
			"meta/esm2-650m": {
				"input": 0,
				"output": 0
			},
			"upstage/solar-10.7b-instruct": {
				"input": 0,
				"output": 0
			},
			"bytedance/seed-oss-36b-instruct": {
				"input": 0,
				"output": 0
			},
			"google/diffusiongemma-26b-a4b-it": {
				"input": 0,
				"output": 0
			},
			"google/gemma-4-31b-it": {
				"input": 0,
				"output": 0
			},
			"google/gemma-2-2b-it": {
				"input": 0,
				"output": 0
			},
			"google/gemma-3-12b-it": {
				"input": 0,
				"output": 0
			},
			"google/gemma-3n-e2b-it": {
				"input": 0,
				"output": 0
			},
			"google/google-paligemma": {
				"input": 0,
				"output": 0
			},
			"google/gemma-3n-e4b-it": {
				"input": 0,
				"output": 0
			},
			"google/gemma-3-4b-it": {
				"input": 0,
				"output": 0
			},
			"minimaxai/minimax-m2.7": {
				"input": 0,
				"output": 0
			},
			"minimaxai/minimax-m3": {
				"input": 0,
				"output": 0
			},
			"deepseek-ai/deepseek-v4-flash-0731": {
				"input": 0,
				"output": 0
			},
			"deepseek-ai/deepseek-v4.1-flash": {
				"input": 0,
				"output": 0
			},
			"deepseek-ai/deepseek-v4-pro-0813": {
				"input": 0,
				"output": 0
			},
			"deepseek-ai/deepseek-v4-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"deepseek-ai/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"stepfun-ai/step-3.5-flash": {
				"input": 0,
				"output": 0
			},
			"stepfun-ai/step-3.7-flash": {
				"input": 0,
				"output": 0
			},
			"mistralai/mistral-nemotron": {
				"input": 0,
				"output": 0
			},
			"mistralai/mistral-7b-instruct-v0.3": {
				"input": 0,
				"output": 0
			},
			"mistralai/mistral-large-3-675b-instruct-2512": {
				"input": 0,
				"output": 0
			},
			"mistralai/magistral-small-2506": {
				"input": 0,
				"output": 0
			},
			"mistralai/mistral-small-4-119b-2603": {
				"input": 0,
				"output": 0
			},
			"mistralai/mixtral-8x7b-instruct": {
				"input": 0,
				"output": 0
			},
			"mistralai/mistral-medium-3.5-128b": {
				"input": 0,
				"output": 0
			},
			"mistralai/ministral-14b-instruct-2512": {
				"input": 0,
				"output": 0
			},
			"mistralai/mixtral-8x22b-instruct": {
				"input": 0,
				"output": 0
			},
			"mistralai/mistral-medium-3-instruct": {
				"input": 0,
				"output": 0
			},
			"moonshotai/kimi-k3": {
				"input": 0,
				"output": 0
			},
			"moonshotai/kimi-k2.6": {
				"input": 0,
				"output": 0
			},
			"sarvamai/sarvam-m": {
				"input": 0,
				"output": 0
			},
			"nvidia/nvidia-nemotron-nano-9b-v2": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-3.1-nemotron-ultra-253b-v1": {
				"input": 0,
				"output": 0
			},
			"nvidia/sparsedrive": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-nano-30b-a3b": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3.5-lightning-30b-a3b": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-nemotron-embed-vl-1b-v2": {
				"input": 0,
				"output": 0
			},
			"nvidia/nv-embedcode-7b-v1": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-voicechat": {
				"input": 0,
				"output": 0
			},
			"nvidia/bevformer": {
				"input": 0,
				"output": 0
			},
			"nvidia/cosmos-transfer1-7b": {
				"input": 0,
				"output": 0
			},
			"nvidia/cosmos-predict1-5b": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-3.1-nemotron-nano-vl-8b-v1": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-super-120b-a12b": {
				"input": .2,
				"output": .8
			},
			"nvidia/studiovoice": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-content-safety-reasoning-4b": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-3.1-nemotron-safety-guard-8b-v3": {
				"input": 0,
				"output": 0
			},
			"nvidia/nv-embed-v1": {
				"input": 0,
				"output": 0
			},
			"nvidia/synthetic-video-detector": {
				"input": 0,
				"output": 0
			},
			"nvidia/cosmos-transfer2_5-2b": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-ultra-550b-a55b": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .15
			},
			"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-3.1-nemotron-nano-8b-v1": {
				"input": 0,
				"output": 0
			},
			"nvidia/active-speaker-detection": {
				"input": 0,
				"output": 0
			},
			"nvidia/streampetr": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-nemotron-rerank-vl-1b-v2": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-mini-4b-instruct": {
				"input": 0,
				"output": 0
			},
			"nvidia/cosmos-reason2-8b": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3-content-safety": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-3.3-nemotron-super-49b-v1": {
				"input": 0,
				"output": 0
			},
			"nvidia/magpie-tts-zeroshot": {
				"input": 0,
				"output": 0
			},
			"nvidia/riva-translate-4b-instruct-v1.1": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-nano-12b-v2-vl": {
				"input": 0,
				"output": 0
			},
			"nvidia/nemotron-3.5-content-safety": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-3.3-nemotron-super-49b-v1.5": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-3_2-nemoretriever-300m-embed-v1": {
				"input": 0,
				"output": 0
			},
			"nvidia/gliner-pii": {
				"input": 0,
				"output": 0
			},
			"nvidia/usdcode": {
				"input": 0,
				"output": 0
			},
			"nvidia/usdvalidate": {
				"input": 0,
				"output": 0
			},
			"nvidia/llama-3.1-nemotron-70b-instruct": {
				"input": 0,
				"output": 0
			},
			"nvidia/rerank-qa-mistral-4b": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen-image-edit": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen3-coder-480b-a35b-instruct": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen3-next-80b-a3b-instruct": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen2.5-coder-32b-instruct": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen-image": {
				"input": 0,
				"output": 0
			},
			"openai/whisper-large-v3": {
				"input": 0,
				"output": 0
			},
			"openai/gpt-oss-20b": {
				"input": 0,
				"output": 0
			},
			"microsoft/phi-4-mini-instruct": {
				"input": 0,
				"output": 0
			},
			"microsoft/phi-4-multimodal-instruct": {
				"input": 0,
				"output": 0
			}
		},
		"pioneer": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"qwen3.7-max": {
				"input": 1.25,
				"output": 3.75,
				"cacheRead": .25,
				"cacheWrite": 1.5625
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02,
				"cacheWrite": .2
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25,
				"cacheWrite": 2.5
			},
			"ministral-3b": {
				"input": .1,
				"output": .1,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"magistral-medium": {
				"input": 2,
				"output": 5,
				"cacheRead": 2,
				"cacheWrite": 2
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025,
				"cacheWrite": .25
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-3-7-sonnet-latest": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175,
				"cacheWrite": 1.75
			},
			"gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .05,
				"cacheWrite": .1
			},
			"mistral-medium-3.5": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": 1.5,
				"cacheWrite": 1.5
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005,
				"cacheWrite": .05
			},
			"claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gemini-3.6-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15,
				"cacheWrite": 1.5
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .3
			},
			"claude-opus-4-1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5,
				"cacheWrite": 2
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125,
				"cacheWrite": 1.25
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075,
				"cacheWrite": .15
			},
			"gemini-3-flash": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .083333
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": .083333
			},
			"qwen3.6-flash": {
				"input": .1875,
				"output": 1.125,
				"cacheRead": .0375,
				"cacheWrite": .234375
			},
			"mistral-large-3": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .5,
				"cacheWrite": .5
			},
			"claude-fable-5": {
				"input": 11,
				"output": 55,
				"cacheRead": 1.1,
				"cacheWrite": 13.75
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075,
				"cacheWrite": .75
			},
			"gpt-5.6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"devstral-small-2": {
				"input": .1,
				"output": .3,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"devstral-2": {
				"input": .4,
				"output": 2,
				"cacheRead": .4,
				"cacheWrite": .4
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 5
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": 1,
				"cacheWrite": 2
			},
			"mistral-medium": {
				"input": .4,
				"output": 2,
				"cacheRead": .4,
				"cacheWrite": .4
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"qwen3.6-max-preview": {
				"input": 1.04,
				"output": 6.24,
				"cacheRead": .208,
				"cacheWrite": 1.3
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .2,
				"cacheWrite": .4
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-opus-5-fast": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"qwen3.6-plus": {
				"input": .325,
				"output": 1.95,
				"cacheRead": .065,
				"cacheWrite": .40625
			},
			"gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"ministral-14b": {
				"input": .2,
				"output": .2,
				"cacheRead": .2,
				"cacheWrite": .2
			},
			"gemini-3.1-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"qwen3.7-plus": {
				"input": .32,
				"output": 1.28,
				"cacheRead": .064,
				"cacheWrite": .4
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .03,
				"cacheWrite": .25
			},
			"poolside/laguna-s-2.1": {
				"input": .1,
				"output": .2,
				"cacheRead": .01,
				"cacheWrite": .1
			},
			"meta-llama/Llama-3.2-1B-Instruct": {
				"input": .1,
				"output": .201,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"meta-llama/Llama-3.2-3B-Instruct": {
				"input": .1,
				"output": .335,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"meta-llama/Llama-3.1-8B-Instruct": {
				"input": .2,
				"output": .2,
				"cacheRead": .2,
				"cacheWrite": .2
			},
			"meta-llama/Llama-3.2-3B": {
				"input": .1,
				"output": .1,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"meta-llama/Llama-3.2-1B": {
				"input": .1,
				"output": .1,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"meta-llama/Llama-3.3-70B-Instruct": {
				"input": .9,
				"output": .9,
				"cacheRead": .9,
				"cacheWrite": .9
			},
			"XiaomiMiMo/MiMo-V2.5-Pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036,
				"cacheWrite": .435
			},
			"XiaomiMiMo/MiMo-V2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028,
				"cacheWrite": .14
			},
			"thinkingmachines/inkling-small": {
				"input": .5,
				"output": 1.2,
				"cacheRead": .1,
				"cacheWrite": .5
			},
			"meta/muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15,
				"cacheWrite": 1.25
			},
			"HuggingFaceTB/SmolLM3-3B-Base": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"google/diffusiongemma-26B-A4B-it": {
				"input": .5,
				"output": .5,
				"cacheRead": .5,
				"cacheWrite": .5
			},
			"google/gemma-4-12B-it": {
				"input": .25,
				"output": .25,
				"cacheRead": .25,
				"cacheWrite": .25
			},
			"google/gemma-4-E2B-it": {
				"input": .1,
				"output": .1,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"google/gemma-3-4b-pt": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"google/gemma-4-31B-it": {
				"input": .5,
				"output": .5,
				"cacheRead": .5,
				"cacheWrite": .5
			},
			"google/gemma-4-E4B-it": {
				"input": .2,
				"output": .2,
				"cacheRead": .2,
				"cacheWrite": .2
			},
			"Qwen/Qwen3-4B-Instruct-2507": {
				"input": .2,
				"output": .2,
				"cacheRead": .2,
				"cacheWrite": .2
			},
			"Qwen/Qwen2.5-Coder-0.5B": {
				"input": .1,
				"output": .1,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"Qwen/Qwen3-1.7B-Base": {
				"input": .1,
				"output": .1,
				"cacheRead": .1,
				"cacheWrite": .1
			},
			"Qwen/Qwen3.6-35B-A3B": {
				"input": .14,
				"output": 1,
				"cacheRead": .028,
				"cacheWrite": .175
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": 1.2,
				"output": 1.2,
				"cacheRead": 1.2,
				"cacheWrite": 1.2
			},
			"Qwen/Qwen3-8B": {
				"input": .2,
				"output": .2,
				"cacheRead": .2,
				"cacheWrite": .2
			},
			"Qwen/Qwen3-4B-Base": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"Qwen/Qwen3-32B": {
				"input": .9,
				"output": .9,
				"cacheRead": .9,
				"cacheWrite": .9
			},
			"Qwen/Qwen3.5-9B": {
				"input": .3,
				"output": .3,
				"cacheRead": .3,
				"cacheWrite": .3
			},
			"Qwen/Qwen3.6-27B": {
				"input": .6,
				"output": .6,
				"cacheRead": .6,
				"cacheWrite": .6
			},
			"LiquidAI/LFM2-24B-A2B": {
				"input": .03,
				"output": .12,
				"cacheRead": .03,
				"cacheWrite": .03
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .56,
				"output": 1.68,
				"cacheRead": .56,
				"cacheWrite": .56
			},
			"deepseek-ai/DeepSeek-V4-Flash": {
				"input": .1,
				"output": .2,
				"cacheRead": .0197,
				"cacheWrite": .1
			},
			"deepseek-ai/DeepSeek-V4-Pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625,
				"cacheWrite": .435
			},
			"deepseek-ai/DeepSeek-V3": {
				"input": .27,
				"output": 1.12,
				"cacheRead": .135,
				"cacheWrite": .27
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .3
			},
			"MiniMaxAI/MiniMax-M2.7": {
				"input": .279,
				"output": 1.2,
				"cacheRead": .279,
				"cacheWrite": .279
			},
			"mistralai/Mistral-Small-4-119B-2603": {
				"input": .15,
				"output": .6,
				"cacheRead": .015,
				"cacheWrite": .15
			},
			"mistralai/Pixtral-12B-2409": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"mistralai/Mistral-Nemo-Instruct-2407": {
				"input": .02,
				"output": .03,
				"cacheRead": .02,
				"cacheWrite": .02
			},
			"mistralai/Magistral-Small-2506": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .5,
				"cacheWrite": .5
			},
			"mistralai/Ministral-8B-Instruct-2410": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"mistralai/Codestral-22B-v0.1": {
				"input": .3,
				"output": .9,
				"cacheRead": .3,
				"cacheWrite": .3
			},
			"mistralai/Mistral-7B-Instruct-v0.3": {
				"input": .2,
				"output": .2,
				"cacheRead": .2,
				"cacheWrite": .2
			},
			"sakana/fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 5
			},
			"moonshotai/Kimi-K2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .34,
				"cacheWrite": .95
			},
			"moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3
			},
			"moonshotai/Kimi-K3-Fast": {
				"input": 4.5,
				"output": 22.5,
				"cacheRead": .45,
				"cacheWrite": 4.5
			},
			"moonshotai/Kimi-K2.7-Code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19,
				"cacheWrite": .95
			},
			"zai-org/GLM-5.1": {
				"input": .98,
				"output": 3.08,
				"cacheRead": .182,
				"cacheWrite": .98
			},
			"zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 1.4
			},
			"zai-org/GLM-5.2-Fast": {
				"input": 2.1,
				"output": 6.6,
				"cacheRead": .21,
				"cacheWrite": 2.1
			},
			"nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16": {
				"input": .05,
				"output": .2,
				"cacheRead": .05,
				"cacheWrite": .05
			},
			"nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16": {
				"input": .5,
				"output": .5,
				"cacheRead": .5,
				"cacheWrite": .5
			},
			"nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16": {
				"input": .5,
				"output": 2.5,
				"cacheRead": .15,
				"cacheWrite": .5
			},
			"nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-FP8": {
				"input": .09,
				"output": .45,
				"cacheRead": .09,
				"cacheWrite": .09
			},
			"fastino/gliner2-multi-v1": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"fastino/gliner2.5-base-v1": {
				"input": .03,
				"output": 0,
				"cacheRead": .03,
				"cacheWrite": .03
			},
			"fastino/gliner2-privacy-filter-PII-multi": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"fastino/gliner2.5-multi-v1": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"fastino/gliguard-LLMGuardrails-300M": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"fastino/gliner2-large-v1": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"fastino/gliner2-base-v1": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"fastino/gliguard-PII-multi": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"fastino/gliner2-multi-large-v1": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"fastino/GLiNER-2.5-Decide": {
				"input": .15,
				"output": .15,
				"cacheRead": .15,
				"cacheWrite": .15
			},
			"openai/gpt-oss-20b": {
				"input": .07,
				"output": .3,
				"cacheRead": .035,
				"cacheWrite": .07
			},
			"openai/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .015,
				"cacheWrite": .15
			}
		},
		"xiaomi": {
			"mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"mimo-v2-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"mimo-v2-omni": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"mimo-v2.6-pro-ultraspeed": {
				"input": 4.35,
				"output": 8.7,
				"cacheRead": .036
			},
			"mimo-v2-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"mimo-v2.5-pro-ultraspeed": {
				"input": 1.305,
				"output": 2.61,
				"cacheRead": .0108
			}
		},
		"xiaomi-token-plan-sgp": {
			"mimo-v2.6-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.6-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.5-tts-voiceclone": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2-tts": {
				"input": 0,
				"output": 0
			},
			"mimo-v2-pro": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.5-tts": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5-tts-voicedesign": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			}
		},
		"minimax": {
			"MiniMax-M3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"MiniMax-M2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"MiniMax-M2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"MiniMax-M2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"MiniMax-M2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"MiniMax-M2": {
				"input": .3,
				"output": 1.2
			},
			"MiniMax-M2.5-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			}
		},
		"github-copilot": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"mai-code-1-flash-picker": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"mai-code-1.1-flash": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02
			},
			"gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-5.5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"claude-sonnet-4.6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			}
		},
		"inferx": {
			"gemma-4-31B-it-fp8": {
				"input": 0,
				"output": 0
			},
			"Qwen3.6-35B-A3B-fp8-no-thinking": {
				"input": 0,
				"output": 0
			},
			"Devstral-2-123B-Instruct-2512-int4-AutoRound": {
				"input": 0,
				"output": 0
			},
			"Qwen3.6-27B-FP8": {
				"input": 0,
				"output": 0
			},
			"Qwen3-Coder-Next-FP8": {
				"input": 0,
				"output": 0
			},
			"Qwen3-Coder-Next-FP8-no-thinking": {
				"input": 0,
				"output": 0
			},
			"mimo-v25": {
				"input": 0,
				"output": 0
			},
			"Qwen3-Embedding-8B": {
				"input": 0,
				"output": 0
			},
			"Qwen3.6-35B-A3B-FP8": {
				"input": 0,
				"output": 0
			},
			"Ornith-1.0-35B-FP8": {
				"input": 0,
				"output": 0
			},
			"Agents-A1": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-flash": {
				"input": 0,
				"output": 0
			}
		},
		"opencode-go": {
			"mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"longcat-2.5-preview-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"deepseek-v4-flash-vision-exp": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"longcat-2.0": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"space-bunny-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"hy3": {
				"input": .14,
				"output": .58,
				"cacheRead": .035
			},
			"muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"deepseek-v4-pro": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .022
			},
			"qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .04,
				"cacheWrite": .5
			},
			"deepseek-v4-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			}
		},
		"openreason": {
			"deepseek-ai/deepseek-v4-flash-0731": {
				"input": .1371,
				"output": .2743
			},
			"moonshotai/kimi-k2.7-code": {
				"input": 1.0022,
				"output": 4.22
			},
			"openai/gpt-oss-120b": {
				"input": .1055,
				"output": .422
			}
		},
		"lmstudio": {
			"qwen/qwen3-30b-a3b-2507": {
				"input": 0,
				"output": 0
			},
			"qwen/qwen3-coder-30b": {
				"input": 0,
				"output": 0
			},
			"openai/gpt-oss-20b": {
				"input": 0,
				"output": 0
			}
		},
		"aki-io": {
			"qwen3.8-27b": {
				"input": .3,
				"output": 2.2,
				"cacheRead": .1
			},
			"deepseek-v4-flash-0731-284b": {
				"input": .2,
				"output": .5,
				"cacheRead": .1
			},
			"qwen3.6-35b": {
				"input": .15,
				"output": .5
			},
			"glm5.3-754b": {
				"input": 1,
				"output": 3.5,
				"cacheRead": .25
			},
			"mistral4-119b": {
				"input": .2,
				"output": .6
			},
			"gpt-oss-120b": {
				"input": .15,
				"output": .55
			},
			"gemma4-26b": {
				"input": .1,
				"output": .5
			}
		},
		"tensorx": {
			"deepseek/deepseek-v4-flash-0731": {
				"input": .25,
				"output": .3,
				"cacheRead": .06
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .13
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": 2,
				"output": 4,
				"cacheRead": .5
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.75,
				"output": 3.5,
				"cacheRead": .4375,
				"cacheWrite": 2.185
			},
			"deepseek/deepseek-r1-0528": {
				"input": .66,
				"output": 2.6,
				"cacheRead": .165,
				"cacheWrite": .825
			},
			"deepseek/deepseek-v3.2": {
				"input": .3,
				"output": .5,
				"cacheRead": .075,
				"cacheWrite": .375
			},
			"z-ai/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .3,
				"cacheWrite": 1.5
			},
			"z-ai/glm-5.3-flash": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"z-ai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .25,
				"cacheWrite": 1.25
			},
			"z-ai/glm-5.2": {
				"input": 1.5,
				"output": 4.5,
				"cacheRead": .375
			},
			"z-ai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .35,
				"cacheWrite": 1.75
			},
			"z-ai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .3,
				"cacheWrite": 1.5
			},
			"z-ai/glm-5.3": {
				"input": 1.75,
				"output": 4.5,
				"cacheRead": .44
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .75
			},
			"moonshotai/kimi-k2.6": {
				"input": 1,
				"output": 4,
				"cacheRead": .25,
				"cacheWrite": 1.25
			},
			"moonshotai/kimi-k2.5": {
				"input": .5,
				"output": 2.8,
				"cacheRead": .125,
				"cacheWrite": .625
			},
			"moonshotai/kimi-k2.7-code": {
				"input": 1.25,
				"output": 4.5,
				"cacheRead": .3125
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .075,
				"cacheWrite": .375
			},
			"minimax/minimax-m3": {
				"input": .4,
				"output": 2,
				"cacheRead": .1
			},
			"qwen/qwen3-235b-a22b-2507": {
				"input": .072,
				"output": .464,
				"cacheRead": .018,
				"cacheWrite": .09
			},
			"qwen/qwen3.8-27b": {
				"input": .4,
				"output": 2.4,
				"cacheRead": .1
			},
			"qwen/qwen3.8-2.4t-a95b": {
				"input": 2.5,
				"output": 6,
				"cacheRead": .63
			},
			"qwen/qwen3.5-122b-a10b": {
				"input": .5,
				"output": 3.5,
				"cacheRead": .125,
				"cacheWrite": .625
			},
			"qwen/qwen3.5-9b": {
				"input": .15,
				"output": .2,
				"cacheRead": .0375,
				"cacheWrite": .1875
			},
			"qwen/qwen3.8-flash-next": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			}
		},
		"longcat": { "LongCat-2.0": {
			"input": .75,
			"output": 2.95,
			"cacheRead": .015
		} },
		"pareto": { "z-ai/glm-5.3-flash": {
			"input": .03,
			"output": .1,
			"cacheRead": .006
		} },
		"chutes": {
			"Nemotron-3-Nano-Omni-30B-TEE": {
				"input": .0245,
				"output": .0978,
				"cacheRead": .0024499999999999995
			},
			"unsloth/Mistral-Nemo-Instruct-2407-TEE": {
				"input": .0245,
				"output": .0978,
				"cacheRead": .0024499999999999995
			},
			"google/gemma-4-31B-turbo-TEE": {
				"input": .12,
				"output": .37,
				"cacheRead": .011999999999999997
			},
			"Qwen/Qwen3-32B-TEE": {
				"input": .104,
				"output": .416,
				"cacheRead": .010399999999999998
			},
			"Qwen/Qwen3.6-27B-TEE": {
				"input": .3,
				"output": 2,
				"cacheRead": .029999999999999992
			},
			"Qwen/Qwen3-235B-A22B-Thinking-2507-TEE": {
				"input": .2989,
				"output": 1.1957,
				"cacheRead": .029889999999999993
			},
			"Qwen/Qwen3.8-27B-TEE": {
				"input": .24,
				"output": 2.2,
				"cacheRead": .023999999999999994
			},
			"Qwen/Qwen3.5-397B-A17B-TEE": {
				"input": .45,
				"output": 3,
				"cacheRead": .04499999999999999
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731-TEE": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .04399999999999999
			},
			"deepseek-ai/DeepSeek-V3.2-TEE": {
				"input": 1,
				"output": 1,
				"cacheRead": .09999999999999998
			},
			"moonshotai/Kimi-K3-TEE": {
				"input": 3,
				"output": 15,
				"cacheRead": .29999999999999993
			},
			"moonshotai/Kimi-K2.6-TEE": {
				"input": .5,
				"output": 2.85,
				"cacheRead": .04999999999999999
			},
			"zai-org/GLM-5.2-TEE": {
				"input": 1.25,
				"output": 3.95,
				"cacheRead": .12499999999999997
			},
			"zai-org/GLM-5.1-TEE": {
				"input": .98,
				"output": 3.08,
				"cacheRead": .09799999999999998
			}
		},
		"edenai": {
			"deepinfra/nemotron-3-ultra-550b-a55b": {
				"input": .5,
				"output": 2.2,
				"cacheRead": .1
			},
			"deepinfra/meta-models/Muse-Glimmer-30B": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .04
			},
			"deepinfra/tencent/Hy3": {
				"input": .13,
				"output": .53,
				"cacheRead": .033
			},
			"deepinfra/tencent/Hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"deepinfra/meta-llama/Llama-Guard-3-8B": {
				"input": .055,
				"output": .055
			},
			"deepinfra/meta-llama/Llama-3.2-11B-Vision-Instruct": {
				"input": .345,
				"output": .345
			},
			"deepinfra/meta-llama/Llama-3.3-70B-Instruct": {
				"input": .1,
				"output": .32
			},
			"deepinfra/thinkingmachines/Inkling-Small": {
				"input": .45,
				"output": 1.2,
				"cacheRead": .1
			},
			"deepinfra/thinkingmachines/Inkling": {
				"input": .95,
				"output": 4.05,
				"cacheRead": .16
			},
			"deepinfra/google/gemma-3-27b-it": {
				"input": .08,
				"output": .16
			},
			"deepinfra/google/gemma-3-12b-it": {
				"input": .05,
				"output": .15
			},
			"deepinfra/google/gemma-3-4b-it": {
				"input": .05,
				"output": .1
			},
			"deepinfra/deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .06,
				"output": .18,
				"cacheRead": .015
			},
			"deepinfra/deepseek-ai/DeepSeek-R1": {
				"input": .7,
				"output": 2.4
			},
			"deepinfra/deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.3,
				"output": 2.6,
				"cacheRead": .1
			},
			"deepinfra/deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .2,
				"output": .6,
				"cacheRead": .006
			},
			"deepinfra/deepseek-ai/DeepSeek-V3": {
				"input": .32,
				"output": .89
			},
			"deepinfra/deepseek-ai/DeepSeek-V3-0324": {
				"input": .24,
				"output": .9,
				"cacheRead": .135
			},
			"deepinfra/stepfun-ai/Step-3.7-Flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"deepinfra/stepfun-ai/Step-3.5-Flash": {
				"input": .09,
				"output": .3,
				"cacheRead": .02
			},
			"deepinfra/moonshotai/Kimi-K2.5": {
				"input": .45,
				"output": 2.25,
				"cacheRead": .07
			},
			"deepinfra/zai-org/GLM-4.7-Flash": {
				"input": .06,
				"output": .4,
				"cacheRead": .01
			},
			"deepinfra/nvidia/Nemotron-3-Nano-30B-A3B": {
				"input": .05,
				"output": .2,
				"cacheRead": .025
			},
			"deepinfra/nvidia/Llama-3.1-Nemotron-70B-Instruct": {
				"input": .6,
				"output": .6
			},
			"deepinfra/ByteDance/Seed-2.0-code": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"deepinfra/ByteDance/Seed-2.0-mini": {
				"input": .1,
				"output": .4,
				"cacheRead": .02
			},
			"deepinfra/openai/gpt-oss-20b": {
				"input": .03,
				"output": .14
			},
			"deepinfra/openai/gpt-oss-120b": {
				"input": .037,
				"output": .17
			},
			"cerebras/gpt-oss-120b": {
				"input": .35,
				"output": .75,
				"cacheRead": .35
			},
			"groq/openai/gpt-oss-20b": {
				"input": .075,
				"output": .3,
				"cacheRead": .0375
			},
			"groq/openai/gpt-oss-safeguard-20b": {
				"input": .075,
				"output": .3,
				"cacheRead": .0375
			},
			"groq/openai/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"zai/glm-4.6v": {
				"input": .3,
				"output": .9,
				"cacheRead": .05
			},
			"zai/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"zai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"zai/glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"zai/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11
			},
			"zai/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"zai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"anthropic/claude-opus-latest": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-sonnet-latest": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-fable-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"cohere/command-r-08-2024": {
				"input": .15,
				"output": .6
			},
			"cohere/command-a-03-2025": {
				"input": 2.5,
				"output": 10
			},
			"cohere/command-r7b-12-2024": {
				"input": .0375,
				"output": .15
			},
			"cohere/command-r-plus-08-2024": {
				"input": 2.5,
				"output": 10
			},
			"cohere/c4ai-aya-expanse-32b": {
				"input": .5,
				"output": 1.5
			},
			"deepseek/deepseek-v4-flash-vision-exp": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"deepseek/deepseek-chat": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"deepseek/deepseek-v4-pro": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .022
			},
			"deepseek/deepseek-v4-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .003
			},
			"databricks/databricks-inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .1,
				"cacheWrite": 1.00002
			},
			"databricks/databricks-gpt-oss-20b": {
				"input": .07,
				"output": .30002,
				"cacheRead": .007,
				"cacheWrite": .07
			},
			"databricks/databricks-deepseek-v4-flash-0731": {
				"input": .14,
				"output": .28,
				"cacheRead": .014,
				"cacheWrite": .14
			},
			"databricks/databricks-gpt-oss-120b@eu": {
				"input": .15001,
				"output": .59997,
				"cacheRead": .015001,
				"cacheWrite": .15001
			},
			"databricks/databricks-gpt-oss-120b": {
				"input": .15001,
				"output": .59997,
				"cacheRead": .015001,
				"cacheWrite": .15001
			},
			"databricks/databricks-deepseek-v4-pro-0813": {
				"input": 1.32,
				"output": 3.959999,
				"cacheRead": .132,
				"cacheWrite": 1.31999
			},
			"databricks/databricks-gpt-oss-20b@eu": {
				"input": .07,
				"output": .30002,
				"cacheRead": .007,
				"cacheWrite": .07
			},
			"tencent/deepseek-v4-pro-0813": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .022
			},
			"tencent/hy3": {
				"input": .132,
				"output": .528,
				"cacheRead": .033
			},
			"tencent/hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"together_ai/meta-models/Muse-Glimmer-30B": {
				"input": .35,
				"output": 1.5,
				"cacheRead": .04
			},
			"together_ai/thinkingmachines/Inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"together_ai/deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .14,
				"output": .28,
				"cacheRead": .03
			},
			"together_ai/deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .13
			},
			"together_ai/deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"together_ai/openai/gpt-oss-120b": {
				"input": .15,
				"output": .6
			},
			"azure/gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"azure/gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"azure/gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"azure/gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"flexai/DeepSeek-V4-Flash-0731": {
				"input": .06,
				"output": .18,
				"cacheRead": .009
			},
			"flexai/gpt-oss-20b": {
				"input": .02,
				"output": .1,
				"cacheRead": .003
			},
			"flexai/gpt-oss-120b": {
				"input": .03,
				"output": .17,
				"cacheRead": .0045
			},
			"google/gemini-flash-latest": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-3.1-flash-image-preview": {
				"input": .5,
				"output": 3
			},
			"google/gemini-2.5-flash-image": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"google/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-3-pro-image-preview": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"google/gemini-3.1-flash-image": {
				"input": .5,
				"output": 3
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"reasoning": 9,
				"cacheRead": .15,
				"cacheWrite": .083333
			},
			"google/gemini-3-pro-image": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3.1-flash-lite-image": {
				"input": .25,
				"output": 1.5
			},
			"google/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"reasoning": 3,
				"cacheRead": .05,
				"cacheWrite": .083333
			},
			"google/gemini-pro-latest": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"google/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"google/gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5,
				"reasoning": 1.5,
				"cacheRead": .025,
				"cacheWrite": .083333
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"reasoning": 1.5,
				"cacheRead": .025,
				"cacheWrite": .083333
			},
			"xai/grok-latest": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"xai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"xai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.20-0309-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"xai/grok-4.20-0309-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"xai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"nebius/google/gemma-3-27b-it": {
				"input": .1,
				"output": .3,
				"cacheRead": .1
			},
			"nebius/deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .14,
				"output": .28,
				"cacheRead": .14
			},
			"nebius/deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": 1.32
			},
			"nebius/deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .3
			},
			"nebius/nvidia/nemotron-3-super-120b-a12b": {
				"input": .3,
				"output": .9,
				"cacheRead": .3
			},
			"nebius/nvidia/Nemotron-3-Ultra-550b-a55b": {
				"input": 1,
				"output": 3,
				"cacheRead": 1
			},
			"nebius/openai/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .15
			},
			"scaleway/gemma-3-27b-it": {
				"input": .287125,
				"output": .57425
			},
			"scaleway/deepseek-v4-flash-0731": {
				"input": .449,
				"output": .898,
				"cacheRead": .0898
			},
			"scaleway/llama-3.3-70b-instruct": {
				"input": 1.01025,
				"output": 1.01025
			},
			"scaleway/gpt-oss-120b": {
				"input": .168375,
				"output": .6735
			},
			"ionos/meta-llama/Llama-3.3-70B-Instruct": {
				"input": .729625,
				"output": .729625
			},
			"ionos/openai/gpt-oss-120b": {
				"input": .168375,
				"output": .729625
			},
			"vertex/gemini-flash-latest": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-2.5-flash-image": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"vertex/gemini-3.1-flash-lite@eu": {
				"input": .25,
				"output": 1.5,
				"reasoning": 1.5,
				"cacheRead": .025,
				"cacheWrite": .083333
			},
			"vertex/gemini-3.5-flash-lite@eu": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"vertex/gemini-3.6-flash@eu": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"vertex/gemini-3.1-flash-image": {
				"input": .5,
				"output": 3
			},
			"vertex/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"vertex/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"reasoning": 9,
				"cacheRead": .15,
				"cacheWrite": .083333
			},
			"vertex/gemini-3-pro-image": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"vertex/gemini-3.7-flash@us": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.7-flash@eu": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.1-flash-lite-image": {
				"input": .25,
				"output": 1.5
			},
			"vertex/gemini-3.8-flash@eu": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.6-flash@us": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.5-flash-lite@us": {
				"input": .3,
				"output": 2.5,
				"reasoning": 2.5,
				"cacheRead": .03,
				"cacheWrite": .083333
			},
			"vertex/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"reasoning": 3,
				"cacheRead": .05,
				"cacheWrite": .083333
			},
			"vertex/gemini-3.1-flash-lite@us": {
				"input": .25,
				"output": 1.5,
				"reasoning": 1.5,
				"cacheRead": .025,
				"cacheWrite": .083333
			},
			"vertex/gemini-pro-latest": {
				"input": 2,
				"output": 12,
				"reasoning": 12,
				"cacheRead": .2,
				"cacheWrite": .375
			},
			"vertex/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.5-flash@eu": {
				"input": 1.5,
				"output": 9,
				"reasoning": 9,
				"cacheRead": .15,
				"cacheWrite": .083333
			},
			"vertex/gemini-3.8-flash@us": {
				"input": .75,
				"output": 3.75,
				"reasoning": 3.75,
				"cacheRead": .075,
				"cacheWrite": .041667
			},
			"vertex/gemini-3.5-flash@us": {
				"input": 1.5,
				"output": 9,
				"reasoning": 9,
				"cacheRead": .15,
				"cacheWrite": .083333
			},
			"vertex/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"reasoning": 1.5,
				"cacheRead": .025,
				"cacheWrite": .083333
			},
			"perplexityai/sonar-pro": {
				"input": 3,
				"output": 15
			},
			"perplexityai/sonar-deep-research": {
				"input": 2,
				"output": 8,
				"reasoning": 3
			},
			"perplexityai/sonar": {
				"input": 1,
				"output": 1
			},
			"perplexityai/sonar-reasoning-pro": {
				"input": 2,
				"output": 8
			},
			"cloudflare/@cf/meta/llama-guard-3-8b": {
				"input": .484,
				"output": .03
			},
			"cloudflare/@cf/aisingapore/gemma-sea-lion-v4-27b-it": {
				"input": .351,
				"output": .555
			},
			"cloudflare/@cf/deepseek-ai/deepseek-v4-flash-0731": {
				"input": .44,
				"output": 1.32,
				"cacheRead": .014
			},
			"cloudflare/@cf/deepseek-ai/deepseek-v4-pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"cloudflare/@cf/zai-org/glm-4.7-flash": {
				"input": .0605,
				"output": .4
			},
			"cloudflare/@cf/qwen/qwen2.5-coder-32b-instruct": {
				"input": .66,
				"output": 1
			},
			"cloudflare/@cf/openai/gpt-oss-20b": {
				"input": .2,
				"output": .3
			},
			"cloudflare/@cf/openai/gpt-oss-120b": {
				"input": .35,
				"output": .75
			},
			"minimax/MiniMax-M3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/MiniMax-M2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/MiniMax-M2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"minimax/MiniMax-M2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/MiniMax-M2": {
				"input": .3,
				"output": 1.2
			},
			"tensorx/deepseek/deepseek-v4-flash-0731": {
				"input": .25,
				"output": .3,
				"cacheRead": .0625
			},
			"tensorx/deepseek/deepseek-v4.1-flash": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .125
			},
			"tensorx/deepseek/deepseek-v4-pro-0813": {
				"input": 2,
				"output": 4,
				"cacheRead": .5
			},
			"tensorx/moonshotai/kimi-k2.5": {
				"input": .5,
				"output": 2.8,
				"cacheRead": .125
			},
			"amazon/google.gemma-3-12b-it": {
				"input": .09,
				"output": .29
			},
			"amazon/google.gemma-3-4b-it": {
				"input": .04,
				"output": .08
			},
			"amazon/openai.gpt-oss-safeguard-20b@us": {
				"input": .07,
				"output": .2
			},
			"amazon/openai.gpt-oss-safeguard-20b": {
				"input": .07,
				"output": .2
			},
			"amazon/amazon.nova-lite-v1:0@us": {
				"input": .06,
				"output": .24,
				"cacheRead": .015
			},
			"amazon/mistral.voxtral-mini-3b-2507@us": {
				"input": .04,
				"output": .04
			},
			"amazon/amazon.nova-micro-v1:0": {
				"input": .035,
				"output": .14,
				"cacheRead": .00875
			},
			"amazon/amazon.nova-pro-v1:0": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .2
			},
			"amazon/mistral.voxtral-small-24b-2507": {
				"input": .1,
				"output": .3
			},
			"amazon/amazon.nova-lite-v1:0": {
				"input": .06,
				"output": .24,
				"cacheRead": .015
			},
			"amazon/mistral.voxtral-small-24b-2507@us": {
				"input": .1,
				"output": .3
			},
			"amazon/google.gemma-3-12b-it@us": {
				"input": .09,
				"output": .29
			},
			"amazon/google.gemma-3-27b-it": {
				"input": .23,
				"output": .38
			},
			"amazon/google.gemma-3-27b-it@us": {
				"input": .23,
				"output": .38
			},
			"amazon/mistral.pixtral-large-2502-v1:0": {
				"input": 2,
				"output": 6
			},
			"amazon/amazon.nova-micro-v1:0@us": {
				"input": .035,
				"output": .14,
				"cacheRead": .00875
			},
			"amazon/zai.glm-4.7-flash@us": {
				"input": .07,
				"output": .4
			},
			"amazon/moonshotai.kimi-k2.5": {
				"input": .6,
				"output": 3
			},
			"amazon/amazon.nova-pro-v1:0@us": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .2
			},
			"amazon/mistral.pixtral-large-2502-v1:0@us": {
				"input": 2,
				"output": 6
			},
			"amazon/zai.glm-4.7-flash": {
				"input": .07,
				"output": .4
			},
			"amazon/moonshot.kimi-k2-thinking": {
				"input": .6,
				"output": 2.5
			},
			"amazon/google.gemma-3-4b-it@us": {
				"input": .04,
				"output": .08
			},
			"amazon/mistral.voxtral-mini-3b-2507": {
				"input": .04,
				"output": .04
			},
			"ovhcloud/gpt-oss-20b": {
				"input": .05,
				"output": .18
			},
			"ovhcloud/gpt-oss-120b": {
				"input": .09,
				"output": .47
			},
			"fireworks_ai/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .014
			},
			"fireworks_ai/accounts/fireworks/models/inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"fireworks_ai/accounts/fireworks/models/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"mistral/codestral-latest": {
				"input": .3,
				"output": .9,
				"cacheRead": .03
			},
			"mistral/mistral-large-latest": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"mistral/mistral-small-latest": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"mistral/devstral-medium-latest": {
				"input": .4,
				"output": 2
			},
			"mistral/devstral-2512": {
				"input": .4,
				"output": 2,
				"cacheRead": .04
			},
			"mistral/mistral-medium-2505": {
				"input": .4,
				"output": 2
			},
			"mistral/magistral-medium-latest": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"mistral/mistral-small-2603": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"mistral/mistral-large-2512": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"mistral/voxtral-small-latest": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"mistral/mistral-medium-2604": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"mistral/mistral-medium-latest": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"qwen/qwen3-vl-235b-a22b-instruct": {
				"input": .4,
				"output": 1.6
			},
			"qwen/qwq-plus": {
				"input": .8,
				"output": 2.4
			},
			"qwen/qwen3.8-27b": {
				"input": .5,
				"output": 3,
				"cacheRead": .1,
				"cacheWrite": .625
			},
			"qwen/qwen3-vl-235b-a22b-thinking": {
				"input": .4,
				"output": 4
			},
			"qwen/qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"qwen/deepseek-v4-flash-0731": {
				"input": .22,
				"output": .66,
				"cacheRead": .022
			},
			"qwen/qwen3-235b-a22b-instruct-2507": {
				"input": .23,
				"output": .92
			},
			"qwen/qwen-max": {
				"input": 1.6,
				"output": 6.4,
				"cacheRead": .32
			},
			"qwen/qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.2
			},
			"qwen/qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"qwen/qwen3-coder-next": {
				"input": .3,
				"output": 1.5
			},
			"qwen/deepseek-v4.1-flash": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"qwen/qwen3-coder-next@eu": {
				"input": .3,
				"output": 1.5
			},
			"qwen/qwen3-max": {
				"input": 1.2,
				"output": 6,
				"cacheRead": .24,
				"cacheWrite": 1.5
			},
			"qwen/qwen3-coder-480b-a35b-instruct": {
				"input": 1.5,
				"output": 7.5
			},
			"qwen/qwen3-coder-30b-a3b-instruct": {
				"input": .45,
				"output": 2.25
			},
			"qwen/qwen3.8-omni-flash": {
				"input": .15,
				"output": .47
			},
			"qwen/qwen-vl-max": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .16
			},
			"qwen/qwen3-max@eu": {
				"input": 1.2,
				"output": 6,
				"cacheRead": .24,
				"cacheWrite": 1.5
			},
			"qwen/qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": 1.2
			},
			"qwen/qwen-vl-plus": {
				"input": .21,
				"output": .63,
				"cacheRead": .042
			},
			"qwen/qwen3-coder-flash": {
				"input": .3,
				"output": 1.5,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"qwen/deepseek-v4-pro-0813": {
				"input": .66,
				"output": 1.98,
				"cacheRead": .066
			},
			"qwen/qwen3-coder-plus": {
				"input": 1,
				"output": 5,
				"cacheRead": .2,
				"cacheWrite": 1.25
			},
			"qwen/qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"qwen/qwen3.8-max-0902": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"openai/gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"openai/gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"openai/gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"openai/o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"openai/o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"openai/gpt-4": {
				"input": 30,
				"output": 60
			},
			"openai/gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"openai/gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"openai/o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"openai/gpt-latest": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-4o-2024-08-06": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"openai/o3-pro": {
				"input": 20,
				"output": 80
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai/gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-4o-2024-11-20": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"openai/gpt-mini-latest": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai/gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"openai/o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai/gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai/gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/o1-pro": {
				"input": 150,
				"output": 600
			},
			"openai/gpt-pro-latest": {
				"input": 30,
				"output": 180
			},
			"infomaniak/mistralai/Ministral-3-14B-Instruct-2512": {
				"input": .33675,
				"output": .449
			},
			"moonshot/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshot/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"moonshot/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshot/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			}
		},
		"stepfun": {
			"step-1-32k": {
				"input": 2.05,
				"output": 9.59,
				"cacheRead": .41
			},
			"step-5-preview": {
				"input": .959,
				"output": 2.741,
				"cacheRead": .048
			},
			"step-3.5-flash-2603": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"step-2-16k": {
				"input": 5.21,
				"output": 16.44,
				"cacheRead": 1.04
			},
			"step-3.5-flash": {
				"input": .1,
				"output": .3,
				"cacheRead": .02
			},
			"step-3.7-flash": {
				"input": .185,
				"output": 1.11,
				"cacheRead": .037
			}
		},
		"hpc-ai": {
			"anthropic/claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .145
			},
			"deepseek/deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"moonshotai/kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"moonshotai/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"zai-org/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/glm-5.1": {
				"input": .615,
				"output": 2.46,
				"cacheRead": .133
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			}
		},
		"v0": {
			"v0-1.5-lg": {
				"input": 15,
				"output": 75
			},
			"v0-1.5-md": {
				"input": 3,
				"output": 15
			},
			"v0-1.0-md": {
				"input": 3,
				"output": 15
			}
		},
		"tencent-coding-plan": {
			"hunyuan-2.0-thinking": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"minimax-m2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"hunyuan-2.0-instruct": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"kimi-k2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"tc-code-latest": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"hunyuan-turbos": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"hunyuan-t1": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"tempr": {
			"xiaomi-mimo/mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"xiaomi-mimo/mimo-v2.6-pro-ultraspeed": {
				"input": 4.35,
				"output": 8.7,
				"cacheRead": .036
			},
			"xiaomi-mimo/mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"cerebras/qwen-3.8-27b": {
				"input": .99,
				"output": 1.49
			},
			"cerebras/gpt-oss-120b": {
				"input": .35,
				"output": .75
			},
			"groq/allam-2-7b": {
				"input": 0,
				"output": 0
			},
			"groq/qwen/qwen3.8-27b": {
				"input": .8,
				"output": 4
			},
			"groq/openai/gpt-oss-20b": {
				"input": .075,
				"output": .3,
				"cacheRead": .0375
			},
			"groq/openai/gpt-oss-120b": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"zai/glm-4.6v": {
				"input": .3,
				"output": .9
			},
			"zai/glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"zai/glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24,
				"cacheWrite": 0
			},
			"zai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"zai/glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"zai/glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": 0
			},
			"zai/glm-4.6v-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"zai/glm-4.5v": {
				"input": .6,
				"output": 1.8
			},
			"zai/glm-5.3-flashx": {
				"input": .37,
				"output": 1.25,
				"cacheRead": .075,
				"cacheWrite": 0
			},
			"zai/glm-4.7-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"zai/glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"zai/glm-4.5-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"zai/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"zai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"zai/glm-4.7-flashx": {
				"input": .07,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": 0
			},
			"zai/glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24,
				"cacheWrite": 0
			},
			"zai/glm-4.5-air": {
				"input": .2,
				"output": 1.1,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"zai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"anthropic/claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"deepseek/deepseek-flash": {
				"input": .15,
				"output": .6,
				"reasoning": .6,
				"cacheRead": .003
			},
			"deepseek/deepseek-v4-pro": {
				"input": .66,
				"output": 1.98,
				"reasoning": 1.98,
				"cacheRead": .022
			},
			"google/gemini-flash-latest": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemini-flash-lite-latest": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-embedding-2": {
				"input": .2,
				"output": 0
			},
			"google/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"google/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"google/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"google/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"google/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"google/gemini-embedding-001": {
				"input": .15,
				"output": 0
			},
			"google/gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"xai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"xai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.20-0309-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"xai/grok-4.20-0309-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"xai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"minimax/MiniMax-M3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"minimax/MiniMax-M2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"minimax/MiniMax-M2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"mistral/mistral-large-latest": {
				"input": .5,
				"output": 1.5
			},
			"mistral/mistral-small-latest": {
				"input": .15,
				"output": .6
			},
			"mistral/zai-glm-5-2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"mistral/mistral-embed": {
				"input": .1,
				"output": 0
			},
			"mistral/mistral-small-2603": {
				"input": .15,
				"output": .6
			},
			"mistral/mistral-large-2512": {
				"input": .5,
				"output": 1.5
			},
			"mistral/voxtral-small-latest": {
				"input": .1,
				"output": .3
			},
			"mistral/zai-glm-5-3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"mistral/mistral-medium-2604": {
				"input": 1.5,
				"output": 7.5
			},
			"mistral/mistral-medium-latest": {
				"input": 1.5,
				"output": 7.5
			},
			"moonshot/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshot/kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"moonshot/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"moonshot/kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			}
		},
		"inception": {
			"mercury-edit-2": {
				"input": .25,
				"output": .75,
				"cacheRead": .025
			},
			"mercury-2.5": {
				"input": .04,
				"output": .15,
				"cacheRead": .004
			},
			"mercury-2": {
				"input": .25,
				"output": .75,
				"cacheRead": .025
			}
		},
		"modelis": {
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25
			},
			"deepseek-v4-pro": {
				"input": .435,
				"output": .87
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15
			},
			"deepseek-v4-flash": {
				"input": .0983,
				"output": .1966
			},
			"qwen/qwen3.7-max": {
				"input": 3,
				"output": 9
			},
			"qwen/qwen3.7-plus": {
				"input": .768,
				"output": 3.072
			}
		},
		"opencode": {
			"ling-3.0-flash-fin-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"fledge-alpha-free": {
				"input": 0,
				"output": 0
			},
			"qwen3.6-plus-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-5.4-pro": {
				"input": 30,
				"output": 180,
				"cacheRead": 30
			},
			"mimo-v2-pro-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"muse-spark-1.2-contributor-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"ling-3.1-flash-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"glm-5-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"trinity-large-preview-free": {
				"input": 0,
				"output": 0
			},
			"gpt-5.5-pro": {
				"input": 30,
				"output": 180,
				"cacheRead": 30
			},
			"grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"longcat-2.5-preview-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"ling-3.0-tiny-free": {
				"input": 0,
				"output": 0
			},
			"gpt-5.1-codex": {
				"input": 1.07,
				"output": 8.5,
				"cacheRead": .107
			},
			"glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"kimi-k2.5-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"glm-4.7-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .1
			},
			"laguna-s-2.1-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"gpt-5-codex": {
				"input": 1.07,
				"output": 8.5,
				"cacheRead": .107
			},
			"qwen3-coder": {
				"input": .45,
				"output": 1.8
			},
			"minimax-m3-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"qwen3.5-plus": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"deepseek-v4-flash-vision-exp": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"gemini-3.6-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"kimi-k2-thinking": {
				"input": .4,
				"output": 2.5,
				"cacheRead": .4
			},
			"minimax-m2.5-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gpt-5.3-codex-spark": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"claude-opus-4-1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"ring-2.6-1t-free": {
				"input": 0,
				"output": 0
			},
			"kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .08
			},
			"longcat-2.0-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gpt-5.1": {
				"input": 1.07,
				"output": 8.5,
				"cacheRead": .107
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-3-5-haiku": {
				"input": .8,
				"output": 4,
				"cacheRead": .08,
				"cacheWrite": 1
			},
			"hy3-preview-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gemini-3-flash": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"space-bunny-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"nemotron-3-super-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"minimax-m2.1-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"mimo-v2.6-flash-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gemini-3-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"nemotron-3-ultra-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .1
			},
			"minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"mimo-v2.5-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"grok-code": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"ling-2.6-flash-free": {
				"input": 0,
				"output": 0
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"deepseek-v4-flash-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"hy3-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"nemotron-3.5-lightning-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3.7-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"kimi-k2": {
				"input": .4,
				"output": 2.5,
				"cacheRead": .4
			},
			"glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"mimo-v2-omni-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"ling-3.0-flash-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gemini-3.8-flash": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"north-mini-code-free": {
				"input": 0,
				"output": 0
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.84,
				"cacheRead": .145
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"big-pickle": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"mimo-v2-flash-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"gpt-5": {
				"input": 1.07,
				"output": 8.5,
				"cacheRead": .107
			},
			"grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"gemini-3.1-pro": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"minimax-m2.1": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .1
			},
			"gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"x-preview-f-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"muse-spark-1.3-contributor-free": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			}
		},
		"kenari": {
			"gpt-5-4-mini": {
				"input": 0,
				"output": 0
			},
			"gpt-5-6-luna": {
				"input": 0,
				"output": 0
			},
			"gemma-4-31b-it": {
				"input": 0,
				"output": 0
			},
			"grok-4-5": {
				"input": 0,
				"output": 0
			},
			"gemini-2-5-flash": {
				"input": 0,
				"output": 0
			},
			"nemotron-3-nano-30b-a3b": {
				"input": 0,
				"output": 0
			},
			"glm-5-3-flash": {
				"input": 0,
				"output": 0
			},
			"kimi-k2-7-code": {
				"input": 0,
				"output": 0
			},
			"gpt-5-6-terra": {
				"input": 0,
				"output": 0
			},
			"gemini-2-5-flash-lite": {
				"input": 0,
				"output": 0
			},
			"mimo-v2-5": {
				"input": 0,
				"output": 0
			},
			"grok-build-0-1": {
				"input": 0,
				"output": 0
			},
			"kimi-k3": {
				"input": 0,
				"output": 0
			},
			"glm-4-7-flash:free": {
				"input": 0,
				"output": 0
			},
			"gpt-image-2": {
				"input": 0,
				"output": 0
			},
			"qwen3-8-max": {
				"input": 0,
				"output": 0
			},
			"minimax-m2-7-highspeed": {
				"input": 0,
				"output": 0
			},
			"mimo-v2-5-pro": {
				"input": 0,
				"output": 0
			},
			"nemotron-3-super-120b-a12b": {
				"input": 0,
				"output": 0
			},
			"gemini-3-7-flash": {
				"input": 0,
				"output": 0
			},
			"step-3-7-flash:free": {
				"input": 0,
				"output": 0
			},
			"kimi-k2-6:free": {
				"input": 0,
				"output": 0
			},
			"gpt-5-6-sol": {
				"input": 0,
				"output": 0
			},
			"nemotron-3-ultra-550b-a55b": {
				"input": 0,
				"output": 0
			},
			"gemini-3-1-pro": {
				"input": 0,
				"output": 0
			},
			"glm-5-2": {
				"input": 0,
				"output": 0
			},
			"mistral-large:free": {
				"input": 0,
				"output": 0
			},
			"mimo-v2-5:free": {
				"input": 0,
				"output": 0
			},
			"claude-opus-5": {
				"input": 0,
				"output": 0
			},
			"gpt-oss-20b": {
				"input": 0,
				"output": 0
			},
			"minimax-m2-7": {
				"input": 0,
				"output": 0
			},
			"claude-fable-5": {
				"input": 0,
				"output": 0
			},
			"hy3:free": {
				"input": 0,
				"output": 0
			},
			"kimi-k2-6": {
				"input": 0,
				"output": 0
			},
			"mistral-medium-3-5:free": {
				"input": 0,
				"output": 0
			},
			"minimax-m3": {
				"input": 0,
				"output": 0
			},
			"claude-opus-4-8": {
				"input": 0,
				"output": 0
			},
			"glm-5-3": {
				"input": 0,
				"output": 0
			},
			"claude-sonnet-5": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-1-flash": {
				"input": 0,
				"output": 0
			},
			"qwen3-7-plus": {
				"input": 0,
				"output": 0
			},
			"gemini-3-1-flash-lite": {
				"input": 0,
				"output": 0
			},
			"hy3": {
				"input": 0,
				"output": 0
			},
			"glm-5-1": {
				"input": 0,
				"output": 0
			},
			"nemotron-3-super-120b-a12b:free": {
				"input": 0,
				"output": 0
			},
			"gpt-5-5": {
				"input": 0,
				"output": 0
			},
			"grok-imagine-image-2-0": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-flash:free": {
				"input": 0,
				"output": 0
			},
			"grok-4-6": {
				"input": 0,
				"output": 0
			},
			"whisper-large-v3-turbo": {
				"input": 0,
				"output": 0
			},
			"gemini-3-6-flash": {
				"input": 0,
				"output": 0
			},
			"gemini-3-1-flash-tts": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-pro": {
				"input": 0,
				"output": 0
			},
			"claude-sonnet-4-6": {
				"input": 0,
				"output": 0
			},
			"kimi-k2-7-code:free": {
				"input": 0,
				"output": 0
			},
			"gemini-3-5-flash": {
				"input": 0,
				"output": 0
			},
			"gpt-oss-120b": {
				"input": 0,
				"output": 0
			},
			"claude-opus-4-7": {
				"input": 0,
				"output": 0
			},
			"step-3-7-flash": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-flash": {
				"input": 0,
				"output": 0
			}
		},
		"kimi-code-plan-global": {
			"kimi-for-coding-highspeed": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"kimi-for-coding": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"k3-256k": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"k3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"wafer.ai": {
			"Kimi-K2.6": {
				"input": 1.14,
				"output": 4.8,
				"cacheRead": .19,
				"cacheWrite": 0
			},
			"MiniMax-M3": {
				"input": .33,
				"output": 1.32,
				"cacheRead": .07,
				"cacheWrite": 0
			},
			"GLM-5.1": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .1,
				"cacheWrite": 0
			},
			"GLM-5.2": {
				"input": 1.2,
				"output": 4.1,
				"cacheRead": .2,
				"cacheWrite": 0
			},
			"glm5.2-fast": {
				"input": 3,
				"output": 10.25,
				"cacheRead": .5,
				"cacheWrite": 0
			}
		},
		"zhipuai": {
			"glm-5v-turbo": {
				"input": 5,
				"output": 22,
				"cacheRead": 1.2,
				"cacheWrite": 0
			},
			"glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": 0
			},
			"glm-5.3-flashx": {
				"input": .37,
				"output": 1.25,
				"cacheRead": .075,
				"cacheWrite": 0
			},
			"glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26,
				"cacheWrite": 0
			},
			"glm-4.5-air": {
				"input": .2,
				"output": 1.1,
				"cacheRead": .03,
				"cacheWrite": 0
			},
			"glm-4.7-flashx": {
				"input": .07,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": 0
			},
			"glm-4.5-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.7": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"glm-4.7-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.5v": {
				"input": .6,
				"output": 1.8
			},
			"glm-4.6v-flash": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.6": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"glm-4.6v": {
				"input": .3,
				"output": .9
			}
		},
		"lynkr": { "lynkr-auto": {
			"input": 0,
			"output": 0
		} },
		"meganova": {
			"meta-llama/Llama-3.3-70B-Instruct": {
				"input": .1,
				"output": .3
			},
			"XiaomiMiMo/MiMo-V2-Flash": {
				"input": .1,
				"output": .3
			},
			"Qwen/Qwen3.5-Plus": {
				"input": .4,
				"output": 2.4,
				"reasoning": 2.4
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": .09,
				"output": .6
			},
			"Qwen/Qwen2.5-VL-32B-Instruct": {
				"input": .2,
				"output": .6
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .27,
				"output": 1
			},
			"deepseek-ai/DeepSeek-V3.2": {
				"input": .26,
				"output": .38
			},
			"deepseek-ai/DeepSeek-R1-0528": {
				"input": .5,
				"output": 2.15
			},
			"deepseek-ai/DeepSeek-V3-0324": {
				"input": .25,
				"output": .88
			},
			"deepseek-ai/DeepSeek-V3.2-Exp": {
				"input": .27,
				"output": .4
			},
			"MiniMaxAI/MiniMax-M2.1": {
				"input": .28,
				"output": 1.2
			},
			"MiniMaxAI/MiniMax-M2.5": {
				"input": .3,
				"output": 1.2
			},
			"mistralai/Mistral-Nemo-Instruct-2407": {
				"input": .02,
				"output": .04
			},
			"mistralai/Mistral-Small-3.2-24B-Instruct-2506": {
				"input": 0,
				"output": 0
			},
			"moonshotai/Kimi-K2.5": {
				"input": .45,
				"output": 2.8
			},
			"moonshotai/Kimi-K2-Thinking": {
				"input": .6,
				"output": 2.6
			},
			"zai-org/GLM-4.7": {
				"input": .2,
				"output": .8
			},
			"zai-org/GLM-5": {
				"input": .8,
				"output": 2.56
			},
			"zai-org/GLM-4.6": {
				"input": .45,
				"output": 1.9
			}
		},
		"ovhcloud": {
			"qwen3.8-27b": {
				"input": .47,
				"output": 3.19
			},
			"qwen3guard-gen-8b": {
				"input": 0,
				"output": 0
			},
			"mistral-7b-instruct-v0.3": {
				"input": .11,
				"output": .11
			},
			"qwen3-coder-30b-a3b-instruct": {
				"input": .07,
				"output": .26
			},
			"qwen3guard-gen-0.6b": {
				"input": 0,
				"output": 0
			},
			"gpt-oss-20b": {
				"input": .05,
				"output": .18
			},
			"qwen3.5-9b": {
				"input": .12,
				"output": .18
			},
			"meta-llama-3_3-70b-instruct": {
				"input": .74,
				"output": .74
			},
			"qwen3.5-397b-a17b": {
				"input": .71,
				"output": 4.25
			},
			"qwen2.5-vl-72b-instruct": {
				"input": 1.01,
				"output": 1.01
			},
			"qwen3.6-27b": {
				"input": .47,
				"output": 3.19
			},
			"mistral-small-3.2-24b-instruct-2506": {
				"input": .1,
				"output": .31
			},
			"gpt-oss-120b": {
				"input": .09,
				"output": .47
			},
			"mistral-nemo-instruct-2407": {
				"input": .14,
				"output": .14
			}
		},
		"requesty": {
			"ring-2.6-1t": {
				"input": .3,
				"output": 2.5
			},
			"gpt-5.4": {
				"input": 2.75,
				"output": 16.5,
				"cacheRead": .275
			},
			"nemotron-3-ultra-nvfp4": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .12
			},
			"gpt-6.1-sol@eu": {
				"input": 2.4,
				"output": 12,
				"cacheRead": .12,
				"cacheWrite": 3
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-5.4-pro": {
				"input": 30,
				"output": 180,
				"cacheRead": 30
			},
			"claude-opus-5@eu": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"mimo-v2.6-pro": {
				"input": .43,
				"output": .87,
				"cacheRead": .0036
			},
			"gemma-4-31b-it": {
				"input": 0,
				"output": 0
			},
			"ling-2.6-1t": {
				"input": .3,
				"output": 2.5
			},
			"gpt-4o-mini@eu": {
				"input": .165,
				"output": .66,
				"cacheRead": .0825
			},
			"qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"nemotron-3.5-lightning-30b-a3b": {
				"input": 0,
				"output": 0
			},
			"mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5,
				"cacheWrite": 2
			},
			"mistral-medium-3-5@eu": {
				"input": 1.65,
				"output": 8.25,
				"cacheRead": 1.65
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"gpt-5@eu": {
				"input": 1.375,
				"output": 11,
				"cacheRead": .1375
			},
			"deepseek-v4-flash-0731@eu": {
				"input": .28,
				"output": .56,
				"cacheRead": .07
			},
			"seed-2.0-pro": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"kimi-k3@eu": {
				"input": 3,
				"output": 15,
				"cacheRead": .45
			},
			"seed-1.8": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"glm-5.3-flash": {
				"input": .2,
				"output": .6,
				"cacheRead": .07
			},
			"qwen3.5-27b": {
				"input": .26,
				"output": 2.6
			},
			"mistral-medium-latest@eu": {
				"input": .44,
				"output": 2.2,
				"cacheRead": .44
			},
			"glm-5.2-fast": {
				"input": 2.1,
				"output": 6.6,
				"cacheRead": .21
			},
			"deepseek-v4-flash-0731": {
				"input": .28,
				"output": .56,
				"cacheRead": .07
			},
			"deepseek-v4-pro-0813@eu": {
				"input": 1.75,
				"output": 3.5,
				"cacheRead": .44
			},
			"inkling-256k": {
				"input": 1.87,
				"output": 4.68,
				"cacheRead": .374
			},
			"muse-glimmer-30b": {
				"input": 0,
				"output": 0
			},
			"claude-opus-4-8@eu": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .45
			},
			"claude-fable-5@eu": {
				"input": 11,
				"output": 55,
				"cacheRead": 1.1,
				"cacheWrite": 13.75
			},
			"nemotron-3-nano-omni@eu": {
				"input": .06,
				"output": .24,
				"cacheRead": .06
			},
			"gpt-4.1@eu": {
				"input": 2.2,
				"output": 8.8,
				"cacheRead": .55
			},
			"gemini-3.1-flash-lite@eu": {
				"input": .275,
				"output": 1.65,
				"cacheRead": .0275,
				"cacheWrite": .091663
			},
			"nvidia-nemotron-3-super-120b-a12b": {
				"input": .1,
				"output": .5
			},
			"gemini-3.5-flash-lite@eu": {
				"input": .33,
				"output": 2.75,
				"cacheRead": .033
			},
			"claude-opus-4-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.7-code@eu": {
				"input": 1.25,
				"output": 4.5,
				"cacheRead": .31
			},
			"deepseek-v4.1-flash": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"glm-5.1@eu": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": 1.4
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"claude-haiku-4-5@eu": {
				"input": 1.1,
				"output": 5.5,
				"cacheRead": .11,
				"cacheWrite": 1.375
			},
			"claude-sonnet-4-5@eu": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .3,
				"cacheWrite": 4.125
			},
			"laguna-xs.2": {
				"input": 0,
				"output": 0
			},
			"leanstral-1-5@eu": {
				"input": 0,
				"output": 0
			},
			"claude-sonnet-5-5@eu": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"nemotron-3-super-120b-a12b": {
				"input": 0,
				"output": 0
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"claude-sonnet-4-6@eu": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .3,
				"cacheWrite": 4.125
			},
			"gemini-3.6-flash": {
				"input": 1.5,
				"output": 7,
				"cacheRead": .15
			},
			"gpt-5.5@eu": {
				"input": 5.5,
				"output": 33,
				"cacheRead": .55
			},
			"ling-3.0-tiny": {
				"input": 0,
				"output": 0
			},
			"claude-opus-5-5@eu": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .22,
				"cacheWrite": 5.5
			},
			"gpt-5-mini@eu": {
				"input": .275,
				"output": 2.2,
				"cacheRead": .0275
			},
			"mistral-medium-3-5": {
				"input": 1.65,
				"output": 8.25,
				"cacheRead": 1.65
			},
			"grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2,
				"cacheWrite": 1.25
			},
			"nemotron-3-ultra-550b-a55b": {
				"input": 0,
				"output": 0
			},
			"nemotron-3-nano-omni-30b-a3b-reasoning": {
				"input": 0,
				"output": 0
			},
			"gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"gemma-4-26b-a4b-it": {
				"input": .07,
				"output": .34,
				"cacheRead": .07
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gpt-5.4@eu": {
				"input": 2.75,
				"output": 16.5,
				"cacheRead": .275
			},
			"claude-opus-4-1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"grok-4.2-beta": {
				"input": 2,
				"output": 6,
				"cacheRead": .2,
				"cacheWrite": 2
			},
			"gemini-3.1-flash-image": {
				"input": .5,
				"output": 2
			},
			"nemotron-lightning-3.5-30b-a3b": {
				"input": .05,
				"output": .2,
				"cacheRead": .01
			},
			"gpt-5-nano@eu": {
				"input": .055,
				"output": .44,
				"cacheRead": .0055
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 4.5
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5,
				"cacheWrite": 2
			},
			"seed-2.0-mini": {
				"input": .1,
				"output": .4,
				"cacheRead": .02
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.6@eu": {
				"input": .95,
				"output": 4,
				"cacheRead": .95
			},
			"qwen3.5-2b": {
				"input": .02,
				"output": .1
			},
			"fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"minimax-m2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": 1.2
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": 1.583
			},
			"ling-2.6-flash": {
				"input": .1,
				"output": .3
			},
			"gemini-3-pro-image": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 4.5
			},
			"gemini-3.7-flash@eu": {
				"input": .825,
				"output": 4.125,
				"cacheRead": .0825
			},
			"claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"deepseek-v4-pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"gpt-4.1-nano@eu": {
				"input": .11,
				"output": .44,
				"cacheRead": .0275
			},
			"mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"gpt-5.1@eu": {
				"input": 1.375,
				"output": 11,
				"cacheRead": .1375
			},
			"gemini-2.5-flash-lite@eu": {
				"input": .1,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": .18333
			},
			"nemotron-3-nano-omni": {
				"input": .06,
				"output": .24,
				"cacheRead": .06
			},
			"claude-sonnet-4@eu": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"inkling": {
				"input": 1.87,
				"output": 4.68,
				"cacheRead": .374
			},
			"mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0027
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"deepseek-v4.1-flash@eu": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"qwen3.8-2.4T-A95B@eu": {
				"input": 2.5,
				"output": 6,
				"cacheRead": .63
			},
			"qwen3.8-flash": {
				"input": .16,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"qwen3.8-flash-next": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"qwen3.8-flash-next@eu": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"mistral-small-2603": {
				"input": .165,
				"output": .66,
				"cacheRead": .165
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.5": {
				"input": 5.5,
				"output": 33,
				"cacheRead": .55
			},
			"claude-sonnet-5@eu": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"gemini-3.8-flash@eu": {
				"input": .825,
				"output": 4.125,
				"cacheRead": .0825
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"qwen3.5-35b-a3b": {
				"input": .14,
				"output": 1,
				"cacheRead": .05
			},
			"glm-5.3@eu": {
				"input": 1.2,
				"output": 4.2,
				"cacheRead": .26
			},
			"gemini-2.5-flash@eu": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .075,
				"cacheWrite": .55
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"glm-5.2": {
				"input": .8,
				"output": 2.55,
				"cacheRead": .16
			},
			"hy3": {
				"input": .14,
				"output": .58,
				"cacheRead": .035
			},
			"glm-5.2@eu": {
				"input": 1.2,
				"output": 4.2,
				"cacheRead": .26
			},
			"gpt-5.6-sol@eu": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .44,
				"cacheWrite": 5.5
			},
			"seed-2.0-code": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"devstral-latest@eu": {
				"input": .44,
				"output": 2.2,
				"cacheRead": .44
			},
			"glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"gemini-2.5-pro@eu": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .31,
				"cacheWrite": 2.375
			},
			"gpt-5.6-terra@eu": {
				"input": 2.2,
				"output": 13.2,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .1
			},
			"glm-5.3-flash@eu": {
				"input": .2,
				"output": .6,
				"cacheRead": .07
			},
			"minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": 1.2
			},
			"deepseek-v4-pro@eu": {
				"input": 1.75,
				"output": 3.5,
				"cacheRead": .44
			},
			"devstral-latest": {
				"input": .44,
				"output": 2.2,
				"cacheRead": .44
			},
			"o4-mini@eu": {
				"input": 1.21,
				"output": 4.84,
				"cacheRead": .3025
			},
			"mistral-small-2603@eu": {
				"input": .165,
				"output": .66,
				"cacheRead": .165
			},
			"qwen3.8-2.4T-A95B": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gemini-3.5-flash@eu": {
				"input": 1.65,
				"output": 9.9,
				"cacheRead": .165,
				"cacheWrite": 1.7413
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"nemotron-3.5-content-safety": {
				"input": 0,
				"output": 0
			},
			"deepseek-v4-pro": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"nvidia-nemotron-3-ultra": {
				"input": .5,
				"output": 2.5
			},
			"claude-fable-5.1@eu": {
				"input": 11,
				"output": 55,
				"cacheRead": .275,
				"cacheWrite": 13.75
			},
			"step-3.7-flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"gpt-6-luna@eu": {
				"input": .12,
				"output": .6,
				"cacheRead": .012,
				"cacheWrite": .15
			},
			"claude-opus-4-6@eu": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"leanstral-1-5": {
				"input": 0,
				"output": 0
			},
			"claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"gpt-5.6-luna@eu": {
				"input": .22,
				"output": 1.32,
				"cacheRead": .022,
				"cacheWrite": .275
			},
			"claude-opus-4-7@eu": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"kat-coder-pro": {
				"input": .3,
				"output": 1.2
			},
			"laguna-m.1": {
				"input": 0,
				"output": 0
			},
			"gpt-6-sol@eu": {
				"input": 2.4,
				"output": 12,
				"cacheRead": .24,
				"cacheWrite": 3
			},
			"glm-5.3": {
				"input": 1.2,
				"output": 4.2,
				"cacheRead": .26
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5,
				"cacheWrite": 2
			},
			"minimax-m3@eu": {
				"input": .4,
				"output": 2,
				"cacheRead": .1
			},
			"qwen3.7-plus": {
				"input": .32,
				"output": 1.28,
				"cacheRead": .032,
				"cacheWrite": .4
			},
			"gpt-4.1-mini@eu": {
				"input": .44,
				"output": 1.76,
				"cacheRead": .11
			},
			"gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"claude-opus-4-5@eu": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"deepseek-v4-flash": {
				"input": .28,
				"output": .56,
				"cacheRead": .07
			},
			"mistral-medium-latest": {
				"input": .44,
				"output": 2.2,
				"cacheRead": .44
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .08333
			}
		},
		"mistral": {
			"open-mistral-nemo": {
				"input": .15,
				"output": .15
			},
			"codestral-latest": {
				"input": .3,
				"output": .9,
				"cacheRead": .03
			},
			"mistral-large-2411": {
				"input": 2,
				"output": 6
			},
			"mistral-nemo": {
				"input": .15,
				"output": .15
			},
			"mistral-medium-2508": {
				"input": .4,
				"output": 2
			},
			"mistral-large-latest": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"mistral-small-latest": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"zai-glm-5-2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"ministral-8b-latest": {
				"input": .1,
				"output": .1
			},
			"devstral-medium-latest": {
				"input": .4,
				"output": 2
			},
			"open-mixtral-8x22b": {
				"input": 2,
				"output": 6
			},
			"devstral-2512": {
				"input": .4,
				"output": 2
			},
			"mistral-medium-2505": {
				"input": .4,
				"output": 2
			},
			"magistral-medium-latest": {
				"input": 2,
				"output": 5
			},
			"pixtral-12b": {
				"input": .15,
				"output": .15
			},
			"mistral-embed": {
				"input": .1,
				"output": 0
			},
			"devstral-small-2505": {
				"input": .1,
				"output": .3
			},
			"mistral-small-2603": {
				"input": .15,
				"output": .6,
				"cacheRead": .015
			},
			"devstral-medium-2507": {
				"input": .4,
				"output": 2
			},
			"labs-devstral-small-2512": {
				"input": 0,
				"output": 0
			},
			"mistral-large-2512": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .05
			},
			"devstral-latest": {
				"input": .4,
				"output": 2
			},
			"devstral-small-2507": {
				"input": .1,
				"output": .3
			},
			"pixtral-large-latest": {
				"input": 2,
				"output": 6
			},
			"voxtral-small-latest": {
				"input": .1,
				"output": .3
			},
			"open-mixtral-8x7b": {
				"input": .7,
				"output": .7
			},
			"mistral-small-2506": {
				"input": .1,
				"output": .3
			},
			"zai-glm-5-3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"mistral-medium-2604": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			},
			"open-mistral-7b": {
				"input": .25,
				"output": .25
			},
			"ministral-3b-latest": {
				"input": .04,
				"output": .04
			},
			"mistral-medium-latest": {
				"input": 1.5,
				"output": 7.5,
				"cacheRead": .15
			}
		},
		"amazon-bedrock": {
			"google.gemma-3-12b-it": {
				"input": .09,
				"output": .29
			},
			"google.gemma-3-4b-it": {
				"input": .04,
				"output": .08
			},
			"eu.anthropic.claude-fable-5": {
				"input": 11,
				"output": 55,
				"cacheRead": 1.1,
				"cacheWrite": 13.75
			},
			"qwen.qwen3-coder-480b-a35b-v1:0": {
				"input": .45,
				"output": 1.8
			},
			"google.gemma-4-31b": {
				"input": .14,
				"output": .4
			},
			"us.writer.palmyra-x5-v1:0": {
				"input": .6,
				"output": 6
			},
			"google.gemma-4-e2b": {
				"input": .04,
				"output": .08
			},
			"us.anthropic.claude-opus-4-7": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"global.openai.gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"us.openai.gpt-6.1-sol": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .11,
				"cacheWrite": 2.75
			},
			"eu.amazon.nova-lite-v1:0": {
				"input": .069,
				"output": .276,
				"cacheRead": .01725,
				"cacheWrite": .069
			},
			"global.anthropic.claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"deepseek.r1-v1:0": {
				"input": 1.35,
				"output": 5.4
			},
			"openai.gpt-oss-safeguard-20b": {
				"input": .07,
				"output": .2
			},
			"anthropic.claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"global.anthropic.claude-haiku-4-5-20251001-v1:0": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"eu.amazon.nova-2-lite-v1:0": {
				"input": .374,
				"output": 3.157,
				"cacheRead": .0935,
				"cacheWrite": .374
			},
			"us.amazon.nova-pro-v1:0": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": .8
			},
			"jp.anthropic.claude-opus-5-5": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .22,
				"cacheWrite": 5.5
			},
			"anthropic.claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"global.anthropic.claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai.gpt-5.6-luna": {
				"input": .22,
				"output": 1.32,
				"cacheRead": .022,
				"cacheWrite": .275
			},
			"us.meta.llama4-maverick-17b-instruct-v1:0": {
				"input": .24,
				"output": .97
			},
			"apac.amazon.nova-micro-v1:0": {
				"input": .037,
				"output": .148,
				"cacheRead": .00925,
				"cacheWrite": .037
			},
			"eu.anthropic.claude-sonnet-4-20250514-v1:0": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"eu.anthropic.claude-opus-4-5-20251101-v1:0": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"global.openai.gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"qwen.qwen3-coder-30b-a3b-v1:0": {
				"input": .15,
				"output": .6
			},
			"us.amazon.nova-premier-v1:0": {
				"input": 2.5,
				"output": 12.5,
				"cacheRead": .625,
				"cacheWrite": 2.5
			},
			"anthropic.claude-sonnet-4-6": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"meta.llama3-1-70b-instruct-v1:0": {
				"input": .72,
				"output": .72
			},
			"us.writer.palmyra-x4-v1:0": {
				"input": 2.5,
				"output": 10
			},
			"apac.amazon.nova-pro-v1:0": {
				"input": .84,
				"output": 3.36,
				"cacheRead": .21,
				"cacheWrite": .84
			},
			"global.anthropic.claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"us.anthropic.claude-sonnet-5": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"amazon.nova-micro-v1:0": {
				"input": .035,
				"output": .14,
				"cacheRead": .00875,
				"cacheWrite": .035
			},
			"minimax.minimax-m2.5": {
				"input": .3,
				"output": 1.2
			},
			"xai.grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"us.amazon.nova-lite-v1:0": {
				"input": .06,
				"output": .24,
				"cacheRead": .015,
				"cacheWrite": .06
			},
			"amazon.nova-pro-v1:0": {
				"input": .8,
				"output": 3.2,
				"cacheRead": .2,
				"cacheWrite": .8
			},
			"qwen.qwen3-32b-v1:0": {
				"input": .15,
				"output": .6
			},
			"openai.gpt-5.5": {
				"input": 5.5,
				"output": 33,
				"cacheRead": .55
			},
			"mistral.voxtral-small-24b-2507": {
				"input": .1,
				"output": .3
			},
			"global.amazon.nova-2-lite-v1:0": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .075,
				"cacheWrite": .3
			},
			"us.openai.gpt-5.6-terra": {
				"input": 2.2,
				"output": 13.2,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"mistral.devstral-2-123b": {
				"input": .4,
				"output": 2
			},
			"us.xai.grok-4.6": {
				"input": 2.2,
				"output": 6.6,
				"cacheRead": .55
			},
			"jp.anthropic.claude-sonnet-4-5-20250929-v1:0": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"anthropic.claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic.claude-sonnet-4-5-20250929-v1:0": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"jp.anthropic.claude-opus-4-8": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"us.openai.gpt-5.6-luna": {
				"input": .22,
				"output": 1.32,
				"cacheRead": .022,
				"cacheWrite": .275
			},
			"in.anthropic.claude-opus-5": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"us.anthropic.claude-sonnet-4-5-20250929-v1:0": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"au.anthropic.claude-opus-5": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"nvidia.nemotron-nano-12b-v2": {
				"input": .2,
				"output": .6
			},
			"openai.gpt-6.1-sol": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .11,
				"cacheWrite": 2.75
			},
			"us.amazon.nova-2-lite-v1:0": {
				"input": .33,
				"output": 2.75,
				"cacheRead": .0825,
				"cacheWrite": .33
			},
			"us.openai.gpt-6-astra": {
				"input": 11,
				"output": 55,
				"cacheRead": 1.1,
				"cacheWrite": 13.75
			},
			"openai.gpt-5.6-terra": {
				"input": 2.2,
				"output": 13.2,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"global.openai.gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"anthropic.claude-opus-4-6-v1": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"us.anthropic.claude-opus-4-1-20250805-v1:0": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"us.meta.llama3-1-8b-instruct-v1:0": {
				"input": .22,
				"output": .22
			},
			"eu.anthropic.claude-haiku-4-5-20251001-v1:0": {
				"input": 1.1,
				"output": 5.5,
				"cacheRead": .11,
				"cacheWrite": 1.375
			},
			"global.anthropic.claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"apac.anthropic.claude-sonnet-4-20250514-v1:0": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"deepseek.v3.2": {
				"input": .62,
				"output": 1.85
			},
			"qwen.qwen3-235b-a22b-2507-v1:0": {
				"input": .22,
				"output": .88
			},
			"amazon.nova-lite-v1:0": {
				"input": .06,
				"output": .24,
				"cacheRead": .015,
				"cacheWrite": .06
			},
			"global.anthropic.claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"openai.gpt-oss-20b-1:0": {
				"input": .07,
				"output": .3
			},
			"anthropic.claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"meta.llama3-3-70b-instruct-v1:0": {
				"input": .72,
				"output": .72
			},
			"minimax.minimax-m2": {
				"input": .3,
				"output": 1.2
			},
			"mistral.mistral-large-3-675b-instruct": {
				"input": .5,
				"output": 1.5
			},
			"in.openai.gpt-5.6-luna": {
				"input": .22,
				"output": 1.32,
				"cacheRead": .022,
				"cacheWrite": .275
			},
			"eu.anthropic.claude-opus-4-8": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"global.anthropic.claude-sonnet-4-5-20250929-v1:0": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"zai.glm-4.7": {
				"input": .6,
				"output": 2.2
			},
			"au.anthropic.claude-sonnet-4-5-20250929-v1:0": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"eu.anthropic.claude-opus-5-5": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .22,
				"cacheWrite": 5.5
			},
			"global.anthropic.claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"jp.anthropic.claude-sonnet-4-6": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"google.gemma-3-27b-it": {
				"input": .23,
				"output": .38
			},
			"eu.anthropic.claude-opus-4-6-v1": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"us.anthropic.claude-opus-5-5": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .22,
				"cacheWrite": 5.5
			},
			"us.anthropic.claude-opus-5": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"global.xai.grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"us.openai.gpt-5.6-sol": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .44,
				"cacheWrite": 5.5
			},
			"us.moonshotai.kimi-k3": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"anthropic.claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"mistral.magistral-small-2509": {
				"input": .5,
				"output": 1.5
			},
			"mistral.pixtral-large-2502-v1:0": {
				"input": 2,
				"output": 6
			},
			"anthropic.claude-opus-4-5-20251101-v1:0": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"nvidia.nemotron-nano-9b-v2": {
				"input": .06,
				"output": .23
			},
			"eu.amazon.nova-micro-v1:0": {
				"input": .04,
				"output": .16,
				"cacheRead": .01,
				"cacheWrite": .04
			},
			"zai.glm-5": {
				"input": 1,
				"output": 3.2
			},
			"us.meta.llama3-1-70b-instruct-v1:0": {
				"input": .72,
				"output": .72
			},
			"jp.anthropic.claude-haiku-4-5-20251001-v1:0": {
				"input": 1.1,
				"output": 5.5,
				"cacheRead": .11,
				"cacheWrite": 1.375
			},
			"nvidia.nemotron-nano-3-30b": {
				"input": .06,
				"output": .24
			},
			"mistral.ministral-3-3b-instruct": {
				"input": .1,
				"output": .1
			},
			"us.xai.grok-4.7": {
				"input": 2.2,
				"output": 6.6,
				"cacheRead": .55
			},
			"us.openai.gpt-6-luna": {
				"input": .11,
				"output": .55,
				"cacheRead": .011,
				"cacheWrite": .1375
			},
			"global.openai.gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"google.gemma-4-26b-a4b": {
				"input": .13,
				"output": .4
			},
			"xai.grok-4.6": {
				"input": 2.2,
				"output": 6.6,
				"cacheRead": .55
			},
			"global.xai.grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"au.anthropic.claude-opus-4-6-v1": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"qwen.qwen3-vl-235b-a22b": {
				"input": .53,
				"output": 2.66
			},
			"anthropic.claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"jp.anthropic.claude-sonnet-5": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"qwen.qwen3-coder-next": {
				"input": .5,
				"output": 1.2
			},
			"anthropic.claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"au.anthropic.claude-sonnet-5": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"meta.llama4-scout-17b-instruct-v1:0": {
				"input": .17,
				"output": .66
			},
			"openai.gpt-oss-safeguard-120b": {
				"input": .15,
				"output": .6
			},
			"us.meta.llama3-3-70b-instruct-v1:0": {
				"input": .72,
				"output": .72
			},
			"global.openai.gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"au.anthropic.claude-sonnet-4-6": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"openai.gpt-oss-120b": {
				"input": .15,
				"output": .6
			},
			"deepseek.v3-v1:0": {
				"input": .58,
				"output": 1.68
			},
			"moonshotai.kimi-k2.5": {
				"input": .6,
				"output": 3
			},
			"eu.anthropic.claude-sonnet-4-6": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"us-gov.openai.gpt-oss-120b-1:0": {
				"input": .18,
				"output": .72
			},
			"us.anthropic.claude-fable-5": {
				"input": 11,
				"output": 55,
				"cacheRead": 1.1,
				"cacheWrite": 13.75
			},
			"openai.gpt-6-sol": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"us.deepseek.r1-v1:0": {
				"input": 1.35,
				"output": 5.4
			},
			"eu.anthropic.claude-opus-5": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"ca.amazon.nova-lite-v1:0": {
				"input": .064,
				"output": .256,
				"cacheRead": .016,
				"cacheWrite": .064
			},
			"us.openai.gpt-6-sol": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"au.anthropic.claude-opus-4-7": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"us.meta.llama4-scout-17b-instruct-v1:0": {
				"input": .17,
				"output": .66
			},
			"global.anthropic.claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"global.anthropic.claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"apac.amazon.nova-lite-v1:0": {
				"input": .063,
				"output": .252,
				"cacheRead": .01575,
				"cacheWrite": .063
			},
			"in.anthropic.claude-sonnet-5": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"us.anthropic.claude-opus-4-8": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"nvidia.nemotron-super-3-120b": {
				"input": .15,
				"output": .65
			},
			"global.openai.gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"us-gov.openai.gpt-oss-20b-1:0": {
				"input": .084,
				"output": .36
			},
			"us.anthropic.claude-opus-4-6-v1": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"meta.llama3-1-8b-instruct-v1:0": {
				"input": .22,
				"output": .22
			},
			"writer.palmyra-x5-v1:0": {
				"input": .6,
				"output": 6
			},
			"anthropic.claude-opus-4-1-20250805-v1:0": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"us.anthropic.claude-sonnet-4-6": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"global.anthropic.claude-opus-4-6-v1": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"eu.anthropic.claude-sonnet-4-5-20250929-v1:0": {
				"input": 3.3,
				"output": 16.5,
				"cacheRead": .33,
				"cacheWrite": 4.125
			},
			"jp.anthropic.claude-opus-4-7": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"au.anthropic.claude-opus-5-5": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .22,
				"cacheWrite": 5.5
			},
			"openai.gpt-6-luna": {
				"input": .11,
				"output": .55,
				"cacheRead": .011,
				"cacheWrite": .1375
			},
			"writer.palmyra-x4-v1:0": {
				"input": 2.5,
				"output": 10
			},
			"global.anthropic.claude-opus-4-5-20251101-v1:0": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic.claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"us.anthropic.claude-sonnet-4-20250514-v1:0": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic.claude-haiku-4-5-20251001-v1:0": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"eu.anthropic.claude-sonnet-5": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"zai.glm-4.7-flash": {
				"input": .07,
				"output": .4
			},
			"moonshot.kimi-k2-thinking": {
				"input": .6,
				"output": 2.5
			},
			"eu.amazon.nova-pro-v1:0": {
				"input": .92,
				"output": 3.68,
				"cacheRead": .23,
				"cacheWrite": .92
			},
			"global.openai.gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai.gpt-6-astra": {
				"input": 11,
				"output": 55,
				"cacheRead": 1.1,
				"cacheWrite": 13.75
			},
			"us.anthropic.claude-haiku-4-5-20251001-v1:0": {
				"input": 1.1,
				"output": 5.5,
				"cacheRead": .11,
				"cacheWrite": 1.375
			},
			"meta.llama4-maverick-17b-instruct-v1:0": {
				"input": .24,
				"output": .97
			},
			"qwen.qwen3-next-80b-a3b": {
				"input": .15,
				"output": 1.2
			},
			"eu.mistral.pixtral-large-2502-v1:0": {
				"input": 2,
				"output": 6
			},
			"au.anthropic.claude-opus-4-8": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"us.anthropic.claude-fable-5-1": {
				"input": 11,
				"output": 55,
				"cacheRead": .275,
				"cacheWrite": 13.75
			},
			"global.moonshotai.kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"in.openai.gpt-5.6-terra": {
				"input": 2.2,
				"output": 13.2,
				"cacheRead": .22,
				"cacheWrite": 2.75
			},
			"openai.gpt-oss-20b": {
				"input": .07,
				"output": .3
			},
			"mistral.ministral-3-14b-instruct": {
				"input": .2,
				"output": .2
			},
			"au.anthropic.claude-haiku-4-5-20251001-v1:0": {
				"input": 1.1,
				"output": 5.5,
				"cacheRead": .11,
				"cacheWrite": 1.375
			},
			"openai.gpt-5.6-sol": {
				"input": 4.4,
				"output": 22,
				"cacheRead": .44,
				"cacheWrite": 5.5
			},
			"minimax.minimax-m2.1": {
				"input": .3,
				"output": 1.2
			},
			"us.anthropic.claude-opus-4-5-20251101-v1:0": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"eu.anthropic.claude-opus-4-7": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"jp.amazon.nova-2-lite-v1:0": {
				"input": .396,
				"output": 3.311,
				"cacheRead": .099,
				"cacheWrite": .396
			},
			"us.mistral.pixtral-large-2502-v1:0": {
				"input": 2,
				"output": 6
			},
			"jp.anthropic.claude-opus-5": {
				"input": 5.5,
				"output": 27.5,
				"cacheRead": .55,
				"cacheWrite": 6.875
			},
			"global.anthropic.claude-sonnet-4-20250514-v1:0": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"global.anthropic.claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"openai.gpt-5.4": {
				"input": 2.75,
				"output": 16.5,
				"cacheRead": .275
			},
			"mistral.voxtral-mini-3b-2507": {
				"input": .04,
				"output": .04
			},
			"openai.gpt-oss-120b-1:0": {
				"input": .15,
				"output": .6
			},
			"amazon.nova-2-lite-v1:0": {
				"input": .33,
				"output": 2.75,
				"cacheRead": .0825,
				"cacheWrite": .33
			},
			"us.amazon.nova-micro-v1:0": {
				"input": .035,
				"output": .14,
				"cacheRead": .00875,
				"cacheWrite": .035
			},
			"mistral.ministral-3-8b-instruct": {
				"input": .15,
				"output": .15
			},
			"in.anthropic.claude-haiku-4-5-20251001-v1:0": {
				"input": 1.1,
				"output": 5.5,
				"cacheRead": .11,
				"cacheWrite": 1.375
			}
		},
		"synthetic": {
			"hf:moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15,
				"cacheRead": .45
			},
			"hf:moonshotai/Kimi-K2.7-Code": {
				"input": .95,
				"output": 4,
				"cacheRead": .95
			},
			"hf:nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4": {
				"input": .3,
				"output": 1,
				"cacheRead": .3
			},
			"hf:zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": 1.4
			},
			"hf:zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .04
			},
			"hf:zai-org/GLM-4.7-Flash": {
				"input": .1,
				"output": .5,
				"cacheRead": .1
			},
			"hf:zai-org/GLM-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"hf:deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .6,
				"output": 1.2,
				"cacheRead": .03
			},
			"hf:Qwen/Qwen3.6-27B": {
				"input": .45,
				"output": 3.6,
				"cacheRead": .45
			},
			"hf:openai/gpt-oss-120b": {
				"input": .1,
				"output": .1,
				"cacheRead": .1
			},
			"hf:MiniMaxAI/MiniMax-M3": {
				"input": .6,
				"output": 1.2,
				"cacheRead": .6
			}
		},
		"llmgateway": {
			"grok-4-1-fast-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"glm-4.6v": {
				"input": .3,
				"output": .9,
				"cacheRead": .05
			},
			"qwen-flash": {
				"input": .05,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": .0625
			},
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"glm-4.5": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"mimo-v2.6-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"gemma-4-31b-it": {
				"input": .1,
				"output": .25,
				"cacheRead": .01
			},
			"grok-4-5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3
			},
			"gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5,
				"cacheRead": 0
			},
			"grok-4-1-fast-non-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"qwen3-vl-235b-a22b-instruct": {
				"input": .2,
				"output": .88,
				"cacheRead": .11
			},
			"seed-1-6-flash-250715": {
				"input": .07,
				"output": .3,
				"cacheRead": .015
			},
			"qwen3.7-max": {
				"input": 1.25,
				"output": 3.75,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"muse-spark-1.3": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"Qwen3.8-27B": {
				"input": .08,
				"output": .35,
				"cacheRead": .05
			},
			"gpt-4o-transcribe": {
				"input": 2.5,
				"output": 10
			},
			"mimo-v2.5": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"mistral-large-latest": {
				"input": 4,
				"output": 12
			},
			"seed-2-0-code-preview-260328": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"qwen3-vl-235b-a22b-thinking": {
				"input": .98,
				"output": 3.95
			},
			"qwen3.8-2.4t-a95b": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"qwen-coder-plus": {
				"input": .502,
				"output": 1.004
			},
			"glm-5v-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"qwen3-vl-plus": {
				"input": .2,
				"output": 1.6,
				"reasoning": 4.8,
				"cacheRead": .04,
				"cacheWrite": .25
			},
			"glm-5.3-flash": {
				"input": .088,
				"output": .25,
				"cacheRead": .025
			},
			"fugu-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25
			},
			"ministral-8b-2512": {
				"input": .15,
				"output": .15
			},
			"qwen3.5-27b": {
				"input": .3,
				"output": 2.4
			},
			"glm-4.6": {
				"input": .55,
				"output": 2.2,
				"cacheRead": .11,
				"cacheWrite": 0
			},
			"glm-5.2-fast": {
				"input": 2.2,
				"output": 6.5,
				"cacheRead": .45
			},
			"muse-glimmer-30b": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .04
			},
			"grok-build-0-1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2
			},
			"qwen3-235b-a22b-instruct-2507": {
				"input": .09,
				"output": .58
			},
			"qwen-max": {
				"input": 1.6,
				"output": 6.4
			},
			"qwen3-next-80b-a3b-thinking": {
				"input": .15,
				"output": 1.2
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"qwen3-coder-next": {
				"input": .108,
				"output": .675,
				"cacheRead": .06
			},
			"glm-4.5-x": {
				"input": 2.2,
				"output": 8.9,
				"cacheRead": .45
			},
			"grok-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .75
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"llama-4-maverick-17b-instruct": {
				"input": .27,
				"output": .85
			},
			"gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"glm-5": {
				"input": .72,
				"output": 2.3,
				"cacheRead": .144,
				"cacheWrite": 0
			},
			"fugu-ultra-v2.0": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"gpt-4": {
				"input": 30,
				"output": 60
			},
			"deepseek-v4.1-flash": {
				"input": .15,
				"output": .55,
				"cacheRead": .005
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"kimi-k3-fast": {
				"input": 4.5,
				"output": 22.5,
				"cacheRead": .45
			},
			"qwen3-32b": {
				"input": .36,
				"output": .87,
				"reasoning": 8.4
			},
			"muse-spark-1.1": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"qwen-plus": {
				"input": .4,
				"output": 1.2,
				"reasoning": 4,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"kimi-k2.7-code-highspeed": {
				"input": 1.9,
				"output": 8,
				"cacheRead": .38
			},
			"qwen3.7-flash": {
				"input": .03,
				"output": .13,
				"cacheRead": .006,
				"cacheWrite": .0375
			},
			"kimi-k2.6": {
				"input": .6,
				"output": 3.05,
				"cacheRead": .13
			},
			"minimax-m2.1-lightning": {
				"input": .12,
				"output": .48
			},
			"claude-sonnet-4-5": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"qwen3-max": {
				"input": .845,
				"output": 3.38,
				"cacheRead": .6,
				"cacheWrite": 3.75
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"glm-4.5-airx": {
				"input": 1.1,
				"output": 4.5,
				"cacheRead": .22
			},
			"glm-4.5v": {
				"input": .6,
				"output": 1.8,
				"cacheRead": .11
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"devstral-2512": {
				"input": .4,
				"output": 2
			},
			"llama-4-scout-17b-instruct": {
				"input": .18,
				"output": .59
			},
			"gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"qwen3-235b-a22b-fp8": {
				"input": .2,
				"output": .8
			},
			"o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"glm-4-32b-0414-128k": {
				"input": .1,
				"output": .1
			},
			"qwen3-coder-480b-a35b-instruct": {
				"input": .38,
				"output": 1.55
			},
			"qwen3-coder-30b-a3b-instruct": {
				"input": .07,
				"output": .27
			},
			"mistral-medium-3-5": {
				"input": 1.5,
				"output": 7.5
			},
			"ling-3.0-flash": {
				"input": .06,
				"output": .18,
				"cacheRead": .012
			},
			"kimi-k2-thinking": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .06
			},
			"claude-opus-4-1-20250805": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"qwen3-vl-30b-a3b-instruct": {
				"input": .15,
				"output": .6
			},
			"gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"seed-1-6-250915": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"seed-2-0-mini-260428": {
				"input": .1,
				"output": .4,
				"cacheRead": .02
			},
			"gemma-4-26b-a4b-it": {
				"input": .07,
				"output": .34
			},
			"claude-opus-4-5-20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .08333
			},
			"llama-3-70b-instruct": {
				"input": .51,
				"output": .74
			},
			"qwen3-vl-flash": {
				"input": .05,
				"output": .4,
				"cacheRead": .01
			},
			"seed-2-0-pro-260328": {
				"input": .5,
				"output": 3,
				"cacheRead": .1
			},
			"ling-3.0-flash-vl": {
				"input": .06,
				"output": .18,
				"cacheRead": .012
			},
			"qwen3-235b-a22b-thinking-2507": {
				"input": .3,
				"output": 3
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"minimax-text-01": {
				"input": .2,
				"output": 1.1
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"glm-4.6v-flashx": {
				"input": .04,
				"output": .4,
				"cacheRead": .004
			},
			"qwen3.5-122b-a10b": {
				"input": .4,
				"output": 3.2
			},
			"grok-4-20-beta-0309-non-reasoning": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"kimi-k2.5": {
				"input": .405,
				"output": 1.98,
				"cacheRead": .225
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"llama-3.3-70b-instruct": {
				"input": .135,
				"output": .4
			},
			"gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"qwen3.6-35b-a3b": {
				"input": .248,
				"output": 1.485
			},
			"qwen3-next-80b-a3b-instruct": {
				"input": .15,
				"output": 1.2
			},
			"granite-4.2-8b": {
				"input": .06,
				"output": .25,
				"cacheRead": .015
			},
			"fugu-ultra": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"gpt-oss-20b": {
				"input": .04,
				"output": .19,
				"cacheRead": .01
			},
			"minimax-m2.7": {
				"input": .08,
				"output": .32,
				"cacheRead": .017,
				"cacheWrite": .375
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": .08333
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"qwen3.6-flash": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .05,
				"cacheWrite": .3125
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"qwen3-coder-flash": {
				"input": .3,
				"output": 1.5,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"nemotron-3-ultra-550b": {
				"input": .5,
				"output": 2.2,
				"cacheRead": .1
			},
			"llama-3.2-11b-instruct": {
				"input": .07,
				"output": .33
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"mimo-v2.5-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .0036
			},
			"qwen3-coder-plus": {
				"input": 1,
				"output": 5,
				"cacheRead": .2,
				"cacheWrite": 1.25
			},
			"glm-4.7-flash": {
				"input": .06,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": 0
			},
			"qwen3.5-9b": {
				"input": .1,
				"output": .15
			},
			"inkling": {
				"input": .95,
				"output": 4.05,
				"cacheRead": .16
			},
			"muse-spark-1.2": {
				"input": 1.25,
				"output": 4.25,
				"cacheRead": .15
			},
			"mimo-v2.6-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"seed-1-8-251228": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"glm-4.7": {
				"input": .38,
				"output": 1.98,
				"cacheRead": .19,
				"cacheWrite": 0
			},
			"minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"qwen3.8-flash": {
				"input": .15,
				"output": .47,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"mistral-small-2603": {
				"input": .15,
				"output": .6
			},
			"gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"seed-1-6-250615": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"qwen35-397b-a17b": {
				"input": .6,
				"output": 3.6
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"qwen3.5-35b-a3b": {
				"input": .25,
				"output": 2
			},
			"qwen3.6-max-preview": {
				"input": 1.3,
				"output": 7.8,
				"cacheRead": .13,
				"cacheWrite": 1.625
			},
			"claude-opus-4-6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"glm-5.2": {
				"input": .8,
				"output": 2.55,
				"cacheRead": .16,
				"cacheWrite": 0
			},
			"ernie-4.5-vl-424b-a47b": {
				"input": .42,
				"output": 1.25
			},
			"hy3": {
				"input": .132,
				"output": .528,
				"cacheRead": .033
			},
			"seed-2-0-lite-260428": {
				"input": .25,
				"output": 2,
				"cacheRead": .05
			},
			"kimi-k2": {
				"input": .57,
				"output": 2.3,
				"cacheRead": .5
			},
			"qwen-omni-turbo": {
				"input": .2,
				"output": .8
			},
			"hy-mt2-plus": {
				"input": .074,
				"output": .295
			},
			"grok-4-3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"glm-5.1": {
				"input": .931,
				"output": 2.93,
				"cacheRead": .173,
				"cacheWrite": 0
			},
			"grok-4-20-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"grok-4-20-beta-0309-reasoning": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"minimax-m2.7-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .06,
				"cacheWrite": .375
			},
			"claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"glm-4.7-flashx": {
				"input": .07,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": 0
			},
			"muse-spark-1.2-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"sonar": {
				"input": .25,
				"output": 2.5,
				"cacheWrite": .25
			},
			"mistral-large-2512": {
				"input": .5,
				"output": 1.5
			},
			"grok-4-6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"gemini-pro-latest": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"minimax-m2.5-highspeed": {
				"input": .6,
				"output": 2.4,
				"cacheRead": .03,
				"cacheWrite": .375
			},
			"gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .08333
			},
			"ministral-14b-2512": {
				"input": .2,
				"output": .2
			},
			"glm-5-turbo": {
				"input": 1.2,
				"output": 4,
				"cacheRead": .24
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"deepseek-v4-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"step-3.7-flash": {
				"input": .2,
				"output": 1.15,
				"cacheRead": .04
			},
			"gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gpt-4o-mini-transcribe": {
				"input": 1.25,
				"output": 5
			},
			"llama-3.2-3b-instruct": {
				"input": .03,
				"output": .05
			},
			"qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"mistral-small-2506": {
				"input": .1,
				"output": .3
			},
			"grok-4-20-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"grok-4-7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"deepseek-v3.2": {
				"input": .26,
				"output": .38,
				"cacheRead": .13
			},
			"gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"atria-dawn-preview": {
				"input": 0,
				"output": 0
			},
			"hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			},
			"muse-spark-1.3-contributor": {
				"input": .1,
				"output": .2,
				"cacheRead": .002
			},
			"glm-4.5-air": {
				"input": .13,
				"output": .85,
				"cacheRead": .025,
				"cacheWrite": 0
			},
			"qwen-plus-latest": {
				"input": .4,
				"output": 1.2,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"gpt-oss-120b": {
				"input": .032,
				"output": .14,
				"cacheRead": .032
			},
			"gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"ministral-3b-2512": {
				"input": .1,
				"output": .1
			},
			"o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"glm-5.3": {
				"input": .9,
				"output": 3,
				"cacheRead": .15
			},
			"claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"kimi-k2.7-code": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"qwen3.7-plus": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .08,
				"cacheWrite": .5
			},
			"minimax-m2.1": {
				"input": .27,
				"output": 1.1
			},
			"gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"auto": {
				"input": 0,
				"output": 0
			},
			"llama-3.1-70b-instruct": {
				"input": .72,
				"output": .72
			},
			"minimax-m2": {
				"input": .2,
				"output": 1,
				"cacheRead": .03
			},
			"custom": {
				"input": 0,
				"output": 0
			},
			"codestral-2508": {
				"input": .3,
				"output": .9
			},
			"deepseek-v4-flash": {
				"input": .065,
				"output": .116,
				"cacheRead": .012
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": .08333
			}
		},
		"sap-ai-core": {
			"anthropic--claude-4-opus": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"nvidia--llama-3.2-nv-embedqa-1b": {
				"input": .07,
				"output": 0
			},
			"text-embedding-3-small": {
				"input": .02,
				"output": 0
			},
			"sap-abap-1": {
				"input": .48,
				"output": 1.7
			},
			"anthropic--claude-4.8-opus": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"anthropic--claude-3-haiku": {
				"input": .25,
				"output": 1.25,
				"cacheRead": .03,
				"cacheWrite": .3
			},
			"gpt-4.1-nano": {
				"input": .08,
				"output": .26
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"anthropic--claude-4.5-haiku": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic--claude-4.7-opus": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"amazon--nova-pro": {
				"input": .56,
				"output": 2.13
			},
			"amazon--nova-lite": {
				"input": .3,
				"output": 2.37
			},
			"sonar-pro": {
				"input": 3,
				"output": 15
			},
			"anthropic--claude-3.5-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"text-embedding-3-large": {
				"input": .09,
				"output": 0
			},
			"amazon--nova-micro": {
				"input": .03,
				"output": .1
			},
			"anthropic--claude-4.5-opus": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic--claude-4-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"anthropic--claude-3-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"sonar-deep-research": {
				"input": 2,
				"output": 8,
				"reasoning": 3
			},
			"mistralai--mistral-small": {
				"input": .07,
				"output": .28
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"anthropic--claude-3.7-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gpt-5.6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1
			},
			"gpt-5.2": {
				"input": 1.25,
				"output": 9.44,
				"cacheRead": .12
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"anthropic--claude-4.6-opus": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"mistralai--mistral-medium-instruct": {
				"input": .36,
				"output": 1.22
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .32
			},
			"anthropic--claude-3-opus": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic--claude-4.6-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"sonar": {
				"input": 1,
				"output": 1
			},
			"amazon--titan-embed-text": {
				"input": .14,
				"output": 0
			},
			"gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"anthropic--claude-4.5-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"cohere--command-a-reasoning": {
				"input": .63,
				"output": 5.05
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			}
		},
		"vivgrid": {
			"viv-fast": {
				"input": .13,
				"output": .4,
				"cacheRead": .05
			},
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"gpt-5.2-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .04
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .03
			},
			"deepseek-v4.1-flash": {
				"input": .31,
				"output": 1.23,
				"cacheRead": .01
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .5,
				"cacheWrite": 12.5
			},
			"gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1.25,
				"cacheWrite": 12.5
			},
			"deepseek-v4-pro-0813": {
				"input": 1.35,
				"output": 3,
				"reasoning": 3,
				"cacheRead": .05
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"gpt-5.6-luna": {
				"input": 1,
				"output": 6,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"glm-5.2": {
				"input": 1.2,
				"output": 4.2,
				"cacheRead": .3
			},
			"gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .15
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"deepseek-v4-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gpt-5.6-terra": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 3.125
			},
			"deepseek-v3.2": {
				"input": .28,
				"output": .42
			},
			"glm-5.3": {
				"input": 1.2,
				"output": 4.2,
				"cacheRead": .26
			},
			"gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025,
				"cacheWrite": 1
			},
			"gpt-5.6-sol": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"deepseek-v4-flash": {
				"input": .15,
				"output": .3,
				"reasoning": .3,
				"cacheRead": .03
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			}
		},
		"klokintegration": {
			"Kloker-Integration-Developer": {
				"input": .23,
				"output": 1.16
			},
			"Kloker": {
				"input": .23,
				"output": 1.16
			},
			"Kloker-Integration-Architect": {
				"input": .23,
				"output": 1.16
			}
		},
		"google-vertex": {
			"claude-opus-4-8@default": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-2.5-flash-tts": {
				"input": .5,
				"output": 10
			},
			"gemini-flash-latest": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"claude-sonnet-4-5@20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gemini-2.5-flash-image": {
				"input": .3,
				"output": 30
			},
			"claude-opus-4-6@default": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-opus-4@20250514": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"gemini-flash-lite-latest": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"claude-sonnet-5-5@default": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"claude-opus-5-5@default": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"claude-opus-5@default": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-sonnet-4-6@default": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"claude-haiku-4-5@20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"gemini-3.1-flash-image": {
				"input": .5,
				"output": 60,
				"cacheRead": .05
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"claude-opus-4-1@20250805": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"claude-opus-4-5@20251101": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"claude-opus-4-7@default": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gemini-3-pro-image": {
				"input": 2,
				"output": 120,
				"cacheRead": .2
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03
			},
			"claude-fable-5-1@default": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gemini-3.1-pro-preview-customtools": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05
			},
			"claude-fable-5@default": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075
			},
			"gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"gemini-2.5-pro-tts": {
				"input": 1,
				"output": 20
			},
			"gemini-embedding-001": {
				"input": .15,
				"output": 0
			},
			"claude-sonnet-4@20250514": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"gemini-3.1-flash-lite-preview": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"claude-sonnet-5@default": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gemini-3.1-flash-lite": {
				"input": .25,
				"output": 1.5,
				"cacheRead": .025
			},
			"meta/llama-4-maverick-17b-128e-instruct-maas": {
				"input": .35,
				"output": 1.15
			},
			"meta/llama-3.3-70b-instruct-maas": {
				"input": .72,
				"output": .72
			},
			"xai/grok-4.20-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.20-non-reasoning": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.1-fast-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"xai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"xai/grok-4.1-fast-non-reasoning": {
				"input": .2,
				"output": .5,
				"cacheRead": .05
			},
			"xai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"deepseek-ai/deepseek-v3.1-maas": {
				"input": .6,
				"output": 1.7,
				"cacheRead": .06
			},
			"deepseek-ai/deepseek-v3.2-maas": {
				"input": .56,
				"output": 1.68,
				"cacheRead": .056
			},
			"moonshotai/kimi-k2-thinking-maas": {
				"input": .6,
				"output": 2.5,
				"cacheRead": .06
			},
			"zai-org/glm-5-maas": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .1
			},
			"zai-org/glm-4.7-maas": {
				"input": .6,
				"output": 2.2,
				"cacheRead": .06
			},
			"zai-org/glm-5.2-maas": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .14
			},
			"qwen/qwen3-235b-a22b-instruct-2507-maas": {
				"input": .22,
				"output": .88
			},
			"openai/gpt-oss-20b-maas": {
				"input": .07,
				"output": .25,
				"cacheRead": .007
			},
			"openai/gpt-oss-120b-maas": {
				"input": .09,
				"output": .36
			}
		},
		"evroc": {
			"google/gemma-4-26B-A4B-it": {
				"input": .144,
				"output": .575
			},
			"intfloat/multilingual-e5-large-instruct": {
				"input": .114,
				"output": .114
			},
			"Qwen/Qwen3.8-27B": {
				"input": .87,
				"output": 3.5
			},
			"Qwen/Qwen3-Reranker-4B": {
				"input": .0575,
				"output": 0
			},
			"Qwen/Qwen3.6-35B-A3B": {
				"input": .345,
				"output": 1.38
			},
			"Qwen/Qwen3-Embedding-8B": {
				"input": .115,
				"output": .115
			},
			"mistralai/Mistral-Medium-3.5-128B": {
				"input": 1.725,
				"output": 6.9
			},
			"mistralai/Voxtral-Small-24B-2507": {
				"input": .0023,
				"output": .0023
			},
			"moonshotai/Kimi-K2.6": {
				"input": 1.4375,
				"output": 5.75
			},
			"zai-org/GLM-5.2": {
				"input": 1.4375,
				"output": 5.75
			},
			"nvidia/Llama-3.3-70B-Instruct-FP8": {
				"input": 1.15,
				"output": 1.15
			},
			"KBLab/kb-whisper-large": {
				"input": .0023,
				"output": .0023
			},
			"evroc/roc": {
				"input": 2.875,
				"output": 11.516
			},
			"openai/whisper-large-v3": {
				"input": .0023,
				"output": .0023
			},
			"openai/whisper-large-v3-turbo": {
				"input": .0023,
				"output": .0023
			},
			"openai/gpt-oss-120b": {
				"input": .23,
				"output": .92
			}
		},
		"tokengo": {
			"deepseek/deepseek-v3.1": {
				"input": .19,
				"output": .71,
				"cacheRead": .06
			},
			"deepseek/deepseek-v4-pro": {
				"input": .435,
				"output": .87
			},
			"deepseek/deepseek-v3.2": {
				"input": .2174,
				"output": .326,
				"cacheRead": .06
			},
			"deepseek/deepseek-v4-flash": {
				"input": .098,
				"output": .196,
				"cacheRead": .028
			},
			"z-ai/glm-5.3-flash": {
				"input": .075,
				"output": .025,
				"cacheRead": .015
			},
			"z-ai/glm-5": {
				"input": .89,
				"output": 3.2647,
				"cacheRead": .2226
			},
			"z-ai/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"z-ai/glm-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"z-ai/glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"moonshotai/kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .16
			},
			"minimax/minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .03
			},
			"qwen/qwen3.5-397b-a17b": {
				"input": .4,
				"output": 2.65,
				"cacheRead": .2
			}
		},
		"submodel": {
			"Qwen/Qwen3-235B-A22B-Thinking-2507": {
				"input": .2,
				"output": .6
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507": {
				"input": .2,
				"output": .3
			},
			"Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8": {
				"input": .2,
				"output": .8
			},
			"deepseek-ai/DeepSeek-V3.1": {
				"input": .2,
				"output": .8
			},
			"deepseek-ai/DeepSeek-R1-0528": {
				"input": .5,
				"output": 2.15
			},
			"deepseek-ai/DeepSeek-V3-0324": {
				"input": .2,
				"output": .8
			},
			"zai-org/GLM-4.5-FP8": {
				"input": .2,
				"output": .8
			},
			"zai-org/GLM-4.5-Air": {
				"input": .1,
				"output": .5
			},
			"openai/gpt-oss-120b": {
				"input": .1,
				"output": .5
			}
		},
		"kosmik": { "qwen/qwen3.8-27b": {
			"input": .35,
			"output": 2.2,
			"cacheRead": .09
		} },
		"tencent-token-plan": {
			"hy3": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"hy4-preview": {
				"input": .834,
				"output": 2.501,
				"cacheRead": .042
			}
		},
		"togetherai": {
			"meta-llama/Llama-3.3-70B-Instruct-Turbo": {
				"input": 1.04,
				"output": 1.04
			},
			"thinkingmachines/Inkling": {
				"input": 1,
				"output": 4.05,
				"cacheRead": .17
			},
			"essentialai/Rnj-1-Instruct": {
				"input": .15,
				"output": .15
			},
			"Qwen/Qwen3.7-Max": {
				"input": 1.25,
				"output": 3.75,
				"cacheRead": .125
			},
			"Qwen/Qwen2.5-7B-Instruct-Turbo": {
				"input": .3,
				"output": .3
			},
			"Qwen/Qwen3-Coder-Next-FP8": {
				"input": .5,
				"output": 1.2
			},
			"Qwen/Qwen3-235B-A22B-Instruct-2507-tput": {
				"input": .2,
				"output": .6
			},
			"Qwen/Qwen3.5-9B": {
				"input": .17,
				"output": .25
			},
			"Qwen/Qwen3.5-397B-A17B": {
				"input": .6,
				"output": 3.6,
				"cacheRead": .35
			},
			"Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8": {
				"input": 2,
				"output": 2
			},
			"Qwen/Qwen3.6-Plus": {
				"input": .5,
				"output": 3
			},
			"LiquidAI/LFM2-24B-A2B": {
				"input": .03,
				"output": .12
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .14,
				"output": .28,
				"cacheRead": .03
			},
			"deepseek-ai/DeepSeek-R1": {
				"input": 3,
				"output": 7
			},
			"deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .13
			},
			"deepseek-ai/DeepSeek-V4.1-Flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"deepseek-ai/DeepSeek-V3-1": {
				"input": .6,
				"output": 1.7
			},
			"deepseek-ai/DeepSeek-V3": {
				"input": 1.25,
				"output": 1.25
			},
			"MiniMaxAI/MiniMax-M3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"MiniMaxAI/MiniMax-M2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"MiniMaxAI/MiniMax-M2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"moonshotai/Kimi-K3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"zai-org/GLM-5.1": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/GLM-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"zai-org/GLM-5": {
				"input": 1,
				"output": 3.2
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"zai-org/GLM-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"nvidia/nemotron-3-ultra-550b-a55b": {
				"input": .6,
				"output": 3.6,
				"cacheRead": .2
			},
			"openai/gpt-oss-120b": {
				"input": .15,
				"output": .6
			}
		},
		"helicone": {
			"grok-4-1-fast-reasoning": {
				"input": .19999999999999998,
				"output": .5,
				"cacheRead": .049999999999999996
			},
			"grok-3": {
				"input": 3,
				"output": 15,
				"cacheRead": .75
			},
			"llama-4-scout": {
				"input": .08,
				"output": .3
			},
			"llama-guard-4": {
				"input": .21,
				"output": .21
			},
			"mistral-large-2411": {
				"input": 2,
				"output": 6
			},
			"grok-4-1-fast-non-reasoning": {
				"input": .19999999999999998,
				"output": .5,
				"cacheRead": .049999999999999996
			},
			"qwen3-vl-235b-a22b-instruct": {
				"input": .3,
				"output": 1.5
			},
			"mistral-nemo": {
				"input": 20,
				"output": 40
			},
			"gpt-5.1-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12500000000000003
			},
			"gemini-3-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .19999999999999998
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"gpt-4.1-mini-2025-04-14": {
				"input": .39999999999999997,
				"output": 1.5999999999999999,
				"cacheRead": .09999999999999999
			},
			"glm-4.6": {
				"input": .44999999999999996,
				"output": 1.5
			},
			"claude-3.5-haiku": {
				"input": .7999999999999999,
				"output": 4,
				"cacheRead": .08,
				"cacheWrite": 1
			},
			"o1-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"grok-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .75
			},
			"gpt-5-codex": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12500000000000003
			},
			"llama-4-maverick": {
				"input": .15,
				"output": .6
			},
			"qwen3-coder": {
				"input": .22,
				"output": .95
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .024999999999999998
			},
			"o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"kimi-k2-0711": {
				"input": .5700000000000001,
				"output": 2.3
			},
			"gpt-4.1-nano": {
				"input": .09999999999999999,
				"output": .39999999999999997,
				"cacheRead": .024999999999999998
			},
			"grok-4-fast-reasoning": {
				"input": .19999999999999998,
				"output": .5,
				"cacheRead": .049999999999999996
			},
			"qwen3-32b": {
				"input": .29,
				"output": .59
			},
			"gpt-5-nano": {
				"input": .049999999999999996,
				"output": .39999999999999997,
				"cacheRead": .005
			},
			"claude-3.5-sonnet-v2": {
				"input": 3,
				"output": 15,
				"cacheRead": .30000000000000004,
				"cacheWrite": 3.75
			},
			"gpt-5.1-chat-latest": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12500000000000003
			},
			"claude-4.5-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .30000000000000004,
				"cacheWrite": 3.75
			},
			"deepseek-tng-r1t2-chimera": {
				"input": .3,
				"output": 1.2
			},
			"deepseek-v3": {
				"input": .56,
				"output": 1.68,
				"cacheRead": .07
			},
			"deepseek-r1-distill-llama-70b": {
				"input": .03,
				"output": .13
			},
			"o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"mistral-small": {
				"input": .075,
				"output": .2
			},
			"chatgpt-4o-latest": {
				"input": 5,
				"output": 20,
				"cacheRead": 2.5
			},
			"qwen3-coder-30b-a3b-instruct": {
				"input": .09999999999999999,
				"output": .3
			},
			"sonar-pro": {
				"input": 3,
				"output": 15
			},
			"kimi-k2-thinking": {
				"input": .48,
				"output": 2
			},
			"grok-4-fast-non-reasoning": {
				"input": .19999999999999998,
				"output": .5,
				"cacheRead": .049999999999999996
			},
			"claude-opus-4-1-20250805": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"gpt-5-chat-latest": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12500000000000003
			},
			"deepseek-v3.1-terminus": {
				"input": .27,
				"output": 1,
				"cacheRead": .21600000000000003
			},
			"claude-opus-4-1": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12500000000000003
			},
			"llama-3.3-70b-versatile": {
				"input": .59,
				"output": .7899999999999999
			},
			"llama-3.3-70b-instruct": {
				"input": .13,
				"output": .39
			},
			"grok-3-mini": {
				"input": .3,
				"output": .5,
				"cacheRead": .075
			},
			"gemma-3-12b-it": {
				"input": .049999999999999996,
				"output": .09999999999999999
			},
			"qwen2.5-coder-7b-fast": {
				"input": .03,
				"output": .09
			},
			"gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"qwen3-next-80b-a3b-instruct": {
				"input": .14,
				"output": 1.4
			},
			"o3-pro": {
				"input": 20,
				"output": 80
			},
			"gpt-oss-20b": {
				"input": .049999999999999996,
				"output": .19999999999999998
			},
			"gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .3125,
				"cacheWrite": 1.25
			},
			"sonar-deep-research": {
				"input": 2,
				"output": 8
			},
			"gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .075,
				"cacheWrite": .3
			},
			"claude-4.5-haiku": {
				"input": 1,
				"output": 5,
				"cacheRead": .09999999999999999,
				"cacheWrite": 1.25
			},
			"gemma2-9b-it": {
				"input": .01,
				"output": .03
			},
			"claude-3.7-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .30000000000000004,
				"cacheWrite": 3.75
			},
			"hermes-2-pro-llama-3-8b": {
				"input": .14,
				"output": .14
			},
			"claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .30000000000000004,
				"cacheWrite": 3.75
			},
			"qwen3-235b-a22b-thinking": {
				"input": .3,
				"output": 2.9000000000000004
			},
			"grok-code-fast-1": {
				"input": .19999999999999998,
				"output": 1.5,
				"cacheRead": .02
			},
			"claude-sonnet-4-5-20250929": {
				"input": 3,
				"output": 15,
				"cacheRead": .30000000000000004,
				"cacheWrite": 3.75
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"qwen3-30b-a3b": {
				"input": .08,
				"output": .29
			},
			"kimi-k2-0905": {
				"input": .5,
				"output": 2,
				"cacheRead": .39999999999999997
			},
			"llama-3.1-8b-instruct": {
				"input": .02,
				"output": .049999999999999996
			},
			"llama-3.1-8b-instruct-turbo": {
				"input": .02,
				"output": .03
			},
			"llama-prompt-guard-2-86m": {
				"input": .01,
				"output": .01
			},
			"claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .09999999999999999,
				"cacheWrite": 1.25
			},
			"sonar": {
				"input": 1,
				"output": 1
			},
			"deepseek-reasoner": {
				"input": .56,
				"output": 1.68,
				"cacheRead": .07
			},
			"gpt-4.1-mini": {
				"input": .39999999999999997,
				"output": 1.5999999999999999,
				"cacheRead": .09999999999999999
			},
			"ernie-4.5-21b-a3b-thinking": {
				"input": .07,
				"output": .28
			},
			"claude-4.5-opus": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gemini-2.5-flash-lite": {
				"input": .09999999999999999,
				"output": .39999999999999997,
				"cacheRead": .024999999999999998,
				"cacheWrite": .09999999999999999
			},
			"claude-3-haiku-20240307": {
				"input": .25,
				"output": 1.25,
				"cacheRead": .03,
				"cacheWrite": .3
			},
			"sonar-reasoning-pro": {
				"input": 2,
				"output": 8
			},
			"deepseek-v3.2": {
				"input": .27,
				"output": .41
			},
			"llama-prompt-guard-2-22m": {
				"input": .01,
				"output": .01
			},
			"gpt-oss-120b": {
				"input": .04,
				"output": .16
			},
			"gpt-5.1-codex-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .024999999999999998
			},
			"o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .12500000000000003
			},
			"llama-3.1-8b-instant": {
				"input": .049999999999999996,
				"output": .08
			},
			"sonar-reasoning": {
				"input": 1,
				"output": 5
			},
			"claude-opus-4": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			}
		},
		"cortecs": {
			"gpt-5.4": {
				"input": 2.898,
				"output": 15.453,
				"cacheRead": .242
			},
			"claude-haiku-4-5": {
				"input": .996,
				"output": 4.982,
				"cacheRead": .099,
				"cacheWrite": 1.186
			},
			"gpt-oss-safeguard-120b": {
				"input": .179,
				"output": .697
			},
			"gemma-4-31b-it": {
				"input": .223,
				"output": .39
			},
			"qwen3.8-27b": {
				"input": .1,
				"output": .4,
				"cacheRead": .04
			},
			"gemma-3-27b-it": {
				"input": .099,
				"output": .299
			},
			"qwen3.8-2.4t-a95b": {
				"input": 2.5,
				"output": 6,
				"cacheRead": .625
			},
			"mistral-large-2402": {
				"input": 4.284,
				"output": 12.952
			},
			"glm-5v-turbo": {
				"input": 1.186,
				"output": 3.955,
				"cacheRead": .296,
				"cacheWrite": 1.544
			},
			"gpt-4o": {
				"input": 2.659,
				"output": 10.635,
				"cacheRead": 1.33
			},
			"qwen3guard-gen-8b": {
				"input": 0,
				"output": 0
			},
			"glm-5.3-flash": {
				"input": .1,
				"output": .35,
				"cacheRead": .018
			},
			"ministral-8b-2512": {
				"input": .179,
				"output": .179,
				"cacheRead": .017
			},
			"deepseek-v4-flash-0731": {
				"input": .09,
				"output": .17,
				"cacheRead": .014
			},
			"mistral-7b-instruct-v0.2": {
				"input": .159,
				"output": .219
			},
			"qwen3-235b-a22b-instruct-2507": {
				"input": .069,
				"output": .455,
				"cacheRead": .018
			},
			"kimi-k3": {
				"input": 3,
				"output": 14.999
			},
			"qwen3-coder-next": {
				"input": .167,
				"output": .891
			},
			"nova-lite-v1": {
				"input": .069,
				"output": .275
			},
			"apertus-70b": {
				"input": 1.393,
				"output": 2.228
			},
			"gpt-5-mini": {
				"input": .279,
				"output": 2.192,
				"cacheRead": .056
			},
			"glm-5": {
				"input": .988,
				"output": 3.164,
				"cacheRead": .247
			},
			"deepseek-v4.1-flash": {
				"input": .201,
				"output": .6,
				"cacheRead": .004
			},
			"gpt-4.1-nano": {
				"input": .111,
				"output": .434,
				"cacheRead": .056
			},
			"minimax-m2.5": {
				"input": .296,
				"output": 1.186,
				"cacheRead": .075
			},
			"qwen3-32b": {
				"input": .179,
				"output": .697
			},
			"mistral-medium-3.5": {
				"input": 1.532,
				"output": 7.843,
				"cacheRead": .154
			},
			"gpt-5-nano": {
				"input": .06,
				"output": .439,
				"cacheRead": .019
			},
			"claude-4-6-sonnet": {
				"input": 3.196,
				"output": 15.94,
				"cacheRead": .32,
				"cacheWrite": 3.999
			},
			"kimi-k2.6": {
				"input": .475,
				"output": 2.97,
				"cacheRead": .1
			},
			"claude-4-5-sonnet": {
				"input": 2.989,
				"output": 14.945,
				"cacheRead": .326,
				"cacheWrite": 4.078
			},
			"devstral-2512": {
				"input": .478,
				"output": 2.392,
				"cacheRead": .045
			},
			"gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .038
			},
			"mistral-7b-instruct-v0.3": {
				"input": .111,
				"output": .111
			},
			"qwen3-coder-30b-a3b-instruct": {
				"input": .067,
				"output": .245,
				"cacheRead": .014
			},
			"mixtral-8x7B-instruct-v0.1": {
				"input": .488,
				"output": .758
			},
			"gpt-6.1-sol": {
				"input": 2.4,
				"output": 11.999,
				"cacheRead": .12,
				"cacheWrite": 3
			},
			"gemma-4-26b-a4b-it": {
				"input": .111,
				"output": .557
			},
			"gemini-3.5-flash-lite": {
				"input": .33,
				"output": 2.749,
				"cacheRead": .033,
				"cacheWrite": .082
			},
			"voxtral-small-2507": {
				"input": .123,
				"output": .368,
				"cacheRead": .012
			},
			"qwen3.5-122b-a10b": {
				"input": .495,
				"output": 3.46,
				"cacheRead": .124
			},
			"kimi-k2.5": {
				"input": .495,
				"output": 2.768,
				"cacheRead": .124
			},
			"gpt-5.1": {
				"input": 1.375,
				"output": 10.96,
				"cacheRead": .156
			},
			"claude-opus-5": {
				"input": 5.5,
				"output": 27.498,
				"cacheRead": .55,
				"cacheWrite": 6.874
			},
			"llama-3.3-70b-instruct": {
				"input": .724,
				"output": .724
			},
			"qwen3guard-gen-0.6b": {
				"input": 0,
				"output": 0
			},
			"gpt-4o-mini": {
				"input": .159,
				"output": .638,
				"cacheRead": .081
			},
			"qwen3.6-35b-a3b": {
				"input": .167,
				"output": .557
			},
			"pixtral-12b-2409": {
				"input": .223,
				"output": .223
			},
			"gpt-oss-20b": {
				"input": .045,
				"output": .167
			},
			"gemini-3.5-flash": {
				"input": 1.649,
				"output": 9.899,
				"cacheRead": .165,
				"cacheWrite": 1
			},
			"gemini-2.5-pro": {
				"input": 1.495,
				"output": 9.964,
				"cacheRead": .242,
				"cacheWrite": .434
			},
			"hermes-4-405b": {
				"input": .996,
				"output": 2.989
			},
			"gemini-2.5-flash": {
				"input": .299,
				"output": 2.491,
				"cacheRead": .029,
				"cacheWrite": .097
			},
			"qwen3-vl-235b-a22b": {
				"input": .617,
				"output": 3.119,
				"cacheRead": .052
			},
			"deepseek-v4-pro-0813": {
				"input": 2,
				"output": 3.999,
				"cacheRead": .5
			},
			"glm-4.7-flash": {
				"input": .08,
				"output": .478
			},
			"qwen3.5-9b": {
				"input": .111,
				"output": .167
			},
			"claude-opus4-6": {
				"input": 5.313,
				"output": 26.561,
				"cacheRead": .531,
				"cacheWrite": 6.645
			},
			"claude-sonnet-4": {
				"input": 2.989,
				"output": 14.945,
				"cacheRead": .296,
				"cacheWrite": 3.707
			},
			"minimax-m3": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"gpt-5.6-luna": {
				"input": .219,
				"output": 1.32,
				"cacheRead": .022,
				"cacheWrite": .275
			},
			"qwen3.8-flash-next": {
				"input": .201,
				"output": .5,
				"cacheRead": .05
			},
			"mistral-small-2603": {
				"input": .156,
				"output": .625,
				"cacheRead": .016
			},
			"nemotron-nano-v2-12b": {
				"input": .24,
				"output": .707
			},
			"mistral-small-2503": {
				"input": .111,
				"output": .334
			},
			"gpt-4.1": {
				"input": 2.192,
				"output": 8.769,
				"cacheRead": .546
			},
			"claude-sonnet-5": {
				"input": 2.2,
				"output": 11,
				"cacheRead": .219,
				"cacheWrite": 2.749
			},
			"qwen3.5-397b-a17b": {
				"input": .668,
				"output": 4.01
			},
			"gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .038
			},
			"glm-5.2": {
				"input": .9,
				"output": 3.24,
				"cacheRead": .189
			},
			"pixtral-large-2502": {
				"input": 1.993,
				"output": 5.978
			},
			"claude-opus4-7": {
				"input": 5.437,
				"output": 27.186,
				"cacheRead": .544,
				"cacheWrite": 6.797
			},
			"minicpm-v-4.5": {
				"input": .651,
				"output": 1.097
			},
			"llama-3.1-8b-instruct": {
				"input": .167,
				"output": .167
			},
			"glm-5.1": {
				"input": 1.384,
				"output": 4.348,
				"cacheRead": .346
			},
			"qwen3-30b-a3b-instruct-2507": {
				"input": .099,
				"output": .299
			},
			"qwen2.5-vl-72b-instruct": {
				"input": 1.014,
				"output": 1.014
			},
			"mistral-large-2512": {
				"input": .613,
				"output": 1.838,
				"cacheRead": .061
			},
			"gpt-4.1-mini": {
				"input": .434,
				"output": 1.704,
				"cacheRead": .134
			},
			"gemini-3.8-flash": {
				"input": .825,
				"output": 4.125,
				"cacheRead": .082,
				"cacheWrite": .084
			},
			"ministral-14b-2512": {
				"input": .24,
				"output": .24,
				"cacheRead": .022
			},
			"glm-5-turbo": {
				"input": 1.186,
				"output": 3.955,
				"cacheRead": .296,
				"cacheWrite": 1.544
			},
			"gpt-6-luna": {
				"input": .12,
				"output": .6,
				"cacheRead": .012,
				"cacheWrite": .15
			},
			"deepseek-v4-pro": {
				"input": 1.7,
				"output": 3.4,
				"cacheRead": .15
			},
			"claude-opus-5.5": {
				"input": 4.399,
				"output": 21.998,
				"cacheRead": .219,
				"cacheWrite": 5.5
			},
			"qwen3.6-27b": {
				"input": .446,
				"output": 3.008
			},
			"claude-opus4-8": {
				"input": 5.437,
				"output": 27.186,
				"cacheRead": .544,
				"cacheWrite": 6.797
			},
			"mistral-small-3.2-24b-instruct-2506": {
				"input": .1,
				"output": .312
			},
			"deepseek-r1-0528": {
				"input": .652,
				"output": 2.57,
				"cacheRead": .163
			},
			"gpt-5.6-terra": {
				"input": 2.2,
				"output": 13.199,
				"cacheRead": .219,
				"cacheWrite": 2.749
			},
			"deepseek-v3.2": {
				"input": .296,
				"output": .495,
				"cacheRead": .075
			},
			"nova-2-lite": {
				"input": .373,
				"output": 3.144
			},
			"nova-pro-v1": {
				"input": .918,
				"output": 3.671
			},
			"gpt-oss-120b": {
				"input": .089,
				"output": .446,
				"cacheRead": .01
			},
			"ministral-3b-2512": {
				"input": .123,
				"output": .123,
				"cacheRead": .012
			},
			"claude-opus4-5": {
				"input": 5.313,
				"output": 26.568,
				"cacheRead": .531,
				"cacheWrite": 6.645
			},
			"glm-5.3": {
				"input": .873,
				"output": 3.306,
				"cacheRead": .221
			},
			"kimi-k2.7-code": {
				"input": .656,
				"output": 3.3,
				"cacheRead": .18
			},
			"gpt-5": {
				"input": 1.375,
				"output": 10.96,
				"cacheRead": .156
			},
			"minimax-m2.1": {
				"input": .359,
				"output": 1.435
			},
			"gpt-5.6-sol": {
				"input": 4.399,
				"output": 21.998,
				"cacheRead": .44,
				"cacheWrite": 5.5
			},
			"mistral-nemo-instruct-2407": {
				"input": .145,
				"output": .145,
				"cacheRead": .014
			},
			"minimax-m2": {
				"input": .349,
				"output": 1.405
			},
			"nova-micro-v1": {
				"input": .04,
				"output": .159
			},
			"codestral-2508": {
				"input": .368,
				"output": 1.103,
				"cacheRead": .037
			},
			"gpt-6-sol": {
				"input": 2.4,
				"output": 11.999,
				"cacheRead": .24,
				"cacheWrite": 3
			},
			"nvidia-nemotron-3-nano-30b-a3b": {
				"input": .06,
				"output": .24
			},
			"gemini-3.1-flash-lite": {
				"input": .272,
				"output": 1.631,
				"cacheRead": .025,
				"cacheWrite": .082
			}
		},
		"agnes": {
			"agnes-2.5-pro-alpha": {
				"input": .45,
				"output": .9,
				"cacheRead": .0038
			},
			"agnes-2.0-flash": {
				"input": 0,
				"output": 0
			},
			"agnes-2.5-flash": {
				"input": 0,
				"output": 0
			}
		},
		"daoxe": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2
			},
			"gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .5
			},
			"kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"claude-haiku-4-5-20251001": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 5
			},
			"claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			}
		},
		"morph": {
			"morph-v3-large": {
				"input": .9,
				"output": 1.9
			},
			"morph-v3-fast": {
				"input": .8,
				"output": 1.2
			},
			"auto": {
				"input": .85,
				"output": 1.55
			}
		},
		"openai": {
			"gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"gpt-3.5-turbo": {
				"input": .5,
				"output": 1.5,
				"cacheRead": 0
			},
			"gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"text-embedding-3-small": {
				"input": .02,
				"output": 0
			},
			"gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"gpt-realtime-2.1": {
				"input": 4,
				"output": 24,
				"cacheRead": .4
			},
			"gpt-4o-2024-05-13": {
				"input": 5,
				"output": 15
			},
			"gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"gpt-image-2": {
				"input": 5,
				"output": 30,
				"cacheRead": 1.25
			},
			"gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"o4-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .275
			},
			"o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"text-embedding-ada-002": {
				"input": .1,
				"output": 0
			},
			"gpt-4": {
				"input": 30,
				"output": 60
			},
			"gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-4.1-nano": {
				"input": .1,
				"output": .4,
				"cacheRead": .025
			},
			"gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"gpt-5.6": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"gpt-5.2-chat-latest": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"gpt-5-pro": {
				"input": 15,
				"output": 120
			},
			"gpt-5.3-codex-spark": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"text-embedding-3-large": {
				"input": .13,
				"output": 0
			},
			"gpt-4o-2024-08-06": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"gpt-5.1": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"o3-pro": {
				"input": 20,
				"output": 80
			},
			"gpt-daybreak-blue-latest": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"gpt-4o-2024-11-20": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"gpt-4.1-mini": {
				"input": .4,
				"output": 1.6,
				"cacheRead": .1
			},
			"gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"gpt-5.3-chat-latest": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"gpt-4-turbo": {
				"input": 10,
				"output": 30
			},
			"gpt-daybreak-red-latest": {
				"input": 12.5,
				"output": 75,
				"cacheRead": 1.25,
				"cacheWrite": 15.625
			},
			"o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"o1-pro": {
				"input": 150,
				"output": 600
			}
		},
		"alibaba-coding-plan-cn": {
			"qwen3-coder-next": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.5-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"kimi-k2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3-max-2026-01-23": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3-coder-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"MiniMax-M2.5": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"glm-4.7": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.6-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			},
			"qwen3.7-plus": {
				"input": 0,
				"output": 0,
				"cacheRead": 0,
				"cacheWrite": 0
			}
		},
		"io-net": {
			"meta-llama/Llama-3.2-90B-Vision-Instruct": {
				"input": .35,
				"output": .4,
				"cacheRead": .175,
				"cacheWrite": .7
			},
			"meta-llama/Llama-3.3-70B-Instruct": {
				"input": .13,
				"output": .38,
				"cacheRead": .065,
				"cacheWrite": .26
			},
			"meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8": {
				"input": .15,
				"output": .6,
				"cacheRead": .075,
				"cacheWrite": .3
			},
			"Qwen/Qwen3-Next-80B-A3B-Instruct": {
				"input": .1,
				"output": .8,
				"cacheRead": .05,
				"cacheWrite": .2
			},
			"Qwen/Qwen3-235B-A22B-Thinking-2507": {
				"input": .11,
				"output": .6,
				"cacheRead": .055,
				"cacheWrite": .22
			},
			"Qwen/Qwen2.5-VL-32B-Instruct": {
				"input": .05,
				"output": .22,
				"cacheRead": .025,
				"cacheWrite": .1
			},
			"deepseek-ai/DeepSeek-R1-0528": {
				"input": 2,
				"output": 8.75,
				"cacheRead": 1,
				"cacheWrite": 4
			},
			"mistralai/Mistral-Nemo-Instruct-2407": {
				"input": .02,
				"output": .04,
				"cacheRead": .01,
				"cacheWrite": .04
			},
			"mistralai/Magistral-Small-2506": {
				"input": .5,
				"output": 1.5,
				"cacheRead": .25,
				"cacheWrite": 1
			},
			"mistralai/Devstral-Small-2505": {
				"input": .05,
				"output": .22,
				"cacheRead": .025,
				"cacheWrite": .1
			},
			"mistralai/Mistral-Large-Instruct-2411": {
				"input": 2,
				"output": 6,
				"cacheRead": 1,
				"cacheWrite": 4
			},
			"Intel/Qwen3-Coder-480B-A35B-Instruct-int4-mixed-ar": {
				"input": .22,
				"output": .95,
				"cacheRead": .11,
				"cacheWrite": .44
			},
			"moonshotai/Kimi-K2-Thinking": {
				"input": .55,
				"output": 2.25,
				"cacheRead": .275,
				"cacheWrite": 1.1
			},
			"moonshotai/Kimi-K2-Instruct-0905": {
				"input": .39,
				"output": 1.9,
				"cacheRead": .195,
				"cacheWrite": .78
			},
			"zai-org/GLM-4.6": {
				"input": .4,
				"output": 1.75,
				"cacheRead": .2,
				"cacheWrite": .8
			},
			"openai/gpt-oss-20b": {
				"input": .03,
				"output": .14,
				"cacheRead": .015,
				"cacheWrite": .06
			},
			"openai/gpt-oss-120b": {
				"input": .04,
				"output": .4,
				"cacheRead": .02,
				"cacheWrite": .08
			}
		},
		"infomaniak": {
			"mini_lm_l12_v2": {
				"input": 0,
				"output": 0
			},
			"bge_multilingual_gemma2": {
				"input": .08,
				"output": 0
			},
			"swiss-ai/Apertus-v1.5-70B": {
				"input": .87,
				"output": 3.1
			},
			"google/gemma-4-31B-it": {
				"input": .25,
				"output": .5
			},
			"Qwen/Qwen3.5-122B-A10B-FP8": {
				"input": .5,
				"output": 3.97
			},
			"Qwen/Qwen3.5-397B-A17B-FP8": {
				"input": .99,
				"output": 4.46
			},
			"mistralai/Mistral-Small-4-119B-2603": {
				"input": .25,
				"output": .93
			},
			"mistralai/Ministral-3-14B-Instruct-2512": {
				"input": .37,
				"output": .5
			},
			"moonshotai/Kimi-K2.6": {
				"input": .74,
				"output": 3.72
			},
			"nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8": {
				"input": .06,
				"output": .25
			}
		},
		"llmtech": { "nvidia/Qwen3.8-27B-NVFP4": {
			"input": .25,
			"output": 2.09,
			"cacheRead": .04
		} },
		"crossmodel": {
			"anthropic/claude-haiku-4-5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"anthropic/claude-opus-5-5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"anthropic/claude-fable-5-1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"anthropic/claude-opus-4-8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"anthropic/claude-sonnet-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-sonnet-4-6": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic/claude-sonnet-5-5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"anthropic/claude-opus-4-7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"deepseek/deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006,
				"cacheWrite": .3
			},
			"deepseek/deepseek-v4-flash-vision-exp": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006,
				"cacheWrite": .3
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.35,
				"output": 4.05,
				"cacheRead": .045,
				"cacheWrite": 1.35
			},
			"deepseek/deepseek-v4-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006,
				"cacheWrite": .3
			},
			"tencent/hy3": {
				"input": .16,
				"output": .64,
				"cacheRead": .04,
				"cacheWrite": .16
			},
			"tencent/hy4-preview": {
				"input": .96,
				"output": 2.88,
				"cacheRead": .048,
				"cacheWrite": .96
			},
			"z-ai/glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03,
				"cacheWrite": .15
			},
			"z-ai/glm-5": {
				"input": .6,
				"output": 3,
				"cacheRead": .16,
				"cacheWrite": .6
			},
			"z-ai/glm-4.7": {
				"input": .47,
				"output": 2.16,
				"cacheRead": .1,
				"cacheWrite": .47
			},
			"z-ai/glm-5.2": {
				"input": 1.2,
				"output": 4.4,
				"cacheRead": .3,
				"cacheWrite": 1.2
			},
			"z-ai/glm-5.1": {
				"input": 1,
				"output": 3.8,
				"cacheRead": .2,
				"cacheWrite": 1
			},
			"z-ai/glm-5-turbo": {
				"input": .9,
				"output": 3.7,
				"cacheRead": .18,
				"cacheWrite": .9
			},
			"z-ai/glm-5.3": {
				"input": 1.2,
				"output": 4.4,
				"cacheRead": .3,
				"cacheWrite": 1.2
			},
			"x-ai/grok-4.7": {
				"input": 2,
				"output": 6,
				"cacheRead": .5,
				"cacheWrite": 2
			},
			"x-ai/grok-4.3": {
				"input": 1.25,
				"output": 2.5,
				"cacheRead": .2,
				"cacheWrite": 1.25
			},
			"x-ai/grok-4.5": {
				"input": 2,
				"output": 6,
				"cacheRead": .3,
				"cacheWrite": 2
			},
			"x-ai/grok-build-0.1": {
				"input": 1,
				"output": 2,
				"cacheRead": .2,
				"cacheWrite": 1
			},
			"x-ai/grok-4.6": {
				"input": 2,
				"output": 6,
				"cacheRead": .5,
				"cacheWrite": 2
			},
			"xiaomi/mimo-v2.6-pro": {
				"input": .47,
				"output": .94,
				"cacheRead": .005,
				"cacheWrite": .47
			},
			"xiaomi/mimo-v2.5": {
				"input": .16,
				"output": .32,
				"cacheRead": .004,
				"cacheWrite": .16
			},
			"xiaomi/mimo-v2.5-pro": {
				"input": .47,
				"output": .94,
				"cacheRead": .005,
				"cacheWrite": .47
			},
			"xiaomi/mimo-v2.6-flash": {
				"input": .16,
				"output": .32,
				"cacheRead": .004,
				"cacheWrite": .16
			},
			"minimax/minimax-m2.7": {
				"input": .33,
				"output": 1.32,
				"cacheRead": .066,
				"cacheWrite": .42
			},
			"minimax/minimax-m3": {
				"input": .33,
				"output": 1.32,
				"cacheRead": .066,
				"cacheWrite": .33
			},
			"gemini/gemini-3.6-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .75
			},
			"gemini/gemini-3.5-flash-lite": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .3
			},
			"gemini/gemini-3.1-pro-preview": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2
			},
			"gemini/gemini-3.5-flash": {
				"input": 1.5,
				"output": 9,
				"cacheRead": .15,
				"cacheWrite": 1.5
			},
			"gemini/gemini-2.5-pro": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125,
				"cacheWrite": 1.25
			},
			"gemini/gemini-2.5-flash": {
				"input": .3,
				"output": 2.5,
				"cacheRead": .03,
				"cacheWrite": .3
			},
			"gemini/gemini-3.7-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .75
			},
			"gemini/gemini-3-flash-preview": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .5
			},
			"gemini/gemini-3.8-flash": {
				"input": .75,
				"output": 3.75,
				"cacheRead": .075,
				"cacheWrite": .75
			},
			"gemini/gemini-2.5-flash-lite": {
				"input": .1,
				"output": .4,
				"cacheRead": .01,
				"cacheWrite": .1
			},
			"qwen/qwen3.7-max": {
				"input": 1.88,
				"output": 5.63,
				"cacheRead": .375,
				"cacheWrite": 2.35
			},
			"qwen/qwen3.8-max": {
				"input": 1.88,
				"output": 5.63,
				"cacheRead": .23,
				"cacheWrite": 2.35
			},
			"qwen/qwen3.7-flash": {
				"input": .04,
				"output": .13,
				"cacheRead": .01,
				"cacheWrite": .04
			},
			"qwen/qwen3.8-omni-flash": {
				"input": .13,
				"output": .43,
				"cacheRead": .016,
				"cacheWrite": .13
			},
			"qwen/qwen3.6-flash": {
				"input": .19,
				"output": 1.13,
				"cacheRead": .019,
				"cacheWrite": .24
			},
			"qwen/qwen3.8-flash": {
				"input": .13,
				"output": .43,
				"cacheRead": .016,
				"cacheWrite": .2
			},
			"qwen/qwen3.6-plus": {
				"input": .32,
				"output": 1.88,
				"cacheRead": .032,
				"cacheWrite": .4
			},
			"qwen/qwen3.7-plus": {
				"input": .32,
				"output": 1.25,
				"cacheRead": .032,
				"cacheWrite": .4
			},
			"openai/gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25,
				"cacheWrite": 2.5
			},
			"openai/gpt-5.5-pro": {
				"input": 30,
				"output": 180
			},
			"openai/gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02,
				"cacheWrite": .2
			},
			"openai/gpt-6.1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1,
				"cacheWrite": 2.5
			},
			"openai/gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai/gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075,
				"cacheWrite": .15
			},
			"openai/gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075,
				"cacheWrite": .75
			},
			"openai/gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02,
				"cacheWrite": .25
			},
			"openai/gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5,
				"cacheWrite": 5
			},
			"openai/gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01,
				"cacheWrite": .125
			},
			"openai/gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai/gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4,
				"cacheWrite": 5
			},
			"openai/gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"moonshot/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3
			},
			"moonshot/kimi-k2.6": {
				"input": 1,
				"output": 4.16,
				"cacheRead": .18,
				"cacheWrite": 1
			},
			"moonshot/kimi-k2.7-code": {
				"input": 1,
				"output": 4.16,
				"cacheRead": .18,
				"cacheWrite": 1
			}
		},
		"arcee": {
			"trinity-large-thinking": {
				"input": .25,
				"output": .8,
				"cacheRead": .06
			},
			"deepseek/deepseek-v4-pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"deepseek/deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .2
			},
			"deepseek/deepseek-v4-flash-latest": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"thinkingmachines/inkling-small": {
				"input": .5,
				"output": 1.2,
				"cacheRead": .1
			},
			"moonshotai/kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"zai-org/glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			}
		},
		"drun": {
			"public/deepseek-v3": {
				"input": .28,
				"output": 1.1
			},
			"public/minimax-m25": {
				"input": .29,
				"output": 1.16
			},
			"public/deepseek-r1": {
				"input": .55,
				"output": 2.2
			}
		},
		"amd": {
			"Qwen3.8-27B": {
				"input": 0,
				"output": 0
			},
			"DeepSeek-V4.1-Flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"DeepSeek-V4-Flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"Qwen3.8-Flash-Next": {
				"input": .15,
				"output": .47,
				"cacheRead": .016
			},
			"MiniCPM5-2B": {
				"input": .124,
				"output": .7425,
				"cacheRead": .124
			},
			"DeepSeek-V4-Flash-Vision-Exp": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			}
		},
		"qvac": {
			"qwen3.5-0.8b": {
				"input": 0,
				"output": 0
			},
			"gemma4-31b": {
				"input": 0,
				"output": 0
			},
			"qwen3.6-35b-a3b": {
				"input": 0,
				"output": 0
			},
			"qwen3.5-2b": {
				"input": 0,
				"output": 0
			},
			"gpt-oss-20b": {
				"input": 0,
				"output": 0
			},
			"qwen3.5-9b": {
				"input": 0,
				"output": 0
			},
			"qwen3.5-4b": {
				"input": 0,
				"output": 0
			},
			"qwen3.6-27b": {
				"input": 0,
				"output": 0
			},
			"gpt-oss-120b": {
				"input": 0,
				"output": 0
			}
		},
		"claudinio": {
			"claudinio": {
				"input": .5,
				"output": 2,
				"cacheRead": .15
			},
			"claudius": {
				"input": 3,
				"output": 8,
				"cacheRead": .9
			}
		},
		"runinfra": {
			"Inferact/Qwen3.8-2.4T-A95B-NVFP4": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"Qwen/Qwen3.8-27B": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"deepseek-ai/DeepSeek-V4-Flash-0731": {
				"input": .13,
				"output": .27,
				"cacheRead": .01
			},
			"deepseek-ai/DeepSeek-V4-Pro-0813": {
				"input": .6,
				"output": 1.9,
				"cacheRead": .03
			},
			"zai-org/GLM-5.3-Flash": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			},
			"nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16": {
				"input": .05,
				"output": .15,
				"cacheRead": .01
			},
			"ornith-ai/Ornith-1.5-35B-A3B": {
				"input": .1,
				"output": .4,
				"cacheRead": .01
			}
		},
		"hetzner": {
			"Qwen3.8-27B": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			},
			"Qwen/Qwen3.6-35B-A3B-FP8": {
				"input": 0,
				"output": 0,
				"cacheRead": 0
			}
		},
		"digitalocean": {
			"deepseek-3.2": {
				"input": .5,
				"output": 1.6,
				"cacheRead": .15
			},
			"openai-gpt-5.5": {
				"input": 5,
				"output": 30,
				"cacheRead": .5
			},
			"openai-gpt-5.2-pro": {
				"input": 21,
				"output": 168
			},
			"all-mini-lm-l6-v2": {
				"input": .009,
				"output": 0
			},
			"multi-qa-mpnet-base-dot-v1": {
				"input": .009,
				"output": 0
			},
			"openai-gpt-image-1": {
				"input": 5,
				"output": 40,
				"cacheRead": 1.25
			},
			"anthropic-claude-3-opus": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic-claude-4.6-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic-claude-haiku-4.5": {
				"input": 1,
				"output": 5,
				"cacheRead": .1,
				"cacheWrite": 1.25
			},
			"glm-5.3-flash": {
				"input": .15,
				"output": .5,
				"cacheRead": .03
			},
			"openai-o1": {
				"input": 15,
				"output": 60,
				"cacheRead": 7.5
			},
			"deepseek-v4-flash-0731": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"anthropic-claude-opus-4.7": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"stable-diffusion-3.5-large": {
				"input": .08,
				"output": 0
			},
			"openai-gpt-6-luna": {
				"input": .1,
				"output": .5,
				"cacheRead": .01
			},
			"qwen3.8-max": {
				"input": 2,
				"output": 6,
				"cacheRead": .2
			},
			"kimi-k3": {
				"input": 3,
				"output": 15,
				"cacheRead": .3
			},
			"anthropic-claude-opus-5.5": {
				"input": 4,
				"output": 20,
				"cacheRead": .2,
				"cacheWrite": 5
			},
			"openai-gpt-6-1-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .1
			},
			"llama-4-maverick": {
				"input": .25,
				"output": .87,
				"cacheRead": .05
			},
			"openai-o3-mini": {
				"input": 1.1,
				"output": 4.4,
				"cacheRead": .55
			},
			"glm-5": {
				"input": 1,
				"output": 3.2,
				"cacheRead": .2
			},
			"deepseek-v4.1-flash": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .006
			},
			"minimax-m2.5": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06
			},
			"anthropic-claude-4.1-opus": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"anthropic-claude-sonnet-5.5": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"wan2-2-t2v-a14b": {
				"input": .6,
				"output": 0
			},
			"openai-gpt-4o": {
				"input": 2.5,
				"output": 10,
				"cacheRead": 1.25
			},
			"anthropic-claude-fable-5.1": {
				"input": 10,
				"output": 50,
				"cacheRead": .25,
				"cacheWrite": 12.5
			},
			"kimi-k2.6": {
				"input": .95,
				"output": 4,
				"cacheRead": .19
			},
			"deepseek-r1-distill-llama-70b": {
				"input": .99,
				"output": .99
			},
			"openai-gpt-5-nano": {
				"input": .05,
				"output": .4,
				"cacheRead": .005
			},
			"qwen3-embedding-0.6b": {
				"input": .04,
				"output": 0
			},
			"openai-o3": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai-gpt-5": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"openai-gpt-4.1": {
				"input": 2,
				"output": 8,
				"cacheRead": .5
			},
			"openai-gpt-5.1-codex-max": {
				"input": 1.25,
				"output": 10,
				"cacheRead": .125
			},
			"anthropic-claude-3.5-haiku": {
				"input": .8,
				"output": 4,
				"cacheRead": .08,
				"cacheWrite": 1
			},
			"anthropic-claude-3.5-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"kimi-k2.5": {
				"input": .5,
				"output": 2.7,
				"cacheRead": .203
			},
			"anthropic-claude-opus-4": {
				"input": 15,
				"output": 75,
				"cacheRead": 1.5,
				"cacheWrite": 18.75
			},
			"openai-gpt-6-astra": {
				"input": 10,
				"output": 50,
				"cacheRead": 1
			},
			"openai-gpt-image-2": {
				"input": 8,
				"output": 30
			},
			"openai-gpt-image-1.5": {
				"input": 5,
				"output": 10,
				"cacheRead": 1
			},
			"openai-gpt-4o-mini": {
				"input": .15,
				"output": .6,
				"cacheRead": .075
			},
			"qwen3-coder-flash": {
				"input": .45,
				"output": 1.7,
				"cacheRead": .09
			},
			"deepseek-4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .028
			},
			"nemotron-3-ultra-550b": {
				"input": .9,
				"output": 1.7,
				"cacheRead": .18
			},
			"openai-gpt-5.2": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"nvidia-nemotron-3-super-120b": {
				"input": .3,
				"output": .65,
				"cacheRead": .06
			},
			"deepseek-v4-pro-0813": {
				"input": 1.32,
				"output": 3.96,
				"cacheRead": .044
			},
			"mimo-v2.5-pro": {
				"input": .8,
				"output": 3,
				"cacheRead": .16
			},
			"mistral-3-14B": {
				"input": .2,
				"output": .2,
				"cacheRead": .04
			},
			"anthropic-claude-opus-5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"nemotron-3-nano-omni": {
				"input": .5,
				"output": .9,
				"cacheRead": .1
			},
			"arcee-trinity-large-thinking": {
				"input": .25,
				"output": .9,
				"cacheRead": .06
			},
			"anthropic-claude-5-sonnet": {
				"input": 2,
				"output": 10,
				"cacheRead": .2,
				"cacheWrite": 2.5
			},
			"openai-gpt-5.4-pro": {
				"input": 30,
				"output": 180
			},
			"llama3-8b-instruct": {
				"input": .198,
				"output": .198
			},
			"llama3.3-70b-instruct": {
				"input": .65,
				"output": .65
			},
			"openai-gpt-oss-120b": {
				"input": .1,
				"output": .7,
				"cacheRead": .02
			},
			"alibaba-qwen3-32b": {
				"input": .25,
				"output": .55
			},
			"openai-gpt-5.3-codex": {
				"input": 1.75,
				"output": 14,
				"cacheRead": .175
			},
			"qwen3.5-397b-a17b": {
				"input": .55,
				"output": 3.5,
				"cacheRead": .111
			},
			"anthropic-claude-3.7-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"anthropic-claude-opus-4.8": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"openai-gpt-5.6-luna": {
				"input": .2,
				"output": 1.2,
				"cacheRead": .02
			},
			"glm-5.2": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .21
			},
			"openai-gpt-6-sol": {
				"input": 2,
				"output": 10,
				"cacheRead": .2
			},
			"anthropic-claude-4.5-sonnet": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			},
			"bge-m3": {
				"input": .02,
				"output": 0
			},
			"openai-gpt-5.6-sol": {
				"input": 4,
				"output": 20,
				"cacheRead": .4
			},
			"glm-5.1": {
				"input": 1.3,
				"output": 4.3,
				"cacheRead": .26
			},
			"openai-gpt-5.4-nano": {
				"input": .2,
				"output": 1.25,
				"cacheRead": .02
			},
			"bge-reranker-v2-m3": {
				"input": .01,
				"output": 0
			},
			"nemotron-nano-12b-v2-vl": {
				"input": .2,
				"output": .6,
				"cacheRead": .04
			},
			"openai-gpt-5.4-mini": {
				"input": .75,
				"output": 4.5,
				"cacheRead": .075
			},
			"openai-gpt-5-mini": {
				"input": .25,
				"output": 2,
				"cacheRead": .025
			},
			"anthropic-claude-opus-4.6": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"e5-large-v2": {
				"input": .02,
				"output": 0
			},
			"anthropic-claude-opus-4.5": {
				"input": 5,
				"output": 25,
				"cacheRead": .5,
				"cacheWrite": 6.25
			},
			"deepseek-v4-pro": {
				"input": 1.74,
				"output": 3.48,
				"cacheRead": .348
			},
			"gemma-4-31B-it": {
				"input": .18,
				"output": .5,
				"cacheRead": .036
			},
			"openai-gpt-5.6-terra": {
				"input": 2,
				"output": 12,
				"cacheRead": .2
			},
			"glm-5.3": {
				"input": 1.4,
				"output": 4.4,
				"cacheRead": .26
			},
			"gte-large-en-v1.5": {
				"input": .09,
				"output": 0
			},
			"anthropic-claude-fable-5": {
				"input": 10,
				"output": 50,
				"cacheRead": 1,
				"cacheWrite": 12.5
			},
			"openai-gpt-oss-20b": {
				"input": .05,
				"output": .45,
				"cacheRead": .01
			},
			"openai-gpt-5.4": {
				"input": 2.5,
				"output": 15,
				"cacheRead": .25
			},
			"mistral-nemo-instruct-2407": {
				"input": .3,
				"output": .3
			},
			"anthropic-claude-sonnet-4": {
				"input": 3,
				"output": 15,
				"cacheRead": .3,
				"cacheWrite": 3.75
			}
		},
		"aixy": { "openai/gpt-4.1-mini": {
			"input": .4,
			"output": 1.6,
			"cacheRead": .1
		} },
		"alibaba-cn": {
			"qwen-flash": {
				"input": .022,
				"output": .216
			},
			"qwen3.5-flash": {
				"input": .029,
				"output": .287,
				"reasoning": .287
			},
			"qwen2-5-coder-32b-instruct": {
				"input": .287,
				"output": .861
			},
			"deepseek-v3-2-exp": {
				"input": .287,
				"output": .431
			},
			"deepseek-r1-distill-qwen-14b": {
				"input": .144,
				"output": .431
			},
			"qwen-math-plus": {
				"input": .574,
				"output": 1.721
			},
			"qwen-deep-research": {
				"input": 7.742,
				"output": 23.367
			},
			"qwen3.7-max": {
				"input": 2.5,
				"output": 7.5,
				"cacheRead": .5,
				"cacheWrite": 3.125
			},
			"qwen2-5-32b-instruct": {
				"input": .287,
				"output": .861
			},
			"qwq-plus": {
				"input": .23,
				"output": .574
			},
			"qwq-32b": {
				"input": .287,
				"output": .861
			},
			"qwen2-5-vl-72b-instruct": {
				"input": 2.294,
				"output": 6.881
			},
			"deepseek-v3-1": {
				"input": .574,
				"output": 1.721
			},
			"qwen3-vl-plus": {
				"input": .143353,
				"output": 1.433525,
				"reasoning": 4.300576
			},
			"qwen-plus-character": {
				"input": .115,
				"output": .287
			},
			"qwen-max": {
				"input": .345,
				"output": 1.377
			},
			"qwen3-next-80b-a3b-thinking": {
				"input": .144,
				"output": 1.434
			},
			"qwen3.8-max": {
				"input": 1.77744,
				"output": 5.33231,
				"cacheRead": .22218,
				"cacheWrite": 2.22179
			},
			"kimi-k3": {
				"input": 2.827,
				"output": 14.133,
				"cacheRead": .283
			},
			"qwen2-5-math-7b-instruct": {
				"input": .144,
				"output": .287
			},
			"qwen3.5-plus": {
				"input": .115,
				"output": .688,
				"reasoning": .688
			},
			"qwen2-5-72b-instruct": {
				"input": .574,
				"output": 1.721
			},
			"glm-5": {
				"input": .573,
				"output": 2.58
			},
			"deepseek-v4.1-flash": {
				"input": .29754,
				"output": 1.19015,
				"cacheRead": .01488
			},
			"deepseek-r1-distill-llama-8b": {
				"input": 0,
				"output": 0
			},
			"qwen3-32b": {
				"input": .287,
				"output": 1.147,
				"reasoning": 2.868
			},
			"qwen2-5-coder-7b-instruct": {
				"input": .144,
				"output": .287
			},
			"qwen-plus": {
				"input": .115,
				"output": .287,
				"reasoning": 1.147,
				"cacheRead": .012,
				"cacheWrite": .144
			},
			"qwen3.7-flash": {
				"input": .02962,
				"output": .1185,
				"cacheRead": .002962,
				"cacheWrite": .03703
			},
			"kimi-k2.6": {
				"input": .929,
				"output": 3.858
			},
			"qwen3-max": {
				"input": .359,
				"output": 1.434,
				"reasoning": 1.434
			},
			"qwen-omni-turbo-realtime": {
				"input": .23,
				"output": .918
			},
			"deepseek-v3": {
				"input": .287,
				"output": 1.147
			},
			"deepseek-r1-distill-llama-70b": {
				"input": .287,
				"output": .861
			},
			"qwen3-coder-480b-a35b-instruct": {
				"input": .861,
				"output": 3.441
			},
			"qwen-turbo": {
				"input": .044,
				"output": .087,
				"reasoning": .431
			},
			"deepseek-r1-distill-qwen-7b": {
				"input": .072,
				"output": .144
			},
			"qwen2-5-math-72b-instruct": {
				"input": .574,
				"output": 1.721
			},
			"qwen3-coder-30b-a3b-instruct": {
				"input": .216,
				"output": .861
			},
			"qwen-doc-turbo": {
				"input": .087,
				"output": .144
			},
			"kimi-k2-thinking": {
				"input": .574,
				"output": 2.294
			},
			"qwen3.8-omni-flash": {
				"input": .113,
				"output": .382,
				"cacheRead": .014
			},
			"qvq-max": {
				"input": 1.147,
				"output": 4.588
			},
			"qwen2-5-7b-instruct": {
				"input": .072,
				"output": .144
			},
			"qwen3-omni-flash": {
				"input": .058,
				"output": .23
			},
			"qwen-vl-max": {
				"input": .23,
				"output": .574
			},
			"qwen3-235b-a22b": {
				"input": .287,
				"output": 1.147,
				"reasoning": 2.868
			},
			"qwen3-vl-30b-a3b": {
				"input": .108,
				"output": .431,
				"reasoning": 1.076
			},
			"kimi-k2.5": {
				"input": .574,
				"output": 2.411
			},
			"qwen3-next-80b-a3b-instruct": {
				"input": .144,
				"output": .574
			},
			"qwen-vl-plus": {
				"input": .115,
				"output": .287
			},
			"deepseek-r1-distill-qwen-1-5b": {
				"input": 0,
				"output": 0
			},
			"qwen3.6-flash": {
				"input": .1875,
				"output": 1.125,
				"cacheWrite": .234375
			},
			"qwen3-coder-flash": {
				"input": .144,
				"output": .574
			},
			"qwen2-5-omni-7b": {
				"input": .087,
				"output": .345
			},
			"qwen-mt-plus": {
				"input": .259,
				"output": .775
			},
			"tongyi-intent-detect-v3": {
				"input": .058,
				"output": .144
			},
			"qwen3-vl-235b-a22b": {
				"input": .286705,
				"output": 1.14682,
				"reasoning": 2.867051
			},
			"qwen3-coder-plus": {
				"input": .574,
				"output": 2.296
			},
			"moonshot-kimi-k2-instruct": {
				"input": .574,
				"output": 2.294
			},
			"MiniMax-M2.5": {
				"input": .3,
				"output": 1.2
			},
			"qwen2-5-14b-instruct": {
				"input": .144,
				"output": .431
			},
			"qwen3.8-flash": {
				"input": .11875,
				"output": .40073,
				"cacheRead": .01187,
				"cacheWrite": .14844
			},
			"qwen2-5-vl-7b-instruct": {
				"input": .287,
				"output": .717
			},
			"qwen-math-turbo": {
				"input": .287,
				"output": .861
			},
			"qwen-long": {
				"input": .072,
				"output": .287
			},
			"qwen3.6-max-preview": {
				"input": 1.32,
				"output": 7.9,
				"cacheRead": .132
			},
			"qwen-mt-turbo": {
				"input": .101,
				"output": .28
			},
			"qwen3.5-397b-a17b": {
				"input": .172,
				"output": 1.032,
				"reasoning": 1.032
			},
			"qwen3-8b": {
				"input": .072,
				"output": .287,
				"reasoning": .717
			},
			"glm-5.2": {
				"input": 1.1,
				"output": 3.851,
				"cacheRead": .275,
				"cacheWrite": 0
			},
			"qwen-omni-turbo": {
				"input": .058,
				"output": .23
			},
			"glm-5.1": {
				"input": .825,
				"output": 3.301,
				"cacheRead": .17
			},
			"qwen3-omni-flash-realtime": {
				"input": .23,
				"output": .918
			},
			"qwen3-asr-flash": {
				"input": .032,
				"output": .032
			},
			"deepseek-r1-distill-qwen-32b": {
				"input": .287,
				"output": .861
			},
			"deepseek-r1": {
				"input": .574,
				"output": 2.294
			},
			"deepseek-v4-pro": {
				"input": .435,
				"output": .87,
				"cacheRead": .003625
			},
			"deepseek-r1-0528": {
				"input": .574,
				"output": 2.294
			},
			"qwen3.6-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"qwen3-14b": {
				"input": .144,
				"output": .574,
				"reasoning": 1.434
			},
			"glm-5.3": {
				"input": 1.1,
				"output": 3.851,
				"cacheRead": .275,
				"cacheWrite": 0
			},
			"qwen3.7-plus": {
				"input": .5,
				"output": 3,
				"cacheRead": .05,
				"cacheWrite": .625
			},
			"deepseek-v4-flash": {
				"input": .14,
				"output": .28,
				"cacheRead": .0028
			},
			"qwen-vl-ocr": {
				"input": .043,
				"output": .072
			},
			"siliconflow/deepseek-v3-0324": {
				"input": .25,
				"output": 1
			},
			"siliconflow/deepseek-v3.1-terminus": {
				"input": .27,
				"output": 1
			},
			"siliconflow/deepseek-r1-0528": {
				"input": .5,
				"output": 2.18
			},
			"siliconflow/deepseek-v3.2": {
				"input": .27,
				"output": .42
			},
			"kimi/kimi-k2.5": {
				"input": .6,
				"output": 3,
				"cacheRead": .1
			},
			"MiniMax/MiniMax-M2.7": {
				"input": .3,
				"output": 1.2,
				"cacheRead": .06,
				"cacheWrite": .375
			}
		}
	}
};
//#endregion
//#region src/pricing/schema.ts
/**
* @dsh-stats/pricing — price table schemas.
*
* All rates are USD per million tokens ($/Mtok), matching models.dev
* `cost` blocks. A snapshot carries its provenance so the summary route can
* report exactly which price table produced each cost figure.
*/
/** Per-model rates in USD per million tokens; every leg optional. */
const PriceEntrySchema = looseObject({
	input: number().min(0).optional(),
	output: number().min(0).optional(),
	reasoning: number().min(0).optional(),
	cacheRead: number().min(0).optional(),
	cacheWrite: number().min(0).optional()
});
/**
* Compressed snapshot: provider -> model id -> rates, plus provenance.
* Built by `scripts/update-pricing.ts` from models.dev; shipped inside the
* package so cost math works fully offline.
*/
const PricingSnapshotSchema = looseObject({
	source: string(),
	version: string(),
	updatedAt: string(),
	providers: record(string(), record(string(), PriceEntrySchema))
});
record(string(), number().min(0));
//#endregion
//#region src/pricing/lookup.ts
const normalize = (value) => value.toLowerCase();
/** Resolve the rate entry for a model, or `null` when unpriced. */
function lookupPrice(model, provider, snapshot) {
	if (model === null) return null;
	const want = normalize(model);
	if (provider !== null) {
		const table = snapshot.providers[provider] ?? snapshot.providers[normalize(provider)];
		if (table !== void 0) {
			for (const [id, entry] of Object.entries(table)) if (normalize(id) === want) return {
				entry,
				source: `snapshot:${provider}/${id}`
			};
		}
	}
	for (const [providerId, table] of Object.entries(snapshot.providers)) for (const [id, entry] of Object.entries(table)) if (normalize(id) === want) return {
		entry,
		source: `snapshot:${providerId}/${id}`
	};
	return null;
}
function leg(tokens, rate) {
	if (tokens === null || tokens === void 0 || rate === void 0) return 0;
	return tokens * rate / 1e6;
}
/** Convert token counts to USD under a rate entry. */
function costOf(tokens, entry) {
	const reasoningRate = entry.reasoning ?? entry.output;
	const total = leg(tokens.inputTokens, entry.input) + leg(tokens.outputTokens, entry.output) + leg(tokens.reasoningTokens, reasoningRate) + leg(tokens.cacheReadTokens, entry.cacheRead) + leg(tokens.cacheWriteTokens, entry.cacheWrite);
	return Number(total.toFixed(6));
}
/** Full pricing: custom override wins, then snapshot, then unknown. */
function priceSample(input) {
	if (input.model !== null) {
		const custom = input.customPricing[input.model] ?? input.customPricing[normalize(input.model)];
		if (custom !== void 0 && (input.outputTokens !== null || input.inputTokens !== null)) {
			if (input.outputTokens !== null) return {
				costUsd: Number((input.outputTokens * custom / 1e6).toFixed(6)),
				costSource: `custom:${input.model}`,
				kind: "custom"
			};
		}
	}
	const found = lookupPrice(input.model, input.provider, input.snapshot);
	if (found === null) return {
		costUsd: null,
		costSource: null,
		kind: "unknown"
	};
	if (!(input.inputTokens !== null || input.outputTokens !== null || input.reasoningTokens !== null)) return {
		costUsd: null,
		costSource: null,
		kind: "unknown"
	};
	return {
		costUsd: costOf(input, found.entry),
		costSource: found.source,
		kind: "snapshot"
	};
}
//#endregion
//#region src/pricing/index.ts
/**
* @dsh-stats/pricing — model price lookup and tokens-to-USD math.
*
* Zero DSH dependencies. Ships a compressed models.dev snapshot
* so cost math works fully offline; refresh with `pnpm update-pricing`.
*/
/** Validated bundled snapshot (throws at import time if corrupted). */
const snapshot = PricingSnapshotSchema.parse(pricing_default);
/** Validated bundled snapshot (throws at call time if corrupted). */
function loadSnapshot() {
	return snapshot;
}
//#endregion
export { string as C, object as S, array as _, summarizeSpeed as a, looseObject as b, createFileStore as c, sampleOf as d, ConfigSchema as f, parseSampleLine as g, UsageSchema as h, parseRequestSpeedLine as i, createJsonlStore as l, StreamRecordSchema as m, priceSample as n, CSV_HEADER as o, MessageSourceSchema as p, SPEED_WINDOWS as r, toCsvRow as s, loadSnapshot as t, measuredTps as u, boolean as v, unknown as w, number as x, literal as y };
