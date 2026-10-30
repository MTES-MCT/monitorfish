#!/bin/bash
set -e

# The JVM falls back to a regular startup if the AOT cache cannot be used
exec java -XX:AOTCache=app/app.aot \
  "-Dhttp.proxyHost=${MONITORFISH_HTTP_PROXY_HOST}" "-Dhttp.proxyPort=${MONITORFISH_HTTP_PROXY_PORT}" \
  "-Dhttps.proxyHost=${MONITORFISH_HTTP_PROXY_HOST}" "-Dhttps.proxyPort=${MONITORFISH_HTTP_PROXY_PORT}" \
  "-Dhttp.nonProxyHosts=${MONITORFISH_HTTP_NON_PROXY_HOSTS}" "-Dhttps.nonProxyHosts=${MONITORFISH_HTTP_NON_PROXY_HOSTS}" \
  -jar "app/monitorfish-${VERSION}.jar"
