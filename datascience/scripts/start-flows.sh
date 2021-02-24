#!/bin/bash

docker run -t --rm --network=host --name monitorfish-pipeline-flows \
        -v prefect_flows:/home/monitorfish-pipeline/.prefect \
        monitorfish-pipeline:${VERSION} \
        python main.py