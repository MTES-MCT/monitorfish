#!/bin/bash
set -e

./home/monitorfish/import-meta-env -x /home/monitorfish/.env.example -p /home/monitorfish/public/**/*

exec "$@"
