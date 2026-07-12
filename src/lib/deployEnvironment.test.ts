import { describe, expect, it } from 'vitest';
import {
	deployEnvironmentBannerLabel,
	inferWorkOsKeyEnvironment,
	isWorkOsKeyMisalignedForDeploy,
	resolveDeployEnvironment
} from './deployEnvironment';

describe('deployEnvironment', () => {
	it('maps Vercel production', () => {
		expect(resolveDeployEnvironment('production', 'production')).toBe('production');
	});

	it('maps Vercel preview', () => {
		expect(resolveDeployEnvironment('preview', 'production')).toBe('preview');
	});

	it('defaults to development locally', () => {
		expect(resolveDeployEnvironment(undefined, 'development')).toBe('development');
	});

	it('hides banner label in production', () => {
		expect(deployEnvironmentBannerLabel('production')).toBeNull();
	});

	it('shows labels for non-production', () => {
		expect(deployEnvironmentBannerLabel('preview')).toContain('Preview');
		expect(deployEnvironmentBannerLabel('development')).toContain('Local');
	});

	it('infers WorkOS key environment from prefix', () => {
		expect(inferWorkOsKeyEnvironment('sk_test_abc')).toBe('staging');
		expect(inferWorkOsKeyEnvironment('sk_live_abc')).toBe('production');
		expect(inferWorkOsKeyEnvironment('')).toBe('unknown');
	});

	it('flags staging WorkOS keys on production deploy', () => {
		expect(isWorkOsKeyMisalignedForDeploy('production', 'sk_test_abc')).toBe(true);
		expect(isWorkOsKeyMisalignedForDeploy('production', 'sk_live_abc')).toBe(false);
		expect(isWorkOsKeyMisalignedForDeploy('preview', 'sk_test_abc')).toBe(false);
	});
});
