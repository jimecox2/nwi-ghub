#!/bin/bash
# deploy-push-to-hub-secure.sh
set -euo pipefail

# Load .env if values are not already set in the environment
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

read -p "Tag (press Enter for 'latest'): " tag
tag=${tag:-latest}

# STRAPI_URL is baked into the client bundle at build time. Prompt if unset.
if [ -z "${STRAPI_URL:-}" ]; then
  read -p "STRAPI_URL (e.g. https://be2.timebars.com): " STRAPI_URL
fi

if [ -z "${DOCKER_PAT:-}" ]; then
  read -sp "Docker PAT: " DOCKER_PAT
  echo
fi

echo "$DOCKER_PAT" | docker login -u jimecox807 --password-stdin

docker build \
  --build-arg STRAPI_URL="$STRAPI_URL" \
  -t jimecox807/nwi:"$tag" .

docker push jimecox807/nwi:"$tag"
