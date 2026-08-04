# question-gen

Tooling for doc-grounded ServiceNow certification practice questions.

| File | Purpose |
|------|---------|
| [METHODOLOGY.md](./METHODOLOGY.md) | Generation + audit rules |
| [tracks.config.json](./tracks.config.json) | 22 tracks: publications, domains, targets |
| [validate.mjs](./validate.mjs) | Structural quality gate |
| [export-banks.mjs](./export-banks.mjs) | Export seed TS → `banks/*.json` |
| [banks/](./banks/) | Per-exam JSON banks for review |

```bash
npm run export:question-banks    # refresh banks/ from devQuestionBank.ts (gitignored)
npm run validate:questions       # validate seed bank (default)
npm run validate:questions:banks # validate exported banks/
node question-gen/validate.mjs csa
```
