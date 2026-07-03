<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';
	import { getPracticeTimeSeconds } from '$lib/catalog/examQuestionPolicy';
	import {
		displayIndexToOriginal,
		originalIndexToDisplay,
		shuffleChoicesForDisplay
	} from '$lib/practice/choiceShuffle';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	let { data } = $props();
	const exam = $derived(data.exam);
	const mode = $derived(data.mode as 'sample' | 'full');
	const isFullMock = $derived(mode === 'full');
	const convex = useConvexClient();
	const sessionSeed = $derived(
		data.sessionSeed ??
			(typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: `mock-${Date.now()}`)
	);

	const bank = useQuery(
		api.practiceQuestions.listByTrackCode,
		() =>
			browser && env.PUBLIC_CONVEX_URL && !isFullMock
				? { trackCode: exam.code, mode: 'sample' as const }
				: 'skip'
	);

	type Q = {
		id: number;
		prompt: string;
		choices: string[];
		permutation: number[];
	};

	type GradeResult = {
		order: number;
		selectedIndex: number;
		correctIndex: number;
		isCorrect: boolean;
		explanation: string;
	};

	const convexConfigured =
		typeof env.PUBLIC_CONVEX_URL === 'string' && env.PUBLIC_CONVEX_URL.length > 0;

	function toDisplayQuestions(
		rows: { order: number; prompt: string; choices: string[] }[]
	): Q[] {
		return rows.map((r) => {
			const { choices, permutation } = shuffleChoicesForDisplay(
				r.choices,
				sessionSeed,
				r.order
			);
			return { id: r.order, prompt: r.prompt, choices, permutation };
		});
	}

	const questions = $derived.by((): Q[] => {
		if (isFullMock && data.serverQuestions) {
			return toDisplayQuestions(data.serverQuestions);
		}

		const rows = bank.data;
		if (!rows?.length) return [];
		return toDisplayQuestions(rows);
	});

	const questionsLoadError = $derived(
		isFullMock ? data.questionsError : bank.error?.message ?? null
	);
	const questionsLoading = $derived(isFullMock ? false : bank.isLoading);

	let remaining = $state(90 * 60);
	let selected = $state<Record<number, number>>({});
	let submitted = $state(false);
	let grading = $state(false);
	let gradeError = $state<string | null>(null);
	let score = $state<{ correct: number; total: number } | null>(null);
	let gradedByOrder = $state<Record<number, GradeResult>>({});
	let interval: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		const n = questions.length;
		if (n === 0) return;
		remaining = getPracticeTimeSeconds({
			trackCode: exam.code,
			questionCount: n,
			mode
		});
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

	const progressPct = $derived(
		questions.length === 0
			? 0
			: Math.round((Object.keys(selected).length / questions.length) * 100)
	);

	function resultFor(order: number): GradeResult | undefined {
		return gradedByOrder[order];
	}

	function displayCorrectIndex(q: Q, graded: GradeResult): number {
		return originalIndexToDisplay(graded.correctIndex, q.permutation);
	}

	async function submit() {
		if (!browser || !env.PUBLIC_CONVEX_URL || grading) return;
		grading = true;
		gradeError = null;
		try {
			const payload = {
				trackCode: exam.code,
				mode,
				...(isFullMock ? { sessionSeed } : {}),
				answers: questions.map((q) => ({
					order: q.id,
					selectedIndex: displayIndexToOriginal(selected[q.id]!, q.permutation)
				}))
			};

			type GradeResponse = {
				correct: number;
				total: number;
				results: GradeResult[];
			};

			let graded: GradeResponse;

			if (isFullMock) {
				const response = await fetch('/api/practice/grade', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				const body = (await response.json()) as GradeResponse & { error?: string };
				if (!response.ok) {
					throw new Error(body.error ?? 'Could not grade answers');
				}
				graded = body;
			} else {
				graded = await convex.mutation(api.practiceQuestions.gradeAnswers, payload);
			}

			score = { correct: graded.correct, total: graded.total };
			gradedByOrder = Object.fromEntries(graded.results.map((r) => [r.order, r]));
			submitted = true;
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		} catch (e) {
			gradeError = e instanceof Error ? e.message : 'Could not grade answers';
		} finally {
			grading = false;
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
				<p class="text-xs font-bold uppercase tracking-widest text-secondary">
					{isFullMock ? 'Full mock' : 'Sample practice'}
				</p>
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
		{#if questionsLoading}
			<p class="text-center text-on-surface-variant">Loading practice questions…</p>
		{:else if questionsLoadError}
			<p class="text-center text-error">
				{questionsLoadError}
			</p>
			{#if isFullMock}
				<p class="mt-2 text-center text-sm text-on-surface-variant">
					Try signing out and back in. If this persists, confirm
					<code class="text-primary">WORKOS_CLIENT_ID</code> is set in your Convex deployment env.
				</p>
			{/if}
		{:else if !convexConfigured}
			<p class="text-center text-on-surface-variant">
				Practice questions require Convex. Set <code class="text-primary">PUBLIC_CONVEX_URL</code> in
				<code class="text-primary">.env.local</code> (or Vercel env) and redeploy.
			</p>
		{:else if questions.length === 0}
			<p class="text-center text-on-surface-variant">
				No practice questions for <code class="text-primary">{exam.code}</code> yet. An admin can load the
				dev bank with <code class="text-primary">npm run seed:dev:questions</code>.
			</p>
		{:else}
			{#each questions as q, i}
				{@const graded = resultFor(q.id)}
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
									graded &&
									idx === displayCorrectIndex(q, graded)
										? 'ring-2 ring-secondary'
										: ''} {submitted &&
									graded &&
									selected[q.id] === idx &&
									idx !== displayCorrectIndex(q, graded)
										? 'ring-2 ring-error'
										: ''}"
								>
									<input
										type="radio"
										name="q{q.id}"
										class="mt-1 border-outline text-secondary focus:ring-secondary"
										disabled={submitted || grading}
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
					{#if submitted && graded}
						<div
							class="mt-6 rounded-lg border border-secondary-container/40 bg-secondary-container/15 p-4 text-sm text-on-surface-variant"
						>
							<p class="font-bold text-primary">Explanation</p>
							<p class="mt-1 leading-relaxed">{graded.explanation}</p>
						</div>
					{/if}
				</article>
			{/each}
		{/if}

		{#if gradeError}
			<p class="mb-4 text-center text-sm text-error">{gradeError}</p>
		{/if}

		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
			<a href="/exams/{exam.slug}" class="text-sm font-bold text-secondary hover:underline">
				← Back to exam details
			</a>
			{#if questions.length > 0 && !submitted}
				<button
					type="button"
					class="rounded-md bg-secondary px-10 py-3 font-bold text-on-secondary transition-opacity hover:opacity-90 disabled:opacity-40"
					disabled={Object.keys(selected).length < questions.length || grading}
					onclick={submit}
				>
					{grading ? 'Grading…' : 'Submit answers'}
				</button>
			{:else if score}
				<div class="rounded-xl bg-primary px-8 py-4 text-center text-white shadow-lg">
					<p class="font-label text-xs uppercase tracking-widest text-on-primary-container">
						{isFullMock ? 'Your mock score' : 'Your sample score'}
					</p>
					<p class="font-headline text-3xl font-extrabold">
						{score.correct}/{score.total}
					</p>
					{#if isFullMock}
						<p class="mt-2 text-sm text-on-primary-container">
							Full mock complete. Review explanations below to reinforce weak areas.
						</p>
					{:else}
						<p class="mt-2 text-sm text-on-primary-container">
							Full timed mocks and deeper analytics are included with membership.
						</p>
						<a
							href="/membership"
							class="mt-4 inline-block rounded-md bg-secondary px-6 py-2 text-sm font-bold text-on-secondary"
						>
							View membership
						</a>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
