psql -U $POSTGRES_USER -d $POSTGRES_DB -c "CREATE EXTENSION IF NOT EXISTS postgis";
psql -U $POSTGRES_USER -d $POSTGRES_DB -c "ALTER EXTENSION postgis UPDATE";
psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT postgis_extensions_upgrade()";