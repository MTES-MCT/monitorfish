#!/bin/sh
set -eu

DB_HOST="${DB_HOST:-db}"
DB_NAME="${DB_NAME:-monitorfishdb}"
DB_SCHEMA="${DB_SCHEMA:-public}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
GEOSERVER_PORT="${GEOSERVER_PORT:-8081}"

curl -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces -H  "accept: text/html" -H  "content-type: application/json" \
-d "{ \"workspace\": {\"name\": \"monitorfish\"}}"

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "dataStore": {
    "name": "monitorfish_postgis",
    "connectionParameters": {
      "entry": [
        {"@key":"host","$":"$DB_HOST"},
        {"@key":"port","$":"5432"},
        {"@key":"database","$":"$DB_NAME"},
        {"@key":"schema","$":"$DB_SCHEMA"},
        {"@key":"user","$":"$DB_USER"},
        {"@key":"passwd","$":"$DB_PASSWORD"},
        {"@key":"dbtype","$":"postgis"}
      ]
    }
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "eez_areas",
    "nativeName": "eez_areas",
    "title": "EEZ",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "fao_areas",
    "nativeName": "fao_areas",
    "title": "FAO",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "3_miles_areas",
    "nativeName": "3_miles_areas",
    "title": "3 Miles",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "6_miles_areas",
    "nativeName": "6_miles_areas",
    "title": "6 Miles",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "12_miles_areas",
    "nativeName": "12_miles_areas",
    "title": "12 Miles",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "regulations",
    "nativeName": "regulations_view",
    "title": "Regulatory Areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "regulations_write",
    "nativeName": "regulations",
    "title": "Regulatory Areas for write operation",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "1241_eaux_occidentales_australes_areas",
    "nativeName": "1241_eaux_occidentales_australes_areas",
    "title": "1241 eaux occidentales australes areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "1241_eaux_occidentales_septentrionales_areas",
    "nativeName": "1241_eaux_occidentales_septentrionales_areas",
    "title": "1241 eaux occidentales septentrionales areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "1241_eaux_union_dans_oi_et_atl_ouest_areas",
    "nativeName": "1241_eaux_union_dans_oi_et_atl_ouest_areas",
    "title": "1241 eaux union dans oi et atl ouest areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "1241_mer_baltique_areas",
    "nativeName": "1241_mer_baltique_areas",
    "title": "1241 mer baltique",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "1241_mer_du_nord_areas",
    "nativeName": "1241_mer_du_nord_areas",
    "title": "1241 mer du nord",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "1241_mer_mediterranee_areas",
    "nativeName": "1241_mer_mediterranee_areas",
    "title": "1241 mer mediterranee",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "1241_mer_noire_areas",
    "nativeName": "1241_mer_noire_areas",
    "title": "1241 mer noire areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "1241_mer_celtique_areas",
    "nativeName": "1241_mer_celtique_areas",
    "title": "1241 mer celtique areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "cormoran_areas",
    "nativeName": "cormoran_areas",
    "title": "cormoran areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "fao_ccamlr_areas",
    "nativeName": "fao_ccamlr_areas",
    "title": "fao CCAMLR areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "fao_iccat_areas",
    "nativeName": "fao_iccat_areas",
    "title": "fao ICCAT areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "fao_iotc_areas",
    "nativeName": "fao_iotc_areas",
    "title": "fao IOTC areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "fao_siofa_areas",
    "nativeName": "fao_siofa_areas",
    "title": "fao SIOFA areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "rectangles_stat_areas",
    "nativeName": "rectangles_stat_areas",
    "title": "rectangles stat areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "situs_areas",
    "nativeName": "situs_areas",
    "title": "situation VMS",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "brexit_areas",
    "nativeName": "brexit_areas",
    "title": "Brexit",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "aem_areas",
    "nativeName": "aem_areas",
    "title": "AEM areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "cgpm_areas",
    "nativeName": "cgpm_areas",
    "title": "cgpm_areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "neafc_regulatory_area",
    "nativeName": "neafc_regulatory_area",
    "title": "neafc_regulatory_area",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "effort_zones_areas",
    "nativeName": "effort_zones_areas",
    "title": "effort_zones_areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "navigation_category_two_areas",
    "nativeName": "navigation_category_two_areas",
    "title": "navigation_category_two_areas",
    "nativeCRS": "EPSG:3857",
    "srs": "EPSG:3857",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "navigation_category_three_areas",
    "nativeName": "navigation_category_three_areas",
    "title": "navigation_category_three_areas",
    "nativeCRS": "EPSG:3857",
    "srs": "EPSG:3857",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "navigation_category_four_areas",
    "nativeName": "navigation_category_four_areas",
    "title": "navigation_category_four_areas",
    "nativeCRS": "EPSG:3857",
    "srs": "EPSG:3857",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "navigation_category_five_areas",
    "nativeName": "navigation_category_five_areas",
    "title": "navigation_category_five_areas",
    "nativeCRS": "EPSG:3857",
    "srs": "EPSG:3857",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "nafo_regulatory_area",
    "nativeName": "nafo_regulatory_area",
    "title": "nafo_regulatory_area",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "cgpm_statistical_rectangles_areas",
    "nativeName": "cgpm_statistical_rectangles_areas",
    "title": "cgpm_statistical_rectangles_areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "transversal_sea_limit_areas",
    "nativeName": "transversal_sea_limit_areas",
    "title": "transversal_sea_limit_areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:$GEOSERVER_PORT/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "saltwater_limit_areas",
    "nativeName": "saltwater_limit_areas",
    "title": "saltwater_limit_areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF
