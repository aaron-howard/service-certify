# Error Tracking with Sentry

Service Certify uses **Sentry** to automatically capture and report errors from both client and server.

## Quick Setup (5 minutes)

### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign up (free tier available)
2. Click **Create Project** → Select **Svelte** template
3. Copy your **DSN** (looks like: `https://key@sentry.io/12345`)

### 2. Add DSN to Environment

**For local development:**
```bash
cp .env.example .env.local
# Edit .env.local and add:
VITE_SENTRY_DSN=https://key@sentry.io/12345
SENTRY_DSN=https://key@sentry.io/12345
```

**For Vercel (production):**
1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Add two variables:
   - Name: `VITE_SENTRY_DSN` → Value: `https://key@sentry.io/12345`
   - Name: `SENTRY_DSN` → Value: `https://key@sentry.io/12345`
3. Redeploy: Deployments → Latest → Redeploy

### 3. Verify It Works

1. Start dev server: `npm run dev`
2. Open browser console and trigger an error:
   ```javascript
   throw new Error("Test error");
   ```
3. Go to [sentry.io](https://sentry.io) → Your Project → Issues
4. You should see the error appear within 10 seconds

## What Gets Tracked

### Automatically Captured
- ✅ Unhandled JavaScript errors
- ✅ Unhandled promise rejections
- ✅ Network errors (fetch failures)
- ✅ Convex query/mutation failures
- ✅ Page load performance (LCP, FCP, FID)
- ✅ 10% of normal sessions (performance replay)
- ✅ 100% of error sessions (full session replay for debugging)

### What's NOT Captured (Privacy)
- ❌ Sensitive form data (passwords, credit cards)
- ❌ PII (logged automatically masked)
- ❌ Browser extension errors (filtered)
- ❌ Analytics cookies (Vercel separately)

## Manual Error Tracking

In your code, you can manually capture errors or messages:

```typescript
import { captureException, captureMessage, setSentryUser } from '$lib/sentry';

// Capture an error
try {
  // ... code ...
} catch (error) {
  captureException(error);
}

// Capture a message
captureMessage('User started practice session', 'info');

// Set user context (after sign-in)
setSentryUser(userId, userEmail);
```

## Dashboard Tour

**Issues:** All errors grouped by type  
- Click an issue to see full stack trace
- View affected users and affected transactions
- Create alerts when errors spike

**Performance:** Transaction traces  
- Track slow page loads
- Identify N+1 queries or network bottlenecks

**Replays:** Video-like playback of user sessions  
- See exactly what user did before error
- Timeline correlates with console logs

**Alerts:** Notify team of critical issues  
- New issue alert
- Error spike alert (>100% increase)
- Custom threshold alerts

## Pricing

| Plan | Cost | Includes |
|------|------|----------|
| **Free** | $0 | 5K errors/month, 1 hour replays |
| **Team** | $29/mo | 10M errors/month, sessions, custom metrics |
| **Business** | Custom | Unlimited, dedicated support |

**Estimate for Service Certify at launch:**
- ~100 errors/month (assuming good quality)
- ~500 users × 1 session/month = 500 replays
- **Cost: Free tier** ✅

## Troubleshooting

**Errors not appearing?**
- Verify DSN is set: `echo $VITE_SENTRY_DSN`
- Check browser console for Sentry warnings
- Make sure Vercel is redeployed (env vars don't retroactively apply)

**Too many errors?**
- Errors are often from browser extensions or ad blockers
- Sentry filters common harmless errors automatically
- If real errors, check Convex logs for source

**Privacy concerns?**
- Sentry's free tier can self-host (enterprise)
- Data retention: 90 days by default
- Can configure data scrubbing rules per project

## Integration with Convex

Sentry automatically captures Convex errors:
- Query failures appear in Issues
- Mutation timeouts tracked
- Performance traces show Convex latency

If you need custom Convex logging (e.g., `console.log` inside mutations), those won't reach Sentry (Convex runtime isolation). Use Convex's own logging instead:
```typescript
// In your Convex function
ctx.auth.getUserIdentity(); // Logs to Convex dashboard
```

## Best Practices

1. **Set user context after sign-in** (recommended once DSN is live):
   ```typescript
   setSentryUser(user.id, user.email);
   ```

2. **Capture intentional errors** (e.g., validation failures):
   ```typescript
   if (!email.includes('@')) {
     captureMessage('Invalid email format', 'warning');
   }
   ```

3. **Review issues weekly** — Prioritize high-count errors

4. **Set up alerts** once you have steady traffic

5. **Use sourcemaps** for minified production builds (Sentry does this automatically via Vercel integration)

## Disabling Sentry

To temporarily disable Sentry:
- Delete `VITE_SENTRY_DSN` from environment variables
- Sentry gracefully no-ops if DSN is missing

## Related

- [Sentry docs](https://docs.sentry.io/platforms/javascript/guides/svelte/)
- [Sentry + Vercel integration](https://vercel.com/integrations/sentry)
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) — Observability section
- [HEALTH-AND-MONITORING.md](./HEALTH-AND-MONITORING.md)
