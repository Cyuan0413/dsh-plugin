#!/usr/bin/env node
import { g as parseSampleLine, n as priceSample, o as CSV_HEADER, s as toCsvRow, t as loadSnapshot, u as measuredTps } from "./pricing.mjs";
import { copyFile, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
//#region src/cli.ts
/**
* dsh-stats CLI: maintain the samples file.
*
*   dsh-stats recompute [file] [--floor 250] [--cap 500] [--dry-run]
*     Re-derive `tps` (measurability rule) and `costUsd` (current pricing
*     snapshot + custom rates) for every step row. Backup first unless
*     --dry-run. Stop the plugin (or Host) first: it appends to the same file.
*
*   dsh-stats export [file] [--out out.csv]
*     Write the CSV projection of step rows to stdout (or --out).
*
* The file defaults to `$DSH_PROFILE_DIR/stats/samples.jsonl`, falling back
* to `~/.dsh/stats/samples.jsonl`.
*/
const [command, ...rest] = process.argv.slice(2);
function flag(name, fallback) {
	const index = rest.indexOf(name);
	if (index === -1) return fallback;
	const raw = rest[index + 1];
	const parsed = raw === void 0 ? NaN : Number(raw);
	return Number.isFinite(parsed) ? parsed : fallback;
}
function positional() {
	for (let i = 0; i < rest.length; i += 1) {
		const value = rest[i];
		if (value === void 0 || value.startsWith("--")) continue;
		const prev = rest[i - 1];
		if (prev !== void 0 && prev.startsWith("--")) continue;
		return value;
	}
}
function defaultFile() {
	const base = process.env["DSH_PROFILE_DIR"] || join(homedir(), ".dsh");
	return join(base, "stats", "samples.jsonl");
}
async function recompute() {
	const dryRun = rest.includes("--dry-run");
	const floor = flag("--floor", 250);
	const cap = flag("--cap", 500);
	const file = positional() ?? defaultFile();
	const snapshot = loadSnapshot();
	const customPricing = {};
	const text = await readFile(file, "utf8").catch(() => null);
	if (text === null) {
		console.error(`dsh-stats: no such file: ${file}`);
		process.exit(1);
	}
	const lines = text.split("\n").filter((line) => line.trim() !== "");
	const out = [];
	let measurable = 0;
	let unmeasurable = 0;
	let noUsage = 0;
	let priced = 0;
	for (const line of lines) {
		const sample = parseSampleLine(line);
		if (sample === null || sample.kind !== "step") {
			out.push(line);
			continue;
		}
		const tps = sample.outputTokens === null ? null : measuredTps(sample.outputTokens, sample.decodeMs, {
			maxPlausibleTps: cap,
			minDecodeMs: floor
		});
		if (tps !== null) {
			sample.tps = tps;
			delete sample.unmeasurable;
			measurable += 1;
		} else if (sample.outputTokens !== null && sample.decodeMs > 0) {
			sample.tps = null;
			sample.unmeasurable = true;
			unmeasurable += 1;
		} else {
			sample.tps = null;
			delete sample.unmeasurable;
			noUsage += 1;
		}
		const pricedCost = priceSample({
			model: sample.model,
			provider: sample.provider,
			inputTokens: sample.inputTokens,
			outputTokens: sample.outputTokens,
			reasoningTokens: sample.reasoningTokens,
			customPricing,
			snapshot
		});
		sample.costUsd = pricedCost.costUsd;
		sample.costSource = pricedCost.costSource;
		if (pricedCost.costUsd !== null) priced += 1;
		out.push(JSON.stringify(sample));
	}
	console.log(`dsh-stats recompute: ${file}`);
	console.log(`  rows ${lines.length} · measurable ${measurable} · unmeasurable ${unmeasurable} · no usage ${noUsage} · priced ${priced}`);
	console.log(`  rule: decodeMs >= ${floor} and rate <= ${cap} tok/s · pricing ${snapshot.source} ${snapshot.version}`);
	if (dryRun) {
		console.log("  dry run: nothing written");
		return;
	}
	const backup = `${file}.bak-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}`;
	await copyFile(file, backup);
	const temp = `${file}.tmp`;
	await writeFile(temp, `${out.join("\n")}\n`, "utf8");
	await rename(temp, file);
	console.log(`  backup ${backup}`);
}
async function exportCsv() {
	const outIndex = rest.indexOf("--out");
	const outPath = outIndex === -1 ? void 0 : rest[outIndex + 1];
	const file = positional() ?? defaultFile();
	const text = await readFile(file, "utf8").catch(() => null);
	if (text === null) {
		console.error(`dsh-stats: no such file: ${file}`);
		process.exit(1);
	}
	const rows = text.split("\n").filter((line) => line.trim() !== "").map((line) => {
		const sample = parseSampleLine(line);
		if (sample === null || sample.kind !== "step") return null;
		return toCsvRow(sample);
	}).filter((row) => row !== null);
	const csv = `${CSV_HEADER}\n${rows.join("\n")}\n`;
	if (outPath === void 0) process.stdout.write(csv);
	else {
		await writeFile(outPath, csv, "utf8");
		console.log(`dsh-stats export: ${rows.length} rows -> ${outPath}`);
	}
}
if (command === "recompute") await recompute();
else if (command === "export") await exportCsv();
else {
	console.error("dsh-stats: usage: dsh-stats <recompute|export> [file] [flags]");
	process.exit(1);
}
//#endregion
export {};
