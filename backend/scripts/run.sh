#!/bin/bash

if [ ! -f mvnw ]; then
    echo "Maven wrapper not found. Please execute this script from the backend folder."
    exit 1
fi

SPRING_PROFILES_ACTIVE=${1:-local}
INFRA_FOLDER="$(pwd)/../infra/configurations/"

./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.config.additional-location=$INFRA_FOLDER" -Dspring-boot.run.profiles="$SPRING_PROFILES_ACTIVE"
