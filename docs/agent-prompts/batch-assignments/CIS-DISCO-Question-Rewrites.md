# CIS-DISCO standalone realism rework

Analysis-driven refresh of the **75-question** CIS-DISCO bank (orders 0–74) to close CMDB integration and engagement readiness gaps while preserving strong pattern/configuration scenario coverage.

## Domain rebalance (75 questions)

| Domain | Old | New | Orders |
|--------|-----|-----|--------|
| Discovery Pattern Design | 26 | **23** | 0–22 |
| Discovery Configuration | 26 | **22** | 23–44 |
| Configuration Management Database | 11 | **15** | 45–59 |
| Discovery Engagement Readiness | 12 | **15** | 60–74 |

## Priority 1 — CMDB integration (orders 45–59)

| Order | Change |
|-------|--------|
| 45 | First-run duplicate prevention via IRE identification (SCCM serial match) |
| 46 | CMDB Health completeness regression after new schedule |
| 47 | Reconciliation source precedence for discovery vs import OS version |
| 48 | Duplicate hostname remediation with deduplication |
| 49 | Multi: CMDB Health sign-off metrics (completeness + duplicates) |
| 50 | IRE troubleshooting when sensor payload produces no CI |
| 51 | Foundation class validation before broad schedules |
| 52–54 | Reframed CI Class Manager, IRE match, reconciliation scenarios |
| 55–57 | Retained precedence, overlapping schedule dedup, IRE multi |
| 58 | CMDB Health degradation signals |
| 59 | CMDB governance for identification key changes |

## Priority 2 — Advanced configuration (orders 38–40)

| Order | Change |
|-------|--------|
| 38 | Kubernetes + hybrid cloud/container discovery strategy |
| 39 | Performance tuning for timeout-heavy subnet schedules |
| 40 | Cloud discovery schedule (AWS/Azure API) moved from old order 45 |

## Priority 3 — Definition → scenario reframes

| Order | Before | After |
|-------|--------|-------|
| 3 | Identification section role | Tomcat app vs OS CI decision scenario |
| 30 | Schedule definition recall | Multi-subnet scheduling with operational windows |
| 31 | IP Services definition | Port 8080 Tomcat classification strategy |
| 32 | Phase sequence recall | Missing exploration after successful classification |
| 43 | CI Identifier count recall | Duplicate CI from extra identifier — correct config |

## Priority 4 — Engagement readiness (orders 60–62)

| Order | Change |
|-------|--------|
| 60 | Pre-launch impact assessment (probe volume, firewalls, change windows) |
| 61 | KPI definition (completeness, accuracy, failure rates) |
| 62 | Cutover validation after pilot before full scope |

## Infrastructure

- `scripts/tag-cis-disco-domains.mjs` — domain tags on batch JSON
- `src/lib/catalog/cisDiscoRealism.ts` — domain quotas, scenario ratio (≥65%), banned definition stems
- `src/convex/seed/cis-disco-realism.test.ts` — domain + scenario validation

## Merge and validate

```bash
node scripts/tag-cis-disco-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-disco-v2-batch*.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cis-disco-realism.mjs --orders=0-74
npm test -- --run src/convex/seed/cis-disco-realism.test.ts src/convex/seed/cis-disco.test.ts src/convex/seed/trackQuality.test.ts
npm run check
```
