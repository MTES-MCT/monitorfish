echo "############################################################################################################################"
echo "PostGIS and related extensions versions:"
echo ""
psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT postgis_full_version()";

echo "############################################################################################################################"
echo "PostGIS and TimescaleDB installed versions:"
echo ""
psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT name, default_version, installed_version FROM pg_available_extensions";