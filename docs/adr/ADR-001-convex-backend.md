# ADR-001: Why Convex for Backend

**Date:** 2024-01 | **Status:** Accepted | **Author:** Aaron Howard

## Problem

Service Certify needed a serverless backend that:
- Handles real-time data without polling
- Requires no DevOps (no server management)
- Scales automatically for variable load
- Integrates cleanly with SvelteKit frontend
- Provides built-in authentication support

## Decision

Use **Convex** as the backend database and function platform.

## Rationale

| Factor | Convex | Firebase | Supabase | Custom Node API |
|--------|--------|----------|----------|-----------------|
| **Real-time sync** | ✅ Native | ✅ Native | ✅ Postgres | ❌ Requires WebSocket setup |
| **Serverless** | ✅ Functions included | ✅ Yes | ✅ Yes | ❌ Need to manage server |
| **Authentication** | ✅ JWT + providers | ✅ Built-in | ✅ pgAuth | ❌ Build yourself |
| **TypeScript DX** | ✅ Excellent | ⚠️ Good | ⚠️ Good | ✅ Full control |
| **ACID transactions** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Cost** | ✅ $0–500/mo | ✅ $0–200/mo | ✅ $0–100/mo | ⚠️ Depends |
| **Vendor lock-in** | ⚠️ Moderate | ⚠️ High | ✅ Low (Postgres) | ✅ None |

## Key Benefits

1. **Real-time without polling** — `convex-svelte` reactive queries sync data instantly
2. **No DevOps** — Convex manages scaling, backups, global replication
3. **Type safety** — Auto-generated TypeScript API client
4. **Integrated auth** — Works with Clerk, Auth0, WorkOS without extra middleware
5. **Excellent DX** — `npx convex dev` watches and deploys on file change

## Constraints

- **Vendor lock-in:** Migrating off Convex requires rewriting all queries/mutations (medium effort)
- **Query limits:** Transactions bounded to ~100MB, queries return ≤100 documents by default
- **Learning curve:** Convex patterns differ from traditional ORMs (e.g., no `filter()`, must use indexes)

## Alternatives Considered

**Firebase Realtime Database**
- Pro: Fully managed, great free tier
- Con: No transactions, limited query capabilities, different data model

**Supabase (Postgres)**
- Pro: Open source, SQL familiar, can self-host
- Con: Requires managing Postgres, less real-time magic, need custom APIs

**Custom Node.js API (Express + Postgres)**
- Pro: Full control, known technology
- Con: DevOps overhead, need to build auth, caching, scaling

## Implementation

- Convex deployment: `src/convex/`
- Schema: `src/convex/schema.ts` (2 tables: `certificationTracks`, `practiceQuestions`)
- Frontend client: `convex-svelte` (SvelteKit integration)
- Environment: `PUBLIC_CONVEX_URL` injected at build time

## Related Decisions

- [[ADR-002-sveltekit-frontend]] — Frontend chosen to pair with Convex
- [[ADR-003-vercel-hosting]] — Vercel + Convex natural fit

## Revisit Trigger

Reconsider if:
- Real-time is no longer needed (simpler backend possible)
- Query volume exceeds 10K QPS (may outgrow Convex pricing)
- Need to self-host (Supabase becomes better choice)

## References

- [Convex docs](https://docs.convex.dev)
- [convex-svelte integration](https://www.npmjs.com/package/convex-svelte)
