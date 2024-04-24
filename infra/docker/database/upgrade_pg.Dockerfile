ARG FROM_PG_MAJOR
ARG TO_PG_MAJOR
ARG TIMESCALEDB_VERSION
ARG POSTGIS_VERSION
ARG DISTRIBUTION

FROM postgres:$TO_PG_MAJOR-$DISTRIBUTION
ARG FROM_PG_MAJOR
ARG TO_PG_MAJOR
ARG TIMESCALEDB_VERSION
ARG POSTGIS_VERSION

RUN sed -i 's/$/ $FROM_PG_MAJOR/' /etc/apt/sources.list.d/pgdg.list

RUN set -eux; \
	apt-get update; \
	apt-get install -y --no-install-recommends \
		postgresql-$FROM_PG_MAJOR \
	; \
	rm -rf /var/lib/apt/lists/*

ENV PGBINOLD /usr/lib/postgresql/$FROM_PG_MAJOR/bin
ENV PGBINNEW /usr/lib/postgresql/$TO_PG_MAJOR/bin

ENV PGDATAOLD /var/lib/postgresql/$FROM_PG_MAJOR/data
ENV PGDATANEW /var/lib/postgresql/$TO_PG_MAJOR/data

RUN set -eux; \
	mkdir -p "$PGDATAOLD" "$PGDATANEW"; \
	chown -R postgres:postgres /var/lib/postgresql

WORKDIR /var/lib/postgresql

COPY infra/docker/database/docker-upgrade /usr/local/bin/

ENTRYPOINT ["docker-upgrade"]

# recommended: --link
CMD ["pg_upgrade"]


# Install TimescaleDB extension in both versions of Postgres
RUN apt-get update
RUN apt-get install -y wget lsb-release
RUN echo "deb https://packagecloud.io/timescale/timescaledb/debian/ $(lsb_release -c -s) main"
RUN echo "deb https://packagecloud.io/timescale/timescaledb/debian/ $(lsb_release -c -s) main" > /etc/apt/sources.list.d/timescaledb.list
RUN wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | apt-key add -
RUN apt-get update

RUN \
    TIMESCALEDB_MAJOR=$(echo $TIMESCALEDB_VERSION | cut -c1) && \
    apt-get install -y timescaledb-$TIMESCALEDB_MAJOR-postgresql-$FROM_PG_MAJOR=$TIMESCALEDB_VERSION* timescaledb-$TIMESCALEDB_MAJOR-loader-postgresql-$FROM_PG_MAJOR=$TIMESCALEDB_VERSION* && \
    apt-get install -y timescaledb-$TIMESCALEDB_MAJOR-postgresql-$TO_PG_MAJOR=$TIMESCALEDB_VERSION* timescaledb-$TIMESCALEDB_MAJOR-loader-postgresql-$TO_PG_MAJOR=$TIMESCALEDB_VERSION*

# Install PostGIS extension in both versions of Postgres
RUN apt update
RUN \
    POSTGIS_MAJOR=$(echo $POSTGIS_VERSION | cut -c1) && \
    apt install -y --no-install-recommends \
        postgresql-$FROM_PG_MAJOR-postgis-$POSTGIS_MAJOR=$POSTGIS_VERSION* \
        postgresql-$FROM_PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
        postgresql-$TO_PG_MAJOR-postgis-$POSTGIS_MAJOR=$POSTGIS_VERSION* \
        postgresql-$TO_PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
    && rm -rf /var/lib/apt/lists/*