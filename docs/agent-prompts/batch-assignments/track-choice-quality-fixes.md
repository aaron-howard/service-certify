# Track choice quality fixes (all exams)

Same pipeline as CIS-DISCO:

1. `node scripts/restore-track-questions.mjs --all` — strip rebalance boilerplate
2. `{track}-fix-batch*.json` — rewritten unique distractors per track
3. `node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/{track}-fix-batch*.json`
4. `node scripts/balance-choice-lengths.mjs` — pad shortest distractors when correct is longest (>85% of track)
5. `npm run test -- --run src/convex/seed/trackQuality.test.ts`
6. `npm run seed:dev:questions`

Fix batch naming: `csa-fix-batch1.json`, `cis-itsm-fix-batch2.json`, etc.
