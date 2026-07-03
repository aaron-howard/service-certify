<script lang="ts">
	import './layout.css';
	import '@fontsource-variable/material-symbols-outlined/full.css';
	import '@fontsource-variable/manrope/wght.css';
	import '@fontsource-variable/inter/wght.css';
	import DisclaimBanner from '$lib/components/DisclaimBanner.svelte';
	import AppNav from '$lib/components/AppNav.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { ConvexClient } from 'convex/browser';
	import { setConvexClientContext } from 'convex-svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	let { children, data } = $props();

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

<div
	class="flex min-h-screen flex-col bg-surface font-body text-on-surface selection:bg-secondary-container selection:text-on-secondary-container"
>
	<header class="fixed inset-x-0 top-0 z-50">
		<DisclaimBanner />
		<AppNav user={data.user} />
	</header>

	<main class="flex-1 pt-[7.25rem]">
		{@render children()}
	</main>

	<AppFooter />
</div>
