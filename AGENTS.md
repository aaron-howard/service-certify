<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `src/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

## Dev data: certification tracks and practice questions

- **Tracks:** `npm run seed:dev` runs `internal.seed.apply` with `--push` (canonical 22 tracks from `src/convex/catalog/tracksCanonical.ts`).
- **Practice questions (dev bank):** `npm run seed:dev:questions` runs `internal.seed.devQuestions` with `--push` (110 items: 5 per track from `src/convex/seed/devQuestionBank.ts`). Use `--push` so the deployment picks up schema and function changes without a separate `convex dev` session.
- **Regenerating the question bank from Cursor subagent transcripts** (after re-running research agents): `node scripts/extract-questions-from-transcripts.mjs` (optional env `TRANSCRIPT_SUBAGENTS` if transcripts live outside the default Cursor path).
- **Agent prompt template:** [docs/agent-prompts/certification-questions.md](docs/agent-prompts/certification-questions.md).
<!-- convex-ai-end -->
