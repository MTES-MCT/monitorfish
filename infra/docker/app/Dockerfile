#####################
# Multi stage build #
#####################

ARG GITHUB_SHA=NO_COMMIT
ARG VERSION=NO_VERSION

########################################
# Build monitorfish backend with maven #
########################################
FROM gradle:8.4-jdk17 AS build-back

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
FROM node:20-alpine AS build-front

ARG VERSION
ARG ENV_PROFILE
ENV CI=true
ENV ENV_PROFILE=$ENV_PROFILE
ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN echo ${ENV_PROFILE}

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
FROM azul/zulu-openjdk-alpine:17-jre

ARG VERSION
ENV VERSION=$VERSION

ARG ENV_PROFILE
ENV ENV_PROFILE=$ENV_PROFILE

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

# Default profile is for local. Can be overriden at start : docker run -e "SPRING_PROFILES_ACTIVE=prod"
ENV SPRING_PROFILES_ACTIVE=$ENV_PROFILE

RUN echo ${ENV_PROFILE}

USER root
RUN chown monitorfish /home/monitorfish/import-meta-env
RUN chmod +x /home/monitorfish/import-meta-env

RUN chown monitorfish /home/monitorfish/env.sh
RUN chmod +x /home/monitorfish/env.sh
RUN chown monitorfish public/index.html
RUN chmod +rwx public/index.html

USER monitorfish

ENTRYPOINT ["/home/monitorfish/env.sh"]

CMD exec java -Dhttp.proxyHost=${MONITORFISH_HTTP_PROXY_HOST} -Dhttp.proxyPort=${MONITORFISH_HTTP_PROXY_PORT} \
              -Dhttps.proxyHost=${MONITORFISH_HTTP_PROXY_HOST} -Dhttps.proxyPort=${MONITORFISH_HTTP_PROXY_PORT} \
              -Dhttp.nonProxyHosts=${MONITORFISH_HTTP_NON_PROXY_HOSTS} -Dhttps.nonProxyHosts=${MONITORFISH_HTTP_NON_PROXY_HOSTS} \
              -Dspring.config.additional-location="/home/monitorfish/configurations/" \
              -jar "monitorfish-${VERSION}.jar"
