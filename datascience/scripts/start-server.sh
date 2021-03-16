#!/bin/bash

docker run -t --rm --network=host --name monitorfish-pipeline-server \
        -u monitorfish-pipeline:$(getent group docker | cut --delimiter=":" -f3) \
        -v /var/run/docker.sock:/var/run/docker.sock monitorfish-pipeline:${VERSION} \
        prefect server start --use-volume --volume-path ~/.prefect/server/pg_data