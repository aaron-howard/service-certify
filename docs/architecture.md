# System Architecture

## Overview

Service Certify is a three-tier web application for practicing ServiceNow certification exams.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Browser                              │
│ (SvelteKit 5, Tailwind CSS v4, convex-svelte reactive queries)      │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      Vercel Edge Network                            │
│ (Auto-scaling, CDN, Global Deployment, Automatic HTTPS)            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ SvelteKit Server (Node 20+, SSR + API routes)                │   │
│  │ • Handles form submissions and server-side rendering         │   │
│  │ • Routes: /, /exams, /exams/[slug], /dashboard, /membership │   │
│  │ • Redirects to Convex for data queries                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      Convex Backend                                  │
│ (Serverless database + functions, auto-scaling, global replication) │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │  Queries (read-only) │  │  Mutations (write)   │                │
│  │ • getCertificationTracks    │ • gradePracticeAnswers  │         │
│  │ • getPracticeQuestions      │ • recordUserProgress    │         │
│  │ • getUserProgress           │ • submitPracticeSession │         │
│  └──────────────────────┘  └──────────────────────┘                │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Convex Database (Real-time, multi-AZ, auto-backup)        │    │
│  │                                                             │    │
│  │  Tables:                                                   │    │
│  │  • certificationTracks (code, officialName, sortOrder)    │    │
│  │    └─ Indexed by: code                                     │    │
│  │  • practiceQuestions (trackCode, order, prompt, choices,  │    │
│  │                      correctIndex, explanation)            │    │
│  │    └─ Indexed by: trackCode                                │    │
│  │  • (Phase C) users (email, name, tokenIdentifier)         │    │
│  │  • (Phase C) userProgress (userId, trackCode, score)      │    │
│  └────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Practice Session Flow (MVP)
1. **Browse exams** → SvelteKit fetches `certificationTracks` via Convex query
2. **Open exam detail** → SvelteKit fetches `practiceQuestions` for trackCode
3. **Practice session** → Frontend renders questions client-side (no persistence yet)
4. **Submit** → Log to console (Phase C: save via mutation to userProgress)

### With Authentication (Phase C+)
1. **Sign in** → JWT issued by auth provider (Clerk/Auth0/WorkOS)
2. **Query protection** → Convex checks `ctx.auth.getUserIdentity()` on mutations
3. **Progress tracking** → Save to `userProgress` table with `tokenIdentifier`
4. **Billing** → Link subscriptions to authenticated user ID

## Scaling Considerations

| Component | Limit | Mitigation |
|-----------|-------|-----------|
| **Concurrent users** | 10K+ | Vercel auto-scales, Convex handles unlimited |
| **Questions per track** | 10K+ | Indexed queries, paginate if > 1K displayed |
| **QPS (queries/sec)** | 1K+ | Convex caches queries, frontend SSR reduces client load |
| **Database size** | Unbounded | Convex multi-AZ replication, snapshots for backup |

## Deployment

**Frontend:** Vercel (auto-scaling)
- **Build:** `npm run build` (Vite + SvelteKit adapter-vercel)
- **Artifacts:** `.vercel/output/` (static + lambda functions)
- **Preview:** Automatic URL for every PR

**Backend:** Convex (serverless, global)
- **Deploy:** `npx convex deploy` (or via dashboard)
- **Environment:** dev (localhost), production (cloud)

## Security Model (Phase C+)

- **Auth:** JWT from Convex auth provider
- **Transport:** TLS 1.2+ enforced (Vercel + Convex)
- **Public routes:** Exams, questions (no auth needed)
- **Protected routes:** `/dashboard` (auth required), `gradeAnswers` (auth + rate-limited)
- **Rate limiting:** Vercel middleware (per-IP, per-user once auth enabled)
- **Secrets:** CONVEX_DEPLOYMENT_KEY in Vercel env, never in code

## Development Workflow

```bash
# Terminal 1: Backend
npm run convex:dev
# → Deploys Convex functions, prints deployment URL

# Terminal 2: Frontend
npm run dev
# → Starts SvelteKit on http://localhost:5173
```

## Known Constraints

| Item | Status | Impact |
|------|--------|--------|
| **File storage** | Not used | Images/PDFs would use Convex blob storage (Phase D) |
| **Real-time sync** | Active | SvelteKit + convex-svelte auto-sync practice state |
| **WebSockets** | Convex native | Live updates for future multiplayer features |
| **Cron jobs** | Configured | Seed data runs manually; auto-cleanup possible |
| **External APIs** | Not used | Question generation uses `internal.actions` (Phase C) |

## References

- [Convex docs](https://docs.convex.dev)
- [SvelteKit docs](https://kit.svelte.dev)
- [Vercel + SvelteKit guide](https://vercel.com/docs/frameworks/sveltekit)
