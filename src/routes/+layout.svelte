<script lang="ts">
	import './layout.css';
	import '@fontsource-variable/material-symbols-outlined/full.css';
	import favicon from '$lib/assets/favicon.svg';
	import DisclaimBanner from '$lib/components/DisclaimBanner.svelte';
	import AppNav from '$lib/components/AppNav.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { ConvexClient } from 'convex/browser';
	import { setConvexClientContext } from 'convex-svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	let { children } = $props();

	const convexConfigured =
		typeof env.PUBLIC_CONVEX_URL === 'string' && env.PUBLIC_CONVEX_URL.length > 0;
	const convexUrl: string = convexConfigured
		? env.PUBLIC_CONVEX_URL!
		: 'https://placeholder.invalid.convex.cloud';
	const convexClient = new ConvexClient(convexUrl, {
		disabled: !browser || !convexConfigured
	});
	setConvexClientContext(convexClient);

	injectSpeedInsights();

	$effect(() => () => convexClient.close());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="flex min-h-screen flex-col bg-surface font-body text-on-surface selection:bg-secondary-container selection:text-on-secondary-container"
>
	<header class="fixed inset-x-0 top-0 z-50">
		<DisclaimBanner />
		<AppNav />
	</header>

	<main class="flex-1 pt-[7.25rem]">
		{@render children()}
	</main>

	<AppFooter />
</div>
