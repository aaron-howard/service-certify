---
name: servicenow-exam-question-gen
description: >-
  Generate or audit doc-grounded ServiceNow certification practice-exam questions
  for the Service Certify app (banks in question-gen/banks/, seeded via
  gitignored src/convex/seed/devQuestionBank.private.ts). Use when asked to write, expand, review,
  or validate exam question banks for any of the 22 certification tracks.
---

# ServiceNow Exam Question Generator

Generate high-quality, doc-grounded certification practice questions for Service Certify (SvelteKit + Convex), and audit existing banks.

## Project layout

- `question-gen/METHODOLOGY.md` ΓÇö full methodology; **read it first**.
- `question-gen/tracks.config.json` ΓÇö all 22 tracks: doc publications, exact domain names, target counts, keywords (mirrored from `trackDocSources.ts` + `examQuestionPolicy.ts`).
- `question-gen/validate.mjs` ΓÇö structural gate. Run `npm run validate:questions` (or `node question-gen/validate.mjs <slug>`). Use `--seed` to validate the private bank directly.
- `question-gen/banks/<examSlug>.json` ΓÇö one bank per exam slug (export with `npm run export:question-banks`).
- `src/convex/seed/devQuestionBank.private.ts` ΓÇö gitignored live seed bank consumed by Convex (`npm run seed:dev:questions`). See `src/convex/seed/QUESTION_BANK.md`.
- Domain names on questions MUST exactly match `domains[].name` in `tracks.config.json` / `src/lib/catalog/trackDocSources.ts`.

## Grounding source

[ServiceNow/ServiceNowDocs](https://github.com/ServiceNow/ServiceNowDocs) ΓÇö official docs as markdown, branch per release family (`australia` default). Never scrape servicenow.com/docs (JS-only SPA).

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/ServiceNow/ServiceNowDocs.git
cd ServiceNowDocs
git sparse-checkout set markdown/<publication> markdown/<publication2>
```

Publications per track are in `tracks.config.json`. Grep checked-out markdown for domain keywords to collect testable facts.

## Generation workflow

1. Load the trackΓÇÖs config (publications, domains, weights, targetCount).
2. Sparse-checkout its publications; harvest facts per domain.
3. Draft questions distributed by domain weight. Cognitive mix Γëê 40% recall / 40% application / 20% analysis.
4. Self-review: answer each item cold before checking your key; rewrite if a second choice is defensible.
5. Write/update `question-gen/banks/<examSlug>.json` (see METHODOLOGY.md for shape).
6. Run the validator; fix all errors and warnings.
7. Fact-check ΓëÑ30% of keys against local docs (100% for cannot/must/only); cite `source` / `sourceUrls`.
8. Merge into the seed via `scripts/question-batches/` + `extract-questions-from-transcripts.mjs`, then `npm test`. Re-export banks after seed updates.

## Item-writing rules (non-negotiable)

- Stem is a complete question; one concept per item; negatives (NOT/EXCEPT) Γëñ10% and capitalized.
- Exactly one defensible key, verbatim-alignable with a doc statement.
- Distractors: same grammatical form and similar length; real platform terms or common misconceptions. Never All/None of the above; never invented features.
- Balance answer-key positions; correct answer must not be the longest choice in most items.
- Explanation required: why the key is right AND why tempting distractors are wrong.
- Original items only ΓÇö never copy Pearson VUE, confidential exams, or brain dumps.

## Audit workflow

For each item: verify the key against docs, score against the METHODOLOGY.md rubric, check terminology drift vs. the current docs family, and confirm `domain` matches the blueprint. Report findings with fix recommendations; never silently change answer keys without doc evidence.
