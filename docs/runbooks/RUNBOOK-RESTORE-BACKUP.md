# Runbook: Restore Data from Backup

**Severity:** P0 (Data corruption, accidental deletion, data loss)  
**Owner:** Backend team / Database admin  
**Time to resolve:** 10-30 minutes (depends on backup freshness)  

## Symptoms

- User data mysteriously deleted or corrupted
- Exam tracks or practice questions missing
- Mutation ran incorrectly and corrupted database
- Discovered malicious/unauthorized changes to database

## Root Causes

1. Migration script ran incorrectly
2. Accidental mutation deleted data (e.g., `ctx.db.delete()` without proper checks)
3. External API integration corrupted data
4. Security breach (unauthorized writes)
5. Data corruption bug in Convex function

## Before You Restore

⚠️ **STOP:** Before restoring, gather evidence:
- When did the corruption occur? (time, date)
- What data is affected? (which tables, which documents)
- What caused it? (bad migration, accidental delete, external API?)
- Can it be rolled back in code instead?

**Goal:** Understand the root cause so you can prevent it and avoid data loss in restoration.

## Restoration Steps

### Step 1: Contact Convex Support

Since Service Certify runs on Convex serverless, **you cannot self-restore backups**. Convex handles all backups:

1. Go to [Convex support](https://www.convex.dev/contact)
2. Or email `support@convex.dev`
3. Include:
   - **Project name:** service-certify
   - **Affected tables:** `certificationTracks`, `practiceQuestions`, etc.
   - **Time of corruption:** [exact timestamp if known]
   - **Approximate data lost:** [# of documents, which records]
   - **Severity:** P0 (data loss) or P1 (corruption)

### Step 2: Prepare for Downtime

While Convex team restores:
1. Post status: "We're investigating a data issue. Temporarily disabling practice sessions."
2. Create a banner on the app: `src/lib/components/DisclaimBanner.svelte`
   ```svelte
   <div class="banner">
     Data restoration in progress. Practice sessions unavailable. ETA: 2 hours.
   </div>
   ```
3. Deploy that change to Vercel
4. Do **not** accept new mutations during restoration (users waiting is better than more corruption)

### Step 3: Convex Restores (Their job)

Convex team will:
- Restore from the most recent clean backup (typically within hours, sometimes minutes)
- Verify data integrity post-restore
- Notify you via email when done

### Step 4: Verify Restored Data

Once Convex confirms restoration:
1. Check Convex dashboard:
   - Go to your project → Data browser
   - Inspect `certificationTracks` and `practiceQuestions` tables
   - Verify row counts match your expected numbers
2. Test in staging:
   - Open `/exams` route
   - Spot-check 3-5 exam tracks load correctly
   - Verify practice questions for one track
3. Spot-check specific data:
   - Was your most critical exam restored?
   - Are all questions present?

### Step 5: Re-enable App

Once verified:
1. Remove maintenance banner from `DisclaimBanner.svelte`
2. Deploy to Vercel: `git push origin main`
3. Post update: "Data restored successfully. Service back to normal."

## What You'll Lose

⚠️ **Important:** Restoration is **point-in-time**, typically from the last backup (hours ago):
- Any data created/modified after backup will be lost
- Example: If backup was 2 hours old, last 2 hours of user progress lost
- **Convex can provide RTO/RPO estimates** — ask them during support call

## Prevention for Next Time

After restoration, investigate root cause:

1. **If mutation bug:** Review the function, add unit tests
   ```typescript
   // Example: Prevent accidental cascade deletes
   export const deleteTrack = mutation({
     args: { trackCode: v.string() },
     handler: async (ctx, args) => {
       // ✅ Check if questions exist first
       const questions = await ctx.db
         .query('practiceQuestions')
         .withIndex('by_trackCode', q => q.eq('trackCode', args.trackCode))
         .collect();
       
       if (questions.length > 0) {
         throw new Error('Cannot delete track with existing questions');
       }
       
       // Safe to delete
       const track = await ctx.db
         .query('certificationTracks')
         .withIndex('by_code', q => q.eq('code', args.trackCode))
         .unique();
       
       await ctx.db.delete(track._id);
     }
   });
   ```

2. **If migration bug:** Add integration tests before running on prod
3. **If external API bug:** Add data validation on mutation entry

## Cost & SLA

**Convex Backup SLA:**
- Free tier: Backups retained 7 days, RTO/RPO not guaranteed
- Pro tier: Backups retained 30 days, prioritized support
- **Contact Convex for exact commitments**

**Cost of restoration:** Typically included in support; if requires significant engineering effort, Convex may charge

## Related Runbooks

- [[RUNBOOK-RESTART-CONVEX]] — If Convex service is down
- [[RUNBOOK-ROLLBACK-VERCEL]] — If frontend corruption (usually not data loss)

## Escalation

**After 2 hours with no response from Convex:**
1. Call phone support (if available on your plan)
2. Post in [Convex Discord community](https://discord.gg/convex)
3. File urgent issue on [Convex GitHub](https://github.com/get-convex/convex-backend)

## Post-Incident Checklist

- [ ] Root cause identified and documented
- [ ] Fix deployed (if code bug) or process improved
- [ ] Team debriefed (what happened, why, how to prevent)
- [ ] Runbook updated with lessons learned
- [ ] Consider purchasing higher SLA if data loss unacceptable
