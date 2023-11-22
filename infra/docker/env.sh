#!/bin/bash
set -e

./home/monitorfish/import-meta-env -x /home/monitorfish/.env.example -o /home/monitorfish/public/**/*

exec "$@"
