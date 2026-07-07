# CIS-HAM standalone realism rework

Analysis-driven refresh of the **90-question** CIS-HAM bank (orders 0–89) to reduce definition recall, expand financial management, and add cloud, integration, and governance scenarios.

## Domain rebalance (90 questions)

| Domain | Before | After | Orders |
|--------|--------|-------|--------|
| IT Asset Management Overview and Fundamentals | 18 | **14** | 0–13 |
| Data Integrity Attributes and Data Sources | 24 | **20** | 14–33 |
| Practical Management of IT Assets | 27 | **23** | 34–56 |
| Operational Integration of IT Asset Management Processes | 16 | **22** | 57–78 |
| Financial Management of IT Assets | 5 | **11** | 79–89 |

## Priority 1 — Definition reframes

| Order | Change |
|-------|--------|
| 0 | ITAM program roadmap design |
| 1 | SAM-HAM-Cloud integration architecture |
| 4 | Five-year refresh lifecycle strategy |
| 6–7, 9 | Role separation, HAM vs base ITSM, plugin dependency scenarios |
| 10, 12–13, 15 | Model category, stockroom, bundle, lifecycle control scenarios |
| 18, 20–22, 24 | Asset vs CI, IRE, Success Advisor, normalization goals |
| 28–29, 41, 45, 49 | Normalization reporting, audit fields, category risk, consumable SKU strategy |
| 69 | Hardware Asset Workspace operational dashboard |

## Priority 2 — Financial management (orders 79–89)

| Order | Topic |
|-------|--------|
| 79 | Straight-line depreciation for 10,000 laptops |
| 80 | Department chargeback model |
| 81 | Operational expenses multi (official sample) |
| 82 | Three-year budget forecast |
| 83 | TCO-based refresh decision |
| 84 | Warranty ROI analysis |
| 85–89 | Retirement closure, reuse metrics, TCO elements, task rate cards, TCO benchmarks |

## Priority 3 — Cloud and modern assets (orders 75–76)

| Order | Topic |
|-------|--------|
| 75 | Hybrid VM tracking (AWS, Azure, on-premises) |
| 76 | SaaS seat coordination with HAM hardware |

## Priority 4 — Integration and implementation (orders 70–74)

| Order | Topic |
|-------|--------|
| 70 | SAM-HAM-Finance integration |
| 71 | Legacy asset data migration |
| 72 | CMDB synchronization strategy |
| 73 | Discovery scope and phasing |
| 74 | Go-live readiness assessment |

## Priority 5 — Governance and compliance (orders 77–78)

| Order | Topic |
|-------|--------|
| 77 | Owner, custodian, requestor roles |
| 78 | Secure disposal and certificate evidence |

## Infrastructure

- `scripts/tag-cis-ham-domains.mjs`
- `src/lib/catalog/cisHamRealism.ts` — domain quotas, ≥65% scenario ratio, banned definition stems
- `src/convex/seed/cis-ham-realism.test.ts` — domain + scenario validation

## Merge and validate

```bash
node scripts/tag-cis-ham-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-ham-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-ham-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-ham-realism.test.ts src/convex/seed/trackQuality.test.ts
```
