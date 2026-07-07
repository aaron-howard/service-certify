# CIS-HR standalone realism rework

Analysis-driven refresh of the **90-question** CIS-HR bank (orders 0–89) to deepen HR Journeys design, integration planning, implementation readiness, and advanced HR use cases.

## Domain rebalance (90 questions)

| Domain | Before | After | Orders |
|--------|--------|-------|--------|
| HR System Architecture | 27 | **22** | 0–21 |
| Core HR Applications and Employee Center | 27 | **32** | 22–53 |
| HR Journeys | 18 | **18** | 54–71 |
| Platform, Role, and Contextual Security | 18 | **5** | 72–76 |
| Integration Strategy | ~5 | **9** | 77–85 |
| Implementation and Change Management | 0 | **4** | 86–89 |

## Priority 1 — Technical definition reframes

| Order | Change |
|-------|--------|
| 0–4 | Scoped app structure, integration scope, lifecycle scope, HR case workflow, profile attributes |
| 5, 8, 11, 14 | Task hierarchy, HR service modeling, fulfillment tasks, lifecycle record placement |
| 39, 50, 54 | Manager dashboard, case participant design, milestone onboarding |
| 73 | Contextual security scenario |

## Priority 2 — HR Journeys depth (orders 54–71)

| Order | Topic |
|-------|--------|
| 55–57, 59 | Activity sets, triggers, promotion activities, field mappings |
| 65 | Multinational lifecycle templates |
| 67 | Workflow Studio integration |
| 70 | Journey completion metrics |

## Priority 3 — Integration strategy (orders 77–85)

| Order | Topic |
|-------|--------|
| 77 | Payroll synchronization |
| 78 | Benefits enrollment integration |
| 79 | HRIS synchronization phasing |
| 80 | Import reconciliation and data quality |
| 82 | Integration error handling |
| 83 | Multi-country HR design |
| 84 | Benefits eligibility enforcement |
| 85 | Talent and succession case pattern |

## Priority 4 — Implementation and change (orders 86–89)

| Order | Topic |
|-------|--------|
| 86 | Five-region rollout phasing |
| 87 | Go-live readiness milestones |
| 88 | COE governance structure |
| 89 | Legacy HRIS migration and training |

## Infrastructure

- `scripts/tag-cis-hr-domains.mjs`
- `src/lib/catalog/cisHrRealism.ts` — domain quotas, ≥65% scenario ratio, banned definition stems
- `src/convex/seed/cis-hr-realism.test.ts` — domain + scenario validation

## Merge and validate

```bash
node scripts/tag-cis-hr-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-hr-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-hr-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-hr-realism.test.ts src/convex/seed/trackQuality.test.ts
```
