<script lang="ts">
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';

	let { data } = $props();
	const exam = $derived(data.exam);
</script>

<svelte:head>
	<title>{exam.title} | Service Certify</title>
	<meta name="description" content={exam.description} />
</svelte:head>

<section
	class="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary pt-16 pb-24 md:pt-20 md:pb-32"
>
	<div class="relative z-10 mx-auto max-w-7xl px-8">
		<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
			<div class="lg:col-span-7">
				<div
					class="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary-container/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-secondary-container"
				>
					<MaterialIcon name="quiz" filled class="text-sm" />
					Updated for {exam.releaseFocus} release
				</div>
				<h1 class="font-headline text-editorial-lg mb-8 font-extrabold leading-none text-white">
					{exam.code}
					<span class="text-secondary-container"> Exam Prep</span>
				</h1>
				<p class="mb-10 max-w-2xl text-xl leading-relaxed text-on-primary-container">
					Access a realistic question bank with explanations, timed simulation, and domain analytics
					aligned to current ServiceNow certification blueprints.
				</p>
				<div class="flex flex-wrap gap-6 text-white/80">
					<div class="flex items-center gap-2">
						<MaterialIcon name="inventory_2" class="text-secondary-container" />
						<span class="font-medium">{exam.questionBankLabel} Questions</span>
					</div>
					<div class="flex items-center gap-2">
						<MaterialIcon name="update" class="text-secondary-container" />
						<span class="font-medium">Last Updated: {exam.updatedLabel}</span>
					</div>
					<div class="flex items-center gap-2">
						<MaterialIcon name="fact_check" class="text-secondary-container" />
						<span class="font-medium">{exam.passRate} Pass Rate</span>
					</div>
				</div>
			</div>
			<div class="relative lg:col-span-5">
				<div
					class="sticky top-36 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-[0px_20px_40px_rgba(0,0,0,0.2)]"
				>
					<div
						class="mb-6 rounded-lg border border-primary-container/10 bg-primary/5 p-6"
					>
						<div class="mb-4 flex items-center justify-between">
							<span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant"
								>Exam Code</span
							>
							<span class="font-bold text-primary">{exam.code}</span>
						</div>
						<div class="space-y-3 text-sm">
							<div class="flex justify-between">
								<span class="text-on-surface-variant">Questions in Bank</span>
								<span class="font-bold">{exam.questionBankLabel}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-on-surface-variant">Release Focus</span>
								<span class="font-bold text-secondary">{exam.releaseFocus}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-on-surface-variant">Mock Exams</span>
								<span class="font-bold">{exam.mockExamCount}</span>
							</div>
						</div>
					</div>
					<p class="mb-6 text-sm leading-relaxed text-on-surface-variant">
						Join Service Certify to unlock this test bank and our complete library of exam
						preparation materials.
					</p>
					<div class="mb-8 space-y-4">
						<a
							href="/membership"
							class="block w-full rounded-md bg-secondary py-4 text-center text-lg font-bold text-on-secondary transition-all hover:brightness-110 active:scale-[0.98]"
						>
							Unlock with Membership
						</a>
						<a
							href="/exams/{exam.slug}/practice"
							class="block w-full rounded-md border-2 border-primary-fixed py-4 text-center text-lg font-bold text-primary transition-all hover:bg-primary-fixed/10"
						>
							Try Sample Practice
						</a>
					</div>
					<div class="space-y-3">
						<p class="text-sm font-bold uppercase tracking-widest text-primary">Test Bank Features</p>
						<ul class="space-y-2 text-sm text-on-surface-variant">
							<li class="flex items-center gap-3">
								<MaterialIcon name="verified" class="text-lg text-secondary" />
								Detailed explanations for each answer
							</li>
							<li class="flex items-center gap-3">
								<MaterialIcon name="timer" class="text-lg text-secondary" />
								Timed simulation mode
							</li>
							<li class="flex items-center gap-3">
								<MaterialIcon name="analytics" class="text-lg text-secondary" />
								Domain-specific performance analysis
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="bg-surface py-24 md:py-32">
	<div class="mx-auto max-w-7xl px-8">
		<div class="mb-16">
			<h2 class="font-headline mb-4 text-3xl font-extrabold text-primary">Exam Domain Breakdown</h2>
			<div class="h-1.5 w-24 bg-secondary"></div>
			<p class="mt-6 max-w-2xl text-on-surface-variant">
				Our test bank mirrors official blueprint weighting so you spend time where it matters most.
			</p>
		</div>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each exam.domains as domain}
				{#if domain.highlight}
					<div
						class="flex flex-col justify-center rounded-xl bg-primary p-8 text-white md:col-span-1"
					>
						<MaterialIcon name={domain.icon} class="mb-6 text-4xl text-secondary-container" />
						<h3 class="font-headline mb-3 text-xl font-bold">{domain.name}</h3>
						<p class="mb-6 text-sm leading-relaxed text-on-primary-container">{domain.description}</p>
						<span class="text-xs font-black uppercase tracking-widest text-secondary-container">
							{domain.weight} Weight • {domain.questionCount}
						</span>
					</div>
				{:else}
					<div class="rounded-xl bg-surface-container-low p-8">
						<div class="mb-6 flex items-start justify-between">
							<MaterialIcon name={domain.icon} class="text-3xl text-secondary" />
							<span class="rounded bg-primary/10 px-2 py-1 text-xs font-black text-primary"
								>{domain.weight} Weight</span
							>
						</div>
						<h3 class="font-headline mb-3 text-lg font-bold text-primary">{domain.name}</h3>
						<p class="mb-6 text-sm text-on-surface-variant">{domain.description}</p>
						<div
							class="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-secondary"
						>
							<span>{domain.questionCount}</span>
							<MaterialIcon name="arrow_forward" class="text-sm" />
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<section class="bg-primary py-24 text-center text-white">
	<div class="mx-auto max-w-4xl px-8">
		<h2 class="font-headline mb-6 text-4xl font-extrabold">Confidence is key to passing.</h2>
		<p class="mb-10 text-xl text-on-primary-container">
			Train with accurate mock exams and detailed analytics before you sit for the official test.
		</p>
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<a
				href="/membership"
				class="rounded-md bg-secondary px-10 py-4 text-lg font-bold text-on-secondary shadow-lg transition-transform active:scale-95"
			>
				Unlock with Membership
			</a>
			<a
				href="/exams"
				class="rounded-md border border-white/20 px-10 py-4 text-lg font-bold transition-colors hover:bg-white/10"
			>
				Browse Catalog
			</a>
		</div>
	</div>
</section>
