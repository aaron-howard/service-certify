/** WorkOS user fields used to build a display name and avatar. */
export type WorkOSUserProfile = {
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	/** Full display name from the identity provider (often set for Microsoft). */
	name?: string | null;
	profilePictureUrl?: string | null;
};

/** Build a friendly display name from WorkOS / OAuth profile data. */
export function resolveWorkOSDisplayName(user: WorkOSUserProfile): string {
	const fromParts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
	if (fromParts) return fromParts;

	const fullName = user.name?.trim();
	if (fullName) return fullName;

	const fromEmail = formatNameFromEmailLocalPart(user.email);
	if (fromEmail) return fromEmail;

	return user.email;
}

/** e.g. mr.aaronjhoward@outlook.com → "Mr Aaronjhoward" when OAuth sends no name fields. */
function formatNameFromEmailLocalPart(email: string): string | null {
	const local = email.split('@')[0]?.trim();
	if (!local) return null;

	const words = local
		.replace(/[._-]+/g, ' ')
		.split(/\s+/)
		.map((part) => part.trim())
		.filter(Boolean);

	if (words.length === 0) return null;

	return words
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

export function resolveWorkOSProfileImage(user: WorkOSUserProfile): string | undefined {
	const url = user.profilePictureUrl?.trim();
	return url || undefined;
}
