# CIS-FSM v2 question rewrite (official blueprint)

Replace all **90** CIS-FSM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Field Service Management Exam Specification** and ServiceNowDocs **`australia`** branch.

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Field Service Management Fundamentals | 42% | 37 | 0–36 |
| 2 | Implementation Planning | 3% | 3 | 37–39 |
| 3 | Implementing Field Service Processes | 52% | 47 | 40–86 |
| 4 | Implementing Related Processes | 3% | 3 | 87–89 |

---

## Question style

Match official CIS-FSM samples — Qualification/Dispatch groups, field normalization, skills, geolocation.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | FSM Fundamentals | **DONE** |
| 2 | 5–9 | FSM Fundamentals | **DONE** |
| 3 | 10–14 | FSM Fundamentals | **DONE** |
| 4 | 15–19 | FSM Fundamentals | **DONE** |
| 5 | 20–24 | FSM Fundamentals (mobile) | **DONE** |
| 6 | 25–29 | FSM Fundamentals (parts/time) | **DONE** |
| 7 | 30–34 | FSM Fundamentals (personas/modules) | **DONE** |
| 8 | 35–39 | Fundamentals (35–36) + Planning (37–39) | **DONE** |
| 9 | 40–44 | Implementing Field Service Processes | **DONE** |
| 10 | 45–49 | Implementing Field Service Processes | **DONE** |
| 11 | 50–54 | Implementing Field Service Processes | **DONE** |
| 12 | 55–59 | Implementing Field Service Processes | **DONE** |
| 13 | 60–64 | Implementing Field Service Processes | **DONE** |
| 14 | 65–69 | Implementing Field Service Processes | **DONE** |
| 15 | 70–74 | Implementing Field Service Processes | **DONE** |
| 16 | 75–79 | Implementing Field Service Processes | **DONE** |
| 17 | 80–84 | Implementing Field Service Processes | **DONE** |
| 18 | 85–89 | Processes (85–86) + Related Processes (87–89) | **DONE** |

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-fsm-v2-batch*.json
node scripts/lint-cis-fsm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-fsm-realism.test.ts src/convex/seed/trackQuality.test.ts
# After merge: npm run seed:dev:questions
```
