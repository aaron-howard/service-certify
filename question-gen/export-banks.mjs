#!/usr/bin/env node
/**
 * Export src/convex/seed/devQuestionBank.ts into question-gen/banks/<examSlug>.json
 * for audit / generation workflows.
 *
 * Usage: node question-gen/export-banks.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const seedPath = path.join(root, 'src', 'convex', 'seed', 'devQuestionBank.ts');
const banksDir = path.join(__dirname, 'banks');
const configPath = path.join(__dirname, 'tracks.config.json');

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

function sourceFromUrls(sourceUrls) {
	if (!Array.isArray(sourceUrls) || sourceUrls.length === 0) return undefined;
	const first = sourceUrls[0];
	// Prefer a markdown/ path if present; otherwise keep the docs URL as source cite.
	if (typeof first === 'string' && first.includes('/markdown/')) {
		const idx = first.indexOf('markdown/');
		return first.slice(idx);
	}
	return first;
}

function main() {
	const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
	const byCode = new Map(config.tracks.map((t) => [t.trackCode, t]));
	const rows = parseSeedBank();
	const today = new Date().toISOString().slice(0, 10);

	/** @type {Map<string, object[]>} */
	const bySlug = new Map();
	for (const q of rows) {
		const slug = slugFromCode(q.trackCode);
		if (!bySlug.has(slug)) bySlug.set(slug, []);
		const { trackCode: _tc, ...rest } = q;
		const exported = {
			...rest,
			source: rest.source ?? sourceFromUrls(rest.sourceUrls)
		};
		bySlug.get(slug).push(exported);
	}

	fs.mkdirSync(banksDir, { recursive: true });

	// Remove stale bank files not in current export set
	for (const f of fs.readdirSync(banksDir)) {
		if (f.endsWith('.json') && !bySlug.has(f.replace(/\.json$/, ''))) {
			fs.unlinkSync(path.join(banksDir, f));
		}
	}

	const bySlugMeta = new Map(config.tracks.map((t) => [t.examSlug, t]));

	let total = 0;
	for (const [examSlug, questions] of [...bySlug.entries()].sort((a, b) =>
		a[0].localeCompare(b[0])
	)) {
		questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		const track = bySlugMeta.get(examSlug) ?? byCode.get(examSlug.toUpperCase());

		const bank = {
			examSlug,
			trackCode: track?.trackCode ?? examSlug.toUpperCase(),
			docsFamily: config.docsFamily ?? 'australia',
			generatedAt: today,
			exportedFrom: 'src/convex/seed/devQuestionBank.ts',
			questionCount: questions.length,
			questions
		};
		const out = path.join(banksDir, `${examSlug}.json`);
		fs.writeFileSync(out, JSON.stringify(bank, null, 2) + '\n');
		total += questions.length;
		console.log(`wrote ${examSlug}.json (${questions.length})`);
	}

	console.log(`\nExported ${bySlug.size} banks, ${total} questions → ${path.relative(root, banksDir)}`);
}

main();
