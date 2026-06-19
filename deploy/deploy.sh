#!/usr/bin/env bash
# Redeploy Frevio after pushing changes. Run from the EC2 box:
#   bash deploy/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Syncing to origin/main…"
# Force the working tree to exactly match origin/main. The server is a
# disposable mirror; .env is gitignored so it is never touched. This avoids
# "local changes would be overwritten" failures if a tracked file was edited
# directly on the box.
git fetch origin main
git reset --hard origin/main

echo "→ Installing deps…"
npm ci

echo "→ Building…"
npm run build

echo "→ Reloading app…"
pm2 reload frevio

echo "✓ Deployed."
