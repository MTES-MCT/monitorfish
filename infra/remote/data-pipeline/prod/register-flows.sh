#!/bin/bash

docker run -t --network=host --name monitorfish-pipeline-agent \
        -v /opt2/monitorfish-data/ers:/opt2/monitorfish-data/ers \
	-v "$(pwd)"/infra/configurations/prefect-agent/backend.toml:/home/monitorfish-pipeline/.prefect/backend.toml \
        -v "$(pwd)"/datascience/.env:/home/monitorfish-pipeline/datascience/.env \
        --env-file datascience/.env \
        -e MONITORFISH_VERSION \
        -e LOGBOOK_FILES_GID="$(getent group dp_etlmf | cut -d: -f3)" \
        docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$MONITORFISH_VERSION \
        python main.py
