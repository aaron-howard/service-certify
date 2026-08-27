# How to unlock a full mock as admin

Run a full-length timed mock (`mode=full`) locally. Full mocks are gated by Convex `users.role === "admin"`, not by `/membership`. There is no `/admin` route.

## Prerequisites

- [Convex running and questions seeded](./howto-run-convex-locally.md)
- WorkOS OAuth working locally ([AUTH-WORKOS.md](./AUTH-WORKOS.md))
- Your sign-in email in Convex `ADMIN_EMAILS`
- Convex env `WORKOS_CLIENT_ID` matching the SvelteKit client ID
- WorkOS JWT template includes `"aud": "<CLIENT_ID>"` (otherwise Convex throws `NoAuthProvider`)

## Steps

1. Set Convex env (dashboard or CLI against the same deployment as `PUBLIC_CONVEX_URL`):

   ```bash
   npx convex env set ADMIN_EMAILS you@example.com
   npx convex env set WORKOS_CLIENT_ID client_...
   ```

   `ADMIN_EMAILS` is a comma- or semicolon-separated list. Values are trimmed, lowercased, and unquoted in [`src/convex/lib/adminEmails.ts`](../src/convex/lib/adminEmails.ts).

2. Sign in at `/auth/signin` with Google or Microsoft using that email.

   After callback, SvelteKit syncs Convex via `createOrUpdateUser`. That mutation **re-evaluates** admin on every sync: allowlisted emails get `role: "admin"`; anyone else is `role: "user"` (including a former admin dropped from the list).

3. Open an exam detail page, for example `/exams/csa`. You should see **Start Full Mock** (`data-testid="start-full-mock"`). Non-admins only see **Try Sample Practice**.

4. Click **Start Full Mock**. The server load (`src/routes/exams/[slug]/practice/+page.server.ts`):

   - Redirects to `/auth/signin` if you are not `user.isAdmin`
   - Mint a `sessionSeed` with `randomUUID()` (well over the 8-character minimum)
   - Loads the full-mock subset server-side with your WorkOS cookie

   The session uses official exam length (`getOfficialQuestionCount`) and official duration (`getOfficialExamDurationMinutes`), not the entire bank. Extra bank rows (+30) rotate between attempts via a seeded shuffle.

## Verification

- Full mock URL: `/exams/csa/practice?mode=full`
- Question count should equal the official count for that track (CSA is 60), not 3
- Submit goes to `POST /api/practice/grade` with `mode: "full"` and `sessionSeed`
- A signed-in full-mock grade writes `userProgress` and shows on `/dashboard`

If you open `?mode=full` while signed out, you are redirected to sign-in with `redirect` back to the full-mock URL.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| No **Start Full Mock** button | Session `user.isAdmin` is false. Confirm `ADMIN_EMAILS`, sign out/in so `createOrUpdateUser` re-runs. |
| Redirect loop to sign-in | Cookie missing or Convex user row has `role: "user"`. |
| `Admin access required` from Convex | Browser JWT from `/api/auth/convex-token` is missing, or identity is not the admin `workosId`. |
| `Full mock requires a sessionSeed (min 8 characters)` | Client omitted `sessionSeed`. Full list and grade both require it. |
| Grade 401 “session expired” | Full-mode grade attaches the WorkOS token. Sign in again. |

Membership at `/membership` is a Phase D placeholder. It does not unlock mocks.

Related: [access model](./explanation-access-model.md), [AUTH-WORKOS.md](./AUTH-WORKOS.md), [Convex API](./reference-convex-api.md).
