import { version as packageVersion } from '../../package.json';

type ProcessEnv = Record<string, string | undefined>;

function processEnv(): ProcessEnv | undefined {
	const proc =
		typeof globalThis !== 'undefined'
			? (globalThis as { process?: { env?: ProcessEnv } }).process
			: undefined;
	return proc?.env;
}

/** Semver from package.json (human release channel). */
export function getAppVersion(): string {
	return packageVersion;
}

/**
 * Short git SHA for the running deploy.
 * Prefer Vercel’s commit SHA; fall back to empty when unavailable (local/CI).
 */
export function getAppRevision(): string {
	const env = processEnv();
	const sha = env?.VERCEL_GIT_COMMIT_SHA?.trim() || env?.GITHUB_SHA?.trim() || '';
	return sha ? sha.slice(0, 12) : '';
}

/**
 * Compact identity for logs / health: `0.1.0` or `0.1.0+abcdef012345`.
 */
export function getAppVersionId(): string {
	const version = getAppVersion();
	const revision = getAppRevision();
	return revision ? `${version}+${revision}` : version;
}

/**
 * Sentry release name.
 * Includes semver for humans and a short SHA so each Vercel deploy is distinct.
 */
export function resolveSentryReleaseName(): string {
	const version = getAppVersion();
	const revision = getAppRevision();
	return revision ? `service-certify@${version}+${revision}` : `service-certify@${version}`;
}
