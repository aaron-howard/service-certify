# Agent prompt: certification practice questions (dev bank)

Use this template when spinning up **one subagent per track** or **one subagent per batch of tracks** to expand the dev question bank in [`src/convex/seed/devQuestionBank.ts`](../../src/convex/seed/devQuestionBank.ts).

Track-to-publication mappings live in [`src/lib/catalog/trackDocSources.ts`](../../src/lib/catalog/trackDocSources.ts). Batch topic assignments for Phase 1 are in [`batch-assignments/phase1-csa-cad-cis-itsm.md`](batch-assignments/phase1-csa-cad-cis-itsm.md).

## Compliance

- **Do not** copy, paraphrase, or approximate questions from Pearson VUE, ServiceNow confidential exams, brain dumps, or paid prep sites.
- **Do** write **original** items grounded in **public** ServiceNow documentation.
- NOW Learning: use only **public** catalog or marketing pages—not content behind login.
- Each item must list **1–3 `sourceUrls`** pointing at specific public doc pages you used.

## Documentation source: ServiceNowDocs (required)

Use the [ServiceNow/ServiceNowDocs](https://github.com/ServiceNow/ServiceNowDocs) repository **`australia`** branch (latest release family). Do **not** scrape `servicenow.com/docs` directly—it is a JavaScript SPA that returns no readable content to LLMs.

1. Read assigned topic files before writing each question:
   `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown/{publication}/{file}.md`
2. Skip empty markdown files (known intermittent build issue in the repo).
3. Prefer `canonical_url` from the file's YAML frontmatter in `sourceUrls` (human-readable docs site). Fall back to the raw GitHub URL only when `canonical_url` is absent.
4. Use publication `index.md` TOCs to discover topic files when not explicitly assigned.

## Output shape (strict)

Return **only** a JSON array (no markdown fences) of objects:

```json
{
  "trackCode": "CSA",
  "order": 5,
  "prompt": "string",
  "choices": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "One or two sentences; why the correct option is right.",
  "sourceUrls": ["https://www.servicenow.com/docs/r/..."]
}
```

- `order` is **batch-assigned** (see batch assignment doc); must be unique per `trackCode`.
- `choices` must have **exactly four** strings.
- `correctIndex` must be `0`–`3`.
- Vary `correctIndex` across a batch; no duplicate topics within a batch.

## Question quality

Mix styles appropriate to the exam:

| Exam | Style |
|------|-------|
| **CSA** | Platform navigation, admin configuration, "what would an admin do", tables/roles/lists |
| **CAD** | Script scope, GlideRecord, app dev lifecycle, flows, scoped app security |
| **CIS-ITSM** | Implementation scenarios: incident/problem/change/catalog/CMDB, state transitions |

- Distractors must be **plausible** (common misconceptions), not joke answers.
- No "all of the above" or "none of the above".
- Ground every correct answer in content from the assigned markdown topics.

## Assignment template

> For certification track **`{TRACK_CODE}`** — **{OFFICIAL_NAME}**: read the assigned ServiceNowDocs markdown topics (see batch assignment). Produce **exactly five** original multiple-choice questions with `order` values **`{ORDER_START}`**–**`{ORDER_END}`**. Output the JSON array only.

Batch variant: list all `(trackCode, officialName, orderRange, topicUrls)` tuples for this batch, require **5 questions each**, single combined JSON array.

## Merge checklist (human or maintainer agent)

- [ ] Exactly **5** objects per `trackCode` in the batch (or count specified in batch assignment).
- [ ] All `correctIndex` values valid; no duplicate `order` per track.
- [ ] URLs are `https` and point to public docs (`canonical_url` preferred).
- [ ] Save batch JSON to `scripts/question-batches/` or merge via extract script.

## Merge commands

From repo root:

```bash
# Merge JSON batch files into devQuestionBank.ts (append + dedupe by trackCode+order)
node scripts/extract-questions-from-transcripts.mjs --merge-batches

# Merge specific batch files
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase1-batch1.json

# Legacy: regenerate entire bank from Cursor subagent .jsonl transcripts
node scripts/extract-questions-from-transcripts.mjs
```

Optional env vars for validation:

- `MIN_PER_TRACK` — minimum questions per track in merged output (default: no minimum)
- `MAX_PER_TRACK` — maximum questions per track (default: no maximum)
- `EXPECTED_PER_TRACK` — if set, every track in the batch must have exactly this count (legacy: `5`)
- `TRANSCRIPT_SUBAGENTS` — override path to subagent `.jsonl` folder

## Seed command

After updating the bank:

```bash
npm run seed:dev:questions
```

Requires a Convex deployment in `.env.local` (same as `npm run seed:dev`). Scripts use `convex run --push` so code is pushed before the internal mutation runs.
