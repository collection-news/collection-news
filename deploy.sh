#!/usr/bin/env bash
set -euo pipefail

cd /var/www/collection-news

mise trust
mise install

mise exec -- pm2 stop nextjs
systemctl stop meilisearch

git checkout development
git pull --ff-only

mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm run build

systemctl start meilisearch

mise exec -- pm2 delete nextjs
mise exec -- pm2 start ecosystem.config.js --only nextjs --update-env
mise exec -- pm2 save