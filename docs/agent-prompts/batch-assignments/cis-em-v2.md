# CIS-EM v2 question rewrite (official blueprint)

Replace all **60** CIS-EM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Event Management Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **30 questions** (60 minutes). Bank target: **60** (30 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (60 questions = 30 official × 2)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Event Management Overview | 7% | 4 | 0–3 |
| 2 | Architecture and Discovery | 10% | 6 | 4–9 |
| 3 | Event Configuration and Use | 27% | 16 | 10–25 |
| 4 | Alerts and Tasks | 30% | 18 | 26–43 |
| 5 | Event Sources | 16% | 10 | 44–53 |
| 6 | Metric Intelligence | 10% | 6 | 54–59 |

---

## Question style

Match official CIS-EM samples — customer challenges, MID server platforms, event rule execution order, alert management rules, connector polling interval.
Banned: template wrappers (`Typically,`, `Describes the outcome where`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (12 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Overview (0–3) + Architecture (4) | **DONE** |
| 2 | 5–9 | Architecture and Discovery | **DONE** |
| 3 | 10–14 | Event Configuration and Use | **DONE** |
| 4 | 15–19 | Event Configuration and Use | **DONE** |
| 5 | 20–24 | Event Configuration and Use | **DONE** |
| 6 | 25–29 | Event Config (25) + Alerts and Tasks (26–29) | **DONE** |
| 7 | 30–34 | Alerts and Tasks | **DONE** |
| 8 | 35–39 | Alerts and Tasks | **DONE** |
| 9 | 40–44 | Alerts (40–43) + Event Sources (44) | **DONE** |
| 10 | 45–49 | Event Sources | **DONE** |
| 11 | 50–54 | Event Sources (50–53) + Metric Intelligence (54) | **DONE** |
| 12 | 55–59 | Metric Intelligence | **DONE** |

---

## Official samples to embed

1. Customer challenges multi (choose three of four): current IT infrastructure state, automate/prioritize remediation, consolidate monitoring tools
2. MID server platforms multi: Microsoft Windows Server + Linux System (choose two)
3. Multiple event rules run lowest to highest order of execution (single)
4. Alert Management Rules module for automatic task creation (single)
5. Default connector polling interval Every 120 seconds (single)

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-em-v2-batch*.json
node scripts/lint-cis-em-realism.mjs --orders=0-59
npm test -- --run src/convex/seed/cis-em-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
# After merge: remove legacy orders 60-74 if present, then npm run seed:dev:questions
```
