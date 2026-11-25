import { C as string, S as object, _ as array, a as summarizeSpeed, b as looseObject, c as createFileStore, d as sampleOf, f as ConfigSchema, g as parseSampleLine, h as UsageSchema, i as parseRequestSpeedLine, l as createJsonlStore, m as StreamRecordSchema, n as priceSample, p as MessageSourceSchema, r as SPEED_WINDOWS, s as toCsvRow, t as loadSnapshot, v as boolean, w as unknown, x as number, y as literal } from "./pricing.mjs";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
//#region src/core/aggregate.ts
/** Linear-interpolated quantile over a pre-sorted array. */
function quantile(sorted, q) {
	if (sorted.length === 0) return null;
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	const upper = sorted[base + 1];
	const lower = sorted[base];
	if (lower === void 0) return null;
	return upper !== void 0 ? lower + rest * (upper - lower) : lower;
}
function mean(values) {
	if (values.length === 0) return null;
	let total = 0;
	for (const value of values) total += value;
	return total / values.length;
}
const round2 = (value) => Number(value.toFixed(2));
/** Display name for a step sample: model, else provider, else `unknown`. */
function modelNameOf(sample) {
	return sample.model ?? sample.provider ?? "unknown";
}
function newModelAcc(provider) {
	return {
		provider,
		steps: 0,
		inputTokens: 0,
		outputTokens: 0,
		reasoningTokens: 0,
		costUsd: 0,
		costPriced: false,
		unpricedSteps: 0,
		busyMs: 0,
		tps: [],
		outTok: [],
		thinkShare: [],
		shareEstimatedCount: 0,
		outIn: []
	};
}
function foldStep(acc, sample) {
	acc.steps += 1;
	if (typeof sample.inputTokens === "number") acc.inputTokens += sample.inputTokens;
	if (typeof sample.outputTokens === "number") {
		acc.outputTokens += sample.outputTokens;
		acc.outTok.push(sample.outputTokens);
	}
	if (typeof sample.reasoningTokens === "number") acc.reasoningTokens += sample.reasoningTokens;
	if (typeof sample.costUsd === "number") {
		acc.costUsd += sample.costUsd;
		acc.costPriced = true;
	} else if (typeof sample.outputTokens === "number" || typeof sample.inputTokens === "number") acc.unpricedSteps += 1;
	if (typeof sample.ttftMs === "number") acc.busyMs += sample.ttftMs;
	acc.busyMs += sample.decodeMs;
	if (typeof sample.tps === "number" && sample.tps > 0) acc.tps.push(sample.tps);
	if (typeof sample.outputTokens === "number" && typeof sample.inputTokens === "number" && sample.inputTokens > 0) acc.outIn.push(sample.outputTokens / sample.inputTokens);
	if (typeof sample.reasoningTokens === "number" && typeof sample.outputTokens === "number" && sample.outputTokens > 0) acc.thinkShare.push(sample.reasoningTokens / sample.outputTokens);
	else if (sample.reasoningChars > 0) {
		const total = sample.reasoningChars + sample.textChars;
		if (total > 0) {
			acc.thinkShare.push(sample.reasoningChars / total);
			acc.shareEstimatedCount += 1;
		}
	}
}
function toModelSummary(name, acc) {
	const tpsSorted = [...acc.tps].sort((a, b) => a - b);
	const mu = mean(acc.tps);
	const medShareSorted = [...acc.thinkShare].sort((a, b) => a - b);
	return {
		model: name,
		provider: acc.provider,
		steps: acc.steps,
		inputTokens: acc.inputTokens,
		outputTokens: acc.outputTokens,
		reasoningTokens: acc.reasoningTokens,
		costUsd: acc.costPriced ? round2(acc.costUsd) : null,
		unpricedSteps: acc.unpricedSteps,
		busyMs: Math.round(acc.busyMs),
		tpsN: acc.tps.length,
		tpsMean: mu === null ? null : round2(mu),
		tpsMedian: round2If(quantile(tpsSorted, .5)),
		tpsQ1: round2If(quantile(tpsSorted, .25)),
		tpsQ3: round2If(quantile(tpsSorted, .75)),
		tpsMin: tpsSorted[0] ?? null,
		tpsMax: tpsSorted[tpsSorted.length - 1] ?? null,
		tpsP10: round2If(quantile(tpsSorted, .1)),
		tpsP90: round2If(quantile(tpsSorted, .9)),
		medOutputTokens: round2If(quantile([...acc.outTok].sort((a, b) => a - b), .5)),
		medThinkShare: round2If4(quantile(medShareSorted, .5)),
		thinkShareEstimated: acc.thinkShare.length > 0 && acc.shareEstimatedCount === acc.thinkShare.length,
		medOutIn: round2If4(quantile([...acc.outIn].sort((a, b) => a - b), .5))
	};
}
function round2If(value) {
	return value === null ? null : round2(value);
}
function round2If4(value) {
	return value === null ? null : Number(value.toFixed(4));
}
function toToolSummary(tool, acc) {
	const sorted = [...acc.durations].sort((a, b) => a - b);
	const err = acc.calls - acc.ok;
	return {
		tool,
		calls: acc.calls,
		ok: acc.ok,
		err,
		errRate: acc.calls === 0 ? null : Number((err / acc.calls).toFixed(4)),
		meanMs: round2If(mean(acc.durations)),
		p50Ms: round2If(quantile(sorted, .5))
	};
}
/**
* Fold parsed samples into the summary payload served at
* `/dsh-stats/summary.json`. Rows with `tps: null` are re-checked under the
* current measurability rule so data recorded before the guard cannot skew
* aggregates; unknown-model pricing is reported, never thrown.
*/
function summarize(samples, options) {
	const byModel = /* @__PURE__ */ new Map();
	const byTool = /* @__PURE__ */ new Map();
	const byHour = Array.from({ length: 24 }, () => 0);
	const sessions = /* @__PURE__ */ new Set();
	let measurable = 0;
	let unmeasurable = 0;
	let toolCalls = 0;
	for (const sample of samples) if (sample.kind === "step") {
		const name = modelNameOf(sample);
		let acc = byModel.get(name);
		if (acc === void 0) {
			acc = newModelAcc(sample.provider);
			byModel.set(name, acc);
		}
		foldStep(acc, sample);
		if (typeof sample.tps === "number" && sample.tps > 0) measurable += 1;
		else if (sample.unmeasurable === true) unmeasurable += 1;
		if (sample.sessionId !== void 0) sessions.add(sample.sessionId);
		const hour = new Date(sample.time).getHours();
		const slot = byHour[hour];
		if (slot !== void 0) byHour[hour] = slot + 1;
	} else if (sample.kind === "tool") {
		let acc = byTool.get(sample.tool);
		if (acc === void 0) {
			acc = {
				calls: 0,
				ok: 0,
				durations: []
			};
			byTool.set(sample.tool, acc);
		}
		acc.calls += 1;
		if (sample.ok) acc.ok += 1;
		acc.durations.push(sample.durationMs);
		toolCalls += 1;
		if (sample.sessionId !== void 0) sessions.add(sample.sessionId);
	} else sessions.add(sample.sessionId);
	const models = [...byModel.entries()].map(([name, acc]) => toModelSummary(name, acc));
	models.sort((a, b) => (b.costUsd ?? 0) - (a.costUsd ?? 0) || b.steps - a.steps);
	const tools = [...byTool.entries()].map(([tool, acc]) => toToolSummary(tool, acc));
	tools.sort((a, b) => b.calls - a.calls);
	const unknownModels = models.filter((entry) => entry.unpricedSteps > 0).map((entry) => entry.model);
	const times = samples.map((sample) => sample.time).sort((a, b) => a - b);
	return {
		samples: samples.length,
		skippedLines: options.skippedLines,
		measurable,
		unmeasurable,
		oldest: times[0] ?? null,
		newest: times[times.length - 1] ?? null,
		fileBytes: options.fileBytes,
		retention: options.retention,
		pricing: {
			source: options.pricingSource,
			version: options.pricingVersion,
			updatedAt: options.pricingUpdatedAt,
			unknownModels
		},
		models,
		tools,
		activity: {
			sessions: sessions.size,
			steps: [...byModel.values()].reduce((total, acc) => total + acc.steps, 0),
			toolCalls,
			byHour
		}
	};
}
//#endregion
//#region src/harness.ts
/**
* Minimal typed adapter for the DeepSeek Harness Host plugin surface.
*
* There is no official plugin `@types` package: the Host hands the bundle an
* untyped `ctx` object and untyped `session`/`event` payloads. Instead of
* `any`, this module declares the smallest structural interfaces the plugin
* actually touches, and every payload crossing the boundary is validated
* with zod (`safeParse`) before use. Anything the Harness changes shape on
* fails closed (event skipped, never thrown).
*
* References: `session/event` + `session/disposed` emit signatures and the
* `webServer` + `webserver/index-inject` contracts from the Host inspect
* catalog; `tools/result` emit observation.
*/
/** `step/start` marker: only the wall time matters. */
const StepStartSchema = looseObject({
	type: literal("step/start"),
	time: number()
});
/** `assistant/message` carrier: stream records + usage + model source. */
const AssistantMessageDataSchema = object({
	turn: number().nullable().optional(),
	step: number().nullable().optional(),
	interrupted: boolean().optional(),
	stream: array(unknown()).default([]),
	usage: unknown().optional(),
	message: object({ source: unknown().optional() }).optional()
});
const AssistantMessageSchema = object({
	type: literal("assistant/message"),
	time: number(),
	data: AssistantMessageDataSchema
});
/**
* Validate a raw `session/event` payload. Returns the step-start time, a
* validated assistant-message view, or `null` for irrelevant/unparseable
* events. Never throws.
*/
function viewSessionEvent(event) {
	const start = StepStartSchema.safeParse(event);
	if (start.success) return {
		kind: "step-start",
		time: start.data.time
	};
	const parsed = AssistantMessageSchema.safeParse(event);
	if (!parsed.success) return null;
	const payload = parsed.data;
	const stream = [];
	for (const record of payload.data.stream) {
		const recordParsed = StreamRecordSchema.safeParse(record);
		if (recordParsed.success) stream.push(recordParsed.data);
	}
	const usageParsed = UsageSchema.safeParse(payload.data.usage ?? void 0);
	const sourceParsed = MessageSourceSchema.safeParse(payload.data.message?.source ?? void 0);
	return {
		kind: "assistant-message",
		view: {
			eventTime: payload.time,
			turn: payload.data.turn ?? null,
			step: payload.data.step ?? null,
			interrupted: payload.data.interrupted === true,
			stream,
			usage: usageParsed.success ? usageParsed.data : null,
			source: sourceParsed.success ? sourceParsed.data : null
		}
	};
}
/** `tools/result` observation: tool name, wall duration, ok/err tag. */
const ToolExecSchema = looseObject({
	tool: string().optional(),
	name: string().optional(),
	durationMs: number().optional(),
	startedAt: number().optional(),
	endedAt: number().optional()
});
const ToolResultSchema = looseObject({
	ok: boolean().optional(),
	error: unknown().optional(),
	errorKind: string().optional(),
	kind: string().optional()
});
/**
* Validate a raw `tools/result` emission. Duration prefers an explicit
* `durationMs`, else `endedAt - startedAt`, else 0. Never throws.
*/
function viewToolResult(exec, result) {
	const execParsed = ToolExecSchema.safeParse(exec);
	if (!execParsed.success) return null;
	const tool = execParsed.data.tool ?? execParsed.data.name;
	if (tool === void 0) return null;
	let durationMs = execParsed.data.durationMs ?? 0;
	if ((execParsed.data.durationMs === void 0 || !Number.isFinite(execParsed.data.durationMs)) && execParsed.data.startedAt !== void 0 && execParsed.data.endedAt !== void 0) durationMs = Math.max(0, execParsed.data.endedAt - execParsed.data.startedAt);
	const resultParsed = ToolResultSchema.safeParse(result);
	let ok = true;
	let errorKind = null;
	if (resultParsed.success) {
		if (typeof resultParsed.data.ok === "boolean") ok = resultParsed.data.ok;
		else if (resultParsed.data.error !== void 0) ok = false;
		errorKind = resultParsed.data.errorKind ?? resultParsed.data.kind ?? (resultParsed.data.error === void 0 ? null : "error");
		if (ok) errorKind = null;
	}
	return {
		tool,
		durationMs: Math.max(0, durationMs),
		ok,
		errorKind
	};
}
//#endregion
//#region src/collectors.ts
/**
* Event collectors: Harness events -> core samples.
*
* Stateless folds (pure functions over validated views) so they are trivially
* unit-testable without a Host. Rate limiting and session bookkeeping live in
* the host entry; pricing enrichment happens here where the snapshot is in
* scope.
*/
/**
* Fold one validated assistant message into a priced step sample.
* `record: false` means "below the sample interval — skip".
*/
function collectStep(sessionId, view, stepStartTime, lastRecordedAt, ctx) {
	if (view.eventTime - lastRecordedAt < ctx.config.sampleMinIntervalMs) return null;
	const sample = sampleOf({
		sessionId,
		eventTime: view.eventTime,
		turn: view.turn,
		step: view.step,
		interrupted: view.interrupted,
		source: view.source,
		stream: view.stream,
		usage: view.usage,
		stepStartTime,
		config: ctx.config
	});
	if (sample === null) return null;
	const priced = priceSample({
		model: sample.model,
		provider: sample.provider,
		inputTokens: sample.inputTokens,
		outputTokens: sample.outputTokens,
		reasoningTokens: sample.reasoningTokens,
		customPricing: ctx.config.customPricing,
		snapshot: ctx.snapshot
	});
	sample.costUsd = priced.costUsd;
	sample.costSource = priced.costSource;
	return {
		sample,
		record: true
	};
}
/** Fold one tools/result emission into a tool sample. */
function collectTool(time, sessionId, exec, result, includeSessionIds) {
	const observation = viewToolResult(exec, result);
	if (observation === null) return null;
	const sample = {
		kind: "tool",
		time,
		tool: observation.tool,
		durationMs: observation.durationMs,
		ok: observation.ok,
		errorKind: observation.errorKind
	};
	if (includeSessionIds && sessionId !== void 0) sample.sessionId = sessionId;
	return sample;
}
/** Route one raw `session/event` payload through validation + collection. */
function collectSessionEvent(sessionId, event, stepStartTime, lastRecordedAt, ctx) {
	const viewed = viewSessionEvent(event);
	if (viewed === null) return { kind: "ignore" };
	if (viewed.kind === "step-start") return {
		kind: "step-start",
		sessionId,
		time: viewed.time
	};
	const outcome = collectStep(sessionId, viewed.view, stepStartTime, lastRecordedAt, ctx);
	if (outcome === null) return { kind: "ignore" };
	return {
		kind: "step",
		outcome
	};
}
//#endregion
//#region node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.5/node_modules/@deepseek-ai/cosmokit/lib/index.js
/** Return true when a value is `null` or `undefined`. */
function isNullable(value) {
	return value === null || value === void 0;
}
/** Return true for non-array object values. */
function isPlainObject(data) {
	return data && typeof data === "object" && !Array.isArray(data);
}
/** Filter object entries and return a new object. */
function filterKeys(object, filter) {
	return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
/** Map object values while preserving the original key set. */
function mapValues(object, transform) {
	return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
/** Pick selected keys from an object, optionally including `undefined` values. */
function pick(source, keys, forced) {
	if (!keys) return { ...source };
	const result = {};
	for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
	return result;
}
/** Shared config references used by schema validators and plugin runtimes. */
const write = Symbol.for("cosmokit.volatile.write");
function snapshot(value, ancestors = /* @__PURE__ */ new Set()) {
	if (typeof value === "function") throw new TypeError("volatile config cannot contain functions");
	if (value === null || typeof value !== "object") return value;
	if (ancestors.has(value)) throw new TypeError("volatile config cannot contain cycles");
	ancestors.add(value);
	try {
		if (Array.isArray(value)) return Object.freeze(value.map((item) => snapshot(item, ancestors)));
		if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError("volatile config objects must be plain objects or arrays");
		return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshot(item, ancestors)])));
	} finally {
		ancestors.delete(value);
	}
}
/**
* Create a detached reference containing an immutable copy of the supplied data.
* @param value - validated config data; class instances and functions are unsupported.
* @returns a reference whose value is updated only by its owning runtime.
*/
function createVolatile(value) {
	let current = snapshot(value);
	return Object.freeze({
		get: () => current,
		[write]: (value) => {
			current = value;
		}
	});
}
/**
* Identify references across ESM/CJS copies of the shared library.
* @param value - a parsed config value.
* @returns whether the value implements the shared reference protocol.
*/
function isVolatile(value) {
	return typeof value === "object" && value !== null && write in value;
}
/** Test values using `instanceof` with a `toStringTag` fallback. */
function is(type, value) {
	if (arguments.length === 1) return (value) => is(type, value);
	return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
	return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
	return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
/** Binary source detection and base64/hex conversion helpers. */
var Binary;
(function(Binary) {
	Binary.is = isArrayBufferLike;
	Binary.isSource = isArrayBufferSource;
	function fromSource(source) {
		if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
		else return source;
	}
	Binary.fromSource = fromSource;
	function toBase64(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
		let binary = "";
		const bytes = new Uint8Array(source);
		for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}
	Binary.toBase64 = toBase64;
	function fromBase64(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
		return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
	}
	Binary.fromBase64 = fromBase64;
	function toHex(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
		return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	Binary.toHex = toHex;
	function fromHex(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
		const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
		const buffer = [];
		for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
		return Uint8Array.from(buffer).buffer;
	}
	Binary.fromHex = fromHex;
})(Binary || (Binary = {}));
Binary.fromBase64;
Binary.toBase64;
Binary.fromHex;
Binary.toHex;
/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
function clone(source, refs = /* @__PURE__ */ new Map()) {
	if (!source || typeof source !== "object") return source;
	if (is("Date", source)) return new Date(source.valueOf());
	if (is("RegExp", source)) return new RegExp(source.source, source.flags);
	if (isArrayBufferLike(source)) return source.slice(0);
	if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
	const cached = refs.get(source);
	if (cached) return cached;
	if (Array.isArray(source)) {
		const result = [];
		refs.set(source, result);
		source.forEach((value, index) => {
			result[index] = Reflect.apply(clone, null, [value, refs]);
		});
		return result;
	}
	const result = Object.create(Object.getPrototypeOf(source));
	refs.set(source, result);
	for (const key of Reflect.ownKeys(source)) {
		const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
		if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
		Reflect.defineProperty(result, key, descriptor);
	}
	return result;
}
/**
* Compare values recursively, treating two volatile references as equal regardless of value.
* Strict comparison distinguishes null/undefined, treats opaque objects by identity,
* compares URLs by normalized href, treats array holes as undefined, and considers distinct cyclic structures unequal.
* @param a - first value.
* @param b - second value.
* @param strict - whether to require strict data equality outside volatile references.
* @returns whether the values compare equal.
*/
function deepEqual(a, b, strict) {
	const ancestors = /* @__PURE__ */ new Set();
	function compare(a, b) {
		if (a === b) return true;
		if (isVolatile(a) || isVolatile(b)) return isVolatile(a) && isVolatile(b);
		if (!strict && isNullable(a) && isNullable(b)) return true;
		if (typeof a !== typeof b || typeof a !== "object" || !a || !b) return false;
		if (ancestors.has(a)) return false;
		function check(test, then) {
			return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
		}
		ancestors.add(a);
		try {
			return check(Array.isArray, (a, b) => {
				if (a.length !== b.length) return false;
				for (let index = 0; index < a.length; index++) if (!compare(a[index], b[index])) return false;
				return true;
			}) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("URL"), (a, b) => a.href === b.href) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
				if (a.byteLength !== b.byteLength) return false;
				const viewA = new Uint8Array(a);
				const viewB = new Uint8Array(b);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? ((!strict || [a, b].every((value) => Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) && Object.keys({
				...a,
				...b
			}).every((key) => compare(a[key], b[key])));
		} finally {
			ancestors.delete(a);
		}
	}
	return compare(a, b);
}
/** Time constants plus parsing and formatting helpers. */
var Time;
(function(Time) {
	Time.millisecond = 1;
	Time.second = 1e3;
	Time.minute = Time.second * 60;
	Time.hour = Time.minute * 60;
	Time.day = Time.hour * 24;
	Time.week = Time.day * 7;
	let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
	function setTimezoneOffset(offset) {
		timezoneOffset = offset;
	}
	Time.setTimezoneOffset = setTimezoneOffset;
	function getTimezoneOffset() {
		return timezoneOffset;
	}
	Time.getTimezoneOffset = getTimezoneOffset;
	function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
		if (typeof date === "number") date = new Date(date);
		if (offset === void 0) offset = timezoneOffset;
		return Math.floor((date.valueOf() / Time.minute - offset) / 1440);
	}
	Time.getDateNumber = getDateNumber;
	function fromDateNumber(value, offset) {
		const date = new Date(value * Time.day);
		if (offset === void 0) offset = timezoneOffset;
		return new Date(+date + offset * Time.minute);
	}
	Time.fromDateNumber = fromDateNumber;
	const numeric = /\d+(?:\.\d+)?/.source;
	const timeRegExp = new RegExp(`^${[
		"w(?:eek(?:s)?)?",
		"d(?:ay(?:s)?)?",
		"h(?:our(?:s)?)?",
		"m(?:in(?:ute)?(?:s)?)?",
		"s(?:ec(?:ond)?(?:s)?)?"
	].map((unit) => `(${numeric}${unit})?`).join("")}$`);
	function parseTime(source) {
		const capture = timeRegExp.exec(source);
		if (!capture) return 0;
		return (parseFloat(capture[1]) * Time.week || 0) + (parseFloat(capture[2]) * Time.day || 0) + (parseFloat(capture[3]) * Time.hour || 0) + (parseFloat(capture[4]) * Time.minute || 0) + (parseFloat(capture[5]) * Time.second || 0);
	}
	Time.parseTime = parseTime;
	function parseDate(date) {
		const parsed = parseTime(date);
		if (parsed) date = Date.now() + parsed;
		else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
		else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
		return date ? new Date(date) : /* @__PURE__ */ new Date();
	}
	Time.parseDate = parseDate;
	function format(ms) {
		const abs = Math.abs(ms);
		if (abs >= Time.day - Time.hour / 2) return Math.round(ms / Time.day) + "d";
		else if (abs >= Time.hour - Time.minute / 2) return Math.round(ms / Time.hour) + "h";
		else if (abs >= Time.minute - Time.second / 2) return Math.round(ms / Time.minute) + "m";
		else if (abs >= Time.second) return Math.round(ms / Time.second) + "s";
		return ms + "ms";
	}
	Time.format = format;
	function toDigits(source, length = 2) {
		return source.toString().padStart(length, "0");
	}
	Time.toDigits = toDigits;
	function template(template, time = /* @__PURE__ */ new Date()) {
		return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
	}
	Time.template = template;
})(Time || (Time = {}));
//#endregion
//#region node_modules/.pnpm/@deepseek-ai+schemastery@3.18.4/node_modules/@deepseek-ai/schemastery/lib/index.mjs
const kSchema = Symbol.for("schemastery");
const kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
	options;
	name = "ValidationError";
	constructor(message, options) {
		let prefix = "$";
		for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
		else if (typeof segment === "number") prefix += "[" + segment + "]";
		else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
		if (prefix.startsWith(".")) prefix = prefix.slice(1);
		super((prefix === "$" ? "" : `${prefix} `) + message);
		this.options = options;
	}
	static is(error) {
		return !!error?.[kValidationError];
	}
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
const Schema = function(options) {
	const schema = function(data, options = {}) {
		return Schema.resolve(data, schema, options)[0];
	};
	if (options.refs) {
		const refs = mapValues(options.refs, (options) => new Schema(options));
		const getRef = (uid) => refs[uid];
		for (const key in refs) {
			const options = refs[key];
			options.sKey = getRef(options.sKey);
			options.inner = getRef(options.inner);
			options.list = options.list && options.list.map(getRef);
			options.dict = options.dict && mapValues(options.dict, getRef);
		}
		return refs[options.uid];
	}
	Object.assign(schema, options);
	if (typeof schema.callback === "string") try {
		schema.callback = new Function("return " + schema.callback)();
	} catch {}
	Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
	Object.setPrototypeOf(schema, Schema.prototype);
	schema.meta ||= {};
	schema.toString = schema.toString.bind(schema);
	return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
	return {
		version: 1,
		vendor: "schemastery",
		validate: (value) => {
			try {
				return { value: Schema.resolve(value, this, {})[0] };
			} catch (error) {
				if (ValidationError.is(error)) return { issues: [{
					message: error.message,
					path: error.options.path
				}] };
				throw error;
			}
		}
	};
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
	if (globalThis.__schemastery_refs__) {
		globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
		return this.uid;
	}
	globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
	globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
	const result = {
		uid: this.uid,
		refs: globalThis.__schemastery_refs__
	};
	globalThis.__schemastery_refs__ = void 0;
	return result;
};
Schema.prototype.set = function set(key, value) {
	this.dict[key] = value;
	return this;
};
Schema.prototype.push = function push(value) {
	this.list.push(value);
	return this;
};
function mergeDesc(original, messages) {
	const result = typeof original === "string" ? { "": original } : { ...original };
	for (const locale in messages) {
		const value = messages[locale];
		if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
		else if (typeof value === "string") result[locale] = value;
	}
	return result;
}
function getInner(value) {
	return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
	return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
	const schema = Schema(this);
	const desc = mergeDesc(schema.meta.description, messages);
	if (Object.keys(desc).length) schema.meta.description = desc;
	if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
		return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
	});
	if (schema.list) schema.list = schema.list.map((inner, index) => {
		return inner.i18n(mapValues(messages, (data = {}) => {
			if (Array.isArray(getInner(data))) return getInner(data)[index];
			if (Array.isArray(data)) return data[index];
			return extractKeys(data);
		}));
	});
	if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
		if (getInner(data)) return getInner(data);
		return extractKeys(data);
	}));
	if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
	return schema;
};
Schema.prototype.extra = function extra(key, value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
};
for (const key of [
	"required",
	"disabled",
	"collapse",
	"hidden",
	"loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.deprecated = function deprecated() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "deprecated",
		type: "danger"
	});
	return schema;
};
Schema.prototype.experimental = function experimental() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "experimental",
		type: "warning"
	});
	return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
	const schema = Schema(this);
	const pattern = pick(regexp, ["source", "flags"]);
	schema.meta = {
		...schema.meta,
		pattern
	};
	return schema;
};
Schema.prototype.simplify = function simplify(value) {
	if (isVolatile(value)) value = value.get();
	if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
	if (isNullable(value)) return value;
	if (this.type === "object" || this.type === "dict") {
		const result = {};
		for (const key in value) {
			const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
			if (this.type === "dict" || !isNullable(item)) result[key] = item;
		}
		if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
		return result;
	} else if (this.type === "array" || this.type === "tuple") {
		const result = [];
		value.forEach((value, index) => {
			const schema = this.type === "array" ? this.inner : this.list[index];
			const item = schema ? schema.simplify(value) : value;
			result.push(item);
		});
		return result;
	} else if (this.type === "intersect") {
		const result = {};
		for (const item of this.list) Object.assign(result, item.simplify(value));
		return result;
	} else if (this.type === "union") for (const schema of this.list) try {
		Schema.resolve(value, schema, {});
		return schema.simplify(value);
	} catch {}
	return value;
};
Schema.prototype.toString = function toString(inline) {
	return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		role,
		extra
	};
	return schema;
};
for (const key of [
	"default",
	"link",
	"comment",
	"description",
	"max",
	"min",
	"step"
]) Object.assign(Schema.prototype, { [key](value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.volatile = function volatile() {
	if (this.meta.volatile) throw new TypeError("volatile schema is already wrapped");
	return this.extra("volatile", true);
};
const resolvers = {};
const checkedVolatile = Symbol("checked-volatile-schema");
function validateVolatileSchema(schema, path = [], blocked = false, seen = /* @__PURE__ */ new Map()) {
	const states = seen.get(schema) ?? /* @__PURE__ */ new Set();
	if (states.has(blocked)) return;
	states.add(blocked);
	seen.set(schema, states);
	if (schema.meta?.volatile && blocked) throw new ValidationError("volatile fields require a fixed object path without an enclosing volatile field", { path });
	const nested = blocked || !!schema.meta?.volatile;
	if (schema.dict) for (const [key, child] of Object.entries(schema.dict)) validateVolatileSchema(child, [...path, key], nested, seen);
	if (schema.sKey) validateVolatileSchema(schema.sKey, [...path, "<key>"], true, seen);
	if (schema.inner && (schema.type !== "lazy" || schema.inner[kSchema])) validateVolatileSchema(schema.inner, [...path, "*"], true, seen);
	if (schema.list) for (let index = 0; index < schema.list.length; index++) validateVolatileSchema(schema.list[index], [...path, String(index)], true, seen);
}
Schema.extend = function extend(type, resolve) {
	resolvers[type] = resolve;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
	if (!schema) return [data];
	if (!options[checkedVolatile]) {
		validateVolatileSchema(schema, options.path);
		options = {
			...options,
			[checkedVolatile]: true
		};
	}
	if (schema.meta?.volatile) {
		const inner = Schema(schema);
		inner.meta = {
			...schema.meta,
			volatile: false
		};
		const [value, adapted] = Schema.resolve(data, inner, options, strict);
		try {
			return [createVolatile(value), adapted];
		} catch (error) {
			throw new ValidationError(error instanceof Error ? error.message : String(error), options);
		}
	}
	if (options.ignore?.(data, schema)) return [data];
	if (isNullable(data) && schema.type !== "lazy") {
		if (schema.meta.required) throw new ValidationError(`missing required value`, options);
		let current = schema;
		let fallback = schema.meta.default;
		while (current?.type === "intersect" && isNullable(fallback)) {
			current = current.list[0];
			fallback = current?.meta.default;
		}
		if (isNullable(fallback)) return [data];
		data = clone(fallback);
	}
	const callback = resolvers[schema.type];
	if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
	try {
		return callback(data, schema, options, strict);
	} catch (error) {
		if (!schema.meta.loose) throw error;
		return [schema.meta.default];
	}
};
Schema.from = function from(source) {
	if (isNullable(source)) return Schema.any();
	else if ([
		"string",
		"number",
		"boolean"
	].includes(typeof source)) return Schema.const(source).required();
	else if (source[kSchema]) return source;
	else if (typeof source === "function") switch (source) {
		case String: return Schema.string().required();
		case Number: return Schema.number().required();
		case Boolean: return Schema.boolean().required();
		case Function: return Schema.function().required();
		default: return Schema.is(source).required();
	}
	else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
	const toJSON = () => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return schema.inner.toJSON();
	};
	const schema = new Schema({
		type: "lazy",
		builder,
		inner: { toJSON }
	});
	return schema;
};
Schema.natural = function natural() {
	return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
	return Schema.number().step(.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
	return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
		const date = new Date(value);
		if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
		return date;
	}, true)]);
};
Schema.regExp = function regExp(flag = "") {
	return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
		try {
			return new RegExp(value, flag);
		} catch (e) {
			throw new ValidationError(e.message, options);
		}
	}, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
	return Schema.union([
		Schema.is(ArrayBuffer),
		Schema.is(SharedArrayBuffer),
		Schema.transform(Schema.any(), (value, options) => {
			if (Binary.isSource(value)) return Binary.fromSource(value);
			throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
		}, true),
		...encoding ? [Schema.transform(Schema.string(), (value, options) => {
			try {
				return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)] : []
	]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
	if (!schema.inner[kSchema]) {
		schema.inner = schema.builder();
		schema.inner.meta = {
			...schema.meta,
			...schema.inner.meta
		};
		validateVolatileSchema(schema.inner, options.path, true);
	}
	return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
	return [data];
});
Schema.extend("never", (data, _, options) => {
	throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
	if (deepEqual(data, value)) return [value];
	throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
	const { max = Infinity, min = -Infinity } = meta;
	if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
	if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
	if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
	if (meta.pattern) {
		const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
		if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
	}
	checkWithinRange(data.length, meta, "string length", options);
	return [data];
});
function decimalShift(data, digits) {
	const str = data.toString();
	if (str.includes("e")) return data * Math.pow(10, digits);
	const index = str.indexOf(".");
	if (index === -1) return data * Math.pow(10, digits);
	const frac = str.slice(index + 1);
	const integer = str.slice(0, index);
	if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
	return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
	step = Math.abs(step);
	if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
	const index = step.toString().indexOf(".");
	const digits = step.toString().slice(index + 1).length;
	return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
	if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
	checkWithinRange(data, meta, "number", options);
	const { step } = meta;
	if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
	return [data];
});
Schema.extend("boolean", (data, _, options) => {
	if (typeof data === "boolean") return [data];
	throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
	let value = 0, keys = [];
	if (typeof data === "number") {
		value = data;
		for (const key in bits) if (data & bits[key]) keys.push(key);
	} else if (Array.isArray(data)) {
		keys = data;
		for (const key of keys) {
			if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
			if (key in bits) value |= bits[key];
		}
	} else throw new ValidationError(`expected number or array but got ${data}`, options);
	if (value === meta.default) return [value];
	return [value, keys];
});
Schema.extend("function", (data, _, options) => {
	if (typeof data === "function") return [data];
	throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
	if (typeof constructor === "function") {
		if (data instanceof constructor) return [data];
		throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
	} else {
		if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		let prototype = Object.getPrototypeOf(data);
		while (prototype) {
			if (prototype.constructor?.name === constructor) return [data];
			prototype = Object.getPrototypeOf(prototype);
		}
		throw new ValidationError(`expected ${constructor} but got ${data}`, options);
	}
});
function property(data, key, schema, options) {
	try {
		const [value, adapted] = Schema.resolve(data[key], schema, {
			...options,
			path: [...options.path || [], key]
		});
		if (adapted !== void 0) data[key] = adapted;
		return value;
	} catch (e) {
		if (!options?.autofix) throw e;
		delete data[key];
		return schema.meta.volatile ? createVolatile(schema.meta.default) : schema.meta.default;
	}
}
Schema.extend("array", (data, { inner, meta }, options) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
	return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in data) {
		let rKey;
		try {
			rKey = Schema.resolve(key, sKey, options)[0];
		} catch (error) {
			if (strict) continue;
			throw error;
		}
		result[rKey] = property(data, key, inner, options);
		data[rKey] = data[key];
		if (key !== rKey) delete data[key];
	}
	return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	const result = list.map((inner, index) => property(data, index, inner, options));
	if (strict) return [result];
	result.push(...data.slice(list.length));
	return [result];
});
function merge(result, data) {
	for (const key in data) {
		if (key in result) continue;
		result[key] = data[key];
	}
}
Schema.extend("object", (data, { dict }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in dict) {
		const value = property(data, key, dict[key], options);
		if (!isNullable(value) || key in data) result[key] = value;
	}
	if (!strict) merge(result, data);
	return [result];
});
Schema.extend("union", (data, { list, toString }, options, strict) => {
	const messages = [];
	for (const inner of list) try {
		return Schema.resolve(data, inner, options, strict);
	} catch (error) {
		messages.push(error);
	}
	throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString }, options, strict) => {
	if (!list.length) return [data];
	let result;
	for (const inner of list) {
		const value = Schema.resolve(data, inner, options, true)[0];
		if (isNullable(value)) continue;
		if (isNullable(result)) result = value;
		else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		else if (typeof value === "object") merge(result ??= {}, value);
		else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
	}
	if (!strict && isPlainObject(data)) merge(result, data);
	return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
	const [result, adapted = data] = Schema.resolve(data, inner, options, true);
	if (preserve) return [callback(result)];
	else return [callback(result), callback(adapted)];
});
const formatters = {};
function defineMethod(name, keys, format) {
	formatters[name] = format;
	Object.assign(Schema, { [name](...args) {
		const schema = new Schema({ type: name });
		keys.forEach((key, index) => {
			switch (key) {
				case "sKey":
					schema.sKey = args[index] ?? Schema.string();
					break;
				case "inner":
					schema.inner = Schema.from(args[index]);
					break;
				case "list":
					schema.list = args[index].map(Schema.from);
					break;
				case "dict":
					schema.dict = mapValues(args[index], Schema.from);
					break;
				case "bits":
					schema.bits = {};
					for (const key in args[index]) {
						if (typeof args[index][key] !== "number") continue;
						schema.bits[key] = args[index][key];
					}
					break;
				case "callback": {
					const callback = schema.callback = args[index];
					callback["toJSON"] ||= () => callback.toString();
					break;
				}
				case "constructor": {
					const constructor = schema.constructor = args[index];
					if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
					break;
				}
				default: schema[key] = args[index];
			}
		});
		if (name === "object" || name === "dict") schema.meta.default = {};
		else if (name === "array" || name === "tuple") schema.meta.default = [];
		else if (name === "bitset") schema.meta.default = 0;
		return schema;
	} });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
	if (typeof constructor === "function") return constructor.name;
	else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
	if (Object.keys(dict).length === 0) return "{}";
	return `{ ${Object.entries(dict).map(([key, inner]) => {
		return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
	}).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
	const result = list.map(({ toString: format }) => format()).join(" | ");
	return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
	return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
	"inner",
	"callback",
	"preserve"
], ({ inner }, isInner) => inner.toString(isInner));
//#endregion
//#region src/loader-config.ts
/**
* Loader-facing config schema (`@deepseek-ai/schemastery`).
*
* The Harness Loader only accepts schemastery schemas as the bundle `Config`
* export (calling convention + prototype surface). This module holds the only
* schemastery import in the workspace; every other schema is standard zod.
* Field-for-field mirror of the core zod `ConfigSchema` — locked by
* `test/config-schema.test.ts`.
*/
const DEFAULT_MAX_FILE_BYTES = 5242880;
function createLoaderConfig() {
	return Schema.object({
		/** File size cap in bytes; oldest lines rotate out. 0 disables. */
		maxFileBytes: Schema.natural().default(DEFAULT_MAX_FILE_BYTES),
		/** Sample age cap in days; older lines are swept periodically. 0 disables. */
		maxAgeDays: Schema.number().min(0).default(30),
		/** Minimum ms between recorded step samples; 0 records every step. */
		sampleMinIntervalMs: Schema.natural().default(0),
		/** How often the age sweep runs, in minutes. */
		sweepIntervalMinutes: Schema.natural().min(1).default(60),
		/** Ceiling on a credible decode rate; faster readings are `unmeasurable`. */
		maxPlausibleTps: Schema.natural().min(1).default(500),
		/** Write sessionId into each sample; disable on shared data directories. */
		includeSessionIds: Schema.boolean().default(true),
		/** Directory for samples.jsonl; empty uses `<dsh home>/stats`. Reload to change. */
		dataDir: Schema.string().default(""),
		/** Custom model pricing overrides, keyed by model id (case-insensitive). */
		customPricing: Schema.dict(Schema.number().min(0)).default({}),
		/** Currency display only; costs are always computed in USD. */
		currency: Schema.string().default("USD")
	});
}
//#endregion
//#region src/request-observer.ts
/** Pass through the exact chunks and backpressure; record only route, usage and timings. */
async function* observeRequest(request, next, record, now = () => performance.now(), startedAt = Date.now) {
	const time = startedAt();
	const start = now();
	let first = null;
	let last = null;
	let outputTokens = null;
	try {
		for await (const chunk of next()) {
			if (chunk.type === "usage") {
				const parsed = UsageSchema.safeParse(chunk.usage);
				if (parsed.success && parsed.data.outputTokens !== void 0) outputTokens = parsed.data.outputTokens;
			} else if ((chunk.type === "text-delta" || chunk.type === "reasoning-delta") && chunk.text || chunk.type === "tool-call-delta" && chunk.argumentsDelta) {
				last = now();
				first ??= last;
			}
			yield chunk;
		}
	} finally {
		record({
			time,
			provider: request.provider,
			model: request.model,
			ttftMs: first === null ? null : first - start,
			generationMs: first === null || last === null || last <= first ? null : last - first,
			outputTokens
		});
	}
}
//#endregion
//#region src/host.ts
/**
* Host half of dsh-plugin-stats.
*
* Subscribes to the process-wide `session/event` feed (steps + lifecycle),
* observes `tools/result` (tool calls), prices every step sample against the
* bundled models.dev snapshot, and serves read-only data routes plus the
* live settings route. All registrations ride the plugin fiber.
*
* Settings precedence: schema defaults <- entry `config:` block <- user
* config.json (the panel writes the file). `dataDir` still requires a reload.
*/
/** Wait for the webServer service before apply, so routes register regardless of activation order. */
const inject = ["webServer"];
const ROUTE_SAMPLES = "/dsh-stats/samples.jsonl";
const ROUTE_CSV = "/dsh-stats/samples.csv";
const ROUTE_SUMMARY = "/dsh-stats/summary.json";
const ROUTE_SPEED = "/dsh-stats/model-speed.json";
const ROUTE_CONFIG = "/dsh-stats/config";
/**
* Loader-facing config schema.
*
* The Harness Loader resolves entry configs through the schema's own calling
* convention plus its prototype surface (schemastery schemas are callable
* functions; standard zod schemas are plain objects with `.parse`). A plain
* zod schema — or a hand-written wrapper function — fails activation, so the
* exported `Config` is a genuine `@deepseek-ai/schemastery` schema with a
* field-for-field mirror of the core zod `ConfigSchema` (defaults,
* minimums, and the `customPricing` dict included).
*
* Everything past the Loader boundary runs through the zod `ConfigSchema`
* (`apply` re-parses the Loader's output), and `config-schema.test.ts` locks
* the two definitions together: same defaults, same rejections.
*/
const Config = createLoaderConfig();
/** Resolve the sample file location: explicit dataDir verbatim, else DSH home. */
function samplesFile(effective) {
	if (effective.dataDir !== "") return join(effective.dataDir, "samples.jsonl");
	const base = process.env["DSH_PROFILE_DIR"] || join(homedir(), ".dsh");
	return join(base, "stats", "samples.jsonl");
}
/** Load the user's config.json, if any; malformed files fall back to {} with a warning. */
async function readUserConfig(path, logger) {
	try {
		return JSON.parse(await readFile(path, "utf8"));
	} catch (error) {
		if (error?.code !== "ENOENT") logger.warn(`stats: config.json unreadable (${String(error?.message ?? error)}); using defaults`);
		return {};
	}
}
function json(res, code, payload, type = "application/json") {
	res.writeHead(code, {
		"content-type": `${type}; charset=utf-8`,
		"cache-control": "no-store"
	});
	res.end(payload);
}
function notAllowed(res) {
	res.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
	res.end("method not allowed");
}
async function readBody(req) {
	let chunks = "";
	const decoder = new TextDecoder();
	for await (const chunk of req) chunks += typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
	chunks += decoder.decode();
	return chunks;
}
/**
* Bundle entry: start the collectors, retention, the read-only data routes,
* the settings route, and the index injection.
*/
function apply(ctx, entryConfig) {
	const effective = ConfigSchema.parse(entryConfig ?? {});
	const dataDir = effective.dataDir !== "" ? effective.dataDir : join(process.env["DSH_PROFILE_DIR"] || join(homedir(), ".dsh"), "stats");
	const file = join(dataDir, "samples.jsonl");
	const configPath = join(dataDir, "config.json");
	const store = createFileStore(file);
	const speedStore = createJsonlStore(join(dataDir, "model-speed.jsonl"), parseRequestSpeedLine);
	const snapshot = loadSnapshot();
	const stepStarts = /* @__PURE__ */ new Map();
	let lastRecordedAt = 0;
	let sweepTimer;
	let rearmSweep = () => void 0;
	ctx.effect(() => {
		(async () => {
			try {
				await mkdir(dataDir, { recursive: true });
				const { dataDir: _ignored, ...rest } = await readUserConfig(configPath, ctx.logger);
				Object.assign(effective, ConfigSchema.parse({
					...effective,
					...rest
				}), { dataDir: effective.dataDir });
				await Promise.all([store.enqueue(() => store.initialize(effective)), speedStore.enqueue(() => speedStore.initialize(effective))]);
			} catch (error) {
				ctx.logger.error("stats: initialize failed", error);
			}
		})();
		return () => void 0;
	}, "stats: data directory");
	ctx.on("llm/stream", (request, next) => observeRequest(request, next, (sample) => {
		speedStore.enqueue(() => speedStore.append(sample, effective)).catch((error) => {
			ctx.logger.error("stats: model speed append failed", error);
		});
	}));
	ctx.on("session/event", (session, event) => {
		const outcome = collectSessionEvent(session.id, event, stepStarts.get(session.id), lastRecordedAt, {
			config: effective,
			snapshot
		});
		if (outcome.kind === "step-start") {
			stepStarts.set(session.id, outcome.time);
			return;
		}
		if (outcome.kind !== "step") return;
		lastRecordedAt = outcome.outcome.sample.time;
		const sample = outcome.outcome.sample;
		store.enqueue(() => store.append(sample, effective)).catch((error) => {
			ctx.logger.error("stats: sample append failed", error);
		});
	});
	ctx.on("session/created", (session) => {
		if (!effective.includeSessionIds) return;
		const sample = {
			kind: "session-join",
			time: Date.now(),
			sessionId: session.id
		};
		store.enqueue(() => store.append(sample, effective)).catch((error) => {
			ctx.logger.error("stats: lifecycle append failed", error);
		});
	});
	ctx.on("session/disposed", (session) => {
		stepStarts.delete(session.id);
		if (!effective.includeSessionIds) return;
		const sample = {
			kind: "session-leave",
			time: Date.now(),
			sessionId: session.id
		};
		store.enqueue(() => store.append(sample, effective)).catch((error) => {
			ctx.logger.error("stats: lifecycle append failed", error);
		});
	});
	ctx.on("tools/result", (exec, result) => {
		const sample = collectTool(Date.now(), void 0, exec, result, effective.includeSessionIds);
		if (sample === null) return;
		store.enqueue(() => store.append(sample, effective)).catch((error) => {
			ctx.logger.error("stats: tool append failed", error);
		});
	});
	ctx.effect(() => {
		const arm = () => {
			if (sweepTimer !== void 0) clearInterval(sweepTimer);
			sweepTimer = setInterval(() => {
				Promise.all([store.enqueue(() => store.sweep(effective)), speedStore.enqueue(() => speedStore.sweep(effective))]).catch((error) => {
					ctx.logger.error("stats: sweep failed", error);
				});
			}, effective.sweepIntervalMinutes * 6e4);
		};
		arm();
		rearmSweep = arm;
		return () => {
			clearInterval(sweepTimer);
		};
	}, "stats: retention sweep");
	ctx.on("webserver/index-inject", (table) => {
		table.push({
			kind: "global",
			name: "__DSH_STATS__",
			value: {
				url: ROUTE_SAMPLES,
				summaryUrl: ROUTE_SUMMARY,
				configUrl: ROUTE_CONFIG,
				speedUrl: ROUTE_SPEED
			}
		});
	});
	const webServer = ctx.get("webServer");
	if (typeof webServer?.register !== "function") {
		ctx.logger.warn("stats: no webServer service; recording continues but the Web panel has no data route");
		return;
	}
	const server = webServer;
	ctx.effect(() => {
		const disposers = [
			server.register({
				kind: "exact",
				path: ROUTE_SAMPLES,
				async handler(req, res) {
					if (req.method !== "GET") return notAllowed(res);
					json(res, 200, await store.readAll(), "text/plain");
				}
			}),
			server.register({
				kind: "exact",
				path: ROUTE_CSV,
				async handler(req, res) {
					if (req.method !== "GET") return notAllowed(res);
					json(res, 200, `${["time_iso,kind,model,provider,turn,step,ttft_ms,decode_ms,output_tokens,input_tokens,reasoning_tokens,text_chars,reasoning_chars,tps,cost_usd,interrupted,session_id", ...(await store.readAll()).split("\n").filter((line) => line.trim() !== "").map((line) => {
						const sample = parseSampleLine(line);
						if (sample === null || sample.kind !== "step") return null;
						try {
							return toCsvRow(sample);
						} catch {
							return null;
						}
					}).filter((row) => row !== null)].join("\n")}\n`, "text/csv");
				}
			}),
			server.register({
				kind: "exact",
				path: ROUTE_SUMMARY,
				async handler(req, res) {
					if (req.method !== "GET") return notAllowed(res);
					const { samples, skippedLines } = await store.readParsed();
					json(res, 200, JSON.stringify(summarize(samples, {
						maxPlausibleTps: effective.maxPlausibleTps,
						pricingSource: snapshot.source,
						pricingVersion: snapshot.version,
						pricingUpdatedAt: snapshot.updatedAt,
						retention: {
							maxFileBytes: effective.maxFileBytes,
							maxAgeDays: effective.maxAgeDays,
							sampleMinIntervalMs: effective.sampleMinIntervalMs,
							maxPlausibleTps: effective.maxPlausibleTps
						},
						fileBytes: await store.fileSize(),
						skippedLines
					})));
				}
			}),
			server.register({
				kind: "exact",
				path: ROUTE_SPEED,
				async handler(req, res) {
					if (req.method !== "GET") return notAllowed(res);
					const connection = ctx.get("connection", false);
					if (typeof connection?.requestRejection !== "function") return json(res, 503, JSON.stringify({ error: "connection unavailable" }));
					const rejection = connection.requestRejection(req);
					if (rejection !== void 0) return json(res, rejection, JSON.stringify({ error: "request rejected" }));
					const param = new URL(req.url ?? "/dsh-stats/model-speed.json", "http://localhost").searchParams.get("hours") ?? "24";
					const hours = SPEED_WINDOWS.find((window) => String(window) === param);
					if (hours === void 0) return json(res, 400, JSON.stringify({ error: "hours must be 1, 12 or 24" }));
					const asOf = Date.now();
					const { samples } = await speedStore.enqueue(() => speedStore.readParsed());
					json(res, 200, JSON.stringify(summarizeSpeed(samples, hours, asOf)));
				}
			}),
			server.register({
				kind: "exact",
				path: ROUTE_CONFIG,
				async handler(req, res) {
					if (req.method === "GET") {
						json(res, 200, JSON.stringify(effective));
						return;
					}
					if (req.method !== "POST") return notAllowed(res);
					const chunks = await readBody(req);
					let patch;
					try {
						patch = JSON.parse(chunks || "{}");
					} catch {
						json(res, 400, JSON.stringify({ error: "body must be JSON" }));
						return;
					}
					if (typeof patch !== "object" || patch === null) {
						json(res, 400, JSON.stringify({ error: "body must be a JSON object" }));
						return;
					}
					const { dataDir: _dropped, ...rest } = patch;
					let next;
					try {
						next = ConfigSchema.parse({
							...effective,
							...rest
						});
					} catch (error) {
						json(res, 400, JSON.stringify({ error: String(error?.message ?? error) }));
						return;
					}
					Object.assign(effective, next);
					try {
						const user = await readUserConfig(configPath, ctx.logger);
						await writeFile(configPath, `${JSON.stringify({
							...user,
							...rest
						}, null, 2)}\n`, "utf8");
					} catch (error) {
						ctx.logger.error("stats: config write failed", error);
						json(res, 500, JSON.stringify({ error: "failed to persist config" }));
						return;
					}
					await appendFile(configPath, "", "utf8").catch(() => void 0);
					rearmSweep();
					json(res, 200, JSON.stringify(effective));
				}
			})
		];
		return () => {
			for (const dispose of disposers) dispose();
		};
	}, "stats: data routes");
}
//#endregion
export { Config, ConfigSchema, ROUTE_CONFIG, ROUTE_CSV, ROUTE_SAMPLES, ROUTE_SPEED, ROUTE_SUMMARY, apply, inject, samplesFile };
