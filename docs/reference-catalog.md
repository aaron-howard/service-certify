# Exam catalog

Static exam catalog: track codes, official counts, domain cards, and the TypeScript types the UI reads. Practice items are **not** here. They live in Convex after seed. See [data split](./explanation-data-split.md).

## Canonical tracks

Source of truth for codes and official names: [`src/lib/catalog/tracksCanonical.ts`](../src/lib/catalog/tracksCanonical.ts).

`CERTIFICATION_TRACKS_FOR_SEED` is an array of `{ code, officialCertificationName }`. Convex `internal.seed.apply` and `$lib/data/exams.ts` both consume it (`src/lib/data/certification-tracks.ts` is a deprecated re-export).

There are **22** tracks:

| Code | Official name | Level (derived) | Slug |
| --- | --- | --- | --- |
| CSA | Certified System Administrator | Associate | `csa` |
| CAD | Certified Application Developer | Professional | `cad` |
| CIS-DF | CIS - Data Foundations | Professional | `cis-df` |
| CIS-PA | CIS - Platform Analytics | Professional | `cis-pa` |
| CIS-SP | CIS - Service Provider | Professional | `cis-sp` |
| CPOA | Certified Platform Owner Associate | Associate | `cpoa` |
| CPOP | Certified Platform Owner Professional | Professional | `cpop` |
| CPOE | Certified Platform Owner Expert | Expert | `cpoe` |
| CIS-DISCO | CIS - Discovery | Professional | `cis-disco` |
| CIS-EM | CIS - Event Management | Professional | `cis-em` |
| CIS-HAM | CIS - Hardware Asset Management | Professional | `cis-ham` |
| CIS-ITSM | CIS - IT Service Management | Professional | `cis-itsm` |
| CIS-RC | CIS - Risk and Compliance | Professional | `cis-rc` |
| CIS-SIR | CIS - Security Incident Response | Professional | `cis-sir` |
| CIS-SM | CIS - Service Mapping | Professional | `cis-sm` |
| CIS-SAM | CIS - Software Asset Management | Professional | `cis-sam` |
| CIS-SPM | CIS - Strategic Portfolio Management | Professional | `cis-spm` |
| CIS-TPRM | CIS - Third-Party Risk Management | Professional | `cis-tprm` |
| CIS-VR | CIS - Vulnerability Response | Professional | `cis-vr` |
| CIS-CSM | CIS - Customer Service Management | Professional | `cis-csm` |
| CIS-FSM | CIS - Field Service Management | Professional | `cis-fsm` |
| CIS-HR | CIS - Human Resources | Professional | `cis-hr` |

Level rules in `exams.ts`: `CSA` and `CPOA` → Associate; `CPOE` → Expert; everything else → Professional.

Slug: `code.toLowerCase().replace(/_/g, '-')`.

## Question policy

[`src/lib/catalog/examQuestionPolicy.ts`](../src/lib/catalog/examQuestionPolicy.ts)

| Export | Meaning |
| --- | --- |
| `OFFICIAL_EXAM_QUESTION_COUNTS` | Proctored item count per code |
| `QUESTION_BANK_BUFFER` | `30` extra seeded rows for rotation |
| `getOfficialQuestionCount(code)` | Throws if code unknown |
| `getQuestionBankTarget(code)` | official + 30 |
| `EXAM_QUESTION_BANK_TARGETS` | map of targets |
| `OFFICIAL_EXAM_DURATION_MINUTES` | overrides: `CIS-SP` = 60, `CPOE` = 240 |
| `getOfficialExamDurationMinutes(code)` | default **90** |
| `getPracticeTimeSeconds({ trackCode, questionCount, mode })` | full = official seconds; sample = scaled, minimum 300 seconds |

Counts (official / bank target):

| Code | Official | Bank |
| --- | --- | --- |
| CSA, CAD, CIS-PA, CIS-HAM, CIS-ITSM, CIS-RC, CIS-SIR, CIS-SM, CIS-SAM, CIS-SPM, CIS-TPRM, CIS-CSM, CIS-FSM, CIS-HR | 60 | 90 |
| CIS-DF | 75 | 105 |
| CIS-SP, CIS-DISCO, CIS-VR | 45 | 75 |
| CIS-EM | 30 | 60 |
| CPOA, CPOP | 70 | 100 |
| CPOE | 192 | 222 |

`src/convex/catalog/examQuestionPolicy.ts` re-exports the `$lib` module. Edit only `$lib`.

## Domain cards

[`src/lib/catalog/trackDocSources.ts`](../src/lib/catalog/trackDocSources.ts)

| Export | Type / role |
| --- | --- |
| `SN_DOCS_BRANCH` | `'australia'` |
| `SN_DOCS_RAW_BASE` | GitHub raw markdown prefix |
| `TrackDocDomain` | `{ name, weight, publications[] }` |
| `TrackDocSource` | `{ trackCode, officialName, publications[], domains[] }` |
| `ALL_TRACK_DOC_SOURCES` | union of phase arrays |
| `getTrackDocSource(trackCode)` | lookup or `undefined` |

`exams.ts` maps each domain to an `ExamDomain` (icon, `questionCount` label from weight × bank size, `highlight` on the heaviest domain). If `getTrackDocSource` has no domains, the UI shows a single 100% “Blueprint-aligned practice” card.

Question `domain` tags in Convex must equal `domains[].name` **exactly**.

## `Exam` type and helpers

[`src/lib/data/exams.ts`](../src/lib/data/exams.ts)

```ts
type ExamLevel = 'Associate' | 'Professional' | 'Expert';

type ExamDomain = {
  name: string;
  weight: string;          // e.g. "20%"
  questionCount: string;   // e.g. "18+ Questions"
  description: string;
  icon: string;            // Material Symbols name
  highlight?: boolean;
};

type Exam = {
  slug: string;
  code: string;
  officialCertificationName: string;
  title: string;
  shortTitle: string;
  tag: string;             // usually the code; used as catalog filter chips
  trackLabel: string;
  questionCount: number;       // official
  questionBankSize: number;    // official + 30
  questionBankLabel: string;
  mockExamCount: string;
  releaseFocus: string;
  updatedLabel: string;
  passRate: string;
  description: string;
  image: string;
  domains: ExamDomain[];
  author: { initials: string; name: string; role: string };
  rating: number;
  studentsPrepared: number;
  level: ExamLevel;
  homeBadge?: string;
  homeDescription?: string;
};
```

| Export | Behavior |
| --- | --- |
| `exams` | one `Exam` per canonical track, with optional `examDetailOverrides` for five slugs |
| `getExamBySlug(slug)` | `Exam \| undefined` (404 on unknown practice/detail routes) |
| `getFeaturedExams()` | CSA, CAD, CIS-ITSM only |

Override keys: `csa`, `cad`, `cis-itsm`, `cis-spm`, `cis-hr`.

## Question row shape (private bank)

[`src/convex/seed/devQuestionBank.types.ts`](../src/convex/seed/devQuestionBank.types.ts)

| Field | Constraint |
| --- | --- |
| `trackCode` | catalog code |
| `order` | unique per track |
| `prompt` | stem |
| `choices` | four strings typical for MC; empty for match |
| `correctIndex` | 0–3 for single; first of `correctIndexes` for multi; `0` for match |
| `questionType` | `'single' \| 'multi' \| 'match'` (optional → single) |
| `explanation` | required |
| `sourceUrls` | 1–3 public URLs in authoring rules |
| `domain` | optional; must match blueprint name |
| `contentDifficulty` | optional CIS-DF self-assessment only |

`isFullQuestionBank()` is true when loaded rows ≥ 400.

## Examples

Resolve CSA for a route:

```ts
import { getExamBySlug } from '$lib/data/exams';

const exam = getExamBySlug('csa');
// exam.code === 'CSA'
// exam.questionCount === 60
// exam.questionBankSize === 90
```

Official duration for a full mock:

```ts
import { getOfficialExamDurationMinutes } from '$lib/catalog/examQuestionPolicy';

getOfficialExamDurationMinutes('CSA');   // 90
getOfficialExamDurationMinutes('CIS-SP'); // 60
getOfficialExamDurationMinutes('CPOE');  // 240
```

## Related

- [How to add an exam track](./howto-add-exam-track.md)
- [Convex API](./reference-convex-api.md)
- [Question authoring](./agent-prompts/certification-questions.md)
