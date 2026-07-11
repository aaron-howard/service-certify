# Error Tracking with Sentry

Service Certify uses **Sentry** (`@sentry/sveltekit`) to capture client and server errors, performance traces, and session replays on Vercel.

## Quick Setup

### Option A — Vercel → Sentry integration (recommended)

1. Install [Sentry for Vercel](https://vercel.com/integrations/sentry) and link this project.
2. The integration injects build/runtime env vars into Vercel:
   - `NEXT_PUBLIC_SENTRY_DSN` — project DSN (Next.js-oriented name; this app reads it)
   - `SENTRY_AUTH_TOKEN` — source map / release upload
   - `SENTRY_ORG` / `SENTRY_PROJECT` — org and project slugs
3. Redeploy so the new variables apply.
4. Confirm Production **and** Preview include `SENTRY_AUTH_TOKEN` if preview builds should upload source maps (the integration sometimes scopes tokens to Production only).

This app also accepts `VITE_SENTRY_DSN`, `PUBLIC_SENTRY_DSN`, and `SENTRY_DSN` if you set them manually.

### Option B — Manual DSN

1. Create a Sentry project (SvelteKit template).
2. Copy the DSN into Vercel / `.env.local`:

```bash
# Client (any one of these)
VITE_SENTRY_DSN=https://key@o0.ingest.sentry.io/12345
# or PUBLIC_SENTRY_DSN=...
# or NEXT_PUBLIC_SENTRY_DSN=...  (Vercel integration default)

# Server fallback (optional if a public DSN var is already set)
SENTRY_DSN=https://key@o0.ingest.sentry.io/12345

# Source maps on Vercel builds (from the integration, or create an org auth token)
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

3. Redeploy after changing Vercel env vars.

### Verify

1. Deploy or run locally with a DSN set.
2. Trigger a real app error (not a browser-console `throw` — those are sandboxed).
3. Check [sentry.io](https://sentry.io) → Issues within ~10 seconds.

## What Gets Tracked

### Automatically Captured
- Unhandled JavaScript errors and promise rejections
- SvelteKit `handleError` (client + server) with an `errorId` shown on `+error.svelte`
- Server request tracing via `Sentry.sentryHandle()` and experimental SvelteKit instrumentation
- Session Replay: 10% of sessions, 100% of sessions with an error
- Performance traces (10% in production, 100% otherwise)

### What's NOT Captured (Privacy)
- Sensitive form data (passwords, payment fields)
- Browser extension noise (filtered via `ignoreErrors`)

## Manual Error Tracking

```typescript
import { captureException, captureMessage, setSentryUser } from '$lib/sentry';

try {
  // ...
} catch (error) {
  captureException(error, { phase: 'practice_grade' });
}

captureMessage('User started practice session', 'info');
setSentryUser(userId, userEmail);
```

## How the Vercel integration wires in

| Integration env var | Used for |
|---------------------|----------|
| `NEXT_PUBLIC_SENTRY_DSN` | Runtime DSN (client + server fallback) |
| `SENTRY_AUTH_TOKEN` | Vite plugin uploads source maps during `npm run build` |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Release + artifact association |

Source maps are **not** automatic from the Vercel integration alone — the app must run `@sentry/sveltekit`'s Vite plugin (`vite.config.ts`, `adapter: 'vercel'`). Upload is enabled only when `SENTRY_AUTH_TOKEN` is present so local/CI builds without Sentry still succeed.

## Architecture (code)

| File | Role |
|------|------|
| `src/instrumentation.server.ts` | Earliest server `Sentry.init` |
| `src/hooks.client.ts` | Client init + `handleErrorWithSentry` |
| `src/hooks.server.ts` | `sequence(sentryHandle(), …)` + `handleErrorWithSentry` |
| `src/lib/sentry.ts` | DSN resolution, user helpers, `captureException` |
| `vite.config.ts` | `sentrySvelteKit({ adapter: 'vercel' })` |
| `svelte.config.js` | `experimental.instrumentation` / `tracing` + CSP for ingest/replay |

## Troubleshooting

**Errors not appearing?**
- Confirm a DSN is set on the deployment (`NEXT_PUBLIC_SENTRY_DSN` or `VITE_SENTRY_DSN` / `SENTRY_DSN`).
- Redeploy after adding env vars (they do not apply to old deployments).
- Check the browser Network tab for requests to `*.ingest*.sentry.io` (ad blockers often block them).
- Ensure CSP allows ingest hosts and `worker-src 'self' blob:` (already configured in `svelte.config.js`).

**Source maps missing / minified stacks?**
- Confirm `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` exist on the Vercel environment that ran the build.
- Check the Vercel build log for Sentry upload lines; missing auth token skips upload by design.
- Adapter must be Node (default `@sveltejs/adapter-vercel`) — Edge is not supported by the SvelteKit Sentry SDK.

**Build fails mentioning Sentry auth?**
- Either add `SENTRY_AUTH_TOKEN` for that environment, or leave it unset (upload stays off when the token is absent).

**Too many errors?**
- Extension/ad-blocker noise is filtered; review Convex logs for real backend failures.

## Disabling Sentry

Remove or empty the DSN env vars. Init and helpers no-op when no DSN is resolved.

## Related

- [Sentry SvelteKit docs](https://docs.sentry.io/platforms/javascript/guides/sveltekit/)
- [Sentry + Vercel integration](https://docs.sentry.io/integrations/deployment/vercel/)
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) — Observability section
- [HEALTH-AND-MONITORING.md](./HEALTH-AND-MONITORING.md)
