#!/bin/bash

sed -i 's#__REACT_APP_GEOSERVER_LOCAL_URL__#'"$REACT_APP_GEOSERVER_LOCAL_URL"'#g' /home/monitorfish/public/env.js

exec "$@"
