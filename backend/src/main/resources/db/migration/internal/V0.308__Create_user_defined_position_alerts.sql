CREATE TABLE public.user_defined_position_alerts (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    is_activated BOOLEAN NOT NULL DEFAULT true,
    is_in_error BOOLEAN NOT NULL DEFAULT false,
    error_reason TEXT,
    -- the alert is valid at all times if both start and end validity dates are NULL
    validity_start_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    validity_end_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    repeat_each_year BOOLEAN NOT NULL DEFAULT false,
    gears JSONB,
    species JSONB,
    administrative_areas JSONB,
    regulatory_areas JSONB,
    flag_states_iso2 VARCHAR[],
    vessel_ids INTEGER[],
    district_codes VARCHAR[],
    producer_organizations VARCHAR[],
    CONSTRAINT is_deactivated_if_in_error CHECK (is_in_error + is_activated < 2),
    CONSTRAINT has_start_and_end_date_if_repeat_each_year CHECK (
        NOT (
            repeat_each_year AND (
                validity_start_date IS NULL OR
                validity_end_date IS NULL OR
                validity_start_date > validity_end_date            
            )
        ),
    )
)