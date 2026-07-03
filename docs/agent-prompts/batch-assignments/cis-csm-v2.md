# CIS-CSM v2 question rewrite (official blueprint)

Replace all **90** CIS-CSM bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Customer Service Management Exam Specification** (KB0011529) and ServiceNowDocs **`australia`** branch.

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | CSM Foundational Data Model | 27% | 24 | 0–23 |
| 2 | CSM Configuration | 38% | 34 | 24–57 |
| 3 | Case Management | 17% | 15 | 58–72 |
| 4 | CSM Workspace, Portals, Analytics, and Reporting | 8% | 7 | 73–79 |
| 5 | CSM Best Practices and Knowledge Management | 10% | 10 | 80–89 |

---

## Question style

Match official CIS-CSM topics — accounts/contacts/consumers, entitlements, case types, channels, major issues, portals, knowledge.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Foundational Data Model | **DONE** |
| 2 | 5–9 | Foundational Data Model | **DONE** |
| 3 | 10–14 | Foundational Data Model | **DONE** |
| 4 | 15–19 | Foundational Data Model | **DONE** |
| 5 | 20–24 | Foundational Data Model (20–23) + Configuration (24) | **DONE** |
| 6 | 25–29 | CSM Configuration | **DONE** |
| 7 | 30–34 | CSM Configuration | **DONE** |
| 8 | 35–39 | CSM Configuration | **DONE** |
| 9 | 40–44 | CSM Configuration | **DONE** |
| 10 | 45–49 | CSM Configuration | **DONE** |
| 11 | 50–54 | CSM Configuration | **DONE** |
| 12 | 55–59 | Configuration (55–57) + Case Management (58–59) | **DONE** |
| 13 | 60–64 | Case Management | **DONE** |
| 14 | 65–69 | Case Management | **DONE** |
| 15 | 70–74 | Case Management (70–72) + Workspace/Portals (73–74) | **DONE** |
| 16 | 75–79 | Workspace, Portals, Analytics, Reporting | **DONE** |
| 17 | 80–84 | Best Practices and Knowledge Management | **DONE** |
| 18 | 85–89 | Best Practices and Knowledge Management | **DONE** |

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-csm-v2-batch*.json
node scripts/lint-cis-csm-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/cis-csm-realism.test.ts src/convex/seed/trackQuality.test.ts
# After merge: npm run seed:dev:questions
```
