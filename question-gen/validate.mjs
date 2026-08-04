#!/usr/bin/env node
/**
 * Structural gate for question-gen banks.
 *
 * Usage (repo root):
 *   npm run validate:questions
 *   node question-gen/validate.mjs
 *   node question-gen/validate.mjs csa
 *   node question-gen/validate.mjs --seed   # validate src/convex/seed/devQuestionBank.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const banksDir = path.join(__dirname, 'banks');
const configPath = path.join(__dirname, 'tracks.config.json');
const seedPath = path.join(root, 'src', 'convex', 'seed', 'devQuestionBank.ts');

const KEY_POSITION_BIAS = 0.4;
/** Matches trackQuality.test.ts / balance-choice-lengths.mjs (aspirational skill bar is 50%). */
const LONGEST_ANSWER_BIAS = 0.85;
const NEGATIVE_STEM_CAP = 0.1;

const BANNED_CHOICE_PATTERNS = [
	/\ball of the above\b/i,
	/\bnone of the above\b/i,
	/\bboth a and b\b/i,
	/\ball of these\b/i,
	/\bnone of these\b/i
];

const BANNED_STEM_PATTERNS = [
	/\bcaptures the choice stating\b/i,
	/\bwhich of the following is true\b/i
];

const BOILERPLATE_SUFFIXES = [
	' without validating scope, credentials, or operational prerequisites',
	' while bypassing standard governance controls and increasing operational risk',
	' regardless of reconciliation, security policy, or instance readiness requirements',
	' even when prerequisite data quality and ownership are not confirmed'
];

const args = process.argv.slice(2);
const validateSeed = args.includes('--seed');
const slugFilter = args.find((a) => !a.startsWith('--'))?.toLowerCase();

/** @typedef {{ examSlug: string, trackCode: string, domains: { name: string, weight: string }[], targetCount: number, officialCount: number }} TrackConfig */

function loadConfig() {
	const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
	/** @type {Map<string, TrackConfig>} */
	const bySlug = new Map();
	/** @type {Map<string, TrackConfig>} */
	const byCode = new Map();
	for (const t of raw.tracks) {
		bySlug.set(t.examSlug, t);
		byCode.set(t.trackCode, t);
	}
	return { docsFamily: raw.docsFamily, bySlug, byCode };
}

function parseSeedBank() {
	const text = fs.readFileSync(seedPath, 'utf8');
	// Prefer the value array after `= [` — avoid matching `Row[]` type annotations.
	const assign = text.search(/=\s*\[/);
	const start = assign >= 0 ? text.indexOf('[', assign) : text.indexOf('[');
	if (start < 0) throw new Error(`No array found in ${seedPath}`);
	let depth = 0;
	let inString = false;
	let escape = false;
	for (let i = start; i < text.length; i++) {
		const c = text[i];
		if (escape) {
			escape = false;
			continue;
		}
		if (c === '\\' && inString) {
			escape = true;
			continue;
		}
		if (c === '"') inString = !inString;
		if (inString) continue;
		if (c === '[') depth++;
		if (c === ']') {
			depth--;
			if (depth === 0) {
				return JSON.parse(text.slice(start, i + 1));
			}
		}
	}
	throw new Error(`Unclosed array in ${seedPath}`);
}

function slugFromCode(code) {
	return String(code).toLowerCase().replace(/_/g, '-');
}

function loadBankFiles(config) {
	if (validateSeed) {
		const rows = parseSeedBank();
		/** @type {Map<string, object[]>} */
		const bySlug = new Map();
		for (const q of rows) {
			const slug = slugFromCode(q.trackCode);
			if (!bySlug.has(slug)) bySlug.set(slug, []);
			bySlug.get(slug).push(q);
		}
		const banks = [];
		for (const [examSlug, questions] of bySlug) {
			const track = config.bySlug.get(examSlug);
			banks.push({
				file: seedPath,
				examSlug,
				trackCode: track?.trackCode ?? questions[0]?.trackCode,
				docsFamily: config.docsFamily,
				questions
			});
		}
		return banks;
	}

	if (!fs.existsSync(banksDir) || fs.readdirSync(banksDir).filter((f) => f.endsWith('.json')).length === 0) {
		console.error(`No JSON banks in ${banksDir}.`);
		console.error('Run: npm run export:question-banks');
		console.error('Or validate the seed directly: npm run validate:questions:seed');
		process.exit(1);
	}

	const files = fs
		.readdirSync(banksDir)
		.filter((f) => f.endsWith('.json'))
		.filter((f) => !slugFilter || f.replace(/\.json$/, '') === slugFilter);

	if (slugFilter && files.length === 0) {
		console.error(`No bank file for slug "${slugFilter}" in ${banksDir}`);
		process.exit(1);
	}

	return files.map((f) => {
		const full = path.join(banksDir, f);
		const data = JSON.parse(fs.readFileSync(full, 'utf8'));
		return {
			file: full,
			examSlug: data.examSlug ?? f.replace(/\.json$/, ''),
			trackCode: data.trackCode,
			docsFamily: data.docsFamily,
			questions: data.questions ?? []
		};
	});
}

function choiceLen(s) {
	return String(s ?? '').trim().length;
}

function isNegativeStem(prompt) {
	return /\bNOT\b|\bEXCEPT\b/.test(prompt);
}

/**
 * @param {ReturnType<typeof loadConfig>} config
 * @param {object} bank
 */
function validateBank(config, bank) {
	/** @type {{ level: 'error' | 'warning', msg: string }[]} */
	const issues = [];
	const track = config.bySlug.get(bank.examSlug) ?? config.byCode.get(bank.trackCode);
	const label = `${bank.examSlug} (${path.relative(root, bank.file)})`;

	if (!track) {
		issues.push({ level: 'error', msg: `${label}: unknown examSlug/trackCode — not in tracks.config.json` });
		return issues;
	}

	const domainNames = new Set(track.domains.map((d) => d.name));
	const questions = bank.questions;
	if (!Array.isArray(questions) || questions.length === 0) {
		issues.push({ level: 'error', msg: `${label}: no questions` });
		return issues;
	}

	if (questions.length !== track.targetCount) {
		issues.push({
			level: 'warning',
			msg: `${label}: count ${questions.length} ≠ targetCount ${track.targetCount}`
		});
	}

	if (bank.docsFamily && bank.docsFamily !== config.docsFamily) {
		issues.push({
			level: 'warning',
			msg: `${label}: docsFamily "${bank.docsFamily}" ≠ config "${config.docsFamily}"`
		});
	}

	const prompts = new Map();
	const indexCounts = [0, 0, 0, 0];
	let longestIsCorrect = 0;
	let scoredForLength = 0;
	let negativeStems = 0;
	let missingDomain = 0;
	let singleChoiceItems = 0;

	questions.forEach((q, i) => {
		const id = q.order != null ? `order ${q.order}` : `index ${i}`;
		const qType = q.questionType ?? 'single';

		if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.trim().length < 12) {
			issues.push({ level: 'error', msg: `${label} ${id}: prompt missing or too short` });
		} else {
			const key = q.prompt.trim().toLowerCase();
			if (prompts.has(key)) {
				issues.push({
					level: 'error',
					msg: `${label} ${id}: duplicate prompt (also ${prompts.get(key)})`
				});
			} else {
				prompts.set(key, id);
			}
			if (isNegativeStem(q.prompt)) negativeStems++;
			for (const pat of BANNED_STEM_PATTERNS) {
				if (pat.test(q.prompt)) {
					issues.push({ level: 'warning', msg: `${label} ${id}: banned stem pattern ${pat}` });
				}
			}
		}

		if (!q.explanation || String(q.explanation).trim().length < 20) {
			issues.push({ level: 'error', msg: `${label} ${id}: explanation missing or too short` });
		}

		if (q.domain) {
			if (!domainNames.has(q.domain)) {
				issues.push({
					level: 'error',
					msg: `${label} ${id}: domain "${q.domain}" not in track blueprint`
				});
			}
		} else {
			missingDomain++;
		}

		const hasSource =
			(typeof q.source === 'string' && q.source.length > 0) ||
			(Array.isArray(q.sourceUrls) && q.sourceUrls.length > 0);
		if (!hasSource) {
			issues.push({ level: 'warning', msg: `${label} ${id}: missing source / sourceUrls` });
		}

		if (qType === 'match') {
			if (!Array.isArray(q.matchLeftItems) || !Array.isArray(q.matchRightItems)) {
				issues.push({ level: 'error', msg: `${label} ${id}: match item missing columns` });
			}
			return;
		}

		if (!Array.isArray(q.choices) || q.choices.length < 4) {
			issues.push({
				level: 'error',
				msg: `${label} ${id}: need ≥4 choices (got ${q.choices?.length ?? 0})`
			});
			return;
		}

		const uniqueChoices = new Set(q.choices.map((c) => String(c).trim().toLowerCase()));
		if (uniqueChoices.size !== q.choices.length) {
			issues.push({ level: 'error', msg: `${label} ${id}: duplicate choice text` });
		}

		for (const c of q.choices) {
			for (const pat of BANNED_CHOICE_PATTERNS) {
				if (pat.test(c)) {
					issues.push({ level: 'error', msg: `${label} ${id}: banned choice pattern: ${c}` });
				}
			}
			for (const suf of BOILERPLATE_SUFFIXES) {
				if (String(c).endsWith(suf)) {
					issues.push({ level: 'error', msg: `${label} ${id}: rebalance boilerplate suffix on choice` });
				}
			}
		}

		if (qType === 'multi') {
			const idxs = q.correctIndexes ?? [];
			if (!Array.isArray(idxs) || idxs.length < 2) {
				issues.push({ level: 'error', msg: `${label} ${id}: multi needs correctIndexes (≥2)` });
			} else {
				// Still score length bias for multi (matches trackQuality.test.ts)
				scoredForLength++;
				const lengths = q.choices.map(choiceLen);
				const maxLen = Math.max(...lengths);
				if (lengths[q.correctIndex] === maxLen) longestIsCorrect++;
			}
			return;
		}

		// single
		singleChoiceItems++;
		const ci = q.correctIndex;
		if (!Number.isInteger(ci) || ci < 0 || ci >= q.choices.length) {
			issues.push({ level: 'error', msg: `${label} ${id}: invalid correctIndex ${ci}` });
			return;
		}
		if (ci <= 3) indexCounts[ci]++;

		const lengths = q.choices.map(choiceLen);
		const maxLen = Math.max(...lengths);
		// Match trackQuality: count when correct is tied for longest
		if (lengths[ci] === maxLen) {
			longestIsCorrect++;
		}
		scoredForLength++;
	});

	if (missingDomain > 0) {
		issues.push({
			level: 'warning',
			msg: `${label}: ${missingDomain}/${questions.length} questions missing domain tag`
		});
	}

	if (singleChoiceItems > 0) {
		const maxPos = Math.max(...indexCounts);
		const posRatio = maxPos / singleChoiceItems;
		if (posRatio > KEY_POSITION_BIAS) {
			const pos = indexCounts.indexOf(maxPos);
			issues.push({
				level: 'warning',
				msg: `${label}: key-position bias — index ${pos} is ${(posRatio * 100).toFixed(1)}% of single-choice items (cap ${(KEY_POSITION_BIAS * 100).toFixed(0)}%)`
			});
		}
	}

	if (scoredForLength > 0) {
		const longRatio = longestIsCorrect / scoredForLength;
		if (longRatio >= LONGEST_ANSWER_BIAS) {
			issues.push({
				level: 'warning',
				msg: `${label}: longest-answer bias — correct is longest on ${(longRatio * 100).toFixed(1)}% (cap <${(LONGEST_ANSWER_BIAS * 100).toFixed(0)}%)`
			});
		}
	}

	const negRatio = negativeStems / questions.length;
	if (negRatio > NEGATIVE_STEM_CAP) {
		issues.push({
			level: 'warning',
			msg: `${label}: negative stems (NOT/EXCEPT) ${(negRatio * 100).toFixed(1)}% > ${(NEGATIVE_STEM_CAP * 100).toFixed(0)}%`
		});
	}

	return issues;
}

function main() {
	const config = loadConfig();
	const banks = loadBankFiles(config);
	if (banks.length === 0) {
		console.error('No banks to validate.');
		process.exit(1);
	}

	let errors = 0;
	let warnings = 0;
	/** @type {{ level: string, msg: string }[]} */
	const all = [];

	for (const bank of banks.sort((a, b) => a.examSlug.localeCompare(b.examSlug))) {
		const issues = validateBank(config, bank);
		all.push(...issues);
		for (const issue of issues) {
			if (issue.level === 'error') errors++;
			else warnings++;
		}
	}

	for (const issue of all) {
		const tag = issue.level === 'error' ? 'ERROR' : 'WARN ';
		console.log(`${tag}  ${issue.msg}`);
	}

	console.log(
		`\nValidated ${banks.length} bank(s): ${errors} error(s), ${warnings} warning(s).`
	);
	process.exit(errors > 0 ? 1 : 0);
}

main();
