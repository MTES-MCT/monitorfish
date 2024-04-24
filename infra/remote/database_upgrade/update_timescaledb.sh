for dbName in $POSTGRES_DB postgres template1; do
    echo "#########################################################################";
    echo Updating postgis in database $dbName;
    psql -U $POSTGRES_USER -d $dbName -c "CREATE EXTENSION IF NOT EXISTS timescaledb";
    psql -U $POSTGRES_USER -d $dbName -c "ALTER EXTENSION timescaledb UPDATE";
done
