#!/usr/bin/env bash

# Enable pg_stat_statements
# https://www.postgresql.org/docs/current/pgstatstatements.html#PGSTATSTATEMENTS-CONFIG-PARAMS
echo "shared_preload_libraries = 'pg_stat_statements,timescaledb'" >> $PGDATA/postgresql.conf
echo "pg_stat_statements.max = 10000" >> $PGDATA/postgresql.conf
echo "pg_stat_statements.track = 'all'" >> $PGDATA/postgresql.conf
# Log CRUD queries
# https://www.postgresql.org/docs/current/runtime-config-logging.html#GUC-LOG-STATEMENT
echo "log_statement = 'mod'" >> $PGDATA/postgresql.conf
# Log slow queries
# https://www.postgresql.org/docs/current/runtime-config-logging.html#GUC-LOG-MIN-DURATION-STATEMENT
echo "log_min_duration_statement = 1000" >> $PGDATA/postgresql.conf
