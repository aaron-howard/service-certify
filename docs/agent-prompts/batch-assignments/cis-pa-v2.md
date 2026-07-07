# CIS-PA v2 question rewrite (Jul 2026 blueprint)

Replace all **90** CIS-PA bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist – Platform Analytics Exam Specification**.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Item types

| Type | Schema `questionType` | Notes |
|------|----------------------|-------|
| Multiple choice | `single` (default) | 4 choices (5 allowed for some multi items) |
| Multiple select | `multi` | `correctIndexes` + `correctIndex` = lowest index |

No matching/drag-drop items on this exam.

Target mix: ~75% single, ~25% multi.

---

## Exam domain quotas (90 questions)

| # | Domain | Bank | Orders |
|---|--------|------|--------|
| 1 | Architecture and Deployment | 9 | 0–8 |
| 2 | KPI Design and Strategy | 10 | 9–18 |
| 3 | Configure Indicators and Indicator Sources | 15 | 19–33 |
| 4 | Configure Breakdowns and Breakdown Sources | 15 | 34–48 |
| 5 | Data Collection | 9 | 49–57 |
| 6 | Data Governance and Quality | 7 | 58–64 |
| 7 | Data Visualization and Dashboards | 15 | 65–79 |
| 8 | Advanced Analytics | 6 | 80–85 |
| 9 | Administration and Advanced Implementation Solutions | 4 | 86–89 |

See also [CIS-PA-Question-Rewrites.md](./CIS-PA-Question-Rewrites.md) for analysis-driven priority changes.

---

## Batches (18 × 5 = 90)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Architecture | DONE |
| 2 | 5–9 | Architecture + Indicators | DONE |
| 3 | 10–14 | Indicators | DONE |
| 4 | 15–19 | Indicators | DONE |
| 5 | 20–24 | Indicators | DONE |
| 6 | 25–29 | Indicators | DONE |
| 7 | 30–34 | Indicators + Breakdowns | DONE |
| 8 | 35–39 | Breakdowns | DONE |
| 9 | 40–44 | Breakdowns | DONE |
| 10 | 45–49 | Breakdowns | DONE |
| 11 | 50–54 | Breakdowns + Data Collection | DONE |
| 12 | 55–59 | Data Collection | DONE |
| 13 | 60–64 | Data Collection + Visualization | DONE |
| 14 | 65–69 | Visualization | DONE |
| 15 | 70–74 | Visualization | DONE |
| 16 | 75–79 | Visualization | DONE |
| 17 | 80–84 | Visualization | DONE |
| 18 | 85–89 | Visualization + Administration | DONE |

---

## Official samples embedded

1. Indicator scores stored in `pa_scores_l1` and `pa_scores_l2`
2. Date-Time field in Indicator Source Conditions
3. Effective breakdown sources: State, Category, Assignment Group (choose three)
4. Historic collection exclusion: open incidents not updated in 90 days
5. Next Experience sections: Analytics Center and Library

---

## Merge and validate

```bash
node scripts/tag-cis-pa-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-pa-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-pa-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-pa-realism.test.ts src/convex/seed/trackQuality.test.ts
npm run check
```

After merge: `npm run seed:dev:questions` to push to Convex.
