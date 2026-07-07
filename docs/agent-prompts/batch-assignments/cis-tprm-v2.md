# CIS-TPRM v2 question rewrite (official blueprint)

Replace all **90** CIS-TPRM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Third-Party Risk Management Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | TPRM Fundamentals and Review | 23% | 20 | 0–19 |
| 2 | Core Configuration | 14% | 13 | 20–32 |
| 3 | Assessment Configuration | 33% | 30 | 33–62 |
| 4 | Third-party Portal | 12% | 11 | 63–73 |
| 5 | Third-party Supporting Processes | 12% | 11 | 74–84 |
| 6 | Other Application Relationships | 6% | 5 | 85–89 |

---

## Question style

Match official CIS-TPRM samples — Third-party Portal, contact fields, risk issues states, assessments, GRC integration.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | TPRM Fundamentals and Review | **DONE** |
| 2 | 5–9 | TPRM Fundamentals and Review | **DONE** |
| 3 | 10–14 | TPRM Fundamentals and Review | **DONE** |
| 4 | 15–19 | TPRM Fundamentals and Review | **DONE** |
| 5 | 20–24 | Core Configuration | **DONE** |
| 6 | 25–29 | Core Configuration | **DONE** |
| 7 | 30–34 | Core Configuration (30–32) + Assessment (33–34) | **DONE** |
| 8 | 35–39 | Assessment Configuration | **DONE** |
| 9 | 40–44 | Assessment Configuration | **DONE** |
| 10 | 45–49 | Assessment Configuration | **DONE** |
| 11 | 50–54 | Assessment Configuration | **DONE** |
| 12 | 55–59 | Assessment Configuration | **DONE** |
| 13 | 60–64 | Assessment (60–62) + Third-party Portal (63–64) | **DONE** |
| 14 | 65–69 | Third-party Portal | **DONE** |
| 15 | 70–74 | Third-party Portal (70–73) + Supporting Processes (74) | **DONE** |
| 16 | 75–79 | Third-party Supporting Processes | **DONE** |
| 17 | 80–84 | Third-party Supporting Processes | **DONE** |
| 18 | 85–89 | Other Application Relationships | **DONE** |

## Jul 2026 rebalance (domain content alignment)

Orders **74–84** were rewritten from assessment-approval/issue content to **Third-party Supporting Processes**
(contract lifecycle, monitoring, managed activity, compliance integration, dashboards). Fundamentals (**9–14**),
core configuration (**20–21**, **27–29**), assessment deduplication (**47**, **57–58**, **61**), portal multi-select
fix (**66**), and application relationships (**87–89**) were strengthened in `cis-tprm-rebalance-batch1.json`.

Domain tags enforced via `domainForOrder()` in `cisTprmRealism.ts` and `scripts/tag-cis-tprm-domains.mjs`.

---

## Official samples to embed

1. Third-party Portal replaces email/spreadsheet vendor management (single)
2. Third-party Contact form: Primary contact + Email (multi)
3. Third-party Risk Issues inactive in Closed state (single)
4. Portal actions: respond to assessment + manage contacts (multi)
5. Risks registered as Risk Statement records (single)
6. Reporting table: Third-party Risk Assessment [sn_vdr_risk_asmt_assessment] (single)

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-tprm-v2-batch*.json
node scripts/lint-cis-tprm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-tprm-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
# After merge: npm run seed:dev:questions
```
