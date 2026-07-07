# CIS-HAM v2 question rewrite (official blueprint)

Replace all **90** CIS-HAM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Hardware Asset Management Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | IT Asset Management Overview and Fundamentals | 16% | 14 | 0–13 |
| 2 | Data Integrity – Attributes and Data Sources | 22% | 20 | 14–33 |
| 3 | Practical Management of IT Assets | 26% | 23 | 34–56 |
| 4 | Operational Integration of IT Asset Management Processes | 24% | 22 | 57–78 |
| 5 | Financial Management of IT Assets | 12% | 11 | 79–89 |

---

## Question style

Match official CIS-HAM samples — ITAM definition, Discovery trustworthy data, consumables, Service Catalog, operational expenses.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | ITAM Overview and Fundamentals | **DONE** |
| 2 | 5–9 | ITAM Overview and Fundamentals | **DONE** |
| 3 | 10–14 | ITAM Overview and Fundamentals | **DONE** |
| 4 | 15–19 | Overview (15–17) + Data Integrity (18–19) | **DONE** |
| 5 | 20–24 | Data Integrity | **DONE** |
| 6 | 25–29 | Data Integrity | **DONE** |
| 7 | 30–34 | Data Integrity | **DONE** |
| 8 | 35–39 | Data Integrity | **DONE** |
| 9 | 40–44 | Data Integrity (40–41) + Practical Management (42–44) | **DONE** |
| 10 | 45–49 | Practical Management of IT Assets | **DONE** |
| 11 | 50–54 | Practical Management of IT Assets | **DONE** |
| 12 | 55–59 | Practical Management of IT Assets | **DONE** |
| 13 | 60–64 | Practical Management of IT Assets | **DONE** |
| 14 | 65–69 | Practical Management (65–68) + Operational Integration (69) | **DONE** |
| 15 | 70–74 | Operational Integration | **DONE** |
| 16 | 75–79 | Operational Integration (75–78) + Financial (79) | **DONE** |
| 17 | 80–84 | Financial Management | **DONE** |
| 18 | 85–89 | Financial Management | **DONE** |

---

## Official samples to embed

1. ITAM = Management of IT assets (single)
2. Discovery helps ensure trustworthy IT asset data (single)
3. Consumables multi: CD, Keyboard, Mouse (choose three of four — Laptop as distractor)
4. End user orders laptop from Service Catalog (single)
5. Operational expenses multi: Maintenance agreement costs, Replacement parts, Resource costs for support (choose three of four)

---

## Merge and validate

```bash
node scripts/tag-cis-ham-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-ham-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-ham-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-ham-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
```
