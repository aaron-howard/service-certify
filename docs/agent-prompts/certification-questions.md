# Agent prompt: certification practice questions (dev bank)

Use this template when spinning up **one subagent per track** or **one subagent per batch of tracks** to expand the dev question bank in [`src/convex/seed/devQuestionBank.ts`](../../src/convex/seed/devQuestionBank.ts).

## Compliance

- **Do not** copy, paraphrase, or approximate questions from Pearson VUE, ServiceNow confidential exams, brain dumps, or paid prep sites.
- **Do** write **original** items grounded in **public** ServiceNow documentation (prefer [docs.servicenow.com](https://www.servicenow.com/docs/)).
- NOW Learning: use only **public** catalog or marketing pages—not content behind login.
- Each item must list **1–3 `sourceUrls`** pointing at specific public doc pages or sections you used.

## Output shape (strict)

Return **only** a JSON array (no markdown fences) of objects:

```json
{
  "trackCode": "CSA",
  "order": 0,
  "prompt": "string",
  "choices": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "One or two sentences; why the correct option is right.",
  "sourceUrls": ["https://www.servicenow.com/docs/..."]
}
```

- `order` must be `0`–`4` (five questions per `trackCode`).
- `choices` must have **exactly four** strings.
- `correctIndex` must be `0`–`3`.

## Assignment template

> For certification track **`{TRACK_CODE}`** — **{OFFICIAL_NAME}**: search public ServiceNow docs for topics aligned with this certification (platform admin, implementation, or product area as appropriate). Produce **exactly five** original multiple-choice questions. Output the JSON array only.

Batch variant: list all `(trackCode, officialName)` pairs for this batch, require **5 questions each**, single combined JSON array.

## Merge checklist (human or maintainer agent)

- [ ] Exactly **5** objects per `trackCode` in the batch.
- [ ] All `correctIndex` values valid; no duplicate `order` per track.
- [ ] URLs are `https` and reachable public docs.
- [ ] Paste into `DEV_PRACTICE_QUESTIONS` in TypeScript (satisfies `DevPracticeQuestionRow`).

## Seed command

After updating the bank:

```bash
npm run seed:dev:questions
```

Requires a Convex deployment in `.env.local` (same as `npm run seed:dev`). Scripts use `convex run --push` so code is pushed before the internal mutation runs.

## Regenerate `devQuestionBank.ts` from subagent output

If you used parallel Cursor subagents whose replies are captured in `.jsonl` transcripts, run from the repo root:

```bash
node scripts/extract-questions-from-transcripts.mjs
```

Optional: `TRANSCRIPT_SUBAGENTS=C:\path\to\subagents` if not using the default Cursor project path.
