<script lang="ts">
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';
	import { getFeaturedExams } from '$lib/data/exams';

	const featured = getFeaturedExams();
</script>

<svelte:head>
	<title>Service Certify | Unlimited ServiceNow Practice Exams</title>
	<meta
		name="description"
		content="Unlimited ServiceNow certification practice exams, performance analytics, and realistic mock tests."
	/>
</svelte:head>

<!-- Hero -->
<section class="editorial-gradient relative overflow-hidden py-24 md:py-32">
	<div class="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-8 md:grid-cols-12">
		<div class="md:col-span-7">
			<span
				class="font-label mb-6 inline-block rounded-full bg-secondary-container px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.05em] text-on-secondary-container"
			>
				Exam Mastery Platform
			</span>
			<h1
				class="font-headline mb-8 text-5xl font-extrabold leading-[1.1] tracking-[-0.02em] text-white md:text-7xl"
			>
				One Membership. <br /> Unlimited Practice Exams.
			</h1>
			<p class="mb-10 max-w-xl text-xl leading-relaxed text-primary-fixed opacity-90">
				Stop guessing if you're ready. Get unlimited access to realistic mock tests, detailed
				performance analytics, and community-verified practice materials for every major ServiceNow
				certification.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row">
				<a
					href="/membership"
					class="flex items-center justify-center gap-2 rounded-md bg-secondary px-8 py-4 text-lg font-bold text-on-secondary transition-transform active:scale-95"
				>
					Access All Exams <MaterialIcon name="arrow_forward" />
				</a>
				<a
					href="/exams"
					class="rounded-md border border-white/10 bg-primary-container/50 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-transform active:scale-95"
				>
					View Exam Catalog
				</a>
			</div>
			<p class="mt-6 text-sm font-medium text-primary-fixed/60">
				Join 12,000+ professionals passing their exams on the first attempt.
			</p>
		</div>
		<div class="relative md:col-span-5">
			<div class="glass-card relative z-20 rounded-xl border border-white/20 p-8 shadow-2xl">
				<div class="mb-6 flex items-center gap-4">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container">
						<MaterialIcon name="assignment_turned_in" filled class="text-on-secondary-container" />
					</div>
					<div>
						<h3 class="font-headline font-bold text-primary">Exam Readiness</h3>
						<p class="text-sm font-medium text-on-surface-variant">94% First-Time Pass Rate</p>
					</div>
				</div>
				<div class="space-y-4">
					<div class="h-2 w-full overflow-hidden rounded-full bg-surface-container">
						<div class="h-full w-[94%] bg-secondary"></div>
					</div>
					<p class="text-xs font-medium italic text-on-surface-variant">
						"The mock tests were 99% identical to the actual exam environment. I walked into my CSA
						exam with total confidence." — Certified Architect
					</p>
				</div>
			</div>
			<div class="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-secondary/20 blur-[80px]"></div>
		</div>
	</div>
	<div class="pointer-events-none absolute inset-0 z-0 opacity-10">
		<img
			class="h-full w-full object-cover"
			alt=""
			src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAIi-XnO9ktEiXe-HuB9w_VPc6-7WyMnWM_6M2OzwDHcZNQO5zZCsaxl7dg7bheT0Hv68H2d9LAAoa009gS9-ugDrC5Weur3fj15jC7EpQEmQoBtVacyXhP8qjdSdcHt6hTJh_Ie_QPEae0yhITcJD7rrNXqBBpMuZBufhb9p3w0m-i9cy7i-Z2UAizzSLe8a5Xw-92BRbZjMpKxpxrBlsWeeVVT4L0ZjD1qZtBJYU8I287jFeBlPhdpTvFKiwNRlyVeDTfQKQvPc"
		/>
	</div>
</section>

<!-- Featured exams -->
<section class="bg-surface py-24">
	<div class="mx-auto max-w-7xl px-8">
		<div class="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
			<div class="max-w-2xl">
				<span
					class="font-label mb-4 block text-xs font-bold uppercase tracking-widest text-secondary"
				>
					MEMBER EXAM REPOSITORY
				</span>
				<h2 class="font-headline text-4xl font-extrabold tracking-tight text-primary">
					Full Library of Practice Mock Tests
				</h2>
				<p class="mt-4 text-on-surface-variant">
					Unlimited attempts on all current and upcoming certification mock exams.
				</p>
			</div>
			<a
				href="/exams"
				class="flex items-center gap-2 font-bold text-primary transition-transform hover:translate-x-1"
			>
				Explore All Mock Exams <MaterialIcon name="trending_flat" />
			</a>
		</div>
		<div class="grid gap-8 md:grid-cols-3">
			{#each featured as exam}
				<a
					href="/exams/{exam.slug}"
					class="group rounded-xl border-b-4 border-transparent bg-surface-container-lowest p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] transition-all hover:border-secondary"
				>
					<div class="relative mb-6 aspect-video w-full overflow-hidden rounded-full">
						<img
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							src={exam.image}
							alt=""
						/>
						<span
							class="glass-card absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold text-primary"
						>
							{exam.homeBadge ?? 'PRACTICE EXAM'}
						</span>
					</div>
					<h3 class="font-headline mb-3 text-xl font-bold text-primary">{exam.shortTitle}</h3>
					<p class="mb-6 text-sm leading-relaxed text-on-surface-variant">
						{exam.homeDescription ?? exam.description}
					</p>
					<div class="mt-auto flex items-center justify-between">
						<span class="font-label text-xs font-bold uppercase tracking-tighter text-secondary">
							{exam.questionBankLabel}+ Questions
						</span>
						<MaterialIcon name="verified" class="text-secondary" />
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Practice advantage -->
<section class="bg-surface-container-low py-24">
	<div class="mx-auto grid max-w-7xl items-center gap-16 px-8 lg:grid-cols-2">
		<div class="space-y-12">
			<div>
				<span
					class="font-label mb-4 block text-xs font-bold uppercase tracking-widest text-secondary"
				>
					THE PRACTICE ADVANTAGE
				</span>
				<h2 class="font-headline mb-6 text-4xl font-extrabold leading-tight text-primary md:text-5xl">
					Designed for Precision.
				</h2>
				<p class="text-lg leading-relaxed text-on-surface-variant">
					As an independent provider, we bypass generic study materials to offer precision-engineered
					mock tests. Our platform isn't about watching videos—it's about active recall and exam
					simulation.
				</p>
			</div>
			<div class="grid gap-8 sm:grid-cols-2">
				<div class="space-y-4">
					<MaterialIcon name="analytics" class="text-4xl text-secondary" />
					<h4 class="font-headline font-bold text-primary">Topic Analysis</h4>
					<p class="text-sm leading-relaxed text-on-surface-variant">
						Get a granular breakdown of your strengths and weaknesses across all exam blueprint
						domains.
					</p>
				</div>
				<div class="space-y-4">
					<MaterialIcon name="update" class="text-4xl text-secondary" />
					<h4 class="font-headline font-bold text-primary">Regular Updates</h4>
					<p class="text-sm leading-relaxed text-on-surface-variant">
						Our question bank is updated monthly to reflect the latest ServiceNow platform
						releases.
					</p>
				</div>
			</div>
		</div>
		<div class="overflow-hidden rounded-xl bg-primary p-1">
			<div class="relative overflow-hidden rounded-lg bg-primary-container p-12 text-center">
				<div class="relative z-10">
					<h3 class="mb-2 text-5xl font-extrabold text-white">98.4%</h3>
					<p class="font-label mb-8 text-xs font-bold uppercase tracking-widest text-primary-fixed">
						SATISFACTION RATING
					</p>
					<p class="font-medium italic text-white opacity-80">
						"The most authoritative practice resource for platform professionals today."
					</p>
				</div>
				<div
					class="absolute inset-0 bg-gradient-to-tr from-primary to-transparent opacity-50"
				></div>
			</div>
		</div>
	</div>
</section>

<!-- Testimonials -->
<section class="bg-surface py-24">
	<div class="mx-auto max-w-7xl px-8">
		<div class="mb-16 text-center">
			<h2 class="font-headline text-3xl font-extrabold text-primary">Success Stories</h2>
		</div>
		<div class="no-scrollbar relative flex gap-8 overflow-x-auto pb-8 snap-x">
			<div
				class="relative min-w-[320px] snap-center rounded-xl bg-surface-container-low p-10 md:min-w-[480px]"
			>
				<MaterialIcon
					name="format_quote"
					class="absolute right-8 top-8 text-6xl text-secondary-container opacity-40"
				/>
				<p class="relative z-10 mb-8 text-lg font-medium leading-relaxed text-primary">
					"Subscription was a no-brainer. Instead of paying for individual test banks, I get
					everything. The mock exams helped me pass CAD and ITSM in the same quarter."
				</p>
				<div class="relative z-10 text-sm text-on-surface-variant">
					<span class="font-bold text-primary">Marcus Thorne</span> — Sr. Solutions Architect
				</div>
			</div>
			<div
				class="min-w-[320px] snap-center rounded-xl bg-surface-container-low p-10 md:min-w-[480px]"
			>
				<p class="mb-8 text-lg font-medium leading-relaxed text-primary">
					"The timer and question layout exactly match the actual Pearson VUE exam experience. It's
					the best way to handle exam-day nerves."
				</p>
				<div class="text-sm text-on-surface-variant">
					<span class="font-bold text-primary">Elena Rodriguez</span> — Service Delivery Manager
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Final CTA -->
<section class="px-8 pb-24">
	<div class="editorial-gradient relative mx-auto max-w-7xl overflow-hidden rounded-3xl p-16 text-center">
		<div class="relative z-10">
			<h2 class="font-headline mb-6 text-4xl font-extrabold text-white md:text-5xl">
				Start Your Unlimited Practice Journey
			</h2>
			<p class="mx-auto mb-10 max-w-2xl text-lg text-primary-fixed">
				Join a community of 12,000+ professionals and get instant access to every practice exam track
				we offer.
			</p>
			<a
				href="/membership"
				class="inline-block rounded-md bg-secondary px-12 py-5 text-xl font-extrabold text-on-secondary shadow-xl transition-transform active:scale-95"
			>
				Join Membership Now
			</a>
		</div>
		<div
			class="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-3xl"
		></div>
		<div
			class="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl"
		></div>
	</div>
</section>
