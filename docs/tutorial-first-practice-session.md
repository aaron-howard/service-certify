# Take your first sample practice session

You will run Service Certify on your machine, open the exam catalog, and (when Convex is configured) complete a three-question sample for CSA. By the end you will know which parts of the app work from static files and which parts need a live Convex deployment.

## What you'll need

- Node.js `>=22.11.0` (`node -v`)
- npm
- This repository cloned
- Optional for questions: a Convex deployment URL in `.env.local` (`PUBLIC_CONVEX_URL`) and the private question bank (see [How to run Convex locally and seed practice questions](./howto-run-convex-locally.md))

## Step 1: Install and copy env

From the repo root:

```bash
npm install
cp .env.example .env.local
```

`npm install` also runs `prepare`, which copies the stub question bank into `src/convex/seed/devQuestionBank.private.ts` if that file is missing. That stub is enough for typecheck. It is not enough to seed questions.

If `.env.convex` already lists a `CONVEX_URL` / `PUBLIC_CONVEX_URL`, copy that URL into `.env.local` as `PUBLIC_CONVEX_URL`. You can skip this and still complete Step 3.

## Step 2: Start the app

```bash
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`. Open it. You should see the landing page with featured exams (CSA, CAD, CIS-ITSM) and a catalog CTA.

That is the first working result: the UI renders from static catalog data even when Convex is unset.

## Step 3: Browse the catalog

Open [http://localhost:5173/exams](http://localhost:5173/exams).

You should see 22 tracks. Search for `CSA`. Filter by Associate if you want a shorter list. Click **Certified System Administrator**.

The detail page shows blueprint domain cards, a **Try Sample Practice** button, and a membership placeholder. **Start Full Mock** appears only when you are signed in as an admin.

## Step 4: Start sample practice

Click **Try Sample Practice**. That loads `/exams/csa/practice` (`mode=sample`).

**If `PUBLIC_CONVEX_URL` is set and the bank is seeded:** you get an intro, then up to three questions. Choose answers, submit, and you see explanations and a score. The list payload has no `correctIndex` and no explanation until grade.

**If Convex is missing or the bank is empty:** the practice page still loads the exam chrome, then tells you questions could not be loaded. The catalog did not break. That split is explained in [Why the catalog is static and questions live in Convex](./explanation-data-split.md).

Do not invent client-side answer keys to “fix” an empty session.

## What you built

A local SvelteKit app that:

- Serves `/`, `/exams`, and `/exams/csa` from [`src/lib/data/exams.ts`](../src/lib/data/exams.ts)
- Loads sample questions from Convex `practiceQuestions.listByTrackCode` when configured
- Grades through `POST /api/practice/grade` (not in the browser)

Next:

- [How to run Convex locally and seed practice questions](./howto-run-convex-locally.md)
- [How to unlock a full mock as admin](./howto-unlock-full-mock.md)
- [Convex functions and schema](./reference-convex-api.md)
