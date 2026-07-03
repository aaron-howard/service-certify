# Phase 4: CPOA, CPOP, CPOE

Platform Owner certification tracks. Target **75** questions each (default `questionCount`). Orders **5–74** added in 14 batches.

| Batch | Orders | CPOA (Associate) | CPOP (Professional) | CPOE (Expert) |
|-------|--------|------------------|----------------------|---------------|
| 1 | 5–9 | Instance strategy, clones | Upgrade Center | Domain separation basics |
| 2 | 10–14 | Upgrade lifecycle | Skipped updates governance | Scoped app enterprise model |
| 3 | 15–19 | Admin Center | Subscription management | Clone update sets |
| 4 | 20–24 | IntegrationHub intro | Integration governance | CMDB relationship governance |
| 5 | 25–29 | Adoption blueprints | Performance monitoring | Multi-domain data policies |
| 6 | 30–34 | Setup Hub | Application repository | Enterprise MID strategy |
| 7 | 35–39 | Instance stats | Security constraints | Cross-scope access |
| 8 | 40–44 | Plugin management | Update set promotion | Instance cloning at scale |
| 9 | 45–49 | Email and notifications gov | Delegated development gov | High availability patterns |
| 10 | 50–54 | Health scan | Instance security hardening | Data residency |
| 11 | 55–59 | Store and apps | Capacity planning | Integration throughput |
| 12 | 60–64 | Release testing | Environment sequencing | CMDB certification |
| 13 | 65–69 | Platform analytics owner view | Audit and compliance | Domain separation advanced |
| 14 | 70–74 | Owner KPIs | Production cutover | Enterprise architecture |

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase4-batch*.json
npm run seed:dev:questions
```
