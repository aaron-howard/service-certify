# Phase 3: CIS-DF, CIS-PA, CIS-SP

Next three tracks in catalog order after CSA/CAD. Target **75** questions each (`questionCount` default from exams.ts). Orders **0–4** exist; Phase 3 adds **5–74** (70 per track).

Branch: `australia` — `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

| Batch | Orders | CIS-DF focus | CIS-PA focus | CIS-SP focus |
|-------|--------|--------------|--------------|--------------|
| 1 | 5–9 | Import sets, staging | Indicator basics | Telecom service ops overview |
| 2 | 10–14 | Transform scripts | Breakdown sources | IntegrationHub spokes |
| 3 | 15–19 | Data sources | Collection jobs | Network inventory |
| 4 | 20–24 | CMDB classes | Manual indicators | Customer service for CSP |
| 5 | 25–29 | I&R rules | Widgets | Order management telecom |
| 6 | 30–34 | CSDM services | Targets | Upgrade planning |
| 7 | 35–39 | Relationships | Benchmarks | Delegated development |
| 8 | 40–44 | Discovery feeds | Analytics groups | CMDB at scale |
| 9 | 45–49 | ETL patterns | Spotlight | Service mapping provider |
| 10 | 50–54 | Data certification | PA roles | MID for provider |
| 11 | 55–59 | Reference data loads | KPI composer | TNI inventory |
| 12 | 60–64 | Health scan | Data visualizations | Proactive workflows |
| 13 | 65–69 | Clone data prep | Advanced breakdowns | Multi-tenant patterns |
| 14 | 70–74 | Data governance | PA administration | CSP integrations |

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase3-batch*.json
npm run seed:dev:questions
```
