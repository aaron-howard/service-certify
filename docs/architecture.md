# System Architecture

**Last updated:** 2026-07-10

## Overview

Service Certify is a three-tier web application for practicing ServiceNow certification exams.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Browser                              │
│ (SvelteKit 2 / Svelte 5, Tailwind CSS v4, convex-svelte)            │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      Vercel Edge Network                            │
│ (Auto-scaling, CDN, Global Deployment, Automatic HTTPS)            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ SvelteKit Server (Node ≥22.11, SSR + API routes)             │   │
│  │ • WorkOS OAuth session cookies                               │   │
│  │ • Routes: /, /exams, /exams/[slug], /practice, /dashboard,   │   │
│  │   /membership, /auth/*, /api/health, /api/practice/grade     │   │
│  │ • Rate limiting (Upstash) on health + grade                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      Convex Backend                                  │
│ (Serverless database + functions, auto-scaling)                     │
│                                                                      │
│  Queries                          Mutations                          │
│  • listByTrackCode (sample/full)  • gradeAnswers                     │
│  • getUserByEmail                 • createOrUpdateUser               │
│  • certification tracks           • deleteAccount                    │
│                                                                      │
│  Tables:                                                             │
│  • users (workosId, email, role, …)                                  │
│  • certificationTracks                                               │
│  • practiceQuestions (single / multi / match)                        │
│  • userProgress (schema ready; writes not wired yet)                 │
└──────────────────────────────────────────────────────────────────────┘
```

**External services:** WorkOS (OAuth), optional Sentry (errors), optional Upstash Redis (rate limits), Vercel Speed Insights.

## Data Flow

### Practice session (current)

1. **Browse exams** → Catalog from static [`src/lib/data/exams.ts`](../src/lib/data/exams.ts) (domains from blueprint sources); Convex tracks when configured.
2. **Open exam detail** → Static exam metadata + CTA for sample or full mock.
3. **Practice session** → Client loads questions via Convex `listByTrackCode` (`mode=sample` public, up to 3 questions; `mode=full` requires admin JWT).
4. **Submit** → `POST /api/practice/grade` (IP rate-limited) → Convex `gradeAnswers` → score + explanations returned to client.
5. **Progress** → Not persisted yet. `userProgress` table exists for a future write path; `/dashboard` is a UI shell with placeholder metrics.

### Authentication (implemented)

1. **Sign in** → WorkOS OAuth (Google / Microsoft / GitHub) → httpOnly session cookies.
2. **User sync** → SvelteKit calls Convex `createOrUpdateUser` after callback (and on subsequent requests when Convex URL is set).
3. **Convex JWT** → Browser client uses `/api/auth/convex-token` so full-mock queries can verify admin identity.
4. **Admin bootstrap** → `ADMIN_EMAILS` Convex env promotes allowlisted emails to `role: "admin"` on login.

### Billing (Phase D — not implemented)

Membership UI at `/membership` is a plans placeholder. No Stripe/subscription tables or gating yet. Full mocks are gated by **admin role**, not paid membership.

## Scaling Considerations

| Component | Limit | Mitigation |
|-----------|-------|-----------|
| **Concurrent users** | 10K+ | Vercel auto-scales; Convex serverless |
| **Questions per track** | Bank sized to official count + 30 | Indexed by `trackCode`; sample mode returns ≤3 |
| **QPS** | High | Convex query caching; SSR for catalog |
| **Database size** | Unbounded | Convex replication + snapshots |

## Deployment

**Frontend:** Vercel
- **Build:** `npm run build` (Vite + `@sveltejs/adapter-vercel`)
- **Node:** `>=22.11.0` (`package.json` engines)
- **Preview:** Automatic URL per PR

**Backend:** Convex
- **Dev:** `npm run convex:dev`
- **Prod:** `npx convex deploy --prod` then seed (`npm run seed:prod` or documented equivalent)

## Security Model

| Concern | Current behavior |
|---------|------------------|
| **Auth** | WorkOS OAuth; session in httpOnly cookies |
| **Transport** | TLS via Vercel + Convex |
| **Public** | Catalog, sample practice (≤3 questions), health |
| **Admin-gated** | Full mock question list + full-mode grading |
| **Rate limiting** | Upstash on `/api/health` and `/api/practice/grade` (fail-closed in production if unset) |
| **Known gaps** | See [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) (ops: prod env, seed, Upstash credentials) |

## Development Workflow

```bash
# Terminal 1: Backend
npm run convex:dev
# → Deploys Convex functions, prints deployment URL

# Terminal 2: Frontend
# Set PUBLIC_CONVEX_URL in .env.local, then:
npm run dev
# → http://localhost:5173

# Optional seed
npm run seed:dev
npm run seed:dev:questions
```

Without Convex, the UI still runs using static catalog data; practice questions require a deployment.

## Known Constraints

| Item | Status | Impact |
|------|--------|--------|
| **Progress persistence** | Schema only | Dashboard is mock; no session history |
| **Membership / payments** | Placeholder | Phase D |
| **File / blob storage** | Not used | Would use Convex file storage if needed |
| **User profile page** | Not built | Nav shows avatar from OAuth when present |
| **Transactional email** | Not used | Support via mailto |
| **Health depth** | Convex ping only | Does not check WorkOS or Redis |

## References

- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md)
- [AUTH-WORKOS.md](./AUTH-WORKOS.md)
- [auth-setup.md](./auth-setup.md)
- [Convex docs](https://docs.convex.dev)
- [SvelteKit docs](https://kit.svelte.dev)
- [Vercel + SvelteKit guide](https://vercel.com/docs/frameworks/sveltekit)
