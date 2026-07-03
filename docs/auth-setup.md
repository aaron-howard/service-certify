# Authentication setup (roadmap Phase C)

Service Certify is ready for JWT auth on Convex. Until a provider is configured, all queries and mutations remain public (appropriate for open practice content).

## Steps

1. Choose a provider (Clerk, Auth0, or WorkOS AuthKit are documented in `.claude/skills/convex-setup-auth/`).
2. Configure the provider’s JWT issuer and audience (`applicationID: "convex"` is common).
3. Edit `src/convex/auth.config.ts` — add your provider’s `domain` and `applicationID` to `providers`.
4. In `src/routes/+layout.svelte`, wire `ConvexClient.setAuth` to `/api/auth/convex-token` (see `docs/AUTH-WORKOS.md`).
5. Set `ADMIN_EMAILS` in Convex env for admin bootstrap: `npx convex env set ADMIN_EMAILS you@domain.gov`.
6. Gate full practice (`mode=full`) with `requireAdmin` in Convex; sample mode stays public.

## Server-side identity

Never pass `userId` in mutation args. Use `identity.tokenIdentifier` from `ctx.auth.getUserIdentity()` for progress and billing linkage.

## Related

- [Convex auth docs](https://docs.convex.dev/auth)
- Membership UI shell: `/membership`
