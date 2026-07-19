# Service Certify Wiki

**Service Certify** is a ServiceNow certification **practice** platform: browse exam tracks, open detail pages, and run practice sessions (single, multi-select, and match).

| | |
| --- | --- |
| **App** | [service-certify.vercel.app](https://service-certify.vercel.app) |
| **Repository** | [aaron-howard/service-certify](https://github.com/aaron-howard/service-certify) |
| **Stack** | SvelteKit 2 · Svelte 5 · Tailwind CSS v4 · Convex · WorkOS · Vercel |

Canonical technical docs live in the repo under [`docs/`](https://github.com/aaron-howard/service-certify/tree/main/docs). This wiki is a short orientation map for contributors and operators.

## Quick start

```bash
npm install
cp .env.example .env.local
# Set PUBLIC_CONVEX_URL (see .env.convex for the shared dev deployment URL)
npm run convex:dev   # terminal 1 — Convex backend
npm run dev          # terminal 2 — http://localhost:5173
```

**Requirements:** Node.js `>=22.11.0`, npm.

Without Convex, the exam catalog still renders from static data. Practice questions, OAuth→Convex user sync, and progress persistence require `PUBLIC_CONVEX_URL`.

Seed after Convex is configured:

```bash
npm run seed:dev            # certification tracks
npm run seed:dev:questions  # practice question bank (22 tracks)
```

Full setup: [README.md](https://github.com/aaron-howard/service-certify/blob/main/README.md)

## Architecture (summary)

```
Browser (SvelteKit)
    │ HTTPS
    ▼
Vercel (SSR + API routes, WorkOS session cookies, Upstash rate limits)
    │ HTTPS
    ▼
Convex (practiceQuestions, users, userProgress, gradeAnswers, …)
```

- **Catalog:** static [`src/lib/data/exams.ts`](https://github.com/aaron-howard/service-certify/blob/main/src/lib/data/exams.ts); domains from blueprint sources in `trackDocSources.ts`
- **Practice:** Convex `practiceQuestions`; grading via `POST /api/practice/grade`
- **Auth:** WorkOS OAuth → httpOnly cookies; admin full-mock gated by `ADMIN_EMAILS` / role
- **Details:** [docs/architecture.md](https://github.com/aaron-howard/service-certify/blob/main/docs/architecture.md)

## Key commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | SvelteKit / Vite local server |
| `npm run convex:dev` | Convex deploy + watch |
| `npm run check` | Typecheck + svelte-check |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run seed:dev:questions` | Push question bank to Convex |
| `npm run audit` | `npm audit` (moderate+) |

## Documentation map

| Topic | In-repo doc |
| --- | --- |
| Doc index | [docs/README.md](https://github.com/aaron-howard/service-certify/blob/main/docs/README.md) |
| Launch checklist | [PRODUCTION_READINESS_AUDIT.md](https://github.com/aaron-howard/service-certify/blob/main/docs/PRODUCTION_READINESS_AUDIT.md) |
| Auth (WorkOS) | [AUTH-WORKOS.md](https://github.com/aaron-howard/service-certify/blob/main/docs/AUTH-WORKOS.md) |
| Rate limiting | [RATE-LIMITING.md](https://github.com/aaron-howard/service-certify/blob/main/docs/RATE-LIMITING.md) |
| Monitoring | [HEALTH-AND-MONITORING.md](https://github.com/aaron-howard/service-certify/blob/main/docs/HEALTH-AND-MONITORING.md) |
| Testing | [TESTING.md](https://github.com/aaron-howard/service-certify/blob/main/docs/TESTING.md) · [E2E-AND-A11Y.md](https://github.com/aaron-howard/service-certify/blob/main/docs/E2E-AND-A11Y.md) |
| Branch protection | [BRANCH-PROTECTION-SETUP.md](https://github.com/aaron-howard/service-certify/blob/main/docs/BRANCH-PROTECTION-SETUP.md) |
| Question bank | [certification-questions.md](https://github.com/aaron-howard/service-certify/blob/main/docs/agent-prompts/certification-questions.md) |
| Security policy | [SECURITY.md](https://github.com/aaron-howard/service-certify/blob/main/.github/SECURITY.md) |

## On-call runbooks

| Symptom | Runbook |
| --- | --- |
| Site won't load / bad deploy | [RUNBOOK-ROLLBACK-VERCEL.md](https://github.com/aaron-howard/service-certify/blob/main/docs/runbooks/RUNBOOK-ROLLBACK-VERCEL.md) |
| Questions don't load | [RUNBOOK-RESTART-CONVEX.md](https://github.com/aaron-howard/service-certify/blob/main/docs/runbooks/RUNBOOK-RESTART-CONVEX.md) |
| Data missing | [RUNBOOK-RESTORE-BACKUP.md](https://github.com/aaron-howard/service-certify/blob/main/docs/runbooks/RUNBOOK-RESTORE-BACKUP.md) |

## CI & supply chain

- **CI:** check + unit tests + build + Playwright E2E ([`.github/workflows/ci.yml`](https://github.com/aaron-howard/service-certify/blob/main/.github/workflows/ci.yml))
- **Security audit:** scheduled / PR `npm audit` ([`.github/workflows/security-audit.yml`](https://github.com/aaron-howard/service-certify/blob/main/.github/workflows/security-audit.yml))
- **Dependabot:** npm + GitHub Actions version updates ([`.github/dependabot.yml`](https://github.com/aaron-howard/service-certify/blob/main/.github/dependabot.yml))

## Support

- In-app: [/support](https://service-certify.vercel.app/support)
- Email: support@service-certify.com
- Security reports: see [SECURITY.md](https://github.com/aaron-howard/service-certify/blob/main/.github/SECURITY.md) (prefer GitHub private vulnerability reporting)

## License

[MIT](https://github.com/aaron-howard/service-certify/blob/main/LICENSE)
