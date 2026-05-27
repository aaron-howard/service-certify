<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `src/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

## Dev data: certification tracks and practice questions

- **Tracks:** `npm run seed:dev` runs `internal.seed.apply` with `--push` (canonical 22 tracks from `src/lib/catalog/tracksCanonical.ts`).
- **Practice questions (dev bank):** `npm run seed:dev:questions` runs `internal.seed.devQuestions` with `--push` (110 items: 5 per track from `src/convex/seed/devQuestionBank.ts`). Use `--push` so the deployment picks up schema and function changes without a separate `convex dev` session.
- **Regenerating the question bank from Cursor subagent transcripts** (after re-running research agents): `node scripts/extract-questions-from-transcripts.mjs` (optional env `TRANSCRIPT_SUBAGENTS` if transcripts live outside the default Cursor path).
- **Agent prompt template:** [docs/agent-prompts/certification-questions.md](docs/agent-prompts/certification-questions.md).
<!-- convex-ai-end -->

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
