#!/bin/bash

./home/monitorfish/import-meta-env -x /home/monitorfish/.env.example

exec "$@"
