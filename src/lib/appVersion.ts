import { version as packageVersion } from '../../package.json';

type ProcessEnv = Record<string, string | undefined>;

/** Read `process.env` when running under Node (undefined in some browser contexts). */
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
 *
 * Preference order:
 * 1. `import.meta.env.VITE_GIT_COMMIT_SHA` (build-time, client + server bundles)
 * 2. `VERCEL_GIT_COMMIT_SHA` (runtime Node / Vercel)
 * 3. `GITHUB_SHA` (runtime Node / GitHub Actions)
 *
 * Returns empty string when none are set (local/dev without a commit SHA).
 */
export function getAppRevision(): string {
	if (typeof import.meta !== 'undefined' && import.meta.env) {
		const fromVite = import.meta.env.VITE_GIT_COMMIT_SHA;
		if (typeof fromVite === 'string' && fromVite.trim()) {
			return fromVite.trim().slice(0, 12);
		}
	}

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
