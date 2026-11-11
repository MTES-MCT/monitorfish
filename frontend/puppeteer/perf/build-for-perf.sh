#!/usr/bin/env bash
# Production build of the frontend with the local `.env` injected at runtime (as the Docker image does),
# to be served by `vite preview` on port 3000 for the performance specs.
set -euo pipefail

cd "$(dirname "$0")/../.."

npm run build
node node_modules/@import-meta-env/cli/bin/import-meta-env.js -x .env.example -e .env -p build/index.html
