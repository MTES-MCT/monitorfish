#!/bin/sh
set -e

PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_fao_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_eez_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_3_miles_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_6_miles_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_12_miles_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_100_miles_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_coast_lines.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_regulatory_areas.sql
