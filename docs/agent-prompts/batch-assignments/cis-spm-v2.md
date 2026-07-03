# CIS-SPM v2 question rewrite (official blueprint)

Replace all **90** CIS-SPM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Strategic Portfolio Management Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | SPM Implementation Overview | 2% | 2 | 0–1 |
| 2 | SPM Financials | 10% | 9 | 2–10 |
| 3 | Resource Management | 23% | 21 | 11–31 |
| 4 | Idea and Demand | 18% | 16 | 32–47 |
| 5 | Project Management | 30% | 26 | 48–73 |
| 6 | Timecard Management | 5% | 5 | 74–78 |
| 7 | Portfolio Planning Workspace | 8% | 7 | 79–85 |
| 8 | SPM Platform Analytics and Dashboards | 2% | 2 | 86–87 |
| 9 | SPM Better Together | 2% | 2 | 88–89 |

---

## Question style

Match official CIS-SPM samples — PPM plugins, expense types, resource planning attributes, Idea Portal, budget allocation, timecard policies, APW roles, PMO dashboard, SecOps integration.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Implementation Overview (0–1) + Financials (2–4) | **DONE** |
| 2 | 5–9 | SPM Financials | **DONE** |
| 3 | 10–14 | Financials (10) + Resource Management (11–14) | **DONE** |
| 4 | 15–19 | Resource Management | **DONE** |
| 5 | 20–24 | Resource Management | **DONE** |
| 6 | 25–29 | Resource Management | **DONE** |
| 7 | 30–34 | Resource Management (30–31) + Idea and Demand (32–34) | **DONE** |
| 8 | 35–39 | Idea and Demand | **DONE** |
| 9 | 40–44 | Idea and Demand | **DONE** |
| 10 | 45–49 | Idea and Demand (45–47) + Project Management (48–49) | **DONE** |
| 11 | 50–54 | Project Management | **DONE** |
| 12 | 55–59 | Project Management | **DONE** |
| 13 | 60–64 | Project Management | **DONE** |
| 14 | 65–69 | Project Management | **DONE** |
| 15 | 70–74 | Project Management (70–73) + Timecard (74) | **DONE** |
| 16 | 75–79 | Timecard (75–78) + Portfolio Planning (79) | **DONE** |
| 17 | 80–84 | Portfolio Planning Workspace | **DONE** |
| 18 | 85–89 | Portfolio Planning (85) + Analytics (86–87) + Better Together (88–89) | **DONE** |

---

## Official samples to embed

1. PPM Standard plugins: Project Portfolio Suite + Financial Planning (multi)
2. Expense line Expense type: Capex + Opex (multi)
3. Planning attribute values defined on Employee profile (single)
4. Idea Portal central for idea collection/evaluation (single)
5. Budget allocation property: sn_invst_pln.enable_budget_allocation_v2 (single)
6. Time sheet policy defines requirements for recording time (single)
7. APW planning items role: sn_align_core.apw_user (single)
8. PMO dashboard for investments/pipeline/calendar (single)
9. SPM + SecOps: Vulnerabilities + Security incidents (multi)

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-spm-v2-batch*.json
node scripts/lint-cis-spm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-spm-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
# After merge: npm run seed:dev:questions
```
