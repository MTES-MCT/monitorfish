CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.manual_prior_notifications (
    id BIGINT DEFAULT nextval('public.logbook_report_id_seq'::regclass) NOT NULL,
    -- operation_number VARCHAR(100),
    -- operation_country VARCHAR(3),
    operation_datetime_utc TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    -- operation_type VARCHAR(3),
    report_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    -- referenced_report_id VARCHAR(100),
    report_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    cfr VARCHAR(12),
    -- ircs VARCHAR(7),
    -- external_identification VARCHAR(14),
    vessel_name VARCHAR(100),
    flag_state VARCHAR(3),
    -- imo VARCHAR(20),
    -- log_type VARCHAR(100),
    value JSONB,
    integration_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    -- trip_number VARCHAR(100),
    -- analyzed_by_rules VARCHAR(100)[],
    -- trip_number_was_computed BOOLEAN DEFAULT FALSE,
    -- transmission_format public.logbook_message_transmission_format NOT NULL,
    -- software VARCHAR(100),
    -- enriched BOOLEAN DEFAULT FALSE NOT NULL,
    trip_gears JSONB,
    trip_segments JSONB,
    is_manually_created BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.logbook_reports
    ADD COLUMN is_manually_created BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();

UPDATE public.logbook_reports
SET
    created_at = operation_datetime_utc,
    updated_at = operation_datetime_utc
WHERE operation_datetime_utc IS NOT NULL;
