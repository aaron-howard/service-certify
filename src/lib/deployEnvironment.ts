/**
 * Application deploy tier (Vercel-aligned).
 * Distinct from WorkOS staging/production — see docs/WORKOS-ENVIRONMENTS.md.
 */
export type DeployEnvironment = 'development' | 'preview' | 'production';

export type WorkOsKeyEnvironment = 'staging' | 'production' | 'unknown';

/** Resolve deploy tier from Vercel / Node env (server-side). */
export function resolveDeployEnvironment(
	vercelEnv?: string | null,
	nodeEnv?: string | null
): DeployEnvironment {
	if (vercelEnv === 'production') return 'production';
	if (vercelEnv === 'preview') return 'preview';
	if (nodeEnv === 'production' && !vercelEnv) return 'production';
	return 'development';
}

/** Short label for non-production UI banners; null in production. */
export function deployEnvironmentBannerLabel(env: DeployEnvironment): string | null {
	switch (env) {
		case 'preview':
			return 'Preview deployment — not production';
		case 'development':
			return 'Local development — not production';
		default:
			return null;
	}
}

/** Infer WorkOS environment from API key prefix (`sk_test_` staging, `sk_live_` production). */
export function inferWorkOsKeyEnvironment(apiKey?: string | null): WorkOsKeyEnvironment {
	if (!apiKey) return 'unknown';
	if (apiKey.startsWith('sk_live_')) return 'production';
	if (apiKey.startsWith('sk_test_')) return 'staging';
	return 'unknown';
}

/**
 * True when a production deploy uses a staging WorkOS key (misconfiguration).
 * Unknown key shapes are not flagged.
 */
export function isWorkOsKeyMisalignedForDeploy(
	deployEnvironment: DeployEnvironment,
	workosApiKey?: string | null
): boolean {
	if (deployEnvironment !== 'production') return false;
	return inferWorkOsKeyEnvironment(workosApiKey) === 'staging';
}
