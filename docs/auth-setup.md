# Authentication setup

**Status:** WorkOS is implemented (Phase C complete for core auth).  
**Last updated:** 2026-07-10

Service Certify uses **WorkOS** for OAuth (Google, Microsoft, GitHub). Session cookies live in SvelteKit; Convex stores the app `users` row and enforces admin-only full mock exams.

For the full setup guide (env vars, redirect URIs, admin bootstrap, troubleshooting), see **[AUTH-WORKOS.md](./AUTH-WORKOS.md)**.

## Quick checklist

1. Create a WorkOS project and enable Google / Microsoft / GitHub OAuth.
2. Add redirect URIs: `http://localhost:5173/auth/callback` and `https://<prod>/auth/callback`.
3. Set SvelteKit env: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID` (see [`.env.example`](../.env.example)).
4. Set Convex env: `WORKOS_CLIENT_ID`, `ADMIN_EMAILS` (comma-separated).
5. Set `PUBLIC_CONVEX_URL` so OAuth users sync into the Convex `users` table.
6. Confirm Convex auth config (`src/convex/auth.config.ts`) matches your WorkOS client.
7. Sign in at `/auth/signin` and verify `role: "admin"` for allowlisted emails in the Convex dashboard.

## Server-side identity

- Prefer WorkOS / Convex identity from the session — do not trust a client-supplied `userId` for authorization.
- Full mock access is enforced in Convex (`listByTrackCode`, `gradeAnswers` with `mode=full`), not only in the UI.
- Sample practice remains available without sign-in (limited question count).

## Still outstanding

| Item | Notes |
|------|--------|
| Membership / billing | Phase D — link subscriptions to authenticated user when added |

## Related

- [AUTH-WORKOS.md](./AUTH-WORKOS.md) — detailed WorkOS guide
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md)
- [architecture.md](./architecture.md)
- [Convex auth docs](https://docs.convex.dev/auth)
- Membership UI shell: `/membership`
