#!/bin/bash

# Exec into the container and run "prefect server stop"
(docker exec monitorfish-pipeline-server prefect server stop;
docker container stop monitorfish-pipeline-server;
docker container rm monitorfish-pipeline-server;
) || \

# If the container is not running, `docker exec` will fail.
# In this case, 
(
    docker container rm monitorfish-pipeline-server;
    docker run -t --rm --network=host --name monitorfish-pipeline-server \
    -u monitorfish-pipeline:$(getent group docker | cut --delimiter=":" -f3) \
    -v /var/run/docker.sock:/var/run/docker.sock docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:$MONITORFISH_VERSION \
    prefect server stop;
 )