# Phase 7: CIS-SAM, CIS-SPM

| Track | Target | New orders |
|-------|--------|------------|
| CIS-SAM | 75 | 5–74 (14 batches × 5) |
| CIS-SPM | **90** | 5–89 (14 shared batches + 3 SPM-only batches) |

Batches 1–14: **10 objects** each (5 CIS-SAM + 5 CIS-SPM).  
Batches 15–17: **5 CIS-SPM** only (orders 75–89).

## Topic map (batches 1–14)

| Batch | Orders | CIS-SAM | CIS-SPM |
|-------|--------|---------|---------|
| 1 | 5–9 | Software models | Strategic plans |
| 2 | 10–14 | Entitlements | Strategic execution dashboard |
| 3 | 15–19 | License metrics | Now Assist SPM |
| 4 | 20–24 | Discovery models | APM vs SPM |
| 5 | 25–29 | Reclamation | Investment funding |
| 6 | 30–34 | SaaS management | Demand management |
| 7 | 35–39 | Publisher packs | Resource management |
| 8 | 40–44 | Optimization | Roadmaps |
| 9 | 45–49 | True-up / audit | Goals and initiatives |
| 10 | 50–54 | CAL / lifecycles | Portfolio workspace |
| 11 | 55–59 | Usage analytics | Scenario planning |
| 12 | 60–64 | SAM roles | PPM integration |
| 13 | 65–69 | Compliance reports | Strategic alignment |
| 14 | 70–74 | SAM administration | SPM reporting |

## SPM-only (batches 15–17)

| Batch | Orders | CIS-SPM focus |
|-------|--------|---------------|
| 15 | 75–79 | Portfolio analytics |
| 16 | 80–84 | Investment scenarios |
| 17 | 85–89 | SPM administration |

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase7-batch*.json
npm run seed:dev:questions
```
