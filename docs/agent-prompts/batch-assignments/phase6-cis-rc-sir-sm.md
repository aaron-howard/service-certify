# Phase 6: CIS-RC, CIS-SIR, CIS-SM

Target **75** questions each. Orders **5–74** in 14 batches.

| Batch | Orders | CIS-RC | CIS-SIR | CIS-SM |
|-------|--------|--------|---------|--------|
| 1 | 5–9 | IRM workspace | SIR lifecycle | Application services |
| 2 | 10–14 | Risk register | Playbooks | CMDB prerequisites |
| 3 | 15–19 | Controls | MITRE ATT&CK | Tag-based mapping |
| 4 | 20–24 | Policy compliance | Major incidents | Pattern-based discovery |
| 5 | 25–29 | Audit engagements | Threat intel | Service map dashboard |
| 6 | 30–34 | Risk assessment | SIR tasks | Entry points |
| 7 | 35–39 | Compliance scopes | SecOps integration | Map maintenance |
| 8 | 40–44 | Evidence collection | Containment workflows | Business services |
| 9 | 45–49 | Regulatory frameworks | Post-incident review | Dynamic CI groups |
| 10 | 50–54 | Risk treatment | SIR metrics | Map suggestions |
| 11 | 55–59 | Continuous monitoring | Integration with VR | Top-down mapping |
| 12 | 60–64 | GRC reporting | SIR roles | Bottom-up mapping |
| 13 | 65–69 | Audit remediation | War room ops | Service health |
| 14 | 70–74 | RC administration | SIR administration | SM administration |

```bash
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase6-batch*.json
npm run seed:dev:questions
```
