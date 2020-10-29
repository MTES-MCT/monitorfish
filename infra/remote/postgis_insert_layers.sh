#!/bin/sh
set -e

PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_fao_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/Insert_eez_areas.sql
