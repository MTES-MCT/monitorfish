FROM timescale/timescaledb:2.3.1-pg11

ENV POSTGIS_VERSION 3.3.6

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
    wget --max-redirect=0 https://download.osgeo.org/postgis/source/postgis-$POSTGIS_VERSION.tar.gz -O - | tar -xz && \
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
