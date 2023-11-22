#!/bin/bash
set -e

ls -al /home/monitorfish/
./home/monitorfish/import-meta-env -x /home/monitorfish/.env.example -p /home/monitorfish/public/index.html

exec "$@"
