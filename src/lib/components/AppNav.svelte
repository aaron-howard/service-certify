<script lang="ts">
	import { page } from '$app/state';
	import type { SessionUser } from '$lib/auth.server';
	import logo from '$lib/assets/logo.svg';
	import MaterialIcon from './MaterialIcon.svelte';

	let { user = null }: { user: SessionUser | null } = $props();

	let menuOpen = $state(false);

	const userInitials = $derived(
		user?.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('') || '?'
	);

	function linkClass(href: string) {
		const path = page.url.pathname;
		const active = href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
		return active
			? 'font-bold text-secondary border-b-2 border-secondary pb-1'
			: 'text-on-surface hover:text-primary-container transition-colors';
	}
</script>

<nav
	class="shadow-ambient border-b border-outline-variant/15 bg-white/80 font-headline backdrop-blur-xl antialiased tracking-tight"
	aria-label="Primary"
>
	<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
		<a href="/" class="flex items-center gap-2.5">
			<img src={logo} alt="" class="h-8 w-8 shrink-0" aria-hidden="true" />
			<span class="text-xl font-extrabold tracking-tighter text-primary">Service Certify</span>
		</a>

		<div class="hidden items-center gap-8 md:flex">
			<a class={linkClass('/exams')} href="/exams">Exam Catalog</a>
			<a class={linkClass('/membership')} href="/membership">Membership</a>
			<a class={linkClass('/dashboard')} href="/dashboard">Dashboard</a>
		</div>

		<div class="hidden items-center gap-4 md:flex">
			{#if user}
				<a
					href="/settings"
					class="flex items-center gap-3 rounded-md transition-opacity hover:opacity-90"
					title="Account settings"
					data-testid="nav-settings"
				>
					{#if user.profileImage}
						<img
							src={user.profileImage}
							alt=""
							class="h-9 w-9 rounded-full object-cover"
							referrerpolicy="no-referrer"
						/>
					{:else}
						<span
							class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container"
							aria-hidden="true"
						>
							{userInitials}
						</span>
					{/if}
					<span class="max-w-[12rem] truncate text-sm font-medium text-on-surface" title={user.email}>
						{user.name}
					</span>
				</a>
				<a
					href="/auth/signout"
					class="text-sm font-medium text-on-surface-variant transition-transform hover:text-primary active:scale-95"
				>
					Sign Out
				</a>
			{:else}
				<a
					href="/auth/signin"
					class="text-sm font-medium text-on-surface-variant transition-transform hover:text-primary active:scale-95"
				>
					Sign In
				</a>
			{/if}
			<a
				href="/membership"
				class="rounded-md bg-secondary px-6 py-2.5 text-sm font-bold text-on-secondary transition-transform active:scale-95"
			>
				Get Certified
			</a>
		</div>

		<button
			type="button"
			class="inline-flex items-center justify-center rounded-md p-2 text-on-surface md:hidden"
			aria-expanded={menuOpen}
			aria-controls="mobile-nav"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<MaterialIcon name={menuOpen ? 'close' : 'menu'} class="text-2xl" />
			<span class="sr-only">Toggle menu</span>
		</button>
	</div>

	{#if menuOpen}
		<div
			id="mobile-nav"
			class="flex flex-col gap-4 border-t border-outline-variant/15 bg-white/95 px-6 py-4 md:hidden"
		>
			<a class="font-medium text-primary" href="/exams" onclick={() => (menuOpen = false)}
				>Exam Catalog</a
			>
			<a class="font-medium text-primary" href="/membership" onclick={() => (menuOpen = false)}
				>Membership</a
			>
			<a class="font-medium text-primary" href="/dashboard" onclick={() => (menuOpen = false)}
				>Dashboard</a
			>
			{#if user}
				<div class="flex items-center gap-3">
					{#if user.profileImage}
						<img
							src={user.profileImage}
							alt=""
							class="h-9 w-9 rounded-full object-cover"
							referrerpolicy="no-referrer"
						/>
					{:else}
						<span
							class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container"
							aria-hidden="true"
						>
							{userInitials}
						</span>
					{/if}
					<span class="font-medium text-primary">{user.name}</span>
				</div>
				<a class="font-medium text-primary" href="/settings" onclick={() => (menuOpen = false)}
					>Settings</a
				>
				<a class="font-medium text-primary" href="/auth/signout" onclick={() => (menuOpen = false)}
					>Sign Out</a
				>
			{:else}
				<a class="font-medium text-primary" href="/auth/signin" onclick={() => (menuOpen = false)}
					>Sign In</a
				>
			{/if}
			<a
				href="/membership"
				class="rounded-md bg-secondary py-3 text-center font-bold text-on-secondary"
				onclick={() => (menuOpen = false)}>Get Certified</a
			>
		</div>
	{/if}
</nav>
