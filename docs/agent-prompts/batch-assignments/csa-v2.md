# CSA v2 question rewrite (official blueprint)

Replace all **90** CSA bank questions with exam-realistic items aligned to the
**Certified System Administrator Exam Specification** and ServiceNowDocs **`australia`** branch.

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | Platform Overview and Navigation | 7% | 6 | 0–5 |
| 2 | Instance Configuration | 10% | 9 | 6–14 |
| 3 | Configuring Applications for Collaboration | 20% | 18 | 15–32 |
| 4 | Self Service and Automation | 20% | 18 | 33–50 |
| 5 | Database Management and Platform Security | 30% | 27 | 51–77 |
| 6 | Data Migration and Integration | 13% | 12 | 78–89 |

---

## Question style (required — admin scenario-first, Jul 2026 refresh)

**Target mix:** ~70% scenario/application, ~30% direct recall. Each question should feel like: *You are the admin. Given this situation, which feature or configuration is the best fit?*

**Scenario categories**

| Category | Topics |
|----------|--------|
| Lists & navigation | Saved filters, list personalization, Application Navigator, modules |
| Forms & UI | Views, form layouts, UI policies, related lists |
| Users, groups, roles | Module visibility, role inheritance, group membership |
| Tables & dictionary | Extensions, field types, mandatory fields, coalesce |
| Security | Table/field ACLs, roles, troubleshooting access |
| Self-service | Service Catalog, Knowledge, Employee Center / portals |
| Automation | Flow Designer, notifications, business rules basics |
| Data & migration | Import sets, transform maps, update sets |
| Reporting | Reports, dashboards, filters |

**Preferred pattern:** Short admin scenario → four plausible choices → one best answer (or stated count for multi-select).

**Banned:** `What is X?`, `Which module does Y?`, obvious joke distractors, template wrappers (`Typically,`, `In this scenario,`, etc.).

**Australia family:** Ground release-specific UI names in ServiceNowDocs `australia` branch; avoid unverified tiny UI wording from older dumps.

**Multi-select:** Include 8–10 across the bank (`questionType: "multi"`, `correctIndexes`, `correctIndex` = lowest).

**Each question requires `sourceUrls`** pointing to ServiceNow documentation.

---

## Batches (18 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | Platform Overview | **DONE (Jul 2026 scenario refresh)** |
| 2 | 5–9 | Platform (5) + Instance (4) | **DONE (Jul 2026 scenario refresh)** |
| 3 | 10–14 | Instance Configuration | **DONE (Jul 2026 scenario refresh)** |
| 4 | 15–19 | Collaboration | **DONE (Jul 2026 scenario refresh)** |
| 5 | 20–24 | Collaboration | **DONE (Jul 2026 scenario refresh)** |
| 6 | 25–29 | Collaboration | **DONE (Jul 2026 scenario refresh)** |
| 7 | 30–34 | Collaboration + Self Service (33–34) | **DONE (Jul 2026 scenario refresh)** |
| 8 | 35–39 | Self Service and Automation | **DONE (Jul 2026 scenario refresh)** |
| 9 | 40–44 | Self Service and Automation | **DONE (Jul 2026 scenario refresh)** |
| 10 | 45–49 | Self Service (45–50) + Database (51) | **DONE (Jul 2026 scenario refresh)** |
| 11 | 50–54 | Database and Security | **DONE (Jul 2026 scenario refresh)** |
| 12 | 55–59 | Database and Security | **DONE (Jul 2026 scenario refresh)** |
| 13 | 60–64 | Database and Security | **DONE (Jul 2026 scenario refresh)** |
| 14 | 65–69 | Database and Security | **DONE (Jul 2026 scenario refresh)** |
| 15 | 70–74 | Database and Security | **DONE (Jul 2026 scenario refresh)** |
| 16 | 75–77 | Database and Security | **DONE (Jul 2026 scenario refresh)** |
| 17 | 78–84 | Data Migration and Integration | **DONE (Jul 2026 scenario refresh)** |
| 18 | 85–89 | Data Migration and Integration | **DONE (Jul 2026 scenario refresh)** |

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/csa-v2-batch*.json
node scripts/lint-csa-realism.mjs --orders=0-89
npm test -- --run src/convex/seed/csa-realism.test.ts src/convex/seed/trackQuality.test.ts
# After merge: npm run seed:dev:questions
```
