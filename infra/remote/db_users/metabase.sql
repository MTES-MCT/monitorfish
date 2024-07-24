CREATE ROLE readaccess;
GRANT CONNECT ON DATABASE monitorfishdb TO readaccess;
GRANT USAGE ON SCHEMA public TO readaccess;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO readaccess;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readaccess;

CREATE USER metabase WITH PASSWORD '***';
GRANT readaccess TO metabase;

GRANT pg_read_all_stats TO metabase;