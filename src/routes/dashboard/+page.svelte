<script lang="ts">
	import MaterialIcon from '$lib/components/MaterialIcon.svelte';
</script>

<svelte:head>
	<title>Service Certify | Mock Exam Readiness</title>
	<meta
		name="description"
		content="Track mock exam performance, readiness scores, and weak areas."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<div class="mb-24 grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
		<div class="lg:col-span-8">
			<p class="font-label mb-4 text-xs font-bold uppercase tracking-[0.05em] text-secondary">
				Mock Exam Readiness
			</p>
			<h1 class="font-headline text-display-lg text-5xl font-extrabold leading-tight tracking-tight text-primary">
				Welcome back, <br /> Architect in training.
			</h1>
			<p class="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
				You've completed 64% of your ServiceNow Technical Architect path. 2 mock exams are scheduled
				for this weekend.
			</p>
		</div>
		<div class="lg:col-span-4">
			<div
				class="relative overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-ambient"
			>
				<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondary-container/30 blur-2xl"></div>
				<div class="relative z-10">
					<MaterialIcon name="verified" filled class="mb-4 text-4xl text-secondary" />
					<h3 class="font-headline text-xl font-bold text-primary">Certified Application Developer</h3>
					<p class="mt-1 text-sm text-on-surface-variant">Achieved June 12, 2024</p>
					<button
						type="button"
						class="mt-6 flex items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-4"
					>
						View Credentials <MaterialIcon name="arrow_forward" class="text-sm" />
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-16 lg:grid-cols-3">
		<div class="space-y-12 lg:col-span-2">
			<section>
				<div class="mb-8 flex items-baseline justify-between">
					<h2 class="font-headline text-2xl font-bold text-primary">Active Mock Exams</h2>
					<a href="/exams" class="text-sm font-semibold text-secondary hover:underline">View All Exams</a>
				</div>
				<div class="space-y-6">
					<div
						class="flex flex-col items-center gap-6 rounded-xl bg-surface-container-low p-6 transition-all hover:bg-surface-container-high md:flex-row"
					>
						<div
							class="relative h-32 w-full overflow-hidden rounded-lg bg-primary-container md:w-48"
						>
							<div
								class="absolute right-2 top-2 rounded bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
							>
								ITSM Advanced
							</div>
						</div>
						<div class="w-full flex-1">
							<div class="mb-2 flex justify-between items-start">
								<h4 class="font-headline text-lg font-bold text-primary">
									Scripting in ServiceNow Fundamentals
								</h4>
								<span
									class="rounded-full bg-secondary-container px-2 py-1 text-xs font-bold text-secondary"
								>
									72%
								</span>
							</div>
							<p class="mb-4 text-sm font-medium text-on-surface-variant">
								Session: Client-side API Optimization Practice
							</p>
							<div class="mb-6 h-[6px] w-full rounded-full bg-secondary-container">
								<div class="h-full w-[72%] rounded-full bg-secondary"></div>
							</div>
							<a
								href="/exams/cis-itsm/practice"
								class="inline-block rounded-md bg-secondary px-6 py-2 text-sm font-bold text-on-secondary transition-opacity hover:opacity-90"
							>
								Resume Practice Test
							</a>
						</div>
					</div>
					<div
						class="flex flex-col items-center gap-6 rounded-xl bg-surface-container-low p-6 transition-all hover:bg-surface-container-high md:flex-row"
					>
						<div
							class="relative h-32 w-full overflow-hidden rounded-lg bg-primary-container md:w-48"
						>
							<div
								class="absolute right-2 top-2 rounded bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
							>
								ITOM PRO
							</div>
						</div>
						<div class="w-full flex-1">
							<div class="mb-2 flex justify-between items-start">
								<h4 class="font-headline text-lg font-bold text-primary">
									Discovery & Event Management Deep Dive
								</h4>
								<span
									class="rounded-full bg-surface-container-highest px-2 py-1 text-xs font-bold text-on-surface-variant"
								>
									15%
								</span>
							</div>
							<p class="mb-4 text-sm font-medium text-on-surface-variant">
								Session: Mid-Server Infrastructure Setup
							</p>
							<div class="mb-6 h-[6px] w-full rounded-full bg-secondary-container">
								<div class="h-full w-[15%] rounded-full bg-secondary"></div>
							</div>
							<a
								href="/exams/cis-disco/practice"
								class="inline-block rounded-md bg-primary-fixed px-6 py-2 text-sm font-bold text-on-primary-fixed transition-opacity hover:opacity-90"
							>
								Resume Practice Test
							</a>
						</div>
					</div>
				</div>
			</section>

			<section class="relative overflow-hidden rounded-2xl bg-primary p-10 text-white">
				<div class="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]"></div>
				<div class="relative z-10">
					<h2 class="font-headline mb-8 text-2xl font-bold">Mock Exam Performance</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div>
							<p class="font-label mb-2 text-xs uppercase tracking-widest text-on-primary-container">
								Avg. Score
							</p>
							<p class="font-headline text-3xl font-bold">88%</p>
							<p class="mt-2 text-xs font-bold text-secondary">+4% from last week</p>
						</div>
						<div>
							<p class="font-label mb-2 text-xs uppercase tracking-widest text-on-primary-container">
								Fastest Time
							</p>
							<p class="font-headline text-3xl font-bold">42m</p>
							<p class="mt-2 text-xs text-slate-400">Personal best</p>
						</div>
						<div>
							<p class="font-label mb-2 text-xs uppercase tracking-widest text-on-primary-container">
								Percentile
							</p>
							<p class="font-headline text-3xl font-bold">Top 5%</p>
							<p class="mt-2 text-xs text-slate-400">Among candidates</p>
						</div>
					</div>
				</div>
			</section>
		</div>

		<div class="space-y-12">
			<section>
				<h3 class="font-headline mb-6 text-lg font-bold text-primary">Recently Viewed</h3>
				<div class="space-y-4">
					<div class="group cursor-pointer">
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded bg-surface-container-high"
							>
								<MaterialIcon name="description" class="text-primary" />
							</div>
							<div>
								<p
									class="text-sm font-bold leading-tight text-primary transition-colors group-hover:text-secondary"
								>
									CSA Exam Preparation Guide v2.4
								</p>
								<p class="text-xs text-on-surface-variant">PDF Document • 4.2 MB</p>
							</div>
						</div>
					</div>
					<div class="group cursor-pointer">
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded bg-surface-container-high"
							>
								<MaterialIcon name="quiz" class="text-primary" />
							</div>
							<div>
								<p
									class="text-sm font-bold leading-tight text-primary transition-colors group-hover:text-secondary"
								>
									CMDB Health Dashboard Quiz
								</p>
								<p class="text-xs text-on-surface-variant">Practice Test • 20 Questions</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="rounded-2xl bg-surface-container-low p-8">
				<h3 class="font-headline mb-6 text-lg font-bold text-primary">Mastery Badges</h3>
				<div class="grid grid-cols-3 gap-4">
					<div class="flex aspect-square items-center justify-center rounded-full bg-white shadow-sm">
						<MaterialIcon name="bolt" filled class="text-2xl text-secondary" />
					</div>
					<div class="flex aspect-square items-center justify-center rounded-full bg-white shadow-sm">
						<MaterialIcon name="star" filled class="text-2xl text-secondary" />
					</div>
					<div class="flex aspect-square items-center justify-center rounded-full bg-white shadow-sm">
						<MaterialIcon name="local_fire_department" filled class="text-2xl text-secondary" />
					</div>
					<div
						class="flex aspect-square items-center justify-center rounded-full bg-surface-container-high opacity-40 grayscale"
					>
						<MaterialIcon name="lock" class="text-2xl" />
					</div>
					<div
						class="flex aspect-square items-center justify-center rounded-full bg-surface-container-high opacity-40 grayscale"
					>
						<MaterialIcon name="lock" class="text-2xl" />
					</div>
					<div
						class="flex aspect-square items-center justify-center rounded-full bg-surface-container-high opacity-40 grayscale"
					>
						<MaterialIcon name="lock" class="text-2xl" />
					</div>
				</div>
			</section>

			<div class="relative overflow-hidden rounded-2xl bg-secondary-container p-8">
				<h4 class="font-headline mb-4 text-xl font-extrabold leading-tight text-on-secondary-container">
					Need a study partner?
				</h4>
				<p class="mb-6 text-sm text-on-secondary-container/80">
					Join our community channels for the architect track and learn from mentors.
				</p>
				<button
					type="button"
					class="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white"
				>
					Join Community
				</button>
			</div>
		</div>
	</div>
</div>
