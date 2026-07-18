# Security Policy

Thank you for helping keep **Service Certify** and its users safe.

## Supported versions

Security fixes are applied to the latest code on `main` and the current production deployment only. Older forks, local checkouts, and unofficial builds are not supported for security patches.

## Reporting a vulnerability

**Please do not open a public GitHub issue** for security vulnerabilities that are not yet fixed.

### Preferred: GitHub private vulnerability reporting

Use GitHub’s private vulnerability reporting for this repository (Security tab → **Report a vulnerability**), if enabled.

### Fallback: email

If private reporting is unavailable, email **support@service-certify.com** with a subject line that starts with `[SECURITY]`.

### What to include

Please provide as much of the following as you can:

- A clear description of the issue and its potential impact
- Step-by-step reproduction instructions (PoC, request/response samples, or screenshots)
- Affected URL, route, API, or component (for example SvelteKit API routes, Convex functions, auth/session handling)
- Whether credentials, session tokens, or personal data were accessed
- Your preferred contact method and whether you want public credit after a fix

### Response expectations

We aim to acknowledge reports within a few business days. When practical, we will coordinate disclosure after a fix or mitigation is available.

## Scope

### In scope

Security issues in **this repository** and the Service Certify application it builds, including:

- Authentication and authorization flaws (WorkOS session cookies, Convex JWT validation, admin role / `ADMIN_EMAILS` bypass)
- Privilege escalation or access to other users’ accounts, progress, or data
- Insecure direct object references (IDOR) on account, progress, grading, or related APIs
- Cross-site scripting (XSS), CSRF, injection, or similar issues in SvelteKit routes or Convex functions
- Exposure of secrets or credentials in this repo, build artifacts, or deploy configuration for this app
- Rate-limit bypasses on public APIs with clear security or abuse impact
- Dependency vulnerabilities that are **exploitable in this application**

### Out of scope

- Vulnerabilities in third-party platforms themselves (WorkOS, Convex, Vercel, Upstash, Sentry, identity providers)—please report those to the vendor
- Practice exam question accuracy, content quality, or exam intellectual property concerns
- Issues that require privileged access only to a cloud dashboard you do not own
- Social engineering, phishing, or physical attacks
- Denial of service without a distinct application vulnerability
- Static design prototypes under `stitch_service_certify_prd/`
- Unimplemented features (for example Phase D payments / membership billing)

## Safe harbor

We welcome good-faith security research. If you follow this policy and:

- Avoid privacy violations, destruction of data, and disruption of production service
- Do not access or retain other users’ data beyond what is needed to demonstrate impact
- Report findings promptly through the channels above

we will not pursue legal action against you for that research.

## Dependency and automated scanning

This repository uses Dependabot for npm dependency updates and a scheduled `npm audit` workflow. Many dependency advisories are already tracked via automated pull requests; reports that show a **practical exploit path in Service Certify** are still appreciated.
