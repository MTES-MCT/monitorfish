CREATE TABLE public.position_alerts (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    is_user_defined BOOLEAN NOT NULL DEFAULT true,
    natinf_code INTEGER NOT NULL,
    is_activated BOOLEAN NOT NULL DEFAULT true,
    is_in_error BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT NOT NULL,
    created_at_utc TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    error_reason TEXT,
    -- the alert is valid at all times if both start and end validity dates are NULL
    validity_start_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    validity_end_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    repeat_each_year BOOLEAN NOT NULL DEFAULT false,
    track_analysis_depth DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    only_fishing_positions BOOLEAN NOT NULL DEFAULT true,
    gears JSONB,
    species JSONB,
    species_catch_areas VARCHAR[],
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
