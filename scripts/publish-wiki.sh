#!/usr/bin/env bash
# Publish wiki/*.md to the GitHub Wiki for aaron-howard/service-certify.
# Requires: git + write access as a user (not a GitHub App installation token).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/wiki"
REPO_SLUG="${WIKI_REPO_SLUG:-aaron-howard/service-certify}"
WIKI_URL="${WIKI_GIT_URL:-https://github.com/${REPO_SLUG}.wiki.git}"
TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

if [[ ! -f "${SRC}/Home.md" ]]; then
  echo "error: missing ${SRC}/Home.md" >&2
  exit 1
fi

echo "Cloning ${WIKI_URL} ..."
if ! git clone --depth 1 "$WIKI_URL" "$TMP/wiki" 2>/tmp/wiki-clone.err; then
  cat /tmp/wiki-clone.err >&2
  echo >&2
  echo "Wiki git remote not found yet. Create the first page once in the UI:" >&2
  echo "  https://github.com/${REPO_SLUG}/wiki/_new" >&2
  echo "Title: Home — paste wiki/Home.md, save, then re-run this script." >&2
  exit 1
fi

cd "$TMP/wiki"
# Copy tracked wiki pages (skip this folder's README).
find "$SRC" -maxdepth 1 -type f -name '*.md' ! -name 'README.md' -exec cp {} . \;

git add -A
if git diff --cached --quiet; then
  echo "Wiki already up to date."
  exit 0
fi

git config user.email "${GIT_AUTHOR_EMAIL:-wiki-bot@users.noreply.github.com}"
git config user.name "${GIT_AUTHOR_NAME:-Service Certify Wiki}"
git commit -m "Sync wiki from repository wiki/ folder"
git push origin HEAD
echo "Published: https://github.com/${REPO_SLUG}/wiki"
