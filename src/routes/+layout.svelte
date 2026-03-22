<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import DisclaimBanner from '$lib/components/DisclaimBanner.svelte';
	import AppNav from '$lib/components/AppNav.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { ConvexClient } from 'convex/browser';
	import { setConvexClientContext } from 'convex-svelte';

	let { children } = $props();

	/**
	 * convex-svelte's useQuery() calls useConvexClient() before "skip" is evaluated, so the client
	 * must exist during SSR. Match setupConvex(): disabled when not in browser or when no URL.
	 */
	const convexConfigured =
		typeof PUBLIC_CONVEX_URL === 'string' && PUBLIC_CONVEX_URL.length > 0;
	const convexUrl = convexConfigured
		? PUBLIC_CONVEX_URL
		: 'https://placeholder.invalid.convex.cloud';
	const convexClient = new ConvexClient(convexUrl, {
		disabled: !browser || !convexConfigured
	});
	setConvexClientContext(convexClient);

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
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
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
