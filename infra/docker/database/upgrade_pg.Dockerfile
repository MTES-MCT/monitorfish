ARG FROM_PG_MAJOR
ARG TO_PG_MAJOR
ARG TIMESCALEDB_VERSION
ARG POSTGIS_VERSION

FROM tianon/postgres-upgrade:${FROM_PG_MAJOR}-to-${TO_PG_MAJOR}
ARG FROM_PG_MAJOR
ARG TO_PG_MAJOR
ARG TIMESCALEDB_VERSION
ARG POSTGIS_VERSION

RUN apt-get update
RUN apt-get install -y wget
RUN echo "deb https://packagecloud.io/timescale/timescaledb/debian/ stretch main" > /etc/apt/sources.list.d/timescaledb.list
RUN wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | apt-key add -
RUN apt-get update

RUN \
    TIMESCALEDB_MAJOR=$(echo $TIMESCALEDB_VERSION | cut -c1) && \
    apt-get install -y timescaledb-$TIMESCALEDB_MAJOR-postgresql-$FROM_PG_MAJOR=$TIMESCALEDB_VERSION* && \
    apt-get install -y timescaledb-$TIMESCALEDB_MAJOR-postgresql-$TO_PG_MAJOR=$TIMESCALEDB_VERSION*

RUN apt update
RUN \
    POSTGIS_MAJOR=$(echo $POSTGIS_VERSION | cut -c1) && \
    apt install postgresql-$FROM_PG_MAJOR-postgis-$POSTGIS_MAJOR && \
    apt install postgresql-$TO_PG_MAJOR-postgis-$POSTGIS_MAJOR