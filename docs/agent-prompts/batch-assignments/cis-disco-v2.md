# CIS-DISCO v2 question rewrite (official blueprint)

Replace all **75** CIS-DISCO bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Discovery Exam Specification** (November 2025) and ServiceNowDocs **`australia`** branch.

Official exam: **45 questions** (90 minutes). Bank target: **75** (45 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (75 questions)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Discovery Pattern Design | 35% | 26 | 0–25 |
| 2 | Discovery Configuration | 35% | 26 | 26–51 |
| 3 | Configuration Management Database | 15% | 11 | 52–62 |
| 4 | Discovery Engagement Readiness | 15% | 12 | 63–74 |

---

## Question style

Match official CIS-DISCO samples — pattern/classification failures, auth errors on Classification, CI identifiers, credentials configuration.
Banned: template wrappers (`Typically,`, `Describes the outcome where`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (15 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Discovery Pattern Design | DONE |
| 2 | 5–9 | Discovery Pattern Design | DONE |
| 3 | 10–14 | Discovery Pattern Design | DONE |
| 4 | 15–19 | Discovery Pattern Design | DONE |
| 5 | 20–24 | Discovery Pattern Design | DONE |
| 6 | 25–29 | Pattern Design (25) + Discovery Configuration (26–29) | DONE |
| 7 | 30–34 | Discovery Configuration | DONE |
| 8 | 35–39 | Discovery Configuration | DONE |
| 9 | 40–44 | Discovery Configuration | DONE |
| 10 | 45–49 | Discovery Configuration | DONE |
| 11 | 50–54 | Discovery Config (50–51) + CMDB (52–54) | DONE |
| 12 | 55–59 | Configuration Management Database | DONE |
| 13 | 60–64 | CMDB (60–62) + Engagement Readiness (63–64) | DONE |
| 14 | 65–69 | Discovery Engagement Readiness | DONE |
| 15 | 70–74 | Discovery Engagement Readiness | DONE |

---

## Official samples to embed

1. Pattern fails when no pattern attached to a classification (single)
2. "No credentials would authenticate" error during Classification phase (single)
3. One CI Identifier configured per CI Class (single)
4. Customer should always configure Credentials during implementation (single)

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-disco-v2-batch*.json
node scripts/lint-cis-disco-realism.mjs --orders=0-74
npm test -- --run src/convex/seed/cis-disco-realism.test.ts src/convex/seed/cis-disco.test.ts src/convex/seed/trackQuality.test.ts
# After merge: npm run seed:dev:questions
```
