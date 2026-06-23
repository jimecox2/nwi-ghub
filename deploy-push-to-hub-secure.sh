#!/bin/bash
# deploy-push-to-hub-secure.sh

# Load .env if DOCKER_PAT not already set
if [ -z "$DOCKER_PAT" ] && [ -f .env ]; then
  set -a
  source .env
  set +a
fi

read -p "Tag (press Enter for 'latest'): " tag
tag=${tag:-latest}

if [ -z "$DOCKER_PAT" ]; then
  read -sp "Docker PAT: " DOCKER_PAT
  echo
fi

echo "$DOCKER_PAT" | docker login -u jimecox807 --password-stdin

docker build -t jimecox807/nwi:$tag .
docker push jimecox807/nwi:$tag