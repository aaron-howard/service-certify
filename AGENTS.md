<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`src/convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Project docs

- Launch checklist: [`docs/PRODUCTION_READINESS_AUDIT.md`](./docs/PRODUCTION_READINESS_AUDIT.md)
- Architecture: [`docs/architecture.md`](./docs/architecture.md)
- Auth: [`docs/AUTH-WORKOS.md`](./docs/AUTH-WORKOS.md)
- Doc index: [`docs/README.md`](./docs/README.md)

## Cursor Cloud specific instructions

### Services

| Service | Command | Notes |
|---------|---------|-------|
| SvelteKit dev server | `npm run dev` | Vite at http://localhost:5173 |
| Convex backend | `npm run convex:dev` | Requires `PUBLIC_CONVEX_URL` in `.env.local` |

### Key dev commands

- **Type-check/lint:** `npm run check` (svelte-check + TypeScript)
- **Build:** `npm run build` (adapter-vercel output)
- **Dev server:** `npm run dev`

### Caveats

- The app runs **without Convex** using static data from `src/lib/data/`. Practice questions and live catalog queries require a Convex deployment (`PUBLIC_CONVEX_URL`).
- `svelte-check` emits a single warning about missing `@types/node` type definitions — this is benign and does not block the build.
- The `postinstall` script runs `patch-package` which applies a patch to `@sveltejs/adapter-vercel` for Windows symlink compat. This is safe on Linux.
- When Convex is configured, run `npm run seed:dev` and `npm run seed:dev:questions` to populate dev data (tracks + practice questions).
