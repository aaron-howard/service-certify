# CAD v2 question rewrite (official blueprint)

Replace all **90** CAD bank questions with exam-realistic items aligned to the
**Certified Application Developer Exam Specification** and ServiceNowDocs **`australia`** branch.

Official prep sources (paraphrase docs only):

- Welcome to ServiceNow
- Scripting in ServiceNow Fundamentals
- Application Development Fundamentals

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

Publications: `application-development`, `hyperautomation-low-code`, `build-workflows`,
`integrate-applications`, `api-reference`, `platform-security`, `platform-user-interface`.

---

## Exam domain quotas (90 questions = 60 official × 1.5)

| # | Domain | % | Official | Bank | Orders |
|---|--------|---|----------|------|--------|
| 1 | Designing and Creating an Application | 20% | 12 | 18 | 0–17 |
| 2 | Application User Interface | 20% | 12 | 18 | 18–35 |
| 3 | Security and Restricting Access | 20% | 12 | 18 | 36–53 |
| 4 | Application Automation | 20% | 12 | 18 | 54–71 |
| 5 | Working with External Data | 10% | 6 | 9 | 72–80 |
| 6 | Managing Applications | 10% | 6 | 9 | 81–89 |

---

## Question style (required)

Match the official CAD sample items — direct platform facts, method names,
config field values, scope rules. Not quiz templates.

**Banned in prompts and choices**

- Wrapper prefixes: `Typically,`, `Operationally,`, `In practice,`,
  `From an implementation standpoint,`, `From a governance perspective,`,
  `In platform terms,`, `In this scenario,`, `Practically speaking,`
- `What is the primary purpose of…` (definition-only stems)
- Duplicate choice text within the track; padded/boilerplate suffixes

**Choices**

- Four unique strings per question; similar length
- Standalone answers: API/method names, table names, scope rules, config values

**Multi-select** — allowed where the blueprint calls for "select all that apply".
Set `questionType: "multi"`, `correctIndexes: [..]` (2+ entries, sorted),
and `correctIndex` = the lowest correct index (back-compat).

**Each question requires `sourceUrls`** pointing to ServiceNow docs.

---

## Batch assignments

Save batches as `scripts/question-batches/cad-v2-batch{N}.json` (5 questions each).

### Batch 1 — orders 0–4 · Domain 1 Design/Create · **DONE**

| Order | Topic |
|-------|-------|
| 0 | App good-fit for ServiceNow (task-based, relational data) |
| 1 | Scoped vs global application scope isolation |
| 2 | Table extension / class inheritance for data model |
| 3 | Application module + navigation |
| 4 | One-to-many via reference field data model |

### Batch 2 — orders 5–9 · Domain 1 Design/Create · **DONE**

### Batch 3 — orders 10–14 · Domain 1 Design/Create · **DONE**

### Batch 4 — orders 15–19 · Domain 1 (15–17) + UI (18–19) · **DONE**

### Batch 5 — orders 20–24 · Domain 2 UI · **DONE**

### Batch 6 — orders 25–29 · Domain 2 UI · **DONE**

### Batch 7 — orders 30–34 · Domain 2 UI · **DONE**

### Batch 8 — orders 35–39 · Domain 2 (35) + Security (36–39) · **DONE**

### Batch 9 — orders 40–44 · Domain 3 Security · **DONE**

### Batch 10 — orders 45–49 · Domain 3 Security · **DONE**

### Batch 11 — orders 50–54 · Domain 3 (50–53) + Automation (54) · **DONE**

### Batch 12 — orders 55–59 · Domain 4 Automation · **DONE**

### Batch 13 — orders 60–64 · Domain 4 Automation · **DONE**

### Batch 14 — orders 65–69 · Domain 4 Automation · **DONE**

### Batch 15 — orders 70–74 · Domain 4 (70–71) + External Data (72–74) · **DONE**

### Batch 16 — orders 75–79 · Domain 5 External Data · **DONE**

### Batch 17 — orders 80–84 · Domain 5 (80) + Managing Apps (81–84) · **DONE**

### Batch 18 — orders 85–89 · Domain 6 Managing Apps · **DONE**

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cad-v2-batch1.json
node scripts/lint-cad-realism.mjs --orders=0-4
npm run test -- --run src/convex/seed/cad-realism.test.ts src/convex/seed/trackQuality.test.ts
# After full rewrite: npm run seed:dev:questions
```
