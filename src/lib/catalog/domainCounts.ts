/**
 * Build a zeroed domain→count map from an `as const` targets object without
 * asserting `Record<string, number>` at every call site.
 */
export function zeroDomainCounts(
	targets: Readonly<Record<string, number>>
): Map<string, number> {
	const counts = new Map<string, number>();
	for (const domain of Object.keys(targets)) {
		counts.set(domain, 0);
	}
	return counts;
}

/** Increment a domain counter when the tag is present. */
export function bumpDomainCount(counts: Map<string, number>, domain: string | undefined): void {
	if (!domain) return;
	counts.set(domain, (counts.get(domain) ?? 0) + 1);
}
