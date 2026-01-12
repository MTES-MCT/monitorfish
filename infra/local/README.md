# Local server @CROSS

## Init the server

### 0. Install missing tools

1. `sudo apt  install docker-compose`
2. Add to `~/.bashrc`:
```bash
alias unset_proxy='unset HTTPS_PROXY; unset HTTP_PROXY; unset https_proxy; unset http_proxy;'
alias set_proxy='export http_proxy=http://100.78.40.201:8080; export https_proxy=http://100.78.40.201:8080 export HTTP_PROXY=http://100.78.40.201:8080 export HTTPS_PROXY=http://100.78.40.201:8080'
```

### 1. Manage Postgres connexion entries

1. Edit `/etc/postgresql/14/main/pg_hba.conf` to add the IP range. See `infra/local/pg_hba.conf` of this repo.
2. Then execute `SELECT pg_reload_conf();` within `psql` to update entries.

Test the connexion to the database : `psql -d cnsp -U postgres` and enter the password.

### 2. Run Geoserver

> The TLS termination will be done on the Apache server.  
> See `cat /etc/hosts` for the public server URL (exposed by Apache).

Run:
1. `set_proxy`
2. `git clone https://github.com/MTES-MCT/monitorfish.git`
3. `cd monitorfish/infra/local`
4. `docker-compose up -d`
5. Add to the machine web server (HTTP):
`sudo vi /etc/apache2/sites-available/Vhost`:
```
ProxyPass /geoserver http://localhost:8081/geoserver
ProxyPassReverse /geoserver http://localhost:8081/geoserver
<Proxy http://localhost:8081/geoserver>
Require all granted
Header set Access-Control-Allow-Origin: *
AuthType None
</Proxy>
```
6. Add to the machine web server (HTTPs): `sudo vi /etc/apache2/sites-available/Vhost-ssl`:
```
ProxyPass /geoserver http://localhost:8081/geoserver
ProxyPassReverse /geoserver http://localhost:8081/geoserver
<Proxy http://localhost:8081/geoserver>
Require all granted
Header set Access-Control-Allow-Origin: *
AuthType None
</Proxy>
```

#### Errors

> #### Iptables
> If there is an error while running docker : "iptables: No chain/target/match by that name."  
> -> The iptables config is missing, run:  
> `sudo systemctl restart docker`
>
> #### Database connexion from Geoserver
> It should be an iptables issues (wget of the host should works inside the geoserver containers), try:
> ```
> sudo iptables -P INPUT ACCEPT
> sudo iptables -P FORWARD ACCEPT
> sudo iptables -P OUTPUT ACCEPT
> ```
>
> #### Docker connectivity
> If there is an error while fetching le geoserver image: `Get "https://registry-1.docker.io/v2/": context deadline exceeded`
>
> Run:
> 1. `sudo mkdir -p /etc/systemd/system/docker.service.d`
> 2. `sudo vi /etc/systemd/system/docker.service.d/http-proxy.conf`
> 3. Add:
> ```
> [Service]
> Environment="HTTP_PROXY=http://proxy:port"
> Environment="HTTPS_PROXY=http://proxy:port"
> ```
> 4. Then:
> ```
> sudo systemctl daemon-reload
> sudo systemctl restart docker
> ```

### 3. Configure Geoserver

1. Create the datastore
```
curl -u admin:geoserver -X POST http://0.0.0.0:8081/geoserver/rest/workspaces -H  "accept: text/html" -H  "content-type: application/json" \
-d "{ \"workspace\": {\"name\": \"monitorfish\"}}"
```
2. Configure the datastore
```
DB_HOST=X.X.X.X \
DB_NAME=cnsp \
DB_SCHEMA=public \
DB_USER=postgres \
DB_PASSWORD=TO_MODIFY \
curl -v -u admin:geoserver -X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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
```
4. Create the regulations layers
```
curl -v -u admin:geoserver -X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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

curl -v -u admin:geoserver -X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes -H  "accept: text/html" -H  "content-type: application/json" -d @- << EOF
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
```

### 3. Tests

1. Test the connexion to the database : `psql -d cnsp -U postgres` and enter the password.

-----

## Tools

#### Export a dump

1. Export the database
```
pg_dump \
  --host localhost \
  --port 5432 \
  --username adl \
  --no-owner \
  --no-acl \
  --format plain \
  --verbose \
  --file "cnsp_backup.sql" \
  cnsp
```
2. Fetch it with `scp`
```
scp root@<IP>:/<FOLDER> .
```
3. Restore
```
PGCLIENTENCODING=UTF-8 psql \
  --host localhost \
  --port 5432 \
  --username postgres \
  --dbname cnsp \
  --file cnsp_backup.sql
```

#### Export regulatory zones from PostGIS

1. From the local VM, run :
```
psql -d cnsp --host <IP> --port 5432 --username "adl" -c "copy(SELECT id, law_type,
                                                           facade, topic, zone, region, date_fermeture,
                                                           date_ouverture, fishing_period, periodes, engins, engins_interdits,
                                                           mesures_techniques, especes, species, quantites, taille,
                                                           especes_interdites, autre_reglementation_especes,
                                                           documents_obligatoires, autre_reglementation,
                                                           regulatory_references, geometry_simplified, row_hash FROM prod.reglementation_peche) to stdout" > dump.tsv
```
2. Copy to local folder : `scp -r root@<IP>:/tmp/dump.tsv .`
3. Add to the beginning of the file :
```
COPY public.reglementation_peche (id, law_type,
                                  facade, topic, zone, region, date_fermeture,
                                  date_ouverture, fishing_period, periodes, engins, engins_interdits,
                                  mesures_techniques, especes, species, quantites, taille,
                                  especes_interdites, autre_reglementation_especes,
                                  documents_obligatoires, autre_reglementation,
                                  regulatory_references, geometry_simplified, row_hash) FROM stdin WITH ENCODING 'UTF8';
```
4. Copy to `/layersdata` folder of the repo

## Reset a regulation from the local PostGIS regulation referential

```
insert into prod.regulations (id, topic, zone, region, law_type) VALUES (11053, 'Un topic de test', 'Zone de test', 'Bretagne', 'Reg. NAMO');
```

## Create a test regulatory entry

```
insert into prod.regulations (geometry) select geometry from prod.regulations where id = 654;
```
