<script lang="ts">
	let {
		name,
		filled = false,
		class: className = ''
	}: { name: string; filled?: boolean; class?: string } = $props();
</script>

<span
	class="material-symbols-outlined shrink-0 {className}"
	style={filled
		? // FILL axis is only in full/fill font files; with wght.css use heavier weight instead.
			"font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24"
		: undefined}
	aria-hidden="true"
>{name}</span>
