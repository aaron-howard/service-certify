# Convex functions and schema

Public Convex API for Service Certify plus the four tables in [`src/convex/schema.ts`](../src/convex/schema.ts). Functions live under `src/convex/` (`convex.json` `"functions": "src/convex/"`). The app imports generated types as `import { api } from '$convex/_generated/api'`.

Use this when you need signatures, validators, and auth rules. For why sample and full differ, see [How practice access works](./explanation-access-model.md). HTTP wrappers: [HTTP API](./reference-http-api.md).

## Schema

### `users`

| Field | Validator | Notes |
| --- | --- | --- |
| `workosId` | `v.string()` | Unique WorkOS subject. Session identity is this field, never email. |
| `email` | `v.string()` | From WorkOS. Indexed but **not** unique. |
| `name` | optional string | OAuth profile |
| `profileImage` | optional string | OAuth profile |
| `provider` | optional string | `google` or `microsoft` |
| `role` | optional `'user' \| 'admin'` | Default treated as `user`. Admin unlocks full mock. |
| `createdAt` | `v.number()` | Insert time (mutation only) |

Indexes: `by_workosId`, `by_email`.

### `certificationTracks`

| Field | Validator | Notes |
| --- | --- | --- |
| `code` | `v.string()` | Exam code, 3–10 chars in practice APIs |
| `officialName` | `v.string()` | Official certification name |
| `sortOrder` | `v.number()` | Display order from seed index |

Index: `by_code`. Seeded by `internal.seed.apply` from [`tracksCanonical.ts`](../src/lib/catalog/tracksCanonical.ts). The catalog UI does **not** require this table; `/exams` reads static data.

### `practiceQuestions`

| Field | Validator | Notes |
| --- | --- | --- |
| `trackCode` | `v.string()` | Matches catalog `Exam.code` |
| `order` | `v.number()` | Unique per track in the bank (0–10000 in grade validation) |
| `prompt` | `v.string()` | Stem |
| `choices` | `v.array(v.string())` | 2–6 for single/multi; empty for match |
| `correctIndex` | `v.number()` | Single: the answer. Multi: first correct (compat). Match: `0` sentinel. |
| `questionType` | optional `'single' \| 'multi' \| 'match'` | Absent means `single` |
| `correctIndexes` | optional `number[]` | Multi-select full key |
| `matchLeftItems` / `matchRightItems` | optional `string[]` | Match columns |
| `correctMatches` | optional `{ left, right }[]` | Match key |
| `explanation` | `v.string()` | Returned only from `gradeAnswers` |
| `sourceUrls` | `v.array(v.string())` | Public doc URLs |
| `domain` | optional string | Must match `trackDocSources` domain `name` |
| `difficulty` | optional `'dev'` | Seeded bank rows are `dev` |

Indexes: `by_trackCode`, `by_trackCode_and_domain`.

### `userProgress`

| Field | Validator | Notes |
| --- | --- | --- |
| `userId` | `v.id("users")` | Owner |
| `trackCode` | `v.string()` | Exam code |
| `sessionsCompleted` | `v.number()` | Incremented per graded session |
| `bestScore` | `v.number()` | 0–100 integer |
| `averageScore` | `v.number()` | Running average, rounded |
| `lastAttemptedAt` | `v.number()` | Mutation timestamp |

Indexes: `by_userId`, `by_userId_and_trackCode`.

## Public queries

### `tracks.list`

- **Args:** `{}`
- **Auth:** none
- **Returns:** all `certificationTracks` sorted by `sortOrder`
- **Used by:** `/exams` in `vite dev` only (live count banner)

### `practiceQuestions.listByTrackCode`

- **Args:** `{ trackCode: string, mode?: 'sample' | 'full', sessionSeed?: string }`
- **Defaults:** `mode = 'sample'`
- **Constraints:** `trackCode` length 3–10. `mode=full` requires admin JWT **and** `sessionSeed` with length ≥ 8.
- **Returns:** `{ order, prompt, choices, questionType, matchLeftItems?, matchRightItems? }[]`
- **Omits:** `correctIndex`, `correctIndexes`, `correctMatches`, `explanation`, `sourceUrls`
- **Limits:** sample is the first 3 rows by `order` (`SAMPLE_QUESTION_LIMIT`). Full is a seeded shuffle of the bank down to `getOfficialQuestionCount(trackCode)`, then re-sorted by `order`.

### `auth.getCurrentUser`

- **Args:** `{}`
- **Auth:** JWT; returns `null` if missing or no `users` row for `workosId`
- **Returns:** user doc plus `role` and `isAdmin`

Lookup is `workosUserIdFromIdentity` → `users.by_workosId`. Email is not used.

### `auth.getUserByEmail`

- **Args:** `{ email: string }`
- **Auth:** JWT required. `identity.email` must match `email` (case-insensitive). Throws `Cannot look up another user` otherwise.
- **Returns:** matching row plus `role` / `isAdmin`, or `null`

### `userProgress.listForCurrentUser`

- **Args:** `{}`
- **Auth:** none required; unsigned callers get `[]`
- **Returns:** `{ trackCode, sessionsCompleted, bestScore, averageScore, lastAttemptedAt }[]` newest activity first
- **Used by:** `/dashboard` via `$lib/convex.server.ts`

### `admin/exportQuestions.exportAllQuestions`

- **Args:** `{}`
- **Auth:** `requireAdmin`
- **Returns:** quality stats plus truncated prompt previews (first 100 chars). Does not dump full stems or answer keys.

## Public mutations

### `practiceQuestions.gradeAnswers`

- **Args:**

```ts
{
  trackCode: string,           // 3–10 chars
  mode?: 'sample' | 'full',    // default 'sample'
  sessionSeed?: string,        // required for full, min 8 chars
  answers: Array<{
    order: number,             // 0–10000
    selectedIndex: number,     // 0–5
    selectedIndexes?: number[], // multi, 1–6 values each 0–5
    matchAnswers?: { left: number, right: number }[] // 1–12 pairs, indexes 0–11
  }>                           // length 1–1000
}
```

- **Auth:** `mode=full` requires admin. Sample does not require a JWT.
- **Scoring:** multi = exact index set. match = exact pair set. single = `selectedIndex === correctIndex`.
- **Progress:** if `getAuthenticatedUser` succeeds, upserts `userProgress` for that `trackCode`.
- **Returns:** `{ correct, total, results[] }` where each result includes keys, `isCorrect`, and `explanation`.

The SvelteKit grade route attaches the WorkOS JWT only for `mode=full`. Sample POSTs to `/api/practice/grade` therefore grade without Convex auth, so they do not write progress even if a session cookie exists.

### `auth.createOrUpdateUser`

- **Args:** `{ workosId, email, name?, profileImage?, provider? }`
- **Auth:** JWT required. `identity` subject must equal `workosId`. Email stored is `canonicalAuthEmail(identity, args.email)`.
- **Behavior:** insert or patch by `workosId`. Sets `role` from `ADMIN_EMAILS` on **every** sync.
- **Returns:** `{ userId, role, name, profileImage, provider }`

### `auth.deleteAccount`

- **Args:** `{}`
- **Auth:** JWT. `auth_time` must be within 300 seconds (`DELETE_ACCOUNT_MAX_AGE_SECONDS`).
- **Behavior:** deletes all `userProgress` for the user, then the `users` row.
- **HTTP:** `POST /api/account/delete` also requires the step-up window.

### `userProgress.recordSession`

- **Args:** `{ trackCode: string, scorePercent: number }`
- **Auth:** `requireUser`
- **Prefer:** `gradeAnswers` already records. This exists for authenticated clients if needed.

## Internal mutations (CLI only)

Do not expose these as public APIs.

| Function | Script | Effect |
| --- | --- | --- |
| `internal.seed.apply` | `npm run seed:dev` | Replace all `certificationTracks` |
| `internal.seed.devQuestions` | `npm run seed:dev:questions` | Replace `difficulty: "dev"` questions from the private bank; throws if the bank has fewer than 400 rows |

## Auth helpers

[`src/convex/lib/authorization.ts`](../src/convex/lib/authorization.ts): `getAuthenticatedUser`, `requireUser`, `requireAdmin`. Admin checks `users.role`, not a client-supplied flag.

## Examples

List a public sample (no JWT):

```ts
import { api } from '$convex/_generated/api';

const questions = await client.query(api.practiceQuestions.listByTrackCode, {
	trackCode: 'CSA',
	mode: 'sample'
});
```

Grade via the app (preferred): `POST /api/practice/grade` with the same `trackCode` / `mode` / `answers`. Direct `gradeAnswers` from the browser skips Upstash.

## Related

- [HTTP API](./reference-http-api.md)
- [Catalog](./reference-catalog.md)
- [Access model](./explanation-access-model.md)
- [AUTH-WORKOS.md](./AUTH-WORKOS.md)
