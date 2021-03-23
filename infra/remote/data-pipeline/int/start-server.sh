#!/bin/bash

docker run -t --rm --network=host --name monitorfish-pipeline-server \
        -u monitorfish-pipeline:$(getent group docker | cut --delimiter=":" -f3) \
        -v "$(pwd)"/infra/configurations/prefect-server/int:/home/monitorfish-pipeline/.prefect \
        -v /var/run/docker.sock:/var/run/docker.sock docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$MONITORFISH_VERSION \
        prefect server start --use-volume --volume-path ~/.prefect/server/pg_data --postgres-port "5433"
