# CPOA v2 question rewrite (Jul 2026 blueprint)

Replace all **100** CPOA bank questions with exam-realistic items aligned to the
**Certified Platform Owner Associate Exam Specification**.

Official exam: **70 questions** (90 minutes). Bank target: **100** (70 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Item types

| Type | Schema `questionType` | Notes |
|------|----------------------|-------|
| Multiple choice | `single` (default) | 4 choices, scenario/case-study stems |
| Multiple select | `multi` | `correctIndexes` + `correctIndex` = first |
| Drag/drop matching | `match` | `matchLeftItems`, `matchRightItems`, `correctMatches` |
| Scenario-based | `single` or `multi` | Real-world platform owner context |

Target mix: ~60% single, ~20% multi, ~20% match.

---

## Exam domain quotas (100 questions)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Strategy | 21.4% | 21 | 0–20 |
| 2 | People | 15.7% | 16 | 21–36 |
| 3 | Process | 15.7% | 16 | 37–52 |
| 4 | Technology | 22.9% | 23 | 53–75 |
| 5 | Data | 11.4% | 11 | 76–86 |
| 6 | ServiceNow Governance | 12.9% | 13 | 87–99 |

---

## Question style

- Associate-level voice for platform owners with 3–5 years ServiceNow experience.
- Tactical responsibilities under senior guidance: roadmaps, OCM, SDLC, upgrades, CMDB, licensing, support portal.
- Banned: template wrappers (`Typically,`, `From a governance perspective,`, etc.).
- Multi-select prompts must state "Choose two" or similar.
- Match items use no partial credit; every left item must have one correct right target.

---

## Batches (20 × 5 = 100)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Strategy | DONE |
| 2 | 5–9 | Strategy | DONE |
| 3 | 10–14 | Strategy | DONE |
| 4 | 15–19 | Strategy | DONE |
| 5 | 20–24 | Strategy (1) + People (4) | DONE |
| 6 | 25–29 | People | DONE |
| 7 | 30–34 | People | DONE |
| 8 | 35–39 | People (2) + Process (3) | DONE |
| 9 | 40–44 | Process | DONE |
| 10 | 45–49 | Process | DONE |
| 11 | 50–54 | Process (3) + Technology (2) | DONE |
| 12 | 55–59 | Technology | DONE |
| 13 | 60–64 | Technology | DONE |
| 14 | 65–69 | Technology | DONE |
| 15 | 70–74 | Technology | DONE |
| 16 | 75–79 | Technology (1) + Data (4) | DONE |
| 17 | 80–84 | Data | DONE |
| 18 | 85–89 | Data (2) + Governance (3) | DONE |
| 19 | 90–94 | ServiceNow Governance | DONE |
| 20 | 95–99 | ServiceNow Governance | DONE |

---

## Official samples embedded

1. Penetration test external dependency → **Internal security team** (batch 1)
2. Security Center features (choose two) → **Security hardening** + **Security metrics** (batch 12)
3. Crawl/Walk/Run/Fly implementation sequence match (batch 2)

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cpoa-v2-batch*.json
node scripts/lint-cpoa-realism.mjs --orders=0-99
npm test -- --run src/convex/seed/cpoa-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
npm run check
```

After merge: `npm run seed:dev:questions` to push to Convex.

---

## Domain rebalance (Jul 2026 realism review)

Standalone analysis flagged Strategy under-weighted and Technology over-weighted by **content topic**
(misplaced tech/data stems in Strategy orders 0–20). Governance and Data slots (76–99) existed but lacked
NOW Learning, product portfolio, and ITSM/CSM ecosystem coverage.

**Remediation:** `cpoa-rebalance-batch1.json` (17 rewrites) + domain tags on all batches.

| Orders | Change |
|--------|--------|
| 1, 5, 8, 10, 12, 14, 16, 18, 19 | Strategy slot: business case, roadmap sequencing, value realization (removed API keys, ATF, data stewardship, SDLC, technical security) |
| 59 | Moved ATF regression testing from Strategy order 10 to Technology |
| 67, 72 | Technology: product portfolio match + MID Server (replaced duplicate service-area match and upgrade testing match) |
| 76 | Data: strengthened data governance framing |
| 88, 95–97 | Governance: Cloud Governance Suite, NOW Learning, ITSM/CSM ecosystem, application portfolio |

```bash
node scripts/tag-cpoa-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cpoa-v2-batch*.json scripts/question-batches/cpoa-rebalance-batch1.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cpoa-realism.mjs --orders=0-99
npm test -- --run src/convex/seed/cpoa-realism.test.ts
```
