# Wiki source

Markdown in this folder is the source for the
[GitHub Wiki](https://github.com/aaron-howard/service-certify/wiki).

| File | Wiki page |
| ---- | --------- |
| `Home.md` | [Home](https://github.com/aaron-howard/service-certify/wiki) |
| `_Sidebar.md` | Wiki sidebar (not a standalone page) |

## Publish to GitHub Wiki

GitHub Apps (including CI/`GITHUB_TOKEN`) cannot create or push wiki pages.
Publish with a **user** account that has write access to the repo.

### First-time bootstrap

1. Open [Create the first wiki page](https://github.com/aaron-howard/service-certify/wiki/_new) while signed in as a repo collaborator.
2. Title: `Home` — paste the contents of `Home.md`, then save.
3. From a clone of this repo, run:

```bash
./scripts/publish-wiki.sh
```

That creates/updates `_Sidebar.md` and keeps `Home` in sync for later edits.

### Later updates

Edit files under `wiki/`, merge to `main`, then run `./scripts/publish-wiki.sh` (or paste manually).
