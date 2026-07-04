# CPOE v2 question rewrite (March 2026 beta blueprint)

Replace all **222** CPOE bank questions with exam-realistic items aligned to the
**Certified Platform Owner Expert Exam Specification** (March 2026 beta, WIP).

Official beta exam: **~192 questions** (240 minutes). Bank target: **222** (192 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Item types (new for this track)

Unlike CIS/CSA tracks, CPOE uses four official item formats:

| Type | Schema `questionType` | Notes |
|------|----------------------|-------|
| Multiple choice (single) | `single` (default) | 4 choices, scenario/case-study stems |
| Multiple select | `multi` | `correctIndexes` + `correctIndex` = first |
| Drag/drop matching | `match` | `matchLeftItems`, `matchRightItems`, `correctMatches` |
| Scenario-based | `single` or `multi` | Long case-study context in `prompt` |

**Target mix (222 bank):** ~65% single (~144), ~15% multi (~33), ~20% match (~45).

### Match question JSON shape

```json
{
  "trackCode": "CPOE",
  "order": 10,
  "questionType": "match",
  "prompt": "Match each platform governance board to its primary responsibility.",
  "choices": [],
  "correctIndex": 0,
  "matchLeftItems": ["Executive board", "Demand board", "Technical board"],
  "matchRightItems": ["Prioritize demand", "Approve architecture", "Set enterprise vision"],
  "correctMatches": [
    { "left": 0, "right": 2 },
    { "left": 1, "right": 0 },
    { "left": 2, "right": 1 }
  ],
  "explanation": "...",
  "sourceUrls": ["https://www.servicenow.com/docs/r/..."]
}
```

---

## Exam domain quotas (222 questions)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Strategy | 21.20% | 47 | 0–46 |
| 2 | Cost/Resource Planning | 14.48% | 32 | 47–78 |
| 3 | Implementation and Delivery | 19.26% | 43 | 79–121 |
| 4 | ServiceNow Governance | 17.60% | 39 | 122–160 |
| 5 | Compliance and Security | 14.76% | 33 | 161–193 |
| 6 | Innovation | 12.70% | 28 | 194–221 |

---

## Question style

- **Case-study first:** Most stems start with "Given a case study…" or "Given a scenario…" per blueprint testing objectives.
- **Executive/platform-owner voice:** C-Suite persuasion, ROI, OCM, sponsorship, governance boards — not admin config trivia.
- **Banned:** template wrappers (`Typically,`, `From a governance perspective,`, etc.).
- **Multi-select:** state "Choose N." in prompt; use `questionType: "multi"`.
- **Match:** left items are concepts; right items are definitions/outcomes. No partial credit.

---

## Batches (45 × 5 = 222)

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
| 9 | 40–44 | Strategy | DONE |
| 10 | 45–49 | Strategy (45–46) + Cost/Resource (47–49) | DONE |
| 11 | 50–54 | Cost/Resource Planning | DONE |
| 12 | 55–59 | Cost/Resource Planning | DONE |
| 13 | 60–64 | Cost/Resource Planning | DONE |
| 14 | 65–69 | Cost/Resource Planning | DONE |
| 15 | 70–74 | Cost/Resource (70–78) + Implementation (79) | DONE |
| 16 | 75–79 | Implementation and Delivery | DONE |
| 17 | 80–84 | Implementation and Delivery | DONE |
| 18 | 85–89 | Implementation and Delivery | DONE |
| 19 | 90–94 | Implementation and Delivery | DONE |
| 20 | 95–99 | Implementation and Delivery | DONE |
| 21 | 100–104 | Implementation and Delivery | DONE |
| 22 | 105–109 | Implementation and Delivery | DONE |
| 23 | 110–114 | Implementation and Delivery | DONE |
| 24 | 115–119 | Implementation and Delivery | DONE |
| 25 | 120–124 | Implementation (120–121) + Governance (122–124) | DONE |
| 26 | 125–129 | ServiceNow Governance | DONE |
| 27 | 130–134 | ServiceNow Governance | DONE |
| 28 | 135–139 | ServiceNow Governance | DONE |
| 29 | 140–144 | ServiceNow Governance | DONE |
| 30 | 145–149 | ServiceNow Governance | DONE |
| 31 | 150–154 | ServiceNow Governance | DONE |
| 32 | 155–159 | ServiceNow Governance | DONE |
| 33 | 160–164 | Governance (160) + Compliance (161–164) | DONE |
| 34 | 165–169 | Compliance and Security | DONE |
| 35 | 170–174 | Compliance and Security | DONE |
| 36 | 175–179 | Compliance and Security | DONE |
| 37 | 180–184 | Compliance and Security | DONE |
| 38 | 185–189 | Compliance and Security | DONE |
| 39 | 190–194 | Compliance (190–193) + Innovation (194) | DONE |
| 40 | 195–199 | Innovation | DONE |
| 41 | 200–204 | Innovation | DONE |
| 42 | 205–209 | Innovation | DONE |
| 43 | 210–214 | Innovation | DONE |
| 44 | 215–219 | Innovation | DONE |
| 45 | 220–221 | Innovation | DONE |

---

## Infrastructure (done)

- [x] Schema: `questionType: 'match'`, `matchLeftItems`, `matchRightItems`, `correctMatches`
- [x] UI: `MatchQuestion.svelte` drag/drop component
- [x] Grading: `matchAnswers` in `gradeAnswers` mutation
- [x] Policy: CPOE official count **192**, bank target **222**
- [x] Realism: `src/lib/catalog/cpoeRealism.ts`

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cpoe-v2-batch*.json
node scripts/lint-cpoe-realism.mjs --orders=0-221
npm test -- --run src/convex/seed/cpoe-realism.test.ts src/convex/seed/trackQuality.test.ts
npm run seed:dev:questions
```

After full merge: remove legacy CPOE orders that exceed 221 if surplus exists.
