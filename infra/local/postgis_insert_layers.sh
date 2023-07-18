#!/bin/sh
set -e

PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.1__Create_fao_areas_table.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.2__Create_eez_areas_table.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.3__Create_3_miles_areas_table.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.4__Create_6_miles_areas_table.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.5__Create_12_miles_areas_table.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.6__Create_100_miles_areas_table.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.7__Create_coast_lines_table.sql

PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/Insert_fao_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/Insert_eez_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/Insert_3_miles_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/Insert_6_miles_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/Insert_12_miles_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/Insert_100_miles_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/Insert_coast_lines.sql

PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/1241_eaux_occidentales_australes_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/1241_eaux_occidentales_septentrionales.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/1241_eaux_union_dans_oi_et_atl_ouest_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/1241_mer_baltique.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/1241_mer_du_nord.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/1241_mer_mediterranee.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/1241_mer_noire.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/1241_mer_celtique_areas.sql

PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/cormoran_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/aem_areas.sql

PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/fao_CCAMLR_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/fao_ICCAT_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/fao_IOTC_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/fao_SIOFA_areas.sql

PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/rectangles_stat_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/situs_areas.sql
PGCLIENTENCODING=UTF-8 psql -d cnsp -U adl -f sig/layersdata/brexit_areas.sql
