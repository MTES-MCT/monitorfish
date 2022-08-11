#!/bin/bash

docker run -t --rm --network=host --name monitorfish-pipeline-register-flows \
        -v /opt2/monitorfish-data/ers:/opt2/monitorfish-data/ers \
        -v "$(pwd)"/datascience/.env:/home/monitorfish-pipeline/datascience/.env \
        --env-file datascience/.env \
        -e MONITORFISH_VERSION \
        -e LOGBOOK_FILES_GID="$(getent group di_etlmf | cut -d: -f3)" \
        docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$MONITORFISH_VERSION \
        python main.py
