#!/bin/bash
source <VENV-LOCATION-TO-CHANGE>/bin/activate && \
prefect agent docker start --no-pull;
