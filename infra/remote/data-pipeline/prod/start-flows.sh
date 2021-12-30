#!/bin/bash

docker run -d -t --network=host --name monitorfish-pipeline-flows \
        -v prefect_flows:/home/monitorfish-pipeline/.prefect \
        -u monitorfish-pipeline:"$(getent group dp_etlmf | cut -d: -f3)" \
        -v /opt2/monitorfish-data/ers:/opt2/monitorfish-data/ers \
        --env-file datascience/.env \
        --health-cmd='wget --no-verbose --tries=1 --spider http://localhost:8085/api/health || exit 1'\
        --health-interval=10s \
        --health-retries=5 \
        --health-timeout=2s \
        --health-start-period=30s \
        --restart always \
        docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$MONITORFISH_VERSION \
        python main.py
