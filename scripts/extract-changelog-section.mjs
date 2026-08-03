#!/usr/bin/env node
/**
 * Extract a Keep-a-Changelog section into release-notes.md.
 *
 * Usage:
 *   VERSION=0.1.0 node scripts/extract-changelog-section.mjs
 *
 * Matches a heading line that is exactly `## [VERSION]` or starts with
 * `## [VERSION] ` (e.g. `## [0.1.0] - 2026-08-03`). Avoids substring false
 * positives from prose under Unreleased.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const version = (process.env.VERSION || '').trim();

if (!version) {
	console.error('VERSION env var is required');
	process.exit(1);
}

if (!/^\d+\.\d+\.\d+([.-][0-9A-Za-z.-]+)?$/.test(version)) {
	console.error(`VERSION must be canonical semver, got: ${version}`);
	process.exit(1);
}

const text = readFileSync(resolve(ROOT, 'CHANGELOG.md'), 'utf8');
const headingPrefix = `## [${version}]`;
const lines = text.split(/\r?\n/);
const start = lines.findIndex(
	(line) => line === headingPrefix || line.startsWith(`${headingPrefix} `)
);

if (start === -1) {
	console.error(`No CHANGELOG section for ${version}`);
	process.exit(1);
}

let end = lines.length;
for (let i = start + 1; i < lines.length; i++) {
	if (lines[i].startsWith('## [')) {
		end = i;
		break;
	}
}

const section = `${lines.slice(start, end).join('\n').trim()}\n`;
writeFileSync(resolve(ROOT, 'release-notes.md'), section);
console.log(`Wrote release-notes.md for ${version} (${end - start} lines)`);
