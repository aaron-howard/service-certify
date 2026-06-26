# Runbook: Rollback Vercel Deployment

**Severity:** P1 (Frontend broken, site down, users blocked)  
**Owner:** Frontend team / DevOps  
**Time to resolve:** 2-5 minutes  

## Symptoms

- Site returns 500 error or blank page
- Practice session UI broken or unresponsive
- Users report: "App won't load" or "buttons don't work"
- Vercel dashboard shows **Failed** status on latest deployment

## Root Causes

1. Bug introduced in recent merge (missing dependency, type error, syntax error)
2. Incorrect environment variable in Vercel dashboard
3. Corrupted build artifact
4. Dependency conflict in `package.json`

## Pre-Incident Prevention

- Always test on preview URL before merging to `main`
- Enable branch protection: require PR reviews + CI passes
- Monitor Vercel dashboard for deployment status

## Resolution Steps

### Option 1: One-Click Rollback via Vercel Dashboard (Fastest)

1. Go to [vercel.com](https://vercel.com) and select your project
2. Click **Deployments** tab
3. Find the **last known-good deployment** (look for the green ✅ before the broken one)
4. Click on that deployment
5. Click **⋮ (more)** → **Redeploy**
6. Confirm you want to redeploy the previous version
7. Wait for redeployment (~2 minutes)
8. Verify: Open the site URL and test basic flow

### Option 2: Revert Code via Git (Permanent fix)

If rollback mask a deeper issue:

```bash
# Find the commit before the breaking change:
git log --oneline | head -10

# Option A: Reset to previous commit
git revert HEAD
# → Creates a new commit that undoes changes
git push origin main
# → Vercel auto-deploys the revert

# Option B: Force reset (use only if urgent)
git reset --hard <previous-commit-hash>
git push --force origin main
# ⚠️ Warning: Destructive for shared branches; communicate with team
```

### Option 3: Fix Environment Variables

If deployment status is green but app doesn't load:

1. Vercel dashboard → **Settings** → **Environment Variables**
2. Verify all vars are set (check against `.env.example`):
   - `PUBLIC_CONVEX_URL` — Convex deployment URL
   - `PUBLIC_APP_URL` — (optional) canonical site URL
3. If changed, redeploy: Deployments tab → Latest → **⋮** → **Redeploy**

## Validation Checklist

After rollback:
- [ ] Site loads without errors (check browser console)
- [ ] Exam catalog displays
- [ ] Can navigate to `/exams/[slug]`
- [ ] Practice session UI renders
- [ ] Vercel dashboard shows green deployment status
- [ ] No 5xx errors in Vercel logs

## Communicating Incident

1. **Immediately:** Post in team Slack: "Rollback in progress, ETA 3 minutes"
2. **When resolved:** "Service restored via rollback to [timestamp]. Investigating root cause."
3. **Post-mortem:** File GitHub issue to prevent recurrence

## Post-Incident

1. **Identify root cause** from build logs:
   - Vercel dashboard → Deployments → Failed deployment → **View Build Logs**
   - Look for TypeScript errors, missing dependencies, syntax errors
2. **Fix locally:**
   ```bash
   npm run check    # Catch TypeScript errors
   npm run build    # Rebuild to verify
   ```
3. **Create PR to fix**, request review, test on preview URL
4. **Merge** only after preview deployment succeeds

## If Rollback Doesn't Help

1. Check Vercel status page: [status.vercel.com](https://status.vercel.com)
2. Is Vercel infrastructure down? (rare but possible)
3. If yes, wait 10+ minutes for Vercel team to resolve
4. Post status update: "Vercel outage detected; waiting for recovery"

## Escalation

**Still broken after 15 minutes:**
1. Check if Convex is down (see [[RUNBOOK-RESTART-CONVEX]])
2. Review recent commits for obvious errors (missing imports, typos)
3. File issue with Vercel support (dashboard → Help → Contact)

## Prevention for Next Time

- [ ] Review failed build logs to understand root cause
- [ ] Add check to CI/CD to catch similar errors earlier
- [ ] Document any new dependencies or breaking changes in PR
- [ ] Require preview URL testing before merging

## Related Runbooks

- [[RUNBOOK-RESTART-CONVEX]] — If backend is also down
- [[RUNBOOK-RESTORE-BACKUP]] — If data is corrupted (rare)
