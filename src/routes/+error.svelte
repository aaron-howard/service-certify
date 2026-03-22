<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} | Service Certify</title>
</svelte:head>

<div class="mx-auto flex max-w-lg flex-col items-center px-8 py-24 text-center">
	<p class="font-headline text-6xl font-extrabold text-primary">{page.status}</p>
	<h1 class="font-headline mt-4 text-2xl font-bold text-primary">
		{page.error?.message ?? 'Something went wrong'}
	</h1>
	<a href="/" class="mt-8 font-bold text-secondary hover:underline">Back to home</a>
</div>
