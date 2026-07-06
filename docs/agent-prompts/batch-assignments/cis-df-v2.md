# CIS-DF v2 question rewrite (Jul 2026 blueprint)

Replace all **105** CIS-DF bank questions with exam-realistic items aligned to the
**Data Foundations (CMDB and CSDM) Exam Specification**.

Official exam: **75 questions** (90 minutes). Bank target: **105** (75 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Item types

| Type | Schema `questionType` | Notes |
|------|----------------------|-------|
| Multiple choice | `single` (default) | 4 choices, scenario stems |
| Multiple select | `multi` | `correctIndexes` + `correctIndex` = lowest index |
| Drag/drop matching | `match` | `matchLeftItems`, `matchRightItems`, `correctMatches` |

Target mix: ~60% single, ~20% multi, ~20% match.

---

## Exam domain quotas (105 questions)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Configuration | 15% | 16 | 0–15 |
| 2 | Ingest | 19% | 20 | 16–35 |
| 3 | Govern | 35% | 37 | 36–72 |
| 4 | Insight | 20% | 21 | 73–93 |
| 5 | CSDM Fundamentals | 11% | 11 | 94–104 |

---

## Batches (21 × 5 = 105)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1–3 | 0–14 | Configuration | DONE |
| 4 | 15–19 | Configuration + Ingest | DONE |
| 5–7 | 20–34 | Ingest | DONE |
| 8–14 | 35–69 | Ingest + Govern | DONE |
| 15 | 70–74 | Govern + Insight | DONE |
| 16–19 | 75–93 | Insight + CSDM | DONE |
| 20–21 | 94–104 | CSDM Fundamentals | DONE |

---

## Official samples embedded

1. Asset-created CIs not discovered → Discovery source `SNAssetManagement`
2. Asset state sync → Install Status + Hardware Status (choose two)
3. Playbook structure match (First→Summary … Fourth→Fix or Improve)

---

## Tags and URL verification (P3)

- **Domain:** `"domain"` per blueprint quota — `node scripts/tag-cis-df-domains.mjs`
- **Difficulty:** `"contentDifficulty": "Foundation" | "Intermediate" | "Advanced"` — `node scripts/tag-cis-df-difficulty.mjs`
- **URLs:** `node scripts/spot-check-cis-df-urls.mjs` (10 stratified) or `--all`

See `CIS-DF-Question-Rewrites.md` for P1–P3 rewrite reference.

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-df-v2-batch*.json
node scripts/lint-cis-df-realism.mjs --orders=0-104
npm test -- --run src/convex/seed/cis-df-realism.test.ts src/convex/seed/trackQuality.test.ts
npm run check
```

After merge: `npm run seed:dev:questions` to push to Convex.
