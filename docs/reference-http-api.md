# HTTP API

SvelteKit server routes under `src/routes/api`. These wrap Convex, WorkOS cookies, and Upstash. They are not Convex HTTP actions.

Base URL locally is `http://localhost:5173`. Production is the Vercel host.

## `GET /api/health`

Health probe for uptime monitors. Implementation: [`src/routes/api/health/+server.ts`](../src/routes/api/health/+server.ts).

**Rate limit:** 1000 requests / 60 seconds per `X-Forwarded-For` (first hop), prefix `health:`.

**Does not check:** WorkOS, Redis beyond the limiter outcome, or question seed contents. Convex check is `GET {PUBLIC_CONVEX_URL}/version` with a 2s timeout.

### Response body

```json
{
  "status": "ok",
  "timestamp": "2026-08-25T19:00:00.000Z",
  "uptime": 12,
  "environment": "development",
  "version": "0.1.0",
  "revision": "abcdef0",
  "versionId": "0.1.0+abcdef0",
  "checks": {
    "convex": { "status": "ok" },
    "rateLimiter": { "status": "ok" }
  }
}
```

| Field | Source |
| --- | --- |
| `status` | `ok` \| `degraded` \| `error` |
| `version` | `package.json` via `getAppVersion()` |
| `revision` | git SHA when Vercel/CI provide it |
| `versionId` | `0.1.0` or `0.1.0+<sha>` |
| `checks.convex` | error if `PUBLIC_CONVEX_URL` missing or `/version` fails |
| `checks.rateLimiter` | error if Upstash is unreachable (request may still be allowed in non-prod) |

**HTTP status:** 200 when `status === "ok"`, otherwise 503. Exceeding the health rate limit returns 429 `{ "error": "Too many requests" }` with `Retry-After: 60`.

### Example

```bash
curl -sS -i http://localhost:5173/api/health
```

Ops detail: [HEALTH-AND-MONITORING.md](./HEALTH-AND-MONITORING.md).

## `POST /api/practice/grade`

Server-side grading. Implementation: [`src/routes/api/practice/grade/+server.ts`](../src/routes/api/practice/grade/+server.ts). Calls `practiceQuestions.gradeAnswers`.

**Rate limit:** 10 requests / 60 seconds. Key is `locals.workosUserId` when signed in (`grade:user:`), otherwise client IP (`grade:ip:`).

**Production:** missing Upstash **fail-closed** (429 / limiter unavailable). Local and preview fail open.

### Request JSON

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `trackCode` | string | yes | Passed through to Convex (3–10 chars) |
| `answers` | array | yes | See [Convex `gradeAnswers`](./reference-convex-api.md) |
| `mode` | `'sample' \| 'full'` | no | Default `sample`. Any other value becomes `sample`. |
| `sessionSeed` | string | if `mode=full` | HTTP 400 if missing for full |

### Auth

| Mode | Convex `setAuth` | Cookie |
| --- | --- | --- |
| `sample` | not set | ignored for Convex |
| `full` | WorkOS access token from `locals` or session cookie | 401 if missing |

### Success (200)

Same payload as `gradeAnswers`: `{ correct, total, results }`. `Cache-Control: no-cache, no-store, must-revalidate`.

### Errors

| Status | Body | When |
| --- | --- | --- |
| 400 | `Invalid JSON body` | parse fail |
| 400 | `Missing trackCode or answers array` | shape |
| 400 | `Missing sessionSeed for full mock` | full without seed |
| 401 | session expired message | full, no WorkOS session |
| 429 | `Too many practice submissions...` + `retryAfter` | limit exceeded |
| 503 | grader unavailable copy | Upstash `limiter_unavailable` in fail-closed / error path |
| 503 | `Convex not configured` | no `PUBLIC_CONVEX_URL` |
| 500 | Convex error message | mutation throw |

### Example (sample)

```bash
curl -sS -X POST http://localhost:5173/api/practice/grade \
  -H 'Content-Type: application/json' \
  -d '{"trackCode":"CSA","mode":"sample","answers":[{"order":0,"selectedIndex":0}]}'
```

Expect 200 with results if CSA is seeded, or 500 from Convex if order `0` does not exist in the sample slice.

## `GET /api/auth/convex-token`

Returns the WorkOS access token from the httpOnly session cookie so the browser Convex client can `setAuth`. Implementation: [`src/routes/api/auth/convex-token/+server.ts`](../src/routes/api/auth/convex-token/+server.ts).

**Auth:** session cookie. No Convex call.

| Status | Body |
| --- | --- |
| 200 | `{ "token": "<access_token>" }` |
| 401 | `{ "error": "Not authenticated" }` |

`Cache-Control: no-store`.

The root layout fetches this when `PUBLIC_CONVEX_URL` is set. Do not expose WorkOS keys as `PUBLIC_*`.

## `POST /api/account/delete`

Deletes the Convex user and progress, then clears WorkOS cookies. Implementation: [`src/routes/api/account/delete/+server.ts`](../src/routes/api/account/delete/+server.ts).

**Auth:** `workos_token` cookie, not expired, **and** recent authentication within 300 seconds (`DELETE_ACCOUNT_STEP_UP_MAX_AGE_SECONDS`). Settings UI sends users through `/auth/step-up` first.

| Status | Body |
| --- | --- |
| 200 | `{ "ok": true }` |
| 401 | `{ "error": "Not authenticated" }` |
| 403 | `{ "error": "step_up_required", "message": "...", "stepUpUrl": "/auth/step-up?..." }` |
| 503 | `{ "error": "Convex is not configured" }` |
| 500 | Convex delete error |

## Related

- [Convex API](./reference-convex-api.md)
- [RATE-LIMITING.md](./RATE-LIMITING.md)
- [AUTH-WORKOS.md](./AUTH-WORKOS.md)
