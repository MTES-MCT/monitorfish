CREATE SEQUENCE IF NOT EXISTS hibernate_sequence START 1;

create table positions (
  id serial not null,
  imei varchar(100) not null,
  latitude double precision not null,
  longitude double precision not null,
  speed double precision not null,
  direction double precision not null,
  position_date timestamp,
  received_date timestamp
);

SELECT create_hypertable('positions', 'position_date');