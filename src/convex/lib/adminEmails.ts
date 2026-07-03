/** Normalize ADMIN_EMAILS entries (trim, lowercase, strip wrapping quotes). */
export function parseAdminEmailAllowlist(raw: string): string[] {
	return raw
		.split(/[,;]/)
		.map((entry) => entry.trim().toLowerCase().replace(/^["']|["']$/g, ''))
		.filter(Boolean);
}

/** Check whether an email is in the ADMIN_EMAILS Convex env allowlist. */
export function isAdminEmail(email: string): boolean {
	const allowlist = parseAdminEmailAllowlist(process.env.ADMIN_EMAILS ?? '');
	return allowlist.includes(email.trim().toLowerCase());
}
