# CPOP v2 question rewrite (April 2026 blueprint)

Replace all **100** CPOP bank questions with exam-realistic items aligned to the
**Certified Platform Owner Professional Exam Specification** (April 2026 WIP).

Official exam: **70 questions** (90 minutes). Bank target: **100** (70 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Item types

| Type | Schema `questionType` | Notes |
|------|----------------------|-------|
| Multiple choice | `single` (default) | 4 choices, scenario/case-study stems |
| Multiple select | `multi` | `correctIndexes` + `correctIndex` = first |
| Drag/drop matching | `match` | `matchLeftItems`, `matchRightItems`, `correctMatches` |
| Scenario-based | `single` or `multi` | Real-world product/platform owner context |

Target mix: ~60% single, ~20% multi, ~20% match.

---

## Exam domain quotas (100 questions)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Strategy | 40% | 40 | 0–39 |
| 2 | People | 10% | 10 | 40–49 |
| 3 | Process | 10% | 10 | 50–59 |
| 4 | Technology | 20% | 20 | 60–79 |
| 5 | Data | 10% | 10 | 80–89 |
| 6 | ServiceNow Governance | 10% | 10 | 90–99 |

---

## Question style

- Case-study and scenario voice for platform owners with 5–8+ years experience.
- Focus on strategic alignment, CoEI, sponsors, Agile, upgrades, platform maintenance, CMDB/CSDM, licensing governance, and secure coding governance.
- Banned: template wrappers (`Typically,`, `From a governance perspective,`, etc.).
- Multi-select prompts must state "Choose two" or "Choose three."
- Match items use no partial credit; every left item must have one correct right target.

---

## Batches (20 × 5 = 100)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Strategy | DONE |
| 2 | 5–9 | Strategy | DONE |
| 3 | 10–14 | Strategy | DONE |
| 4 | 15–19 | Strategy | DONE |
| 5 | 20–24 | Strategy | DONE |
| 6 | 25–29 | Strategy | DONE |
| 7 | 30–34 | Strategy | DONE |
| 8 | 35–39 | Strategy | DONE |
| 9 | 40–44 | People | DONE |
| 10 | 45–49 | People | DONE |
| 11 | 50–54 | Process | DONE |
| 12 | 55–59 | Process | DONE |
| 13 | 60–64 | Technology | DONE |
| 14 | 65–69 | Technology | DONE |
| 15 | 70–74 | Technology | DONE |
| 16 | 75–79 | Technology | DONE |
| 17 | 80–84 | Data | DONE |
| 18 | 85–89 | Data | DONE |
| 19 | 90–94 | ServiceNow Governance | DONE |
| 20 | 95–99 | ServiceNow Governance | DONE |

---

## Official sample to embed

- A university wants to improve onboarding for new staff/faculty by automating account setup, access, and equipment readiness. Correct capability: **HR Service Delivery with Lifecycle Events**.

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cpop-v2-batch*.json
node scripts/lint-cpop-realism.mjs --orders=0-99
npm test -- --run src/convex/seed/cpop-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
npm run check
```

After merge: remove legacy CPOP orders >= 100 if surplus exists.

---

## Domain rebalance (Jul 2026 standalone realism review)

Standalone analysis flagged **Governance** as missing by content classification and **People**
over-represented because Strategy orders 0–39 contained adoption, agile, UX, and stakeholder
content. **Technology** was under-recognized because Support Portal and platform infrastructure
topics appeared in Strategy slots.

**Remediation:** `cpop-rebalance-batch1.json` (23 rewrites) + domain tags on all batches.

| Orders | Change |
|--------|--------|
| 5–7, 20–24, 30, 32, 38 | Strategy: roadmap, business case, portfolio sequencing, value realization (removed Support Portal, Scrum/agile, UX, citizen-dev enablement) |
| 62, 68, 74, 78 | Technology: Support Portal, MID Server, ATF, platform service areas |
| 86 | Data: CMDB quality tied to investment and automation decisions |
| 90–92, 95–97, 99 | Governance: council charter, NOW Learning, product portfolio, demand board, subscription governance |

```bash
node scripts/tag-cpop-domains.mjs
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cpop-v2-batch*.json scripts/question-batches/cpop-rebalance-batch1.json
node scripts/balance-choice-lengths.mjs
node scripts/rebalance-question-choices.mjs
node scripts/lint-cpop-realism.mjs --orders=0-99
npm test -- --run src/convex/seed/cpop-realism.test.ts
```
