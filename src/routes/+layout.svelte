<script lang="ts">
	import './layout.css';
	import '@fontsource-variable/material-symbols-outlined/full.css';
	import '@fontsource-variable/manrope/wght.css';
	import '@fontsource-variable/inter/wght.css';
	import DisclaimBanner from '$lib/components/DisclaimBanner.svelte';
	import DeployEnvBanner from '$lib/components/DeployEnvBanner.svelte';
	import AppNav from '$lib/components/AppNav.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import SiteMeta from '$lib/components/SiteMeta.svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { setupConvex } from 'convex-svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { clearSentryUser, setSentryUser } from '$lib/sentry';

	let { children, data } = $props();

	const showDeployBanner = $derived(data.deployEnvironment !== 'production');

	const convexConfigured =
		typeof env.PUBLIC_CONVEX_URL === 'string' && env.PUBLIC_CONVEX_URL.length > 0;
	const convexUrl: string = convexConfigured
		? env.PUBLIC_CONVEX_URL!
		: 'https://placeholder.invalid.convex.cloud';
	const convexClient = setupConvex(convexUrl, {
		disabled: !browser || !convexConfigured
	});

	if (browser && convexConfigured) {
		convexClient.setAuth(async () => {
			try {
				const response = await fetch('/api/auth/convex-token');
				if (!response.ok) return null;
				const body = (await response.json()) as { token?: string };
				return body.token ?? null;
			} catch {
				return null;
			}
		});
	}

	injectSpeedInsights();

	$effect(() => {
		if (!browser) return;
		const user = data.user;
		if (user) {
			setSentryUser(user.id, user.email);
		} else {
			clearSentryUser();
		}
	});

</script>

<SiteMeta />

<div
	class="flex min-h-screen flex-col bg-surface font-body text-on-surface selection:bg-secondary-container selection:text-on-secondary-container"
>
	<header class="fixed inset-x-0 top-0 z-50">
		<DisclaimBanner />
		<DeployEnvBanner deployEnvironment={data.deployEnvironment} />
		<AppNav user={data.user} />
	</header>

	<main class="flex-1 {showDeployBanner ? 'pt-[9.25rem]' : 'pt-[7.25rem]'}">
		{@render children()}
	</main>

	<AppFooter />
</div>
