# CIS-ITSM v2 question rewrite (official blueprint)

Replace all **90** CIS-ITSM bank questions with exam-realistic items aligned to **KB0011560** and ServiceNowDocs **`australia`** branch.

Official prep sources (paraphrase docs only — do not copy training slides):

- ServiceNow ITSM Fundamentals + ITSM Implementation
- Administration Fundamentals / Advanced
- CMDB Fundamentals, CSDM Fundamentals
- Major Incident, Knowledge Management, Scripting, Employee Center (supporting)

Base URL: `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/australia/markdown`

---

## Exam domain quotas (90 questions)

| Domain | % | Count |
|--------|---|-------|
| Incident Management | 25% | 23 |
| Problem Management | 15% | 14 |
| Change Management | 25% | 23 |
| Service Portfolio Management | 5% | 5 |
| Service Catalog and Request Management | 25% | 23 |
| Configuration Management Database | 5% | 5 |

Each domain uses three lenses where applicable: **Architecture**, **Scoping & requirements**, **Configuration**.

---

## Question style (required)

Match official CIS-ITSM samples — direct platform facts, not quiz templates.

**Good stems**

- *In the base platform configuration, what automatically happens…*
- *Which business rule / role / property…*
- *A customer requires… Which recommended approach…*
- *When a parent incident is updated to Resolved…*

**Banned in prompts and choices**

- `Captures the choice stating`, `Matches the scenario in which`, `Describes the outcome where`
- `From an admin perspective`, `Practically speaking`, `In most deployments`
- `What is the primary purpose of…` (definition-only stems)

**Choices**

- Standalone answers: role names, table names, property behaviors, workflow outcomes
- Similar length; no shared suffix padding
- Four unique strings per question; no duplicate choice text within the track

**Output JSON** — same shape as `certification-questions.md`; add optional comment in batch PR:

- `domain`: exam domain name
- `subTopic`: `architecture` | `scoping` | `configuration`

---

## Batch assignments

Save batches as `scripts/question-batches/cis-itsm-v2-batch{N}.json` (5 questions each unless noted).

### Batch 1 — orders 0–4 · Incident · **DONE (proof)**

| Order | Lens | Topics |
|-------|------|--------|
| 0 | configuration | Auto-close Resolved → Closed (`configure-incident-auto-close.md`) |
| 1 | configuration | On Hold Awaiting Caller → In Progress (`c_IncidentManagementStateModel.md`) |
| 2 | scoping | Incident identification vs request (`incident-management-process.md`) |
| 3 | configuration | Priority from impact + urgency (`incident-management-process.md`) |
| 4 | architecture | Parent/child Resolved sync (`parent-child-state-sync.md`) |

### Batch 2 — orders 5–9 · Incident · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 5 | configuration | SLA + inactivity monitor escalation (`work-on-incidents.md`) |
| 6 | configuration | Create child incident property (`copy-incident-or-create-child-incident.md`) |
| 7 | architecture | Default fields copied to child incident (`copy-incident-or-create-child-incident.md`) |
| 8 | scoping | When to treat as major incident (`major-incident-management.md`) |
| 9 | scoping | Propose Major Incident candidate (`major-incident-management.md`) |

### Batch 3 — orders 10–14 · Incident · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 10 | configuration | Resolution-date auto-close property (`configure-incident-auto-close.md`) |
| 11 | configuration | Autoclose job fcRunAs user (`change-default-user.md`) |
| 12 | architecture | Incident Assignment PI solution (`predictive-intelligence-for-incident.md`) |
| 13 | architecture | PI plugins (`predictive-intelligence-for-incident.md`, `request-pred-intelli-inc-mgmt.md`) |
| 14 | configuration | Default variable editor on record producer targets (`service-catalog-variable-editor.md`) |

### Batch 4 — orders 15–19 · Incident · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 15 | scoping | Incident categorization (`incident-management-process.md`) |
| 16 | scoping | SLA purpose on incidents (`work-on-incidents.md`, SLM concepts) |
| 17 | configuration | CMDB use during diagnosis (`work-on-incidents.md`) |
| 18 | configuration | Related incidents by caller (`work-on-incidents.md`) |
| 19 | architecture | MIM workbench Summary tab (`mi-workbench-summary-tab.md`) |

### Batch 5 — orders 20–24 · Problem · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 20 | configuration | New → Assess business rule (official sample pattern) |
| 21 | scoping | Create problem for recurring incidents (`exploring-problem-management.md`) |
| 22 | scoping | Known Error state criteria |
| 23 | architecture | Known error article purpose (`create-known-error-from-problem.md`) |
| 24 | configuration | Change request from problem (`fix-a-change.md`) |

### Batch 6 — orders 25–29 · Problem (4) + Change (1) · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 25 | configuration | Root Cause Analysis problem task (`create-problem-task.md`) |
| 26 | architecture | Relate multiple incidents to one problem (`add-multiple-incidents-to-problem.md`) |
| 27 | configuration | Communicate workaround to related incidents (`communicate-workaround.md`) |
| 28 | scoping | Mark Duplicate during assess (`assess-a-problem.md`) |
| 29 | scoping | Why create a change request (`t_CreateAChange.md`, `using-change-management.md`) |

### Batch 7 — orders 30–34 · Change · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 30 | configuration | Conflict detection / blackout (`c_ConflictDetection.html`) |
| 31 | scoping | Standard vs Normal change (`change-types.html`) |
| 32 | scoping | Emergency change use cases (`change-types.html`) |
| 33 | architecture | Normal change definition (`change-types.html`) |
| 34 | configuration | Blackout schedule purpose (`t_CreateBlkoutMaintSched.html`) |

### Batch 8 — orders 35–39 · Change · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 35 | configuration | Normal model availability (`configure-normal-change-model-scm.html`) |
| 36 | configuration | Emergency model settings (`configure-emergency-change-model-scm.html`) |
| 37 | configuration | Standard changes via templates (`configure-standard-change-model-scm.html`) |
| 38 | configuration | Copy change attributes property (official sample pattern) |
| 39 | configuration | Copy related lists property (`configure-copy-change-request.html`) |

### Batch 9 — orders 40–44 · Change · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 40 | configuration | CAB purpose in Simplified CM (`configure-cab-change-management.html`) |
| 41 | configuration | CAB workbench use (`using-cab-workbench-cf.html`) |
| 42 | configuration | Risk score routing (`configure-risk-change-mgmt.html`) |
| 43 | architecture | Authorize state in normal lifecycle (`c_ChangeStateModel.html`) |
| 44 | configuration | Approval moves change to Scheduled (`t_ProcessAChangeRequest.html`) |

### Batch 10 — orders 45–49 · Change · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 45 | configuration | Change schedules role (`configure-schedules-for-simplified-change-management.md`) |
| 46 | scoping | Maintenance window vs blackout schedule |
| 47 | configuration | Schedule scope — CI class |
| 48 | architecture | Schedules feed conflict detection and enforcement |
| 49 | configuration | State change notification default recipient (`configure-state-change-notifications.md`) |

### Batch 11 — orders 50–54 · Service Portfolio · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 50 | architecture | Service portfolio scope — current, future, past services (`SPM2-service-portfolios.md`) |
| 51 | scoping | Service offering derives from parent service with commitments |
| 52 | configuration | `portfolio_admin` creates portfolios (`create-or-modify-SPM2-portfolios.md`) |
| 53 | architecture | Standard taxonomy nodes vs legacy layers (`SPM2-taxonomy.md`) |
| 54 | configuration | `portfolio_viewer` read scope (`r_InstalledWSPM2.html`) |

### Batch 12 — orders 55–59 · Catalog & Request · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 55 | architecture | Service Catalog portals and standardized fulfillment (`exploring-service-catalog.md`) |
| 56 | configuration | Record producer creates task records, not RITMs (`c_RecordProducer.md`) |
| 57 | configuration | Catalog variables capture choices and form structure (`c_ServiceCatalogVariables.md`) |
| 58 | configuration | Order guides — one request, multiple items (`c_ServiceCatalogOrderGuides.md`) |
| 59 | architecture | Request and Requested Item structure (`c_RequestingAServiceCatalogItem.md`) |

### Batch 13 — orders 60–64 · Catalog & Request · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 60 | scoping | Catalog item vs incident routing |
| 61 | configuration | Request Management triggered by sc_cat_item order (`request-management-architecture.md`) |
| 62 | configuration | Variables on sc_req_item only |
| 63 | configuration | Catalog Task activity on sc_req_item (`r_CatalogTask.html`) |
| 64 | integrations | Flow field on catalog item; clear Workflow/Execution Plan (`add-stages.md`) |

### Batch 14 — orders 65–69 · Catalog & Request · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 65 | architecture | Employee Center self-service capabilities (`employee-experience-employee-center.md`) |
| 66 | configuration | Open IT Ticket → Create incident with Now Assist (`open-ticket-native-ai-itsm.md`) |
| 67 | configuration | Browse catalogs and submit requests (`submit-cat-request-native-ai-itsm.md`) |
| 68 | scoping | Search/Now Assist deflection before incident creation (`search-solution-native-ai-itsm.md`) |
| 69 | configuration | Live agent handoff in Now Support chat (`get-support-using-chat.md`) |

### Batch 15 — orders 70–74 · Catalog & Request · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 70 | configuration | `producer.VARIABLE` vs `current.FIELD` (`c_PopulatingRecordData.md`) |
| 71 | configuration | Copy variable to short_description assignment |
| 72 | configuration | `producer.portal_redirect` after submit |
| 73 | configuration | Matching variable/field name auto-populates target field |
| 74 | configuration | Catalog client script g_form priority — mandatory over hide (`t_CreateACatalogClientScript.md`) |

### Batch 16 — orders 75–79 · CMDB · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 75 | architecture | CMDB stores CIs and relationships (`c_ITILConfigurationManagement.md`) |
| 76 | configuration | CI class creation role — `sn_cmdb_admin` or admin (`t_CreateCIType.md`) |
| 77 | configuration | Manual CI creation sets Discovery source Manual via IRE |
| 78 | configuration | Managed by Group via CI Class Manager (`csdm-data-synchronize-enable.md`) |
| 79 | architecture | CMDB Health, IRE, and Data Manager |

### Batch 17 — orders 80–84 · Cross-domain · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 80 | scoping | Incident → problem when widespread underlying error (`t_PromoteAnIncident.md`) |
| 81 | scoping | Incident → change when infrastructure modification required |
| 82 | configuration | Affected CIs and Refresh Impacted Services on change (`c_AffectedCIsAndImpactedServices.md`) |
| 83 | architecture | Problem Assess Confirm → Root Cause Analysis (`assess-a-problem.md`) |
| 84 | architecture | Change Review state post-implementation (`c_ChangeStateModel.md`) |

### Batch 18 — orders 85–89 · Gap fill · **DONE**

| Order | Lens | Topics |
|-------|------|--------|
| 85 | scoping | Major incident coordinated response (`major-incident-management.md`) |
| 86 | configuration | Problem Fix → Fix in Progress (`investigate-root-cause.md`) |
| 87 | scoping | Accept Risk resolution path |
| 88 | configuration | Associate CIs with problem (`add-multiple-cis-to-problem.md`) |
| 89 | configuration | Resolve then Complete with Fix Applied (`resolve-and-complete-problem.md`) |

---

## Merge and validate

```bash
# Merge one batch (overwrites matching trackCode+order)
node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/cis-itsm-v2-batch1.json

# Lint rewritten orders
node scripts/lint-cis-itsm-realism.mjs --orders=0-4

# Tests
npm run test -- --run src/convex/seed/cis-itsm-realism.test.ts src/convex/seed/trackQuality.test.ts

# After full rewrite
npm run seed:dev:questions
```

---

## Agent assignment template

> For **CIS-ITSM** batch **{N}** (orders **{START}–{END}**): read the listed ServiceNowDocs markdown files. Produce **exactly five** original multiple-choice questions in official CIS-ITSM exam style. Domain quota: **{DOMAIN}**. Mix sub-topics: **{SUBTOPICS}**. Output JSON array only. No choice wrapper phrases. Cite `canonical_url` in `sourceUrls`.
