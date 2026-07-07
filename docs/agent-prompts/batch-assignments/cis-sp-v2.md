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

## Exam domain quotas (75 questions, Jul 2026 realism rework)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Initial Domain Setup and Service Provider Architecture | 7% | 5 | 0–4 |
| 2 | MSP Operations Strategy | 11% | 8 | 5–12 |
| 3 | Customer Onboarding and Tenant Lifecycle | 9% | 7 | 13–19 |
| 4 | Data Separation/Visibility | 20% | 15 | 20–34 |
| 5 | Process Separation | 25% | 19 | 35–53 |
| 6 | Foundational Data Management | 15% | 11 | 54–64 |
| 7 | Domain Support in Applications | 13% | 10 | 65–74 |

Realism rework additions (Jul 2026): MSP business model, customer segmentation,
SLA governance across domains, billing/chargeback attribution, onboarding
workflows, tenant lifecycle (create/customize/decommission/migrate), Service
Portal mitigation, and custom scoped app domain awareness.

---

## Question style

- Technical voice for domain-separated Service Provider administrators, architects, and consultants.
- Focus on `sys_domain`, visibility groups, contains relationships, `sys_overrides`, process vs data separation, imports/transforms, per-application domain support levels, MSP operating model decisions, and tenant lifecycle management.
- ≥70% scenario-style prompts (MSP, provider, tenant, and customer framing).
- Banned: template wrappers and generic "primary purpose" stems.

---

## Batches (15 × 5 = 75)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Initial Domain Setup and SP Architecture | DONE |
| 2 | 5–9 | MSP Operations Strategy | DONE |
| 3 | 10–14 | MSP Strategy (3) + Onboarding (2) | DONE |
| 4 | 15–19 | Customer Onboarding and Tenant Lifecycle | DONE |
| 5 | 20–24 | Data Separation/Visibility | DONE |
| 6 | 25–29 | Data Separation/Visibility | DONE |
| 7 | 30–34 | Data Separation/Visibility | DONE |
| 8 | 35–39 | Process Separation | DONE |
| 9 | 40–44 | Process Separation | DONE |
| 10 | 45–49 | Process Separation | DONE |
| 11 | 50–54 | Process (4) + Foundational (1) | DONE |
| 12 | 55–59 | Foundational Data Management | DONE |
| 13 | 60–64 | Foundational Data Management | DONE |
| 14 | 65–69 | Domain Support in Applications | DONE |
| 15 | 70–74 | Domain Support in Applications | DONE |

---

## Official samples embedded

1. Primary domain record truths (choose three) → order 4
2. Assignment group visibility domains (choose three) → order 22
3. Expand domain scope role → `domain_expand_scope` → order 23
4. Process-separated entity → Email Notifications → order 39
5. Default domain assignment mechanism → Business Rules → order 43
6. Update set record domain → source instance record domain → order 48

---

## Merge and validate

```bash
node scripts/tag-cis-sp-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-sp-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-sp-realism.mjs --orders=0-74
npm test -- --run src/convex/seed/cis-sp-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
npm run check
```

After merge: `npm run seed:dev:questions` to push to Convex.
