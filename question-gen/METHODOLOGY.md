# Service Certify — exam question methodology

This document governs generation and audit of practice-exam items for all 22 certification tracks.

## Sources of truth

| Artifact | Role |
|----------|------|
| `question-gen/tracks.config.json` | Publications, exact domain names, weights, bank targets |
| `src/lib/catalog/trackDocSources.ts` | Canonical domain/publication map (config is mirrored from here) |
| `src/lib/catalog/examQuestionPolicy.ts` | Official exam counts and bank buffer (+30) |
| `src/convex/seed/devQuestionBank.ts` | Live seed bank consumed by Convex |
| `question-gen/banks/<slug>.json` | Exported per-track banks for review (optional) |
| ServiceNowDocs (`australia`) | Doc grounding — never scrape servicenow.com/docs SPA |

## Bank targets

Per-track bank size = **official exam question count + 30**. Mock exams serve the official count.

## Item shape (seed)

```json
{
  "trackCode": "CIS-VR",
  "order": 0,
  "prompt": "...",
  "choices": ["...", "...", "...", "..."],
  "correctIndex": 0,
  "explanation": "...",
  "sourceUrls": ["https://www.servicenow.com/docs/r/..."],
  "domain": "<exact blueprint domain name>"
}
```

Optional fields: `questionType` (`single` default, `multi`, `match`), `correctIndexes`, match columns.

## Cognitive mix

Aim ≈ **40% recall / 40% application / 20% analysis-troubleshooting**.

Application stems: role + goal + constraint. Analysis stems: symptom → diagnose → next action.

## Item-writing rules

1. Stem is a complete question; one concept per item.
2. Negatives (`NOT` / `EXCEPT`) ≤10% of the track and capitalized.
3. Exactly one defensible key, verbatim-alignable with a doc statement.
4. Distractors: same grammatical form and similar length; real platform terms or common misconceptions. Never All/None of the above; never invented features.
5. Balance answer-key positions across indices (no index >40% of MC items).
6. Correct answer must not be the longest choice on >50% of MC items (hard gate in validator; seed tests allow <85%).
7. Explanation: why the key is right **and** why tempting distractors are wrong.
8. Cite 1–3 public `sourceUrls` (prefer `canonical_url` from ServiceNowDocs frontmatter).
9. Original items only — never copy Pearson VUE, confidential exams, or brain dumps.
10. Domain names must exactly match `tracks.config.json` / `trackDocSources.ts`.

## Rubric (audit scoring)

Score each item 0–2 on:

| Criterion | 2 | 1 | 0 |
|-----------|---|---|---|
| Accuracy | Key matches current docs | Soft / outdated wording | Wrong or invented |
| Single key | Only one defensible choice | Second choice arguable | Multiple keys |
| Distractor quality | Plausible same-area terms | Weak but on-topic | Joke / invented / All-of-above |
| Blueprint fit | Correct domain + weight area | Adjacent domain | Off-blueprint |
| Cognitive level | Clear recall/app/analysis intent | Ambiguous | Trivial trivia only |
| Explanation | Key + distractors justified | Key only | Missing / circular |

Rewrite any item scoring 0 on accuracy or single key. Prefer rewrite over silent key flips; never change a key without doc evidence.

## Workflow

### Generate

1. Load track config (publications, domains, weights, targetCount).
2. Sparse-checkout publications from ServiceNowDocs `australia`.
3. Harvest testable facts per domain (roles, states, constraints, field names).
4. Draft to domain quotas; self-review cold before locking keys.
5. Write batch JSON under `scripts/question-batches/`.
6. Merge: `node scripts/extract-questions-from-transcripts.mjs --merge-batches <files>`.
7. Rebalance choice order: `node scripts/rebalance-question-choices.mjs --track=<CODE>`.
8. Length-balance if needed: `node scripts/balance-choice-lengths.mjs`.
9. Validate: `npm run validate:questions -- <slug>` (or `--seed`).
10. Run track realism lint + `npm test`.

### Audit

1. Run `npm run validate:questions -- --seed` for structural gates.
2. Grep local docs for ≥30% of keys (100% of cannot/must/only claims).
3. Score against the rubric; record findings with fix recommendations.
4. Apply fixes via `*-fix-batch*.json` merges; re-validate.

## Validator gates (`question-gen/validate.mjs`)

| Gate | Threshold |
|------|-----------|
| Key-position bias | Any index >40% of MC items → error |
| Longest-answer bias | Correct is longest on >50% of MC items → warning; >85% → error |
| Duplicate choice text within track | error |
| Banned patterns (All/None of the above, rebalance tags) | error |
| Domain name mismatch vs config | error |
| Missing explanation / sourceUrls | error |
| Negatives share | >10% → warning |

## Docs access

```bash
git clone --depth 1 --filter=blob:none --sparse -b australia \
  https://github.com/ServiceNow/ServiceNowDocs.git
cd ServiceNowDocs
git sparse-checkout set markdown/<publication> ...
```

Note: some track “publications” in config are logical product areas nested under a parent folder (e.g. VR content lives under `markdown/security-management/vulnerability-response/`).
