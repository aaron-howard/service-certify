# CSA v2 question rewrite (official blueprint)

Replace all **90** CSA bank questions with exam-realistic items aligned to the
**Certified System Administrator Exam Specification** and ServiceNowDocs **`australia`** branch.

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Platform Overview and Navigation | 7% | 6 | 0–5 |
| 2 | Instance Configuration | 10% | 9 | 6–14 |
| 3 | Configuring Applications for Collaboration | 20% | 18 | 15–32 |
| 4 | Self Service and Automation | 20% | 18 | 33–50 |
| 5 | Database Management and Platform Security | 30% | 27 | 51–77 |
| 6 | Data Migration and Integration | 13% | 12 | 78–89 |

---

## Question style

Match official CSA samples — module names, platform facts, variable types, transform maps.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Platform Overview | **DONE** |
| 2 | 5–9 | Platform (5) + Instance (4) | **DONE** |
| 3 | 10–14 | Instance Configuration | **DONE** |
| 4 | 15–19 | Collaboration | **DONE** |
| 5 | 20–24 | Collaboration | **DONE** |
| 6 | 25–29 | Collaboration | **DONE** |
| 7 | 30–34 | Collaboration + Self Service (33–34) | **DONE** |
| 8 | 35–39 | Self Service and Automation | **DONE** |
| 9 | 40–44 | Self Service and Automation | **DONE** |
| 10 | 45–49 | Self Service (45–50) + Database (51) | **DONE** |
| 11 | 50–54 | Database and Security | **DONE** |
| 12 | 55–59 | Database and Security | **DONE** |
| 13 | 60–64 | Database and Security | **DONE** |
| 14 | 65–69 | Database and Security | **DONE** |
| 15 | 70–74 | Database and Security | **DONE** |
| 16 | 75–77 | Database and Security | **DONE** |
| 17 | 78–84 | Data Migration and Integration | **DONE** |
| 18 | 85–89 | Data Migration and Integration | **DONE** |

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/csa-v2-batch*.json
node scripts/lint-csa-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/csa-realism.test.ts src/convex/seed/trackQuality.test.ts
# After merge: npm run seed:dev:questions
```
