ARG PG_MAJOR
ARG TIMESCALEDB_VERSION
ARG POSTGIS_VERSION

FROM timescale/timescaledb:${TIMESCALEDB_VERSION}-pg${PG_MAJOR}
ARG POSTGIS_VERSION

RUN set -ex && \
    apk add --no-cache --virtual .build-deps \
        gdal-dev \
        protobuf-c-dev \
        proj-dev \
        geos-dev \
        libxml2-dev \
        perl \
        llvm \
        clang \
        clang-dev \
        build-base && \
    cd /tmp && \
    wget https://download.osgeo.org/postgis/source/postgis-$POSTGIS_VERSION.tar.gz -O - | tar -xz && \
    cd postgis-$POSTGIS_VERSION && \
    ./configure && \
    make -s && \
    make -s install && \
    apk add --no-cache --virtual .postgis-rundeps \
        json-c \
        geos \
        gdal \
        proj \
        protobuf-c \
        libstdc++  && \
    cd / && \
    rm -rf /tmp/postgis-$POSTGIS_VERSION && \
    apk del .build-deps;
