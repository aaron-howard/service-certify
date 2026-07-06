# CIS-FSM standalone realism rework

Analysis-driven refresh of the **90-question** CIS-FSM bank (orders 0–89) to deepen implementation planning, related-process integration, scheduling, and parts coverage.

## Domain rebalance (90 questions)

| Domain | Before | After | Orders |
|--------|--------|-------|--------|
| Field Service Management Fundamentals | 37 | **30** | 0–29 |
| Implementation Planning | 3 | **10** | 30–39 |
| Implementing Field Service Processes | 47 | **40** | 40–79 |
| Implementing Related Processes | 3 | **10** | 80–89 |

## Priority 1 — Definition reframes

| Order | Change |
|-------|--------|
| 0 | Group structure design for qualification vs dispatch alignment |
| 2 | Multi-location, multi-skill work order task structure |
| 10, 12–14 | Qualification, work group, and role setup scenarios |
| 15 | Territory boundary design scenario |
| 50 | Template standardization for 1,000+ recurring jobs |

## Priority 2 — Implementation planning (orders 30–39)

| Order | Topic |
|-------|--------|
| 30 | Five-region rollout for 500 technicians |
| 31 | Cutover readiness milestones |
| 32 | Data migration with normalization and geocoding QA |
| 33 | Cutover risk mitigation (territories, offline mobile) |
| 34 | Post-go-live KPI definition |
| 35 | Change management and technician adoption |
| 36 | Pilot phase validation before national rollout |
| 37–39 | Licensing, Guided Setup, persona/group workshops |

## Priority 3 — Parts and inventory

| Order | Topic |
|-------|--------|
| 25 | Warehouse-to-van replenishment from scheduled parts demand |
| 26 | Part consumption on completed repairs |
| 58 | Returnable parts restocking workflow |
| 84 | Billable vs non-billable parts consumption |

## Priority 4 — Scheduling and optimization

| Order | Topic |
|-------|--------|
| 44 | Initial schedule creation vs intra-day re-optimization |
| 45–46 | Intra-day optimization and sick-call reassignment |
| 47 | No matching agents — dispatcher exception handling |
| 48 | Automated engine capabilities (multi) |

## Priority 5 — Related process integration (orders 80–89)

| Order | Topic |
|-------|--------|
| 80 | Incident-to-work-order escalation |
| 81 | Asset lifecycle and maintenance plans |
| 82 | Contractor onboarding and certifications |
| 83 | Personnel rostering and availability |
| 84 | Parts billing controls |
| 85–89 | Maintenance plans, first-time fix KPI, customer experience, virtual agent, offline caching |

## Infrastructure

- `scripts/tag-cis-fsm-domains.mjs`
- `src/lib/catalog/cisFsmRealism.ts` — domain quotas, ≥65% scenario ratio, banned definition stems
- `src/convex/seed/cis-fsm-realism.test.ts` — domain + scenario validation

## Merge and validate

```bash
node scripts/tag-cis-fsm-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-fsm-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-fsm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-fsm-realism.test.ts src/convex/seed/trackQuality.test.ts
npm run check
```
