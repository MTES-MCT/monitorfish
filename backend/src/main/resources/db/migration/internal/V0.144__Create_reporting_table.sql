ALTER TABLE alerts RENAME TO pno_lan_alerts;
ALTER TABLE public.last_positions
    ADD COLUMN reporting VARCHAR(200)[];

CREATE TYPE public.reporting_type AS ENUM ('ALERT', 'OBSERVATION', 'INFRACTION_SUSPICION');

create table reporting (
    id SERIAL PRIMARY KEY,
    type reporting_type,
    vessel_name character varying(100),
    internal_reference_number varchar(255),
    external_reference_number varchar(255),
    ircs varchar(255),
    vessel_identifier vessel_identifier not null,
    creation_date timestamp with time zone not null,
    validation_date timestamp with time zone,
    value jsonb not null,
    archived boolean not null,
    deleted boolean not null
);
