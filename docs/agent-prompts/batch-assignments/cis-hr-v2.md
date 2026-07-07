# CIS-HR v2 question rewrite (official blueprint)

Replace all **90** CIS-HR bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Human Resources Exam Specification** and ServiceNowDocs **`australia`** branch.

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | Bank | Orders |
|---|--------|------|--------|
| 1 | HR System Architecture | 22 | 0–21 |
| 2 | Core HR Applications and Employee Center | 32 | 22–53 |
| 3 | HR Journeys | 18 | 54–71 |
| 4 | Platform, Role, and Contextual Security | 5 | 72–76 |
| 5 | Integration Strategy | 9 | 77–85 |
| 6 | Implementation and Change Management | 4 | 86–89 |

See also [CIS-HR-Question-Rewrites.md](./CIS-HR-Question-Rewrites.md) for analysis-driven priority changes.

---

## Question style

Match official CIS-HR samples — application scopes, COE limits, User Criteria, dashboard actions.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | HR System Architecture | **DONE** |
| 2 | 5–9 | HR System Architecture | **DONE** |
| 3 | 10–14 | HR System Architecture | **DONE** |
| 4 | 15–19 | HR System Architecture | **DONE** |
| 5 | 20–24 | HR System Architecture | **DONE** |
| 6 | 25–29 | Architecture (25–26) + Core HR (27–29) | **DONE** |
| 7 | 30–34 | Core HR and Employee Center | **DONE** |
| 8 | 35–39 | Core HR and Employee Center | **DONE** |
| 9 | 40–44 | Core HR and Employee Center | **DONE** |
| 10 | 45–49 | Core HR and Employee Center | **DONE** |
| 11 | 50–54 | Core HR (50–53) + Journeys (54) | **DONE** |
| 12 | 55–59 | HR Journeys | **DONE** |
| 13 | 60–64 | HR Journeys | **DONE** |
| 14 | 65–69 | HR Journeys | **DONE** |
| 15 | 70–74 | Journeys (70–71) + Security (72–74) | **DONE** |
| 16 | 75–79 | Platform, Role, and Contextual Security | **DONE** |
| 17 | 80–84 | Platform, Role, and Contextual Security | **DONE** |
| 18 | 85–89 | Platform, Role, and Contextual Security | **DONE** |

---

## Merge and validate

```bash
node scripts/tag-cis-hr-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-hr-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-hr-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-hr-realism.test.ts src/convex/seed/trackQuality.test.ts
```
