<script lang="ts">
	import { page } from '$app/state';
	import { absoluteAppUrl, getPublicAppUrl } from '$lib/siteUrl';

	/**
	 * Shared canonical + Open Graph tags when PUBLIC_APP_URL is set.
	 * Per-page title/description still come from each route's svelte:head.
	 */
	const canonical = $derived(absoluteAppUrl(page.url.pathname) ?? null);
	const siteOrigin = $derived(getPublicAppUrl());
</script>

{#if canonical}
	<link rel="canonical" href={canonical} />
	<meta property="og:url" content={canonical} />
{/if}
{#if siteOrigin}
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Service Certify" />
	<meta name="twitter:card" content="summary" />
{/if}
