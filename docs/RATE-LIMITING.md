# Rate Limiting & API Protection

Service Certify uses **Upstash Redis** for rate limiting to protect public APIs from abuse and DoS attacks.

## Quick Setup (10 minutes)

### 1. Create Upstash Account (Free)

1. Go to [upstash.com](https://upstash.com)
2. Sign up (no credit card needed for free tier)
3. Click **Create Database** → Select **Redis**
4. Choose **Free** tier (1GB storage, 10K commands/day)
5. Name: `service-certify-ratelimit`
6. Region: pick closest to your users
7. Click **Create**

### 2. Get REST API Credentials

1. Go to your database → **REST API** tab
2. Copy these two values:
   - `UPSTASH_REDIS_REST_URL` (starts with `https://`)
   - `UPSTASH_REDIS_REST_TOKEN` (long string)

### 3. Configure Locally

**File:** `.env.local`
```env
UPSTASH_REDIS_REST_URL=https://example.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 4. Configure in Vercel

1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Add both variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Click **Save**
4. Redeploy: Deployments → Latest → **Redeploy**

> **Paste the raw value, not the `.env.local` line.** If the stored value keeps its
> surrounding quotes (`"gQAA…"`) or leading whitespace, Upstash rejects every command with
> `WRONGPASS invalid or missing auth token`. `initRateLimit()` now strips a matching quote
> pair and trims whitespace, but the URL and token must still belong to the same database.

### 5. Verify

Prove live Upstash connectivity and sliding-window denial (not the fail-open unit tests):

```bash
# Phase A: hits your real Upstash DB (requires UPSTASH_* in .env.local)
# Phase B: if npm run dev is up, also proves POST /api/practice/grade → 429 after 10 reqs
npm run verify:upstash

# Optional: point Phase B at another origin
VERIFY_BASE_URL=http://localhost:5173 npm run verify:upstash
```

Do **not** hammer `/api/health` (1000/min) just to verify limits — that burns free-tier command quota. The verify script uses a tiny ZSET probe plus the grade route’s 10/min IP limit.

## Current Rate Limits

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| **GET /api/health** | 1000 req | 60 sec | For monitoring services |
| **POST /api/practice/grade** | 10 submissions | 60 sec | Keyed by WorkOS user id when signed in, otherwise client IP |

## 429 vs 503: never conflate them

`rateLimit()` throws a `RateLimitError` carrying an `outcome`:

| `outcome` | Meaning | Route response |
|-----------|---------|----------------|
| `limit_exceeded` | The caller really did exceed the limit | **429** — ask the client to back off |
| `limiter_unavailable` | Upstash is unconfigured, misconfigured, or unreachable, so the real count is unknown | **503** — a dependency failure, reported to Sentry |

Denying with a 429 when Upstash is broken sends users a "you're going too fast" message for a
server-side outage, and it hides the incident from monitoring. Always branch on `outcome`:

```typescript
import { rateLimit, RateLimitError } from '$lib/rateLimit';

try {
  await rateLimit(key, { windowSeconds: 60, maxRequests: 10 });
} catch (error) {
  if (error instanceof RateLimitError && error.outcome === 'limiter_unavailable') {
    return new Response('…temporarily unavailable…', { status: 503 });
  }
  return new Response('…too many requests…', { status: 429 });
}
```

`GET /api/health` follows the same rule: it reports `checks.rateLimiter.status: "error"` and
an overall `degraded` status instead of returning a misleading 429.

## Using in Your Code

### Basic Rate Limit Check

```typescript
import { rateLimit } from '$lib/rateLimit';

// In a route handler:
export const POST: RequestHandler = async ({ request }) => {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    await rateLimit(clientIp, {
      windowSeconds: 60,      // 1 minute window
      maxRequests: 100,       // 100 requests max
      keyPrefix: 'my-route:'  // Custom key prefix
    });
  } catch (error) {
    // Rate limit exceeded, return 429
    return new Response('Too many requests', { status: 429 });
  }

  // Process request here
};
```

### Check Status Without Incrementing

```typescript
import { getRateLimitStatus } from '$lib/rateLimit';

const status = await getRateLimitStatus(clientIp, {
  windowSeconds: 60,
  maxRequests: 100
});

console.log(`${status.current}/${status.limit} requests`);
console.log(`Reset in ${status.resetIn} seconds`);
```

### Graceful Degradation

If Upstash is down or not configured:

| Environment | Behavior |
|-------------|----------|
| **Local / Preview / CI** (`VERCEL_ENV` ≠ `production`) | Fail **open** — requests allowed; warning logged |
| **Production** (`VERCEL_ENV=production`) | Fail **closed** — requests denied with 429 until Upstash is configured |

**Production requires** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` on Vercel.

## Customizing Limits

Edit limits per endpoint in route files:

```typescript
// Strict: 5 mutations per minute (for sensitive operations)
await rateLimit(clientIp, {
  windowSeconds: 60,
  maxRequests: 5
});

// Loose: 10,000 requests per hour (for public data)
await rateLimit(clientIp, {
  windowSeconds: 3600,
  maxRequests: 10000
});
```

## Rate Limit Response Headers

When rate limited, responses include:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1719329445
```

Clients should respect `Retry-After` and backoff accordingly.

## Monitoring Rate Limits

### In Sentry

Add custom tracking for rate limit hits:

```typescript
import { captureMessage } from '$lib/sentry';

if (!result.allowed) {
  captureMessage(`Rate limit exceeded for ${clientIp}`, 'warning');
  // Return 429...
}
```

### In Upstash Dashboard

1. Go to Upstash → Your Database
2. Click **Stats** to see:
   - Total commands executed
   - Requests per second
   - Database size

### Alert on Spam

If you see sustained 429 errors:
1. Check Upstash dashboard for spike in requests
2. May indicate bot attack or misconfigured client
3. Consider blocking IP or adjusting limits temporarily

## Troubleshooting

**Rate limiting not working?**
1. Check env vars are set: `echo $UPSTASH_REDIS_REST_URL`
2. Verify Upstash database is running (dashboard → Status)
3. Check Vercel logs: Deployments → Latest → Runtime logs
4. Hit `/api/health` and read `checks.rateLimiter` — `error` means Upstash is not answering

**`WRONGPASS invalid or missing auth token` in the logs?**

The credentials reached Upstash but were rejected. In order of likelihood:
1. The stored value has surrounding quotes or stray whitespace (see step 4 above)
2. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are from **different** databases
3. The token was rotated in the Upstash dashboard but not updated in Vercel

Confirm the pair works before redeploying:

```bash
curl -s -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" "$UPSTASH_REDIS_REST_URL/ping"
# expected: {"result":"PONG"}
```

Remember env var changes only take effect on the **next deployment** — update the value, then redeploy.

**Getting 429 too often?**
1. Increase `maxRequests` for the endpoint
2. Increase `windowSeconds` to spread requests over longer period
3. Implement exponential backoff on client side

**Upstash free tier limits?**
- 10K commands/day (about 140 requests/sec average)
- 1GB storage (plenty for rate limit counters)
- 30 concurrent connections
- If you hit limits, upgrade to Pro tier ($2/mo)

## Cost

| Tier | Cost | Commands/Day | Best For |
|------|------|--------------|----------|
| **Free** | $0 | 10K | MVP, testing |
| **Pro** | $2/mo | Unlimited | Production, high traffic |
| **Business** | Custom | Unlimited | Enterprise, SLA |

For Service Certify at launch:
- ~100 practice submissions/day = 100 commands
- **Cost: Free tier** ✅

## Advanced: Custom Rate Limit Keys

Instead of just IP address, you can rate limit by:

```typescript
// Rate limit per user ID when signed in (grade API uses workosUserId)
const rateLimitKey = locals.workosUserId ?? clientIp;
await rateLimit(rateLimitKey, {
	maxRequests: 10,
	keyPrefix: locals.workosUserId ? 'grade:user:' : 'grade:ip:'
});

// Rate limit per API key
const apiKey = request.headers.get('x-api-key');
await rateLimit(apiKey, { maxRequests: 1000 });

// Rate limit per endpoint + IP combo
const key = `${endpoint}:${clientIp}`;
await rateLimit(key, { maxRequests: 100 });
```

## Related

- [HEALTH-AND-MONITORING.md](./HEALTH-AND-MONITORING.md) — Health checks + monitoring
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) — Reliability / P0 Upstash requirement
- Convex guidelines: Input validation + mutation constraints
