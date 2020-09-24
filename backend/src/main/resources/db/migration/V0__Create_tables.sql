CREATE SEQUENCE IF NOT EXISTS hibernate_sequence START 1;

create table POSITIONS (
  ID serial not null,
  IMEI varchar(100) not null,
  LATITUDE real not null,
  LONGITUDE real not null,
  SPEED real not null,
  DIRECTION real not null,
  POSITION_DATE timestamp,
  RECEIVED_DATE timestamp
);
