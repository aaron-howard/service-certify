# CIS-SM v2 question rewrite (official blueprint)

Replace all **90** CIS-SM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Service Mapping Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Service Mapping Pattern Design | 30% | 27 | 0–26 |
| 2 | Service Mapping Configuration | 20% | 18 | 27–44 |
| 3 | Discovery Configuration | 15% | 14 | 45–58 |
| 4 | Machine Learning | 10% | 9 | 59–67 |
| 5 | Configuration Management Database | 15% | 13 | 68–80 |
| 6 | Service Mapping Engagement Readiness | 10% | 9 | 81–89 |

---

## Question style

Match official CIS-SM samples — generic applications, credential errors, discovery phases, event rules, class upgrade, MTTR KPI.
Banned: template wrappers (`Typically,`, `Describes the outcome where`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Pattern Design | **DONE** |
| 2 | 5–9 | Pattern Design | **DONE** |
| 3 | 10–14 | Pattern Design | **DONE** |
| 4 | 15–19 | Pattern Design | **DONE** |
| 5 | 20–24 | Pattern Design | **DONE** |
| 6 | 25–29 | Pattern Design (25–26) + SM Configuration (27–29) | **DONE** |
| 7 | 30–34 | SM Configuration | **DONE** |
| 8 | 35–39 | SM Configuration | **DONE** |
| 9 | 40–44 | SM Configuration | **DONE** |
| 10 | 45–49 | Discovery Configuration | **DONE** |
| 11 | 50–54 | Discovery Configuration | **DONE** |
| 12 | 55–59 | Discovery (55–58) + Machine Learning (59) | **DONE** |
| 13 | 60–64 | Machine Learning | **DONE** |
| 14 | 65–69 | Machine Learning (65–67) + CMDB (68–69) | **DONE** |
| 15 | 70–74 | CMDB | **DONE** |
| 16 | 75–79 | CMDB | **DONE** |
| 17 | 80–84 | CMDB (80) + Engagement Readiness (81–84) | **DONE** |
| 18 | 85–89 | Engagement Readiness | **DONE** |

---

## Official samples to embed

1. Generic application when no Pattern Identification Section matches (single)
2. Credential error on service map displays yellow triangle icon (single)
3. Discovery authentication errors occur during Classification phase (single)
4. Event Rule in Event Management creates an Alert (single)
5. Reclassify cmdb_ci_server to cmdb_ci_win_server is a Class Upgrade (single)
6. Service map visibility improves Incident Management Mean Time to Resolve (single)

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-sm-v2-batch*.json
node scripts/lint-cis-sm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-sm-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
# After merge: npm run seed:dev:questions
```
