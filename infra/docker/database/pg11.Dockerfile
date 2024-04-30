ARG PG_MAJOR
ARG TIMESCALEDB_VERSION
ARG POSTGIS_VERSION

FROM timescale/timescaledb:${TIMESCALEDB_VERSION}-pg${PG_MAJOR}
ARG POSTGIS_VERSION

RUN set -ex \
    && apk add --no-cache --virtual .fetch-deps \
        ca-certificates \
        openssl \
        tar \
    \
    && wget -O postgis.tar.gz "https://github.com/postgis/postgis/archive/$POSTGIS_VERSION.tar.gz" \
    && mkdir -p /usr/src/postgis \
    && tar \
        --extract \
        --file postgis.tar.gz \
        --directory /usr/src/postgis \
        --strip-components 1 \
    && rm postgis.tar.gz \
    \
    && apk add --no-cache --virtual .build-deps \
        autoconf \
        automake \
        file \
        json-c-dev \
        libtool \
        libxml2-dev \
        make \
        perl \
        clang-dev \
        g++ \
        gcc \
        gdal-dev \
        geos-dev \
        llvm-dev \
        proj-dev \
        protobuf-c-dev \
    && cd /usr/src/postgis \
    && ./autogen.sh \
# configure options taken from:
# https://anonscm.debian.org/cgit/pkg-grass/postgis.git/tree/debian/rules?h=jessie
    && ./configure \
#       --with-gui \
    && make -j$(nproc) \
    && make install \
# add .postgis-rundeps
    && apk add --no-cache --virtual .postgis-rundeps \
        json-c \
        geos \
        gdal \
        proj \
        libstdc++ \
        protobuf-c \
# clean
    && cd / \
    && rm -rf /usr/src/postgis \
    && apk del .fetch-deps .build-deps
