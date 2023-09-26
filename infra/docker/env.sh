#!/bin/bash

sed -i 's#__VITE_MONITORENV_URL__#'"$VITE_MONITORENV_URL"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_GEOSERVER_LOCAL_URL__#'"$VITE_GEOSERVER_LOCAL_URL"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_GEOSERVER_REMOTE_URL__#'"$VITE_GEOSERVER_REMOTE_URL"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_CYPRESS_TEST__#'"$VITE_CYPRESS_TEST"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_IS_DEV_ENV__#'"$VITE_IS_DEV_ENV"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_OIDC_REDIRECT_URI__#'"$VITE_OIDC_REDIRECT_URI"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_OIDC_AUTHORITY__#'"$VITE_OIDC_AUTHORITY"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_OIDC_CLIENT_ID__#'"$VITE_OIDC_CLIENT_ID"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_OIDC_ENABLED__#'"$VITE_OIDC_ENABLED"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_MONITORFISH_VERSION__#'"$VITE_MONITORFISH_VERSION"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_SENTRY_DSN__#'"$SENTRY_DSN"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_SENTRY_ENV__#'"$VITE_SENTRY_ENV"'#g' /home/monitorfish/public/scripts/env.js
sed -i 's#__VITE_SENTRY_TRACING_ORIGINS__#'"$VITE_SENTRY_TRACING_ORIGINS"'#g' /home/monitorfish/public/scripts/env.js
exec "$@"
