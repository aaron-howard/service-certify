# CIS-SIR v2 question rewrite (official blueprint)

Replace all **90** CIS-SIR bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Security Incident Response Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **60 questions** (90 minutes). Bank target: **90** (60 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions — realism-rebalanced Jul 2026)

| # | Domain | Bank | Orders |
|---|--------|------|--------|
| 1 | SIR Overview and Data Visualization | 10 | 0–9 |
| 2 | Incident Response Strategy | 11 | 10–20 |
| 3 | Implementation Planning | 9 | 21–29 |
| 4 | Security Incident Creation and Threat Intelligence | 11 | 30–40 |
| 5 | Security Incident and Threat Intelligence Integrations | 13 | 41–53 |
| 6 | Security Incident Response Management | 13 | 54–66 |
| 7 | Risk Calculations and Post Incident Response | 9 | 67–75 |
| 8 | Automation and Standard Processes | 14 | 76–89 |

Target **≥70% scenario-style** stems (see `cisSirRealism.ts`).

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
| 3 | 10–14 | Incident Response Strategy | **DONE** |
| 4 | 15–19 | Incident Response Strategy | **DONE** |
| 5 | 20–24 | IR Strategy (20) + Implementation Planning (21–24) | **DONE** |
| 6 | 25–29 | Implementation Planning | **DONE** |
| 7 | 30–34 | Security Incident Creation and Threat Intelligence | **DONE** |
| 8 | 35–39 | Security Incident Creation and Threat Intelligence | **DONE** |
| 9 | 40–44 | Creation/TI (40) + Integrations (41–44) | **DONE** |
| 10 | 45–49 | Security Incident and Threat Intelligence Integrations | **DONE** |
| 11 | 50–54 | Integrations (50–53) + Response Management (54) | **DONE** |
| 12 | 55–59 | Security Incident Response Management | **DONE** |
| 13 | 60–64 | Security Incident Response Management | **DONE** |
| 14 | 65–69 | Response Management (65–66) + Risk/Post (67–69) | **DONE** |
| 15 | 70–74 | Risk Calculations and Post Incident Response | **DONE** |
| 16 | 75–79 | Risk (75) + Automation (76–79) | **DONE** |
| 17 | 80–84 | Automation and Standard Processes | **DONE** |
| 18 | 85–89 | Automation and Standard Processes | **DONE** |

---

## Official samples to embed

1. `admin` role needed to install Security Incident Response application (order 0, single)
2. SIR defined as action plan to mitigate security incidents and imminent threats (order 2, single)
3. Pre-built integrations found in Integration Configurations module (order 41, single)
4. Default process definition: NIST Stateful (orders 57, 60, single)
5. Security Incident Calculators set specific values according to matched conditions (order 70, single)
6. Flow executes when trigger condition is met (order 76, single)
7. Key reporting audiences multi: Security Analysts, Security Managers, CIOs/CISOs (orders 7 and 67, choose three of four)

---

## Merge and validate

```bash
node scripts/tag-cis-sir-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-sir-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-sir-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-sir-realism.test.ts src/convex/seed/trackQuality.test.ts
# After merge: npm run seed:dev:questions
```
