# CIS-EM standalone realism rework

Analysis-driven refresh of the **60-question** CIS-EM bank (orders 0–59) to reduce definition-recall items and add advanced deployment scenarios.

## Domain rebalance (60 questions)

| Domain | Before | After | Orders |
|--------|--------|-------|--------|
| Event Management Overview | 4 | 4 | 0–3 |
| Architecture and Discovery | 6 | **9** | 4–12 |
| Event Configuration and Use | 16 | 16 | 13–28 |
| Alerts and Tasks | 18 | **15** | 29–43 |
| Event Sources | 10 | 10 | 44–53 |
| Metric Intelligence | 6 | 6 | 54–59 |

## Priority 1 — Definition reframes

| Order | Change |
|-------|--------|
| 1 | Multi-source consolidation with conflicting severity scales |
| 6 | MID Server bridge scenario for private-network monitoring |
| 8 | Multi-source outage processing path scenario |
| 10–12 | Architecture: multi-source normalization, MID failover, high-volume listeners |
| 15 | Polling minimum constraint scenario (120-second floor) |
| 20 | CI binding failure troubleshooting scenario |
| 25 | Heartbeat suppression via event rules (not module recall) |
| 48 | Push vs pull architecture decision |
| 51 | Email-only monitoring ingestion design |
| 53 | DMZ push-via-MID architecture |
| 54–56 | Metric Intelligence at scale and outlier scenarios |

## Priority 2 — Advanced deployment (orders 10–12, 26–28, 32, 35)

| Order | Topic |
|-------|--------|
| 10 | Three monitoring tools with different severity scales |
| 11 | MID Server failover during traffic spike |
| 12 | High-volume SNMP listener throughput tuning |
| 26 | Multi-source severity normalization |
| 27 | Maintenance window impact suppression |
| 28 | Message key deduplication for repeated traps |
| 32 | False parent alert grouping tuning |
| 35 | Cross-service impact propagation troubleshooting |

## Priority 3 — Resilience and scale

- Orders 9, 11: redundant listener architecture (existing + enhanced)
- Order 12: listener backlog under 50k traps/hour
- Order 55: Metric Intelligence at 3,000 series scale
- Order 18: connector change governance (retained)

## Infrastructure

- `scripts/tag-cis-em-domains.mjs`
- `src/lib/catalog/cisEmRealism.ts` — domain quotas, ≥65% scenario ratio, banned definition stems
- `src/convex/seed/cis-em-realism.test.ts` — domain + scenario validation

## Merge and validate

```bash
node scripts/tag-cis-em-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-em-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-em-realism.mjs --orders=0-59
npm test -- --run src/convex/seed/cis-em-realism.test.ts src/convex/seed/trackQuality.test.ts
npm run check
```
