# How practice access works

Sample practice is public and capped at three questions. Full mocks are admin-only, seeded per attempt, and graded with the same subset the list returned. Paid membership is not part of that gate.

## The problem

If the client received answer keys, anyone could read them from the network tab. If “full exam” were a query-string flag, anyone could request 60 items. If identity were email, a JWT whose email matched an admin row could steal that role (`by_email` is not unique).

The product also ships a `/membership` page that looks like checkout. Wiring full mocks to that UI before payments exist would fake a paywall.

## The approach

```
mode=sample                         mode=full
────────────                        ─────────
No JWT required                     requireAdmin(workosId → users.role)
First 3 questions by order          sessionSeed ≥ 8 chars
Client listByTrackCode              SSR loadPracticeQuestions + cookie
Grade without Convex setAuth        Grade with WorkOS JWT on HTTP route
                                    Official N items, seeded shuffle
```

**Sample:** [`SAMPLE_QUESTION_LIMIT = 3`](../src/convex/lib/authorization.ts). `applyModeLimit` sorts by `order` and slices. Anonymous users can start `/exams/[slug]/practice`. Explanations appear only after `gradeAnswers`.

**Full:** [`practice/+page.server.ts`](../src/routes/exams/[slug]/practice/+page.server.ts) redirects non-admins to sign-in. Admins get `sessionSeed = randomUUID()`. List and grade both pass that seed so the random subset is stable for the attempt. Extra bank rows (official + 30) rotate between seeds.

**Identity:** Convex looks up `users.by_workosId` from the JWT subject. Email is for display and for `ADMIN_EMAILS` **bootstrap only**. After that, `requireAdmin` reads `users.role`. `createOrUpdateUser` rewrites role from the allowlist on every sync, so removing an email drops admin on next login.

**No `/admin` tree.** Admin is a field on the user. The detail page shows **Start Full Mock** when `data.user?.isAdmin` is true.

**Progress:** `gradeAnswers` upserts `userProgress` when Convex sees a JWT. The SvelteKit grade route calls `convex.setAuth` only for `mode=full`, so sample submits do not persist scores today. Dashboard reads `listForCurrentUser` on the server with the session token.

**Step-up:** account deletion requires a fresh `auth_time` (300 seconds) plus `/auth/step-up`. That is separate from practice access.

## Trade-offs

- **Admin instead of paid.** Soft launch can run full mocks for operators without Stripe. `/membership` still promises plans it cannot sell. Phase D must either wire billing or stop advertising unlock-via-membership.
- **Sample is the first three `order` values, not a random three.** Predictable for tests and for “try CSA.” Weak as a preview of domain mix. Changing that would need a sample seed and matching grade logic.
- **Sample grade skips Convex auth.** Simpler anonymous submit and no leaked JWT on a public POST. Cost: signed-in sample sessions do not hit `/dashboard`.
- **Full mock requires both cookie (SSR list) and JWT (grade).** A stale cookie fails at submit with 401 even if the intro rendered.

## Alternatives considered

- **Client-side scoring.** Rejected: keys would ship in `listByTrackCode`.
- **Membership table / Stripe.** Explicitly Phase D. Do not treat `/membership` as a gate in Convex.
- **Authorize by email.** Rejected after security review: `by_email` has no uniqueness; subject → `workosId` is the session key.
- **Serve the whole bank in full mode.** Rejected: official exams are N items; the +30 buffer exists so attempts differ, not so users sit a 90-question CSA.

## Related

- [How to unlock a full mock](./howto-unlock-full-mock.md)
- [Convex API](./reference-convex-api.md)
- [AUTH-WORKOS.md](./AUTH-WORKOS.md)
- [architecture.md](./architecture.md)
