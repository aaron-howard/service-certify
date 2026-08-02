#!/usr/bin/env node
/**
 * Create soft-launch Sentry issue alert rules for service-certify.
 *
 * Uses the official `sentry` CLI (device-code OAuth via `sentry auth login`).
 *
 * Rules (idempotent by name):
 *   1. New issue in production → email Issue Owners (fallthrough Active Members)
 *   2. Error spike in production (>20 events / 15m) → email Issue Owners
 *
 * Usage:
 *   npx sentry auth login          # one-time terminal device login
 *   npm run setup:sentry-alerts
 *
 * Optional env:
 *   SENTRY_ORG=ajhmh-mq
 *   SENTRY_PROJECT=service-certify
 *   SENTRY_ALERT_EMAIL=you@example.com  # prefer Member email when resolvable
 *   SENTRY_AUTH_TOKEN=sntrys_...        # optional override; normally use CLI login
 *
 * Exits 0 on success; exits 1 on failure or missing auth.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '..');
const ENV_LOCAL = resolve(ROOT, '.env.local');
const SENTRY_BIN = resolve(ROOT, 'node_modules/.bin/sentry');

const DEFAULT_ORG = 'ajhmh-mq';
const DEFAULT_PROJECT = 'service-certify';

const NEW_ISSUE_NAME = 'New issue in production';
const SPIKE_NAME = 'Error spike in production';

function loadEnvLocal() {
	if (!existsSync(ENV_LOCAL)) return;
	const text = readFileSync(ENV_LOCAL, 'utf8');
	for (const line of text.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eq = trimmed.indexOf('=');
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		let value = trimmed.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (!(key in process.env) || process.env[key] === '') {
			process.env[key] = value;
		}
	}
}

function ensureSentryBin() {
	if (!existsSync(SENTRY_BIN)) {
		throw new Error(
			`Missing ${SENTRY_BIN}. Run: npm install\n` +
				'Then authenticate: npx sentry auth login'
		);
	}
}

function runSentry(args, { json = false, allowFail = false } = {}) {
	const fullArgs = json ? [...args, '--json'] : args;
	const result = spawnSync(SENTRY_BIN, fullArgs, {
		encoding: 'utf8',
		env: process.env,
		cwd: ROOT
	});
	if (result.error) throw result.error;
	if (result.status !== 0 && !allowFail) {
		const detail = (result.stderr || result.stdout || '').trim();
		throw new Error(`sentry ${args.join(' ')} failed (exit ${result.status}):\n${detail}`);
	}
	return {
		status: result.status ?? 1,
		stdout: result.stdout ?? '',
		stderr: result.stderr ?? ''
	};
}

function parseJson(stdout) {
	const text = stdout.trim();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		// Some CLI versions wrap payloads; try last JSON object/array
		const startObj = text.indexOf('{');
		const startArr = text.indexOf('[');
		const start =
			startObj === -1 ? startArr : startArr === -1 ? startObj : Math.min(startObj, startArr);
		if (start === -1) throw new Error(`Expected JSON from sentry CLI, got:\n${text}`);
		return JSON.parse(text.slice(start));
	}
}

function requireAuth() {
	const status = runSentry(['auth', 'status'], { allowFail: true });
	if (status.status === 0) {
		const who = runSentry(['auth', 'whoami'], { allowFail: true });
		if (who.status === 0 && who.stdout.trim()) {
			console.log(`Authenticated: ${who.stdout.trim().split('\n')[0]}`);
		} else {
			console.log('Authenticated via sentry CLI');
		}
		return;
	}

	if (process.env.SENTRY_AUTH_TOKEN?.trim()) {
		console.log('Using SENTRY_AUTH_TOKEN from environment');
		return;
	}

	console.error(`Not authenticated with Sentry.

In this terminal (or any shell on this machine), run:

  npx sentry auth login

1. Open the URL shown
2. Enter the device code
3. Approve access for org ajhmh-mq

Then re-run:

  npm run setup:sentry-alerts`);
	process.exit(1);
}

function emailAction(memberId) {
	if (memberId) {
		return {
			id: 'sentry.mail.actions.NotifyEmailAction',
			targetType: 'Member',
			targetIdentifier: String(memberId)
		};
	}
	return {
		id: 'sentry.mail.actions.NotifyEmailAction',
		targetType: 'IssueOwners',
		targetIdentifier: '',
		fallthroughType: 'ActiveMembers'
	};
}

function resolveMemberId(org, email) {
	if (!email) return null;
	const { status, stdout, stderr } = runSentry(
		['api', `organizations/${org}/members/`],
		{ json: true, allowFail: true }
	);
	if (status !== 0) {
		console.warn(`Could not list org members; falling back to IssueOwners.\n${stderr || stdout}`);
		return null;
	}
	const body = parseJson(stdout);
	const members = Array.isArray(body) ? body : [];
	const match = members.find((m) => {
		const memberEmail = m.email ?? m.user?.email;
		return typeof memberEmail === 'string' && memberEmail.toLowerCase() === email.toLowerCase();
	});
	const userId = match?.user?.id ?? match?.userId ?? match?.id;
	if (!userId) {
		console.warn(`No org member found for ${email}; falling back to IssueOwners.`);
		return null;
	}
	return userId;
}

function listRules(org, project) {
	// Prefer classic project rules API — `sentry alert issues list` returns workflow-engine
	// alerts, while `sentry alert issues create` still writes classic /projects/.../rules/.
	const { stdout } = runSentry(
		['api', `projects/${org}/${project}/rules/?per_page=100`],
		{ json: true }
	);
	const body = parseJson(stdout);
	if (Array.isArray(body)) return body;
	if (body && Array.isArray(body.data)) return body.data;
	return [];
}

function createRule(org, project, payload) {
	const args = [
		'alert',
		'issues',
		'create',
		`${org}/${project}`,
		'--name',
		payload.name,
		'--action-match',
		payload.actionMatch,
		'--frequency',
		String(payload.frequency),
		'--environment',
		payload.environment,
		'--condition',
		JSON.stringify(payload.conditions),
		'--action',
		JSON.stringify(payload.actions)
	];
	if (payload.filterMatch) {
		args.push('--filter-match', payload.filterMatch);
	}
	const { status, stdout, stderr } = runSentry(args, { json: true, allowFail: true });
	if (status === 0) return parseJson(stdout);

	const detail = `${stderr}\n${stdout}`;
	// Race / prior partial run: treat exact-name duplicates as success.
	if (/exact duplicate/i.test(detail) || /already exists/i.test(detail)) {
		const existing = listRules(org, project).find((r) => r.name === payload.name);
		if (existing) return existing;
	}
	throw new Error(`sentry ${args.join(' ')} failed (exit ${status}):\n${detail.trim()}`);
}

function ensureRule(org, project, existing, payload) {
	const found = existing.find((r) => r.name === payload.name);
	if (found) {
		console.log(`✓ Already exists: ${payload.name} (id=${found.id})`);
		return { created: false, rule: found };
	}
	const rule = createRule(org, project, payload);
	const id = rule?.id ?? rule?.data?.id ?? '?';
	console.log(`✓ Created: ${payload.name} (id=${id})`);
	return { created: true, rule };
}

function newIssueRule(action) {
	return {
		name: NEW_ISSUE_NAME,
		environment: 'production',
		actionMatch: 'all',
		filterMatch: 'all',
		frequency: 5,
		conditions: [
			{ id: 'sentry.rules.conditions.first_seen_event.FirstSeenEventCondition' }
		],
		actions: [action]
	};
}

function spikeRule(action) {
	return {
		name: SPIKE_NAME,
		environment: 'production',
		actionMatch: 'all',
		filterMatch: 'all',
		frequency: 10,
		conditions: [
			{
				id: 'sentry.rules.conditions.event_frequency.EventFrequencyCondition',
				value: 20,
				// EventFrequencyCondition allows 1m/5m/15m/1h/… (not 10m)
				interval: '15m',
				comparisonType: 'count'
			}
		],
		actions: [action]
	};
}

async function main() {
	loadEnvLocal();
	ensureSentryBin();
	requireAuth();

	const org = (process.env.SENTRY_ORG || DEFAULT_ORG).trim();
	const project = (process.env.SENTRY_PROJECT || DEFAULT_PROJECT).trim();
	const alertEmail = (
		process.env.SENTRY_ALERT_EMAIL ||
		process.env.ADMIN_EMAIL ||
		''
	).trim();

	console.log(`Org/project: ${org}/${project}`);
	if (alertEmail) console.log(`Prefer email member: ${alertEmail}`);

	const memberId = resolveMemberId(org, alertEmail || null);
	const action = emailAction(memberId);
	if (memberId) {
		console.log(`Email target: Member ${memberId}`);
	} else {
		console.log('Email target: IssueOwners → ActiveMembers');
	}

	const existing = listRules(org, project);
	const results = [];
	results.push(ensureRule(org, project, existing, newIssueRule(action)));
	const afterNew = results[0].created ? listRules(org, project) : existing;
	results.push(ensureRule(org, project, afterNew, spikeRule(action)));

	const created = results.filter((r) => r.created).length;
	console.log('');
	console.log(
		created === 0
			? 'No changes — both soft-launch alerts already present.'
			: `Done — created ${created} alert rule(s).`
	);
	console.log(`UI: https://${org}.sentry.io/alerts/rules/`);
	console.log('Next: Alerts → Send test notification (or wait for a production issue).');
}

main().catch((err) => {
	console.error(err instanceof Error ? err.message : err);
	process.exit(1);
});
