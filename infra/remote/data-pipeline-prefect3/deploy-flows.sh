#!/bin/bash

#        -v /opt2/monitorfish-data/ers:/opt2/monitorfish-data/ers \
# docker run --rm --network=host --name monitorfish-pipeline-deploy-flows \
docker run -t --rm --network=host --name monitorfish-pipeline-deploy-flows \
    -v "$(pwd)"/pipeline/.env:/home/monitorfish-pipeline/pipeline/.env \
    -e HOST_ENV_FILE_LOCATION="$(pwd)"/pipeline/.env \
    -e MONITORFISH_VERSION \
    -e PREFECT_API_URL \
    -e LOGBOOK_FILES_GID \
    ghcr.io/mtes-mct/monitorfish/monitorfish-pipeline-prefect3:$MONITORFISH_VERSION \
    python main.py
