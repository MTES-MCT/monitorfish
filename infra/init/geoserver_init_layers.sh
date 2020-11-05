#!/bin/sh
set -eu

curl -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces -H  "accept: text/html" -H  "content-type: application/json" \
-d "{ \"workspace\": {\"name\": \"monitorfish\"}}"

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "eez_areas",
    "nativeName": "eez_areas",
    "title": "EEZ",
    "nativeCRS": "EPSG:32631",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "fao_areas",
    "nativeName": "fao_areas",
    "title": "FAO",
    "nativeCRS": "EPSG:32631",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "100_miles_areas",
    "nativeName": "100_miles_areas",
    "title": "100 Miles",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "coast_lines",
    "nativeName": "coast_lines",
    "title": "Coast lines",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF

curl -v -u admin:geoserver -X POST http://localhost:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
{
  "featureType": {
    "name": "regulatory_areas",
    "nativeName": "all_decisions",
    "title": "Regulatory Areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true,
  }
}
EOF
