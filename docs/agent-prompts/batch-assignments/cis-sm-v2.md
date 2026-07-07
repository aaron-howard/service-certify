# CIS-SM v2 question rewrite (official blueprint)

Replace all **90** CIS-SM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Service Mapping Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions — realism-rebalanced Jul 2026)

| # | Domain | Bank | Orders |
|---|--------|------|--------|
| 1 | Service Design Strategy | 11 | 0–10 |
| 2 | Service Mapping Pattern Design | 18 | 11–28 |
| 3 | Service Mapping Configuration | 13 | 29–41 |
| 4 | Discovery Configuration | 14 | 42–55 |
| 5 | Machine Learning | 13 | 56–68 |
| 6 | Configuration Management Database | 10 | 69–78 |
| 7 | Service Mapping Engagement Readiness | 11 | 79–89 |

Target **≥70% scenario-style** stems (see `cisSmRealism.ts`).

---

## Question style

Match official CIS-SM samples — generic applications, credential errors, discovery phases, event rules, class upgrade, MTTR KPI.
Banned: template wrappers (`Typically,`, `Describes the outcome where`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Service Design Strategy | **DONE** |
| 2 | 5–9 | Service Design Strategy | **DONE** |
| 3 | 10–14 | Service Design (10) + Pattern Design (11–14) | **DONE** |
| 4 | 15–19 | Pattern Design | **DONE** |
| 5 | 20–24 | Pattern Design | **DONE** |
| 6 | 25–28 Pattern + Config (29) | **DONE** |
| 7 | 30–34 | Service Mapping Configuration | **DONE** |
| 8 | 35–39 | Service Mapping Configuration | **DONE** |
| 9 | 40–41 Config + Discovery (42–44) | **DONE** |
| 10 | 45–49 | Discovery Configuration | **DONE** |
| 11 | 50–54 | Discovery Configuration | **DONE** |
| 12 | 55 Discovery + ML (56–59) | **DONE** |
| 13 | 60–64 | Machine Learning | **DONE** |
| 14 | 65–68 ML + CMDB (69) | **DONE** |
| 15 | 70–74 | Configuration Management Database | **DONE** |
| 16 | 75–78 CMDB + Engagement (79) | **DONE** |
| 17 | 80–84 | Service Mapping Engagement Readiness | **DONE** |
| 18 | 85–89 | Service Mapping Engagement Readiness | **DONE** |

---

## Official samples to embed

1. Generic application when no Pattern Identification Section matches (order 11, single)
2. Credential error on service map displays yellow triangle icon (order 12, single)
3. Discovery authentication errors occur during Classification phase (order 44, single)
4. Event Rule in Event Management creates an Alert (order 53, single)
5. Reclassify cmdb_ci_server to cmdb_ci_win_server is a Class Upgrade (order 72, single)
6. Service map visibility improves Incident Management Mean Time to Resolve (order 84, single)

---

## Merge and validate

```bash
node scripts/tag-cis-sm-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-sm-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-sm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-sm-realism.test.ts src/convex/seed/trackQuality.test.ts
# After merge: npm run seed:dev:questions
```
