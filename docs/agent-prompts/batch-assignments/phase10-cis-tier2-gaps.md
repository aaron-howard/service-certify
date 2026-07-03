# Phase 10: CIS tier-2 gaps (+15 each, CIS-ITSM +5)

Closes remaining tracks at **75 → 90** (official 60 + 30 buffer). CIS-ITSM **85 → 90**.

| Track | New orders | Count |
|-------|------------|------:|
| CIS-PA, CIS-DISCO, CIS-HAM, CIS-RC, CIS-SIR | 75–89 | 15 each |
| CIS-SM, CIS-SAM, CIS-TPRM, CIS-VR, CIS-CSM | 75–89 | 15 each |
| CIS-FSM | 75–89 | 15 |
| CIS-ITSM | 85–89 | 5 |

**170 new questions** in `gap10-batch*.json`.

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/gap10-batch*.json
npm run seed:dev:questions
```
