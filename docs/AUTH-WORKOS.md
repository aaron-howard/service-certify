# WorkOS Authentication Setup

**Last updated:** 2026-07-16

Service Certify uses **WorkOS** for OAuth authentication with social logins (**Google, Microsoft, GitHub**). Redirect URIs are built from the request origin (`{origin}/auth/callback`). Server-side `WORKOS_API_KEY` and `WORKOS_CLIENT_ID` are required for auth; no `PUBLIC_WORKOS_*` client vars are needed.

**Projects, staging vs production, and per-environment branding:** [WORKOS-ENVIRONMENTS.md](./WORKOS-ENVIRONMENTS.md)

## Quick Start

### 1. Create WorkOS Account (Free)

1. Go to [workos.com](https://workos.com)
2. Sign up (free tier available)
3. Create a new organization
4. Get your API credentials:
   - API Key: `sk_test_...`
   - Client ID: `client_...`

### 2. Configure Redirect URIs

In WorkOS dashboard → Redirect URIs (per environment — see [WORKOS-ENVIRONMENTS.md](./WORKOS-ENVIRONMENTS.md)):

**Staging** (local + Vercel preview):
- **Local dev:** `http://localhost:5173/auth/callback`
- **Preview:** `https://<preview-host>/auth/callback` or wildcard if enabled

**Production:**
- **Live site:** `https://yourdomain.com/auth/callback` (HTTPS required)

### 3. Set Environment Variables

**Local (`.env.local`):**
```env
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Vercel (Settings → Environment Variables):**

Scope staging keys to **Development** + **Preview**; production keys to **Production** only. Full matrix: [WORKOS-ENVIRONMENTS.md](./WORKOS-ENVIRONMENTS.md).

```
WORKOS_API_KEY=sk_test_...   # or sk_live_... on Production
WORKOS_CLIENT_ID=client_...
PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

**Convex env** (dashboard or CLI — required for full mock + admin bootstrap):
```bash
npx convex env set WORKOS_CLIENT_ID client_...
npx convex env set ADMIN_EMAILS you@example.com
```

### 4. Test Locally

```bash
# Terminal 1: Convex
npm run convex:dev

# Terminal 2: SvelteKit
npm run dev

# Open http://localhost:5173/auth/signin
# Click a provider and test flow
```

---

## How It Works

### User Flow

```
User clicks "Sign in with Google" 
    ↓
→ Redirected to WorkOS OAuth screen
    ↓
→ User authenticates with Google
    ↓
→ Redirected to /auth/callback with code
    ↓
→ Exchange code for access token
    ↓
→ Create/link user in Convex
    ↓
→ Redirect to /dashboard
```

### Files Involved

| File | Purpose |
|------|---------|
| `src/routes/auth/signin/+page.svelte` | Sign-in UI with social buttons |
| `src/routes/auth/callback/+server.ts` | OAuth callback handler |
| `src/routes/auth/signout/+server.ts` | Sign-out handler |
| `src/convex/auth.ts` | User creation/update mutations |
| `src/convex/schema.ts` | `users` and `userProgress` tables |
| `src/hooks.server.ts` | WorkOS token middleware |

---

## Available Providers

Wired in `src/lib/workos.server.ts` (`OAUTH_PROVIDERS`):

| Provider | Status |
|----------|--------|
| **Google** | Enabled |
| **Microsoft** | Enabled |
| **GitHub** | Enabled |

Enable each provider in the WorkOS dashboard. Adding Facebook (or others) would require extending `OAUTH_PROVIDERS` and the sign-in UI.

---

## Getting User Info

### In Svelte Components

```svelte
<script>
  import { user } from '$lib/stores';  // Once implemented
</script>

{#if $user}
  <p>Hello {$user.name}</p>
  <img src={$user.profileImage} alt={$user.name} />
{/if}
```

### In Convex Mutations

```typescript
export const gradeAnswers = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    const user = await ctx.db
      .query('users')
      .withIndex('by_workosId', q => q.eq('workosId', identity.subject))
      .unique();
    
    // Now you have: user.id, user.email, user.name, etc.
  }
});
```

---

## Protecting Routes

### Require Authentication

Use the session user from the root layout — do not read cookies directly:

```typescript
// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
  const { user } = await parent();
  if (!user) {
    throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(url.pathname)}`);
  }
  return { user };
};
```

The same pattern is used on `/settings`. Full mock access is enforced in Convex (`listByTrackCode`, `gradeAnswers` with `mode=full`), not only in the UI.

---

## Tracking User Progress

Authenticated `gradeAnswers` calls `recordPracticeSession` in `src/convex/userProgress.ts`:

```typescript
// src/convex/userProgress.ts (simplified)
export async function recordPracticeSession(ctx, { userId, trackCode, scorePercent }) {
  const score = Math.max(0, Math.min(100, Math.round(scorePercent)));
  const existing = await ctx.db
    .query('userProgress')
    .withIndex('by_userId_and_trackCode', (q) =>
      q.eq('userId', userId).eq('trackCode', trackCode)
    )
    .unique();

  if (!existing) {
    await ctx.db.insert('userProgress', {
      userId, trackCode,
      sessionsCompleted: 1,
      bestScore: score,
      averageScore: score,
      lastAttemptedAt: Date.now()
    });
    return;
  }

  const sessionsCompleted = existing.sessionsCompleted + 1;
  const averageScore = Math.round(
    (existing.averageScore * existing.sessionsCompleted + score) / sessionsCompleted
  );

  await ctx.db.patch(existing._id, {
    sessionsCompleted,
    bestScore: Math.max(existing.bestScore, score),
    averageScore,
    lastAttemptedAt: Date.now()
  });
}
```

The dashboard reads progress via `api.userProgress.listForCurrentUser`.

---

## Customization

### Change OAuth Providers

Edit `src/routes/auth/signin/+page.svelte`:

```typescript
const providers = [
  { id: 'google', name: 'Google', icon: '🔍' },
  // Add/remove providers here
];
```

### Custom Sign-In Page

Replace `signin/+page.svelte` with your design:
- WorkOS OAuth URL: Dynamically generated in component
- Providers: Fully customizable
- Styling: Use your design system (already integrated with Tailwind)

### Email/Password (Optional)

WorkOS also supports email/password via "Passwordless" flow. See [WorkOS docs](https://workos.com/docs/user-management/passwordless).

---

## Troubleshooting

### "Invalid redirect URI"
- Verify redirect URI in WorkOS dashboard matches exactly
- Local: `http://localhost:5173/auth/callback` (not HTTPS)
- Prod: `https://yourdomain.com/auth/callback`

### "Invalid client ID"
- Ensure `WORKOS_CLIENT_ID` is set in `.env.local` (and Vercel)
- Must be the **Client ID**, not API Key
- For full mock, also set the same value in **Convex** env as `WORKOS_CLIENT_ID`

### "User not found after callback"
- Check that `createOrUpdateUser` mutation ran successfully
- Verify Convex is deployed if using cloud
- Check browser console for errors

### OAuth provider not showing
- Verify provider is enabled in WorkOS dashboard
- Check WorkOS logs for errors

---

## Next Steps

After setup:

1. ✅ Create WorkOS account and get API key
2. ✅ Set environment variables locally + Vercel (+ Convex)
3. ✅ Test sign-in flow locally: `npm run dev`
4. ✅ Deploy to Vercel and test with production URL
5. ✅ Wire auth to full-mock gating (admin role)
6. ✅ Add user profile / settings page (`/settings`)
7. ✅ Persist practice progress to `userProgress` (on grade + dashboard)
8. ✅ Harden Convex user mutations/queries (JWT + identity match)

---

## Related

- [auth-setup.md](./auth-setup.md) — Short checklist
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md)
- [TESTING.md](./TESTING.md) — Unit / E2E testing
- WorkOS: [Documentation](https://workos.com/docs)
- OAuth: [RFC 6749](https://tools.ietf.org/html/rfc6749)

---

## Admin access and full mock exams

Admins can take **full mock exams** (all questions in the Convex bank). Anonymous users get a **sample** of up to 3 questions per track.

### Bootstrap an admin account

1. Set the Convex environment variable (Convex dashboard → Settings → Environment Variables, or CLI):

```bash
npx convex env set ADMIN_EMAILS you@example.com,partner@example.com
```

Use a **single** variable with comma-separated emails (not one variable per admin).

2. Ensure **`PUBLIC_CONVEX_URL`** is set in **SvelteKit** env (`.env.local` locally, Vercel project env for production). Without it, OAuth sign-in works but users are never written to the Convex `users` table.

3. Set **`WORKOS_CLIENT_ID`** in **Convex** env (same value as SvelteKit `WORKOS_CLIENT_ID`):

```bash
npx convex env set WORKOS_CLIENT_ID client_01XXXXXXXXXXXXXXXXXXXXXXXX
```

Convex uses this to validate WorkOS JWTs for full mock access (`mode=full`).

4. Sign in at `/auth/signin` with an allowlisted email.
5. Confirm in the [Convex dashboard](https://dashboard.convex.dev) → **Data** → `users` that your row has `role: "admin"`.
6. Open any exam detail page — you should see **Start Full Mock**.

### How roles work

- `role` is stored on the Convex `users` table (`user` or `admin`).
- `ADMIN_EMAILS` only **bootstraps** admins on login; promote or demote users later in the Convex dashboard without redeploying.
- After changing `ADMIN_EMAILS`, refresh any page while signed in (profile sync runs on each request) or sign out and back in.
- Verify the exact email in Convex matches WorkOS (e.g. `mr.aaronjhoward@outlook.com`). Quotes in the env value are stripped automatically.
- Full-mode access is enforced in Convex (`listByTrackCode`, `gradeAnswers`), not only in the UI.

### Profile fields (`name`, `provider`, `profileImage`)

- **`name`** — from WorkOS `firstName`/`lastName`, then WorkOS `name` (common for Microsoft), then a formatted email local-part fallback.
- **`provider`** — set from the sign-in button you used (`google`, `microsoft`, `github`).
- **`profileImage`** — URL from your OAuth provider when available (shown in the nav avatar). There is no manual photo upload; it comes from Microsoft/Google/GitHub.

### Convex auth wiring

The browser Convex client calls `/api/auth/convex-token` to attach your WorkOS session to Convex requests. Practice `mode=full` requires a valid admin session.

### Step-up authentication (account deletion)

Deleting an account requires a **fresh WorkOS authentication** within the last 5 minutes:

1. On `/settings`, click **Verify identity to delete** → `/auth/step-up?intent=delete-account`
2. WorkOS AuthKit re-authenticates the user (`max_age=0`) via their original provider
3. After callback, the settings page shows the delete confirmation form
4. `POST /api/account/delete` validates `auth_time` on the access token before calling Convex `deleteAccount`

Sign-in still uses direct OAuth providers (Google, Microsoft, GitHub). Step-up uses the AuthKit provider because `max_age` is only supported on AuthKit authorize flows.

---

## Implementation Status

- ✅ WorkOS SDK installed
- ✅ Auth routes created (signin, callback, signout)
- ✅ Convex schema with users table
- ✅ Auth mutations (create/update user, deleteAccount)
- ✅ Sign-in UI with social buttons (Google, Microsoft, GitHub)
- ✅ Convex client auth via `/api/auth/convex-token`
- ✅ Admin role on `users` table with `ADMIN_EMAILS` bootstrap
- ✅ Full mock practice (`mode=full`) gated to admins in Convex
- ✅ User sync mutations require WorkOS JWT (`setAuth` from SvelteKit)
- ✅ User profile / settings page (`/settings`) with account deletion
- ✅ Practice progress persistence + dashboard
- ✅ Account deletion UI (calls `deleteAccount`, then sign-out)
- ✅ Step-up authentication before account deletion (WorkOS AuthKit `max_age`)

## Note

This is a **server-side OAuth flow**. The access token is stored in an httpOnly cookie (not exposed to client JS). Redirect URI is derived from `url.origin` at request time.
