# Incident Response Runbooks

Quick reference guides for on-call responders. Choose the runbook matching your symptoms.

## Runbook Index

| Symptom | Runbook | Severity | ETA |
|---------|---------|----------|-----|
| **App won't load, 500 error** | [[RUNBOOK-ROLLBACK-VERCEL]] | 🔴 P1 | 2-5 min |
| **Questions don't load, Convex timeout** | [[RUNBOOK-RESTART-CONVEX]] | 🟡 P2 | 5 min |
| **Data missing or corrupted** | [[RUNBOOK-RESTORE-BACKUP]] | 🔴 P0 | 30 min |
| **Performance degraded (slow API)** | See notes below | 🟡 P2 | 15 min |
| **Too many errors in logs** | See notes below | 🟡 P2 | 10 min |

## Common Scenarios

### "The site is down"
1. Check Vercel dashboard for deployment status
2. If **Failed**: Use [[RUNBOOK-ROLLBACK-VERCEL]]
3. If **Succeeded**: Check Convex health (see below)

### "Convex queries are timing out"
1. Use [[RUNBOOK-RESTART-CONVEX]]
2. Check Convex dashboard for rate limits or resource exhaustion

### "Users report missing data"
1. Check Convex data browser for deleted documents
2. Use [[RUNBOOK-RESTORE-BACKUP]] to recover

### "Performance is slow"
1. Check Vercel Analytics (LCP, FCP trends)
2. Check Convex logs for slow queries
3. If sustained degradation, consider scaling up

## Before Any Action

1. **Identify severity:**
   - P0 = Site completely down, users blocked
   - P1 = Major feature broken, most users affected
   - P2 = Feature degraded, workaround exists
   - P3 = Minor issue, no user impact yet

2. **Communicate:**
   - Post in Slack: "Investigating [symptom]. ETA: [time]"
   - Update status if ETA changes

3. **Gather evidence:**
   - Screenshot errors
   - Note exact time issue started
   - Check if change was recently deployed

## External Dashboards

Keep these tabs open when on-call:

- **Vercel:** [vercel.com/dashboard](https://vercel.com/dashboard) — Deployment status
- **Convex:** [dashboard.convex.dev](https://dashboard.convex.dev) — Database health
- **Status Pages:**
  - Vercel: [status.vercel.com](https://status.vercel.com)
  - Convex: [status.convex.dev](https://status.convex.dev)

## Escalation Chain

**15 min no resolution:**
→ Reach out to tech lead  

**30 min no resolution:**
→ File support ticket with provider (Vercel or Convex)  

**1 hour critical issue:**
→ Call emergency support (if on paid plan)

## Post-Incident

1. Note issue in #incidents Slack channel
2. Create GitHub issue: `[incident] Brief description`
3. Schedule retro within 24 hours
4. Update this runbook with lessons learned

## Quick Health Checks

Run these every 30 minutes when on-call:

```bash
# Check site loads
curl -s https://service-certify.com | grep -q "Service Certify" && echo "✅ Site OK" || echo "❌ Site broken"

# Check Vercel status
curl -s https://status.vercel.com/api/v2/status.json | jq '.status'

# Check Convex status
curl -s https://status.convex.dev/api/v2/status.json | jq '.status'
```

## On-Call Shift Handoff

When switching on-call:
1. Incoming responder reads this README
2. Check runbooks are still accurate
3. Verify links to external dashboards work
4. Review recent incidents (last 2 weeks)
5. Test quick health checks above

## Contributing

Found an issue? Update the runbook:
1. Edit the relevant `.md` file
2. Test steps locally if possible
3. Commit with message: `docs(runbooks): [description]`
4. Push and open PR

Runbooks are living documents — improve them as you learn.
