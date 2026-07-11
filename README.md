# Service Certify

ServiceNow certification **practice** platform: browse exam tracks, open detail pages, and run multiple-choice practice sessions. The UI is a **SvelteKit** app; live catalog and question data can be backed by **Convex**. Visual design comes from the Stitch HTML prototypes in [`stitch_service_certify_prd/`](./stitch_service_certify_prd/) and the **Editorial Architect** tokens in [`stitch_service_certify_prd/stitch_service_certify_prd/nexus_academy/DESIGN.md`](./stitch_service_certify_prd/stitch_service_certify_prd/nexus_academy/DESIGN.md).

## Requirements

- **Node.js** `>=22.11.0` (see `engines` in [`package.json`](./package.json))
- **npm** (or compatible client)
- A [Convex](https://convex.dev) project when you want live queries and seeded practice questions (optional for static UI exploration)

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local: set PUBLIC_CONVEX_URL after linking Convex (see below).
npm run dev
```

For a full backend loop, use **two terminals**:

1. **`npm run convex:dev`** — deploys functions, keeps codegen in sync, prints your deployment URL.
2. **`npm run dev`** — Vite + SvelteKit at `http://localhost:5173` (or the next free port).

Copy the Convex **HTTP deployment URL** into `.env.local` as `PUBLIC_CONVEX_URL`, then restart `npm run dev` so SSR and the browser use the same value.

### Seed dev data (Convex)

After Convex is configured:

```bash
npm run seed:dev            # certification tracks
npm run seed:dev:questions  # practice question bank (22 tracks)
```

More detail for Convex workflows and agent-driven question generation: [`AGENTS.md`](./AGENTS.md).

Authentication (WorkOS) is documented in [`docs/AUTH-WORKOS.md`](./docs/AUTH-WORKOS.md) and [`docs/auth-setup.md`](./docs/auth-setup.md).

Launch checklist: [`docs/PRODUCTION_READINESS_AUDIT.md`](./docs/PRODUCTION_READINESS_AUDIT.md).

## Environment variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `PUBLIC_CONVEX_URL` | For live data / user sync | Convex deployment URL. Without it, catalog can still render from static data; practice questions and OAuth→Convex user sync will not work. |
| `PUBLIC_APP_URL` | Optional | Canonical public site URL for Open Graph / canonical links (`SiteMeta`). |
| `WORKOS_API_KEY` | For auth | WorkOS API key (`sk_…`). |
| `WORKOS_CLIENT_ID` | For auth | WorkOS client ID (`client_…`). Also set in **Convex** env for full-mock JWT validation. |
| `VITE_SENTRY_DSN` / `PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Optional | Sentry DSN (Vercel integration sets `NEXT_PUBLIC_SENTRY_DSN`). |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Optional | Source map upload on Vercel builds (from Sentry integration). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Required in production | Rate limiting; fail-closed in prod if unset; fail-open locally. |

**Convex-only env** (not in `.env.local`): `ADMIN_EMAILS`, `WORKOS_CLIENT_ID` — see [`docs/AUTH-WORKOS.md`](./docs/AUTH-WORKOS.md).

See [`.env.example`](./.env.example) for a template. **Do not commit** `.env` or `.env.local` (they are gitignored).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Local dev server (Vite) |
| `npm run build` | Production build (Vercel adapter) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Typecheck + Svelte diagnostics |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run convex:dev` | Convex dev (deploy + watch) |
| `npm run convex:codegen` | Regenerate Convex client types |
| `npm run seed:dev` | Seed tracks (`internal.seed.apply`, `--push`) |
| `npm run seed:dev:questions` | Seed practice questions (`internal.seed.devQuestions`, `--push`) |
| `npm run seed:prod` | Seed tracks + questions on prod Convex deployment |

## Routes

| Path | Purpose | Notes |
| ---- | ------- | ----- |
| `/` | Landing | |
| `/exams` | Catalog (search + filters) | Static catalog; Convex optional |
| `/exams/[slug]` | Exam detail | Sample vs full-mock CTAs |
| `/exams/[slug]/practice` | Practice session | Requires Convex for questions |
| `/dashboard` | Readiness / performance | Auth-gated; live progress from Convex |
| `/settings` | Account profile + delete | Auth-gated |
| `/membership` | Plans placeholder | Phase D — checkout not wired |
| `/auth/signin` | WorkOS social sign-in | |

## Stack

- **SvelteKit 2**, **Svelte 5**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Convex** + **convex-svelte**
- **WorkOS** OAuth
- **@sveltejs/adapter-vercel** for deployment

## Docs

| Doc | Purpose |
| --- | ------- |
| [`docs/README.md`](./docs/README.md) | Doc index |
| [`docs/PRODUCTION_READINESS_AUDIT.md`](./docs/PRODUCTION_READINESS_AUDIT.md) | Launch checklist |
| [`docs/architecture.md`](./docs/architecture.md) | System design |
| [`docs/AUTH-WORKOS.md`](./docs/AUTH-WORKOS.md) | Auth setup |
| [`docs/runbooks/`](./docs/runbooks/) | On-call runbooks |

## Deploy on Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In [Vercel](https://vercel.com), **Add New Project** and import the repo.
3. Use defaults: **Framework Preset** = SvelteKit, **Build Command** = `npm run build`, output handled by the adapter.
4. Set **Node.js** to **22.x**.
5. Add env vars from the table above (at minimum `PUBLIC_CONVEX_URL`; add WorkOS / Upstash / Sentry for production).
6. Deploy Convex to prod and seed questions — see the [production audit ops checklist](./docs/PRODUCTION_READINESS_AUDIT.md#manual-ops-checklist-production).

No `vercel.json` is required for a standard SvelteKit + adapter setup.

## Windows local build note

`npm run build` uses `@sveltejs/adapter-vercel`, which creates **symlinks** under `.vercel/output`. On some Windows setups this fails with `EPERM` unless [Developer Mode](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development) is enabled or the shell is elevated. This repo uses **patch-package** to improve Windows behavior; **Vercel’s cloud builders (Linux)** are unaffected, so CI/deploys usually succeed even when a local build is finicky.

## License

This project is licensed under the [MIT License](./LICENSE).
