# Changelog

All notable changes to Service Certify are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-03

First soft-launch MVP release. Production continues to deploy from `main` on Vercel;
this tag marks the human-facing release channel.

### Added
- Practice exams across 22 ServiceNow certification tracks (sample + admin full mock)
- WorkOS AuthKit sign-in, Convex user sync, settings/account deletion, dashboard progress
- Grade API with Upstash rate limiting; health endpoint with Convex + rate-limiter checks
- Sentry error/performance/replay wiring; Vercel Speed Insights
- Soft-launch Sentry alert automation (`npm run sentry:login` / `npm run setup:sentry-alerts`)
- Semver + git revision on `/api/health` (`version`, `revision`, `versionId`)
- Release process: `CHANGELOG.md`, `docs/RELEASES.md`, tag → GitHub Release workflow

### Fixed
- Moderate `tar` advisory via lockfile bump to 7.5.22 (GHSA-r292-9mhp-454m)

[Unreleased]: https://github.com/aaron-howard/service-certify/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/aaron-howard/service-certify/releases/tag/v0.1.0
