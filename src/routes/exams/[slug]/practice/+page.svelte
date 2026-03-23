<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	let { data } = $props();
	const exam = $derived(data.exam);

	const bank = useQuery(
		api.practiceQuestions.listByTrackCode,
		() => (browser && env.PUBLIC_CONVEX_URL ? { trackCode: exam.code } : 'skip')
	);

	type Q = {
		id: number;
		prompt: string;
		choices: string[];
		correctIndex: number;
		explanation: string;
	};

	const questions = $derived.by((): Q[] => {
		const rows = bank.data;
		if (!rows?.length) return [];
		return rows.map((r) => ({
			id: r.order,
			prompt: r.prompt,
			choices: r.choices,
			correctIndex: r.correctIndex,
			explanation: r.explanation
		}));
	});

	/** ~4 minutes per question, minimum 10 minutes */
	const totalSeconds = $derived(Math.max(600, questions.length * 240));
	let remaining = $state(600);
	let selected = $state<Record<number, number>>({});
	let submitted = $state(false);
	let interval: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		const n = questions.length;
		if (n === 0) return;
		remaining = Math.max(600, n * 240);
	});

	$effect(() => {
		if (!browser || questions.length === 0 || submitted) {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
			return;
		}
		interval = setInterval(() => {
			remaining = Math.max(0, remaining - 1);
		}, 1000);
		return () => {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		};
	});

	function formatTime(s: number) {
		const m = Math.floor(s / 60);
		const r = s % 60;
		return `${m}:${r.toString().padStart(2, '0')}`;
	}

	const score = $derived.by(() => {
		if (!submitted || questions.length === 0) return null;
		let correct = 0;
		for (const q of questions) {
			if (selected[q.id] === q.correctIndex) correct++;
		}
		return { correct, total: questions.length };
	});

	const progressPct = $derived(
		questions.length === 0
			? 0
			: Math.round((Object.keys(selected).length / questions.length) * 100)
	);

	function submit() {
		submitted = true;
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}
</script>

<svelte:head>
	<title>Practice: {exam.code} | Service Certify</title>
</svelte:head>

<div class="min-h-[calc(100vh-8rem)] bg-surface-container-low">
	<div
		class="sticky top-[7.25rem] z-40 border-b border-outline-variant/15 bg-surface-container-lowest/90 shadow-ambient backdrop-blur-md"
	>
		<div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
			<div>
				<p class="text-xs font-bold uppercase tracking-widest text-secondary">Practice</p>
				<p class="font-headline font-bold text-primary">{exam.code} — {exam.shortTitle}</p>
			</div>
			<div class="flex items-center gap-6">
				<div class="flex items-center gap-2 text-on-surface-variant">
					<MaterialIcon name="timer" class="text-secondary" />
					<span class="font-mono text-lg font-bold text-primary">{formatTime(remaining)}</span>
				</div>
				{#if questions.length > 0}
					<div class="hidden w-40 sm:block">
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-secondary-container">
							<div
								class="h-full rounded-full bg-secondary transition-all"
								style="width: {progressPct}%"
							></div>
						</div>
						<p
							class="mt-1 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"
						>
							{progressPct}% answered
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-5xl px-6 py-10">
		{#if bank.isLoading}
			<p class="text-center text-on-surface-variant">Loading practice questions…</p>
		{:else if bank.error}
			<p class="text-center text-error">Could not load questions. Check Convex configuration.</p>
		{:else if questions.length === 0}
			<p class="text-center text-on-surface-variant">
				No practice questions for this track yet. Set <code class="text-primary">PUBLIC_CONVEX_URL</code> in
				<code class="text-primary">.env.local</code> and run
				<code class="text-primary">npm run seed:dev:questions</code>.
			</p>
		{:else}
			{#each questions as q, i}
				<article
					class="mb-10 rounded-xl bg-surface-container-lowest p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.04)]"
				>
					<div class="mb-6 flex items-start justify-between gap-4">
						<h2 class="font-headline text-lg font-bold text-primary">
							<span class="text-secondary">Q{i + 1}.</span>
							{q.prompt}
						</h2>
					</div>
					<ul class="space-y-3">
						{#each q.choices as choice, idx}
							<li>
								<label
									class="flex cursor-pointer items-start gap-3 rounded-lg bg-surface-container-high/80 p-4 transition-colors hover:bg-surface-container-high {submitted &&
									idx === q.correctIndex
										? 'ring-2 ring-secondary'
										: ''} {submitted && selected[q.id] === idx && idx !== q.correctIndex
										? 'ring-2 ring-error'
										: ''}"
								>
									<input
										type="radio"
										name="q{q.id}"
										class="mt-1 border-outline text-secondary focus:ring-secondary"
										disabled={submitted}
										checked={selected[q.id] === idx}
										onchange={() => {
											selected = { ...selected, [q.id]: idx };
										}}
									/>
									<span class="text-sm leading-relaxed text-on-surface">{choice}</span>
								</label>
							</li>
						{/each}
					</ul>
					{#if submitted}
						<div
							class="mt-6 rounded-lg border border-secondary-container/40 bg-secondary-container/15 p-4 text-sm text-on-surface-variant"
						>
							<p class="font-bold text-primary">Explanation</p>
							<p class="mt-1 leading-relaxed">{q.explanation}</p>
						</div>
					{/if}
				</article>
			{/each}
		{/if}

		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
			<a href="/exams/{exam.slug}" class="text-sm font-bold text-secondary hover:underline">
				← Back to exam details
			</a>
			{#if questions.length > 0 && !submitted}
				<button
					type="button"
					class="rounded-md bg-secondary px-10 py-3 font-bold text-on-secondary transition-opacity hover:opacity-90 disabled:opacity-40"
					disabled={Object.keys(selected).length < questions.length}
					onclick={submit}
				>
					Submit answers
				</button>
			{:else if score}
				<div class="rounded-xl bg-primary px-8 py-4 text-center text-white shadow-lg">
					<p class="font-label text-xs uppercase tracking-widest text-on-primary-container">
						Your sample score
					</p>
					<p class="font-headline text-3xl font-extrabold">
						{score.correct}/{score.total}
					</p>
					<p class="mt-2 text-sm text-on-primary-container">
						Full timed mocks and deeper analytics are included with membership.
					</p>
					<a
						href="/membership"
						class="mt-4 inline-block rounded-md bg-secondary px-6 py-2 text-sm font-bold text-on-secondary"
					>
						View membership
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
