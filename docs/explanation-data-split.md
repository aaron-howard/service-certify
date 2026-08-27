# Why the catalog is static and questions live in Convex

The exam list, domain cards, and official counts ship in the SvelteKit repo. Practice stems, keys, and grades live in Convex. Mixing those two would either leak answers into the public git tree or make the catalog depend on a backend that is optional for browsing.

## The problem

A practice platform has two different data lifetimes:

1. **Catalog** changes when ServiceNow publishes a new exam or blueprint. It is small, public, and needed to render `/exams` in CI, Vercel previews, and local clones with no Convex credentials.
2. **Question bank** is large, must stay out of public git, and must never reach the browser before submit. Putting keys in `$lib/data` would make “view source” and GitHub history into an answer key.

A single Convex table for “everything about an exam” fails both: empty Convex means a blank marketing site, and a public seed file becomes a dump.

## The approach

```
Static repo                          Convex deployment
─────────────────                    ─────────────────
tracksCanonical.ts  ──seed:dev──►    certificationTracks
examQuestionPolicy.ts                (sort order only)
trackDocSources.ts  ──UI only──►     (not stored)
exams.ts            ──/exams──►      unused for cards

devQuestionBank.private.ts ──seed──► practiceQuestions
                                     users / userProgress
```

**UI catalog:** [`src/lib/data/exams.ts`](../src/lib/data/exams.ts) builds `Exam[]` at module load from canonical tracks + policy + `trackDocSources`. `getExamBySlug` 404s unknown routes without a network call.

**Practice:** [`listByTrackCode`](./reference-convex-api.md) reads `practiceQuestions`. List mapping strips keys. [`POST /api/practice/grade`](./reference-http-api.md) scores on the server.

**Two env files:** `.env.convex` is committed for Convex CLI (`--env-file`). `.env.local` is gitignored for Vite. Agents copy `PUBLIC_CONVEX_URL` across. That split keeps CLI and app from fighting over which deployment they talk to.

**Private bank:** `devQuestionBank.private.ts` is gitignored. `npm prepare` copies a stub so CI typechecks. Seed refuses a bank under 400 rows so the stub cannot wipe a populated deployment.

Thin re-exports in `src/convex/catalog/` exist so Convex functions can import policy without duplicating numbers. Edit `$lib/catalog` only.

## Trade-offs

- Catalog and seeded `certificationTracks` can drift until someone runs `seed:dev`. The UI does not wait for Convex, so a missing seed does not hide exams. Dev-only `tracks.list` on `/exams` is a drift check, not the source of truth.
- Domain names live in `trackDocSources.ts` while question `domain` strings live in the private bank. A rename in one file without the other breaks realism tests and analytics grouping.
- Previews without `PUBLIC_CONVEX_URL` look complete until the user hits practice. That is intentional: static browse stays cheap.

## Alternatives considered

- **All catalog in Convex.** Rejected: the app must render without Convex (project rule). Preview and docs contributors would see empty `/exams`.
- **Questions in the repo, strip keys in the client.** Rejected: git history and JS bundles still contain answers. `listByTrackCode` omits keys on purpose.
- **Paid membership as the catalog gate.** Not built. `/membership` is a placeholder. Access to the *full question list* is admin role, not a plan flag. See [access model](./explanation-access-model.md).

## Related

- [Catalog reference](./reference-catalog.md)
- [How to add an exam track](./howto-add-exam-track.md)
- [architecture.md](./architecture.md)
