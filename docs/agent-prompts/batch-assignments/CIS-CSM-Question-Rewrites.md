# CIS-CSM realism rewrites (Jul 2026)

Reference for the standalone realism refresh from the CIS-CSM analysis (8/10 → 9+/10 target).

## Priority 1 — definition recall → scenarios

| Order | Before | After |
|-------|--------|-------|
| 2 | Portal role name recall (multi) | B2B contact vs B2C consumer portal and role pairing |
| 6 | Install base definition | Field team vs e-commerce: install base vs sold product |
| 11 | Entitlement role definition | Account hierarchy for global/regional rollup |
| 37 | Default AWA criterion trivia | Tune Assigned Cases to spread workload |
| 56 | Special handling applies-to setting | Restrict sensitive notes to authorized agents |

## Priority 2 — critical topic gaps (in-place replacements)

| Order | Topic added |
|-------|-------------|
| 13 | Install base vs sold product configuration decision |
| 22 | Entitlement SLA for selective product coverage |
| 34 | Inbound email sender matching / orphan case prevention |
| 39 | Omnichannel service channel capacity limits |
| 75 | Portal page and widget layout customization |
| 77 | Portal theme and branding |
| 79 | Performance Analytics KPI for entitlement SLA breaches |

## Priority 3 — entitlement cluster redistribution

Spread entitlement focus across foundational orders instead of five consecutive definition-style items:

| Orders | Focus after redistribution |
|--------|----------------------------|
| 10, 12, 14 | Contract coverage, eligibility, multi-entitlement selection |
| 11, 13 | Account hierarchy and product instance modeling |
| 22 | Entitlement SLA scenario |

## Domain tags

```bash
node scripts/tag-cis-csm-domains.mjs
```

## Validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-csm-v2-batch*.json
node scripts/lint-cis-csm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-csm-realism.test.ts
```

## Priority 4 — plausible distractor polish

Replaced obviously wrong filler distractors (spreadsheets, theme pickers, delete-case options, unrelated modules) with **plausible CSM design alternatives** — wrong answers that reflect real configuration choices agents might confuse.

| Orders | Distractor theme |
|--------|------------------|
| 6, 11, 23 | Product instance modeling and account alert mechanisms |
| 40, 42, 45–48 | AWA, playbooks, form actions, assignment design |
| 55–57, 59 | Special handling vs on-screen alerts; lifecycle transitions |
| 62–64, 67 | Escalation, case tasks, entitlement influence |
| 70–73, 75–79 | Workspace, portal, PA, and dashboard alternatives |
| 83, 87 | Knowledge quality and Now Assist vs legacy tooling |
