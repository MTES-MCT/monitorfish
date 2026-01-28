# Server Initialization Guide

This guide covers setting up the local server at CROSS, including Geoserver deployment and configuration.

## Prerequisites

### Install Required Tools

1. Install docker-compose:
   ```bash
   sudo apt install docker-compose
   ```

2. Add proxy aliases to `~/.bashrc`:
   ```bash
   alias unset_proxy='unset HTTPS_PROXY; unset HTTP_PROXY; unset https_proxy; unset http_proxy;'
   alias set_proxy='export http_proxy=http://100.78.40.201:8080; export https_proxy=http://100.78.40.201:8080; export HTTP_PROXY=http://100.78.40.201:8080; export HTTPS_PROXY=http://100.78.40.201:8080;'
   ```

## Manage PostgreSQL Connection Entries

1. Edit `/etc/postgresql/14/main/pg_hba.conf` to add the IP range. See `infra/local/pg_hba.conf` of this repo.
2. Execute the following in `psql` to reload the configuration:
   ```sql
   SELECT pg_reload_conf();
   ```
3. Test the connection to the database:
   ```bash
   psql -d cnsp -U postgres
   ```

## Run Geoserver

> The TLS termination will be done on the Apache server.
> See `cat /etc/hosts` for the public server URL (exposed by Apache).

### Clone and Start

1. Set the proxy:
   ```bash
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
   docker-compose up -d
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

### Configure iptables

Only allow ports 80, 443, and 5432:

```bash
sudo iptables -I DOCKER-USER -i ens160 -j DROP
sudo iptables -I DOCKER-USER -i ens160 -p tcp --dport 443 -j ACCEPT
sudo iptables -I DOCKER-USER -i ens160 -p tcp --dport 80 -j ACCEPT
sudo iptables -I DOCKER-USER 1 -p tcp --dport 5432 -j ACCEPT
```

Save the iptables rules:

```bash
sudo apt install iptables-persistent
netfilter-persistent save
```

## Docker Compose Configuration

The `docker-compose.yml` deploys Geoserver with the following configuration:

### Image
- **Image**: `kartoza/geoserver:2.18.0`

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

### Docker Connectivity

If you see an error while fetching the geoserver image: `Get "https://registry-1.docker.io/v2/": context deadline exceeded`

1. Create the docker service directory:
   ```bash
   sudo mkdir -p /etc/systemd/system/docker.service.d
   ```
2. Create the proxy configuration file:
   ```bash
   sudo vi /etc/systemd/system/docker.service.d/http-proxy.conf
   ```
3. Add the following content:
   ```ini
   [Service]
   Environment="HTTP_PROXY=http://proxy:port"
   Environment="HTTPS_PROXY=http://proxy:port"
   ```
4. Reload and restart docker:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart docker
   ```

## Configure Geoserver

### Create the Workspace

```bash
curl -u admin:geoserver -X POST http://0.0.0.0:8081/geoserver/rest/workspaces \
  -H "accept: text/html" \
  -H "content-type: application/json" \
  -d '{ "workspace": {"name": "monitorfish"}}'
```

### Configure the Datastore

```bash
DB_HOST=X.X.X.X \
DB_NAME=cnsp \
DB_SCHEMA=public \
DB_USER=postgres \
DB_PASSWORD=TO_MODIFY \
curl -v -u admin:geoserver -X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores \
  -H "accept: text/html" \
  -H "content-type: application/json" \
  -d @- << EOF
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

### Create the Regulations Layers

Create the read-only regulations layer:

```bash
curl -v -u admin:geoserver -X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes \
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
curl -v -u admin:geoserver -X POST http://0.0.0.0:8081/geoserver/rest/workspaces/monitorfish/datastores/monitorfish_postgis/featuretypes \
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

## Test the Setup

Test the connection to the database:

```bash
psql -d cnsp -U postgres
```
