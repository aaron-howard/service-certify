<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const providers = [
		{ id: 'google', name: 'Google', icon: '🔍' },
		{ id: 'microsoft', name: 'Microsoft', icon: '◻️' },
		{ id: 'github', name: 'GitHub', icon: '🐙' }
	] as const;

	const loginHref = (providerId: string) => {
		const params = new URLSearchParams({ provider: providerId });
		if (data.redirect) params.set('redirect', data.redirect);
		return `/auth/login?${params.toString()}`;
	};

	const errorMessages: Record<string, string> = {
		workos_not_configured: 'WorkOS is not configured on the server. Add WORKOS_API_KEY and WORKOS_CLIENT_ID to .env.local.',
		invalid_provider: 'That sign-in provider is not supported.',
		no_code: 'Sign-in was cancelled or no authorization code was returned.',
		authentication_failed: 'Sign-in failed. Check WorkOS redirect URIs and enabled providers.',
		access_denied: 'Sign-in was cancelled.'
	};

	const errorMessage = $derived(
		data.error ? (errorMessages[data.error] ?? `Sign-in error: ${data.error}`) : null
	);
</script>

<svelte:head>
	<title>Sign In — Service Certify</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center bg-surface px-4">
	<div class="w-full max-w-md">
		<div class="bg-surface-container rounded-lg border border-outline p-8 shadow-lg">
			<h1 class="text-3xl font-bold mb-2 text-on-surface">Welcome Back</h1>
			<p class="text-on-surface-variant mb-8">Sign in to access your practice sessions</p>

			<div class="space-y-3">
				{#if errorMessage}
					<div class="p-4 bg-error-container text-on-error-container rounded-lg">
						<p class="font-medium">Sign-in problem</p>
						<p class="text-sm mt-1">{errorMessage}</p>
					</div>
				{/if}

				{#if !data.configured}
					<div class="p-4 bg-error-container text-on-error-container rounded-lg">
						<p class="font-medium">WorkOS Not Configured</p>
						<p class="text-sm mt-1">
							Add <code class="text-xs">WORKOS_API_KEY</code> and
							<code class="text-xs">WORKOS_CLIENT_ID</code> to <code class="text-xs">.env.local</code>,
							then restart <code class="text-xs">npm run dev</code>.
						</p>
					</div>
				{/if}

				{#each providers as provider (provider.id)}
					<a
						href={loginHref(provider.id)}
						class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg hover:bg-primary hover:text-on-primary transition-colors font-medium {!data.configured ? 'pointer-events-none opacity-50' : ''}"
						aria-disabled={!data.configured}
					>
						<span>{provider.icon}</span>
						<span>Sign in with {provider.name}</span>
					</a>
				{/each}
			</div>

			<div class="mt-6 text-center text-sm text-on-surface-variant">
				<p>We use OAuth for secure authentication</p>
				<p class="mt-1 text-xs">
					<a href="/" class="text-primary hover:underline">Home</a>
				</p>
			</div>
		</div>
	</div>
</main>
