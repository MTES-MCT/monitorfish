#!/bin/bash

sed -i 's#REACT_APP_GEOSERVER_LOCAL_URL#'"$REACT_APP_GEOSERVER_LOCAL_URL"'#g' /home/monitorfish/public/env.js

exec "$@"
