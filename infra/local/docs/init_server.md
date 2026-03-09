# Server Initialization Guide

This guide covers setting up the local server at CROSS, including Geoserver deployment and configuration.

## Users

- The `eig56` user must be used to manage the server
- The `adl` user must be used to manage the Postgres database

## Prerequisites

### Install Required Tools

1. Install docker, follow https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository

Add user to the docker group :
```bash
sudo usermod -aG docker $USER
newgrp docker
```

2. Add proxy aliases to `~/.bashrc`:
```bash
alias unset_proxy='unset HTTPS_PROXY; unset HTTP_PROXY; unset https_proxy; unset http_proxy;'
alias set_proxy='export http_proxy=http://100.78.40.201:8080; export https_proxy=http://100.78.40.201:8080; export HTTP_PROXY=http://100.78.40.201:8080; export HTTPS_PROXY=http://100.78.40.201:8080;'
```

3. Add APT proxy:
```bash
$> cat /etc/apt/apt.conf.d/95proxies
Acquire::http::Proxy "http://100.78.40.201:8080";
Acquire::https::Proxy "http://100.78.40.201:8080";
```

4. Add docker proxy:
Create the systemd configuration directory:
```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
```

Create the proxy config file:
```bash
sudo vi /etc/systemd/system/docker.service.d/http-proxy.conf
```
Add:
```bash
[Service]
Environment="HTTP_PROXY=http://100.78.40.201:8080"
Environment="HTTPS_PROXY=http://100.78.40.201:8080"
```

Restart docker: 
```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## Manage PostgreSQL Connection Entries

1. Edit `/etc/postgresql/14/main/pg_hba.conf` to add the IP range. See `infra/local/pg_hba.conf` of this repo.
2. Execute the following in `psql` to reload the configuration:
```sql
SELECT pg_reload_conf();
```
3. Test the connection to the database:
```bash
psql -d cnsp -U adl
```

# Setup backup

- Create `pg_backup.config` file in `/monitorfish/local/backup` folder of the repo from the template [pg_backup.config.template](../backup/pg_backup.config.template)
- Add the USERNAME and PGPASSWORD in file

Add this cron job with `crontab -e` :
```bash
13 21 * * * bash -l -c '/home/eig56/monitorfish/infra/remote/backup/pg_backup_rotated.sh > /home/eig56/backups/cron.log 2>&1'
```

## Run Geoserver

> The TLS termination will be done on the Apache server.
> See `cat /etc/hosts` for the public server URL (exposed by Apache).

### Clone and Start

1. Set the proxy:
```bash
source ~/.bashrc
set_proxy
```
2. Clone the repository:
```bash
git clone https://github.com/MTES-MCT/monitorfish.git
```
3. Navigate to the local infra directory:
```bash
cd monitorfish/infra/local
```
4. Start Geoserver:
```bash
docker compose up -d
```

### Configure Apache (HTTP)

Add the following to `/etc/apache2/sites-available/Vhost`:

```apache
ProxyPass /geoserver http://localhost:8081/geoserver
ProxyPassReverse /geoserver http://localhost:8081/geoserver
<Proxy http://localhost:8081/geoserver>
    Require all granted
    Header set Access-Control-Allow-Origin: *
    AuthType None
</Proxy>
```

### Configure Apache (HTTPS)

Add the following to `/etc/apache2/sites-available/Vhost-ssl`:

```apache
ProxyPass /geoserver http://localhost:8081/geoserver
ProxyPassReverse /geoserver http://localhost:8081/geoserver
<Proxy http://localhost:8081/geoserver>
    Require all granted
    Header set Access-Control-Allow-Origin: *
    AuthType None
</Proxy>
```

Then restart Apache : `sudo apachectl restart`

### Configure iptables


Create the file `/usr/share/eole/bastion/data/01-ports-rules` to only allow ports 80, 443, and 5432:
```bash
# !/bin/bash

/sbin/iptables -I DOCKER-USER -i ens160 -j DROP
/sbin/iptables -I DOCKER-USER -i ens160 -p tcp --dport 443 -j ACCEPT
/sbin/iptables -I DOCKER-USER -i ens160 -p tcp --dport 80 -j ACCEPT
/sbin/iptables -I DOCKER-USER 1 -p tcp --dport 5432 -j ACCEPT
```

Save the iptables rules:
(?)
```bash
sudo apt install iptables-persistent
netfilter-persistent save
```

## Docker Compose Configuration

The `docker-compose.yml` deploys Geoserver with the following configuration:

### Image
- **Image**: `kartoza/geoserver:2.26.0`

### Ports
| Host Port | Container Port | Protocol |
|-----------|----------------|----------|
| 8081      | 8080           | HTTP     |

### Volumes
- `geoserver-data:/opt/geoserver/data_dir` - Persists Geoserver configuration and data across container restarts

### Health Check
The container is monitored with a health check:
- **Test**: `curl --fail -s http://localhost:8080/geoserver/index.html || exit 1`
- **Interval**: 1m30s
- **Timeout**: 10s
- **Retries**: 3

### Useful Commands

View container logs:
```bash
docker-compose logs -f geoserver
```

Restart Geoserver:
```bash
docker-compose restart geoserver
```

Stop and remove containers:
```bash
docker-compose down
```

Stop and remove containers AND volumes (data loss):
```bash
docker-compose down -v
```

## Geoserver Credentials

Default admin credentials:
- **Username**: `admin`
- **Password**: `geoserver`

> **Security Note**: Change the default password after initial setup via the Geoserver web UI at `http://localhost:8081/geoserver`.

## Troubleshooting

### iptables Error

If you see an error while running docker: `iptables: No chain/target/match by that name.`

The iptables config is missing. Run:

```bash
sudo systemctl restart docker
```

### Database Connection from Geoserver

If Geoserver cannot connect to the database (wget of the host should work inside the geoserver container), this is likely an iptables issue. Try:

```bash
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
```

## Configure Geoserver

### Create the Workspace

First execute `unset_proxy`.

```bash
curl -u admin:PASSWORD_TO_MODIFY -X POST http://0.0.0.0:8081/geoserver/rest/workspaces \
  -H "accept: text/html" \
  -H "content-type: application/json" \
  -d '{ "workspace": {"name": "monitorfish"}}'
```

### Configure the Datastore

```bash
curl -v -u admin:Ajar3-Subtext5-Unvented5-Yard6-Disposal1 -X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores \
  -H "accept: text/html" \
  -H "content-type: application/json" \
  -d @- << EOF
{
  "dataStore": {
    "name": "monitorfish_postgis",
    "connectionParameters": {
      "entry": [
        {"@key":"host","$":"X.X.X.X"},
        {"@key":"port","$":"5432"},
        {"@key":"database","$":"cnsp"},
        {"@key":"schema","$":"prod"},
        {"@key":"user","$":"geoserver"},
        {"@key":"passwd","$":"PASSWORD"},
        {"@key":"dbtype","$":"postgis"}
      ]
    }
  }
}
EOF
```

### Create the Regulations Layers

Create the read-only regulations layer:

```bash
curl -v -u admin:PASSWORD -X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes \
  -H "accept: text/html" \
  -H "content-type: application/json" \
  -d @- << EOF
{
  "featureType": {
    "name": "regulations",
    "nativeName": "regulations_view",
    "title": "Regulatory Areas",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true
  }
}
EOF
```

Create the writable regulations layer:

```bash
curl -v -u admin:PASSWORD-X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes \
  -H "accept: text/html" \
  -H "content-type: application/json" \
  -d @- << EOF
{
  "featureType": {
    "name": "regulations_write",
    "nativeName": "regulations",
    "title": "Regulatory Areas for write operation",
    "nativeCRS": "EPSG:4326",
    "srs": "EPSG:4326",
    "enabled": true
  }
}
EOF
```

### Activate WFS-T

1. In "Web Feature Service" configuration, under "Niveau de service", check "Transactionnel"
2. In the layer "monitorfish:regulations_write", under "Security" tab, check "Donner l'accès à n'importe quel rôle" to allow write operations.

## Test the Setup

Test the connection to the database:

```bash
psql -d cnsp -U postgres
```
