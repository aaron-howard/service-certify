# Phase 2 batch assignments: reach mock-exam question limits

Expand featured tracks from **30** to official mock-exam `questionCount` targets in [`src/lib/data/exams.ts`](../../src/lib/data/exams.ts):

| Track | Target | Order range |
|-------|--------|-------------|
| CSA | 72 | 0–71 |
| CAD | 65 | 0–64 |
| CIS-ITSM | 85 | 0–84 |

Phase 2 adds orders **30** through the target minus one. Merge files `phase2-batch1.json` … `phase2-batch11.json`.

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase2-batch*.json
npm run seed:dev:questions
```

Constants also live in [`src/lib/catalog/trackDocSources.ts`](../../src/lib/catalog/trackDocSources.ts) as `FEATURED_EXAM_QUESTION_TARGETS`.
