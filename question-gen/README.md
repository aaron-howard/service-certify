# question-gen

Tooling for doc-grounded ServiceNow certification practice questions.

| Path | Purpose |
|------|---------|
| `METHODOLOGY.md` | Item-writing rules, audit rubric, workflows |
| `tracks.config.json` | 22 tracks: publications, domains, targets |
| `validate.mjs` | Structural gates (key bias, longest bias, domains, bans) |
| `export-banks.mjs` | Export seed → `banks/<slug>.json` |
| `banks/` | Per-track exported JSON (generated) |

## Commands

```bash
npm run export:question-banks
npm run validate:questions              # exported banks
npm run validate:questions -- --seed    # live seed
npm run validate:questions -- --seed CIS-VR
```

Live seed remains `src/convex/seed/devQuestionBank.ts`. Merge batches via:

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/<file>.json
node scripts/rebalance-question-choices.mjs --track=CIS-VR
```
