#!/usr/bin/env bash
# Redeploy Frevio after pushing changes. Run from the EC2 box:
#   bash deploy/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Pulling latest…"
git pull --ff-only

echo "→ Installing deps…"
npm ci

echo "→ Building…"
npm run build

echo "→ Reloading app…"
pm2 reload frevio

echo "✓ Deployed."
