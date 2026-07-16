# Health Checks & Monitoring

Service Certify includes health check endpoints and performance monitoring integration for production observability.

## Health Endpoint

**Endpoint:** `GET /api/health`

Monitor application uptime and critical dependencies.

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
    }
  }
}
```

### Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| **200** | `"ok"` | All systems operational |
| **503** | `"degraded"` | One or more checks failed (e.g., Convex unreachable) |

### Using for Uptime Monitoring

**Vercel Analytics (built-in):**
- Vercel automatically monitors 200 responses
- Visit Vercel dashboard → Analytics for uptime metrics

**External uptime monitoring (e.g., UptimeRobot, Ping.com):**
1. Sign up for free tier
2. Configure monitor: `https://service-certify.com/api/health`
3. Alert if response is not 200 or takes >2s

**Example curl:**
```bash
curl -i https://service-certify.com/api/health
# Should return 200 with JSON payload
```

### Check Details

**Convex connectivity:** Attempts to reach `https://your-deployment.convex.cloud/version` with 2-second timeout
- If `PUBLIC_CONVEX_URL` not configured → status `"error"`
- If unreachable → status `"error"` with error message
- Otherwise → status `"ok"`

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
5. Wait ~5 minutes for data to appear

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
| LCP | < 2.5s | TBD |
| INP | < 200ms | TBD |
| CLS | < 0.1 | TBD |

If metrics degrade:
1. Check which page(s) are slow
2. Review lighthouse report (DevTools → Lighthouse)
3. Check if Convex queries are slow (see Sentry performance traces)
4. Profile bundle size: `npm run build`, check `.svelte-kit/output/`

## Production Monitoring Stack

Your app now has:

| Layer | Tool | Status |
|-------|------|--------|
| **Errors** | Sentry | ✅ `handleError` + user context wired — configure DSN in Vercel |
| **Performance** | Vercel Speed Insights | ✅ Wired — activate in dashboard |
| **Availability** | `/api/health` endpoint | ✅ Live — add external uptime monitor |
| **Security** | Branch protection + `npm audit` CI | ✅ CI workflows present — enable branch protection in GitHub UI |

## Setting Up Alerts

### Sentry Alerts (errors spike)

1. Go to [sentry.io](https://sentry.io) → Your Project → Alerts
2. Click **Create Alert Rule**
3. Condition: `Error count > 100 per day`
4. Action: Notify team via Slack/email

### Vercel Alerts (performance degrades)

1. Vercel dashboard → Settings → Integrations
2. Add Slack, email, or PagerDuty
3. Configure alert: `LCP > 3.5s` or `CLS > 0.2`

## Troubleshooting

**Health endpoint returns 503 (Convex degraded)?**
1. Check Convex status: [status.convex.dev](https://status.convex.dev)
2. Verify `PUBLIC_CONVEX_URL` in Vercel env vars
3. See [[RUNBOOK-RESTART-CONVEX]] for recovery steps

**Speed Insights shows no data?**
1. Ensure it's enabled in Vercel dashboard
2. Generate traffic (visit site in browser)
3. Wait 5-10 minutes for data to aggregate
4. Check if traffic is coming from real users (not bots)

**Sentry shows too many errors?**
1. Review error types in dashboard
2. Filter browser extension errors (auto-filtered)
3. Fix the most common errors
4. Increase sampling rate once traffic is stable

## Related

- [SENTRY-SETUP.md](./SENTRY-SETUP.md) — Error tracking configuration
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) — Observability + launch checklist
- [RATE-LIMITING.md](./RATE-LIMITING.md)
