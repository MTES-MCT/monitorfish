create table pending_alerts (
    vessel_name character varying(100),
    internal_reference_number varchar(255),
    external_reference_number varchar(255),
    ircs varchar(255),
    creation_date timestamp with time zone not null,
    trip_number integer,
    value jsonb not null
);