# ADR-003: Why Vercel for Deployment

**Date:** 2024-01 | **Status:** Accepted | **Author:** Aaron Howard

## Problem

Service Certify needed a hosting platform that:
- Deploys SvelteKit with zero configuration
- Provides automatic scaling for variable load
- Offers global CDN with low latency
- Integrates with GitHub for CI/CD
- Requires minimal DevOps effort

## Decision

Deploy on **Vercel** using the `@sveltejs/adapter-vercel` adapter.

## Rationale

| Factor | Vercel | Netlify | AWS (EC2/ECS) | DigitalOcean |
|--------|--------|---------|---------------|--------------|
| **SvelteKit support** | ✅ Native | ✅ Native | ⚠️ Manual | ⚠️ Manual |
| **Zero-config setup** | ✅ Framework detection | ✅ Framework detection | ❌ Requires setup | ⚠️ Some setup |
| **Auto-scaling** | ✅ Built-in | ✅ Built-in | ⚠️ Need ALB/ASG | ⚠️ Manual scaling |
| **Global CDN** | ✅ Vercel Edge | ✅ Netlify Edge | ⚠️ Extra cost (CloudFront) | ❌ No global CDN |
| **GitHub integration** | ✅ Native | ✅ Native | ⚠️ Need GitHub Actions | ⚠️ Need GitHub Actions |
| **Cost (10K users)** | ✅ $100–300/mo | ✅ $100–200/mo | ⚠️ $50–500/mo | ✅ $50–100/mo |
| **DevOps overhead** | ✅ Minimal | ✅ Minimal | ❌ High | ⚠️ Medium |
| **Preview URLs** | ✅ Every PR | ✅ Every PR | ❌ Manual setup | ❌ Not built-in |

## Key Benefits

1. **Zero configuration** — Push to GitHub, Vercel auto-deploys
2. **Preview deployments** — Every PR gets a staging URL for testing
3. **Built-in observability** — Analytics, Speed Insights, error logs in dashboard
4. **Global deployment** — Automatic multi-region for low latency
5. **Perfect for SvelteKit** — Vercel's team created SvelteKit adapter
6. **One-click rollback** — Revert to previous deployment if issues arise

## Constraints

- **Vendor lock-in:** Redeploying elsewhere requires testing adapter compatibility
- **Cost at scale:** Function limits (12s timeout default, 3GB RAM) may require paying tier
- **Regional limits:** Edge Functions limited to certain regions

## Alternatives Considered

**Netlify**
- Pro: Similar feature set, competitive pricing
- Con: Slightly less tight SvelteKit integration, same vendor lock-in

**AWS (EC2 / ECS)**
- Pro: Ultimate flexibility, pay-per-resource, self-hosted option
- Con: High DevOps overhead, complex scaling setup, need CI/CD pipeline

**DigitalOcean App Platform**
- Pro: Lower cost, simpler than AWS
- Con: Less mature auto-scaling, smaller ecosystem, preview URLs not as seamless

## Implementation

- **Adapter:** `@sveltejs/adapter-vercel` in `svelte.config.js`
- **Build:** `npm run build` → outputs to `.vercel/output/`
- **Deploy:** Push to `main` branch, Vercel auto-deploys
- **Environment:** Vercel dashboard for `PUBLIC_CONVEX_URL`, secrets via Vercel env
- **Monitoring:** Vercel Analytics dashboard + Speed Insights

## Configuration

**svelte.config.js:**
```js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter()
  }
};
```

**No `vercel.json` needed** — Adapter handles all configuration.

## Related Decisions

- [[ADR-002-sveltekit-frontend]] — SvelteKit chose Vercel as primary deployment target
- [[ADR-001-convex-backend]] — Convex + Vercel work seamlessly together

## Revisit Trigger

Reconsider if:
- Cost becomes prohibitive (>$1K/month) → evaluate AWS or self-hosting
- Need custom infrastructure (GPU, long-running processes) → AWS required
- Multi-cloud requirement for redundancy → need abstraction layer

## References

- [Vercel SvelteKit guide](https://vercel.com/docs/frameworks/sveltekit)
- [Vercel deployment docs](https://vercel.com/docs/deployments)
- [SvelteKit adapter-vercel](https://github.com/sveltejs/kit/tree/master/packages/adapter-vercel)
