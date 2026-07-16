# Runbook: Restart Convex Deployment

**Severity:** P2 (Convex queries timing out or returning stale data)  
**Owner:** Backend team  
**Time to resolve:** 5 minutes  

## Symptoms

- Practice questions not loading: "Network error" or timeout
- Exam catalog missing some tracks
- Convex dashboard shows red health status
- Browser console: `ConvexError: Failed to connect to deployment`

## Root Causes

1. Convex serverless functions hit a resource limit
2. Database connection pool exhausted
3. Network partition between Vercel and Convex
4. Deployment crashed mid-update

## Resolution Steps

### Option 1: Restart via Convex Dashboard (Recommended)

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project (e.g., `service-certify-prod`)
3. Click **Settings** → **Deployments**
4. Find the current deployment (green checkmark)
5. Click **⋮ (more)** → **Restart**
6. Wait for restart to complete (~30 seconds)
7. Verify: Open browser, navigate to `/exams` route
8. Check Convex dashboard health indicator (should be green)

### Option 2: Redeploy via CLI

```bash
# In your local service-certify repo:
npx convex deploy --prod
```

This rebuilds all functions and restarts the deployment (~1 minute).

### Option 3: Verify Convex URL Environment Variable

If still failing:

1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Confirm `PUBLIC_CONVEX_URL` is set correctly (no typos)
3. Format should be: `https://YOUR-PROJECT.convex.cloud`
4. If changed, redeploy Vercel: Go to Vercel → Deployments → Click latest → **Redeploy**

## Validation

- [ ] Convex dashboard shows green health status
- [ ] Open `/exams` → exam catalog loads
- [ ] Open `/exams/[any-slug]/practice` → questions load
- [ ] Console has no ConvexError messages

## Rollback

If restart doesn't help:

1. Go to Convex dashboard → **Deployments** tab
2. Find the last known-good deployment (before issues started)
3. Click **⋮** → **Revert to this deployment**
4. Verify symptoms resolve

## If Still Failing

- Check Convex status page: [status.convex.dev](https://status.convex.dev)
- Look for service alerts or outages
- If outage confirmed, post message in Slack/Discord: "Waiting for Convex to recover"
- Monitor health indicator; auto-restarts typically within 10 minutes

## Escalation

**No improvement after 15 minutes:**
1. File issue on [Convex GitHub](https://github.com/get-convex/convex-backend)
2. Or reach out to Convex support (dashboard → Help → Contact)

## Post-Incident

- [ ] Check logs: Convex dashboard → Logs → filter for errors
- [ ] Note any patterns (time of day, specific functions)
- [ ] If recurring, file an enhancement request with Convex team

## Related Runbooks

- [[RUNBOOK-ROLLBACK-VERCEL]] — If frontend deployment is broken
- [[RUNBOOK-RESTORE-BACKUP]] — If data is corrupted
