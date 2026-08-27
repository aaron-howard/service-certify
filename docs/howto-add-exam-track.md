# How to add an exam track

Add a ServiceNow certification to the static catalog, Convex seed, blueprint domain cards, and (when you have items) the private question bank. The UI will list the exam even before questions exist.

## Prerequisites

- Official exam code, official name, question count, duration, and domain weights (Credentialing Program Guide)
- Domain names you will stamp on each practice item (must match `trackDocSources` exactly)
- For questions: [certification-questions.md](./agent-prompts/certification-questions.md) and the [servicenow-exam-question-gen skill](../.cursor/skills/servicenow-exam-question-gen/SKILL.md)

Do **not** put answer keys in `$lib/data`. Do **not** scrape servicenow.com/docs. Ground items in [ServiceNow/ServiceNowDocs](https://github.com/ServiceNow/ServiceNowDocs) (`australia` family).

## Steps

1. Add the track to the canonical list.

   Edit [`src/lib/catalog/tracksCanonical.ts`](../src/lib/catalog/tracksCanonical.ts). Append `{ code, officialCertificationName }`. `code` is 3–10 characters (Convex validator). The catalog slug is `code.toLowerCase()` with `_` turned into `-` (example: `CIS-ITSM` → `cis-itsm`).

2. Add official policy numbers.

   Edit [`src/lib/catalog/examQuestionPolicy.ts`](../src/lib/catalog/examQuestionPolicy.ts):

   - `OFFICIAL_EXAM_QUESTION_COUNTS` — proctored item count
   - `OFFICIAL_EXAM_DURATION_MINUTES` — only if not the default 90 minutes (`CIS-SP` is 60, `CPOE` is 240)

   Bank target is official count + `QUESTION_BANK_BUFFER` (30). `getOfficialQuestionCount` **throws** on unknown codes, so a new track that skips this file will crash catalog generation.

3. Add blueprint domains and ServiceNowDocs publications.

   Edit [`src/lib/catalog/trackDocSources.ts`](../src/lib/catalog/trackDocSources.ts). Add a `TrackDocSource` (`trackCode`, `officialName`, `publications`, `domains[]` with `name` + `weight` + `publications`). Include it in `ALL_TRACK_DOC_SOURCES`.

   Domain **name strings** on seeded questions must match `domains[].name` exactly. Detail-page cards are built from this file, not from Convex.

4. Optional: override marketing copy on the detail page.

   [`src/lib/data/exams.ts`](../src/lib/data/exams.ts) builds every exam from the canonical track. Five slugs have extra copy in `examDetailOverrides` (`csa`, `cad`, `cis-itsm`, `cis-spm`, `cis-hr`). Add an override only if you need custom title, description, or home badge.

   Featured home cards are hardcoded: `getFeaturedExams()` returns CSA, CAD, CIS-ITSM only.

5. Optional: exam-realism rules.

   Existing tracks have `src/lib/catalog/<track>Realism.ts`, `src/convex/seed/<track>-realism.test.ts`, and often `scripts/lint-<track>-realism.mjs`. Copy a close sibling (CSA or CIS-ITSM). Tests skip meaningfully when the stub bank is tiny.

6. Author and merge practice items into the **private** bank.

   Follow [certification-questions.md](./agent-prompts/certification-questions.md). Merge into `src/convex/seed/devQuestionBank.private.ts` (gitignored). `order` must be unique per `trackCode`.

7. Seed Convex.

   ```bash
   npm run seed:dev
   npm run seed:dev:questions
   ```

   `src/convex/catalog/*.ts` re-exports `$lib/catalog`. Do not fork copies there.

## Verification

```bash
npm test -- src/lib/data/exams.test.ts src/lib/catalog/trackDocSources.test.ts
npm run check
```

Start the app, open `/exams`, search for the new code, open `/exams/<slug>`. Domain cards should match the blueprint names and weights. Sample practice (`/exams/<slug>/practice`) returns items only after the private bank is seeded for that `trackCode`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Unknown track code for official question count` | Missing entry in `OFFICIAL_EXAM_QUESTION_COUNTS`. |
| Domain cards show the generic “Blueprint-aligned practice” fallback | `getTrackDocSource(code)` returned no domains. Add the track to `ALL_TRACK_DOC_SOURCES`. |
| Seeded questions exist but sample is empty | `trackCode` on rows must match the catalog `code` (including `CIS-` prefix). |
| Realism tests fail on domain mix | Question `domain` field does not match `domains[].name` in `trackDocSources.ts`. |

Related: [catalog reference](./reference-catalog.md), [data split](./explanation-data-split.md), [QUESTION_BANK.md](../src/convex/seed/QUESTION_BANK.md).
