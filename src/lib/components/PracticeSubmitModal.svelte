<script lang="ts">
	type Props = {
		open: boolean;
		unansweredCount: number;
		submitting?: boolean;
		onConfirm?: () => void;
		onCancel?: () => void;
	};

	let { open, unansweredCount, submitting = false, onConfirm, onCancel }: Props = $props();

	let dialogEl = $state<HTMLDivElement | null>(null);
	let previousFocus = $state<HTMLElement | null>(null);

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
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
		role="presentation"
		onclick={() => onCancel?.()}
		onkeydown={(e) => e.key === 'Escape' && onCancel?.()}
	>
		<div
			bind:this={dialogEl}
			class="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-xl"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby="submit-modal-title"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					onCancel?.();
					return;
				}
				e.stopPropagation();
			}}
		>
			<h3 id="submit-modal-title" class="font-headline text-lg font-bold text-primary">
				Submit exam?
			</h3>
			{#if unansweredCount > 0}
				<p class="mt-3 text-sm text-on-surface-variant">
					You have <strong>{unansweredCount}</strong>
					unanswered question{unansweredCount === 1 ? '' : 's'}. You can go back and complete them,
					or submit now.
				</p>
			{:else}
				<p class="mt-3 text-sm text-on-surface-variant">
					All questions are answered. Ready to submit for grading?
				</p>
			{/if}
			<div class="mt-6 flex justify-end gap-3">
				<button
					type="button"
					class="rounded-md border border-outline-variant/30 px-4 py-2 text-sm font-bold text-primary"
					disabled={submitting}
					onclick={() => onCancel?.()}
				>
					Keep working
				</button>
				<button
					type="button"
					data-testid="practice-submit-confirm"
					class="rounded-md bg-secondary px-6 py-2 text-sm font-bold text-on-secondary disabled:opacity-40"
					disabled={submitting}
					onclick={() => onConfirm?.()}
				>
					{submitting ? 'Grading…' : 'Submit now'}
				</button>
			</div>
		</div>
	</div>
{/if}
