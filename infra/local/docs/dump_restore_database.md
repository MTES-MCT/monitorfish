# Database Operations Guide

This guide covers database dump, restore, user creation, and regulatory data management.

## Export a Database Dump

1. Export the database:
   ```bash
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

2. Fetch the dump with `scp`:
   ```bash
   scp root@<IP>:/<FOLDER> .
   ```

## Restore a Database

```bash
PGCLIENTENCODING=UTF-8 psql \
  --host localhost \
  --port 5432 \
  --username postgres \
  --dbname cnsp \
  --file cnsp_backup.sql
```

## Create Database Users

### User: geoserver

Create the user:

```bash
sudo -u postgres psql -c "CREATE USER geoserver WITH PASSWORD 'PASSWORD';"
```

Grant permissions (run in psql):

```sql
-- Grant connect and schema usage
GRANT CONNECT ON DATABASE cnsp TO geoserver;
GRANT USAGE ON SCHEMA prod TO geoserver;

-- Grant read-write on all existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA prod TO geoserver;

-- Grant sequence usage (needed for inserts with serial/auto-increment columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA prod TO geoserver;

-- Apply to future tables automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA prod GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO geoserver;
ALTER DEFAULT PRIVILEGES IN SCHEMA prod GRANT USAGE, SELECT ON SEQUENCES TO geoserver;
```

Add the user to pg_hba.conf for remote connections:

```bash
echo "host    cnsp    geoserver    0.0.0.0/0    md5" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
sudo systemctl reload postgresql
```

### User: geomatique

Create the user:

```bash
sudo -u postgres psql -c "CREATE USER geomatique WITH PASSWORD 'PASSWORD';"
```

Grant permissions (run in psql):

```sql
-- Grant connect and schema usage
GRANT CONNECT ON DATABASE cnsp TO geomatique;
GRANT USAGE ON SCHEMA prod TO geomatique;
GRANT USAGE ON SCHEMA travail TO geomatique;

-- Grant read-write on all existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA prod TO geomatique;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA travail TO geomatique;

-- Grant sequence usage (needed for inserts with serial/auto-increment columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA prod TO geomatique;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA travail TO geomatique;

-- Apply to future tables automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA prod GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO geomatique;
ALTER DEFAULT PRIVILEGES IN SCHEMA prod GRANT USAGE, SELECT ON SEQUENCES TO geomatique;
ALTER DEFAULT PRIVILEGES IN SCHEMA travail GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO geomatique;
ALTER DEFAULT PRIVILEGES IN SCHEMA travail GRANT USAGE, SELECT ON SEQUENCES TO geomatique;
```

Add the user to pg_hba.conf for remote connections:

```bash
echo "host    cnsp    geomatique    0.0.0.0/0    md5" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
sudo systemctl reload postgresql
```

### User: monitorfish

Create the user and grant read-only access:

```bash
# Create user
sudo -u postgres psql -c "CREATE USER monitorfish WITH PASSWORD 'yourpassword';"

# Grant read-only access on cnsp database, schema prod
sudo -u postgres psql -d cnsp -c "
GRANT CONNECT ON DATABASE cnsp TO monitorfish;
GRANT USAGE ON SCHEMA prod TO monitorfish;
GRANT SELECT ON ALL TABLES IN SCHEMA prod TO monitorfish;
ALTER DEFAULT PRIVILEGES IN SCHEMA prod GRANT SELECT ON TABLES TO monitorfish;
"
```

Add the user to pg_hba.conf for remote connections:

```bash
echo "host    cnsp    monitorfish    0.0.0.0/0    md5" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
sudo systemctl reload postgresql
```

## Reset/Create Test Regulatory Entries

Reset a regulation from the local PostGIS regulation referential:

```sql
INSERT INTO prod.regulations (id, topic, zone, region, law_type)
VALUES (11053, 'Un topic de test', 'Zone de test', 'Bretagne', 'Reg. NAMO');
```

Create a test regulatory entry by copying geometry from an existing entry:

```sql
INSERT INTO prod.regulations (geometry)
SELECT geometry FROM prod.regulations WHERE id = 654;
```
