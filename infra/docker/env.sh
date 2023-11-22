#!/bin/bash
set -e

envsubst < runtime-env.js.template > public/env.js

exec "$@"

