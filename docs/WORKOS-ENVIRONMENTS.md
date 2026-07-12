# WorkOS Projects, Environments & Branding

**Last updated:** 2026-07-12

Service Certify uses WorkOS AuthKit for OAuth (Google, Microsoft, GitHub). WorkOS separates **staging** and **production** environments inside a **project**. This doc maps those WorkOS tiers to how we deploy the app (local, Vercel preview, Vercel production) and how to configure per-environment branding.

See also: [AUTH-WORKOS.md](./AUTH-WORKOS.md) (OAuth flow, admin bootstrap, step-up auth).

---

## Concepts

| WorkOS layer | What it is | Service Certify usage |
|--------------|------------|------------------------|
| **Project** | Groups environments for one product | Default project (or **Service Certify** if you rename in dashboard) |
| **Staging environment** | Dev/test WorkOS env (`sk_test_…`) | Local dev + Vercel **Preview** |
| **Production environment** | Live WorkOS env (`sk_live_…`) | Vercel **Production** only |
| **Per-env branding** | Logo, colors, display name, theme on AuthKit screens | Staging looks distinct from production |

WorkOS staging and production are **fully isolated**: API keys, client IDs, redirect URIs, users, and branding do **not** sync automatically. **Branding can be copied** from one environment to another in the dashboard.

---

## Recommended mapping

| App deploy | Vercel `VERCEL_ENV` | WorkOS environment | API key prefix | Convex deployment |
|------------|---------------------|--------------------|----------------|-------------------|
| `npm run dev` (localhost) | _(unset)_ | **Staging** | `sk_test_` | Dev (`gregarious-iguana-339` or your dev URL) |
| PR / branch preview URL | `preview` | **Staging** | `sk_test_` | Dev (same as local) |
| Production domain | `production` | **Production** | `sk_live_` | Prod Convex deployment |

The app shows a **non-production banner** (local / preview) in the site header so it is obvious when you are not on the live site. WorkOS AuthKit branding on the OAuth screen should also differ between staging and production.

---

## Dashboard setup checklist

### 1. Confirm project structure

1. Open [WorkOS Dashboard](https://dashboard.workos.com).
2. In the environment picker (header), confirm environments live under one **project** (e.g. **Service Certify**).
3. You should see at least **Staging** and **Production** environments.

No code change is required for project organization — this is dashboard-only unless you add a second product later.

### 2. Staging environment (dev + preview)

**Redirect URIs** (Applications → Redirects):

| URI | Purpose |
|-----|---------|
| `http://localhost:5173/auth/callback` | Local SvelteKit |
| `https://*.vercel.app/auth/callback` | Vercel preview deployments (wildcard if enabled on your plan) |
| Or add each preview URL explicitly | If wildcards are not available |

**OAuth providers:** Enable Google, Microsoft, GitHub (same as today).

**Branding** (Branding in dashboard — per environment):

| Field | Suggested staging value |
|-------|-------------------------|
| **Display name** | `Service Certify (Dev)` |
| **Logo** | Same logo or a dev/staging variant |
| **Primary color** | Distinct from prod (e.g. amber/teal accent) so OAuth screens are visually obvious |
| **Theme** | Light or dark — match prod or use a clear “dev” contrast |

**Credentials:** Copy **Staging** `WORKOS_API_KEY` (`sk_test_…`) and `WORKOS_CLIENT_ID` (`client_…`).

### 3. Production environment (live)

**Prerequisites:** Billing enabled in WorkOS to unlock production (AuthKit free up to 1M MAU).

**Redirect URIs:**

| URI | Purpose |
|-----|---------|
| `https://<your-production-domain>/auth/callback` | Live site (HTTPS required) |

**Branding:**

| Field | Suggested production value |
|-------|----------------------------|
| **Display name** | `Service Certify` |
| **Logo** | Production logo |
| **Primary color** | Brand primary (matches marketing site) |
| **Theme** | Production default |

**Copy from staging:** Use **Copy branding from environment** in the production branding editor, then adjust display name and colors before saving.

**Credentials:** Generate **Production** API key (shown **once** — store in a password manager). Note production `WORKOS_CLIENT_ID`.

### 4. Environment variables

#### SvelteKit (`.env.local` locally)

```env
# WorkOS STAGING — local dev only
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
PUBLIC_CONVEX_URL=https://<dev-deployment>.convex.cloud
```

#### Vercel → Settings → Environment Variables

| Variable | Development | Preview | Production |
|----------|-------------|---------|--------------|
| `WORKOS_API_KEY` | `sk_test_…` | `sk_test_…` | `sk_live_…` |
| `WORKOS_CLIENT_ID` | staging client ID | staging client ID | production client ID |
| `PUBLIC_CONVEX_URL` | dev Convex URL | dev Convex URL | prod Convex URL |

Never use `sk_test_` keys on Vercel **Production**. The repo includes `npm run verify:workos-env` to catch misalignment locally.

#### Convex (per deployment)

Set on **dev** Convex deployment:

```bash
npx convex env set WORKOS_CLIENT_ID client_<staging>
npx convex env set ADMIN_EMAILS you@example.com
```

Set on **prod** Convex deployment:

```bash
npx convex env --prod set WORKOS_CLIENT_ID client_<production>
npx convex env --prod set ADMIN_EMAILS you@example.com
```

JWT validation in Convex uses `WORKOS_CLIENT_ID` — it **must** match the WorkOS environment used by the SvelteKit app pointing at that Convex deployment.

---

## Verify configuration

```bash
# Local — expects staging key (or unset VERCEL_ENV)
WORKOS_API_KEY=sk_test_... npm run verify:workos-env

# Simulate production misconfiguration (should fail)
VERCEL_ENV=production WORKOS_API_KEY=sk_test_... npm run verify:workos-env
```

Manual smoke tests:

1. **Local:** Sign in → AuthKit/OAuth screen shows **staging branding** (display name, colors).
2. **Preview:** Same staging credentials; banner reads “Preview deployment”.
3. **Production:** AuthKit shows production branding; no deploy banner in app header.

---

## What does not carry over to production

When going live, recreate or reconfigure in the **production** WorkOS environment:

- [ ] Production API key + client ID in Vercel (Production scope only)
- [ ] Production redirect URI (HTTPS)
- [ ] Production branding (copy from staging, then finalize)
- [ ] OAuth provider enablement
- [ ] Convex prod `WORKOS_CLIENT_ID` + `ADMIN_EMAILS`
- [ ] Users re-authenticate in production (separate user pool from staging)

Organizations, SSO connections, and webhooks do not apply to our current social-OAuth-only setup.

---

## App code reference

| File | Role |
|------|------|
| `src/lib/deployEnvironment.ts` | Maps `VERCEL_ENV` → `development` / `preview` / `production` |
| `src/lib/components/DeployEnvBanner.svelte` | Header banner on non-production deploys |
| `src/routes/+layout.server.ts` | Exposes `deployEnvironment` to all pages |
| `scripts/verify-workos-env.mjs` | CLI check for staging keys on production tier |

WorkOS-hosted branding (OAuth / step-up screens) is configured entirely in the WorkOS dashboard — not in this repo.

---

## Related

- [AUTH-WORKOS.md](./AUTH-WORKOS.md)
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) — launch checklist
- WorkOS: [Environments](https://workos.com/docs/authkit/environments), [Branding](https://workos.com/docs/authkit/branding)
