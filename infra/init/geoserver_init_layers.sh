#!/bin/sh
set -eu

curl -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces -H  "accept: text/html" -H  "content-type: application/json" \
-d "{ \"workspace\": {\"name\": \"monitorfish\"}}"

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "regulatory_areas",
    "nativeName": "reglementation_peche_view",
    "title": "Regulatory Areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "regulatory_areas_write",
    "nativeName": "reglementation_peche",
    "title": "Regulatory Areas for write operation",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "fao_neafc_areas",
    "nativeName": "fao_neafc_areas",
    "title": "fao NEAFC areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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
