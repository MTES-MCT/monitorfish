## GIS Layer

Shapefile links:
- FAO: http://www.fao.org/geonetwork/srv/en/main.home?uuid=ac02a460-da52-11dc-9d70-0017f293bd28
- EEZ: https://www.marineregions.org/downloads.php#eez

### Download and add the FAO layer to PsotGIS
1. Download the shapefile
2. `ogr2ogr --config PG_USE_COPY YES --config SHAPE_RESTORE_SHX YES -f PGDump SQL_FILENAME.sql FAO_AREAS.shp -lco SRID=4326 -nlt PROMOTE_TO_MULTI`
3. The INSERT part is extracted and copied to the resource folder: `cp /tmp/abc.sql backend/src/main/resources/db/layers/Insert_FAO_Areas.sql`

Then, add the layers to the database:
1. FAO layer
```
PGCLIENTENCODING=UTF-8 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f backend/src/main/resources/db/layersdata/Insert_fao_areas.sql
```

2. EEZ layer
```
PGCLIENTENCODING=UTF-8 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f backend/src/main/resources/db/layersdata/Insert_eez_areas.sql
```

### Add a new layer
1. Download the shapefile
2. `ogr2ogr --config PG_USE_COPY YES --config SHAPE_RESTORE_SHX YES -f PGDump SQL_FILENAME.sql FAO_AREAS.shp -lco SRID=4326 -nlt PROMOTE_TO_MULTI`
3. Copy the layer to `sig/layersdata`
4. Rename the layer name to `<layerName>_areas.sql`
5. Rename the table (within the layer file) to be `<layerName>_areas`
6. Add the HTTP POST line to insert the layer to Geoserver : See the file `infra/init/geoserver_init_layers.sh`
