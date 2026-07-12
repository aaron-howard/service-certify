<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';

	let { data } = $props();

	const convexConfigured =
		typeof env.PUBLIC_CONVEX_URL === 'string' && env.PUBLIC_CONVEX_URL.length > 0;

	let deleting = $state(false);
	let deleteError = $state<string | null>(null);
	let confirmText = $state('');

	const canSubmitDelete = $derived(
		confirmText.trim().toLowerCase() === 'delete' &&
			convexConfigured &&
			data.deleteAuthFresh &&
			!deleting
	);

	async function deleteAccount() {
		if (confirmText.trim().toLowerCase() !== 'delete') return;
		if (!convexConfigured) {
			deleteError = 'Convex is not configured; cannot delete account data.';
			return;
		}
		if (!data.deleteAuthFresh) {
			deleteError = 'Verify your identity before deleting your account.';
			return;
		}

		deleting = true;
		deleteError = null;
		try {
			const response = await fetch('/api/account/delete', { method: 'POST' });
			const body = (await response.json()) as {
				error?: string;
				message?: string;
				stepUpUrl?: string;
			};

			if (response.status === 403 && body.error === 'step_up_required' && body.stepUpUrl) {
				await goto(body.stepUpUrl);
				return;
			}

			if (!response.ok) {
				throw new Error(body.message ?? body.error ?? 'Could not delete account');
			}

			await goto('/auth/signout');
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'Could not delete account';
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Account settings | Service Certify</title>
	<meta name="description" content="Manage your Service Certify profile and account." />
</svelte:head>

<section class="editorial-gradient py-16 md:py-20">
	<div class="mx-auto max-w-7xl px-8 text-center">
		<h1 class="font-headline text-4xl font-extrabold text-white md:text-5xl">Account settings</h1>
		<p class="mt-4 text-sm text-primary-fixed/80">Profile details and account controls</p>
	</div>
</section>

<article class="mx-auto max-w-3xl px-8 py-16">
	<div class="space-y-10 text-sm leading-relaxed text-on-surface">
		<section>
			<h2 class="font-headline mb-3 text-xl font-bold text-primary">Profile</h2>
			<div class="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6">
				<div class="flex items-center gap-4">
					{#if data.user.profileImage}
						<img
							src={data.user.profileImage}
							alt=""
							class="h-14 w-14 rounded-full object-cover"
							referrerpolicy="no-referrer"
						/>
					{:else}
						<span
							class="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-lg font-bold text-on-primary-container"
							aria-hidden="true"
						>
							{data.user.name
								.split(/\s+/)
								.filter(Boolean)
								.slice(0, 2)
								.map((p) => p[0]?.toUpperCase() ?? '')
								.join('') || '?'}
						</span>
					{/if}
					<div>
						<p class="font-headline text-lg font-bold text-primary">{data.user.name}</p>
						<p class="text-on-surface-variant">{data.user.email}</p>
						{#if data.user.provider}
							<p class="mt-1 text-xs uppercase tracking-wide text-on-surface-variant">
								Signed in with {data.user.provider}
							</p>
						{/if}
						{#if data.user.isAdmin}
							<p class="mt-1 text-xs font-bold text-secondary">Admin · full mock access</p>
						{/if}
					</div>
				</div>
				<p class="mt-4 text-on-surface-variant">
					Name and photo come from your OAuth provider (Google, Microsoft, or GitHub). Update them
					there, then sign out and back in to refresh.
				</p>
			</div>
		</section>

		<section>
			<h2 class="font-headline mb-3 text-xl font-bold text-primary">Practice progress</h2>
			<p class="text-on-surface-variant">
				Graded practice sessions are saved to your account and shown on your
				<a class="text-primary-container underline hover:text-primary" href="/dashboard">Dashboard</a
				>.
			</p>
		</section>

		<section>
			<h2 class="font-headline mb-3 text-xl font-bold text-primary">Sign out</h2>
			<p class="mb-4 text-on-surface-variant">
				Ends your Service Certify session on this device. Your practice history remains until you
				delete the account.
			</p>
			<a
				href="/auth/signout"
				class="inline-block rounded-md border-2 border-primary-fixed px-6 py-2 font-bold text-primary transition-all hover:bg-primary-fixed/10"
			>
				Sign out
			</a>
		</section>

		<section class="rounded-xl border border-error/30 bg-error-container/20 p-6">
			<h2 class="font-headline mb-3 text-xl font-bold text-error">Delete account</h2>
			<p class="text-on-surface-variant">
				Permanently removes your Service Certify profile and practice progress from our database.
				This does not revoke OAuth access at your identity provider — you can do that in Google,
				Microsoft, or GitHub security settings.
			</p>
			{#if !data.deleteAuthFresh}
				<p class="mt-4 text-sm text-on-surface-variant">
					For your security, confirm your identity with your sign-in provider before deleting your
					account.
				</p>
				<a
					href={data.stepUpUrl}
					class="mt-4 inline-block rounded-md border-2 border-error px-6 py-2 font-bold text-error transition-all hover:bg-error/10"
					data-testid="verify-identity-delete"
				>
					Verify identity to delete
				</a>
			{:else if data.stepUpCompleted}
				<p class="mt-4 text-sm text-secondary" role="status">
					Identity verified. You can delete your account within the next few minutes.
				</p>
			{/if}
			{#if !browser}
				<p class="mt-4 text-on-surface-variant">Loading…</p>
			{:else if data.deleteAuthFresh}
				<label class="mt-4 block text-sm font-medium text-on-surface" for="confirm-delete">
					Type <span class="font-bold">delete</span> to confirm
				</label>
				<input
					id="confirm-delete"
					type="text"
					bind:value={confirmText}
					autocomplete="off"
					class="mt-2 w-full max-w-xs rounded-md border border-outline-variant bg-surface px-3 py-2 text-on-surface"
					data-testid="delete-confirm-input"
				/>
				{#if deleteError}
					<p class="mt-3 text-sm text-error" role="alert">{deleteError}</p>
				{/if}
				<button
					type="button"
					class="mt-4 rounded-md bg-error px-6 py-2 font-bold text-on-error transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!canSubmitDelete}
					data-testid="delete-account-button"
					onclick={deleteAccount}
				>
					{deleting ? 'Deleting…' : 'Delete my account'}
				</button>
			{/if}
		</section>
	</div>
</article>
