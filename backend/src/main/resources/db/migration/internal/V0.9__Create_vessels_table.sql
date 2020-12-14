CREATE SEQUENCE IF NOT EXISTS vessel_id_seq START 1;

create table vessels (
  id integer NOT NULL DEFAULT nextval('vessel_id_seq'),
  internal_reference_number varchar(100),
  external_reference_number varchar(100),
  imo varchar(100),
  mmsi varchar(100),
  ircs varchar(100),
  vessel_name varchar(100),
  flag_state varchar(100),
  width double precision,
  length double precision,
  district varchar(200),
  district_code varchar(2),
  gauge double precision,
  registry_port varchar(200),
  power double precision,
  vessel_type varchar(200),
  sailing_category varchar(200),
  sailing_type varchar(200),
  declared_fishing_gears varchar(100)[],
  weight_authorized_on_deck double precision,
  pinger boolean,
  navigation_licence_expiration_date timestamp,
  shipowner_name varchar(200),
  shipowner_phones varchar(100)[],
  shipowner_emails varchar(100)[],
  fisher_name varchar(200),
  fisher_phones varchar(100)[],
  fisher_emails varchar(100)[]
);
CREATE INDEX ON vessels (internal_reference_number);
