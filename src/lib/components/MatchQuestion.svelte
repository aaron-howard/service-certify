<script lang="ts">
	import {
		displayIndexToOriginal,
		originalIndexToDisplay
	} from '$lib/practice/choiceShuffle';

	type Props = {
		leftItems: string[];
		rightItems: string[];
		/** display index → original bank index for each column */
		leftPermutation: number[];
		rightPermutation: number[];
		/** Map of display left index → display right index chosen by the user. */
		selections: Record<number, number>;
		disabled?: boolean;
		/** After grade: correct pairings in original index space. */
		correctMatches?: { left: number; right: number }[];
		submitted?: boolean;
		onchange: (selections: Record<number, number>) => void;
	};

	let {
		leftItems,
		rightItems,
		leftPermutation,
		rightPermutation,
		selections,
		disabled = false,
		correctMatches = [],
		submitted = false,
		onchange
	}: Props = $props();

	let draggingLeft = $state<number | null>(null);

	function rightForLeft(leftIdx: number): number | undefined {
		return selections[leftIdx];
	}

	function setPair(leftIdx: number, rightIdx: number) {
		const next = { ...selections };
		// Remove any other left already mapped to this right (one-to-one from left side).
		for (const [l, r] of Object.entries(next)) {
			if (Number(r) === rightIdx && Number(l) !== leftIdx) {
				delete next[Number(l)];
			}
		}
		next[leftIdx] = rightIdx;
		onchange(next);
	}

	function clearLeft(leftIdx: number) {
		const next = { ...selections };
		delete next[leftIdx];
		onchange(next);
	}

	function onDragStart(leftIdx: number, e: DragEvent) {
		if (disabled) return;
		draggingLeft = leftIdx;
		e.dataTransfer?.setData('text/plain', String(leftIdx));
		e.dataTransfer!.effectAllowed = 'move';
	}

	function onDropRight(rightIdx: number, e: DragEvent) {
		e.preventDefault();
		if (disabled) return;
		const raw = e.dataTransfer?.getData('text/plain');
		const leftIdx = raw !== undefined && raw !== '' ? Number(raw) : draggingLeft;
		if (leftIdx === null || Number.isNaN(leftIdx)) return;
		setPair(leftIdx, rightIdx);
		draggingLeft = null;
	}

	function pairStatus(displayLeftIdx: number): 'correct' | 'wrong' | 'neutral' {
		if (!submitted || !correctMatches.length) return 'neutral';
		const chosenDisplayRight = selections[displayLeftIdx];
		if (chosenDisplayRight === undefined) return 'wrong';
		const originalLeft = displayIndexToOriginal(displayLeftIdx, leftPermutation);
		const chosenOriginalRight = displayIndexToOriginal(chosenDisplayRight, rightPermutation);
		const expectedOriginalRight = correctMatches.find((p) => p.left === originalLeft)?.right;
		return expectedOriginalRight === chosenOriginalRight ? 'correct' : 'wrong';
	}

	function rightHighlight(displayRightIdx: number): 'correct' | 'wrong' | 'neutral' {
		if (!submitted || !correctMatches.length) return 'neutral';
		const matchedLeft = Object.entries(selections).find(([, r]) => r === displayRightIdx)?.[0];
		if (matchedLeft === undefined) return 'neutral';
		const displayLeftIdx = Number(matchedLeft);
		const originalLeft = displayIndexToOriginal(displayLeftIdx, leftPermutation);
		const originalRight = displayIndexToOriginal(displayRightIdx, rightPermutation);
		const expectedOriginalRight = correctMatches.find((p) => p.left === originalLeft)?.right;
		return expectedOriginalRight === originalRight ? 'correct' : 'wrong';
	}

	/** Correct display-right index for a left row after grade (for showing missed answers). */
	function expectedDisplayRight(displayLeftIdx: number): number | undefined {
		const originalLeft = displayIndexToOriginal(displayLeftIdx, leftPermutation);
		const expectedOriginalRight = correctMatches.find((p) => p.left === originalLeft)?.right;
		if (expectedOriginalRight === undefined) return undefined;
		return originalIndexToDisplay(expectedOriginalRight, rightPermutation);
	}
</script>

<p class="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
	Match each item on the left to the correct option on the right
</p>

<div class="grid gap-6 md:grid-cols-2">
	<div>
		<p class="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Items</p>
		<ul class="space-y-2">
			{#each leftItems as label, leftIdx}
				{@const status = pairStatus(leftIdx)}
				<li
					role="listitem"
					draggable={!disabled}
					ondragstart={(e) => onDragStart(leftIdx, e)}
					ondragend={() => (draggingLeft = null)}
					class="flex items-center justify-between gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-high/80 px-4 py-3 text-sm {status ===
					'correct'
						? 'ring-2 ring-secondary'
						: ''} {status === 'wrong' ? 'ring-2 ring-error' : ''} {!disabled
						? 'cursor-grab active:cursor-grabbing'
						: ''}"
				>
					<span class="text-on-surface">{label}</span>
					{#if rightForLeft(leftIdx) !== undefined}
						<span class="text-xs text-secondary">
							→ {rightItems[rightForLeft(leftIdx)!]}
						</span>
					{:else if submitted && expectedDisplayRight(leftIdx) !== undefined}
						<span class="text-xs text-secondary">
							→ {rightItems[expectedDisplayRight(leftIdx)!]}
						</span>
					{/if}
					{#if !disabled && rightForLeft(leftIdx) !== undefined}
						<button
							type="button"
							class="text-xs text-on-surface-variant hover:text-error"
							onclick={() => clearLeft(leftIdx)}
						>
							Clear
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	</div>

	<div>
		<p class="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
			Matches
		</p>
		<ul class="space-y-2">
			{#each rightItems as label, rightIdx}
				{@const highlight = rightHighlight(rightIdx)}
				<li
					role="listitem"
					ondragover={(e) => e.preventDefault()}
					ondrop={(e) => onDropRight(rightIdx, e)}
					class="rounded-lg border border-dashed border-outline-variant/50 bg-surface-container-low px-4 py-3 text-sm transition-colors {highlight ===
					'correct'
						? 'ring-2 ring-secondary'
						: ''} {highlight === 'wrong' ? 'ring-2 ring-error' : ''} {!disabled
						? 'hover:border-secondary/60'
						: ''}"
				>
					<span class="text-on-surface">{label}</span>
				</li>
			{/each}
		</ul>
		<p class="mt-2 text-xs text-on-surface-variant">
			Drag an item from the left and drop it on the matching target, or tap an item then a target.
		</p>
	</div>
</div>
