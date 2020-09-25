#!/bin/bash

if [ ! -f mvnw ]; then
    echo "Maven wrapper not found. Please execute this script from the backend folder."
    exit 1
fi

./mvnw test

cd tools && ./check-clean-architecture.sh && cd -
