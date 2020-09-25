CREATE SEQUENCE IF NOT EXISTS hibernate_sequence START 1;

create table POSITIONS (
  ID serial not null,
  IMEI varchar(100) not null,
  LATITUDE double precision not null,
  LONGITUDE double precision not null,
  SPEED double precision not null,
  DIRECTION double precision not null,
  POSITION_DATE timestamp,
  RECEIVED_DATE timestamp
);
