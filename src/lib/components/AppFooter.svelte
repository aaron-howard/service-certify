<script lang="ts">
	import logo from '$lib/assets/logo.svg';
</script>

<footer class="mt-auto w-full bg-surface-container-low py-12 text-sm">
	<div class="mx-auto flex max-w-7xl flex-col items-center space-y-4 px-6 text-center">
		<a href="/" class="flex items-center gap-2.5">
			<img src={logo} alt="" class="h-7 w-7" aria-hidden="true" />
			<span class="text-lg font-bold text-primary">Service Certify</span>
		</a>
		<div class="flex flex-wrap justify-center gap-6">
			<a class="text-on-surface-variant transition-colors hover:text-primary-container" href="/exams"
				>Exam Catalog</a
			>
			<a
				class="text-on-surface-variant transition-colors hover:text-primary-container"
				href="/membership">Membership</a
			>
			<a
				class="text-on-surface-variant transition-colors hover:text-primary-container"
				href="/privacy">Privacy Policy</a
			>
			<a
				class="text-on-surface-variant transition-colors hover:text-primary-container"
				href="/terms">Terms of Service</a
			>
			<a
				class="text-on-surface-variant transition-colors hover:text-primary-container"
				href="/support">Support</a
			>
		</div>
		<p class="mx-auto mt-4 max-w-4xl text-[11px] leading-relaxed text-on-surface-variant opacity-90">
			© {new Date().getFullYear()} Service Certify. Independent provider of ServiceNow practice
			materials. Not affiliated with, authorized, or endorsed by ServiceNow, Inc. All ServiceNow
			certifications and trademarks are property of ServiceNow, Inc. Our practice exams are designed
			to supplement official learning paths through simulated test environments.
		</p>
	</div>
</footer>
