#!/bin/bash

docker run -t --rm --network=host --name monitorfish-pipeline-flows \
        -v prefect_flows:/home/monitorfish-pipeline/.prefect \
        --env-file datascience/.env \
        docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline:v0.1.0_snapshot \
        python main.py