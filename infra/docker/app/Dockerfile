#####################
# Multi stage build #
#####################

ARG GITHUB_SHA=NO_COMMIT
ARG VERSION=NO_VERSION

########################################
# Build monitorfish backend with maven #
########################################
FROM gradle:9.7.1-jdk25 AS build-back

ARG GITHUB_SHA
ARG VERSION

WORKDIR /tmp/

COPY --chown=gradle:gradle backend/ /tmp/
COPY --chown=gradle:gradle backend/build.gradle.kts /tmp/BUILD_GRADLE_WITH_ENV_VARS
RUN chown -R gradle /tmp/*

USER gradle
RUN sed -e "s/COMMIT_TO_CHANGE/$GITHUB_SHA/g" \
  -e "s/VERSION_TO_CHANGE/${VERSION}/g" \
  BUILD_GRADLE_WITH_ENV_VARS > build.gradle.kts

RUN gradle assemble

###########################
# Build frontend with npm #
###########################
FROM node:24-alpine AS build-front

ARG VERSION
ENV CI=true
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY frontend/ /tmp/frontend/
COPY infra/ /tmp/infra/
WORKDIR /tmp/frontend

# Files are expected to be in /tmp/frontend/dist/monitorfish-frontend
RUN npm ci
RUN npm run build

# Create an `import-meta-env` Alpine executable without node, to be copied to the final image
RUN npx pkg ./node_modules/@import-meta-env/cli/bin/import-meta-env.js \
  --target node16-alpine-x64 \
  --output import-meta-env

######################
# Create final image #
######################
FROM azul/zulu-openjdk-alpine:25-jre

ARG VERSION
ENV VERSION=$VERSION

ENV ENV_DB_URL=""

# Add bash
RUN apk add --no-cache bash

RUN adduser -D monitorfish
USER monitorfish

EXPOSE 8880
EXPOSE 5000
EXPOSE 5001
WORKDIR /home/monitorfish

ENV JAVA_TOOL_OPTIONS="-Dcom.sun.management.jmxremote.ssl=false \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.port=5000 \
  -Dcom.sun.management.jmxremote.rmi.port=5001 \
  -Dcom.sun.management.jmxremote.registry.ssl=false \
  -Dcom.sun.management.jmxremote.host=0.0.0.0 \
  -Djava.rmi.server.hostname=0.0.0.0"

# Copy files for the back
COPY --from=build-back /tmp/build/libs/monitorfish-${VERSION}.jar /home/monitorfish
COPY infra/configurations /home/monitorfish/configurations/

USER monitorfish
# Copy files for the front
RUN mkdir /home/monitorfish/public
COPY --from=build-front /tmp/frontend/build /home/monitorfish/public/

# Copy import-meta-env
COPY --from=build-front /tmp/frontend/import-meta-env /home/monitorfish/
COPY --from=build-front /tmp/frontend/.env.example /home/monitorfish/
COPY --from=build-front /tmp/infra/docker/app/env.sh /home/monitorfish/

# Add logs folder to be mounted as volume
RUN mkdir /home/monitorfish/logs

# Set up environment variable that define the root folder use for serving static files
# It must point to the front (React) files
ENV STATIC_FILES_PATH="/home/monitorfish/public"

USER root
# Missing from the JRE cacerts, it signs Tchap certificates.
# JAVA_TOOL_OPTIONS is cleared so that keytool does not start the JMX agent.
COPY infra/docker/app/certs/ /tmp/extra-certs/
RUN JAVA_TOOL_OPTIONS= keytool -importcert -noprompt -cacerts -storepass changeit \
      -alias haricatlsrsarootca2021 -file /tmp/extra-certs/harica-tls-rsa-root-ca-2021.pem \
    && rm -rf /tmp/extra-certs

RUN chown monitorfish /home/monitorfish/import-meta-env
RUN chmod +x /home/monitorfish/import-meta-env

RUN chown monitorfish /home/monitorfish/env.sh
RUN chmod +x /home/monitorfish/env.sh
RUN chown monitorfish public/index.html
RUN chmod +rwx public/index.html

USER monitorfish

# The AOT cache (JEP 483/514) needs a plain classpath, not the nested jars of the boot jar
RUN JAVA_TOOL_OPTIONS= java -Djarmode=tools -jar "monitorfish-${VERSION}.jar" extract --destination app \
    && rm "monitorfish-${VERSION}.jar"

# AOT cache training run: the context is refreshed then the JVM exits. No DB nor Kafka is reachable at build time,
# hence the dummy values and the disabled Flyway/Hibernate schema validation (only for this run).
# The JMX agent of JAVA_TOOL_OPTIONS is not started here, but its module must match the runtime one or the cache is rejected.
RUN JAVA_TOOL_OPTIONS= \
    MONITORFISH_SERVER_PORT=8880 MONITORFISH_AJP_PORT=8000 HOST_IP=127.0.0.1 \
    ENV_DB_URL=jdbc:postgresql://localhost:5432/aot ENV_DB_DRIVER_CLASS_NAME=org.postgresql.Driver \
    MONITORFISH_MIGRATION_PATH=classpath:/db/migration MONITORFISH_DATABASE_QUERY_TIMEOUT=10000 \
    MONITORFISH_DATABASE_MISSIONS_ACTIONS_CHUNK_SIZE=100 \
    MONITORFISH_API_PROTECTED_API_KEY=aot MONITORFISH_API_PROTECTED_PATHS=/aot \
    MONITORFISH_API_PROTECTED_SUPER_USER_PATHS=/aot MONITORFISH_API_PROTECTED_PUBLIC_PATHS=/aot \
    MONITORFISH_OIDC_ENABLED=true MONITORFISH_OIDC_CLIENT_ID=aot MONITORFISH_OIDC_CLIENT_SECRET=aot \
    MONITORFISH_OIDC_LOGIN_URL=http://aot MONITORFISH_OIDC_SUCCESS_URL=http://aot MONITORFISH_OIDC_ERROR_URL=http://aot \
    MONITORFISH_OIDC_REDIRECT_URI=http://aot MONITORFISH_OIDC_ISSUER_URI=http://aot \
    MONITORFISH_OIDC_ISSUER_URI_EXTERNAL=http://aot MONITORFISH_OIDC_AUTHORIZATION_URI=http://aot \
    MONITORFISH_OIDC_TOKEN_URI=http://aot MONITORFISH_OIDC_USER_INFO_URI=http://aot MONITORFISH_OIDC_JWK_SET_URI=http://aot \
    MONITORFISH_KAFKA_AIS_ENABLED=true MONITORFISH_KAFKA_AIS_SERVERS=localhost:9092 \
    MONITORFISH_SCHEDULING_ENABLED=false MONITORFISH_SENTRY_ENABLED=false SENTRY_DSN= MONITORENV_URL=http://aot \
    java -XX:AOTCacheOutput=app/app.aot -Dspring.context.exit=onRefresh \
      --add-modules jdk.management.agent \
      -jar "app/monitorfish-${VERSION}.jar" \
      --spring.flyway.enabled=false \
      --spring.jpa.hibernate.ddl-auto=none \
      --spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false \
    && rm -rf /home/monitorfish/logs/*

ENTRYPOINT ["/home/monitorfish/env.sh"]

# The JVM falls back to a regular startup if the AOT cache cannot be used
CMD exec java -XX:AOTCache=app/app.aot \
              -Dhttp.proxyHost=${MONITORFISH_HTTP_PROXY_HOST} -Dhttp.proxyPort=${MONITORFISH_HTTP_PROXY_PORT} \
              -Dhttps.proxyHost=${MONITORFISH_HTTP_PROXY_HOST} -Dhttps.proxyPort=${MONITORFISH_HTTP_PROXY_PORT} \
              -Dhttp.nonProxyHosts=${MONITORFISH_HTTP_NON_PROXY_HOSTS} -Dhttps.nonProxyHosts=${MONITORFISH_HTTP_NON_PROXY_HOSTS} \
              -jar "app/monitorfish-${VERSION}.jar"
