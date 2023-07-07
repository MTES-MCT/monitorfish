#!/bin/bash

sed -i 's#__REACT_APP_MONITORENV_URL__#'"$REACT_APP_MONITORENV_URL"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_GEOSERVER_LOCAL_URL__#'"$REACT_APP_GEOSERVER_LOCAL_URL"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_GEOSERVER_REMOTE_URL__#'"$REACT_APP_GEOSERVER_REMOTE_URL"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_CYPRESS_TEST__#'"$REACT_APP_CYPRESS_TEST"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_IS_DEV_ENV__#'"$REACT_APP_IS_DEV_ENV"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_OIDC_REDIRECT_URI__#'"$REACT_APP_OIDC_REDIRECT_URI"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_OIDC_AUTHORITY__#'"$REACT_APP_OIDC_AUTHORITY"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_OIDC_CLIENT_ID__#'"$REACT_APP_OIDC_CLIENT_ID"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_OIDC_ENABLED__#'"$REACT_APP_OIDC_ENABLED"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_MONITORFISH_VERSION__#'"$REACT_APP_MONITORFISH_VERSION"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_SENTRY_DSN__#'"$SENTRY_DSN"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_SENTRY_ENV__#'"$REACT_APP_SENTRY_ENV"'#g' /home/monitorfish/public/env.js
sed -i 's#__REACT_APP_SENTRY_TRACING_ORIGINS__#'"$REACT_APP_SENTRY_TRACING_ORIGINS"'#g' /home/monitorfish/public/env.js
exec "$@"
