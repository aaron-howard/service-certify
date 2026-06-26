# ADR-002: Why SvelteKit for Frontend

**Date:** 2024-01 | **Status:** Accepted | **Author:** Aaron Howard

## Problem

Service Certify needed a modern web frontend that:
- Works seamlessly with Convex real-time queries
- Ships small bundles (fast load times for mobile)
- Supports server-side rendering (SEO, fast First Contentful Paint)
- Integrates easily with Tailwind CSS
- Uses TypeScript for type safety

## Decision

Use **SvelteKit 5** (with Svelte 5 runes) as the web framework.

## Rationale

| Factor | SvelteKit | Next.js | Remix | Astro |
|--------|-----------|---------|-------|-------|
| **Bundle size** | ✅ Smallest (~40KB) | ⚠️ 50–100KB | ⚠️ 50–80KB | ✅ Very small |
| **Real-time integration** | ✅ convex-svelte | ⚠️ Custom or lib | ⚠️ Custom or lib | ⚠️ Custom |
| **Server-side rendering** | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| **TypeScript DX** | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Tailwind support** | ✅ Native | ✅ Native | ✅ Native | ✅ Native |
| **Learning curve** | ⚠️ Medium | ✅ Low | ⚠️ Medium | ⚠️ Medium |
| **Ecosystem** | ⚠️ Smaller | ✅ Massive | ⚠️ Medium | ⚠️ Smaller |
| **Deployment** | ✅ Vercel ready | ✅ Vercel ready | ✅ Vercel ready | ✅ Vercel ready |

## Key Benefits

1. **Smallest bundle** — No JS sent for static routes (exam catalog is mostly static)
2. **Best Convex DX** — `convex-svelte` package provides reactive hooks
3. **Svelte 5 runes** — Modern reactive syntax without React hooks complexity
4. **Form submission** — Built-in CSRF protection, progressive enhancement
5. **File-based routing** — Intuitive route structure (`+page.svelte` = route)

## Constraints

- **Smaller community** — Fewer third-party components vs Next.js
- **Job market** — React/Next.js more common for hiring
- **Ecosystem maturity** — Some libraries lack Svelte adapters (workaround: use vanilla JS)

## Alternatives Considered

**Next.js**
- Pro: Largest React ecosystem, highest job market demand
- Con: Larger bundles, App Router learning curve, less natural Convex integration

**Remix**
- Pro: Form handling, streaming, good DX
- Con: Smaller ecosystem, newer, less mature

**Astro**
- Pro: Smallest bundles, great for content sites
- Con: Less ideal for interactive practice sessions, harder to integrate Convex live queries

## Implementation

- Framework: `@sveltejs/kit` v2.66.0
- Runtime: Node 20+ (ES modules)
- Styling: Tailwind CSS v4 with `@tailwindcss/vite`
- Adapter: `@sveltejs/adapter-vercel` for Vercel deployment
- Real-time: `convex-svelte` for reactive Convex queries

## Related Decisions

- [[ADR-001-convex-backend]] — Backend chosen to pair with SvelteKit
- [[ADR-003-vercel-hosting]] — Vercel's SvelteKit support is excellent

## Revisit Trigger

Reconsider if:
- Hiring developers who are React-only (upskilling or Next.js switch)
- Need advanced component libraries (Material UI, shadcn doesn't cover all use cases)
- Bundle size is no longer a concern (Next.js fine)

## References

- [SvelteKit docs](https://kit.svelte.dev)
- [Svelte 5 release notes](https://svelte.dev/blog/svelte-5-is-running)
- [convex-svelte on npm](https://www.npmjs.com/package/convex-svelte)
