import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	checkRateLimit,
	getRateLimitStatus,
	unavailableRateLimitResult
} from './rateLimit';

describe('Rate Limiter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('checkRateLimit', () => {
		it('should allow requests within limit', async () => {
			const result = await checkRateLimit('test-ip', {
				windowSeconds: 60,
				maxRequests: 100
			});

			expect(result.allowed).toBe(true);
			expect(result.current).toBeLessThanOrEqual(100);
		});

		it('should have correct limit and reset values', async () => {
			const result = await checkRateLimit('test-ip-2', {
				windowSeconds: 60,
				maxRequests: 100
			});

			expect(result.limit).toBe(100);
			expect(result.resetIn).toBeGreaterThan(0);
			expect(result.resetIn).toBeLessThanOrEqual(60);
		});

		it('should fail open when Redis is not configured outside production', async () => {
			const result = await checkRateLimit('fallback-test', {
				windowSeconds: 60,
				maxRequests: 10
			});

			expect(result.allowed).toBe(true);
		});

		it('should support custom key prefixes', async () => {
			const result1 = await checkRateLimit('user-123', {
				windowSeconds: 60,
				maxRequests: 100,
				keyPrefix: 'user-api:'
			});

			const result2 = await checkRateLimit('user-123', {
				windowSeconds: 60,
				maxRequests: 100,
				keyPrefix: 'grade:'
			});

			expect(result1.current + result2.current).toBeLessThanOrEqual(200);
		});
	});

	describe('unavailableRateLimitResult', () => {
		it('fails open outside production', () => {
			const result = unavailableRateLimitResult(10, 60, false);
			expect(result.allowed).toBe(true);
			expect(result.current).toBe(0);
			expect(result.limit).toBe(10);
		});

		it('fails closed in production', () => {
			const result = unavailableRateLimitResult(10, 60, true);
			expect(result.allowed).toBe(false);
			expect(result.current).toBe(10);
			expect(result.limit).toBe(10);
			expect(result.resetIn).toBe(60);
		});
	});

	describe('getRateLimitStatus', () => {
		it('should return current status without consuming request', async () => {
			const status1 = await getRateLimitStatus('status-test', {
				windowSeconds: 60,
				maxRequests: 50
			});

			const status2 = await getRateLimitStatus('status-test', {
				windowSeconds: 60,
				maxRequests: 50
			});

			expect(status1.current).toBe(status2.current);
		});

		it('should have correct default values', async () => {
			const result = await getRateLimitStatus('defaults-test');

			expect(result.limit).toBe(100);
			expect(result.resetIn).toBeDefined();
		});
	});

	describe('Rate limit presets', () => {
		it('should handle health check limits (1000/min)', async () => {
			const result = await checkRateLimit('health-ip', {
				windowSeconds: 60,
				maxRequests: 1000
			});

			expect(result.limit).toBe(1000);
		});

		it('should handle strict limits (10/min)', async () => {
			const result = await checkRateLimit('strict-ip', {
				windowSeconds: 60,
				maxRequests: 10
			});

			expect(result.limit).toBe(10);
		});

		it('should handle custom windows (3600s)', async () => {
			const result = await checkRateLimit('hourly-ip', {
				windowSeconds: 3600,
				maxRequests: 10000
			});

			expect(result.resetIn).toBeLessThanOrEqual(3600);
		});
	});
});
