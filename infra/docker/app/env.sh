#!/bin/bash
set -e

./import-meta-env -x .env.local.defaults -p public/index.html

exec "$@"
