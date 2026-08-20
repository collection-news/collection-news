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

mise exec -- pm2 startOrReload ecosystem.config.js --only nextjs --update-env

# Keep application logs useful without allowing them to fill the Droplet disk.
logrotate_pid="$(mise exec -- pm2 pid pm2-logrotate 2>/dev/null || true)"
if [[ ! "$logrotate_pid" =~ ^[1-9][0-9]*$ ]]; then
  mise exec -- pm2 install pm2-logrotate
fi
mise exec -- pm2 set pm2-logrotate:max_size 20M
mise exec -- pm2 set pm2-logrotate:retain 7
mise exec -- pm2 set pm2-logrotate:compress true
mise exec -- pm2 set pm2-logrotate:dateFormat 'YYYY-MM-DD_HH-mm-ss'
mise exec -- pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
mise exec -- pm2 save
