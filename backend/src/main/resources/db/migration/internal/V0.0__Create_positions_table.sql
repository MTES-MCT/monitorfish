CREATE SEQUENCE IF NOT EXISTS hibernate_sequence START 1;
CREATE SEQUENCE IF NOT EXISTS position_id_seq START 1;
SET standard_conforming_strings = OFF;

-- Enable PostGIS (as of 3.0 contains just geometry/geography)
CREATE EXTENSION postgis;

create table positions (
  id integer NOT NULL DEFAULT nextval('position_id_seq'),
  internal_reference_number varchar(100),
  external_reference_number varchar(100),
  mmsi varchar(100),
  ircs varchar(100),
  vessel_name varchar(100),
  flag_state varchar(100),
  from_country varchar(100),
  destination_country varchar(100),
  trip_number integer,
  latitude double precision not null,
  longitude double precision not null,
  speed double precision not null,
  course double precision not null,
  date_time timestamp,
  position_type varchar(100)
);

SELECT create_hypertable('positions', 'date_time');
