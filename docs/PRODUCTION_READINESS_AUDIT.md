# Production Readiness Audit

**Date:** 2026-07-10  
**Scope:** Soft-launch MVP (practice exams + auth + ops). Membership/payments are tracked as Phase D, not launch blockers.  
**Status:** Soft-launch code P0 done (merged); P1 code (Sentry hooks/user context + auth E2E) on `fix/p1-observability-e2e`. Remaining soft-launch work is mostly manual ops.

This is the living checklist referenced by monitoring, testing, and rate-limiting docs. Update it when launch criteria change.

---

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Core practice UX | Ready | Catalog, detail, practice (single/multi/match), grade API |
| Question bank | Ready | 22 tracks, v2 rewrites complete, bank targets met |
| Auth (WorkOS) | Mostly ready | JWT required for user sync; profile page and progress writes still pending |
| Observability | Code ready | `handleError` + user context wired; set DSN / Speed Insights / uptime in dashboards |
| Rate limiting | Code ready | Fail-closed in production without Upstash; configure Redis for prod |
| Payments / membership | Not started | `/membership` placeholder; Phase D |
| Dashboard / progress | Shell only | Fake UI; `userProgress` table unused for writes |
| Docs | Updated | This audit + architecture/auth docs refreshed Jul 2026 |

---

## Done

### Product / content
- [x] 22 certification tracks in catalog
- [x] Practice sessions with single, multi-select, and match item types
- [x] Choice/match shuffle at display time
- [x] Official exam timing via `examQuestionPolicy`
- [x] Question bank v2 complete (seed: `devQuestionBank.ts`)
- [x] Quality gates: track quality + per-track realism tests

### Auth
- [x] WorkOS OAuth (Google, Microsoft, GitHub)
- [x] Session cookies + `/auth/signin`, `/auth/callback`, `/auth/signout`
- [x] Convex `users` table + `ADMIN_EMAILS` bootstrap
- [x] Full mock (`mode=full`) gated to admins in Convex
- [x] Convex client auth via `/api/auth/convex-token`
- [x] User sync requires WorkOS JWT (`createOrUpdateUser` / `getUserByEmail`)
- [x] Practice list omits explanations until grade
- [x] Production rate limiting fails closed without Upstash

### Infrastructure / ops scaffolding
- [x] Vercel deploy path (`@sveltejs/adapter-vercel`)
- [x] `GET /api/health` (Convex connectivity check)
- [x] Sentry client/server init (DSN optional)
- [x] SvelteKit `handleError` → Sentry (`hooks.client.ts` / `hooks.server.ts`)
- [x] Sentry user context from layout session (`setSentryUser` / `clearSentryUser`)
- [x] Auth E2E: sign-in UI, full-mock redirect gate, sample without auth
- [x] Vercel Speed Insights wired in layout
- [x] Upstash rate limiting on health + grade routes
- [x] Vitest unit tests + Playwright E2E/a11y
- [x] CI: check, test, build, e2e, npm-audit
- [x] Runbooks: Vercel rollback, Convex restart, backup restore

---

## Remaining for soft launch

### P0 — Security / correctness before public traffic

| Item | Detail | Status |
|------|--------|--------|
| Strip pre-submit answer leakage | `listByTrackCode` must not return `explanation` before grade | Fixed on `fix/p0-security-hardening` |
| Harden public Convex auth APIs | `createOrUpdateUser` / `getUserByEmail` require WorkOS JWT; sync uses `setAuth` | Fixed on `fix/p0-security-hardening` |
| Require Upstash in production | Rate limits fail **closed** when Redis env is unset in production | Fixed on `fix/p0-security-hardening` |
| Prod WorkOS + Convex env | Redirect URIs, `WORKOS_*`, `ADMIN_EMAILS`, `WORKOS_CLIENT_ID` in Convex, `PUBLIC_CONVEX_URL` on Vercel | Ops (manual) |
| Seed production question bank | `npm run seed:prod` (or equivalent) against prod Convex | Ops (manual) |

### P1 — Observability & release hygiene

| Item | Detail | Status |
|------|--------|--------|
| Wire Sentry `handleError` + user context | Client/server hooks + layout session sync | Fixed on `fix/p1-observability-e2e` |
| Auth E2E coverage | Sign-in UI, anonymous full-mock redirect, sample without auth | Fixed on `fix/p1-observability-e2e` |
| Configure Sentry DSN | Set `VITE_SENTRY_DSN` + `SENTRY_DSN` in Vercel | Ops (manual) |
| Enable Speed Insights | Vercel dashboard → Analytics | Ops (manual) |
| External uptime monitor | Point at `/api/health` (UptimeRobot or similar) | Ops (manual) |
| GitHub branch protection | Require PR + `check-and-build` + `npm-audit` on `main` — see [BRANCH-PROTECTION-SETUP.md](./BRANCH-PROTECTION-SETUP.md) | Ops (manual) |

### P2 — Product completeness (soft launch can ship without these)

| Item | Detail |
|------|--------|
| User profile / settings page | Documented as future in [AUTH-WORKOS.md](./AUTH-WORKOS.md) |
| Persist practice progress | `userProgress` schema exists; no write path; dashboard is static mock |
| Account deletion UI | `deleteAccount` mutation exists; no user-facing flow |
| Wire `PUBLIC_APP_URL` | Documented for canonical/metadata; unused in `src/` today |
| Per-user rate limit keys | Currently IP-based |

---

## Phase D — Commercial (explicitly out of soft-launch scope)

- [ ] Stripe (or equivalent) checkout
- [ ] Subscription schema + membership gating (replace or complement admin-only full mock)
- [ ] Real `/membership` plans (today: “Checkout (coming soon)”)
- [ ] Billing-linked user identity
- [ ] Payment integration tests
- [ ] Transactional email (receipts, support)

---

## Manual ops checklist (production)

Copy into a launch ticket:

1. [ ] Convex **prod** deployment linked; `PUBLIC_CONVEX_URL` set on Vercel (Production)
2. [ ] `npx convex deploy --prod` (or CI equivalent) succeeded
3. [ ] Prod seed: tracks + questions (`seed:prod` or documented prod seed path)
4. [ ] WorkOS redirect URI includes production origin `/auth/callback`
5. [ ] Vercel env: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`
6. [ ] Convex env: `WORKOS_CLIENT_ID`, `ADMIN_EMAILS`
7. [ ] Upstash: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` on Vercel
8. [ ] Sentry: `VITE_SENTRY_DSN`, `SENTRY_DSN` on Vercel
9. [ ] Speed Insights enabled in Vercel
10. [ ] Uptime monitor on `https://<prod>/api/health`
11. [ ] Branch protection on `main` configured
12. [ ] Smoke test: catalog → sample practice → grade; admin full mock; sign-in/out
13. [ ] Rollback runbook validated on a preview deployment

---

## Known gaps / caveats

- **Static fallback:** Without `PUBLIC_CONVEX_URL`, catalog can still render from `src/lib/data/`; practice questions will not load.
- **Seed difficulty tag:** Questions are seeded with `difficulty: 'dev'` — naming is historical; bank is the production content source today.
- **Health check is shallow:** Only pings Convex `/version`; does not verify WorkOS or Redis.
- **No startup env validation:** Missing prod vars degrade (auth error UI, rate limit 429 in prod without Upstash, empty practice).
- **Architecture docs historically lagged** auth implementation — corrected in [architecture.md](./architecture.md) (Jul 2026).
- **Full OAuth E2E** is not automated in CI (requires WorkOS credentials); gate + sign-in UI are covered.

---

## Related

- [architecture.md](./architecture.md)
- [AUTH-WORKOS.md](./AUTH-WORKOS.md)
- [HEALTH-AND-MONITORING.md](./HEALTH-AND-MONITORING.md)
- [SENTRY-SETUP.md](./SENTRY-SETUP.md)
- [RATE-LIMITING.md](./RATE-LIMITING.md)
- [TESTING.md](./TESTING.md)
- [E2E-AND-A11Y.md](./E2E-AND-A11Y.md)
- [BRANCH-PROTECTION-SETUP.md](./BRANCH-PROTECTION-SETUP.md)
- [runbooks/README.md](./runbooks/README.md)
