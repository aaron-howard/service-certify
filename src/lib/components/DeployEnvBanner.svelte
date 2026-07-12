<script lang="ts">
	import type { DeployEnvironment } from '$lib/deployEnvironment';
	import { deployEnvironmentBannerLabel } from '$lib/deployEnvironment';

	let { deployEnvironment }: { deployEnvironment: DeployEnvironment } = $props();

	const label = $derived(deployEnvironmentBannerLabel(deployEnvironment));
</script>

{#if label}
	<div
		class="bg-tertiary-container px-4 py-2 text-center text-[0.7rem] font-semibold tracking-wide text-on-tertiary-container"
		role="status"
		data-testid="deploy-env-banner"
	>
		{label}
	</div>
{/if}
