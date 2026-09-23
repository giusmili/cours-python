#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env.preview ]; then
  echo "Missing terrain-de-jeu/.env.preview" >&2
  exit 1
fi

docker compose --env-file .env.preview -f docker-compose.preview.yml config >/dev/null
docker compose --env-file .env.preview -f docker-compose.preview.yml up -d --build
docker compose --env-file .env.preview -f docker-compose.preview.yml ps
