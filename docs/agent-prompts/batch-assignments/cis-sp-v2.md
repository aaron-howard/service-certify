# CIS-SP v2 question rewrite (Jul 2026 blueprint)

Replace all **75** CIS-SP bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist – Service Provider Exam Specification**.

Official exam: **45 questions** (60 minutes). Bank target: **75** (45 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Item types

| Type | Schema `questionType` | Notes |
|------|----------------------|-------|
| Multiple choice | `single` (default) | 4 choices |
| Multiple select | `multi` | `correctIndexes` + `correctIndex` = lowest index |

No matching/drag-drop items on this exam.

Target mix: ~80% single, ~20% multi.

---

## Exam domain quotas (75 questions)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Initial Domain Setup and Service Provider Architecture | 9% | 7 | 0–6 |
| 2 | Data Separation/Visibility | 24% | 18 | 7–24 |
| 3 | Process Separation | 36% | 27 | 25–51 |
| 4 | Foundational Data Management | 20% | 15 | 52–66 |
| 5 | Domain Support in Applications | 11% | 8 | 67–74 |

---

## Question style

- Technical voice for domain-separated Service Provider administrators and consultants.
- Focus on `sys_domain`, visibility groups, contains relationships, `sys_overrides`, process vs data separation, imports/transforms, and per-application domain support levels.
- Banned: template wrappers and generic "primary purpose" stems.

---

## Batches (15 × 5 = 75)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Initial Domain Setup | DONE |
| 2 | 5–9 | Setup (2) + Data Separation (3) | DONE |
| 3 | 10–14 | Data Separation/Visibility | DONE |
| 4 | 15–19 | Data Separation/Visibility | DONE |
| 5 | 20–24 | Data Separation/Visibility | DONE |
| 6 | 25–29 | Process Separation | DONE |
| 7 | 30–34 | Process Separation | DONE |
| 8 | 35–39 | Process Separation | DONE |
| 9 | 40–44 | Process Separation | DONE |
| 10 | 45–49 | Process Separation | DONE |
| 11 | 50–54 | Process (2) + Foundational (3) | DONE |
| 12 | 55–59 | Foundational Data Management | DONE |
| 13 | 60–64 | Foundational Data Management | DONE |
| 14 | 65–69 | Foundational (2) + App Support (3) | DONE |
| 15 | 70–74 | Domain Support in Applications | DONE |

---

## Official samples embedded

1. Primary domain record truths (choose three) → B, C, D
2. Assignment group visibility domains (choose three) → B, C, D
3. Expand domain scope role → `domain_expand_scope`
4. Process-separated entity → Email Notifications
5. Default domain assignment mechanism → Business Rules
6. Update set record domain → source instance record domain

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-sp-v2-batch*.json
node scripts/lint-cis-sp-realism.mjs --orders=0-74
npm test -- --run src/convex/seed/cis-sp-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
npm run check
```

After merge: `npm run seed:dev:questions` to push to Convex.
