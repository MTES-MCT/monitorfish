#!/bin/sh
set -e

curl -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces -H  "accept: text/html" -H  "content-type: application/json" \
-d "{ \"workspace\": {\"name\": \"monitorfish\"}}"

curl -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "dataStore": {
    "name": "monitorfish_postgis",
    "connectionParameters": {
      "entry": [
        {"@key":"host","$":"db"},
        {"@key":"port","$":"5432"},
        {"@key":"database","$":"monitorfishdb"},
        {"@key":"schema","$":"public"},
        {"@key":"user","$":"postgres"},
        {"@key":"passwd","$":"postgres"},
        {"@key":"dbtype","$":"postgis"}
      ]
    }
  }
}
EOF

curl -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "eez_areas",
    "nativeName": "eez_areas",
    "title": "EEZ",
    "nativeCRS": "EPSG:32631",
    "srs": "EPSG:3857",
    "enabled": true,
  }
}
EOF

curl -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "fao_areas",
    "nativeName": "fao_areas",
    "title": "FAO",
    "nativeCRS": "EPSG:32631",
    "srs": "EPSG:3857",
    "enabled": true,
  }
}
EOF
