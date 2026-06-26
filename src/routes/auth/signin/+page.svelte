<script lang="ts">
	// WorkOS Client ID from environment (if configured)
	const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID || '';
	const notConfigured = !clientId || clientId === 'client_...';

	// WorkOS OAuth providers
	const providers = [
		{
			id: 'google',
			name: 'Google',
			icon: '🔍'
		},
		{
			id: 'microsoft',
			name: 'Microsoft',
			icon: '◻️'
		},
		{
			id: 'github',
			name: 'GitHub',
			icon: '🐙'
		},
		{
			id: 'facebook',
			name: 'Facebook',
			icon: 'f'
		}
	];

	function getOAuthUrl(provider: string): string {
		if (notConfigured) {
			return '#';
		}

		const baseUrl = 'https://api.workos.com/oauth/authorize';
		const redirectUri = `${window.location.origin}/auth/callback`;

		const params = new URLSearchParams({
			response_type: 'code',
			client_id: clientId,
			redirect_uri: redirectUri,
			provider
		});

		return `${baseUrl}?${params.toString()}`;
	}

	function handleClick(e: Event) {
		if (notConfigured) {
			e.preventDefault();
			alert('WorkOS is not configured. See docs/AUTH-WORKOS.md for setup instructions.');
		}
	}
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
				{#if notConfigured}
					<div class="p-4 bg-error-container text-on-error-container rounded-lg">
						<p class="font-medium">WorkOS Not Configured</p>
						<p class="text-sm mt-1">See <a href="/docs/AUTH-WORKOS.md" class="underline">AUTH-WORKOS.md</a> for setup instructions.</p>
					</div>
				{/if}
				{#each providers as provider (provider.id)}
					<a
						href={getOAuthUrl(provider.id)}
						on:click={handleClick}
						class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg hover:bg-primary hover:text-on-primary transition-colors font-medium {notConfigured ? 'opacity-50 cursor-not-allowed' : ''}"
					>
						<span>{provider.icon}</span>
						<span>Sign in with {provider.name}</span>
					</a>
				{/each}
			</div>

			<div class="mt-6 text-center text-sm text-on-surface-variant">
				<p>We use OAuth for secure authentication</p>
				<p class="mt-1 text-xs">
					<a href="/privacy" class="text-primary hover:underline">Privacy</a>
					•
					<a href="/" class="text-primary hover:underline">Home</a>
				</p>
			</div>
		</div>
	</div>
</main>
