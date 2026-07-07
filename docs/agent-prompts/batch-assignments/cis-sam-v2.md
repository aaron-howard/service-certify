# CIS-SAM v2 question rewrite (official blueprint)

Replace all **90** CIS-SAM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Software Asset Management Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions)

| # | Domain | Bank | Orders |
|---|--------|------|--------|
| 1 | SAM Overview and Fundamentals | 10 | 0–9 |
| 2 | SAM Strategy and Optimization | 11 | 10–20 |
| 3 | Implementation Planning | 9 | 21–29 |
| 4 | Data Integrity – Attributes and Sources | 18 | 30–47 |
| 5 | Practical Management of Software Compliance | 22 | 48–69 |
| 6 | Operational Integration of Software Processes | 13 | 70–82 |
| 7 | Cloud and SaaS Management | 7 | 83–89 |

---

## Question style

Match official CIS-SAM samples — SAM roles, entitlement import errors, license workbench, reconciliation remediation, normalization status.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | SAM Overview | **DONE** |
| 2 | 5–9 | SAM Overview | **DONE** |
| 3 | 10–14 | SAM Strategy | **DONE** |
| 4 | 15–19 | SAM Strategy | **DONE** |
| 5 | 20–24 | Strategy + Implementation | **DONE** |
| 6 | 25–29 | Implementation Planning | **DONE** |
| 7 | 30–34 | Data Integrity | **DONE** |
| 8 | 35–39 | Data Integrity | **DONE** |
| 9 | 40–44 | Data Integrity | **DONE** |
| 10 | 45–49 | Data Integrity + Compliance | **DONE** |
| 11 | 50–54 | Software Compliance | **DONE** |
| 12 | 55–59 | Software Compliance | **DONE** |
| 13 | 60–64 | Software Compliance | **DONE** |
| 14 | 65–69 | Software Compliance | **DONE** |
| 15 | 70–74 | Operational Integration | **DONE** |
| 16 | 75–79 | Operational Integration | **DONE** |
| 17 | 80–84 | Operational + Cloud/SaaS | **DONE** |
| 18 | 85–89 | Cloud and SaaS Management | **DONE** |

---

## Official samples to embed

1. `sam_developer` role grants script writing capabilities (single)
2. NOT a valid entitlement import error: Purchased rights should be less than 20 (single)
3. License workbench publisher calculations multi: Total Spend, True-up Cost, Potential Savings, Over-licensed amount (all 4 choices correct)
4. Reconciliation remediation multi: Create Allocations, Remove Allocations, Purchase Rights, Remove Unlicensed Installs (all 4 correct)
5. Invalid normalization status: Fully normalized (single — NOT valid)

---

## Merge and validate

```bash
node scripts/tag-cis-sam-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-sam-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-sam-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-sam-realism.test.ts src/convex/seed/trackQuality.test.ts
```
