<script lang="ts">
	import { page } from '$app/state';
	import logo from '$lib/assets/logo.svg';
	import MaterialIcon from './MaterialIcon.svelte';

	let menuOpen = $state(false);

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
			<button
				type="button"
				class="text-sm font-medium text-on-surface-variant transition-transform hover:text-primary active:scale-95"
			>
				Sign In
			</button>
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
			<a
				href="/membership"
				class="rounded-md bg-secondary py-3 text-center font-bold text-on-secondary"
				onclick={() => (menuOpen = false)}>Get Certified</a
			>
		</div>
	{/if}
</nav>
