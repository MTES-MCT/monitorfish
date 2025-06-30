#!/bin/bash
source <VENV-LOCATION-TO-CHANGE>/bin/activate && \
source ~/.prefect-worker && \
prefect worker start --pool monitorfish --type docker --with-healthcheck

