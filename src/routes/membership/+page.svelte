<script lang="ts">
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';

	const plans = [
		{
			name: 'Monthly',
			price: '$49',
			period: '/ month',
			blurb: 'Full library access, cancel anytime.',
			features: ['All practice exams', 'Performance analytics', 'Monthly question updates']
		},
		{
			name: 'Annual',
			price: '$399',
			period: '/ year',
			highlight: true,
			blurb: 'Best value for serious certification candidates.',
			features: [
				'Everything in Monthly',
				'2 months free vs. monthly',
				'Priority support',
				'Early access to new tracks'
			]
		},
		{
			name: 'Team',
			price: 'Custom',
			period: '',
			blurb: 'For orgs training multiple implementers.',
			features: ['Volume licensing', 'Admin reporting', 'SSO-ready (roadmap)', 'Invoice billing']
		}
	];
</script>

<svelte:head>
	<title>Membership | Service Certify</title>
	<meta
		name="description"
		content="Subscribe for unlimited access to all ServiceNow practice exams and analytics."
	/>
</svelte:head>

<section class="editorial-gradient py-20 md:py-28">
	<div class="mx-auto max-w-7xl px-8 text-center">
		<h1 class="font-headline mb-6 text-4xl font-extrabold text-white md:text-5xl">
			Unlimited practice. One membership.
		</h1>
		<p class="mx-auto max-w-2xl text-lg text-primary-fixed opacity-90">
			Get every mock exam, domain quizzes, and readiness analytics—updated for current ServiceNow
			releases. Checkout with Stripe can be wired here when you're ready.
		</p>
	</div>
</section>

<section class="mx-auto -mt-12 max-w-7xl px-8 pb-24">
	<div class="grid gap-8 md:grid-cols-3">
		{#each plans as plan}
			<div
				class="flex flex-col rounded-2xl bg-surface-container-lowest p-8 shadow-ambient {plan.highlight
					? 'ring-2 ring-secondary md:-translate-y-2 md:scale-[1.02]'
					: ''}"
			>
				{#if plan.highlight}
					<span
						class="font-label mb-4 inline-block w-fit rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-secondary-container"
					>
						Most popular
					</span>
				{/if}
				<h2 class="font-headline text-2xl font-bold text-primary">{plan.name}</h2>
				<p class="mt-4 flex items-baseline gap-1">
					<span class="text-4xl font-extrabold text-primary">{plan.price}</span>
					<span class="text-on-surface-variant">{plan.period}</span>
				</p>
				<p class="mt-4 text-sm text-on-surface-variant">{plan.blurb}</p>
				<ul class="mt-8 flex-1 space-y-3">
					{#each plan.features as f}
						<li class="flex items-start gap-2 text-sm text-on-surface">
							<MaterialIcon name="check_circle" class="shrink-0 text-secondary" filled />
							{f}
						</li>
					{/each}
				</ul>
				<button
					type="button"
					class="mt-10 w-full rounded-md py-4 text-center text-sm font-bold transition-transform active:scale-[0.98] {plan.highlight
						? 'bg-secondary text-on-secondary'
						: 'bg-primary text-on-primary'}"
				>
					{plan.name === 'Team' ? 'Contact sales' : 'Checkout (coming soon)'}
				</button>
			</div>
		{/each}
	</div>

	<div
		class="mt-16 rounded-2xl bg-surface-container-low px-8 py-10 text-center md:text-left md:px-12"
	>
		<h3 class="font-headline text-xl font-bold text-primary">What happens next</h3>
		<p class="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
			This page is a styled shell for Vercel. Connect Stripe Checkout or your auth provider, then gate
			<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-xs">/exams/*/practice</code> behind
			an active subscription record in your database.
		</p>
	</div>
</section>
