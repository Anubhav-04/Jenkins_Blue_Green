#!/usr/bin/env bash
set -euo pipefail
npm ci
npm run build
mkdir -p build
tar -C dist -czf build/artifact.tar.gz .
echo "Created build/artifact.tar.gz"
