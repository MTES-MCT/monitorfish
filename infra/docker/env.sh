#!/bin/bash

sed -i 's#__REACT_APP_MONITORENV_URL__#'"$REACT_APP_MONITORENV_URL"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_GEOSERVER_LOCAL_URL__#'"$REACT_APP_GEOSERVER_LOCAL_URL"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_GEOSERVER_REMOTE_URL__#'"$REACT_APP_GEOSERVER_REMOTE_URL"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_CYPRESS_TEST__#'"$REACT_APP_CYPRESS_TEST"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_IS_DEV_ENV__#'"$REACT_APP_IS_DEV_ENV"'#g' /home/monitorfish/public/env.js

exec "$@"
