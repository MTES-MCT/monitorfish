#!/bin/bash
set -e

./import-meta-env -x .env.example -p public/index.html

exec "$@"
