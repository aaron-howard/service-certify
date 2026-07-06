# CIS-DF Priority 1 question rewrites (Jul 2026)

Reference for the realism refresh applied to orders flagged in the CIS-DF analysis.

## Rewrite pattern

| Weak style | Strong style |
|------------|--------------|
| "What field syncs?" | Asset lifecycle scenario → which CI fields update |
| "What's the job name?" | PA widget empty → which capability feeds trends |
| "What is the design principle?" | New Linux class needs inherited fields → extend parent |
| Match placeholders (First/Second) | Real playbook section names matched to purposes |

## Orders updated

| Order | Before | After |
|-------|--------|-------|
| 1 | Design principle recall | Linux server class must inherit shared fields → extend parent |
| 8 | CMDB 360 enablement steps (clustered) | Identification exclusion for noisy LB names |
| 10 | `cmdb_multisource_data` table trivia | Why integrations must route through IRE |
| 21 | Bare Discovery source recall | Audit scenario → Manual via IRE for Create CI |
| 28 | Bare asset sync fields | Finance retires laptop asset → Install/Hardware Status |
| 50 | Correctness metric label | CMDB 360 enablement prerequisites (spread from 6–10 cluster) |
| 60 | Exact PA job name | Capability-based PA trending for Data Foundations |
| 78 | Saved queries multi | SCCM rejected hostname → CMDB 360 audit view |
| 84 | First/Second/Third/Fourth placeholders | Real playbook section names → purpose descriptions |

## CMDB 360 redistribution

- **Kept at order 6:** CMDB 360 workspace view for per-source attribute comparison (scenario)
- **Moved enablement to order 50:** Govern domain, away from orders 6–10 cluster
- **Moved audit trail to order 78:** Insight domain, rejected SCCM proposal review
- **Replaced orders 8 & 10:** Configuration scenarios (exclusion rules, IRE routing)

## Domain tags

Every batch JSON question now includes `"domain": "Configuration" | "Ingest" | "Govern" | "Insight" | "CSDM Fundamentals"` based on official order quotas. Re-tag after reordering:

```bash
node scripts/tag-cis-df-domains.mjs
```

## Validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-df-v2-batch*.json
node scripts/lint-cis-df-realism.mjs --orders=0-104
npm test -- --run src/convex/seed/cis-df-realism.test.ts
```

## Priority 2 rewrites (Jul 2026)

### Troubleshooting scenarios (5)

| Order | Domain | Scenario |
|-------|--------|----------|
| 31 | Ingest | SCCM hostname reverts after import → review reconciliation precedence |
| 32 | Ingest | Staging rows present but no target CI updates → transform/coalesce check |
| 51 | Govern | Recurring duplicate Linux servers after SCCM → tune identification keys |
| 58 | Govern | Health lists duplicates but Remediator merges none → key/class eligibility |
| 68 | Govern | Weak hostname coalesce creates duplicates → stable identifier alignment |

### Service Mapping expansion (3)

| Order | Domain | Scenario |
|-------|--------|----------|
| 17 | Ingest | Missing entry point leaves map disconnected |
| 73 | Insight | High completeness but orphaned DB tier → dependency relationships |
| 91 | Insight | Unified Map missing middleware hops → Service Mapping context |

### CSDM integrated with configuration (4)

| Order | Before | After |
|-------|--------|-------|
| 95 | Domain structure recall | Finance maps to generic cmdb_ci → Build Business Application |
| 96 | Adoption benefits recall | P1 on DB CI with no business service → service hierarchy link |
| 97 | Generic phased approach | HR foundation before application service feed |
| 100 | Roadmap sequencing recall | Class extension + portfolio workshop → foundation then Design/Planning |

## Priority 3 polish (Jul 2026)

### URL spot-check

All **45** unique CIS-DF `sourceUrls` verified HTTP 200 (Jul 2026). Re-run stratified sample:

```bash
node scripts/spot-check-cis-df-urls.mjs           # 10 URLs, one per domain bucket
node scripts/spot-check-cis-df-urls.mjs --all     # full unique set
```

Lint enforces `https://www.servicenow.com/docs/r/` prefix in `cisDfRealism.ts`.

### Content difficulty tags

Each batch question includes `"contentDifficulty": "Foundation" | "Intermediate" | "Advanced"` for self-assessment:

| Level | Typical content |
|-------|-----------------|
| Foundation | Match items, intro configuration, official sample-style items |
| Intermediate | Scenario application, multi-select governance, CSDM integration |
| Advanced | Troubleshooting, CMDB 360, Service Mapping gaps, KPI escalation |

Re-tag after reorder:

```bash
node scripts/tag-cis-df-difficulty.mjs
```

Target mix: ~24% Foundation, ~61% Intermediate, ~15% Advanced (minimum enforced in realism tests).
