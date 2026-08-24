# Practice question bank (private)

The full practice bank is **not** in the public git tree.

| Path | Tracked? | Role |
| --- | --- | --- |
| `devQuestionBank.ts` | yes | Loader + `isFullQuestionBank()` |
| `devQuestionBank.private.ts` | **no** (gitignored) | Full prompts, answers, explanations |
| `devQuestionBank.private.example.ts` | yes | One-row stub so CI typechecks |

## Local / production seed

1. Place the full bank at `src/convex/seed/devQuestionBank.private.ts` (same export as the example: `DEV_PRACTICE_QUESTIONS`).
2. `npm run seed:dev:questions` (or `seed:prod`). The mutation **refuses** to run if only the stub is loaded, so a clone cannot wipe Convex with placeholder rows.

`npm prepare` copies the stub into the private path when that file is missing.

## History

Older commits on GitHub still contain the former public bank. Removing it from `main` does not erase those blobs; a history rewrite (`git filter-repo`) is a separate ops step if you need the old copies gone.
