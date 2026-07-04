# CIS-RC v2 question rewrite (official blueprint)

Replace all **90** CIS-RC bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Risk and Compliance Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | GRC Overview | 11.67% | 11 | 0–10 |
| 2 | Implementation Planning | 5% | 4 | 11–14 |
| 3 | Entity Framework | 20% | 18 | 15–32 |
| 4 | Policy and Compliance | 25% | 22 | 33–54 |
| 5 | Risk and Advanced Risk | 25% | 22 | 55–76 |
| 6 | Common Elements and Extended Capabilities | 8.33% | 7 | 77–83 |
| 7 | Audit and Advanced Audit | 5% | 6 | 84–89 |

---

## Question style

Match official CIS-RC samples — scoped GRC apps, implementation team, entity filters, scope tables, UCF import, audit role inheritance.
Banned: template wrappers (`Typically,`, `Describes the outcome where`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | GRC Overview | **DONE** |
| 2 | 5–9 | GRC Overview | **DONE** |
| 3 | 10–14 | Overview (10) + Implementation Planning (11–14) | **DONE** |
| 4 | 15–19 | Entity Framework | **DONE** |
| 5 | 20–24 | Entity Framework | **DONE** |
| 6 | 25–29 | Entity Framework | **DONE** |
| 7 | 30–34 | Entity Framework (30–32) + Policy and Compliance (33–34) | **DONE** |
| 8 | 35–39 | Policy and Compliance | **DONE** |
| 9 | 40–44 | Policy and Compliance | **DONE** |
| 10 | 45–49 | Policy and Compliance | **DONE** |
| 11 | 50–54 | Policy and Compliance | **DONE** |
| 12 | 55–59 | Risk and Advanced Risk | **DONE** |
| 13 | 60–64 | Risk and Advanced Risk | **DONE** |
| 14 | 65–69 | Risk and Advanced Risk | **DONE** |
| 15 | 70–74 | Risk and Advanced Risk | **DONE** |
| 16 | 75–79 | Risk (75–76) + Common Elements (77–79) | **DONE** |
| 17 | 80–84 | Common Elements (80–83) + Audit (84) | **DONE** |
| 18 | 85–89 | Audit and Advanced Audit | **DONE** |

---

## Official samples to embed

1. Scoped GRC applications multi: GRC: Profiles + GRC: Risk Management (choose two)
2. Core implementation team multi: Risk and compliance experts + ServiceNow developer team (choose two)
3. Entity Filter mandatory field: Source table (single)
4. Policy and Compliance scope tables multi: Control + Citation (choose two)
5. Risk scope tables multi: Risk Framework + Risk Statement (choose two)
6. UCF Control documents import to Control Objectives table (single)
7. sn_audit.user inherits sn_grc.reader, sn_compliance.reader, sn_risk.reader (multi choose three)

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-rc-v2-batch*.json
node scripts/lint-cis-rc-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-rc-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
# After merge: npm run seed:dev:questions
```
