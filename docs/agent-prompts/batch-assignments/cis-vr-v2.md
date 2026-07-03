# CIS-VR v2 question rewrite (official blueprint)

Replace all **75** CIS-VR bank questions with exam-realistic items aligned to the
**Certified Implementation Specialist - Vulnerability Response Exam Specification** and ServiceNowDocs **`australia`** branch.

Official exam: **45 questions** (90 minutes). Bank target: **75** (45 + 30 buffer).

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (75 questions = 45 official + 30 buffer)

| # | Domain | % | Bank | Orders |
|---|--------|---|------|--------|
| 1 | VR Applications and Modules | 25% | 19 | 0–18 |
| 2 | Getting Data into Vulnerability Response | 25% | 19 | 19–37 |
| 3 | Tools to Manage Vulnerability Response | 23% | 17 | 38–54 |
| 4 | Automating Vulnerability Response | 20% | 15 | 55–69 |
| 5 | VR Dashboards and Reports | 7% | 5 | 70–74 |

---

## Question style

Match official CIS-VR samples — NVD/scanner integration, CVE feeds, remediation workspace roles, GRC exceptions, Security Champion persona, CISO dashboards.
Banned: template wrappers (`Typically,`, `From an implementation standpoint,`, etc.).

Multi-select allowed with `questionType: "multi"` and `correctIndexes`.

---

## Batches (15 × 5)

| Batch | Orders | Domain | Status |
|-------|--------|--------|--------|
| 1 | 0–4 | VR Applications and Modules | **DONE** |
| 2 | 5–9 | VR Applications and Modules | **DONE** |
| 3 | 10–14 | VR Applications and Modules | **DONE** |
| 4 | 15–19 | Applications/Modules (15–18) + Getting Data (19) | **DONE** |
| 5 | 20–24 | Getting Data into VR | **DONE** |
| 6 | 25–29 | Getting Data into VR | **DONE** |
| 7 | 30–34 | Getting Data into VR | **DONE** |
| 8 | 35–39 | Getting Data into VR | **DONE** |
| 9 | 40–44 | Getting Data (40) + Tools to Manage VR (41–44) | **DONE** |
| 10 | 45–49 | Tools to Manage VR | **DONE** |
| 11 | 50–54 | Tools to Manage VR | **DONE** |
| 12 | 55–59 | Automating VR | **DONE** |
| 13 | 60–64 | Automating VR | **DONE** |
| 14 | 65–69 | Automating VR | **DONE** |
| 15 | 70–74 | VR Dashboards and Reports | **DONE** |

---

## Merge and validate

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-vr-v2-batch*.json
node scripts/lint-cis-vr-realism.mjs --orders=0-74
npm test -- --run src/convex/seed/cis-vr-realism.test.ts src/convex/seed/trackQuality.test.ts src/convex/seed/devQuestionBank.test.ts
# After merge: npm run seed:dev:questions
```
