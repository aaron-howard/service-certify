# CIS-SIR v2 question rewrite (official blueprint)

Replace all **90** CIS-SIR bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Security Incident Response Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | SIR Overview and Data Visualization | 15% | 14 | 0–13 |
| 2 | Security Incident Creation and Threat Intelligence | 14% | 12 | 14–25 |
| 3 | Security Incident and Threat Intelligence Integrations | 14% | 13 | 26–38 |
| 4 | Security Incident Response Management | 15% | 13 | 39–51 |
| 5 | Risk Calculations and Post Incident Response | 12% | 11 | 52–62 |
| 6 | Automation and Standard Processes | 30% | 27 | 63–89 |

---

## Question style

Match official CIS-SIR samples — admin install role, SIR definition, Integration Configurations, NIST Stateful, calculators, flow triggers, reporting audiences.
Banned: template wrappers (`Typically,`, `Describes the outcome where`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | SIR Overview and Data Visualization | **DONE** |
| 2 | 5–9 | SIR Overview and Data Visualization | **DONE** |
| 3 | 10–14 | Overview (10–13) + Incident Creation (14) | **DONE** |
| 4 | 15–19 | Security Incident Creation and Threat Intelligence | **DONE** |
| 5 | 20–24 | Incident Creation and Threat Intelligence | **DONE** |
| 6 | 25–29 | Incident Creation (25) + Integrations (26–29) | **DONE** |
| 7 | 30–34 | Security Incident and Threat Intelligence Integrations | **DONE** |
| 8 | 35–39 | Integrations (35–38) + SIR Management (39) | **DONE** |
| 9 | 40–44 | Security Incident Response Management | **DONE** |
| 10 | 45–49 | SIR Management | **DONE** |
| 11 | 50–54 | SIR Management (50–51) + Risk/Post Incident (52–54) | **DONE** |
| 12 | 55–59 | Risk Calculations and Post Incident Response | **DONE** |
| 13 | 60–64 | Risk/Post Incident (60–62) + Automation (63–64) | **DONE** |
| 14 | 65–69 | Automation and Standard Processes | **DONE** |
| 15 | 70–74 | Automation and Standard Processes | **DONE** |
| 16 | 75–79 | Automation and Standard Processes | **DONE** |
| 17 | 80–84 | Automation and Standard Processes | **DONE** |
| 18 | 85–89 | Automation and Standard Processes | **DONE** |

---

## Official samples to embed

1. `admin` role needed to install Security Incident Response application (single)
2. SIR defined as action plan to mitigate security incidents and imminent threats (single)
3. Pre-built integrations found in Integration Configurations module (single)
4. Default process definition: NIST Stateful (single)
5. Security Incident Calculators set specific values according to matched conditions (single)
6. Flow executes when trigger condition is met (single)
7. Key reporting audiences multi: Security Analysts, Security Managers, CIOs/CISOs (choose three of four)

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-sir-v2-batch*.json
node scripts/lint-cis-sir-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-sir-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
# After merge: npm run seed:dev:questions
```
