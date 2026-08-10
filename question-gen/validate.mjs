#!/usr/bin/env node
/**
 * Structural validator for Service Certify question banks.
 *
 * Usage:
 *   node question-gen/validate.mjs                 # all exported banks
 *   node question-gen/validate.mjs cis-vr           # one exported bank
 *   node question-gen/validate.mjs --seed           # validate live seed bank
 *   node question-gen/validate.mjs --seed CIS-VR    # one track from seed
 *
 * Exit 1 on any error. Warnings print but do not fail the process unless --strict.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const configPath = path.join(__dirname, 'tracks.config.json');
const banksDir = path.join(__dirname, 'banks');
const seedPath = path.join(root, 'src', 'convex', 'seed', 'devQuestionBank.ts');

const args = process.argv.slice(2);
const useSeed = args.includes('--seed');
const strict = args.includes('--strict');
const positional = args.filter((a) => !a.startsWith('--'));

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const tracksBySlug = Object.fromEntries(config.tracks.map((t) => [t.examSlug, t]));
const tracksByCode = Object.fromEntries(config.tracks.map((t) => [t.trackCode, t]));

const BANNED_CHOICE = [/all of the above/i, /none of the above/i, /\([A-Z][A-Z0-9-]*-\d+-w\d+\)/];
const BOILERPLATE_SUFFIXES = [
	' without validating scope, credentials, or operational prerequisites',
	' while bypassing standard governance controls and increasing operational risk',
	' regardless of reconciliation, security policy, or instance readiness requirements',
	' even when prerequisite data quality and ownership are not confirmed'
];

function readSeed() {
	const raw = fs.readFileSync(seedPath, 'utf8');
	const marker = 'export const DEV_PRACTICE_QUESTIONS';
	const markerAt = raw.indexOf(marker);
	const start = raw.indexOf('[', markerAt);
	const castEnd = raw.lastIndexOf('] as unknown as DevPracticeQuestionRow[]');
	const end = castEnd >= 0 ? castEnd : raw.lastIndexOf('];');
	return JSON.parse(raw.slice(start, end + 1));
}

function loadBanks() {
	if (useSeed) {
		const all = readSeed();
		const codeFilter = positional[0]?.toUpperCase();
		const byCode = {};
		for (const q of all) {
			if (codeFilter && q.trackCode !== codeFilter) continue;
			(byCode[q.trackCode] ??= []).push(q);
		}
		return Object.entries(byCode).map(([trackCode, questions]) => ({
			examSlug: tracksByCode[trackCode]?.examSlug ?? trackCode.toLowerCase(),
			trackCode,
			questions
		}));
	}

	const files = positional.length
		? positional.map((s) => path.join(banksDir, `${s.replace(/\.json$/, '')}.json`))
		: fs.readdirSync(banksDir).filter((f) => f.endsWith('.json')).map((f) => path.join(banksDir, f));

	return files.map((file) => {
		if (!fs.existsSync(file)) throw new Error(`Bank not found: ${file}`);
		const bank = JSON.parse(fs.readFileSync(file, 'utf8'));
		const questions = bank.questions ?? bank;
		const examSlug = bank.examSlug ?? path.basename(file, '.json');
		const trackCode = bank.trackCode ?? tracksBySlug[examSlug]?.trackCode;
		return { examSlug, trackCode, questions, file };
	});
}

function validateBank({ examSlug, trackCode, questions }) {
	const errors = [];
	const warnings = [];
	const track = tracksBySlug[examSlug] ?? tracksByCode[trackCode];
	const domainNames = new Set((track?.domains ?? []).map((d) => d.name));
	const mc = questions.filter((q) => q.questionType !== 'match');

	if (track?.targetCount && questions.length !== track.targetCount) {
		warnings.push(
			`count ${questions.length} != target ${track.targetCount} (ok if mid-merge)`
		);
	}

	const keyPos = {};
	let longestCorrect = 0;
	let negatives = 0;
	const choiceText = new Map();

	for (const q of mc) {
		const label = `order ${q.order ?? '?'}`;
		const choices = q.choices ?? [];
		if (choices.length < 4) errors.push(`${label}: fewer than 4 choices`);

		const idx = q.correctIndex;
		if (typeof idx !== 'number' || idx < 0 || idx >= choices.length) {
			errors.push(`${label}: invalid correctIndex`);
		} else {
			keyPos[idx] = (keyPos[idx] ?? 0) + 1;
			const maxLen = Math.max(...choices.map((c) => c.length));
			if (choices[idx].length === maxLen) longestCorrect++;
		}

		if (/\bNOT\b|\bEXCEPT\b/.test(q.prompt ?? '')) negatives++;

		if (!q.explanation || q.explanation.trim().length < 20) {
			errors.push(`${label}: missing/short explanation`);
		}
		const urls = q.sourceUrls ?? (q.source ? [q.source] : []);
		if (!urls.length) errors.push(`${label}: missing sourceUrls/source`);

		const domain = q.domain;
		if (!domain) errors.push(`${label}: missing domain`);
		else if (domainNames.size && !domainNames.has(domain)) {
			errors.push(`${label}: domain "${domain}" not in track config`);
		}

		for (const c of choices) {
			for (const re of BANNED_CHOICE) {
				if (re.test(c)) errors.push(`${label}: banned choice pattern ${re}`);
			}
			for (const suffix of BOILERPLATE_SUFFIXES) {
				if (c.includes(suffix)) errors.push(`${label}: rebalance boilerplate suffix`);
			}
			const key = c.trim().toLowerCase();
			choiceText.set(key, (choiceText.get(key) ?? 0) + 1);
		}

		const unique = new Set(choices.map((c) => c.trim().toLowerCase()));
		if (unique.size !== choices.length) errors.push(`${label}: duplicate choices within item`);
	}

	for (const [text, count] of choiceText) {
		if (count > 1) {
			errors.push(`duplicate choice text within track (${count}x): ${text.slice(0, 70)}`);
		}
	}

	if (mc.length) {
		for (const [idx, count] of Object.entries(keyPos)) {
			const pct = count / mc.length;
			if (pct > 0.4) {
				errors.push(
					`key-position bias: index ${idx} is ${(pct * 100).toFixed(1)}% (>40%)`
				);
			}
		}
		const longestPct = longestCorrect / mc.length;
		if (longestPct > 0.85) {
			errors.push(
				`longest-answer bias: ${(longestPct * 100).toFixed(1)}% (>85%)`
			);
		} else if (longestPct > 0.5) {
			warnings.push(
				`longest-answer bias: ${(longestPct * 100).toFixed(1)}% (>50%)`
			);
		}
		const negPct = negatives / mc.length;
		if (negPct > 0.1) {
			warnings.push(`negatives ${(negPct * 100).toFixed(1)}% (>10%)`);
		}
	}

	return { errors, warnings, mc: mc.length, total: questions.length, keyPos, longestCorrect };
}

const banks = loadBanks();
if (!banks.length) {
	console.error('No banks to validate. Export with npm run export:question-banks or use --seed.');
	process.exit(1);
}

let failed = false;
for (const bank of banks) {
	const result = validateBank(bank);
	const title = `${bank.trackCode ?? bank.examSlug} (${result.total} q, ${result.mc} mc)`;
	console.log(`\n=== ${title} ===`);
	if (result.errors.length === 0 && result.warnings.length === 0) {
		console.log('OK');
	}
	for (const w of result.warnings) console.log(`WARN  ${w}`);
	for (const e of result.errors) {
		console.log(`ERROR ${e}`);
		failed = true;
	}
	if (strict && result.warnings.length) failed = true;
}

if (failed) {
	console.error('\nValidation failed.');
	process.exit(1);
}
console.log('\nValidation passed.');
