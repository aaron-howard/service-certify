<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';
	import { exams } from '$lib/data/exams';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	let { data } = $props();

	const convexConfigured =
		typeof env.PUBLIC_CONVEX_URL === 'string' && env.PUBLIC_CONVEX_URL.length > 0;

	const progressQuery = useQuery(
		api.userProgress.listForCurrentUser,
		() => (browser && convexConfigured ? {} : 'skip')
	);

	const progressRows = $derived(progressQuery.data ?? []);
	const loading = $derived(progressQuery.isLoading && !progressQuery.data);

	function examForTrack(trackCode: string) {
		return exams.find((e) => e.code === trackCode);
	}

	function formatDate(ms: number) {
		return new Date(ms).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	const totalSessions = $derived(
		progressRows.reduce((sum, row) => sum + row.sessionsCompleted, 0)
	);
	const overallAverage = $derived(
		progressRows.length === 0
			? null
			: Math.round(
					progressRows.reduce((sum, row) => sum + row.averageScore, 0) / progressRows.length
				)
	);
	const bestOverall = $derived(
		progressRows.length === 0 ? null : Math.max(...progressRows.map((row) => row.bestScore))
	);
</script>

<svelte:head>
	<title>Dashboard | Service Certify</title>
	<meta
		name="description"
		content="Track mock exam performance, readiness scores, and practice history."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-16 grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
		<div class="lg:col-span-8">
			<p class="font-label mb-4 text-xs font-bold uppercase tracking-[0.05em] text-secondary">
				Mock Exam Readiness
			</p>
			<h1 class="font-headline text-display-lg text-5xl font-extrabold leading-tight tracking-tight text-primary">
				Welcome back{#if data.user?.name}, {data.user.name.split(/\s+/)[0]}{/if}.
			</h1>
			<p class="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
				{#if !convexConfigured}
					Connect Convex to sync practice progress across sessions.
				{:else if loading}
					Loading your practice history…
				{:else if progressRows.length === 0}
					No graded practice sessions yet. Start a sample from the exam catalog to build your
					readiness profile.
				{:else}
					You've completed {totalSessions} practice session{totalSessions === 1 ? '' : 's'} across
					{progressRows.length} track{progressRows.length === 1 ? '' : 's'}.
				{/if}
			</p>
		</div>
		<div class="lg:col-span-4">
			<div
				class="relative overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-ambient"
			>
				<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondary-container/30 blur-2xl"></div>
				<div class="relative z-10">
					<MaterialIcon name="account_circle" filled class="mb-4 text-4xl text-secondary" />
					<h3 class="font-headline text-xl font-bold text-primary">{data.user?.name ?? 'Account'}</h3>
					<p class="mt-1 text-sm text-on-surface-variant">{data.user?.email}</p>
					<a
						href="/settings"
						class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-4"
					>
						Account settings <MaterialIcon name="arrow_forward" class="text-sm" />
					</a>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-16 lg:grid-cols-3">
		<div class="space-y-12 lg:col-span-2">
			<section>
				<div class="mb-8 flex items-baseline justify-between">
					<h2 class="font-headline text-2xl font-bold text-primary">Practice by track</h2>
					<a href="/exams" class="text-sm font-semibold text-secondary hover:underline">View all exams</a>
				</div>

				{#if !convexConfigured}
					<div class="rounded-xl bg-surface-container-low p-8 text-on-surface-variant">
						<p>
							Set <code class="text-sm">PUBLIC_CONVEX_URL</code> and seed questions to enable live
							progress tracking.
						</p>
					</div>
				{:else if loading}
					<div class="rounded-xl bg-surface-container-low p-8 text-on-surface-variant">Loading…</div>
				{:else if progressRows.length === 0}
					<div class="rounded-xl bg-surface-container-low p-8">
						<p class="text-on-surface-variant">
							Your graded sessions will appear here. Try a sample practice to get started.
						</p>
						<a
							href="/exams"
							class="mt-6 inline-block rounded-md bg-secondary px-6 py-2 text-sm font-bold text-on-secondary"
						>
							Browse exams
						</a>
					</div>
				{:else}
					<div class="space-y-6">
						{#each progressRows as row (row.trackCode)}
							{@const exam = examForTrack(row.trackCode)}
							<div
								class="flex flex-col items-center gap-6 rounded-xl bg-surface-container-low p-6 transition-all hover:bg-surface-container-high md:flex-row"
							>
								<div
									class="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-primary-container md:w-48"
								>
									<span
										class="rounded bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
									>
										{row.trackCode}
									</span>
								</div>
								<div class="w-full flex-1">
									<div class="mb-2 flex items-start justify-between gap-4">
										<h4 class="font-headline text-lg font-bold text-primary">
											{exam?.shortTitle ?? exam?.title ?? row.trackCode}
										</h4>
										<span
											class="rounded-full bg-secondary-container px-2 py-1 text-xs font-bold text-secondary"
										>
											{row.bestScore}% best
										</span>
									</div>
									<p class="mb-4 text-sm font-medium text-on-surface-variant">
										{row.sessionsCompleted} session{row.sessionsCompleted === 1 ? '' : 's'} · avg
										{row.averageScore}% · last {formatDate(row.lastAttemptedAt)}
									</p>
									<div class="mb-6 h-[6px] w-full rounded-full bg-secondary-container">
										<div
											class="h-full rounded-full bg-secondary"
											style="width: {Math.min(100, row.bestScore)}%"
										></div>
									</div>
									{#if exam}
										<a
											href="/exams/{exam.slug}/practice"
											class="inline-block rounded-md bg-secondary px-6 py-2 text-sm font-bold text-on-secondary transition-opacity hover:opacity-90"
										>
											Practice again
										</a>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<section class="relative overflow-hidden rounded-2xl bg-primary p-10 text-white">
				<div class="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]"></div>
				<div class="relative z-10">
					<h2 class="font-headline mb-8 text-2xl font-bold">Performance summary</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div>
							<p class="font-label mb-2 text-xs uppercase tracking-widest text-on-primary-container">
								Avg. score
							</p>
							<p class="font-headline text-3xl font-bold">
								{overallAverage === null ? '—' : `${overallAverage}%`}
							</p>
							<p class="mt-2 text-xs text-slate-400">Across tracks with activity</p>
						</div>
						<div>
							<p class="font-label mb-2 text-xs uppercase tracking-widest text-on-primary-container">
								Best score
							</p>
							<p class="font-headline text-3xl font-bold">
								{bestOverall === null ? '—' : `${bestOverall}%`}
							</p>
							<p class="mt-2 text-xs text-slate-400">Personal best</p>
						</div>
						<div>
							<p class="font-label mb-2 text-xs uppercase tracking-widest text-on-primary-container">
								Sessions
							</p>
							<p class="font-headline text-3xl font-bold">{totalSessions}</p>
							<p class="mt-2 text-xs text-slate-400">Graded practice attempts</p>
						</div>
					</div>
				</div>
			</section>
		</div>

		<div class="space-y-12">
			<section class="rounded-2xl bg-surface-container-low p-8">
				<h3 class="font-headline mb-4 text-lg font-bold text-primary">Quick links</h3>
				<ul class="space-y-3 text-sm">
					<li>
						<a class="font-semibold text-secondary hover:underline" href="/exams">Exam catalog</a>
					</li>
					<li>
						<a class="font-semibold text-secondary hover:underline" href="/settings">Account settings</a>
					</li>
					<li>
						<a class="font-semibold text-secondary hover:underline" href="/support">Support</a>
					</li>
				</ul>
			</section>

			<div class="relative overflow-hidden rounded-2xl bg-secondary-container p-8">
				<h4 class="font-headline mb-4 text-xl font-extrabold leading-tight text-on-secondary-container">
					Keep practicing
				</h4>
				<p class="mb-6 text-sm text-on-secondary-container/80">
					Sample practice is available without a membership. Full mocks unlock for admins today.
				</p>
				<a
					href="/exams"
					class="block w-full rounded-lg bg-primary py-3 text-center text-sm font-bold text-white"
				>
					Browse exams
				</a>
			</div>
		</div>
	</div>
</div>
