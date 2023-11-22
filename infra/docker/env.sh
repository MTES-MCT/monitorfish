#!/bin/bash

ls /home/monitorfish/
cat /home/monitorfish/import-meta-env
./home/monitorfish/import-meta-env -x /home/monitorfish/.env.example -p /home/monitorfish/public/index.html

exec "$@"
