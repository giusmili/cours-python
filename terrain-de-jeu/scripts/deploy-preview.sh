#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

env_file="${PLAYGROUND_ENV_FILE:-.env.preview}"
image_tag="${PLAYGROUND_IMAGE_TAG:-local}"

if [ ! -f "$env_file" ]; then
  echo "Missing preview environment file: $env_file" >&2
  exit 1
fi

export PLAYGROUND_ENV_FILE="$env_file"
export PLAYGROUND_IMAGE_TAG="$image_tag"

docker compose -p playground-dev -f docker-compose.preview.yml config >/dev/null
docker compose -p playground-dev -f docker-compose.preview.yml build playground
docker compose -p playground-dev -f docker-compose.preview.yml up -d --no-build playground
docker compose -p playground-dev -f docker-compose.preview.yml ps
