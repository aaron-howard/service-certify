<script lang="ts">
	import MatchQuestion from '$lib/components/MatchQuestion.svelte';
	import { originalIndexToDisplay } from '$lib/practice/choiceShuffle';

	type Question = {
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
		correctIndexes: number[];
		correctMatches: { left: number; right: number }[];
		explanation: string;
	};

	type Props = {
		question: Question;
		questionNumber: number;
		selected?: number;
		selectedMulti?: number[];
		matchSelections?: Record<number, number>;
		disabled?: boolean;
		submitted?: boolean;
		graded?: GradeResult;
		onSelectSingle?: (displayIdx: number) => void;
		onToggleMulti?: (displayIdx: number) => void;
		onMatchChange?: (selections: Record<number, number>) => void;
	};

	let {
		question,
		questionNumber,
		selected,
		selectedMulti = [],
		matchSelections = {},
		disabled = false,
		submitted = false,
		graded,
		onSelectSingle,
		onToggleMulti,
		onMatchChange
	}: Props = $props();

	function displayCorrectIndexes(): number[] {
		if (!graded) return [];
		return graded.correctIndexes.map((original) =>
			originalIndexToDisplay(original, question.permutation)
		);
	}

	function isChoiceCorrect(displayIdx: number): boolean {
		return displayCorrectIndexes().includes(displayIdx);
	}

	function isChoiceSelected(displayIdx: number): boolean {
		return question.questionType === 'multi'
			? selectedMulti.includes(displayIdx)
			: selected === displayIdx;
	}
</script>

<article
	data-testid="practice-question"
	class="rounded-xl bg-surface-container-lowest p-4 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] sm:p-8"
>
	<div class="mb-6 flex items-start justify-between gap-4">
		<h2 class="font-headline text-lg font-bold text-primary">
			<span class="text-secondary">Q{questionNumber}.</span>
			{question.prompt}
		</h2>
	</div>

	{#if question.questionType === 'multi'}
		<p class="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
			Select all that apply
		</p>
	{/if}

	{#if question.questionType === 'match' && question.matchLeftItems && question.matchRightItems}
		<MatchQuestion
			leftItems={question.matchLeftItems}
			rightItems={question.matchRightItems}
			leftPermutation={question.matchLeftPermutation ?? []}
			rightPermutation={question.matchRightPermutation ?? []}
			selections={matchSelections}
			{disabled}
			{submitted}
			correctMatches={graded?.correctMatches ?? []}
			onchange={(next) => onMatchChange?.(next)}
		/>
	{:else}
		<ul class="space-y-3">
			{#each question.choices as choice, idx}
				{@const showCorrect = submitted && graded && isChoiceCorrect(idx)}
				{@const showWrong =
					submitted && graded && isChoiceSelected(idx) && !isChoiceCorrect(idx)}
				<li>
					<label
						class="flex cursor-pointer items-start gap-3 rounded-lg bg-surface-container-high/80 p-4 transition-colors hover:bg-surface-container-high {showCorrect
							? 'ring-2 ring-secondary'
							: ''} {showWrong ? 'ring-2 ring-error' : ''}"
					>
						{#if question.questionType === 'multi'}
							<input
								type="checkbox"
								name="q{question.id}"
								class="mt-1 rounded border-outline text-secondary focus:ring-secondary"
								{disabled}
								checked={isChoiceSelected(idx)}
								onchange={() => onToggleMulti?.(idx)}
							/>
						{:else}
							<input
								type="radio"
								name="q{question.id}"
								class="mt-1 border-outline text-secondary focus:ring-secondary"
								{disabled}
								checked={selected === idx}
								onchange={() => onSelectSingle?.(idx)}
							/>
						{/if}
						<span class="text-sm leading-relaxed text-on-surface">{choice}</span>
					</label>
				</li>
			{/each}
		</ul>
	{/if}

	{#if submitted && graded}
		<div
			class="mt-6 rounded-lg border border-secondary-container/40 bg-secondary-container/15 p-4 text-sm text-on-surface-variant"
		>
			<p class="font-bold text-primary">Explanation</p>
			<p class="mt-1 leading-relaxed">{graded.explanation}</p>
		</div>
	{/if}
</article>
