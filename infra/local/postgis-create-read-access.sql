-- Create a group
CREATE ROLE readaccess;

-- Grant access to existing tables
GRANT USAGE ON SCHEMA prod TO readaccess;
GRANT SELECT ON ALL TABLES IN SCHEMA prod TO readaccess;

-- Grant access to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA prod GRANT SELECT ON TABLES TO readaccess;

-- Create a final user with password
CREATE USER operateur WITH PASSWORD "######";
GRANT readaccess TO operateur;

-- Grant write access to table ajout_point to operateur so they can add specific points on the map.
GRANT ALL ON TABLE travail.ajout_point TO operateur