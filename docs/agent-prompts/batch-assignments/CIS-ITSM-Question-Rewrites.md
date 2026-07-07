# CIS-ITSM standalone realism rework

Analysis-driven refresh of the **90-question** CIS-ITSM bank (orders 0–89) to shift configuration recall toward strategic decisions and expand SPM, CMDB, and implementation coverage.

## Domain rebalance (90 questions)

| Domain | Before | After | Orders |
|--------|--------|-------|--------|
| Incident Management | 23 | **20** | 0–19 |
| Problem Management | 14 | **14** | 20–33 |
| Change Management | 23 | **16** | 34–49 |
| Service Portfolio Management | 5 | **9** | 50–58 |
| Service Catalog and Request Management | 23 | **16** | 59–74 |
| Configuration Management Database | 5 | **11** | 75–85 |
| Implementation and Strategy | 0 | **4** | 86–89 |

## Priority 1 — Configuration to strategy reframes

| Order | Change |
|-------|--------|
| 0 | Incident closure strategy design |
| 3 | Priority matrix design |
| 20 | Problem New→Assess workflow design |
| 45 | Change schedule access model |
| 47 | Multi-CI schedule scope design |
| 52, 54 | SPM governance and read access design |
| 76 | CMDB class governance model |

## Priority 2 — Problem management depth

| Order | Topic |
|-------|--------|
| 20–24 | Assessment workflow, recurring incidents, known errors, change linkage |
| 80–84 (prior) | Cross-process promotion retained in CMDB batch remap |

## Priority 3 — Service Portfolio Management (orders 50–58)

| Order | Topic |
|-------|--------|
| 50–54 | Portfolio scope, offerings, governance, taxonomy, viewer access |
| 55–58 | Portfolio strategy, lifecycle, ROI, health analytics |

## Priority 4 — CMDB integration (orders 75–85)

| Order | Topic |
|-------|--------|
| 75–79 | CMDB purpose, governance, manual CI, managed by group, Health/IRE |
| 80–85 | Data governance, reconciliation, dependencies, incident/change integration, CI retirement |

## Priority 5 — Implementation and strategy (orders 86–89)

| Order | Topic |
|-------|--------|
| 86 | Multi-region ITSM rollout phasing |
| 87 | Data migration and reconciliation |
| 88 | KPI definition |
| 89 | Process governance and adoption |

## Infrastructure

- `scripts/tag-cis-itsm-domains.mjs`
- `src/lib/catalog/cisItsmRealism.ts` — domain quotas, ≥65% scenario ratio, banned definition stems
- `src/convex/seed/cis-itsm-realism.test.ts` — domain + scenario validation

## Merge and validate

```bash
node scripts/tag-cis-itsm-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-itsm-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-itsm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-itsm-realism.test.ts src/convex/seed/trackQuality.test.ts
```
