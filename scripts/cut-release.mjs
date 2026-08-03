#!/usr/bin/env node
/**
 * Create an annotated git tag for the current package.json version.
 *
 * Usage:
 *   npm run release:tag           # create vX.Y.Z locally
 *   npm run release:tag:push      # create + push (triggers GitHub Release workflow)
 *
 * Prerequisites:
 *   - Clean working tree
 *   - On main (or RELEASE_ALLOW_BRANCH override)
 *   - CHANGELOG.md contains a ## [X.Y.Z] section
 *   - Tag must not already exist
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '..');
const PUSH = process.argv.includes('--push');
const ALLOW_BRANCH = (process.env.RELEASE_ALLOW_BRANCH || 'main').trim();

function run(cmd, args, { allowFail = false } = {}) {
	const result = spawnSync(cmd, args, {
		cwd: ROOT,
		encoding: 'utf8'
	});
	if (result.error) throw result.error;
	if (result.status !== 0 && !allowFail) {
		throw new Error(
			`${cmd} ${args.join(' ')} failed:\n${(result.stderr || result.stdout || '').trim()}`
		);
	}
	return (result.stdout || '').trim();
}

function readVersion() {
	const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
	if (!/^\d+\.\d+\.\d+([.-].+)?$/.test(pkg.version)) {
		throw new Error(`Invalid package.json version: ${pkg.version}`);
	}
	return pkg.version;
}

function assertChangelogHasVersion(version) {
	const changelogPath = resolve(ROOT, 'CHANGELOG.md');
	if (!existsSync(changelogPath)) {
		throw new Error('CHANGELOG.md is missing');
	}
	const text = readFileSync(changelogPath, 'utf8');
	// Literal line match — avoid RegExp built from version (CodeQL js/incomplete-sanitization).
	const headingPrefix = `## [${version}]`;
	const hasHeading = text.split(/\r?\n/).some(
		(line) => line === headingPrefix || line.startsWith(`${headingPrefix} `)
	);
	if (!hasHeading) {
		throw new Error(`CHANGELOG.md has no "## [${version}]" section`);
	}
}

function main() {
	const version = readVersion();
	const tag = `v${version}`;

	const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
	if (branch !== ALLOW_BRANCH) {
		throw new Error(`Refusing to tag from branch "${branch}" (expected "${ALLOW_BRANCH}")`);
	}

	run('git', ['fetch', 'origin', ALLOW_BRANCH]);
	const localHead = run('git', ['rev-parse', 'HEAD']);
	const remoteHead = run('git', ['rev-parse', `origin/${ALLOW_BRANCH}`]);
	if (localHead !== remoteHead) {
		throw new Error(
			`Local ${ALLOW_BRANCH} (${localHead.slice(0, 12)}) is not up to date with origin/${ALLOW_BRANCH} (${remoteHead.slice(0, 12)})`
		);
	}

	const dirty = run('git', ['status', '--porcelain']);
	if (dirty) {
		throw new Error('Working tree is dirty; commit or stash before tagging');
	}

	assertChangelogHasVersion(version);

	const existing = run('git', ['tag', '-l', tag]);
	if (existing === tag) {
		throw new Error(`Tag ${tag} already exists`);
	}

	const sha = run('git', ['rev-parse', '--short=12', 'HEAD']);
	const message = `Release ${tag} (${sha})`;

	run('git', ['tag', '-a', tag, '-m', message]);
	console.log(`✓ Created annotated tag ${tag} at ${sha}`);

	if (PUSH) {
		run('git', ['push', 'origin', tag]);
		console.log(`✓ Pushed ${tag} to origin`);
		console.log(
			`GitHub Release workflow should publish: https://github.com/aaron-howard/service-certify/releases/tag/${tag}`
		);
	} else {
		console.log('Tag is local only. Push with: npm run release:tag:push');
		console.log(`Or: git push origin ${tag}`);
	}
}

try {
	main();
} catch (err) {
	console.error(err instanceof Error ? err.message : err);
	process.exit(1);
}
