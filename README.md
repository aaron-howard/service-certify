# Service Certify

ServiceNow certification **practice** platform: browse exam tracks, open detail pages, and run multiple-choice practice sessions. The UI is a **SvelteKit** app; live catalog and question data can be backed by **Convex**. Visual design comes from the Stitch HTML prototypes in [`stitch_service_certify_prd/`](./stitch_service_certify_prd/) and the **Editorial Architect** tokens in [`stitch_service_certify_prd/stitch_service_certify_prd/nexus_academy/DESIGN.md`](./stitch_service_certify_prd/stitch_service_certify_prd/nexus_academy/DESIGN.md).

## Requirements

- **Node.js** 20.x or newer (see `engines` in [`package.json`](./package.json))
- **npm** (or compatible client)
- A [Convex](https://convex.dev) project when you want live queries and seeded dev data (optional for static UI exploration)

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
npm run seed:dev:questions  # dev practice question bank
```

More detail for Convex workflows and agent-driven question generation: [`AGENTS.md`](./AGENTS.md).

## Environment variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `PUBLIC_CONVEX_URL` | For live data | Convex deployment URL (`npx convex dev` / dashboard). Read via `$env/static/public` so SSR matches the client. |
| `PUBLIC_APP_URL` | Optional | Canonical public site URL for links/metadata when you add them. |

See [`.env.example`](./.env.example) for a template. **Do not commit** `.env` or `.env.local` (they are gitignored).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Local dev server (Vite) |
| `npm run build` | Production build (Vercel adapter) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Typecheck + Svelte diagnostics |
| `npm run check:watch` | Same as `check`, watch mode |
| `npm run convex:dev` | Convex dev (deploy + watch) |
| `npm run convex:codegen` | Regenerate Convex client types |
| `npm run seed:dev` | Seed tracks (`internal.seed.apply`, `--push`) |
| `npm run seed:dev:questions` | Seed dev practice questions (`internal.seed.devQuestions`, `--push`) |

## Routes

| Path | Purpose |
| ---- | ------- |
| `/` | Landing |
| `/exams` | Catalog (search + filters) |
| `/exams/[slug]` | Exam detail |
| `/exams/[slug]/practice` | Practice session (Convex-backed when configured) |
| `/dashboard` | Readiness / performance shell |
| `/membership` | Plans placeholder |

## Stack

- **SvelteKit 2**, **Svelte 5**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Convex** + **convex-svelte**
- **@sveltejs/adapter-vercel** for deployment

## Deploy on Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In [Vercel](https://vercel.com), **Add New Project** and import the repo.
3. Use defaults: **Framework Preset** = SvelteKit, **Build Command** = `npm run build`, output handled by the adapter.
4. Set **Node.js** to **20.x or 22.x**.
5. Add **`PUBLIC_CONVEX_URL`** (and any other `PUBLIC_*` vars) in the Vercel project **Environment Variables** UI.

No `vercel.json` is required for a standard SvelteKit + adapter setup.

## Windows local build note

`npm run build` uses `@sveltejs/adapter-vercel`, which creates **symlinks** under `.vercel/output`. On some Windows setups this fails with `EPERM` unless [Developer Mode](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development) is enabled or the shell is elevated. This repo uses **patch-package** to improve Windows behavior; **Vercel’s cloud builders (Linux)** are unaffected, so CI/deploys usually succeed even when a local build is finicky.

## License

This project is licensed under the [MIT License](./LICENSE).
