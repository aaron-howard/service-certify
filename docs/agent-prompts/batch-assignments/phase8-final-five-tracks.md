# Phase 8: CIS-TPRM, CIS-VR, CIS-CSM, CIS-FSM, CIS-HR (final)

Completes all **22** certification tracks.

| Track | Target | New orders |
|-------|--------|------------|
| CIS-TPRM | 75 | 5–74 |
| CIS-VR | 75 | 5–74 |
| CIS-CSM | 75 | 5–74 |
| CIS-FSM | 75 | 5–74 |
| CIS-HR | **70** | 5–69 |

Batches 1–13: **25 objects** each (5 per track, orders 5–69).  
Batch 14: **20 objects** (TPRM, VR, CSM, FSM only — orders 70–74).

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase8-batch*.json
npm run seed:dev:questions
```
