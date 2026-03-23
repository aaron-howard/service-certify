<script lang="ts">
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';
	import { exams } from '$lib/data/exams';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	const allTags = [...new Set(exams.map((e) => e.tag))].sort();

	const tracksLive = useQuery(
		api.tracks.list,
		() => (browser && env.PUBLIC_CONVEX_URL ? {} : 'skip')
	);

	let search = $state('');
	let level = $state<'all' | 'Associate' | 'Professional' | 'Expert'>('all');
	/** Empty set = all tracks; otherwise exam must match one of the selected tags */
	let selectedTags = $state<Set<string>>(new Set());

	function toggleTag(tag: string) {
		const next = new Set(selectedTags);
		if (next.has(tag)) next.delete(tag);
		else next.add(tag);
		selectedTags = next;
	}

	const filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return exams.filter((e) => {
			if (level !== 'all' && e.level !== level) return false;
			if (selectedTags.size > 0 && !selectedTags.has(e.tag)) return false;
			if (!q) return true;
			const blob =
				`${e.title} ${e.code} ${e.officialCertificationName} ${e.description} ${e.tag}`.toLowerCase();
			return blob.includes(q);
		});
	});
</script>

<svelte:head>
	<title>Service Certify | Exam Catalog</title>
	<meta
		name="description"
		content="Browse ServiceNow certification practice exams and domain-specific mock tests."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 pb-24 pt-8 md:px-12">
	<section class="mb-16">
		<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
			<div class="max-w-2xl">
				<span
					class="font-label mb-3 block text-[0.75rem] font-bold uppercase tracking-[0.05em] text-secondary"
				>
					Independent Practice Exams
				</span>
				<h1 class="font-headline mb-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
					Validate Your Expertise
				</h1>
				<p class="text-lg leading-relaxed text-on-surface-variant">
					Prepare with confidence using our comprehensive practice exam catalog, featuring
					real-world scenarios and verified answers.
				</p>
				{#if tracksLive.data}
					<p class="mt-3 text-sm font-medium text-secondary">
						Convex: {tracksLive.data.length} certification tracks in database
					</p>
				{:else if tracksLive.error}
					<p class="mt-3 text-sm text-outline">Convex: could not load track list.</p>
				{/if}
			</div>
			<div class="group relative w-full md:w-96">
				<div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-outline">
					<MaterialIcon name="search" />
				</div>
				<input
					class="w-full rounded-xl border-none bg-surface-container-high py-4 pl-12 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary"
					placeholder="Search practice exams..."
					type="search"
					bind:value={search}
				/>
			</div>
		</div>
	</section>

	<div class="flex flex-col gap-12 md:flex-row">
		<aside class="w-full shrink-0 space-y-10 md:w-64">
			<div>
				<h3 class="font-headline mb-6 flex items-center gap-2 text-lg font-bold">
					<MaterialIcon name="filter_list" class="text-secondary" />
					Certification Track
				</h3>
				<div class="space-y-3">
					{#each allTags as tag}
						<label class="group flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								class="h-5 w-5 rounded border-outline text-secondary focus:ring-secondary"
								checked={selectedTags.has(tag)}
								onchange={() => toggleTag(tag)}
							/>
							<span class="text-on-surface-variant transition-colors group-hover:text-primary"
								>{tag}</span
							>
						</label>
					{/each}
				</div>
			</div>
			<div>
				<h3 class="font-headline mb-6 text-lg font-bold">Exam Level</h3>
				<div class="space-y-3">
					<label class="group flex cursor-pointer items-center gap-3">
						<input
							type="radio"
							name="level"
							class="h-5 w-5 border-outline text-secondary focus:ring-secondary"
							checked={level === 'all'}
							onchange={() => (level = 'all')}
						/>
						<span class="text-on-surface-variant group-hover:text-primary">All levels</span>
					</label>
					{#each ['Associate', 'Professional', 'Expert'] as lv}
						<label class="group flex cursor-pointer items-center gap-3">
							<input
								type="radio"
								name="level"
								class="h-5 w-5 border-outline text-secondary focus:ring-secondary"
								checked={level === lv}
								onchange={() => (level = lv as typeof level)}
							/>
							<span class="text-on-surface-variant group-hover:text-primary">{lv}</span>
						</label>
					{/each}
				</div>
			</div>
		</aside>

		<div class="flex-1">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{#each filtered as exam}
					<a
						href="/exams/{exam.slug}"
						class="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1"
					>
						<div class="relative h-48 overflow-hidden">
							<img
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								src={exam.image}
								alt=""
							/>
							<div
								class="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur"
							>
								{exam.questionCount} Questions
							</div>
						</div>
						<div class="flex flex-1 flex-col bg-surface-container-low/50 p-8">
							<div class="mb-4 flex items-center gap-2">
								<span
									class="rounded bg-secondary-container px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-on-secondary-container"
								>
									{exam.tag}
								</span>
								<span class="text-xs text-outline">•</span>
								<span class="text-xs font-medium text-on-surface-variant">{exam.trackLabel}</span>
							</div>
							<h4
								class="mb-2 text-xl font-bold leading-tight text-primary transition-colors group-hover:text-secondary"
							>
								{exam.title}
							</h4>
							<p class="mb-6 text-sm text-on-surface-variant">{exam.description}</p>
							<div class="mt-auto space-y-4">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container"
										>
											{exam.author.initials}
										</div>
										<span class="text-sm font-semibold text-primary">{exam.author.name}</span>
									</div>
									<div class="flex items-center gap-1 text-secondary">
										<MaterialIcon name="star" filled class="text-[18px]" />
										<span class="text-sm font-bold">{exam.rating}</span>
									</div>
								</div>
								<div
									class="flex items-center justify-between border-t border-outline-variant/20 pt-4"
								>
									<span class="text-xs font-medium text-outline"
										>{exam.studentsPrepared.toLocaleString()} students prepared</span
									>
									<span class="text-sm font-extrabold uppercase tracking-tight text-secondary">
										Subscription Access
									</span>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
			{#if filtered.length === 0}
				<p class="mt-12 text-center text-on-surface-variant">No exams match your filters.</p>
			{/if}
		</div>
	</div>
</div>
