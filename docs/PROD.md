# Production

## Setup and maintenance

### Layers management

In production, layers tables are under the schema `prod`.

To upload layers to Geoserver:
1. Execute `sh infra/local/postgis_insert_layers.sh`
2. Modify the schema from public to prod:
```shell
psql -U adl
ALTER TABLE "3_miles_areas" SET SCHEMA prod;
ALTER TABLE "6_miles_areas" SET SCHEMA prod;
ALTER TABLE "12_miles_areas" SET SCHEMA prod;
ALTER TABLE "100_miles_areas" SET SCHEMA prod;
ALTER TABLE "eez_areas" SET SCHEMA prod;
ALTER TABLE "fao_areas" SET SCHEMA prod;
ALTER TABLE "coast_lines" SET SCHEMA prod;
```
2. Insert the layers to Geoserver : `sh infra/init/geoserver_init_layers.sh`