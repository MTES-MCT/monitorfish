#!/bin/bash
set -e

ls -al /home/monitorfish/
./import-meta-env -x .env.example -p public/index.html

exec "$@"
