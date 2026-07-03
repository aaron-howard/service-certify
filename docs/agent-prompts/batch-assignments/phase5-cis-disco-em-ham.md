# Phase 5: CIS-DISCO, CIS-EM, CIS-HAM

Target **75** questions each (`questionCount` default). Orders **5–74** in 14 batches.

| Batch | Orders | CIS-DISCO | CIS-EM | CIS-HAM |
|-------|--------|-----------|--------|---------|
| 1 | 5–9 | MID Server config | Event pipeline | Hardware models |
| 2 | 10–14 | ECC queue | Connectors | Stockrooms |
| 3 | 15–19 | Credentials | Listeners | Asset lifecycle states |
| 4 | 20–24 | Discovery schedules | Event rules | Consumable models |
| 5 | 25–29 | IP ranges / scope | Alert management | Asset bundles |
| 6 | 30–34 | Classification | Alert groups | RMA workflows |
| 7 | 35–39 | Horizontal patterns | CI binding | Procurement integration |
| 8 | 40–44 | Pattern designer | Event filters | Catalog fulfillment |
| 9 | 45–49 | Probes and sensors | Connector templates | Transfer orders |
| 10 | 50–54 | Cloud discovery | Remediation tasks | Disposal |
| 11 | 55–59 | Service discovery | Maintenance windows | Loaner assets |
| 12 | 60–64 | CMDB updates | Event analytics | Normalization |
| 13 | 65–69 | Discovery troubleshooting | AIOps integration | Audit |
| 14 | 70–74 | Discovery admin | EM operations | HAM reporting |

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase5-batch*.json
npm run seed:dev:questions
```
