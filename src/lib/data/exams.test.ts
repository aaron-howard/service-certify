import { describe, expect, it } from 'vitest';
import { CERTIFICATION_TRACKS_FOR_SEED } from '$lib/catalog/tracksCanonical';
import { getExamBySlug } from './exams';

const BLUEPRINT_FALLBACK = 'Blueprint-aligned practice';

function slugFromCode(code: string): string {
	return code.toLowerCase().replace(/_/g, '-');
}

function sumDomainWeights(domains: { weight: string }[]): number {
	return domains.reduce((sum, d) => sum + Number.parseFloat(d.weight), 0);
}

describe('exam catalog domains', () => {
	it('every track has a multi-domain breakdown (no blueprint fallback)', () => {
		for (const track of CERTIFICATION_TRACKS_FOR_SEED) {
			const slug = slugFromCode(track.code);
			const exam = getExamBySlug(slug);
			expect(exam, `missing exam for ${track.code}`).toBeDefined();

			expect(exam!.domains.length).toBeGreaterThan(1);
			expect(exam!.domains.map((d) => d.name)).not.toContain(BLUEPRINT_FALLBACK);
			expect(sumDomainWeights(exam!.domains)).toBeGreaterThanOrEqual(99);
			expect(sumDomainWeights(exam!.domains)).toBeLessThanOrEqual(101);
		}
	});
});
