# WorkOS Authentication Setup

Service Certify uses **WorkOS** for OAuth authentication with social logins (Google, Microsoft, GitHub, Facebook).

## Quick Start

### 1. Create WorkOS Account (Free)

1. Go to [workos.com](https://workos.com)
2. Sign up (free tier available)
3. Create a new organization
4. Get your API credentials:
   - API Key: `sk_test_...`
   - Client ID: `client_...`

### 2. Configure Redirect URIs

In WorkOS dashboard → Redirect URIs:
- **Local dev:** `http://localhost:5173/auth/callback`
- **Production:** `https://yourdomain.com/auth/callback` (Vercel URL)

### 3. Set Environment Variables

**Local (`.env.local`):**
```env
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
PUBLIC_WORKOS_CLIENT_ID=client_...
PUBLIC_WORKOS_REDIRECT_URI=http://localhost:5173/auth/callback
```

**Vercel (Settings → Environment Variables):**
```
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
PUBLIC_WORKOS_CLIENT_ID=client_...
PUBLIC_WORKOS_REDIRECT_URI=https://yourdomain.vercel.app/auth/callback
```

### 4. Test Locally

```bash
# Start dev server
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

WorkOS supports these OAuth providers out-of-the-box:

| Provider | Setup |
|----------|-------|
| **Google** | Auto-configured in WorkOS |
| **Microsoft** | Auto-configured in WorkOS |
| **GitHub** | Auto-configured in WorkOS |
| **Facebook** | Auto-configured in WorkOS |

No additional OAuth apps needed! WorkOS handles all provider integrations.

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

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, redirect }) => {
  const workosToken = cookies.get('workos_token');
  
  if (!workosToken) {
    throw redirect(302, '/auth/signin');
  }
  
  // User is authenticated
  return {};
};
```

### Redirect Authenticated Users

```typescript
// src/routes/auth/signin/+page.server.ts
export const load: PageServerLoad = async ({ cookies, redirect }) => {
  const workosToken = cookies.get('workos_token');
  
  if (workosToken) {
    throw redirect(302, '/dashboard');
  }
};
```

---

## Tracking User Progress

Once authenticated, track practice session performance:

```typescript
// src/convex/practiceQuestions.ts - update gradeAnswers
export const gradeAnswers = mutation({
  args: { trackCode: v.string(), answers: v.array(answerValidator) },
  handler: async (ctx, { trackCode, answers }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Grade the answers (existing logic)
    const results = /* ... grading ... */;
    const score = (results.correct / results.total) * 100;

    // Get user
    const user = await ctx.db
      .query('users')
      .withIndex('by_workosId', q => q.eq('workosId', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    // Update or create progress record
    const existing = await ctx.db
      .query('userProgress')
      .withIndex('by_userId_and_trackCode', q =>
        q.eq('userId', user._id).eq('trackCode', trackCode)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        sessionsCompleted: existing.sessionsCompleted + 1,
        bestScore: Math.max(existing.bestScore, score),
        averageScore: (existing.averageScore + score) / 2,
        lastAttemptedAt: Date.now()
      });
    } else {
      await ctx.db.insert('userProgress', {
        userId: user._id,
        trackCode,
        sessionsCompleted: 1,
        bestScore: score,
        averageScore: score,
        lastAttemptedAt: Date.now()
      });
    }

    return results;
  }
});
```

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
- Ensure `PUBLIC_WORKOS_CLIENT_ID` is set in `.env.local`
- Must be the **Client ID**, not API Key

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
2. ✅ Set environment variables locally + Vercel
3. ✅ Test sign-in flow locally: `npm run dev`
4. ✅ Deploy to Vercel and test with production URL
5. ✅ Wire auth to protected routes (dashboard, grading)
6. ✅ Add user profile / settings page (future)

---

## Related

- [[docs/TESTING.md]] — E2E test auth flows
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
4. Confirm in the [Convex dashboard](https://dashboard.convex.dev) → **Data** → `users` that your row has `role: "admin"`.
5. Open any exam detail page — you should see **Start Full Mock**.

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

---

## Implementation Status

- ✅ WorkOS SDK installed
- ✅ Auth routes created (signin, callback, signout)
- ✅ Convex schema with users table
- ✅ Auth mutations (create/update user)
- ✅ Sign-in UI with social buttons
- ✅ Convex client auth via `/api/auth/convex-token`
- ✅ Admin role on `users` table with `ADMIN_EMAILS` bootstrap
- ✅ Full mock practice (`mode=full`) gated to admins in Convex
- ⏳ User profile page (coming: future phase)

## Note

This is a **server-side OAuth flow**. The access token never reaches the browser—only an httpOnly cookie is set. This is the most secure approach for traditional web apps.
