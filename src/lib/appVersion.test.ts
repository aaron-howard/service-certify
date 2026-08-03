import { afterEach, describe, expect, it, vi } from 'vitest';
import { version } from '../../package.json';

describe('appVersion', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it('reads semver from package.json', async () => {
		const { getAppVersion } = await import('./appVersion');
		expect(getAppVersion()).toBe(version);
		expect(getAppVersion()).toMatch(/^\d+\.\d+\.\d+/);
	});

	it('uses a short Vercel SHA for revision', async () => {
		vi.stubEnv('VERCEL_GIT_COMMIT_SHA', 'abcdef0123456789deadbeef');
		const { getAppRevision, getAppVersionId, resolveSentryReleaseName } = await import(
			'./appVersion'
		);
		expect(getAppRevision()).toBe('abcdef012345');
		expect(getAppVersionId()).toBe(`${version}+abcdef012345`);
		expect(resolveSentryReleaseName()).toBe(`service-certify@${version}+abcdef012345`);
	});

	it('falls back to package version when SHA is missing', async () => {
		vi.stubEnv('VERCEL_GIT_COMMIT_SHA', '');
		vi.stubEnv('GITHUB_SHA', '');
		const { getAppRevision, getAppVersionId, resolveSentryReleaseName } = await import(
			'./appVersion'
		);
		expect(getAppRevision()).toBe('');
		expect(getAppVersionId()).toBe(version);
		expect(resolveSentryReleaseName()).toBe(`service-certify@${version}`);
	});
});
