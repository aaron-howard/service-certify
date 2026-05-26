# Authentication setup (roadmap Phase C)

Service Certify is ready for JWT auth on Convex. Until a provider is configured, all queries and mutations remain public (appropriate for open practice content).

## Steps

1. Choose a provider (Clerk, Auth0, or WorkOS AuthKit are documented in `.claude/skills/convex-setup-auth/`).
2. Configure the provider’s JWT issuer and audience (`applicationID: "convex"` is common).
3. Edit `src/convex/auth.config.ts` — add your provider’s `domain` and `applicationID` to `providers`.
4. In `src/routes/+layout.svelte`, switch to `ConvexProviderWithAuth` (from `convex/react` / convex-svelte patterns) and pass `fetchAccessToken` from your provider.
5. Gate paid routes and `gradeAnswers` with `ctx.auth.getUserIdentity()` when membership launches.

## Server-side identity

Never pass `userId` in mutation args. Use `identity.tokenIdentifier` from `ctx.auth.getUserIdentity()` for progress and billing linkage.

## Related

- [Convex auth docs](https://docs.convex.dev/auth)
- Membership UI shell: `/membership`
