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

PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/1241_eaux_occidentales_australes_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/1241_eaux_occidentales_septentrionales.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/1241_eaux_union_dans_oi_et_atl_ouest_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/1241_mer_baltique.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/1241_mer_du_nord.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/1241_mer_mediterranee.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/1241_mer_noire.sql

PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/cormoran_areas.sql

PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/fao_CCAMLR_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/fao_ICCAT_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/fao_IOTC_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/fao_NEAFC_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/fao_SIOFA_areas.sql

PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/rectangles_stat_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/situation_atlantique_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/situation_med_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/situation_memn_areas.sql
PGCLIENTENCODING=LATIN1 psql -h 0.0.0.0 -d monitorfishdb -U postgres -f sig/layersdata/situation_outre_mer_areas.sql
