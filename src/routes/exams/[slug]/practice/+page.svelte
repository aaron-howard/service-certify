<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';
	import PracticeQuestionCard from '$lib/components/PracticeQuestionCard.svelte';
	import PracticeQuestionNav from '$lib/components/PracticeQuestionNav.svelte';
	import PracticeQuestionPalette from '$lib/components/PracticeQuestionPalette.svelte';
	import PracticeSubmitModal from '$lib/components/PracticeSubmitModal.svelte';
	import { getOfficialExamDurationMinutes, getPracticeTimeSeconds } from '$lib/catalog/examQuestionPolicy';
	import {
		displayIndexToOriginal,
		shuffleChoicesForDisplay,
		shuffleMatchForDisplay
	} from '$lib/practice/choiceShuffle';
	import { clampIndex, questionStatus, unansweredIndexes } from '$lib/practice/sessionNav';
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
		questionType: 'single' | 'multi' | 'match';
		matchLeftItems?: string[];
		matchRightItems?: string[];
		matchLeftPermutation?: number[];
		matchRightPermutation?: number[];
	};

	type GradeResult = {
		order: number;
		selectedIndex: number;
		selectedIndexes: number[];
		matchAnswers: { left: number; right: number }[];
		correctIndex: number;
		correctIndexes: number[];
		correctMatches: { left: number; right: number }[];
		questionType: 'single' | 'multi' | 'match';
		isCorrect: boolean;
		explanation: string;
	};

	type Phase = 'intro' | 'live' | 'review' | 'summary';

	const convexConfigured =
		typeof env.PUBLIC_CONVEX_URL === 'string' && env.PUBLIC_CONVEX_URL.length > 0;

	function toDisplayQuestions(
		rows: {
			order: number;
			prompt: string;
			choices: string[];
			questionType?: 'single' | 'multi' | 'match';
			matchLeftItems?: string[];
			matchRightItems?: string[];
		}[]
	): Q[] {
		return rows.map((r) => {
			const questionType = r.questionType ?? 'single';
			if (questionType === 'match') {
				const leftItems = r.matchLeftItems ?? [];
				const rightItems = r.matchRightItems ?? [];
				const shuffled = shuffleMatchForDisplay(leftItems, rightItems, sessionSeed, r.order);
				return {
					id: r.order,
					prompt: r.prompt,
					choices: [],
					permutation: [],
					questionType,
					matchLeftItems: shuffled.matchLeftItems,
					matchRightItems: shuffled.matchRightItems,
					matchLeftPermutation: shuffled.matchLeftPermutation,
					matchRightPermutation: shuffled.matchRightPermutation
				};
			}
			const { choices, permutation } = shuffleChoicesForDisplay(
				r.choices,
				sessionSeed,
				r.order
			);
			return {
				id: r.order,
				prompt: r.prompt,
				choices,
				permutation,
				questionType
			};
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
		isFullMock ? data.questionsError : (bank.error?.message ?? null)
	);
	const questionsLoading = $derived(isFullMock ? false : bank.isLoading);

	const examDurationMinutes = $derived(
		isFullMock
			? getOfficialExamDurationMinutes(exam.code)
			: Math.round(
					getPracticeTimeSeconds({
						trackCode: exam.code,
						questionCount: questions.length || 1,
						mode
					}) / 60
				)
	);

	let phase = $state<Phase>('intro');
	let currentIndex = $state(0);
	let paletteOpen = $state(false);
	let submitModalOpen = $state(false);
	let flagged = $state<Set<number>>(new Set());
	let remaining = $state(90 * 60);
	let selected = $state<Record<number, number>>({});
	let selectedMulti = $state<Record<number, number[]>>({});
	let selectedMatch = $state<Record<number, Record<number, number>>>({});
	let submitted = $state(false);
	let grading = $state(false);
	let gradeError = $state<string | null>(null);
	let score = $state<{ correct: number; total: number } | null>(null);
	let gradedByOrder = $state<Record<number, GradeResult>>({});
	let interval: ReturnType<typeof setInterval> | null = null;

	const currentQuestion = $derived(questions[currentIndex]);
	const answeredCount = $derived(questions.filter((q) => isAnsweredById(q.id)).length);
	const progressPct = $derived(
		questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100)
	);
	const unansweredCount = $derived(
		unansweredIndexes(questions.length, (i) => isAnsweredById(questions[i]?.id)).length
	);
	const inReview = $derived(phase === 'review');

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
		if (!browser || questions.length === 0 || submitted || phase !== 'live') {
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

	function isAnswered(q: Q): boolean {
		if (q.questionType === 'match') {
			const leftCount = q.matchLeftItems?.length ?? 0;
			const paired = Object.keys(selectedMatch[q.id] ?? {}).length;
			return leftCount > 0 && paired >= leftCount;
		}
		return q.questionType === 'multi'
			? (selectedMulti[q.id]?.length ?? 0) > 0
			: selected[q.id] !== undefined;
	}

	function isAnsweredById(id: number | undefined): boolean {
		if (id === undefined) return false;
		const q = questions.find((item) => item.id === id);
		return q ? isAnswered(q) : false;
	}

	function isAnsweredAtIndex(index: number): boolean {
		const q = questions[index];
		return q ? isAnswered(q) : false;
	}

	function paletteStatus(index: number) {
		return questionStatus(index, isAnsweredAtIndex, flagged);
	}

	function toggleFlag() {
		const next = new Set(flagged);
		if (next.has(currentIndex)) next.delete(currentIndex);
		else next.add(currentIndex);
		flagged = next;
	}

	function goTo(index: number) {
		currentIndex = clampIndex(index, questions.length);
	}

	function startExam() {
		phase = 'live';
		currentIndex = 0;
	}

	function resultFor(order: number): GradeResult | undefined {
		return gradedByOrder[order];
	}

	function toggleMulti(q: Q, displayIdx: number) {
		const current = selectedMulti[q.id] ?? [];
		const next = current.includes(displayIdx)
			? current.filter((i) => i !== displayIdx)
			: [...current, displayIdx];
		selectedMulti = { ...selectedMulti, [q.id]: next };
	}

	function requestSubmit() {
		submitModalOpen = true;
	}

	async function submit() {
		if (!browser || !env.PUBLIC_CONVEX_URL || grading) return;
		submitModalOpen = false;
		grading = true;
		gradeError = null;
		try {
			const payload = {
				trackCode: exam.code,
				mode,
				...(isFullMock ? { sessionSeed } : {}),
				answers: questions.map((q) => {
					if (q.questionType === 'match') {
						const pairs = selectedMatch[q.id] ?? {};
						const leftPerm = q.matchLeftPermutation ?? [];
						const rightPerm = q.matchRightPermutation ?? [];
						return {
							order: q.id,
							selectedIndex: 0,
							matchAnswers: Object.entries(pairs).map(([displayLeft, displayRight]) => ({
								left: displayIndexToOriginal(Number(displayLeft), leftPerm),
								right: displayIndexToOriginal(Number(displayRight), rightPerm)
							}))
						};
					}
					if (q.questionType === 'multi') {
						const displaySel = selectedMulti[q.id] ?? [];
						const originalSel = displaySel
							.map((d) => displayIndexToOriginal(d, q.permutation))
							.sort((a, b) => a - b);
						return {
							order: q.id,
							selectedIndex: originalSel[0] ?? 0,
							selectedIndexes: originalSel
						};
					}
					return {
						order: q.id,
						selectedIndex: displayIndexToOriginal(selected[q.id]!, q.permutation)
					};
				})
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
			phase = 'summary';
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

	function beginReview() {
		phase = 'review';
		currentIndex = 0;
	}
</script>

<svelte:head>
	<title>Practice: {exam.code} | Service Certify</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-8rem)] flex-col bg-surface-container-low">
	<div
		class="sticky top-[7.25rem] z-40 border-b border-outline-variant/15 bg-surface-container-lowest/90 shadow-ambient backdrop-blur-md"
	>
		<div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
			<div>
				<p class="text-xs font-bold uppercase tracking-widest text-secondary">
					{isFullMock ? 'Full mock' : 'Sample practice'}
					{#if phase === 'review'}
						· Review
					{/if}
				</p>
				<p class="font-headline font-bold text-primary">{exam.code} — {exam.shortTitle}</p>
			</div>
			{#if questions.length > 0 && (phase === 'live' || phase === 'review')}
				<div class="flex flex-wrap items-center gap-4 sm:gap-6">
					<p class="text-sm font-bold text-primary" data-testid="practice-position">
						Question {currentIndex + 1} of {questions.length}
					</p>
					{#if phase === 'live'}
						<div class="flex items-center gap-2 text-on-surface-variant">
							<MaterialIcon name="timer" class="text-secondary" />
							<span class="font-mono text-lg font-bold text-primary">{formatTime(remaining)}</span>
						</div>
						<div class="hidden w-32 sm:block">
							<div class="h-1.5 w-full overflow-hidden rounded-full bg-secondary-container">
								<div
									class="h-full rounded-full bg-secondary transition-all"
									style="width: {progressPct}%"
								></div>
							</div>
							<p
								class="mt-1 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"
							>
								{answeredCount}/{questions.length} answered
							</p>
						</div>
						<button
							type="button"
							data-testid="practice-flag"
							class="rounded-md border border-outline-variant/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors {flagged.has(
								currentIndex
							)
								? 'border-amber-500/50 bg-amber-500/10 text-primary'
								: 'text-on-surface-variant hover:bg-surface-container-high'}"
							onclick={toggleFlag}
						>
							{flagged.has(currentIndex) ? 'Flagged' : 'Flag for review'}
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<div class="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
		{#if questionsLoading}
			<p class="text-center text-on-surface-variant">Loading practice questions…</p>
		{:else if questionsLoadError}
			<p class="text-center text-error">{questionsLoadError}</p>
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
				No practice questions for <code class="text-primary">{exam.code}</code> yet. An admin can load
				the dev bank with <code class="text-primary">npm run seed:dev:questions</code>.
			</p>
		{:else if phase === 'intro'}
			<div class="mx-auto max-w-xl rounded-xl bg-surface-container-lowest p-8 shadow-ambient">
				<h2 class="font-headline text-2xl font-bold text-primary">Before you begin</h2>
				<ul class="mt-4 space-y-2 text-sm text-on-surface-variant">
					<li>
						<strong class="text-primary">{questions.length}</strong> question{questions.length === 1
							? ''
							: 's'}
					</li>
					<li>
						<strong class="text-primary">{examDurationMinutes}</strong> minute time limit
					</li>
					<li>One question shown at a time — use Previous, Next, or the question palette</li>
					<li>Flag questions for review and submit when ready</li>
				</ul>
				<button
					type="button"
					data-testid="practice-start"
					class="mt-8 w-full rounded-md bg-secondary py-3 font-bold text-on-secondary hover:opacity-90"
					onclick={startExam}
				>
					Start exam
				</button>
			</div>
		{:else if phase === 'summary' && score}
			<div class="mx-auto max-w-xl rounded-xl bg-primary px-8 py-8 text-center text-white shadow-lg">
				<p class="font-label text-xs uppercase tracking-widest text-on-primary-container">
					{isFullMock ? 'Your mock score' : 'Your sample score'}
				</p>
				<p class="font-headline text-4xl font-extrabold">
					{score.correct}/{score.total}
				</p>
				<p class="mt-3 text-sm text-on-primary-container">
					Review each question with explanations to reinforce weak areas.
				</p>
				<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<button
						type="button"
						data-testid="practice-review"
						class="rounded-md bg-secondary px-6 py-2.5 text-sm font-bold text-on-secondary"
						onclick={beginReview}
					>
						Review answers
					</button>
					<a
						href="/exams/{exam.slug}"
						class="rounded-md border border-white/30 px-6 py-2.5 text-sm font-bold text-white"
					>
						Back to exam details
					</a>
				</div>
				{#if !isFullMock}
					<a
						href="/membership"
						class="mt-4 inline-block text-sm font-bold text-on-primary-container underline"
					>
						View membership for full timed mocks
					</a>
				{/if}
			</div>
		{:else if currentQuestion}
			<PracticeQuestionCard
				question={currentQuestion}
				questionNumber={currentIndex + 1}
				selected={selected[currentQuestion.id]}
				selectedMulti={selectedMulti[currentQuestion.id] ?? []}
				matchSelections={selectedMatch[currentQuestion.id] ?? {}}
				disabled={inReview || grading}
				submitted={inReview || submitted}
				graded={resultFor(currentQuestion.id)}
				onSelectSingle={(idx) => {
					selected = { ...selected, [currentQuestion.id]: idx };
				}}
				onToggleMulti={(idx) => toggleMulti(currentQuestion, idx)}
				onMatchChange={(next) => {
					selectedMatch = { ...selectedMatch, [currentQuestion.id]: next };
				}}
			/>
		{/if}

		{#if gradeError}
			<p class="mt-4 text-center text-sm text-error">{gradeError}</p>
		{/if}
	</div>

	{#if questions.length > 0 && (phase === 'live' || phase === 'review')}
		<PracticeQuestionNav
			{currentIndex}
			total={questions.length}
			disabled={grading}
			showSubmit={phase === 'live'}
			submitting={grading}
			onPrevious={() => goTo(currentIndex - 1)}
			onNext={() => goTo(currentIndex + 1)}
			onSubmit={requestSubmit}
			onOpenPalette={() => (paletteOpen = true)}
		/>
	{:else if phase === 'intro'}
		<div class="border-t border-outline-variant/15 px-6 py-4">
			<a href="/exams/{exam.slug}" class="text-sm font-bold text-secondary hover:underline">
				← Back to exam details
			</a>
		</div>
	{/if}

	<PracticeQuestionPalette
		open={paletteOpen}
		total={questions.length}
		{currentIndex}
		statusFor={paletteStatus}
		onSelect={goTo}
		onClose={() => (paletteOpen = false)}
	/>

	<PracticeSubmitModal
		open={submitModalOpen}
		{unansweredCount}
		submitting={grading}
		onConfirm={submit}
		onCancel={() => (submitModalOpen = false)}
	/>
</div>
