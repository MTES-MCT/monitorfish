create table silenced_alerts
(
    id                        SERIAL PRIMARY KEY,
    vessel_name               character varying(100),
    internal_reference_number varchar(255),
    external_reference_number varchar(255),
    ircs                      varchar(255),
    vessel_identifier         vessel_identifier        not null,
    silenced_before_date      timestamp with time zone not null,
    silenced_after_date       timestamp with time zone,
    value                     jsonb                    not null
);
