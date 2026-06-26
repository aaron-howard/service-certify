# Service Certify Documentation

Welcome to the Service Certify docs. Use this directory to understand how the app is built and how to operate it.

## For Developers

**Getting started?**
- Start with root [`README.md`](../README.md) for setup and quick start

**Want to understand the system?**
- Read [`architecture.md`](./architecture.md) — System design, data flow, scaling

**Making architectural decisions?**
- Check [`adr/`](./adr/) folder for past decisions and reasoning
- Add new ADR if you're making a major choice (see ADR template below)

**Need to fix something?**
- See [`auth-setup.md`](./auth-setup.md) for authentication wiring (Phase C)
- See [`BRANCH-PROTECTION-SETUP.md`](./BRANCH-PROTECTION-SETUP.md) for GitHub protection rules

## For On-Call / Operations

**Something is broken?**
- Go to [`runbooks/`](./runbooks/) and find your symptom
- Follow the steps to diagnose and resolve

**Common scenarios:**
- **"Site won't load"** → [`runbooks/RUNBOOK-ROLLBACK-VERCEL.md`](./runbooks/RUNBOOK-ROLLBACK-VERCEL.md)
- **"Questions don't load"** → [`runbooks/RUNBOOK-RESTART-CONVEX.md`](./runbooks/RUNBOOK-RESTART-CONVEX.md)
- **"Data is missing"** → [`runbooks/RUNBOOK-RESTORE-BACKUP.md`](./runbooks/RUNBOOK-RESTORE-BACKUP.md)

## Folder Structure

```
docs/
├── README.md                    ← You are here
├── architecture.md              ← System design diagram and explanation
├── auth-setup.md                ← How to wire authentication (Phase C)
├── BRANCH-PROTECTION-SETUP.md   ← GitHub branch protection config
├── adr/
│   ├── ADR-001-convex-backend.md         ← Why Convex
│   ├── ADR-002-sveltekit-frontend.md     ← Why SvelteKit
│   └── ADR-003-vercel-hosting.md         ← Why Vercel
└── runbooks/
    ├── README.md                        ← Incident response overview
    ├── RUNBOOK-RESTART-CONVEX.md        ← Fix Convex timeouts
    ├── RUNBOOK-ROLLBACK-VERCEL.md       ← Fix app crashes
    └── RUNBOOK-RESTORE-BACKUP.md        ← Recover from data loss
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

3. Link from other ADRs: `[[ADR-NNN-title]]`
4. Update this README with the new ADR

### Adding a Runbook

1. Create `docs/runbooks/RUNBOOK-SYMPTOM.md`
2. Use this template:

```markdown
# Runbook: Problem Title

**Severity:** P0/P1/P2/P3  
**Owner:** Role  
**Time to resolve:** Estimated minutes  

## Symptoms

- Symptom 1
- Symptom 2

## Root Causes

1. Cause A
2. Cause B

## Resolution Steps

Step-by-step instructions.

## Validation

Checklist to confirm fix worked.

## Escalation

When to call for help.

## Related Runbooks

- [[RUNBOOK-OTHER]]
```

3. Add to `docs/runbooks/README.md` index
4. Link from other runbooks

## Documentation Standards

- **Keep it concise:** One page per doc (or use sections)
- **Assume reader is in a crisis:** Write for someone debugging at 3 AM
- **Include verification steps:** How do you know the fix worked?
- **Link liberally:** Use `[[name]]` for ADRs/runbooks, regular markdown links for other docs
- **Update as you learn:** Docs are living; fix them when you find errors
- **Add examples:** Code snippets, commands, curl requests help

## Versioning

Docs are tied to the main branch. When you deploy:
- Critical docs (runbooks, architecture) should be accurate for the deployed version
- If a runbook becomes outdated, update it immediately
- If an ADR is reversed, change status to **Deprecated** and link to the new one

## Questions?

If docs don't answer your question:
1. Search existing docs first
2. Check GitHub issues (may have answers)
3. Add the question to a runbook or ADR "Troubleshooting" section
4. Create a new doc if it's a common gap

---

**Last updated:** 2026-06-25  
**Maintained by:** Engineering team  
**Feedback:** See contributing guide in root repo
