<script lang="ts">
	type Props = {
		currentIndex: number;
		total: number;
		disabled?: boolean;
		showSubmit?: boolean;
		submitting?: boolean;
		onPrevious?: () => void;
		onNext?: () => void;
		onSubmit?: () => void;
		onOpenPalette?: () => void;
	};

	let {
		currentIndex,
		total,
		disabled = false,
		showSubmit = true,
		submitting = false,
		onPrevious,
		onNext,
		onSubmit,
		onOpenPalette
	}: Props = $props();

	const atStart = $derived(currentIndex <= 0);
	const atEnd = $derived(currentIndex >= total - 1);
</script>

<div
	class="sticky bottom-0 z-40 flex flex-col gap-3 border-t border-outline-variant/15 bg-surface-container-lowest/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
	role="navigation"
	aria-label="Question navigation"
>
	<div class="flex items-center gap-2">
		<button
			type="button"
			class="rounded-md border border-outline-variant/30 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-container-high disabled:opacity-40"
			disabled={disabled || atStart}
			onclick={() => onPrevious?.()}
		>
			Previous
		</button>
		<button
			type="button"
			data-testid="practice-next"
			class="rounded-md border border-outline-variant/30 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-container-high disabled:opacity-40"
			disabled={disabled || atEnd}
			onclick={() => onNext?.()}
		>
			Next
		</button>
		<button
			type="button"
			data-testid="practice-palette-toggle"
			class="rounded-md border border-outline-variant/30 px-4 py-2 text-sm font-bold text-secondary transition-colors hover:bg-surface-container-high disabled:opacity-40"
			{disabled}
			onclick={() => onOpenPalette?.()}
		>
			Questions
		</button>
	</div>

	{#if showSubmit}
		<button
			type="button"
			data-testid="practice-submit"
			class="rounded-md bg-secondary px-8 py-2.5 text-sm font-bold text-on-secondary transition-opacity hover:opacity-90 disabled:opacity-40"
			disabled={disabled || submitting}
			onclick={() => onSubmit?.()}
		>
			{submitting ? 'Grading…' : 'Submit exam'}
		</button>
	{/if}
</div>
