<script lang="ts">
	import type { QuestionStatus } from '$lib/practice/sessionNav';

	type Props = {
		open: boolean;
		total: number;
		currentIndex: number;
		statusFor: (index: number) => QuestionStatus;
		onSelect?: (index: number) => void;
		onClose?: () => void;
	};

	let { open, total, currentIndex, statusFor, onSelect, onClose }: Props = $props();

	let dialogEl = $state<HTMLDivElement | null>(null);
	let previousFocus = $state<HTMLElement | null>(null);

	const statusClass: Record<QuestionStatus, string> = {
		unanswered: 'border-outline-variant/40 bg-surface-container-high text-on-surface-variant',
		answered: 'border-secondary/40 bg-secondary-container/30 text-primary',
		flagged: 'border-amber-500/50 bg-amber-500/10 text-primary'
	};

	$effect(() => {
		if (!open) {
			previousFocus?.focus();
			previousFocus = null;
			return;
		}
		previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		queueMicrotask(() => dialogEl?.focus());
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
		role="presentation"
		onclick={() => onClose?.()}
		onkeydown={(e) => e.key === 'Escape' && onClose?.()}
	>
		<div
			bind:this={dialogEl}
			class="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface-container-lowest p-6 shadow-xl sm:max-h-[80vh] sm:rounded-xl"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby="practice-palette-title"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					onClose?.();
					return;
				}
				e.stopPropagation();
			}}
		>
			<div class="mb-4 flex items-center justify-between">
				<h3 id="practice-palette-title" class="font-headline text-lg font-bold text-primary">
					All questions
				</h3>
				<button
					type="button"
					class="text-sm font-bold text-secondary hover:underline"
					onclick={() => onClose?.()}
				>
					Close
				</button>
			</div>
			<div class="grid grid-cols-5 gap-2 sm:grid-cols-8" data-testid="practice-palette">
				{#each Array.from({ length: total }, (_, i) => i) as i}
					{@const status = statusFor(i)}
					<button
						type="button"
						class="rounded-md border px-2 py-2 text-sm font-bold transition-colors {statusClass[status]} {i ===
						currentIndex
							? 'ring-2 ring-primary'
							: ''}"
						aria-current={i === currentIndex ? 'true' : undefined}
						onclick={() => {
							onSelect?.(i);
							onClose?.();
						}}
					>
						{i + 1}
					</button>
				{/each}
			</div>
			<p class="mt-4 text-xs text-on-surface-variant">
				Green = answered · Amber = flagged for review · Gray = unanswered
			</p>
		</div>
	</div>
{/if}
