#!/bin/bash

envsubst < runtime-env.js.template > public/env.js

exec "$@"

