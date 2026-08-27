# How to run Convex locally and seed practice questions

Run a two-terminal loop so the SvelteKit app can load practice questions, sync WorkOS users, and persist dashboard progress.

## Prerequisites

- Node.js `>=22.11.0`
- A Convex project (this repo’s shared dev deployment is documented in `.env.convex`)
- The **full** private bank at `src/convex/seed/devQuestionBank.private.ts` (not the one-row stub)
- `.env.local` with `PUBLIC_CONVEX_URL` matching the deployment you will use

Convex CLI commands in `package.json` pass `--env-file .env.convex`. SvelteKit / Vite read `.env.local`. Copy the deployment URL from `.env.convex` into `.env.local`. Do not invert those files.

## Steps

1. Confirm the private bank is the full bank, not the stub.

   `src/convex/seed/devQuestionBank.ts` treats a bank as full when it has at least `FULL_QUESTION_BANK_MIN_ROWS` (400) rows. `npm run seed:dev:questions` **refuses** to run on the stub so a fresh clone cannot wipe Convex with placeholders.

   Place the real file at `src/convex/seed/devQuestionBank.private.ts`. See [`src/convex/seed/QUESTION_BANK.md`](../src/convex/seed/QUESTION_BANK.md).

2. Start Convex in one terminal.

   ```bash
   npm run convex:dev
   ```

   This deploys functions from `src/convex/`, keeps codegen in sync, and prints the HTTP deployment URL.

3. Put that URL in `.env.local` as `PUBLIC_CONVEX_URL`, then start the app in a second terminal.

   ```bash
   npm run dev
   ```

   Restart Vite after changing `PUBLIC_CONVEX_URL` so SSR and the browser see the same value.

4. Seed certification tracks, then questions.

   ```bash
   npm run seed:dev
   npm run seed:dev:questions
   ```

   `seed:dev` runs `internal.seed.apply` (replace all `certificationTracks` rows from [`tracksCanonical.ts`](../src/lib/catalog/tracksCanonical.ts)).

   `seed:dev:questions` runs `internal.seed.devQuestions` (delete existing `difficulty: "dev"` rows, then insert the private bank).

5. Open `/exams` in the browser. In **dev**, the catalog page shows `Convex (dev): N certification tracks in database` when `tracks.list` succeeds.

6. Open `/exams/csa/practice` and start a sample. You should get up to three questions.

## Verification

```bash
curl -sS http://localhost:5173/api/health | python3 -m json.tool
```

You want `"status": "ok"` and `checks.convex.status` of `"ok"`. Missing `PUBLIC_CONVEX_URL` returns HTTP 503 with Convex marked error (`CONVEX_URL not configured`).

On `/exams` in `vite dev`, the live track count should match 22 after `seed:dev`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Seed: “Refusing to seed: full practice bank is missing” | Copy the real bank to `devQuestionBank.private.ts`. The example stub is one row. |
| Catalog works, practice is empty | `PUBLIC_CONVEX_URL` missing or Vite not restarted; or questions never seeded. |
| Practice loads then grade returns 503 `Convex not configured` | Grade route reads `PUBLIC_CONVEX_URL` on the server. Set it in `.env.local`, restart `npm run dev`. |
| `NoAuthProvider` on signed-in Convex calls | WorkOS JWT template must include `"aud": "<WORKOS_CLIENT_ID>"`. See [AUTH-WORKOS.md](./AUTH-WORKOS.md). |
| You edited `src/convex/catalog/*.ts` and nothing changed | Those files are re-exports. Edit `src/lib/catalog/` instead. |

Production seed (ops, not local): `npm run seed:prod` against the prod Convex deployment. Same private-bank gate.

Related: [tutorial](./tutorial-first-practice-session.md), [catalog reference](./reference-catalog.md), [Convex API](./reference-convex-api.md).
