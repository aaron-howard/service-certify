# CIS-PA standalone realism rework

Analysis-driven refresh of the **90-question** CIS-PA bank (orders 0–89) to deepen KPI design, data governance, advanced analytics, and strategic scenario coverage.

## Domain rebalance (90 questions)

| Domain | Before | After | Orders |
|--------|--------|-------|--------|
| Architecture and Deployment | 9 | **9** | 0–8 |
| KPI Design and Strategy | 0 | **10** | 9–18 |
| Configure Indicators and Indicator Sources | 23 | **15** | 19–33 |
| Configure Breakdowns and Breakdown Sources | 22 | **15** | 34–48 |
| Data Collection | 9 | **9** | 49–57 |
| Data Governance and Quality | 0 | **7** | 58–64 |
| Data Visualization and Dashboards | 23 | **15** | 65–79 |
| Advanced Analytics | 0 | **6** | 80–85 |
| Administration and Advanced Solutions | 4 | **4** | 86–89 |

## Priority 1 — Configuration to strategy reframes

| Order | Change |
|-------|--------|
| 0–1 | KPI framework and strategy design |
| 45 | Breakdown dimension strategy |
| 47 | Scorecard optimization |

## Priority 2 — KPI design and strategy (orders 9–18)

| Order | Topic |
|-------|--------|
| 9 | KPI Composer alignment (batch 2) |
| 10–14 | SMART KPIs, balanced scorecard, leading/lagging, workshops, validation |
| 15–18 | Business case, ownership, roadmap, stakeholder alignment |

## Priority 3 — Data governance (orders 58–64)

| Order | Topic |
|-------|--------|
| 58 | Historic backfill data quality (official sample preserved) |
| 59–64 | Source validation, roles, reconciliation, reliability, compliance |

## Priority 4 — Advanced analytics (orders 80–85)

| Order | Topic |
|-------|--------|
| 80 | Forecasting and trends |
| 81 | Anomaly detection |
| 82 | Comparative/benchmark analytics |
| 83 | Predictive workload signals |
| 84–85 | AI-assisted insight and trend analysis |

## Infrastructure

- `scripts/tag-cis-pa-domains.mjs`
- `src/lib/catalog/cisPaRealism.ts` — domain quotas, ≥65% scenario ratio, banned definition stems
- `src/convex/seed/cis-pa-realism.test.ts` — domain + scenario validation

## Merge and validate

```bash
node scripts/tag-cis-pa-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-pa-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-pa-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-pa-realism.test.ts src/convex/seed/trackQuality.test.ts
```
