#!/bin/bash

docker run -t --rm --network=host --name forklift-register-flows \
        -v /opt2/sacrois-data:/opt2/sacrois-data \
        -v "$(pwd)"/data_warehouse/.env:/home/forklift/data_warehouse/.env \
	    -v "$(pwd)"/infra/data_warehouse/forklift/backend.toml:/home/forklift/.prefect/backend.toml \
        --env-file data_warehouse/.env \
        -e FORKLIFT_VERSION \
        -e SACROIS_FILES_GID \
        ghcr.io/mtes-mct/monitorfish/forklift:$FORKLIFT_VERSION \
        python main.py
