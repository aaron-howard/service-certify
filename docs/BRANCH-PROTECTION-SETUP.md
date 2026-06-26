# Branch Protection Setup

**Status:** Manual setup via GitHub UI (CLI API has formatting issues)

## What We're Setting Up

Branch protection rules on `main` branch to:
- Require 1 pull request review before merging
- Require CI checks to pass (`check-and-build`, `npm-audit`)
- Dismiss stale pull request approvals
- Require branches to be up to date before merging

## Steps (5 minutes)

1. **Go to GitHub Settings:**
   - Navigate to: https://github.com/aaron-howard/service-certify/settings/branches
   - Or: Repository → Settings → Branches

2. **Click "Add rule" or "Edit" on existing main branch protection:**
   - Branch name pattern: `main`

3. **Configure the following:**

   **Section 1: Pull Requests**
   - [x] Require a pull request before merging
   - [x] Require approvals: **1**
   - [x] Dismiss stale pull request approvals when new commits are pushed
   - [ ] Require review from code owners
   - [ ] Require approval of the most recent push

   **Section 2: Status Checks**
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging
   - **Status checks to require:**
     - Type `check-and-build` and select it (from `.github/workflows/ci.yml`)
     - Type `npm-audit` and select it (from `.github/workflows/security-audit.yml`)

   **Section 3: Advanced Options**
   - [ ] Require code owner reviews (not needed for solo dev)
   - [ ] Allow force pushes: **Anybody**? → No, leave as default
   - [ ] Allow deletions: **No**

4. **Click "Create" or "Save changes"**

5. **Verify:**
   - Go to a branch (or create test branch)
   - Try creating a dummy PR
   - Check that CI workflow runs
   - Confirm you cannot merge without:
     - CI passing
     - 1 approval (you'll need to ask someone else to approve, or disable temporarily for testing)

## Result

✅ **Protected:** No direct pushes to `main`  
✅ **Safe:** All code reviewed and tested before merge  
✅ **Automated:** CI gates prevent broken code

## Troubleshooting

**"Status checks to require" not showing?**
→ Run a workflow on main first (make any commit and push). Status checks appear after first workflow run.

**Want to bypass protection temporarily?**
→ Go to Branch protection rule → Check "Allow force pushes → Everybody" → Do the force push → Uncheck it

**Can't merge because 1 approval needed?**
→ Use GitHub's "Approve and merge" if you have permission, or ask collaborator to review

## Test It

Once protection is active, try this workflow:

```bash
# Make a change on main locally
git checkout main
echo "# Test" >> README.md
git add README.md
git commit -m "test: branch protection"

# Try to push directly (will fail on GitHub side)
git push origin main
# → Rejected: "Cannot push to main branch"

# Correct workflow: create PR instead
git checkout -b test-branch
git push origin test-branch
# → Create PR on GitHub, get review, merge via web UI
```

## Related

- `.github/workflows/ci.yml` — Defines `check-and-build` status check
- `.github/workflows/security-audit.yml` — Defines `npm-audit` status check
