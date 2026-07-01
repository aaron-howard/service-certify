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
		? "font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
		: undefined}
	aria-hidden="true"
>{name}</span>
