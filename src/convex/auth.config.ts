/**
 * WorkOS User Management JWT validation for Convex.
 * Requires WORKOS_CLIENT_ID in Convex env (same Client ID as SvelteKit).
 * @see https://docs.convex.dev/auth/authkit/add-to-app
 */
const clientId = process.env.WORKOS_CLIENT_ID;

const authConfig = {
	providers: [
		{
			type: 'customJwt' as const,
			issuer: 'https://api.workos.com/',
			algorithm: 'RS256' as const,
			jwks: `https://api.workos.com/sso/jwks/${clientId}`,
			applicationID: clientId
		},
		{
			type: 'customJwt' as const,
			issuer: `https://api.workos.com/user_management/${clientId}`,
			algorithm: 'RS256' as const,
			jwks: `https://api.workos.com/sso/jwks/${clientId}`
		}
	]
};

export default authConfig;
