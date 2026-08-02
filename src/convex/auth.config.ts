/**
 * WorkOS User Management JWT validation for Convex.
 * Requires WORKOS_CLIENT_ID in Convex env (same Client ID as SvelteKit).
 *
 * WorkOS access tokens often use `iss: https://api.workos.com` (no trailing slash).
 * Convex requires `applicationID` for that shared issuer, so the WorkOS JWT template
 * must include `"aud": "<WORKOS_CLIENT_ID>"` (see docs/AUTH-WORKOS.md).
 *
 * @see https://docs.convex.dev/auth/authkit/add-to-app
 * @see https://docs.convex.dev/auth/authkit/troubleshooting
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
		// WorkOS commonly mints `iss` without a trailing slash; match it exactly.
		{
			type: 'customJwt' as const,
			issuer: 'https://api.workos.com',
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
