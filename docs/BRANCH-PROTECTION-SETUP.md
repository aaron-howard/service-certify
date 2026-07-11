# Branch Protection Setup

**Status:** Manual setup via GitHub UI (CLI API has formatting issues)

## What We're Setting Up

Branch protection rules on `main` to:

- Require a pull request before merging
- Require CI status checks to pass (see tiers below)
- Dismiss stale pull request approvals when new commits are pushed
- Require branches to be up to date before merging

## Required checks: current vs recommended

GitHub only blocks merges for checks you **explicitly add** under branch protection. Workflows and apps can run on every PR without being required.

| Check | Workflow / source | Currently required? | Recommended |
|---|---|---|---|
| `check-and-build` | `.github/workflows/ci.yml` | Yes | **Required** — typecheck, unit tests, production build |
| `npm-audit` | `.github/workflows/security-audit.yml` | Yes | **Required** — dependency vulnerability gate |
| `e2e-tests` | `.github/workflows/ci.yml` | No | **Required** — Playwright smoke/regression; same workflow as `check-and-build` but a separate job |
| CodeQL (`Analyze (javascript-typescript)`, etc.) | GitHub Advanced Security | No | Optional — strong signal; add when you want SAST to block merge |
| `semgrep-cloud-platform/scan` | Semgrep GitHub App | No | Optional — add if Semgrep should block merge |
| Vercel / Vercel Preview Comments | Vercel integration | No | Optional — preview deploy signal; usually not a merge gate |

### Why not everything is required today

1. **Opt-in by design** — Branch protection lists only checks you select in the GitHub UI. Installing Vercel, Semgrep, or CodeQL does not make them required automatically.
2. **Minimal gate was intentional** — `check-and-build` + `npm-audit` give a fast, reliable bar (compile, unit test, build, dependency audit).
3. **`e2e-tests` is easy to miss** — It lives in the same CI workflow as `check-and-build` but is a **separate job**. Requiring `check-and-build` does not implicitly require e2e; you must add `e2e-tests` explicitly.
4. **Third-party checks are optional trade-offs** — CodeQL and Semgrep add security coverage but can increase time-to-merge or noise; Vercel checks confirm preview deploys, not code quality.

### Recommended required set (Jul 2026)

Require these three status checks on `main`:

1. `check-and-build`
2. `e2e-tests`
3. `npm-audit`

Keep CodeQL, Semgrep, and Vercel as informational unless you decide they should block merge.

## Steps (5 minutes)

1. **Go to GitHub Settings:**
   - Navigate to: https://github.com/aaron-howard/service-certify/settings/branches
   - Or: Repository → Settings → Branches

2. **Click "Add rule" or "Edit" on existing `main` branch protection:**
   - Branch name pattern: `main`

3. **Configure the following:**

   **Section 1: Pull Requests**
   - [x] Require a pull request before merging
   - [x] Require approvals: **1** (or **0** for solo maintainer — match your team policy)
   - [x] Dismiss stale pull request approvals when new commits are pushed
   - [ ] Require review from code owners
   - [ ] Require approval of the most recent push

   **Section 2: Status Checks**
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging
   - **Status checks to require (recommended):**
     - `check-and-build` — from `.github/workflows/ci.yml`
     - `e2e-tests` — from `.github/workflows/ci.yml` (same workflow, different job)
     - `npm-audit` — from `.github/workflows/security-audit.yml`

   **Optional — add later if you want stricter security gates:**
   - CodeQL: `Analyze (javascript-typescript)` (and related CodeQL jobs if listed)
   - Semgrep: `semgrep-cloud-platform/scan`

   **Section 3: Advanced Options**
   - [ ] Require code owner reviews (not needed for solo dev)
   - [ ] Allow force pushes: **Anybody**? → No, leave as default
   - [ ] Allow deletions: **No**

4. **Click "Create" or "Save changes"**

5. **Verify:**
   - Open or refresh a PR
   - Confirm all three required checks appear under "Required" in the merge box
   - Confirm merge is blocked if any required check fails

## Result

- **Protected:** No direct pushes to `main` (when PR requirement is enabled)
- **Safe:** Code is typechecked, unit-tested, built, e2e-tested, and dependency-audited before merge
- **Automated:** CI gates prevent broken code; optional security/deploy checks remain visible

## Troubleshooting

**"Status checks to require" not showing?**
→ Run the workflow on `main` or open a PR first. Status checks appear after the job has run at least once.

**Added `check-and-build` but e2e still doesn't block merge?**
→ Add `e2e-tests` separately. Each CI job is its own status check.

**Third-party check not in the picker?**
→ The app must report a status on the PR first. Open a PR, wait for Semgrep/CodeQL/Vercel to finish, then return to branch protection and search for the check name.

**Want to bypass protection temporarily?**
→ Branch protection rule → Allow force pushes → perform push → disable again (use sparingly).

**Can't merge because approval is needed?**
→ Approve via GitHub UI, or set required approvals to 0 for solo maintainer workflows.

## Test It

Once protection is active:

```bash
git checkout -b test-branch-protection
echo "# test" >> README.md
git add README.md
git commit -m "test: branch protection"
git push origin test-branch-protection
# → Open PR; merge should wait for check-and-build, e2e-tests, and npm-audit
```

Direct push to `main` should be rejected when PR requirement is enabled.

## Related

- `.github/workflows/ci.yml` — `check-and-build`, `e2e-tests`
- `.github/workflows/security-audit.yml` — `npm-audit`
- [`TESTING.md`](./TESTING.md) — local test commands mirrored in CI
- [`PRODUCTION_READINESS_AUDIT.md`](./PRODUCTION_READINESS_AUDIT.md) — launch checklist item for branch protection
