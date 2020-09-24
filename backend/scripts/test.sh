#!/bin/bash

if [ ! -f mvnw ]; then
    echo "Maven wrapper not found. Please execute this script from the backend folder."
    exit 1
fi

INFRA_FOLDER="$(pwd)/infra/configurations"
./mvnw test -DargLine="-ea -Dspring.config.additional-location=$INFRA_FOLDER"

cd tools && ./check-clean-architecture.sh && cd -
