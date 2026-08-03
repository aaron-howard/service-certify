# Releases

Service Certify uses **semver** in `package.json` for the human release channel, and
**git SHA** (via Vercel) so each production deploy stays uniquely identifiable.

| Signal | Source | Example |
|--------|--------|---------|
| Product version | `package.json` → `/api/health.version` | `0.1.0` |
| Deploy revision | Build-time `VITE_GIT_COMMIT_SHA`, else `VERCEL_GIT_COMMIT_SHA`, else `GITHUB_SHA` → `/api/health.revision` | `1f1e66b983bd` |
| Compact id | `/api/health.versionId` | `0.1.0+1f1e66b983bd` |
| Sentry release | `service-certify@<semver>+<sha>` | `service-certify@0.1.0+1f1e66b983bd` |
| GitHub Release | Annotated tag `vX.Y.Z` | [v0.1.0](https://github.com/aaron-howard/service-certify/releases/tag/v0.1.0) |

Vercel still ships every merge to `main`. Tags do **not** gate deploys; they label
what we consider a released product cut.

## Cut a release

1. On a PR (or `main`), bump `package.json` / `package-lock.json` version.
2. Move notes from **Unreleased** into a new section in [`CHANGELOG.md`](../CHANGELOG.md).
3. Merge the PR to `main` and wait for CI + production deploy.
4. From an up-to-date `main`:

```bash
npm run release:tag:push
```

That creates annotated tag `vX.Y.Z` and pushes it.  
[`.github/workflows/release.yml`](../.github/workflows/release.yml) then publishes a
GitHub Release from the matching CHANGELOG section.

Dry-run (tag locally only):

```bash
npm run release:tag
```

## Version policy (soft launch)

| Bump | When |
|------|------|
| **0.y.z** (minor) | Soft-launch milestones / notable feature sets |
| **0.y.z+1** (patch) | Fixes, dependency security bumps, ops tooling |
| **1.0.0** | Public launch / paid membership GA (Phase D) |

## Verify production version

```bash
curl -s https://service-certify.vercel.app/api/health | jq '{version, revision, versionId, status}'
```

Sentry → Releases should show `service-certify@<version>+<sha>` after the deploy that
includes this wiring.

## Related

- [`CHANGELOG.md`](../CHANGELOG.md)
- [`HEALTH-AND-MONITORING.md`](./HEALTH-AND-MONITORING.md)
- [`SENTRY-SETUP.md`](./SENTRY-SETUP.md)
- [`PRODUCTION_READINESS_AUDIT.md`](./PRODUCTION_READINESS_AUDIT.md)
