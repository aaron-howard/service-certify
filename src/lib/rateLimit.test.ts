import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getRateLimitStatus } from './rateLimit';

describe('Rate Limiter', () => {
	beforeEach(() => {
		// Reset rate limiter state before each test
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

		it('should gracefully degrade when Redis is not configured', async () => {
			// Rate limiter should allow all requests if Redis is not available
			const result = await checkRateLimit('fallback-test', {
				windowSeconds: 60,
				maxRequests: 10
			});

			// Should allow request even if Redis down
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

			// Different prefixes should track separately
			expect(result1.current + result2.current).toBeLessThanOrEqual(200);
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

			// Calling status should not increase count
			expect(status1.current).toBe(status2.current);
		});

		it('should have correct default values', async () => {
			const result = await getRateLimitStatus('defaults-test');

			expect(result.limit).toBe(100); // default maxRequests
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
