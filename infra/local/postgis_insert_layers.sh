#!/bin/sh
set -e

PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.1__Create_fao_areas_table.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.2__Create_eez_areas_table.sql

PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_fao_areas.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_eez_areas.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_3_miles_areas.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_6_miles_areas.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_12_miles_areas.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_100_miles_areas.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_coast_lines.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_regulatory_areas.sql
