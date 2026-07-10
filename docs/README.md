# Service Certify Documentation

Welcome to the Service Certify docs. Use this directory to understand how the app is built and how to operate it.

**Last updated:** 2026-07-10

## For Developers

**Getting started?**
- Start with root [`README.md`](../README.md) for setup and quick start
- Env template: [`.env.example`](../.env.example)

**Want to understand the system?**
- Read [`architecture.md`](./architecture.md) — System design, data flow, known gaps
- Read [`PRODUCTION_READINESS_AUDIT.md`](./PRODUCTION_READINESS_AUDIT.md) — Launch checklist (done vs remaining)

**Auth?**
- [`AUTH-WORKOS.md`](./AUTH-WORKOS.md) — Full WorkOS setup, admin bootstrap, troubleshooting
- [`auth-setup.md`](./auth-setup.md) — Short checklist + outstanding auth work

**Observability & reliability?**
- [`HEALTH-AND-MONITORING.md`](./HEALTH-AND-MONITORING.md) — `/api/health`, Speed Insights, alerts
- [`SENTRY-SETUP.md`](./SENTRY-SETUP.md) — Error tracking
- [`RATE-LIMITING.md`](./RATE-LIMITING.md) — Upstash rate limits

**Testing?**
- [`TESTING.md`](./TESTING.md) — Vitest unit tests
- [`E2E-AND-A11Y.md`](./E2E-AND-A11Y.md) — Playwright + axe

**Making architectural decisions?**
- Check [`adr/`](./adr/) for past decisions
- Add a new ADR for major choices (template below)

**CI / GitHub?**
- [`BRANCH-PROTECTION-SETUP.md`](./BRANCH-PROTECTION-SETUP.md) — Manual branch protection on `main`

**Question bank?**
- [`agent-prompts/certification-questions.md`](./agent-prompts/certification-questions.md) — Authoring / merge / seed pipeline
- [`agent-prompts/batch-assignments/`](./agent-prompts/batch-assignments/) — Per-track v2 plans (complete)

## For On-Call / Operations

**Something is broken?**
- Go to [`runbooks/`](./runbooks/) and find your symptom
- Follow the steps to diagnose and resolve

**Common scenarios:**
- **"Site won't load"** → [`runbooks/RUNBOOK-ROLLBACK-VERCEL.md`](./runbooks/RUNBOOK-ROLLBACK-VERCEL.md)
- **"Questions don't load"** → [`runbooks/RUNBOOK-RESTART-CONVEX.md`](./runbooks/RUNBOOK-RESTART-CONVEX.md)
- **"Data is missing"** → [`runbooks/RUNBOOK-RESTORE-BACKUP.md`](./runbooks/RUNBOOK-RESTORE-BACKUP.md)

**Launch / prod cutover?**
- [`PRODUCTION_READINESS_AUDIT.md`](./PRODUCTION_READINESS_AUDIT.md) → Manual ops checklist

## Folder Structure

```
docs/
├── README.md                      ← You are here
├── PRODUCTION_READINESS_AUDIT.md  ← Launch checklist (done / remaining / Phase D)
├── architecture.md                ← System design and data flow
├── AUTH-WORKOS.md                 ← WorkOS OAuth + admin full mock
├── auth-setup.md                  ← Short auth checklist
├── HEALTH-AND-MONITORING.md       ← Health endpoint + Speed Insights
├── SENTRY-SETUP.md                ← Sentry DSN setup
├── RATE-LIMITING.md               ← Upstash rate limiting
├── TESTING.md                     ← Vitest
├── E2E-AND-A11Y.md                ← Playwright + a11y
├── BRANCH-PROTECTION-SETUP.md     ← GitHub protection rules
├── adr/
│   ├── ADR-001-convex-backend.md
│   ├── ADR-002-sveltekit-frontend.md
│   └── ADR-003-vercel-hosting.md
├── agent-prompts/
│   ├── certification-questions.md
│   └── batch-assignments/         ← Track v2 batch plans
└── runbooks/
    ├── README.md
    ├── RUNBOOK-RESTART-CONVEX.md
    ├── RUNBOOK-ROLLBACK-VERCEL.md
    └── RUNBOOK-RESTORE-BACKUP.md
```

## How to Add Documentation

### Adding an ADR (Architecture Decision Record)

1. Create `docs/adr/ADR-NNN-title-slug.md`
2. Use this template:

```markdown
# ADR-NNN: Decision Title

**Date:** YYYY-MM | **Status:** Proposed/Accepted/Deprecated | **Author:** Name

## Problem

What question or constraint prompted this decision?

## Decision

What did you decide to do? (One sentence)

## Rationale

Why this choice? Compare alternatives.

## Constraints

What are the downsides or limitations?

## Alternatives Considered

- Option A: pro/con
- Option B: pro/con

## Revisit Trigger

When should we reconsider this decision?

## References

Links to related docs, tools, or discussions.
```

3. Link from other ADRs with relative markdown links
4. Update this README with the new ADR

### Adding a Runbook

1. Create `docs/runbooks/RUNBOOK-SYMPTOM.md`
2. Use the template in [`runbooks/README.md`](./runbooks/README.md)
3. Add to the runbooks index
4. Link from related docs

## Documentation Standards

- **Keep it concise:** One page per doc (or use sections)
- **Assume reader is in a crisis:** Write for someone debugging at 3 AM
- **Include verification steps:** How do you know the fix worked?
- **Link liberally:** Prefer relative markdown links between docs
- **Update as you learn:** Docs are living; fix them when you find errors
- **Match the code:** If Phase labels or “future” language is wrong, update the doc in the same PR as the feature

## Versioning

Docs are tied to the main branch. When you deploy:
- Critical docs (runbooks, architecture, production audit) should match the deployed version
- If a runbook becomes outdated, update it immediately
- If an ADR is reversed, change status to **Deprecated** and link to the new one

## Questions?

If docs don't answer your question:
1. Search existing docs first
2. Check GitHub issues
3. Add the answer to a runbook, ADR, or the production audit
4. Create a new doc if it's a common gap

---

**Maintained by:** Engineering team
