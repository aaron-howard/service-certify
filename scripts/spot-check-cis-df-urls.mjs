/**
 * Spot-check CIS-DF sourceUrls for reachability and obvious deprecation.
 *
 * Usage:
 *   node scripts/spot-check-cis-df-urls.mjs              # 10 stratified samples
 *   node scripts/spot-check-cis-df-urls.mjs --all        # every unique URL
 *   node scripts/spot-check-cis-df-urls.mjs --sample=15    # N random unique URLs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');

const sampleArg = process.argv.find((a) => a.startsWith('--sample='));
const sampleCount = sampleArg ? Number(sampleArg.split('=')[1]) : 10;
const checkAll = process.argv.includes('--all');

function readBank() {
	const raw = fs.readFileSync(bankPath, 'utf8');
	const match = raw.match(/DEV_PRACTICE_QUESTIONS[^=]*=\s*(\[[\s\S]*\]);/);
	if (!match) throw new Error('Could not parse devQuestionBank.ts');
	return JSON.parse(match[1]);
}

function stratifiedSample(urlEntries, count) {
	const byDomain = new Map();
	for (const entry of urlEntries) {
		const bucket = entry.domain ?? 'unknown';
		if (!byDomain.has(bucket)) byDomain.set(bucket, []);
		byDomain.get(bucket).push(entry);
	}
	const picked = [];
	const domains = [...byDomain.keys()].sort();
	let i = 0;
	while (picked.length < count && domains.length) {
		const domain = domains[i % domains.length];
		const pool = byDomain.get(domain);
		if (pool.length) picked.push(pool.shift());
		if (pool.length === 0) domains.splice(domains.indexOf(domain), 1);
		else i++;
	}
	return picked.slice(0, count);
}

async function checkUrl(url) {
	try {
		const res = await fetch(url, {
			method: 'GET',
			redirect: 'follow',
			headers: { 'User-Agent': 'service-certify-url-spot-check/1.0' }
		});
		return { url, status: res.status, ok: res.ok };
	} catch (err) {
		return { url, status: 0, ok: false, error: err.message };
	}
}

const rows = readBank().filter((q) => q.trackCode === 'CIS-DF');
const urlEntries = [];
const seen = new Set();
for (const q of rows) {
	for (const url of q.sourceUrls ?? []) {
		if (seen.has(url)) continue;
		seen.add(url);
		urlEntries.push({ url, domain: q.domain, order: q.order });
	}
}

const targets = checkAll
	? urlEntries
	: stratifiedSample(urlEntries, sampleCount);

console.log(`Checking ${targets.length} CIS-DF source URL(s)...`);

const results = [];
for (const entry of targets) {
	const result = await checkUrl(entry.url);
	results.push({ ...entry, ...result });
	const label = result.ok ? 'OK' : 'FAIL';
	console.log(`${label} ${result.status} ${entry.url}`);
	if (entry.domain) console.log(`     domain=${entry.domain} firstSeenOrder=${entry.order}`);
}

const failures = results.filter((r) => !r.ok);
if (failures.length) {
	console.error(`\n${failures.length} URL(s) failed spot-check:`);
	for (const f of failures) {
		console.error(` - ${f.status} ${f.url}${f.error ? ` (${f.error})` : ''}`);
	}
	process.exit(1);
}

console.log(`\nAll ${results.length} checked URL(s) returned HTTP 2xx.`);
