# Phase 9: Biggest bank gaps (official + 30 policy)

Closes the largest deficits toward `EXAM_QUESTION_BANK_TARGETS` in [`examQuestionPolicy.ts`](../../src/lib/catalog/examQuestionPolicy.ts).

| Track | Current | Target | New orders | Count |
|-------|---------|--------|------------|------:|
| CPOP | 75 | 222 | 75–221 | 147 |
| CPOE | 75 | 210 | 75–209 | 135 |
| CIS-DF | 75 | 105 | 75–104 | 30 |
| CSA | 72 | 90 | 72–89 | 18 |
| CAD | 65 | 90 | 65–89 | 25 |
| CPOA | 75 | 100 | 75–99 | 25 |
| CIS-HR | 70 | 90 | 70–89 | 20 |

**400 new questions** in `gap9-batch*.json` (25 objects per file unless noted).

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/gap9-batch*.json
npm run seed:dev:questions
```
