/**
 * Convex JWT auth provider for WorkOS.
 * WorkOS handles OAuth for Google, Microsoft, GitHub, Facebook, etc.
 * See docs/AUTH-WORKOS.md for setup.
 */
export default {
	providers: [
		{
			domain: 'https://api.workos.com',
			applicationID: 'convex'
		}
	]
};
