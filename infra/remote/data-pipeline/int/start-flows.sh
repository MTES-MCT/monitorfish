#!/bin/bash

docker run -d -t --network=host --name monitorfish-pipeline-agent \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -u monitorfish-pipeline:"$(getent group docker | cut -d: -f3)" \
        -v /opt2/monitorfish-data/ers:/opt2/monitorfish-data/ers \
	    -v "$(pwd)"/infra/configurations/prefect-agent/backend.toml:/home/monitorfish-pipeline/.prefect/backend.toml \
        -v "$(pwd)"/datascience/.env:/home/monitorfish-pipeline/datascience/.env \
        --env-file datascience/.env \
        -e MONITORFISH_VERSION \
        -e LOGBOOK_FILES_GID="$(getent group di_etlmf | cut -d: -f3)" \
        --health-cmd='wget --no-verbose --tries=1 -O /dev/null http://localhost:8085/api/health || exit 1'\
        --health-interval=10s \
        --health-retries=5 \
        --health-timeout=2s \
        --health-start-period=120s \
        --restart always \
        docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$MONITORFISH_VERSION \
        python main.py
