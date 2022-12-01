#!/bin/bash
source <VENV-LOCATION-TO-CHANGE>/bin/activate && \
source ~/.prefect-agent && \
prefect agent docker start --api "${PREFECT_SERVER_URL}" --label monitorfish;
