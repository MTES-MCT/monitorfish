CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table alerts
(
    alert_id                  uuid primary key,
    name                      varchar(255)             not null,
    internal_reference_number varchar(255),
    external_reference_number varchar(255),
    ircs                      varchar(255),
    creation_date             timestamp with time zone not null,
    trip_number               integer,
    value                     jsonb                    not null
);
