#!/usr/bin/env node
/**
 * Create soft-launch Sentry issue alert rules for service-certify.
 *
 * Rules (idempotent by name):
 *   1. New issue in production → email Issue Owners (fallthrough Active Members)
 *   2. Error spike in production (>20 events / 10m) → email Issue Owners
 *
 * Usage:
 *   SENTRY_AUTH_TOKEN=sntrys_... npm run setup:sentry-alerts
 *
 * Optional env:
 *   SENTRY_ORG=ajhmh-mq
 *   SENTRY_PROJECT=service-certify
 *   SENTRY_REGION=us          # us → us.sentry.io, de → de.sentry.io, omit → sentry.io
 *   SENTRY_ALERT_EMAIL=you@example.com  # prefer Member email when resolvable
 *
 * Token scopes: alerts:write (or org:write / org:admin).
 * The Vercel source-map token often lacks alerts:write — create an org auth token.
 *
 * Loads SENTRY_* from the environment and from .env.local if present.
 * Exits 0 on success; exits 1 on failure or missing credentials.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ENV_LOCAL = resolve(ROOT, '.env.local');

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

function apiBase(region) {
	if (!region || region === 'global') return 'https://sentry.io/api/0';
	return `https://${region}.sentry.io/api/0`;
}

async function sentryFetch(base, path, token, options = {}) {
	const res = await fetch(`${base}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			...(options.headers ?? {})
		}
	});
	const text = await res.text();
	let body = null;
	if (text) {
		try {
			body = JSON.parse(text);
		} catch {
			body = text;
		}
	}
	return { res, body };
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
		filters: [],
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
				interval: '10m',
				comparisonType: 'count'
			}
		],
		filters: [],
		actions: [action]
	};
}

async function resolveMemberId(base, org, token, email) {
	if (!email) return null;
	const { res, body } = await sentryFetch(base, `/organizations/${org}/members/`, token);
	if (!res.ok) {
		console.warn(`Could not list org members (${res.status}); falling back to IssueOwners.`);
		return null;
	}
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

async function listRules(base, org, project, token) {
	const { res, body } = await sentryFetch(base, `/projects/${org}/${project}/rules/`, token);
	if (!res.ok) {
		const detail =
			typeof body === 'object' && body && 'detail' in body ? body.detail : JSON.stringify(body);
		throw new Error(`List rules failed (${res.status}): ${detail}`);
	}
	return Array.isArray(body) ? body : [];
}

async function createRule(base, org, project, token, payload) {
	const { res, body } = await sentryFetch(base, `/projects/${org}/${project}/rules/`, token, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
	if (!res.ok) {
		const detail = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
		throw new Error(`Create rule "${payload.name}" failed (${res.status}): ${detail}`);
	}
	return body;
}

async function ensureRule(base, org, project, token, existing, payload) {
	const found = existing.find((r) => r.name === payload.name);
	if (found) {
		console.log(`✓ Already exists: ${payload.name} (id=${found.id})`);
		return { created: false, rule: found };
	}
	const rule = await createRule(base, org, project, token, payload);
	console.log(`✓ Created: ${payload.name} (id=${rule.id})`);
	return { created: true, rule };
}

async function main() {
	loadEnvLocal();

	const token = process.env.SENTRY_AUTH_TOKEN?.trim();
	const org = (process.env.SENTRY_ORG || DEFAULT_ORG).trim();
	const project = (process.env.SENTRY_PROJECT || DEFAULT_PROJECT).trim();
	const region = (process.env.SENTRY_REGION || 'us').trim();
	const alertEmail = (
		process.env.SENTRY_ALERT_EMAIL ||
		process.env.ADMIN_EMAIL ||
		''
	).trim();

	if (!token) {
		console.error(`Missing SENTRY_AUTH_TOKEN.

Create an Organization Auth Token at:
  https://${org}.sentry.io/settings/auth-tokens/

Required scopes: alerts:write (or org:write)

Then run:
  SENTRY_AUTH_TOKEN=sntrys_... npm run setup:sentry-alerts

Optional:
  SENTRY_ALERT_EMAIL=aaron.howard@dallas.gov npm run setup:sentry-alerts`);
		process.exit(1);
	}

	const base = apiBase(region);
	console.log(`Sentry API: ${base}`);
	console.log(`Org/project: ${org}/${project}`);
	if (alertEmail) console.log(`Prefer email member: ${alertEmail}`);

	const memberId = await resolveMemberId(base, org, token, alertEmail || null);
	const action = emailAction(memberId);
	if (memberId) {
		console.log(`Email target: Member ${memberId}`);
	} else {
		console.log('Email target: IssueOwners → ActiveMembers');
	}

	const existing = await listRules(base, org, project, token);
	const results = [];
	results.push(await ensureRule(base, org, project, token, existing, newIssueRule(action)));
	// Refresh names after possible create so spike doesn't collide with a renamed list
	const afterNew = results[0].created
		? await listRules(base, org, project, token)
		: existing;
	results.push(await ensureRule(base, org, project, token, afterNew, spikeRule(action)));

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
