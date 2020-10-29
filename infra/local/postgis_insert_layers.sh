#!/bin/sh
set -e

PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.1__Create_fao_areas_table.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f backend/src/main/resources/db/migration/layers/V0.2__Create_eez_areas_table.sql

PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_fao_areas.sql
PGCLIENTENCODING=LATIN1 psql -d cnsp -U adl -f sig/layersdata/Insert_eez_areas.sql
