#!/bin/sh
set -eu

curl -u admin:geoserver -X POST http://0.0.0.0:8001/geoserver/rest/workspaces -H  "accept: text/html" -H  "content-type: application/json" -d "{ \"workspace\": {\"name\": \"monitorfish\"}}"

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
    "name": "regulatory_areas",
    "nativeName": "reglementation_peche_view",
    "title": "Regulatory Areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF
