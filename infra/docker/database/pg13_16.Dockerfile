ARG PG_MAJOR
ARG TIMESCALEDB_VERSION
ARG POSTGIS_VERSION

FROM postgres:"$PG_MAJOR"-bookworm
ARG PG_MAJOR
ARG TIMESCALEDB_VERSION
ARG POSTGIS_VERSION

RUN \
    apt-get update && \
    apt-get install -y \
        wget \
        lsb-release && \
    rm -rf /var/lib/apt/lists/*

# Install TimescaleDB extension
RUN echo "deb https://packagecloud.io/timescale/timescaledb/debian/ $(lsb_release -c -s) main"
RUN echo "deb https://packagecloud.io/timescale/timescaledb/debian/ $(lsb_release -c -s) main" > /etc/apt/sources.list.d/timescaledb.list
RUN wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | apt-key add -

RUN \
    TIMESCALEDB_MAJOR=$(echo "$TIMESCALEDB_VERSION" | cut -c1) && \
    apt-get update && \
    apt-get install -y \
        timescaledb-"$TIMESCALEDB_MAJOR"-postgresql-"$PG_MAJOR"="$TIMESCALEDB_VERSION"* \
        timescaledb-"$TIMESCALEDB_MAJOR"-loader-postgresql-"$PG_MAJOR"="$TIMESCALEDB_VERSION"* && \
    rm -rf /var/lib/apt/lists/*

RUN for file in $(find /usr/share/postgresql -name 'postgresql.conf.sample'); do \
        # We want timescaledb to be loaded in this image by every created cluster
        sed -r -i "s/[#]*\s*(shared_preload_libraries)\s*=\s*'(.*)'/\1 = 'timescaledb,\2'/;s/,'/'/" "$file" \
        # We need to listen on all interfaces, otherwise PostgreSQL is not accessible
        && echo "listen_addresses = '*'" >> "$file"; \
    done

# Install PostGIS extension
RUN \
    POSTGIS_MAJOR=$(echo "$POSTGIS_VERSION" | cut -c1) && \
    apt update && \
    apt install -y --no-install-recommends \
        postgresql-"$PG_MAJOR"-postgis-"$POSTGIS_MAJOR"="$POSTGIS_VERSION"* \
        postgresql-"$PG_MAJOR"-postgis-"$POSTGIS_MAJOR"-scripts  && \
    rm -rf /var/lib/apt/lists/*