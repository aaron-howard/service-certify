# Health Checks & Monitoring

Service Certify includes health check endpoints and performance monitoring integration for production observability.

## Health Endpoint

**Endpoint:** `GET /api/health`

Monitor application uptime and critical dependencies (Convex + Upstash rate limiter).

### Response Format

```json
{
  "status": "ok",
  "timestamp": "2026-06-25T15:30:45.123Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "convex": {
      "status": "ok"
    },
    "rateLimiter": {
      "status": "ok"
    }
  }
}
```

### Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| **200** | `"ok"` | All systems operational |
| **503** | `"degraded"` | One or more checks failed (Convex and/or rate limiter) |

### Cloudflare caveat (important)

`https://www.service-certify.com/api/health` is behind **Cloudflare Bot Fight Mode**. Unattended probes (curl, GitHub Actions, many uptime agents) receive a **403 challenge HTML** page instead of JSON.

For automated monitoring, use the Vercel hostname (not challenged):

```text
https://service-certify.vercel.app/api/health
```

Prefer allowing `/api/health` through Cloudflare (WAF/Bot Fight skip for that path, or authenticated origin pulls) if you want the custom domain as the probe target.

### Using for Uptime Monitoring

**Primary: Better Stack (Uptime)**

1. Create a monitor for `https://service-certify.vercel.app/api/health`
2. Expect **HTTP 200** and latency **&lt; 2s**
3. Assert JSON when supported:
   - `status == "ok"`
   - `checks.convex.status == "ok"`
   - `checks.rateLimiter.status == "ok"`
4. Notify **email** on failure (Slack optional later)

**Vercel Analytics (built-in):**
- Visit Vercel dashboard → Analytics for traffic / availability signals

**Example curl (Vercel hostname):**
```bash
curl -i https://service-certify.vercel.app/api/health
# Should return 200 with JSON payload
```

### Check Details

**Convex connectivity:** Attempts to reach `$PUBLIC_CONVEX_URL/version` with a 2-second timeout
- If `PUBLIC_CONVEX_URL` not configured → status `"error"`
- If unreachable → status `"error"` with error message
- Otherwise → status `"ok"`

**Rate limiter:** Runs a lightweight Upstash check via `rateLimit()`
- Production fail-closed misconfig → `checks.rateLimiter.status: "error"` and overall `degraded`
- Preview/local fail-open still reports `limiter_unavailable` as an error on the check so monitoring sees broken credentials

## GitHub Actions synthetic

Workflow: [`.github/workflows/health-synthetic.yml`](../.github/workflows/health-synthetic.yml)

| | |
|--|--|
| **Schedule** | Hourly (+ on push to the workflow/health route, + manual dispatch) |
| **Target** | `https://service-certify.vercel.app/api/health` |
| **Pass** | HTTP 200 and JSON `status` / `checks.convex` / `checks.rateLimiter` all `"ok"` |
| **Does not cover** | OAuth login, grading, WorkOS (no secrets in CI) |

Better Stack watches continuously with paging; the GitHub synthetic is a second signal that fails CI/cron visibly when dependencies break.

## Vercel Speed Insights

Real-time performance monitoring (Core Web Vitals) for your application.

### Already Integrated

Speed Insights is already wired into the app (`src/routes/+layout.svelte`):
```typescript
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
injectSpeedInsights();
```

This automatically tracks:
- **LCP** (Largest Contentful Paint) — when page content loads
- **FCP** (First Contentful Paint) — when first pixel appears
- **INP** (Interaction to Next Paint) — responsiveness to clicks
- **CLS** (Cumulative Layout Shift) — visual stability

### Activate in Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → Your Project
2. Click **Analytics** tab
3. Scroll to **Speed Insights**
4. Click **Enable Speed Insights**
5. Wait ~5 minutes for data to appear after real browser traffic

### Viewing Metrics

Once enabled:
- **Real-time overview:** See traffic, LCP, CLS trends
- **Device breakdown:** Desktop vs mobile performance
- **Top pages:** Which pages are slow?
- **Web Vitals chart:** Time-series performance

### Performance Targets

Aim for these thresholds (Google Core Web Vitals):

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | TBD (confirm in Vercel after enable) |
| INP | < 200ms | TBD |
| CLS | < 0.1 | TBD |

If metrics degrade:
1. Check which page(s) are slow
2. Review lighthouse report (DevTools → Lighthouse)
3. Check if Convex queries are slow (see Sentry performance traces)
4. Profile bundle size: `npm run build`, check `.svelte-kit/output/`

## Production Monitoring Stack

| Layer | Tool | Status |
|-------|------|--------|
| **Errors** | Sentry | ✅ Wired (DSN + release SHA + 404/405 noise filter) |
| **Alerts** | Sentry alert rules | ⬜ Run `npm run setup:sentry-alerts` with `SENTRY_AUTH_TOKEN` (alerts:write) — see [SENTRY-SETUP.md](./SENTRY-SETUP.md) |
| **Performance** | Vercel Speed Insights | ✅ Wired + enabled in Vercel Analytics (confirmed 2026-08-02) |
| **Availability** | Better Stack → `/api/health` | ⬜ Create monitor (use Vercel hostname; see Cloudflare caveat) |
| **Synthetic** | GitHub Actions `Health synthetic` | ✅ Hourly JSON probe |
| **Abuse** | Upstash rate limits | ✅ Health + grade routes |
| **Security** | Branch protection + `npm audit` CI | ✅ CI workflows present |
| **Metrics/logs platform** | Grafana / Loki / OTEL | ❌ Not used (out of scope) |

## Setting Up Alerts

### Sentry Alerts (required for soft launch)

```bash
SENTRY_AUTH_TOKEN=sntrys_... \
SENTRY_ALERT_EMAIL=aaron.howard@dallas.gov \
npm run setup:sentry-alerts
```

Creates **New issue in production** and **Error spike in production** (>20 / 10m) → email.
Details: [SENTRY-SETUP.md](./SENTRY-SETUP.md). Optionally ignore SERVICE-CERTIFY-6 scanner noise in the Sentry UI.

### Better Stack (uptime)

See “Using for Uptime Monitoring” above.

### Vercel Alerts (performance degrades)

1. Vercel dashboard → Settings → Integrations
2. Add Slack, email, or PagerDuty
3. Configure alert: `LCP > 3.5s` or `CLS > 0.2`

## Troubleshooting

**Health endpoint returns 503 (degraded)?**
1. Read `checks.convex` / `checks.rateLimiter` messages in the JSON body
2. Convex: [status.convex.dev](https://status.convex.dev) + `PUBLIC_CONVEX_URL`
3. Rate limiter: Upstash credentials / [RATE-LIMITING.md](./RATE-LIMITING.md)
4. See [[RUNBOOK-RESTART-CONVEX]] for Convex recovery

**Probe gets Cloudflare HTML / 403?**
1. Switch the monitor URL to `https://service-certify.vercel.app/api/health`
2. Or configure Cloudflare to skip bot challenges for `/api/health`

**Speed Insights shows no data?**
1. Ensure it's enabled in Vercel dashboard
2. Generate traffic (visit site in a real browser)
3. Wait 5-10 minutes for data to aggregate
4. Check if traffic is coming from real users (not bots)

**Sentry shows too many errors?**
1. Confirm 405 bot POSTs are ignored (app filter + optional Sentry ignore on SERVICE-CERTIFY-6)
2. Filter browser extension errors (auto-filtered)
3. Fix the most common real errors (e.g. auth sync / grade)

## Related

- [SENTRY-SETUP.md](./SENTRY-SETUP.md) — Error tracking, releases, alert rules
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) — Observability + launch checklist
- [RATE-LIMITING.md](./RATE-LIMITING.md)
- [AUTH-WORKOS.md](./AUTH-WORKOS.md) — WorkOS JWT `aud` requirement for Convex
