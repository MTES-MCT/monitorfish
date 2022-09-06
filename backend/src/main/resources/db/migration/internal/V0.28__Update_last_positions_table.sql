ALTER TABLE public.last_positions
    DROP COLUMN from_country,
    DROP COLUMN destination_country,
    DROP COLUMN position_type,
    ADD COLUMN emission_period        INTERVAL,
    ADD COLUMN last_ers_datetime_utc  TIMESTAMP,
    ADD COLUMN departure_datetime_utc TIMESTAMP,
    ADD COLUMN width                  DOUBLE PRECISION,
    ADD COLUMN length                 DOUBLE PRECISION,
    ADD COLUMN registry_port          VARCHAR(200),
    ADD COLUMN district               VARCHAR(200),
    ADD COLUMN district_code          VARCHAR(2),
    ADD COLUMN gear_onboard           JSONB,
    ADD COLUMN segments               VARCHAR(50)[],
    ADD COLUMN species_onboard        JSONB,
    ADD COLUMN total_weight_onboard   DOUBLE PRECISION;

ALTER TABLE public.last_positions
    DROP CONSTRAINT last_positions_internal_reference_number_external_reference_key;

ALTER TABLE public.last_positions
    RENAME COLUMN internal_reference_number TO cfr;

ALTER TABLE public.last_positions
    RENAME COLUMN external_reference_number TO external_immatriculation;

ALTER TABLE public.last_positions
    RENAME COLUMN date_time TO last_position_datetime_utc;
