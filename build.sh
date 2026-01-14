#!/bin/bash
# Build script with automatic cache busting

VERSION=$(date +%s)
echo "Building with cache version: $VERSION"

docker compose build --build-arg CACHE_VERSION=$VERSION
docker compose up -d

echo "Build complete! Version: $VERSION"
