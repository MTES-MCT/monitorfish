CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.manual_prior_notifications (
    -- Common columns with `logbook_reports`

    report_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    cfr VARCHAR(12),
    vessel_name VARCHAR(100),
    flag_state VARCHAR(3),
    value JSONB,
    trip_gears JSONB,
    trip_segments JSONB,

    -- Columns specific to `manual_prior_notifications`

    author_trigram VARCHAR(3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    did_not_fish_after_zero_notice BOOLEAN,
    note TEXT,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
