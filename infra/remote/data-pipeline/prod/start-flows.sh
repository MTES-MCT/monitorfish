#!/bin/bash

docker run -t --rm --network=host --name monitorfish-pipeline-flows \
        -v prefect_flows:/home/monitorfish-pipeline/.prefect \
        -u monitorfish-pipeline:"$(getent group dp_etlmf | cut -d: -f3)" \
        --env-file datascience/.env \
        docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$MONITORFISH_VERSION \
        python main.py