# ServiceNow exam question generation methodology

Doc-grounded practice items for Service Certify (SvelteKit + Convex). Use this with `tracks.config.json` and `validate.mjs`.

## Source of truth in this repo

| Concern | Location |
|---------|----------|
| Track publications + **exact domain names** | `src/lib/catalog/trackDocSources.ts` (mirrored in `tracks.config.json`) |
| Official counts + bank targets (+30) | `src/lib/catalog/examQuestionPolicy.ts` |
| Seeded practice bank | `src/convex/seed/devQuestionBank.ts` |
| Reviewable per-exam JSON banks | `question-gen/banks/<examSlug>.json` |
| Batch merge pipeline | `scripts/question-batches/` → `extract-questions-from-transcripts.mjs` |
| Structural gate | `npm run validate:questions` → `question-gen/validate.mjs` |

Domain names on questions **must** exactly match `domains[].name` in `trackDocSources.ts` / `tracks.config.json` (same names surface on exam pages via `exams.ts`).

## Grounding source

[ServiceNow/ServiceNowDocs](https://github.com/ServiceNow/ServiceNowDocs) — official docs as markdown, one branch per release family. Default family for this project: **`australia`**. Never scrape `servicenow.com/docs` (JS-only SPA).

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/ServiceNow/ServiceNowDocs.git
cd ServiceNowDocs
git sparse-checkout set markdown/<publication> markdown/<publication2>
# publications per track: question-gen/tracks.config.json
```

Prefer `canonical_url` from YAML frontmatter in `sourceUrls`. Cite a `markdown/<publication>/…` path in `source` when writing bank JSON.

## Generation workflow

1. Load the track in `tracks.config.json` (publications, domains, weights, `targetCount`).
2. Sparse-checkout its publications; harvest facts per domain (field names, roles, state models, cannot/must constraints).
3. Draft questions distributed by domain weight. Cognitive mix ≈ **40% recall / 40% application / 20% analysis**.
4. Self-review: answer each item cold before checking the key; rewrite if a second choice is defensible.
5. Write or update `question-gen/banks/<examSlug>.json`.
6. Run `npm run validate:questions` (or `node question-gen/validate.mjs <slug>`); fix errors and warnings.
7. Fact-check: grep local docs for the claim behind ≥30% of keys (100% for cannot/must/only); keep `source` / `sourceUrls` accurate.
8. Merge into the seed bank via existing batch tooling (`scripts/question-batches/` + merge script), then `npm test` / `npm run check`. Re-export banks with `node question-gen/export-banks.mjs` after seed updates.

## Bank JSON shape

```json
{
  "examSlug": "csa",
  "trackCode": "CSA",
  "docsFamily": "australia",
  "generatedAt": "YYYY-MM-DD",
  "questions": [
    {
      "order": 0,
      "prompt": "...",
      "choices": ["...", "...", "...", "..."],
      "correctIndex": 0,
      "domain": "<exact domain name>",
      "explanation": "...",
      "source": "markdown/<publication>/<file>.md",
      "sourceUrls": ["https://www.servicenow.com/docs/r/..."]
    }
  ]
}
```

Optional fields (when used in the live seed): `questionType` (`single` | `multi` | `match`), `correctIndexes`, `matchLeftItems`, `matchRightItems`, `correctMatches`, `contentDifficulty`.

## Item-writing rules (non-negotiable)

- Stem is a complete question; one concept per item; negatives (NOT/EXCEPT) ≤10% and capitalized.
- Exactly one defensible key, verbatim-alignable with a doc statement.
- Distractors: same grammatical form and similar length as the key; real platform terms or common misconceptions. Never “All/None of the above”; never invented features.
- Balance answer-key positions; do not let the correct answer be the longest choice in most items.
- Structural gate: key-position share ≤40% per index; longest-correct rate **&lt;85%** per track (same as `trackQuality.test.ts`).
- Explanation: why the key is right **and** why tempting distractors are wrong; cite behavior, not authority.
- Use current-family terminology (Workflow Studio, Next Experience); note legacy exam terms (Flow Designer, UI16) in explanations when relevant.
- **Compliance:** original items only — never copy Pearson VUE / confidential exams / brain dumps.

## Audit rubric (existing items)

Score each item 1–5 on:

1. **Accuracy** — key matches current docs family
2. **Single key** — only one defensible choice
3. **Distractor quality** — plausible, same form, not joke answers
4. **Blueprint fit** — domain name exact; weight distribution sensible
5. **Cognitive level** — recall / application / analysis as intended
6. **Explanation** — teaches why key vs distractors

Report findings with fix recommendations; never silently change answer keys without doc evidence.

## Quality gates already in-repo

After structural validation, the seeded bank must still pass:

- `src/convex/seed/trackQuality.test.ts` / `devQuestionBank.test.ts`
- Per-track `*Realism.ts` + `scripts/lint-*-realism.mjs`
- Choice-length balance scripts when merging batches
