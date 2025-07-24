CREATE TABLE public.position_alerts (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    natinf_code INTEGER NOT NULL,
    is_activated BOOLEAN NOT NULL DEFAULT true,
    is_in_error BOOLEAN NOT NULL DEFAULT false,
    error_reason TEXT,
    -- the alert is valid at all times if both start and end validity dates are NULL
    validity_start_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    validity_end_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    repeat_each_year BOOLEAN NOT NULL DEFAULT false,
    only_fishing_positions BOOLEAN NOT NULL DEFAULT true,
    gears JSONB,
    include_vessels_with_unknown_gear BOOLEAN NOT NULL DEFAULT false,
    species JSONB,
    administrative_areas JSONB,
    regulatory_areas JSONB,
    min_depth DOUBLE PRECISION,
    flag_states_iso2 VARCHAR[],
    vessel_ids INTEGER[],
    district_codes VARCHAR[],
    producer_organizations VARCHAR[],
    CONSTRAINT is_deactivated_if_in_error CHECK (NOT (is_in_error AND is_activated)),
    CONSTRAINT has_start_and_end_date_if_repeat_each_year CHECK (
        NOT (
            repeat_each_year AND (
                validity_start_datetime_utc IS NULL OR
                validity_end_datetime_utc IS NULL OR
                validity_start_datetime_utc > validity_end_datetime_utc            
            )
        )
    )
)